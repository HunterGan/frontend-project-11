// @ts-check
import _ from 'lodash';

const renderForm = ({ uiState }, value, i18n, elements) => {
  const { buttonSubmit, feedback, inputField } = elements;
  buttonSubmit.disabled = false;
  switch (value) {
    case 'filling':
      inputField.focus();
      break;
    case 'loading':
      buttonSubmit.disabled = true;
      inputField.classList.remove('is-invalid');
      feedback.textContent = '';
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
      break;
    case 'valid':
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('successMessage');
      inputField.value = '';
      break;
    case 'invalid':
      inputField.classList.add('is-invalid');
      feedback.textContent = uiState.userMessage;
      break;
    default:
      break;
  }
};

const buildFeedList = (elements, i18n) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
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
  elements.feedsContainer.append(feedsCard);
  return feedsList;
};

const buildPostList = (elements, i18n) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';
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
  elements.postsContainer.append(postsCard);
  return postsList;
};

const renderFeeds = (state, i18n, elements) => {
  const feedsList = buildFeedList(elements, i18n);
  state.dataState.feeds.forEach((feed) => {
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

const renderPosts = (state, i18n, elements) => {
  const postsList = buildPostList(elements, i18n);
  state.dataState.posts.forEach((post) => {
    const { title, link, id } = post;
    const postContainer = document.createElement('li');
    postContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between');
    postContainer.classList.add('align-items-start', 'border-0', 'border-end-0');
    const postDescription = document.createElement('a');
    postDescription.setAttribute('href', link);
    postDescription.setAttribute('target', '_blank');
    postDescription.setAttribute('rel', 'noopener noreferrer');
    const classesForAtag = state.uiState.viewedPostsID.has(id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
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

const renderModal = (state, elements) => {
  const { modalTitle, modalBody, modalLink } = elements;
  const id = state.uiState.activeModalID;
  const { posts } = state.dataState;
  const { title, link, description } = _.find(posts, (post) => post.id === id);
  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalLink.href = link;
};

export default (state, i18n, changedData, elements) => {
  const { path, value } = changedData;
  switch (path) {
    case 'uiState.formState':
      renderForm(state, value, i18n, elements);
      break;
    case 'dataState.feeds':
      renderFeeds(state, i18n, elements);
      break;
    case 'dataState.posts':
    case 'uiState.viewedPostsID':
      renderPosts(state, i18n, elements);
      break;
    case 'uiState.activeModalID':
      renderModal(state, elements);
      break;
    case 'lng':
      i18n.changeLanguage(value);
      if (state.updateTimer) {
        renderPosts(state, i18n, elements);
        renderFeeds(state, i18n, elements);
      }
      break;
    default:
      break;
  }
};
