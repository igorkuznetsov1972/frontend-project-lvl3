/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import * as $ from 'jquery';
import 'bootstrap';
import * as _ from 'lodash';
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

  const checkForNewPosts = (xml) => {
    const { parsedItems } = parseFeed(xml);
    return _.difference(parsedItems, watchedState.posts);
  };

  const updateFeed = (feed) => axios.get(composeRssUrl(feed.feedUrl))
    .then((response) => checkForNewPosts(response))
    .then((difference) => watchedState.posts.unshift(...difference))
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
      .then((url) => axios.get(composeRssUrl(url)))
      .then((response) => parseFeed(response))
      .then(({ parsedFeed, parsedItems }) => {
        parsedFeed.feedUrl = feedUrl;
        watchedState.feedUrls.push(feedUrl);
        watchedState.feeds.push(parsedFeed);
        watchedState.posts.unshift(...parsedItems);
        watchedState.form.processState = 'success';
        updateFeed(parsedFeed);
      })
      .catch((err) => {
        if (err.message) watchedState.errors = err.message;
        if (err.errors) watchedState.errors = err.errors.toString();
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
