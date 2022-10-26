// @ts-check
import { addFeeds, addPosts } from './view.js';

export default (state, i18n, changedData) => {
  const { path, value } = changedData;
  if (path === 'formState') {
    switch (value) {
      case 'filling':
        state.elements.inputField.focus();
        break;
      case 'loading':
        /// state.elements.buttonSubmit
        break;
      case 'buildRSS':
        console.log('buildRSS');
        state.elements.inputField.classList.remove('is-invalid');
        state.elements.feedback.textContent = '';
        break;
      case 'invalid':
        state.elements.inputField.classList.add('is-invalid');
        state.elements.feedback.textContent = state.errorMessage;
        break;
      default:
        break;
    }
  }
  if (path === 'posts') {
    addPosts(state, i18n);
  }
  if (path === 'feeds.feedList') {
    addFeeds(state, i18n);
  }
};
