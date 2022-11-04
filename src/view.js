// @ts-check

import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import parse, { getUniquePosts } from './parser.js';
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
    langChangeButton: document.querySelector('#changeLanguage'),
  };
  return elements;
};

const validate = (url, watchedState) => {
  const schema = yup.object().shape({
    url: yup.string().url('invalidURL').notOneOf(watchedState.dataState.feeds
      .map((feed) => feed.url), 'alreadyExists').required('emptyField'),
  });
  return schema.validate({ url });
};

const proxify = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  console.log('test5');
  return urlWithProxy.toString();
};

const getData = (url) => axios
  .get(proxify(url))
  .then((response) => {
    const responseData = { data: response.data.contents, url };
    return responseData;
  })
  .catch(() => {
    throw new Error('badNetwork');
  });

const updateRSS = (watchedState) => {
  const { dataState } = watchedState;
  const callBack = () => {
    const urls = dataState.feeds.map((feed) => feed.url);
    const responses = urls.map((url) => getData(url));
    const promise = Promise.all(responses);
    promise.then((feeds) => {
      feeds.forEach((feed) => {
        const parsedData = parse(feed);
        const posts = getUniquePosts(parsedData, watchedState);
        dataState.posts = [...posts, ...dataState.posts];
      });
    });
    setTimeout(callBack, 5000);
  };
  if (!watchedState.updateTimer) {
    watchedState.updateTimer = true;
    return callBack();
  }
  return;
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
  const watchedState = onChange(state, (path, value) => {
    render(state, i18n, { path, value }, elements);
  });
  setLocaleTexts(elements, i18n);

  elements.rssForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(elements.rssForm);
    const inputPath = formData.get('url');
    console.log(inputPath);
    watchedState.uiState.formState = 'loading';
    validate(inputPath, watchedState)
      .then(({ url }) => getData(url))
      .then((response) => {
        const { feed, posts } = parse(response);
        const newPosts = getUniquePosts({ posts }, watchedState);
        watchedState.uiState.formState = 'valid';
        watchedState.dataState.feeds.push(feed);
        watchedState.dataState.posts = [...newPosts, ...watchedState.dataState.posts];
        watchedState.uiState.formState = 'filling';
        updateRSS(watchedState);
      })
      .catch((err) => {
        watchedState.uiState.userMessage = i18n.t(`errors.${err.message}`);
        watchedState.uiState.formState = 'invalid';
        watchedState.uiState.formState = 'filling';
      });
  });

  elements.postsContainer?.addEventListener('click', (e) => {
    const { id } = e.target.dataset ?? null;
    if (id) {
      watchedState.uiState.viewedPostsID.add(id);
      if (e.target instanceof HTMLButtonElement) {
        watchedState.uiState.activeModalID = id;
      }
    }
  });
  elements.langChangeButton?.addEventListener('change', (e) => {
    const newLanguage = e.target.defaultValue;
    watchedState.lng = newLanguage;
    setLocaleTexts(elements, i18n);
  });
};
