// @ts-check

import onChange from 'on-change';
import validate, { parse, getData } from './validate.js';
import render from './render.js';

const getElements = () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    inputField: document.querySelector('#url-input'),
    buttonSubmit: document.querySelector('.btn-lg'),
    feedback: document.querySelector('.feedback'),
    localeTextElements: document.querySelectorAll('[data-translate]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
  };
  return elements;
};

const updateRSS = (watchedState) => {
  const callBack = () => {
    const urls = watchedState.dataState.feeds.map((feed) => feed.url);
    const responses = urls.map((url) => getData(url));
    const promise = Promise.all(responses);
    promise.then((feeds) => {
      console.log('111', feeds);
      feeds.forEach((feed) => {
        const { posts } = parse(feed, watchedState);
        watchedState.dataState.posts = [...posts, ...watchedState.dataState.posts];
      });
    });
    setTimeout(callBack, 5000);
  };
  return callBack();
};

const setLocaleTexts = (elements, i18n) => {
  const { localeTextElements } = elements;
  localeTextElements.forEach((element) => {
    const el = element;
    const elName = el.dataset.translate;
    const dest = (elName === 'placeholder_url') ? 'placeholder' : 'textContent';
    el[dest] = i18n.t(`inputForm.${elName}`);
  });
};

export default (state, i18n) => {
  const elements = getElements();
  setLocaleTexts(elements, i18n);

  const watchedState = onChange(state, (path, value) => {
    render(state, i18n, { path, value }, elements);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(elements.rssForm);
    const inputPath = formData.get('url');
    console.log(inputPath);
    watchedState.uiState.formState = 'loading';
    console.log('test1');
    validate(inputPath, i18n, watchedState)
      .then(({ url }) => getData(url))
      .then((response) => {
        console.log('test2');
        const { feed, posts } = parse(response, watchedState);
        console.log('test3');
        watchedState.uiState.formState = 'valid';
        watchedState.dataState.feeds.push(feed);
        watchedState.dataState.posts = [...posts, ...watchedState.dataState.posts];
        watchedState.uiState.formState = 'filling';
        updateRSS(watchedState);
      })
      .catch((err) => {
        watchedState.uiState.userMessage = i18n.t(`errors.${err.message}`);
        watchedState.uiState.formState = 'invalid';
        watchedState.uiState.formState = 'filling';
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (id) {
      watchedState.uiState.viewedPostsID.add(id);
      if (e.target.nodeName === 'BUTTON') {
        watchedState.uiState.activeModalID = id;
      }
    }
  });
};
