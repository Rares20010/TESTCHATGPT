/* ============================================
   Reviews Module
   Render review list with sample data
   ============================================ */

const Reviews = (() => {
  // Sample reviews (in production, these would come from an API)
  const sampleReviews = [
    {
      author: 'Alexandru M.',
      initials: 'AM',
      date: '2026-01-28',
      rating: 5,
      text: 'Panourile functioneaza excelent! Productia de energie a depasit asteptarile. Instalarea a fost simpla, iar calitatea materialelor este de top.',
      verified: true
    },
    {
      author: 'Maria P.',
      initials: 'MP',
      date: '2026-01-15',
      rating: 5,
      text: 'Foarte multumita de achizitie. Livrarea a fost rapida, iar panourile arata impecabil pe acoperis. Recomand cu incredere!',
      verified: true
    },
    {
      author: 'Ion D.',
      initials: 'ID',
      date: '2025-12-20',
      rating: 4,
      text: 'Produse de calitate la un pret corect. Singura mica problema a fost comunicarea cu curierul, dar produsul in sine este excelent.',
      verified: true
    },
    {
      author: 'Elena S.',
      initials: 'ES',
      date: '2025-12-05',
      rating: 5,
      text: 'Am cumparat un sistem complet - panouri, invertor si baterie. Totul a venit bine ambalat si functioneaza perfect. Economiile pe factura sunt vizibile deja!',
      verified: true
    },
    {
      author: 'Cristian B.',
      initials: 'CB',
      date: '2025-11-18',
      rating: 4,
      text: 'Bun raport calitate-pret. Eficienta este conform specificatiilor. As fi dorit mai multe optiuni de montaj incluse in pachet.',
      verified: false
    }
  ];

  function init() {
    renderSummary();
    renderList();
  }

  function renderSummary() {
    const container = document.querySelector('.reviews-summary');
    if (!container) return;

    const totalReviews = sampleReviews.length;
    const avgRating = (sampleReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map(star => {
      const count = sampleReviews.filter(r => r.rating === star).length;
      const percent = (count / totalReviews) * 100;
      return { star, count, percent };
    });

    container.innerHTML = `
      <div class="reviews-summary__score">
        <div class="reviews-summary__number">${avgRating}</div>
        ${UI.renderStars(parseFloat(avgRating), 'lg')}
        <div class="reviews-summary__total">${totalReviews} recenzii</div>
      </div>
      <div class="reviews-summary__bars">
        ${distribution.map(d => `
          <div class="reviews-bar">
            <span class="reviews-bar__label">${d.star} stele</span>
            <div class="reviews-bar__track">
              <div class="reviews-bar__fill" style="width: ${d.percent}%"></div>
            </div>
            <span class="reviews-bar__count">${d.count}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderList() {
    const container = document.querySelector('.reviews-list');
    if (!container) return;

    container.innerHTML = sampleReviews.map(review => `
      <div class="review-card">
        <div class="review-card__header">
          <div class="review-card__author">
            <div class="review-card__avatar">${review.initials}</div>
            <div>
              <div class="review-card__name">${review.author}</div>
              <div class="review-card__date">${formatDate(review.date)}</div>
            </div>
          </div>
          <div>
            ${UI.renderStars(review.rating)}
            ${review.verified ? '<div class="review-card__verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Achizitie verificata</div>' : ''}
          </div>
        </div>
        <p class="review-card__text">${review.text}</p>
      </div>
    `).join('');
  }

  function formatDate(dateStr) {
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.reviews-summary')) {
      init();
    }
  });

  return { init };
})();
