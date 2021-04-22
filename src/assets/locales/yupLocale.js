import { setLocale } from 'yup';

export default () => {
  setLocale({
    mixed: {
      notOneOf: () => 'duplicate',
      required: () => 'required',
    },
    string: {
      url: () => 'errURL',
    },
  });
};
