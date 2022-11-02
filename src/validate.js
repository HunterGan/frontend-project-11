import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

export default (url, i18n, watchedState) => {
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

export const getData = (url) => axios
  .get(proxify(url))
  .then((response) => {
    console.log('test');
    const responseData = { data: response.data.contents, url };
    console.log('test6');
    return responseData;
  })
  .catch(() => {
    throw new Error('badNetwork');
  });

export const parse = (response, watchedState) => {
  const { data, url } = response;
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    throw new Error('invalidRSS');
  }
  const feed = {
    url,
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
  const oldPosts = watchedState.dataState.posts.map((post) => {
    const { title, link, description } = post;
    return { title, link, description };
  });
  const posts = _.differenceWith(feedPosts, oldPosts, _.isEqual)
    .map((post) => _.set(post, 'id', _.uniqueId('post')));

  return { feed, posts };
};
