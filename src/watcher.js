// import * as $ from 'jquery';
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
      detection: { order: ['navigator'] },
      resources,
    });

  const watchedState = onChange(state, (path) => {
    const renderError = () => {
      const feedBackContainer = document.querySelector('.feedback');
      feedBackContainer.classList.remove('text-success');
      feedBackContainer.classList.add('text-danger');
      feedBackContainer.textContent = i18n.t(watchedState.errors);
    };

    const renderFeeds = () => {
      const feedBackContainer = document.querySelector('.feedback');
      feedBackContainer.classList.remove('text-danger');
      feedBackContainer.classList.add('text-success');
      feedBackContainer.textContent = i18n.t('RSSsuccess');
      const feedsContainer = document.querySelector('.feeds');
      feedsContainer.innerHTML = '';
      const feedsHeader = document.createElement('h2');
      feedsHeader.textContent = i18n.t('feeds');
      feedsContainer.prepend(feedsHeader);
      const feedsDocumentFragment = new DocumentFragment();
      const feedsList = document.createElement('ul');
      feedsList.classList.add('list-group', 'mb-5');
      watchedState.feeds.forEach((value) => {
        const feedElement = document.createElement('li');
        feedElement.classList.add('list-group-item');
        const feedTitle = document.createElement('h3');
        feedTitle.textContent = value.feedTitle;
        feedElement.append(feedTitle);
        const feedDescription = document.createElement('p');
        feedDescription.textContent = value.feedDescription;
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
        const font = post.postRead ? 'font-weight-normal' : 'font-weight-bold';
        postElement.innerHTML = `<a href=${post.postUrl} class=${font} data-id="2" target="_blank" rel="noopener noreferrer">${post.postTitle}</a>`;
        postsList.append(postElement);
        const descriptionButton = document.createElement('button');
        descriptionButton.setAttribute('data-id', `${post.postId}`);
        descriptionButton.setAttribute('data-toggle', 'modal');
        descriptionButton.setAttribute('data-target', '#modal');
        descriptionButton.classList.add('btn', 'btn-primary', 'btn-sm');
        descriptionButton.textContent = i18n.t('view');
        postElement.append(descriptionButton);
      });
      postsDocumentFragment.append(postsList);
      postsContainer.append(postsDocumentFragment);
    };

    const blockInput = () => {
      const input = document.querySelector('.form-control');
      const inputButton = document.querySelector('button[type=submit]');
      if (watchedState.form.valid) {
        input.setAttribute('disabled', true);
        inputButton.setAttribute('disabled', true);
      } else {
        input.removeAttribute('disabled');
        inputButton.removeAttribute('disabled');
      }
    };

    switch (path) {
      case 'errors': {
        renderError();
        break;
      }

      case 'form.valid': {
        blockInput();
        break;
      }

      case 'feeds': {
        renderFeeds();
        break;
      }

      case 'posts': {
        renderPosts();
        break;
      }

      case 'feedUrls':
        break;

      default:
        throw new Error(`${path} - unknown case`);
    }
  });

  return watchedState;
};
