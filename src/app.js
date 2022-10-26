// @ts-check

import i18next from 'i18next';
import onChange from 'on-change';
import commander from './commander.js';
import resources from './locales/index.js';
import view from './view.js';

const defaultLanguage = 'ru';

export default () => {
  const state = {
    lng: defaultLanguage,
    formState: 'filling', /// loading, invalid,
    feeds: {
      links: [], /// ['https://ru.hexlet.io/lessons.rss', ' http://lorem-rss.herokuapp.com/feed'],
      feedList: [],
    },
    posts: [],
    viewedPostsID: new Set(),
    errorMessage: '',
    elements: {
      rssForm: document.querySelector('.rss-form'),
      inputField: document.querySelector('#url-input'),
      buttonSubmit: document.querySelectorAll('.btn-lg'),
      feedback: document.querySelector('.feedback'),
      localeTextElements: document.querySelectorAll('[data-translate]'),
      feedsContainer: document.querySelector('.feeds'),
      postsContainer: document.querySelector('.posts'),
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.lng,
    debug: false,
    resources,
  });

  const watchedState = onChange(state, (path, value) => {
    commander(state, i18n, { path, value });
  });
  console.log(state.viewedPostsID.has('gf'));
  view(state, watchedState, i18n);
};
