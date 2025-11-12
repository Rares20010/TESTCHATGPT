const siteHeader = document.querySelector('.header');
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.header__toggle');
const faqItems = document.querySelectorAll('.faq-item');
const testimonialTrack = document.querySelector('.testimonials__track');
const testimonialPrev = document.querySelector('[data-testimonial-prev]');
const testimonialNext = document.querySelector('[data-testimonial-next]');
let testimonialIndex = 0;

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
  });
}

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
