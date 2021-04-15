/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import * as $ from 'jquery';
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import setYupLocale from './assets/locales/yupLocale';
// import i18next from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
import watcher from './watcher';
import parseFeed from './parser';
// import resources from './assets/locales';

export default () => {
  const state = {
    form: {
      processState: 'idle',
      processError: null,
      valid: true,
    },
    modal: {
      processState: 'hidden',
      postId: '',
    },
    feedUrls: [],
    readPosts: [],
    feeds: [],
    posts: [],
    errors: '',
  };

  const timeout = 5000;
  const watchedState = watcher(state);

  setYupLocale();

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

  const updateFeed = (feed) => axios.get(composeRssUrl(feed.feedUrl))
    .then((response) => checkForNewPosts(response, feed.feedId))
    .then(setTimeout(updateFeed, timeout, feed))
    .catch((err) => console.log(err));

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    watchedState.form.processState = 'working';
    const schema = yup.string().url().notOneOf(watchedState.feedUrls);
    schema.validate(feedUrl, { abortEarly: true })
      .then((url) => axios.get(composeRssUrl(url))
        .then((response) => parseFeed(response))
        .then(({ parsedFeed, parsedItems }) => {
          parsedFeed.feedUrl = feedUrl;
          updateFeed(parsedFeed);
          watchedState.feeds.push(parsedFeed);
          watchedState.posts.unshift(...parsedItems);
          watchedState.form.processState = 'success';
        })
        .catch((err) => {
          watchedState.form.processError = err.message;
          watchedState.form.valid = false;
          watchedState.form.processState = 'idle';
        }))
      .catch((err) => {
        watchedState.errors = err.errors.toString();
        watchedState.form.processState = 'idle';
      });
  });

  $('#modal').on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const postId = $(button).data('id').toString();
    watchedState.modal.postId = postId;
    watchedState.readPosts.push(postId);
  });
};
