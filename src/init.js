/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import 'bootstrap';
import differenceBy from 'lodash/differenceBy.js';
import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import resources from './assets/locales';
import setYupLocale from './assets/locales/yupLocale';
import watcher from './watcher';
import parseFeed from './parser';

export default () => {
  const state = {
    loading: {
      processState: 'idle',
    },
    modal: {
      postId: null,
    },
    feedUrls: [],
    readPosts: new Set(),
    feeds: [],
    posts: [],
    errorMessage: null,
  };

  const timeout = 5000;

  const composeRssUrl = (feedUrl) => {
    const url = new URL('https://hexlet-allorigins.herokuapp.com/get');
    url.searchParams.set('disableCache', 'true');
    url.searchParams.set('url', `${feedUrl}`);
    return url.toString();
  };

  const checkForNewPosts = (xml, watchedState) => {
    const { parsedItems } = parseFeed(xml);
    return differenceBy(parsedItems, watchedState.posts, 'postUrl');
  };

  const updateFeed = (feed, watchedState) => {
    axios.get(composeRssUrl(feed.feedUrl))
      .then((response) => checkForNewPosts(response, watchedState))
      .then((diff) => watchedState.posts.unshift(...diff))
      .then(setTimeout(updateFeed, timeout, feed, watchedState))
      .catch((err) => watchedState.errors = err.message);
  };

  const urlEventListener = (e, watchedState) => {
    e.preventDefault();
    setYupLocale();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    watchedState.loading.processState = 'loading';
    const schema = yup.string().required().url().notOneOf(watchedState.feedUrls);
    return schema.validate(feedUrl, { abortEarly: true })
      .then((url) => axios.get(composeRssUrl(url)))
      .then((response) => parseFeed(response))
      .then(({ parsedFeed, parsedItems }) => {
        parsedFeed.link = feedUrl;
        watchedState.feedUrls.push(feedUrl);
        watchedState.feeds.push(parsedFeed);
        parsedItems.forEach((item) => item.id = uniqueId());
        watchedState.posts.unshift(...parsedItems);
        watchedState.loading.processState = 'success';
        watchedState.loading.processState = 'idle';
        setTimeout(updateFeed, timeout, parsedFeed, watchedState);
      })
      .catch((err) => {
        watchedState.errorMessage = err.message;
        watchedState.loading.processState = 'error';
      });
  };
  const i18n = i18next.createInstance();
  return i18n
    .init({
      debug: true,
      lng: 'ru-RU',
      detection: { order: ['navigator'] },
      resources,
    })

    .then((translate) => watcher(state, translate))
    .then((watchedState) => {
      const form = document.querySelector('.rss-form');
      const postsContainer = document.querySelector('.posts');

      form.addEventListener('submit', (e) => urlEventListener(e, watchedState));

      postsContainer.addEventListener('click', (e) => {
        const postId = e.target.dataset.id;
        watchedState.readPosts.add(postId);
        watchedState.modal.postId = postId;
      });
    });
};
