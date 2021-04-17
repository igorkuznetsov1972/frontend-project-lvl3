/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import 'bootstrap';
import differenceBy from 'lodash/differenceBy.js';
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
      postId: '',
    },
    feedUrls: [],
    readPosts: new Set(),
    feeds: [],
    posts: [],
    errors: '',
  };

  const timeout = 5000;
  const watchedState = watcher(state);

  setYupLocale();

  const composeRssUrl = (feedUrl) => {
    const url = `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${feedUrl}`;
    // url.searchParams.set('disableCache', 'true');
    // url.searchParams.set('url', `${feedUrl}`);
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
        setTimeout(updateFeed, timeout, parsedFeed);
        watchedState.loading.processState = 'idle';
      })
      .catch((err) => {
        console.log(err);
        if (err.message) watchedState.errors = err.message;
        if (err.errors) watchedState.errors = err.errors.toString();
        watchedState.loading.processState = 'error';
      });
  });

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    watchedState.modal.postId = postId;
    watchedState.readPosts.add(postId);
  });
};
