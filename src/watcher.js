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

        const feedsList = document.createElement('ul');
        feedsList.classList.add('list-group', 'mb-5');
        feedsContainer.append(feedsList);
        watchedState.feeds.forEach((value) => {
          const feedElement = document.createElement('li');
          feedElement.classList.add('list-group-item');
          const feedTitle = document.createElement('h3');
          feedTitle.textContent = value.feedTitle;
          feedElement.append(feedTitle);
          const feedDescription = document.createElement('p');
          feedDescription.textContent = value.feedDescription;
          feedElement.append(feedDescription);
          feedsContainer.prepend(feedElement);
        });
        feedsContainer.prepend(feedsHeader);
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
        postsContainer.append(postsHeader);
        const postsList = document.createElement('ul');
        postsList.classList.add('list-group');
        postsContainer.append(postsList);
        watchedState.posts.forEach((post) => {
          const postElement = document.createElement('li');
          postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
          postElement.innerHTML = `<a href=${post.postUrl} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${post.postTitle}</a>`;
          postsList.append(postElement);
          const descriptionButton = document.createElement('button');
          descriptionButton.setAttribute('data-id', '2');
          descriptionButton.setAttribute('data-toggle', 'modal');
          descriptionButton.setAttribute('data-target', '#modal');
          descriptionButton.classList.add('btn', 'btn-primary', 'btn-sm');
          descriptionButton.textContent = 'Просмотр';
          postElement.append(descriptionButton);
        });
        break;
      }
      default: break;
    }
  });
  return watchedState;
};
