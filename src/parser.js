export default (xml) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(xml.data.contents, 'application/xml');
  const rssError = feed.querySelector('parsererror');
  if (rssError) throw new Error('parseError');
  const parsedFeed = {};
  const parsedItems = [];
  const feedTitle = feed.querySelector('title');
  parsedFeed.feedTitle = feedTitle.textContent;
  const feedDescription = feed.querySelector('description');
  parsedFeed.feedDescription = feedDescription.textContent;
  const items = Array.from(feed.querySelectorAll('item'));
  items.forEach((item) => {
    const post = {};
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
