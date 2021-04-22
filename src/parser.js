export default (xml) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(xml.data.contents, 'application/xml');
  const rssError = feed.querySelector('parsererror');
  if (rssError) throw new Error('parseError');
  const parsedFeed = {};
  const parsedItems = [];
  parsedFeed.feedTitle = feed.querySelector('title').textContent;
  parsedFeed.feedDescription = feed.querySelector('description').textContent;
  Array.from(feed.querySelectorAll('item')).forEach((item) => {
    const post = { feedId: parsedFeed.feedId };
    const title = item.querySelector('title');
    post.postTitle = title.textContent;
    const description = item.querySelector('description');
    post.postDescription = description.textContent;
    const link = item.querySelector('link');
    post.postUrl = link.textContent;
    parsedItems.push(post);
  });

  return { parsedFeed, parsedItems };
};
