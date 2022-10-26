import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

export default (url, i18n, { feeds }) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18n.t('errors.notOneOf'),
    },
    string: {
      url: i18n.t('errors.url'),
    },
  });
  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(
      feeds.links,
    ).required(),
  });
  return schema.validate({ url });
};

const proxify = (url) => {
  console.log('proxify');
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

export const getData = (url) => axios
  .get(proxify(url))
  .then((response) => response.data.contents)
  .catch(() => {
    throw new Error('response');
  });

export const parse = (data, state, watchedState) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    console.log(parseError);
    throw new Error('invalidRSS');
  }
  console.log('noerror');
  const feed = {
    title: dom.querySelector('title').textContent,
    description: dom.querySelector('description').textContent,
  };
  const feedPosts = Array
    .from(dom.querySelectorAll('item'))
    .map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      return { title, link, description };
    });
  const oldPosts = state.posts.map((post) => {
    const { title, link, description } = post;
    return { title, link, description };
  });
  const newPosts = _.differenceWith(feedPosts, oldPosts, _.isEqual)
    .map((post) => _.set(post, 'id', _.uniqueId('post')));
  watchedState.feeds.feedList.push(feed);
  watchedState.posts = [...state.posts, ...newPosts];
};
