import { setLocale } from 'yup';

export default () => {
  setLocale({
    mixed: {
      notOneOf: 'errRSSadded',
    },
    string: {
      url: 'errURL',
    },
  });
};
