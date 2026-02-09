/* ============================================
   Products Module
   Load catalog, filter, sort, render grid
   ============================================ */

const Products = (() => {
  let allProducts = [];
  let filteredProducts = [];
  let currentFilters = {
    category: [],
    brand: [],
    priceMin: 0,
    priceMax: Infinity,
    wattageMin: 0,
    wattageMax: Infinity,
    sort: 'featured'
  };

  async function init() {
    try {
      const response = await fetch('data/products.json');
      allProducts = await response.json();
      filteredProducts = [...allProducts];
      renderGrid();
      renderFilters();
      bindSortEvents();
      bindFilterEvents();
      bindFilterToggle();
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  }

  function applyFilters() {
    filteredProducts = allProducts.filter(product => {
      // Category filter
      if (currentFilters.category.length > 0 && !currentFilters.category.includes(product.category)) {
        return false;
      }
      // Brand filter
      if (currentFilters.brand.length > 0 && !currentFilters.brand.includes(product.brand)) {
        return false;
      }
      // Price range
      if (product.price < currentFilters.priceMin || product.price > currentFilters.priceMax) {
        return false;
      }
      // Wattage range (only for panels)
      if (product.specs?.wattage) {
        if (product.specs.wattage < currentFilters.wattageMin) return false;
        if (currentFilters.wattageMax < Infinity && product.specs.wattage > currentFilters.wattageMax) return false;
      }
      return true;
    });

    // Sort
    switch (currentFilters.sort) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    renderGrid();
    updateResultsCount();
  }

  function renderGrid() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="80" height="80">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 class="empty-state__title">Niciun produs gasit</h3>
          <p class="empty-state__desc">Incercati sa modificati filtrele de cautare.</p>
          <button class="btn btn--primary" onclick="Products.clearFilters()">Reseteaza Filtrele</button>
        </div>`;
      return;
    }

    grid.innerHTML = filteredProducts.map(product => renderProductCard(product)).join('');

    // Bind add-to-cart buttons
    grid.querySelectorAll('.product-card__add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.productId;
        const product = allProducts.find(p => p.id === productId);
        if (product) {
          Cart.addItem(product);
          UI.showToast(`${product.name} a fost adaugat in cos!`);
        }
      });
    });
  }

  function renderProductCard(product) {
    const discount = product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

    const wattage = product.specs?.wattage ? `${product.specs.wattage}W` : '';
    const efficiency = product.specs?.efficiency ? `${product.specs.efficiency}%` : '';

    return `
      <div class="product-card">
        <a href="product-detail.html?id=${product.id}" class="product-card__image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="width:60px;height:60px;color:var(--color-gray-300)">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          ${discount > 0 ? `<span class="product-card__badge product-card__badge--sale">-${discount}%</span>` : ''}
          ${product.featured ? '<span class="product-card__badge">Recomandat</span>' : ''}
        </a>
        <div class="product-card__body">
          <div class="product-card__brand">${product.brand}</div>
          <h3 class="product-card__name">
            <a href="product-detail.html?id=${product.id}">${product.name}</a>
          </h3>
          <div class="product-card__specs">
            ${wattage ? `<span class="product-card__spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>${wattage}</span>` : ''}
            ${efficiency ? `<span class="product-card__spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${efficiency} efic.</span>` : ''}
          </div>
          <div class="product-card__rating">
            ${UI.renderStars(product.rating)}
            <span class="product-card__review-count">(${product.reviewCount})</span>
          </div>
          <div class="product-card__footer">
            <div>
              <span class="product-card__price">${UI.formatPrice(product.price)}</span>
              ${product.originalPrice ? `<span class="product-card__price-old">${UI.formatPrice(product.originalPrice)}</span>` : ''}
            </div>
            <button class="product-card__add-btn" data-product-id="${product.id}" title="Adauga in cos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderFilters() {
    // Category counts
    const categories = {};
    const brands = {};
    allProducts.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
      brands[p.brand] = (brands[p.brand] || 0) + 1;
    });

    const categoryNames = {
      'monocrystalline': 'Monocristalin',
      'polycrystalline': 'Policristalin',
      'inverter': 'Invertoare',
      'battery': 'Baterii',
      'mounting': 'Sisteme de Montaj'
    };

    const categoryList = document.querySelector('.filters__category-list');
    if (categoryList) {
      categoryList.innerHTML = Object.entries(categories).map(([cat, count]) => `
        <label class="form-check">
          <input type="checkbox" value="${cat}" data-filter="category">
          ${categoryNames[cat] || cat} <span class="filters__count">(${count})</span>
        </label>
      `).join('');
    }

    const brandList = document.querySelector('.filters__brand-list');
    if (brandList) {
      brandList.innerHTML = Object.entries(brands).map(([brand, count]) => `
        <label class="form-check">
          <input type="checkbox" value="${brand}" data-filter="brand">
          ${brand} <span class="filters__count">(${count})</span>
        </label>
      `).join('');
    }
  }

  function bindFilterEvents() {
    document.querySelectorAll('[data-filter="category"]').forEach(cb => {
      cb.addEventListener('change', () => {
        currentFilters.category = [...document.querySelectorAll('[data-filter="category"]:checked')].map(el => el.value);
        applyFilters();
      });
    });

    document.querySelectorAll('[data-filter="brand"]').forEach(cb => {
      cb.addEventListener('change', () => {
        currentFilters.brand = [...document.querySelectorAll('[data-filter="brand"]:checked')].map(el => el.value);
        applyFilters();
      });
    });

    const priceMin = document.querySelector('#filter-price-min');
    const priceMax = document.querySelector('#filter-price-max');
    if (priceMin && priceMax) {
      const applyPriceFilter = () => {
        currentFilters.priceMin = parseFloat(priceMin.value) || 0;
        currentFilters.priceMax = parseFloat(priceMax.value) || Infinity;
        applyFilters();
      };
      priceMin.addEventListener('change', applyPriceFilter);
      priceMax.addEventListener('change', applyPriceFilter);
    }

    const wattMin = document.querySelector('#filter-watt-min');
    const wattMax = document.querySelector('#filter-watt-max');
    if (wattMin && wattMax) {
      const applyWattFilter = () => {
        currentFilters.wattageMin = parseInt(wattMin.value) || 0;
        currentFilters.wattageMax = parseInt(wattMax.value) || Infinity;
        applyFilters();
      };
      wattMin.addEventListener('change', applyWattFilter);
      wattMax.addEventListener('change', applyWattFilter);
    }
  }

  function bindSortEvents() {
    const sortSelect = document.querySelector('.sort-bar__select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
      });
    }
  }

  function bindFilterToggle() {
    const toggleBtn = document.querySelector('.filter-toggle');
    const filters = document.querySelector('.filters');
    if (toggleBtn && filters) {
      toggleBtn.addEventListener('click', () => {
        filters.classList.toggle('filters--open');
        document.body.style.overflow = filters.classList.contains('filters--open') ? 'hidden' : '';
      });
    }
  }

  function clearFilters() {
    currentFilters = {
      category: [],
      brand: [],
      priceMin: 0,
      priceMax: Infinity,
      wattageMin: 0,
      wattageMax: Infinity,
      sort: 'featured'
    };
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filters input[type="number"]').forEach(input => input.value = '');
    const sortSelect = document.querySelector('.sort-bar__select');
    if (sortSelect) sortSelect.value = 'featured';
    applyFilters();
  }

  function updateResultsCount() {
    const el = document.querySelector('.sort-bar__results');
    if (el) {
      el.textContent = `${filteredProducts.length} produse gasite`;
    }
  }

  function getAll() {
    return allProducts;
  }

  function getById(id) {
    return allProducts.find(p => p.id === id);
  }

  function getFeatured() {
    return allProducts.filter(p => p.featured);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.products-grid')) {
      init();
    }
  });

  return { init, clearFilters, getAll, getById, getFeatured, applyFilters };
})();
