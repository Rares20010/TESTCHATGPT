(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initSlider(slider) {
    const track = slider.querySelector('[data-product-track]');
    const slides = Array.from(track.children);
    const dots = slider.querySelector('[data-product-dots]');
    const prev = slider.querySelector('[data-product-prev]');
    const next = slider.querySelector('[data-product-next]');
    let index = 0;

    function goTo(newIndex) {
      index = (newIndex + slides.length) % slides.length;
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      if (dots) {
        dots.querySelectorAll('button').forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      }
    }

    if (dots) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.addEventListener('click', () => goTo(i));
        dots.appendChild(dot);
      });
    }

    prev?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));

    goTo(0);
  }

  function initAnimatedSections() {
    if (prefersReduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-animate-on-scroll]').forEach((el) => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-product-slider]').forEach(initSlider);
    initAnimatedSections();
  });
})();
