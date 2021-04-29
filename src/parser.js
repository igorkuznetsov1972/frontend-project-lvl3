export default (xml) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(xml.data.contents, 'application/xml');
  const rssError = feed.querySelector('parsererror');
  if (rssError) throw new Error('parseError');
  const parsedFeed = {};
  const parsedItems = [];
  const feedTitle = feed.querySelector('title');
  parsedFeed.title = feedTitle.textContent;
  const feedDescription = feed.querySelector('description');
  parsedFeed.description = feedDescription.textContent;
  const items = Array.from(feed.querySelectorAll('item'));
  items.forEach((item) => {
    const post = {};
    const title = item.querySelector('title');
    post.title = title.textContent;
    const description = item.querySelector('description');
    post.description = description.textContent;
    const postLink = item.querySelector('link');
    post.link = postLink.textContent;
    parsedItems.push(post);
  });

  return { parsedFeed, parsedItems };
};
