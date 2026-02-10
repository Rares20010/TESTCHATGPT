/* ============================================
   UI Module
   Mobile menu, scroll effects, toasts, modals
   ============================================ */

const UI = (() => {
  function init() {
    initMobileMenu();
    initScrollHeader();
    initSmoothScroll();
  }

  // Mobile Menu
  function initMobileMenu() {
    const menuBtn = document.querySelector('.header__menu-btn');
    const nav = document.querySelector('.header__nav');
    const closeBtn = document.querySelector('.header__nav-close');

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('header__nav--open');
      document.body.style.overflow = nav.classList.contains('header__nav--open') ? 'hidden' : '';
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        nav.classList.remove('header__nav--open');
        document.body.style.overflow = '';
      });
    }

    // Close on link click
    nav.querySelectorAll('.header__nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('header__nav--open');
        document.body.style.overflow = '';
      });
    });
  }

  // Sticky Header Shadow
  function initScrollHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('header--scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Smooth Scroll
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Toast Notifications
  function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const iconSvg = type === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Format Price
  function formatPrice(amount, currency = 'RON') {
    return new Intl.NumberFormat('ro-RO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + currency;
  }

  // Generate Star HTML
  function renderStars(rating, size = '') {
    const sizeClass = size ? ` stars--${size}` : '';
    let html = `<div class="stars${sizeClass}">`;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        html += '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" opacity="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      } else {
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      }
    }
    html += '</div>';
    return html;
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  return { showToast, formatPrice, renderStars };
})();
