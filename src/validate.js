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
      feeds.map((feed) => feed.url),
    ).required(),
  });
  return schema.validate({ url });
};

const proxify = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

export const getData = (url) => axios
  .get(proxify(url))
  .then((response) => {
    console.log(response.data);
    return { data: response.data.contents, url };
  })
  .catch(() => {
    throw new Error('response');
  });

export const parse = (response, state) => {
  const { data, url } = response;
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  console.log(dom);
  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    console.log(parseError);
    throw new Error('invalidRSS');
  }
  console.log('noerror');
  const feed = {
    url,
    title: dom.querySelector('title').textContent,
    description: dom.querySelector('description').textContent,
  };
  console.log('noerror2');
  const feedPosts = Array
    .from(dom.querySelectorAll('item'))
    .map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      return { title, link, description };
    });
    console.log('noerror3');
  const oldPosts = state.posts.map((post) => {
    const { title, link, description } = post;
    return { title, link, description };
  });
  console.log('noerror4');
  const posts = _.differenceWith(feedPosts, oldPosts, _.isEqual)
    .map((post) => _.set(post, 'id', _.uniqueId('post')));
  console.log('finishParse');

  return { feed, posts };
};
