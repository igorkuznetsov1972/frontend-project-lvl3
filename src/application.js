/* eslint-disable no-param-reassign */
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import watcher from './watcher';

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
  feeds: new Map(),
  posts: new Map(),
  errors: '',
};

const watchedState = watcher(state);

const schema = yup.string().url();

const validate = (url) => {
  if (!schema.isValidSync(url)) {
    watchedState.form.errors = 'Ссылка должна быть валидным URL';
    return false;
  }
  if (watchedState.feeds.has(url)) {
    watchedState.form.errors = 'RSS уже существует';
    return false;
  }
  return true;
};

export default () => {
  const parseFeed = (xml, feedUrl) => {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    if (!feed.querySelector('rss')) watchedState.errors = 'Ресурс не содержит валидный RSS';
    console.log(feed);
    const feedTitle = feed.querySelector('title') ? feed.querySelector('title').textContent : '';
    const feedDescription = feed.querySelector('description') ? feed.querySelector('description').textContent : '';
    const feedLastBuildDate = feed.querySelector('lastBuildDate') ? new Date(feed.querySelector('lastBuildDate').textContent) : '';
    const feedId = _.uniqueId();
    watchedState.feeds.set(feedUrl, {
      feedId, feedTitle, feedDescription, feedLastBuildDate,
    });
    feed.querySelectorAll('item').forEach((item) => {
      const postId = _.uniqueId('post_');
      const postTitle = item.querySelector('title') ? item.querySelector('title').textContent : '';
      const postDescription = item.querySelector('description') ? item.querySelector('description').textContent : '';
      const postPubDate = item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent) : '';
      const postUrl = item.querySelector('link') ? item.querySelector('link').textContent : '';
      watchedState.posts.set(postId, {
        feedId, postTitle, postDescription, postPubDate, postUrl,
      });
    });
  };
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    if (validate(feedUrl)) {
      axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${feedUrl}`)
        .then((response) => parseFeed(response, feedUrl))
        .catch((err) => {
          console.log(err);
          watchedState.errors = 'Ошибка сети';
        });
    }
  });
};
