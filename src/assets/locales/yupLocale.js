import { setLocale } from 'yup';

export default () => {
  setLocale({
    mixed: {
      notOneOf: () => 'duplicate',
    },
    string: {
      url: () => 'errURL',
    },
  });
};
