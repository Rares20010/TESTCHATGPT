/* ============================================
   Blog Module
   Load posts, category filter, render cards
   ============================================ */

const Blog = (() => {
  let allPosts = [];
  let currentCategory = 'all';

  async function init() {
    try {
      const response = await fetch('data/blog-posts.json');
      allPosts = await response.json();
      renderPosts();
      bindFilters();
    } catch (e) {
      console.error('Failed to load blog posts:', e);
    }
  }

  function renderPosts() {
    const grid = document.querySelector('.blog-grid');
    if (!grid) return;

    const filtered = currentCategory === 'all'
      ? allPosts
      : allPosts.filter(p => p.category === currentCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <h3 class="empty-state__title">Niciun articol gasit</h3>
          <p class="empty-state__desc">Nu exista articole in aceasta categorie.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((post, index) => {
      // First post is featured
      if (index === 0 && currentCategory === 'all') {
        return renderFeaturedPost(post);
      }
      return renderBlogCard(post);
    }).join('');
  }

  function renderFeaturedPost(post) {
    const categoryNames = {
      'ghiduri': 'Ghiduri',
      'tehnologie': 'Tehnologie',
      'legislatie': 'Legislatie',
      'sustenabilitate': 'Sustenabilitate'
    };

    return `
      <article class="blog-featured">
        <div class="blog-featured__image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <div class="blog-featured__body">
          <span class="blog-featured__category">${categoryNames[post.category] || post.category}</span>
          <h2 class="blog-featured__title">${post.title}</h2>
          <p class="blog-featured__excerpt">${post.excerpt}</p>
          <div class="blog-featured__meta">
            <span>${formatDate(post.date)}</span>
            <span>&#183;</span>
            <span>${post.readTime} lectura</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderBlogCard(post) {
    const categoryNames = {
      'ghiduri': 'Ghiduri',
      'tehnologie': 'Tehnologie',
      'legislatie': 'Legislatie',
      'sustenabilitate': 'Sustenabilitate'
    };

    return `
      <article class="blog-card">
        <div class="blog-card__image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
        </div>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <span class="blog-card__category">${categoryNames[post.category] || post.category}</span>
            <span>${formatDate(post.date)}</span>
            <span>&#183;</span>
            <span>${post.readTime} lectura</span>
          </div>
          <h3 class="blog-card__title">${post.title}</h3>
          <p class="blog-card__excerpt">${post.excerpt}</p>
        </div>
      </article>
    `;
  }

  function bindFilters() {
    document.querySelectorAll('.blog-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.blog-filter').forEach(b => b.classList.remove('blog-filter--active'));
        btn.classList.add('blog-filter--active');
        currentCategory = btn.dataset.category;
        renderPosts();
      });
    });
  }

  function formatDate(dateStr) {
    const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
                    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-grid')) {
      init();
    }
  });

  return { init };
})();
