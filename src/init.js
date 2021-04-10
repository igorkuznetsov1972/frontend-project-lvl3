/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
// import i18next from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
import watcher from './watcher';
// import resources from './assets/locales';

export default () => {
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      fields: {
        url: '',
      },
      valid: true,
      errors: '',
    },
    feedUrls: [],
    feeds: [],
    posts: [],
    errors: '',
  };

  const watchedState = watcher(state);

  yup.setLocale({
    mixed: {
      notOneOf: 'errRSSadded',
    },
    string: {
      url: 'errURL',
    },
  });

  const parseFeed = (xml) => {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    const parsedFeed = { feedState: 'new' };
    const parsedItems = [];
    if (!feed.querySelector('rss')) {
      throw new Error('errRSS');
    } else {
      parsedFeed.feedTitle = feed.querySelector('title').textContent;
      parsedFeed.feedDescription = feed.querySelector('description').textContent;
      parsedFeed.feedId = _.uniqueId();
      Array.from(feed.querySelectorAll('item')).reverse().forEach((item) => {
        const post = { postRead: false, feedId: parsedFeed.feedId };
        post.postId = _.uniqueId();
        post.postGuid = feed.querySelector('guid').textContent;
        post.postTitle = item.querySelector('title').textContent;
        post.postDescription = item.querySelector('description').textContent;
        post.postPubDate = item.querySelector('pubDate').textContent;
        post.postUrl = item.querySelector('link').textContent;
        parsedItems.unshift(post);
      });
    }
    return { parsedFeed, parsedItems };
  };

  function checkForNewPosts(xml, feedId) {
    const { parsedItems } = parseFeed(xml);
    parsedItems.reverse().forEach((item) => {
      if (!watchedState.posts
        .filter((el) => el.feedId === feedId)
        .some((el) => el.postUrl === item.postUrl)) {
        watchedState.posts.unshift(item);
      }
    });
  }

  function updateFeed(feed) {
    axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${feed.feedUrl}`)
      .then((response) => checkForNewPosts(response, feed.feedId))
      .catch((err) => console.log(err));
    setTimeout(updateFeed, 5000, feed);
  }

  function updateAllFeeds() {
    watchedState.feeds.forEach((feed) => {
      if (feed.feedState === 'new') {
        feed.feedState = 'updating';
        updateFeed(feed);
      }
    });
    setTimeout(updateAllFeeds, 5000);
  }

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    const schema = yup.string().url().notOneOf(watchedState.feedUrls);
    schema.validate(feedUrl, { abortEarly: true })
      .then((value) => axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${value}`)
        .then((response) => parseFeed(response))
        .then(({ parsedFeed, parsedItems }) => {
          parsedFeed.feedUrl = feedUrl;
          watchedState.feedUrls.push(feedUrl);
          watchedState.feeds.push(parsedFeed);
          watchedState.posts.unshift(...parsedItems);
        })
        .catch((err) => watchedState.errors = err.message))
      .catch((err) => watchedState.form.errors = err.errors.toString());
  });
  updateAllFeeds();
};
