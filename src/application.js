/* eslint-disable no-param-reassign */
import _ from 'lodash';
import * as yup from 'yup';
// import onChange from 'on-change';
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
  feeds: [],
  posts: [],
};
export default () => {
 const form = document.querySelector('.rss-form');
  const input = document.querySelector('input');
  form.addEventListener('submit', () => {
    //const formData = new FormData(form);
    //console.log(formData);
    
    const feedUrl = input.value;
    return axios(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feedUrl)}`)
      .then((response) => {
        const parser = new DOMParser();
        const feed = parser.parseFromString(response, 'application/xml');
        console.log(feed);
      })
      .catch((err) => console.log(err));
  });
};
