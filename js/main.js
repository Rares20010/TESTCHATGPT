const siteHeader = document.querySelector('.header');
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.header__toggle');
const submenuToggles = document.querySelectorAll('[data-submenu-toggle]');
const faqItems = document.querySelectorAll('.faq-item');
const testimonialTrack = document.querySelector('.testimonials__track');
const testimonialPrev = document.querySelector('[data-testimonial-prev]');
const testimonialNext = document.querySelector('[data-testimonial-next]');
let testimonialIndex = 0;

function closeSubmenus() {
  submenuToggles.forEach((toggle) => {
    const parentItem = toggle.closest('.nav__item--has-submenu');
    parentItem?.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    if (expanded) {
      closeSubmenus();
    }
  });
}

submenuToggles.forEach((toggle) => {
  const parentItem = toggle.closest('.nav__item--has-submenu');
  if (!parentItem) return;

  toggle.addEventListener('click', () => {
    const isOpen = parentItem.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);

    submenuToggles.forEach((otherToggle) => {
      if (otherToggle === toggle) return;
      const otherParent = otherToggle.closest('.nav__item--has-submenu');
      otherParent?.classList.remove('is-open');
      otherToggle.setAttribute('aria-expanded', 'false');
    });
  });
});

document.addEventListener('click', (event) => {
  if (!nav?.contains(event.target)) {
    closeSubmenus();
  }
});

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-item__button');
  if (!button) return;
  button.addEventListener('click', () => {
    item.classList.toggle('is-open');
  });
});

function updateTestimonialSlider() {
  if (!testimonialTrack) return;
  const slides = Array.from(testimonialTrack.children);
  const columns = getComputedStyle(testimonialTrack).gridTemplateColumns.split(' ').length;
  const maxIndex = Math.max(0, slides.length - columns);
  testimonialIndex = Math.max(0, Math.min(testimonialIndex, maxIndex));
  const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
  testimonialTrack.style.transform = `translateX(-${testimonialIndex * (slideWidth + 24)}px)`;
}

window.addEventListener('resize', updateTestimonialSlider);
window.addEventListener('load', updateTestimonialSlider);

[testimonialPrev, testimonialNext].forEach((control) => {
  control?.addEventListener('click', () => {
    if (!testimonialTrack) return;
    testimonialIndex += control.dataset.testimonialNext ? 1 : -1;
    updateTestimonialSlider();
  });
});

if (siteHeader) {
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScrollY && current > 120) {
      siteHeader.classList.add('is-hidden');
    } else {
      siteHeader.classList.remove('is-hidden');
    }
    lastScrollY = current;
  });
}
