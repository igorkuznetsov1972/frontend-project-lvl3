/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import * as $ from 'jquery';
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import setYupLocale from './assets/locales/yupLocale';
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
    },
    feedUrls: [],
    feeds: [],
    posts: [],
    errors: '',
  };

  const watchedState = watcher(state);

  setYupLocale();

  const parseFeed = (xml) => {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    const parsedFeed = { feedState: 'new' };
    const parsedItems = [];
    if (!feed.querySelector('rss') || feed.querySelector('parsererror ')) {
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

  const composeRssUrl = (feedUrl) => {
    const url = new URL('https://hexlet-allorigins.herokuapp.com/get');
    url.searchParams.set('disableCache', 'true');
    url.searchParams.set('url', `${feedUrl}`);
    return url;
  };

  const checkForNewPosts = (xml, feedId) => {
    const { parsedItems } = parseFeed(xml);
    parsedItems.reverse().forEach((item) => {
      item.feedId = feedId;
      if (!watchedState.posts
        .filter((el) => el.feedId === feedId)
        .some((el) => el.postUrl === item.postUrl)) {
        watchedState.posts.unshift(item);
      }
    });
  };

  const updateFeed = (feed) => {
    axios.get(composeRssUrl(feed.feedUrl))
      .then((response) => checkForNewPosts(response, feed.feedId))
      .then(setTimeout(updateFeed, 5000, feed))
      .catch((err) => console.log(err));
  };

  const updateAllFeeds = () => {
    watchedState.feeds.forEach((feed) => {
      if (feed.feedState === 'new') {
        feed.feedState = 'updating';
        updateFeed(feed);
      }
    });
    setTimeout(updateAllFeeds, 5000);
  };

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    const schema = yup.string().url().notOneOf(watchedState.feedUrls);
    schema.validate(feedUrl, { abortEarly: true })
      .then((url) => axios.get(composeRssUrl(url))
        .then((response) => parseFeed(response))
        .then(({ parsedFeed, parsedItems }) => {
          parsedFeed.feedUrl = feedUrl;
          watchedState.feedUrls.push(feedUrl);
          watchedState.feeds.push(parsedFeed);
          watchedState.posts.unshift(...parsedItems);
        })
        .catch((err) => watchedState.errors = err.message))
      .catch((err) => watchedState.errors = err.errors.toString());
  });

  $('#modal').on('show.bs.modal', function findModal(event) {
    const button = $(event.relatedTarget);
    const postText = $(button.prev('a'));
    postText.removeClass('font-weight-bold');
    postText.addClass('font-weight-normal');
    const postId = $(button).data('id').toString();
    const post = watchedState.posts.find((element) => element.postId === postId);
    post.postRead = true;
    const modal = $(this);
    modal.find('.modal-title').text(post.postTitle);
    modal.find('.modal-body').text(post.postDescription);
    modal.find('a.full-article').attr('href', post.postUrl);
  });

  updateAllFeeds();
};
