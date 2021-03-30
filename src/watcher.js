import onChange from 'on-change';

export default (state) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.errors': {
        const feedBackContainer = document.querySelector('.feedback');
        feedBackContainer.classList.remove('text-success');
        feedBackContainer.classList.add('text-danger');
        feedBackContainer.textContent = watchedState.form.errors;
        break;
      }
      case 'errors': {
        const feedBackContainer = document.querySelector('.feedback');
        feedBackContainer.classList.remove('text-success');
        feedBackContainer.classList.add('text-danger');
        feedBackContainer.textContent = watchedState.errors;
        break;
      }
      case 'feeds': {
        const form = document.querySelector('.rss-form');
        form.reset();
        const feedsContainer = document.querySelector('.feeds');
        feedsContainer.innerHTML = '';
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
      }

      case 'posts': {
        const feedBackContainer = document.querySelector('.feedback');
        feedBackContainer.classList.remove('text-danger');
        feedBackContainer.classList.add('text-success');
        feedBackContainer.textContent = 'RSS успешно загружен';
        const postsContainer = document.querySelector('.posts');
        postsContainer.innerHTML = '';
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
          postElement.innerHTML = `<a href=${value.postUrl} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${value.postTitle}</a>`;
          postsList.appendChild(postElement);
          const descriptionButton = document.createElement('button');
          descriptionButton.setAttribute('data-id', '2');
          descriptionButton.setAttribute('data-toggle', 'modal');
          descriptionButton.setAttribute('data-target', '#modal');
          descriptionButton.classList.add('btn', 'btn-primary', 'btn-sm');
          descriptionButton.textContent = 'Просмотр';
          postElement.appendChild(descriptionButton);
        });
        break;
      }
      default: break;
    }
  });
  return watchedState;
};
