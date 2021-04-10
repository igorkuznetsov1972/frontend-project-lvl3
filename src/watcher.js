import * as $ from 'jquery';
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
    switch (path) {
      case 'form.errors': {
        const feedBackContainer = document.querySelector('.feedback');
        feedBackContainer.classList.remove('text-success');
        feedBackContainer.classList.add('text-danger');
        feedBackContainer.textContent = i18n.t(watchedState.form.errors);
        break;
      }
      case 'errors': {
        const feedBackContainer = document.querySelector('.feedback');
        feedBackContainer.classList.remove('text-success');
        feedBackContainer.classList.add('text-danger');
        feedBackContainer.textContent = i18n.t(watchedState.errors);
        break;
      }
      case 'feeds': {
        const form = document.querySelector('.rss-form');
        form.reset();
        const feedsContainer = document.querySelector('.feeds');
        feedsContainer.innerHTML = '';
        const feedsHeader = document.createElement('h2');
        feedsHeader.textContent = i18n.t('feeds');

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
        feedBackContainer.textContent = i18n.t('RSSsuccess');
        const postsContainer = document.querySelector('.posts');
        postsContainer.innerHTML = '';
        const postsHeader = document.createElement('h2');
        postsHeader.textContent = i18n.t('posts');
        postsContainer.append(postsHeader);
        const postsList = document.createElement('ul');
        postsList.classList.add('list-group');
        postsContainer.append(postsList);
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
        break;
      }
      default: break;
    }
  });

  $('#modal').on('show.bs.modal', function findModal(event) {
    const button = $(event.relatedTarget);
    const postText = $(button.prev('a'));
    postText.removeClass('font-weight-bold');
    postText.addClass('font-weight-normal');
    const postId = $(button).data('id').toString();
    const post = watchedState.posts.find((element) => element.postId === postId);
    post.postRead = true;
    const modal = $(this);
    modal.find('.modal-title').text(post.postTitle);
    modal.find('.modal-body').text(post.postDescription);
    modal.find('a.full-article').attr('href', post.postUrl);
  });

  return watchedState;
};
