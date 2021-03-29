/* eslint-disable no-param-reassign */
import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';

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
  const watchedState = onChange(state, (path, value) => {
    console.log(watchedState.posts);
    const feedsContainer = document.querySelector('.feeds');
    const postsContainer = document.querySelector('.posts');
    const feedsHeader = document.createElement('h2');
    feedsHeader.textContent = 'Фиды';
    feedsContainer.appendChild(feedsHeader);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'mb-5');
    feedsContainer.appendChild(feedsList);
    watchedState.feeds.forEach((key, value, map) => {
      const feedElement = document.createElement('li');
      feedElement.classList.add('list-group-item');
      const feedTitle = document.createElement('h3');
      feedTitle.textContent = value.feedTitle;
      feedElement.appendChild(feedTitle);
      const feedDescription = document.createElement('p');
      feedDescription.textContent = value.feedDescription;
      feedElement.appendChild(feedDescription);
    });
    const postsHeader = document.createElement('h2');
    postsHeader.textContent = 'Посты';
    postsContainer.appendChild(postsHeader);
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group');
    postsContainer.appendChild(postsList);
    watchedState.posts.forEach((key, value, map) => {
      const postElement = document.createElement('li');
      postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const postTitle = document.createElement('h3');
      postTitle.innerHTML = `<a href=${value.postUrl} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${value.postTitle}</a>`;
      postElement.appendChild(postTitle);
      postsList.appendChild(postElement);
      const descriptionButton = document.createElement('button');
      descriptionButton.innerHTML = 'type="button" class="btn btn-primary btn-sm" data-id="2" data-toggle="modal" data-target="#modal">';
      descriptionButton.textContent = 'Просмотр';
      postsList.appendChild(descriptionButton);
    });
  });

  const parseFeed = (xml, feedUrl) => {
    const parser = new DOMParser();
    const feed = parser.parseFromString(xml.data.contents, 'application/xml');
    const feedTitle = feed.querySelector('title').textContent;
    const feedDescription = feed.querySelector('description').textContent;
    const feedLastBuildDate = new Date(feed.querySelector('lastBuildDate').textContent);
    const feedId = _.uniqueId();
    const feedsObj = {
      feedId, feedTitle, feedDescription, feedLastBuildDate,
    };
    watchedState.feeds.set(feedUrl, feedsObj);
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
