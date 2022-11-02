// @ts-check

import i18next from 'i18next';
import resources from './locales/index.js';
import view from './view.js';

const defaultLanguage = 'ru';

export default () => {
  const state = {
    lng: defaultLanguage,
    uiState: {
      formState: 'filling',
      activeModalID: '',
      viewedPostsID: new Set(),
      userMessage: '',
    },
    dataState: {
      feeds: [],
      posts: [],
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.lng,
    debug: false,
    resources,
  });

  view(state, i18n);
};
