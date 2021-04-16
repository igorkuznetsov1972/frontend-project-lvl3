/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import * as $ from 'jquery';
import 'bootstrap';
import { differenceBy } from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import setYupLocale from './assets/locales/yupLocale';
import watcher from './watcher';
import parseFeed from './parser';

export default () => {
  const state = {
    loading: {
      processState: 'idle',
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
    return differenceBy(parsedItems, watchedState.posts, 'postUrl');
  };

  const updateFeed = (feed) => axios.get(composeRssUrl(feed.feedUrl))
    .then((response) => checkForNewPosts(response))
    .then((diff) => watchedState.posts.unshift(...diff))
    .then(setTimeout(updateFeed, timeout, feed))
    .catch((err) => console.log(err));

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    watchedState.loading.processState = 'loading';
    const schema = yup.string().url().notOneOf(watchedState.feedUrls);
    schema.validate(feedUrl, { abortEarly: true })
      .then((url) => axios.get(composeRssUrl(url)))
      .then((response) => parseFeed(response))
      .then(({ parsedFeed, parsedItems }) => {
        parsedFeed.feedUrl = feedUrl;
        watchedState.feedUrls.push(feedUrl);
        watchedState.feeds.push(parsedFeed);
        watchedState.posts.unshift(...parsedItems);
        watchedState.loading.processState = 'success';
        updateFeed(parsedFeed);
        watchedState.loading.processState = 'idle';
      })
      .catch((err) => {
        if (err.message) watchedState.errors = err.message;
        if (err.errors) watchedState.errors = err.errors.toString();
        watchedState.loading.processState = 'idle';
      });
  });

  $('#modal').on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const postId = $(button).data('id').toString();
    watchedState.modal.postId = postId;
    watchedState.readPosts.push(postId);
  });

  /* $('div.posts').on('click', (event) => {
    const button = $(event.relatedTarget.closest('button'));
    const postId = $(button).data('id').toString();
    watchedState.modal.postId = postId;
    watchedState.readPosts.push(postId);
  }); */
};
