// @ts-check
import _ from 'lodash';

export default (response) => {
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
    // @ts-ignore
    description: dom.querySelector('description').textContent,
  };
  const posts = Array
    .from(dom.querySelectorAll('item'))
    .map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      return { title, link, description };
    });
  return { feed, posts };
};

export const getUniquePosts = (parsedData, watchedState) => {
  const { posts } = parsedData;
  const oldPosts = watchedState.dataState.posts.map((post) => {
    const { title, link, description } = post;
    return { title, link, description };
  });
  const uniquePosts = _.differenceWith(posts, oldPosts, _.isEqual)
    .map((post) => _.set(post, 'id', _.uniqueId('post')));
  return uniquePosts;
};
