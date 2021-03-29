import onChange from 'on-change';
import _ from 'lodash';

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'feeds':
        const feedsContainer = document.querySelector('.feeds');
        feedsContainer.innerHTML = '';
        const postsContainer = document.querySelector('.posts');
        const feedsHeader = document.createElement('h2');
        feedsHeader.textContent = 'Фиды';
        feedsContainer.appendChild(feedsHeader);
        const feedsList = document.createElement('ul');
        feedsList.classList.add('list-group', 'mb-5');
        feedsContainer.appendChild(feedsList);
        const feedsMap = new Map(watchedState.feeds);
        feedsMap.forEach((value, key) => {
          const feedElement = document.createElement('li');
          feedElement.classList.add('list-group-item');
          const feedTitle = document.createElement('h3');
          feedTitle.textContent = value.feedTitle;
          feedElement.appendChild(feedTitle);
          const feedDescription = document.createElement('p');
          feedDescription.textContent = value.feedDescription;
          feedElement.appendChild(feedDescription);
          feedsContainer.appendChild(feedElement);
        });
        break;

      case 'posts':
        const postsHeader = document.createElement('h2');
        postsHeader.textContent = 'Посты';
        postsContainer.appendChild(postsHeader);
        const postsList = document.createElement('ul');
        postsList.classList.add('list-group');
        postsContainer.appendChild(postsList);
        const postsMap = new Map(watchedState.posts);
        postsMap.forEach((value, key) => {
          const postElement = document.createElement('li');
          postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
          const postTitle = document.createElement('h3');
          postTitle.innerHTML = `<a href=${value.postUrl} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${value.postTitle}</a>`;
          postElement.appendChild(postTitle);
          postsList.appendChild(postElement);
          const descriptionButton = document.createElement('button');
          descriptionButton.innerHTML = 'type="button" class="btn btn-primary btn-sm" data-id="2" data-toggle="modal" data-target="#modal">';
          descriptionButton.textContent = 'Просмотр';
          postsList.appendChild(descriptionButton);
        });
        break;
      default: break;
    }
  });
  return watchedState;
};
