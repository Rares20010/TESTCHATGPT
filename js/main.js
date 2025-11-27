const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
  });
}

// FAQ accordion
const faqQuestions = document.querySelectorAll('.faq__question');
faqQuestions.forEach((btn) => {
  btn.addEventListener('click', () => {
    const answer = btn.parentElement.querySelector('.faq__answer');
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    btn.classList.toggle('faq__question--open');
  });
});

// Simple gallery swapper
const galleryThumbs = document.querySelectorAll('[data-gallery-target]');
const galleryMain = document.querySelector('[data-gallery-main]');
if (galleryThumbs.length && galleryMain) {
  galleryThumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      galleryMain.src = thumb.dataset.galleryTarget;
    });
  });
}
