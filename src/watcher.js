import onChange from 'on-change';
import _ from 'lodash';

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    const feedsContainer = document.querySelector('.feeds');
    const postsContainer = document.querySelector('.posts');
    const feedsHeader = document.createElement('h2');
    feedsHeader.textContent = 'Фиды';
    feedsContainer.appendChild(feedsHeader);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'mb-5');
    feedsContainer.appendChild(feedsList);
    _.forEach(watchedState.feeds.values(), (feed) => {
      const feedElement = document.createElement('li');
      feedElement.classList.add('list-group-item');
      const feedTitle = document.createElement('h3');
      feedTitle.textContent = feed.feedTitle;
      feedElement.appendChild(feedTitle);
      const feedDescription = document.createElement('p');
      feedDescription.textContent = feed.feedDescription;
      feedElement.appendChild(feedDescription);
    });
    const postsHeader = document.createElement('h2');
    postsHeader.textContent = 'Посты';
    postsContainer.appendChild(postsHeader);
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group');
    postsContainer.appendChild(postsList);
    _.forEach(watchedState.posts.values(), (post) => {
      const postElement = document.createElement('li');
      postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const postTitle = document.createElement('h3');
      postTitle.innerHTML = `<a href=${post.postUrl} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${post.postTitle}</a>`;
      postElement.appendChild(postTitle);
      postsList.appendChild(postElement);
      const descriptionButton = document.createElement('button');
      descriptionButton.innerHTML = 'type="button" class="btn btn-primary btn-sm" data-id="2" data-toggle="modal" data-target="#modal">';
      descriptionButton.textContent = 'Просмотр';
      postsList.appendChild(descriptionButton);
    });
  });
  return watchedState;
};
