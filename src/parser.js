import { uniqueId } from 'lodash';

export default (xml) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(xml.data.contents, 'application/xml');
  const parsedFeed = { feedState: 'new' };
  const parsedItems = [];
  if (!feed.querySelector('rss') || feed.querySelector('parsererror ')) {
    throw new Error('errRSS');
  } else {
    parsedFeed.feedTitle = feed.querySelector('title').textContent;
    parsedFeed.feedDescription = feed.querySelector('description').textContent;
    parsedFeed.feedId = uniqueId();
    Array.from(feed.querySelectorAll('item')).forEach((item) => {
      const post = { postRead: false, feedId: parsedFeed.feedId };
      post.postId = uniqueId();
      post.postGuid = feed.querySelector('guid').textContent;
      post.postTitle = item.querySelector('title').textContent;
      post.postDescription = item.querySelector('description').textContent;
      post.postPubDate = item.querySelector('pubDate').textContent;
      post.postUrl = item.querySelector('link').textContent;
      parsedItems.push(post);
    });
  }
  return { parsedFeed, parsedItems };
};
