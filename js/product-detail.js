/* ============================================
   Product Detail Module
   Gallery, specs, add to cart from detail page
   ============================================ */

const ProductDetail = (() => {
  let currentProduct = null;

  async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
      showNotFound();
      return;
    }

    try {
      const response = await fetch('data/products.json');
      const products = await response.json();
      currentProduct = products.find(p => p.id === productId);

      if (!currentProduct) {
        showNotFound();
        return;
      }

      renderProduct();
      renderSpecs();
      renderRelated(products);
      bindEvents();
    } catch (e) {
      console.error('Failed to load product:', e);
    }
  }

  function renderProduct() {
    const p = currentProduct;

    // Breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
      const categoryNames = {
        'monocrystalline': 'Panouri Monocristaline',
        'polycrystalline': 'Panouri Policristaline',
        'inverter': 'Invertoare',
        'battery': 'Baterii',
        'mounting': 'Sisteme de Montaj'
      };
      breadcrumb.innerHTML = `
        <a href="index.html">Acasa</a>
        <span class="breadcrumb__separator">/</span>
        <a href="products.html">Produse</a>
        <span class="breadcrumb__separator">/</span>
        <a href="products.html?category=${p.category}">${categoryNames[p.category] || p.category}</a>
        <span class="breadcrumb__separator">/</span>
        <span>${p.name}</span>
      `;
    }

    // Brand
    const brand = document.querySelector('.product-info__brand');
    if (brand) brand.textContent = p.brand;

    // Name
    const name = document.querySelector('.product-info__name');
    if (name) name.textContent = p.name;

    // Rating
    const rating = document.querySelector('.product-info__rating');
    if (rating) {
      rating.innerHTML = `
        ${UI.renderStars(p.rating, 'lg')}
        <span class="product-info__review-count">${p.rating} (${p.reviewCount} recenzii)</span>
      `;
    }

    // Price
    const priceBox = document.querySelector('.product-info__price-box');
    if (priceBox) {
      const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
      priceBox.innerHTML = `
        <span class="product-info__price">${UI.formatPrice(p.price)}</span>
        ${p.originalPrice ? `<span class="product-info__price-old">${UI.formatPrice(p.originalPrice)}</span>` : ''}
        ${discount > 0 ? `<span class="product-info__discount">-${discount}%</span>` : ''}
      `;
    }

    // Description
    const desc = document.querySelector('.product-info__desc');
    if (desc) desc.textContent = p.description || p.shortDescription;

    // Stock status
    const stock = document.querySelector('.stock-status');
    if (stock) {
      stock.innerHTML = p.inStock
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> In Stoc'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/></svg> Stoc Epuizat';
      stock.className = `stock-status stock-status--${p.inStock ? 'in-stock' : 'out'}`;
    }

    // Page title
    document.title = `${p.name} - SolarTech Pro`;
  }

  function renderSpecs() {
    const p = currentProduct;
    if (!p.specs) return;

    // Spec Grid (quick view)
    const specGrid = document.querySelector('.spec-grid');
    if (specGrid) {
      const specItems = [];
      if (p.specs.wattage) specItems.push({ icon: 'watt', label: 'Putere', value: `${p.specs.wattage}W` });
      if (p.specs.efficiency) specItems.push({ icon: 'efficiency', label: 'Eficienta', value: `${p.specs.efficiency}%` });
      if (p.specs.dimensions) specItems.push({ icon: 'dimensions', label: 'Dimensiuni', value: p.specs.dimensions });
      if (p.specs.weight) specItems.push({ icon: 'weight', label: 'Greutate', value: `${p.specs.weight} kg` });
      if (p.specs.voltage) specItems.push({ icon: 'voltage', label: 'Tensiune', value: `${p.specs.voltage}V` });
      if (p.specs.warranty) specItems.push({ icon: 'warranty', label: 'Garantie', value: `${p.specs.warranty} ani` });
      if (p.specs.temperatureCoefficient) specItems.push({ icon: 'temperature', label: 'Coef. Temperatura', value: p.specs.temperatureCoefficient });
      if (p.specs.capacity) specItems.push({ icon: 'battery', label: 'Capacitate', value: p.specs.capacity });
      if (p.specs.power) specItems.push({ icon: 'watt', label: 'Putere', value: p.specs.power });

      specGrid.innerHTML = specItems.map(spec => `
        <div class="spec-item">
          <div class="spec-item__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div class="spec-item__label">${spec.label}</div>
            <div class="spec-item__value">${spec.value}</div>
          </div>
        </div>
      `).join('');
    }

    // Full Specs Table
    const specsTable = document.querySelector('.specs-table tbody');
    if (specsTable) {
      const specLabels = {
        wattage: 'Putere Nominala',
        efficiency: 'Eficienta',
        dimensions: 'Dimensiuni',
        weight: 'Greutate',
        voltage: 'Tensiune Maxima (Vmp)',
        temperatureCoefficient: 'Coeficient de Temperatura',
        warranty: 'Garantie',
        capacity: 'Capacitate',
        power: 'Putere Nominala',
        type: 'Tip',
        material: 'Material'
      };

      specsTable.innerHTML = Object.entries(p.specs)
        .filter(([_, val]) => val !== null && val !== undefined)
        .map(([key, val]) => {
          let displayVal = val;
          if (key === 'wattage') displayVal = `${val}W`;
          if (key === 'efficiency') displayVal = `${val}%`;
          if (key === 'weight') displayVal = `${val} kg`;
          if (key === 'voltage') displayVal = `${val}V`;
          if (key === 'warranty') displayVal = `${val} ani`;
          return `
            <tr>
              <td>${specLabels[key] || key}</td>
              <td>${displayVal}</td>
            </tr>`;
        }).join('');
    }
  }

  function renderRelated(products) {
    const container = document.querySelector('.related-products .products-grid');
    if (!container) return;

    const related = products
      .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 4);

    if (related.length === 0) return;

    container.innerHTML = related.map(p => `
      <div class="product-card">
        <a href="product-detail.html?id=${p.id}" class="product-card__image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="width:60px;height:60px;color:var(--color-gray-300)">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
        </a>
        <div class="product-card__body">
          <div class="product-card__brand">${p.brand}</div>
          <h3 class="product-card__name"><a href="product-detail.html?id=${p.id}">${p.name}</a></h3>
          <div class="product-card__footer">
            <span class="product-card__price">${UI.formatPrice(p.price)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function bindEvents() {
    // Add to Cart
    const addBtn = document.querySelector('.product-detail__add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const qtyInput = document.querySelector('.product-detail .qty-stepper__input');
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        Cart.addItem(currentProduct, qty);
        UI.showToast(`${currentProduct.name} a fost adaugat in cos!`);
      });
    }

    // Quantity Stepper
    const qtyMinus = document.querySelector('.product-detail .qty-stepper__btn--minus');
    const qtyPlus = document.querySelector('.product-detail .qty-stepper__btn--plus');
    const qtyInput = document.querySelector('.product-detail .qty-stepper__input');

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
      });
      qtyPlus.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
      });
    }

    // Tabs
    document.querySelectorAll('.tabs__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs__tab').forEach(t => t.classList.remove('tabs__tab--active'));
        document.querySelectorAll('.tabs__content').forEach(c => c.classList.remove('tabs__content--active'));
        tab.classList.add('tabs__tab--active');
        const target = document.querySelector(tab.dataset.target);
        if (target) target.classList.add('tabs__content--active');
      });
    });
  }

  function showNotFound() {
    const main = document.querySelector('.product-detail');
    if (main) {
      main.innerHTML = `
        <div class="container">
          <div class="empty-state">
            <h2 class="empty-state__title">Produsul nu a fost gasit</h2>
            <p class="empty-state__desc">Produsul cautat nu exista sau a fost eliminat.</p>
            <a href="products.html" class="btn btn--primary">Inapoi la Produse</a>
          </div>
        </div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.product-detail')) {
      init();
    }
  });

  return { init, getProduct: () => currentProduct };
})();
