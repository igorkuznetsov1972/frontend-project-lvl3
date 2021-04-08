/* eslint-disable no-param-reassign */
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import watcher from './watcher';
import resources from './assets/locales';

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
  feeds: [],
  posts: [],
  errors: '',
};

const watchedState = watcher(state);

const schema = yup.string().url();

export default () => {
  const i18n = i18next.createInstance();
  const validate = (url) => {
    if (!schema.isValidSync(url)) {
      watchedState.form.errors = i18n.t('errURL');
      return false;
    }
    if (watchedState.feeds?.some((feed) => feed.feedUrl === url)) {
      watchedState.form.errors = i18n.t('errRSSadded');
      return false;
    }
    return true;
  };
  const parseFeed = (xml, feedUrl) => {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    if (!feed.querySelector('rss')) {
      watchedState.errors = i18n.t('errRSS');
    } else {
      const feedTitle = feed.querySelector('title') ? feed.querySelector('title').textContent : '';
      const feedDescription = feed.querySelector('description') ? feed.querySelector('description').textContent : '';
      const feedLastBuildDate = feed.querySelector('lastBuildDate') ? new Date(feed.querySelector('lastBuildDate').textContent) : '';
      const feedId = _.uniqueId();
      watchedState.feeds.push({
        feedState: 'new', feedUrl, feedId, feedTitle, feedDescription, feedLastBuildDate,
      });
      Array.from(feed.querySelectorAll('item')).reverse().forEach((item) => {
        const postId = _.uniqueId('post_');
        const postGuid = feed.querySelector('guid') ? item.querySelector('guid').textContent : '';
        const postTitle = item.querySelector('title') ? item.querySelector('title').textContent : '';
        const postDescription = item.querySelector('description') ? item.querySelector('description').textContent : '';
        const postPubDate = item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent) : '';
        const postUrl = item.querySelector('link') ? item.querySelector('link').textContent : '';
        watchedState.posts.unshift({
          feedId, postGuid, postId, postTitle, postDescription, postPubDate, postUrl,
        });
      });
    }
  };
  function checkForNewPosts(xml, feedId) {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    Array.from(feed.querySelectorAll('item')).reverse().forEach((item) => {
      const postId = _.uniqueId('post_');
      const postGuid = feed.querySelector('guid') ? item.querySelector('guid').textContent : '';
      const postTitle = item.querySelector('title') ? item.querySelector('title').textContent : '';
      const postDescription = item.querySelector('description') ? item.querySelector('description').textContent : '';
      const postPubDate = item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent) : '';
      const postUrl = item.querySelector('link') ? item.querySelector('link').textContent : '';
      if (postGuid !== '') {
        if (!watchedState.posts.filter((post) => post.feedId === feedId).some((post) => post.postGuid === postGuid)) {
          watchedState.posts.unshift({
            feedId, postGuid, postId, postTitle, postDescription, postPubDate, postUrl,
          });
        }
      } else {
        if (!watchedState.posts.filter((post) => post.feedId === feedId).some((post) => post.postUrl === postUrl)) {
          watchedState.posts.unshift({
            feedId, postGuid, postId, postTitle, postDescription, postPubDate, postUrl,
          });
        }
      }
    })
  };
  function updateFeed(feed) {
 //   console.log('updating feed');
    axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${feed.feedUrl}`)
      .then((response) => checkForNewPosts(response, feed.feedId))
      .catch((err) => console.log(err));
    setTimeout(updateFeed, 5000, feed)
  };
  function updateAllFeeds() {
  //  console.log('updating all feeds');
    watchedState.feeds.forEach((feed) => {
      if (feed.feedState === 'new') {
        feed.feedState = 'updating';
        updateFeed(feed);
      }
    });
    setTimeout(updateAllFeeds, 5000);
  }
  const form = document.querySelector('.rss-form');
  i18n
    .use(LanguageDetector)
    .init({
      debug: true,
      detection: { order: ['navigator'] },
      resources,
    })
    .then(form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const feedUrl = formData.get('url');
      if (validate(feedUrl)) {
        axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${feedUrl}`)
          .then((response) => parseFeed(response, feedUrl))
          .catch((err) => {
            console.log(err);
            watchedState.errors = i18n.t('netErr');
          });
      }
    }));
  updateAllFeeds();
};
