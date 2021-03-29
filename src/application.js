/* eslint-disable no-param-reassign */
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import watcher from './watcher';

const schema = yup.object().shape({
  url: yup.string().url(),
});

const validate = (field, watchedState) => {
  try {
    schema.validateSync(field);
    if (!_.some(watchedState.feeds, { url: field })) return '';
    return 'RSS уже существует';
  } catch (e) {
    return e.errors;
  }
};

const updateValidationState = (watchedState) => {
  const errors = validate(watchedState.form.url);
  watchedState.form.valid = _.isEqual(errors, '');
  watchedState.form.errors = errors;
};

const state = {
  form: {
    processState: 'filling',
    processError: null,
    fields: {
      url: '',
    },
    valid: true,
    errors: {},
  },
  feeds: new Map(),
  posts: new Map(),
};
export default () => {
  const watchedState = watcher(state);
  const parseFeed = (xml, feedUrl) => {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    const feedTitle = feed.querySelector('title').textContent;
    const feedDescription = feed.querySelector('description').textContent;
    const feedLastBuildDate = new Date(feed.querySelector('lastBuildDate').textContent);
    const feedId = _.uniqueId();
    watchedState.feeds.set(feedUrl, {
      feedId, feedTitle, feedDescription, feedLastBuildDate,
    });
    feed.querySelectorAll('item').forEach((item) => {
      const postId = _.uniqueId('post_');
      const postTitle = item.querySelector('title');
      const postDescription = item.querySelector('description');
      const postPubDate = item.querySelector('pubDate');
      const postLink = item.querySelector('link');
      watchedState.posts.set(postId, {
        feedId, postTitle, postDescription, postPubDate, postLink,
      });
    });
  };
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    form.reset();
    axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feedUrl)}`)
      .then((response) => parseFeed(response, feedUrl))
      .catch((err) => console.log(err));
  });
};
