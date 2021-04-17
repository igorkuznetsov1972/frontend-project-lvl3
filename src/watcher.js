import onChange from 'on-change';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from './assets/locales';

export default (state) => {
  const i18n = i18next.createInstance();
  i18n
    .use(LanguageDetector)
    .init({
      debug: true,
 //     lng: 'ru-Ru',
      detection: { order: ['navigator'] },
      resources,
    });

  const watchedState = onChange(state, (path, value) => {
    const renderFeeds = () => {
      const feedsContainer = document.querySelector('.feeds');
      feedsContainer.innerHTML = '';
      const feedsHeader = document.createElement('h2');
      feedsHeader.textContent = i18n.t('feeds');
      feedsContainer.prepend(feedsHeader);
      const feedsDocumentFragment = new DocumentFragment();
      const feedsList = document.createElement('ul');
      feedsList.classList.add('list-group', 'mb-5');
      watchedState.feeds.forEach((feed) => {
        const feedElement = document.createElement('li');
        feedElement.classList.add('list-group-item');
        const feedTitle = document.createElement('h3');
        feedTitle.textContent = feed.feedTitle;
        feedElement.append(feedTitle);
        const feedDescription = document.createElement('p');
        feedDescription.textContent = feed.feedDescription;
        feedElement.append(feedDescription);
        feedsList.prepend(feedElement);
      });
      feedsDocumentFragment.append(feedsList);
      feedsContainer.append(feedsDocumentFragment);
    };

    const renderPosts = () => {
      const postsContainer = document.querySelector('.posts');
      postsContainer.innerHTML = '';
      const postsHeader = document.createElement('h2');
      postsHeader.textContent = i18n.t('posts');
      postsContainer.append(postsHeader);
      const postsDocumentFragment = new DocumentFragment();
      const postsList = document.createElement('ul');
      postsList.classList.add('list-group');
      watchedState.posts.forEach((post) => {
        const postElement = document.createElement('li');
        postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
        const font = watchedState.readPosts.has(post.postId) ? 'font-weight-normal' : 'font-weight-bold';
        postElement.innerHTML = `<a href=${post.postUrl} class=${font} data-id="2" target="_blank" rel="noopener noreferrer">${post.postTitle}</a>`;
        const descriptionButton = document.createElement('button');
        descriptionButton.setAttribute('data-id', `${post.postId}`);
        descriptionButton.setAttribute('data-toggle', 'modal');
        descriptionButton.setAttribute('data-target', '#modal');
        descriptionButton.classList.add('btn', 'btn-primary', 'btn-sm');
        descriptionButton.textContent = i18n.t('view');
        postElement.append(descriptionButton);
        postsList.append(postElement);
      });
      postsDocumentFragment.append(postsList);
      postsContainer.append(postsDocumentFragment);
    };

    switch (path) {
      case 'loading.processState': {
        if (value === 'idle') {
          const input = document.querySelector('.form-control');
          const inputButton = document.querySelector('button[type=submit]');
          input.removeAttribute('disabled');
          inputButton.removeAttribute('disabled');
        }
        if (value === 'loading') {
          const input = document.querySelector('.form-control');
          const inputButton = document.querySelector('button[type=submit]');
          input.setAttribute('disabled', true);
          inputButton.setAttribute('disabled', true);
        }
        if (value === 'success') {
          const feedBackContainer = document.querySelector('.feedback');
          feedBackContainer.classList.remove('text-danger');
          feedBackContainer.classList.add('text-success');
          feedBackContainer.textContent = i18n.t('RSSsuccess');
        }
        if (value === 'error') {
          const feedBackContainer = document.querySelector('.feedback');
          feedBackContainer.classList.remove('text-success');
          feedBackContainer.classList.add('text-danger');
          feedBackContainer.textContent = i18n.t(watchedState.errors);
          const input = document.querySelector('.form-control');
          const inputButton = document.querySelector('button[type=submit]');
          input.removeAttribute('disabled');
          inputButton.removeAttribute('disabled');
        }
        break;
      }

      case 'feeds': {
        renderFeeds();
        const form = document.querySelector('.rss-form');
        form.reset();
        break;
      }

      case 'posts': {
        renderPosts();
        break;
      }

      case 'modal.postId': {
        const post = watchedState.posts
          .find(() => value === watchedState.modal.postId);
        const modalTitle = document.querySelector('.modal-title');
        modalTitle.textContent = post.postTitle;
        const modalBody = document.querySelector('.modal-body');
        modalBody.textContent = post.postDescription;
        const fullArticleLink = document.querySelector('a.full-article');
        fullArticleLink.setAttribute('href', post.postUrl);
        break;
      }

      case 'readPosts': {
        renderPosts();
        break;
      }

      default:
        break;
    }
  });

  return watchedState;
};
