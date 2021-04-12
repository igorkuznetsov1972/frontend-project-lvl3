/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import * as $ from 'jquery';
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
      processState: 'filling',
      processError: null,
      fields: {
        url: '',
      },
      valid: false,
    },
    feedUrls: [],
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

  const updateFeed = (feed) => {
    axios.get(composeRssUrl(feed.feedUrl))
      .then((response) => checkForNewPosts(response, feed.feedId))
      .then(setTimeout(updateFeed, timeout, feed))
      .catch((err) => console.log(err));
  };

  const updateAllFeeds = () => {
    watchedState.feeds.forEach((feed) => {
      if (feed.feedState === 'new') {
        feed.feedState = 'updating';
        updateFeed(feed);
      }
    });
    setTimeout(updateAllFeeds, timeout);
  };

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const feedUrl = formData.get('url');
    watchedState.form.valid = true;
    const schema = yup.string().url().notOneOf(watchedState.feedUrls);
    schema.validate(feedUrl, { abortEarly: true })
      .then((url) => axios.get(composeRssUrl(url))
        .then((response) => parseFeed(response))
        .then(({ parsedFeed, parsedItems }) => {
          parsedFeed.feedUrl = feedUrl;
          watchedState.feedUrls.push(feedUrl);
          watchedState.feeds.push(parsedFeed);
          watchedState.posts.unshift(...parsedItems);
          watchedState.form.valid = false;
        })
        .then(form.reset())
        .catch((err) => {
          watchedState.errors = err.message;
          watchedState.form.valid = false;
        }))
      .catch((err) => {
        watchedState.errors = err.errors.toString();
        watchedState.form.valid = false;
      });
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
