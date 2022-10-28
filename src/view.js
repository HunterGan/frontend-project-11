/* eslint-disable no-param-reassign */
// @ts-check
import _ from 'lodash';
import validate, { parse, getData } from './validate.js';

const setLocaleTexts = ({ localeTextElements }, i18n) => {
  localeTextElements.forEach((element) => {
    const elName = element.dataset.translate;
    const dest = (elName === 'placeholder_url') ? 'placeholder' : 'textContent';
    element[dest] = i18n.t(`inputForm.${elName}`);
  });
};

const buildModal = ({ elements, posts }, id) => {
  const { title, link, description } = _.find(posts, (post) => post.id === id);
  elements.modalTitle.textContent = title;
  elements.modalBody.textContent = description;
  elements.modalLink.href = link;
};

export default (state, watchedState, i18n) => {
  setLocaleTexts(state.elements, i18n);
  state.elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(state.elements.rssForm);
    const inputPath = formData.get('url');
    validate(inputPath, i18n, state)
      .then(({ url }) => {
        watchedState.formState = 'loading';
        return getData(url);
      })
      .then((response) => {
        console.log('yyyyyyyy1');
        const { feed, posts } = parse(response, state);
        console.log('yyyyyyyy2');
        watchedState.formState = 'buildRSS';
        watchedState.feeds.push(feed);
        watchedState.posts = [...posts, ...state.posts];
        console.log('yyyyyyyy3');
      })
      .catch((err) => {
        state.errorMessage = err.errors ?? err;
        watchedState.formState = 'invalid';
        watchedState.formState = 'filling';
      });
  });

  updateRSS(state, watchedState);

  
  state.elements.postsContainer.addEventListener('click', (e) => {
    if (e.target.nodeName === 'BUTTON') {
      const { id } = e.target.dataset;
      buildModal(state, id);
    }
  });
};

const buildFeedList = (state, i18n) => {
  state.elements.feedsContainer.innerHTML = '';
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  const feedsCardBody = document.createElement('div');
  feedsCardBody.classList.add('card-body');
  const feedsCardTitle = document.createElement('h2');
  feedsCardTitle.classList.add('card-title', 'h4');
  feedsCardTitle.textContent = i18n.t('feedForm.feeds');
  feedsCardBody.append(feedsCardTitle);
  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  feedsList.id = 'feed-list';
  feedsCard.append(feedsCardBody);
  feedsCard.append(feedsList);
  state.elements.feedsContainer.append(feedsCard);
  return feedsList;
};

export const addFeeds = (state, i18n) => {
  const feedsList = buildFeedList(state, i18n);
  state.feeds.feedList.forEach((feed) => {
    const { title, description } = feed;
    const feedContainer = document.createElement('li');
    feedContainer.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-balck-50');
    feedDescription.textContent = description;
    feedContainer.append(feedTitle);
    feedContainer.append(feedDescription);
    feedsList.prepend(feedContainer);
  });
};

const buildPostList = (state, i18n) => {
  state.elements.postsContainer.innerHTML = '';
  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');
  const postsCardBody = document.createElement('div');
  postsCardBody.classList.add('card-body');
  const postsCardTitle = document.createElement('h2');
  postsCardTitle.classList.add('card-title', 'h4');
  postsCardTitle.textContent = i18n.t('feedForm.articles');
  postsCardBody.append(postsCardTitle);
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsList.id = 'posts-list';
  postsCard.append(postsCardBody);
  postsCard.append(postsList);
  state.elements.postsContainer.append(postsCard);
  return postsList;
};

export const addPosts = (state, i18n) => {
  const postsList = buildPostList(state, i18n);
  state.posts.forEach((post) => {
    const {
      title, link, id,
    } = post;
    const postContainer = document.createElement('li');
    postContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between');
    postContainer.classList.add('align-items-start', 'border-0', 'border-end-0');
    const postDescription = document.createElement('a');
    postDescription.setAttribute('href', link);
    postDescription.setAttribute('target', '_blank');
    postDescription.setAttribute('rel', 'noopener noreferrer');
    console.log(id, 'ewrwer', state.viewedPostsID);
    const classesForAtag = state.viewedPostsID.has(id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    postDescription.classList.add(...classesForAtag);
    postDescription.setAttribute('data-id', id);
    postDescription.textContent = title;
    const modalButton = document.createElement('button');
    modalButton.setAttribute('type', 'button');
    modalButton.setAttribute('data-id', id);
    modalButton.setAttribute('data-bs-toggle', 'modal');
    modalButton.setAttribute('data-bs-target', '#modal');
    modalButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    modalButton.textContent = i18n.t('feedForm.buttonRead');
    postContainer.append(postDescription);
    postContainer.append(modalButton);
    postsList.prepend(postContainer);
  });
};

const updateRSS = (state, watchedState) => {
  const callBack = () => {
    const urls = state.feeds.map((feed) => feed.url);
    const responses = urls.map((url) => getData(url));
    const promise = Promise.all(responses);
    promise.then((feeds) => {
      feeds.forEach((feed) => {
        const { posts } = parse(feed, state);
        watchedState.posts = [...posts, ...state.posts];
      });
    });
    setTimeout(callBack, 5000);
  };
  console.log('im hete');
  return callBack();
};