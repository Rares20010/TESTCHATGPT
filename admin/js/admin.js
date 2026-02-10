/* ============================================
   SolarTech Pro - Admin CMS Application
   Single Page Application with vanilla JS
   ============================================ */

const Admin = (() => {
  let currentUser = null;
  let currentPage = 'dashboard';

  // ==========================================
  // API Helper
  // ==========================================
  async function api(url, options = {}) {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options
    };
    if (options.headers) {
      config.headers = { ...config.headers, ...options.headers };
    }
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const res = await fetch(url, config);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Non-JSON response from', url, ':', text.substring(0, 200));
      throw new Error('Raspuns invalid de la server. Verificati consola.');
    }
    if (!res.ok) throw new Error(data.error || 'Eroare necunoscuta');
    return data;
  }

  // ==========================================
  // Toast
  // ==========================================
  function toast(message, type = 'success') {
    document.querySelectorAll('.admin-toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = `admin-toast admin-toast--${type}`;
    const icon = type === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    el.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('admin-toast--visible'));
    setTimeout(() => {
      el.classList.remove('admin-toast--visible');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ==========================================
  // SVG Icons
  // ==========================================
  const icons = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
    categories: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    blog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    revenue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  // ==========================================
  // Init
  // ==========================================
  async function init() {
    try {
      const auth = await api('/api/auth/me');
      if (auth.authenticated) {
        currentUser = auth.user;
        renderApp();
        navigate(window.location.hash.slice(1) || 'dashboard');
      } else {
        renderLogin();
      }
    } catch {
      renderLogin();
    }
  }

  // ==========================================
  // Login Page
  // ==========================================
  function renderLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-card__logo">
            ${icons.sun}
            <h1>SolarTech Pro</h1>
            <p>Panou de Administrare</p>
          </div>
          <div class="login-error" id="login-error"></div>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Utilizator</label>
              <input type="text" id="login-user" class="form-input" placeholder="admin" autofocus required>
            </div>
            <div class="form-group">
              <label class="form-label">Parola</label>
              <input type="password" id="login-pass" class="form-input" placeholder="Parola" required>
            </div>
            <button type="submit" class="btn btn--primary btn--full btn--lg" style="margin-top:8px;">Autentificare</button>
          </form>
        </div>
      </div>`;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('login-error');
      try {
        const result = await api('/api/auth/login', {
          method: 'POST',
          body: {
            username: document.getElementById('login-user').value,
            password: document.getElementById('login-pass').value
          }
        });
        currentUser = result.user;
        renderApp();
        navigate('dashboard');
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.add('login-error--visible');
      }
    });
  }

  // ==========================================
  // App Shell
  // ==========================================
  function renderApp() {
    document.getElementById('app').innerHTML = `
      <div class="admin-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar__logo">${icons.sun} SolarTech Pro</div>
          <nav class="sidebar__nav">
            <div class="sidebar__section">Principal</div>
            <a href="#dashboard" class="sidebar__link" data-page="dashboard">${icons.dashboard} Dashboard</a>
            <div class="sidebar__section">Continut</div>
            <a href="#products" class="sidebar__link" data-page="products">${icons.products} Produse</a>
            <a href="#categories" class="sidebar__link" data-page="categories">${icons.categories} Categorii</a>
            <a href="#orders" class="sidebar__link" data-page="orders">${icons.orders} Comenzi <span class="sidebar__badge" id="orders-badge" style="display:none">0</span></a>
            <a href="#blog" class="sidebar__link" data-page="blog">${icons.blog} Blog</a>
            <div class="sidebar__section">Sistem</div>
            <a href="#settings" class="sidebar__link" data-page="settings">${icons.settings} Setari</a>
          </nav>
          <a href="/" target="_blank" class="sidebar__store-link">${icons.store} Vezi Magazinul</a>
        </aside>
        <div class="main-content">
          <header class="top-header">
            <div class="top-header__left">
              <h2 class="top-header__title" id="page-title">Dashboard</h2>
            </div>
            <div class="top-header__right">
              <div class="top-header__user">
                <div class="top-header__avatar">${(currentUser.name || 'A').charAt(0)}</div>
                <span>${currentUser.name || currentUser.username}</span>
              </div>
              <button class="top-header__logout" id="logout-btn">Deconectare</button>
            </div>
          </header>
          <div class="page-content" id="page-content"></div>
        </div>
      </div>`;

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await api('/api/auth/logout', { method: 'POST' });
      currentUser = null;
      renderLogin();
    });

    // Navigation
    document.querySelectorAll('.sidebar__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(link.dataset.page);
      });
    });

    // Hash change
    window.addEventListener('hashchange', () => {
      navigate(window.location.hash.slice(1) || 'dashboard');
    });
  }

  // ==========================================
  // Router
  // ==========================================
  function navigate(page) {
    currentPage = page;
    window.location.hash = page;

    // Update sidebar
    document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
    const active = document.querySelector(`.sidebar__link[data-page="${page}"]`);
    if (active) active.classList.add('sidebar__link--active');

    // Page titles
    const titles = {
      dashboard: 'Dashboard',
      products: 'Produse',
      'product-edit': 'Editare Produs',
      'product-new': 'Produs Nou',
      categories: 'Categorii',
      orders: 'Comenzi',
      blog: 'Articole Blog',
      'blog-edit': 'Editare Articol',
      'blog-new': 'Articol Nou',
      settings: 'Setari'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titles[page] || 'Admin';

    // Route
    const content = document.getElementById('page-content');
    if (!content) return;

    if (page === 'dashboard') renderDashboard(content);
    else if (page === 'products') renderProducts(content);
    else if (page.startsWith('product-edit:')) renderProductForm(content, page.split(':')[1]);
    else if (page === 'product-new') renderProductForm(content, null);
    else if (page === 'categories') renderCategories(content);
    else if (page === 'orders') renderOrders(content);
    else if (page === 'blog') renderBlog(content);
    else if (page.startsWith('blog-edit:')) renderBlogForm(content, page.split(':')[1]);
    else if (page === 'blog-new') renderBlogForm(content, null);
    else if (page === 'settings') renderSettings(content);
    else renderDashboard(content);
  }

  // ==========================================
  // Dashboard
  // ==========================================
  async function renderDashboard(container) {
    container.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner" style="margin:0 auto;width:32px;height:32px;border:3px solid #E9ECEF;border-top-color:#0066CC;border-radius:50%;animation:spin .6s linear infinite;"></div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';

    try {
      const data = await api('/api/dashboard');
      const s = data.stats;

      container.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--blue">${icons.products}</div>
            <div><div class="stat-card__value">${s.totalProducts}</div><div class="stat-card__label">Produse</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--green">${icons.orders}</div>
            <div><div class="stat-card__value">${s.totalOrders}</div><div class="stat-card__label">Comenzi</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--orange">${icons.revenue}</div>
            <div><div class="stat-card__value">${formatPrice(s.totalRevenue)}</div><div class="stat-card__label">Venituri totale</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--red">${icons.blog}</div>
            <div><div class="stat-card__value">${s.totalPosts}</div><div class="stat-card__label">Articole Blog</div></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="card">
            <div class="card__header"><h3 class="card__title">Comenzi Recente</h3></div>
            <div class="card__body" style="padding:0;">
              ${data.recentOrders.length === 0
                ? '<div class="empty-state"><p>Nicio comanda inca.</p></div>'
                : `<table class="data-table"><thead><tr><th>ID</th><th>Client</th><th>Total</th><th>Status</th></tr></thead><tbody>
                  ${data.recentOrders.map(o => `<tr>
                    <td><strong>${o.id}</strong></td>
                    <td>${o.customer?.firstName || ''} ${o.customer?.lastName || ''}</td>
                    <td>${formatPrice(o.total)}</td>
                    <td>${statusBadge(o.status)}</td>
                  </tr>`).join('')}
                </tbody></table>`}
            </div>
          </div>
          <div class="card">
            <div class="card__header"><h3 class="card__title">Produse per Categorie</h3></div>
            <div class="card__body">
              ${Object.entries(data.productsByCategory).map(([cat, count]) => `
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F1F3F5;">
                  <span>${categoryLabel(cat)}</span>
                  <strong>${count}</strong>
                </div>
              `).join('')}
              ${Object.keys(data.productsByCategory).length === 0 ? '<div class="empty-state"><p>Niciun produs.</p></div>' : ''}
            </div>
          </div>
        </div>`;

      // Update orders badge
      if (s.pendingOrders > 0) {
        const badge = document.getElementById('orders-badge');
        if (badge) { badge.textContent = s.pendingOrders; badge.style.display = ''; }
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><p>Eroare: ${err.message}</p></div>`;
    }
  }

  // ==========================================
  // Products List
  // ==========================================
  async function renderProducts(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-header__title">Produse</h2>
        <div class="page-header__actions">
          <button class="btn btn--primary" id="add-product-btn">${icons.plus} Adauga Produs</button>
        </div>
      </div>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="table-search">${icons.search}<input type="text" id="product-search" placeholder="Cauta produse..."></div>
        </div>
        <div id="products-table-body"><div style="text-align:center;padding:40px;">Se incarca...</div></div>
      </div>`;

    document.getElementById('add-product-btn').addEventListener('click', () => navigate('product-new'));

    const products = await api('/api/products');
    renderProductsTable(products);

    document.getElementById('product-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
      renderProductsTable(filtered);
    });
  }

  function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (products.length === 0) {
      tbody.innerHTML = '<div class="empty-state">' + icons.products + '<h3>Niciun produs</h3><p>Adaugati primul produs.</p></div>';
      return;
    }
    tbody.innerHTML = `
      <table class="data-table"><thead><tr>
        <th>Imagine</th><th>Produs</th><th>Categorie</th><th>Pret</th><th>Stoc</th><th>Recomandat</th><th>Actiuni</th>
      </tr></thead><tbody>
        ${products.map(p => `<tr>
          <td><div class="data-table__img">${p.images?.[0] ? `<img src="${p.images[0]}" alt="">` : icons.products}</div></td>
          <td><strong>${p.name}</strong><br><span style="font-size:11px;color:#868E96;">${p.brand}</span></td>
          <td>${categoryLabel(p.category)}</td>
          <td><strong>${formatPrice(p.price)}</strong>${p.originalPrice ? `<br><s style="font-size:11px;color:#ADB5BD;">${formatPrice(p.originalPrice)}</s>` : ''}</td>
          <td>${p.inStock ? '<span class="badge badge--green">In Stoc</span>' : '<span class="badge badge--red">Epuizat</span>'}</td>
          <td>${p.featured ? '<span class="badge badge--blue">Da</span>' : '<span class="badge badge--gray">Nu</span>'}</td>
          <td><div class="data-table__actions">
            <button title="Editeaza" onclick="Admin.navigate('product-edit:${p.id}')">${icons.edit}</button>
            <button title="Duplica" data-dup="${p.id}">${icons.copy}</button>
            <button title="Sterge" class="action-delete" data-del-prod="${p.id}">${icons.trash}</button>
          </div></td>
        </tr>`).join('')}
      </tbody></table>`;

    // Bind delete
    tbody.querySelectorAll('[data-del-prod]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Sigur doriti sa stergeti acest produs?')) return;
        try {
          await api(`/api/products/${btn.dataset.delProd}`, { method: 'DELETE' });
          toast('Produsul a fost sters.');
          renderProducts(document.getElementById('page-content'));
        } catch (err) { toast(err.message, 'error'); }
      });
    });

    // Bind duplicate
    tbody.querySelectorAll('[data-dup]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await api(`/api/products/${btn.dataset.dup}/duplicate`, { method: 'POST' });
          toast('Produsul a fost duplicat.');
          renderProducts(document.getElementById('page-content'));
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  // ==========================================
  // Product Form (Add/Edit)
  // ==========================================
  async function renderProductForm(container, productId) {
    let product = { name:'', brand:'', category:'', price:'', originalPrice:'', shortDescription:'', description:'', specs:{}, images:[], inStock:true, featured:false, tags:[], rating:0, reviewCount:0 };
    let categories = [];

    try {
      categories = await api('/api/categories');
      if (productId) product = await api(`/api/products/${productId}`);
    } catch (err) { toast(err.message, 'error'); }

    const isEdit = !!productId;
    const specs = product.specs || {};

    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-header__title">${isEdit ? 'Editare Produs' : 'Produs Nou'}</h2>
        <div class="page-header__actions">
          <button class="btn btn--outline" onclick="Admin.navigate('products')">Anuleaza</button>
          <button class="btn btn--primary" id="save-product-btn">${icons.check} Salveaza</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
        <div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card__header"><h3 class="card__title">Informatii Generale</h3></div>
            <div class="card__body">
              <div class="form-group">
                <label class="form-label">Nume Produs <span>*</span></label>
                <input type="text" id="p-name" class="form-input" value="${esc(product.name)}">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Brand</label>
                  <input type="text" id="p-brand" class="form-input" value="${esc(product.brand)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Categorie</label>
                  <select id="p-category" class="form-select">
                    <option value="">Selecteaza...</option>
                    ${categories.map(c => `<option value="${c.id}" ${c.id === product.category ? 'selected' : ''}>${c.name}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Descriere Scurta</label>
                <textarea id="p-short-desc" class="form-textarea" rows="2">${esc(product.shortDescription)}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Descriere Completa</label>
                <textarea id="p-description" class="form-textarea" rows="5">${esc(product.description)}</textarea>
              </div>
            </div>
          </div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card__header"><h3 class="card__title">Specificatii Tehnice</h3></div>
            <div class="card__body">
              <div class="form-row">
                <div class="form-group"><label class="form-label">Putere (W)</label><input type="number" id="sp-wattage" class="form-input" value="${specs.wattage||''}"></div>
                <div class="form-group"><label class="form-label">Eficienta (%)</label><input type="number" step="0.1" id="sp-efficiency" class="form-input" value="${specs.efficiency||''}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Dimensiuni</label><input type="text" id="sp-dimensions" class="form-input" value="${esc(specs.dimensions||'')}"></div>
                <div class="form-group"><label class="form-label">Greutate (kg)</label><input type="number" step="0.1" id="sp-weight" class="form-input" value="${specs.weight||''}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Tensiune (V)</label><input type="number" step="0.1" id="sp-voltage" class="form-input" value="${specs.voltage||''}"></div>
                <div class="form-group"><label class="form-label">Garantie (ani)</label><input type="number" id="sp-warranty" class="form-input" value="${specs.warranty||''}"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Coef. Temperatura</label><input type="text" id="sp-temp" class="form-input" value="${esc(specs.temperatureCoefficient||'')}"></div>
                <div class="form-group"><label class="form-label">Capacitate</label><input type="text" id="sp-capacity" class="form-input" value="${esc(specs.capacity||'')}"></div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card__header"><h3 class="card__title">Pret</h3></div>
            <div class="card__body">
              <div class="form-group">
                <label class="form-label">Pret (RON) <span>*</span></label>
                <input type="number" step="0.01" id="p-price" class="form-input" value="${product.price||''}">
              </div>
              <div class="form-group">
                <label class="form-label">Pret Vechi (RON)</label>
                <input type="number" step="0.01" id="p-old-price" class="form-input" value="${product.originalPrice||''}">
                <div class="form-hint">Lasa gol daca nu e reducere</div>
              </div>
            </div>
          </div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card__header"><h3 class="card__title">Status</h3></div>
            <div class="card__body">
              <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;">
                <span class="form-label" style="margin:0;">In Stoc</span>
                <label class="form-switch"><input type="checkbox" id="p-instock" ${product.inStock ? 'checked' : ''}><span class="form-switch__slider"></span></label>
              </div>
              <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;">
                <span class="form-label" style="margin:0;">Recomandat (Featured)</span>
                <label class="form-switch"><input type="checkbox" id="p-featured" ${product.featured ? 'checked' : ''}><span class="form-switch__slider"></span></label>
              </div>
              <div class="form-group">
                <label class="form-label">Rating</label>
                <input type="number" step="0.1" min="0" max="5" id="p-rating" class="form-input" value="${product.rating||0}">
              </div>
              <div class="form-group">
                <label class="form-label">Numar Recenzii</label>
                <input type="number" id="p-reviews" class="form-input" value="${product.reviewCount||0}">
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card__header"><h3 class="card__title">Imagini</h3></div>
            <div class="card__body">
              <div class="image-upload" id="image-upload-area">
                ${icons.upload}
                <div class="image-upload__text">Click sau trage imagini aici</div>
                <div class="image-upload__hint">JPG, PNG, WebP - max 10MB</div>
              </div>
              <input type="file" id="image-file-input" accept="image/*" multiple style="display:none;">
              <div class="image-preview-grid" id="image-previews">
                ${(product.images||[]).map(img => `
                  <div class="image-preview" data-url="${img}">
                    <img src="${img}" alt="">
                    <button class="image-preview__remove" data-remove-img="${img}">&times;</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    // Image upload
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('image-file-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      for (const file of fileInput.files) {
        const formData = new FormData();
        formData.append('image', file);
        try {
          const result = await fetch('/api/upload?type=products', { method: 'POST', body: formData });
          const data = await result.json();
          if (data.url) addImagePreview(data.url);
        } catch { toast('Eroare la incarcare imagine.', 'error'); }
      }
      fileInput.value = '';
    });

    // Remove image
    document.querySelectorAll('[data-remove-img]').forEach(btn => {
      btn.addEventListener('click', () => { btn.closest('.image-preview').remove(); });
    });

    // Save
    document.getElementById('save-product-btn').addEventListener('click', async () => {
      const images = [...document.querySelectorAll('.image-preview')].map(el => el.dataset.url);

      const body = {
        name: document.getElementById('p-name').value,
        brand: document.getElementById('p-brand').value,
        category: document.getElementById('p-category').value,
        price: document.getElementById('p-price').value,
        originalPrice: document.getElementById('p-old-price').value || null,
        shortDescription: document.getElementById('p-short-desc').value,
        description: document.getElementById('p-description').value,
        inStock: document.getElementById('p-instock').checked,
        featured: document.getElementById('p-featured').checked,
        rating: document.getElementById('p-rating').value,
        reviewCount: document.getElementById('p-reviews').value,
        images,
        specs: buildSpecs()
      };

      if (!body.name) { toast('Numele produsului este obligatoriu.', 'error'); return; }
      if (!body.price) { toast('Pretul este obligatoriu.', 'error'); return; }

      try {
        if (isEdit) {
          await api(`/api/products/${productId}`, { method: 'PUT', body });
          toast('Produsul a fost actualizat.');
        } else {
          await api('/api/products', { method: 'POST', body });
          toast('Produsul a fost creat.');
        }
        navigate('products');
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  function buildSpecs() {
    const s = {};
    const w = document.getElementById('sp-wattage')?.value; if (w) s.wattage = parseFloat(w);
    const e = document.getElementById('sp-efficiency')?.value; if (e) s.efficiency = parseFloat(e);
    const d = document.getElementById('sp-dimensions')?.value; if (d) s.dimensions = d;
    const wt = document.getElementById('sp-weight')?.value; if (wt) s.weight = parseFloat(wt);
    const v = document.getElementById('sp-voltage')?.value; if (v) s.voltage = parseFloat(v);
    const wr = document.getElementById('sp-warranty')?.value; if (wr) s.warranty = parseInt(wr);
    const t = document.getElementById('sp-temp')?.value; if (t) s.temperatureCoefficient = t;
    const c = document.getElementById('sp-capacity')?.value; if (c) s.capacity = c;
    return s;
  }

  function addImagePreview(url) {
    const grid = document.getElementById('image-previews');
    const div = document.createElement('div');
    div.className = 'image-preview';
    div.dataset.url = url;
    div.innerHTML = `<img src="${url}" alt=""><button class="image-preview__remove">&times;</button>`;
    div.querySelector('.image-preview__remove').addEventListener('click', () => div.remove());
    grid.appendChild(div);
  }

  // ==========================================
  // Categories
  // ==========================================
  async function renderCategories(container) {
    const categories = await api('/api/categories');

    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-header__title">Categorii</h2>
        <button class="btn btn--primary" id="add-cat-btn">${icons.plus} Adauga Categorie</button>
      </div>
      <div class="table-container">
        <table class="data-table"><thead><tr><th>Ordine</th><th>Nume</th><th>Slug</th><th>Descriere</th><th>Activa</th><th>Actiuni</th></tr></thead>
        <tbody id="cat-tbody">
          ${categories.map(c => `<tr>
            <td>${c.order || '-'}</td>
            <td><strong>${c.name}</strong></td>
            <td><code style="font-size:11px;background:#F1F3F5;padding:2px 6px;border-radius:3px;">${c.slug || c.id}</code></td>
            <td style="max-width:300px;color:#868E96;">${c.description || '-'}</td>
            <td>${c.active !== false ? '<span class="badge badge--green">Da</span>' : '<span class="badge badge--gray">Nu</span>'}</td>
            <td><div class="data-table__actions">
              <button title="Editeaza" data-edit-cat='${JSON.stringify(c).replace(/'/g,"&#39;")}'>${icons.edit}</button>
              <button title="Sterge" class="action-delete" data-del-cat="${c.id}">${icons.trash}</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>
      </div>
      <div class="modal-overlay" id="cat-modal">
        <div class="modal">
          <div class="modal__header"><h3 class="modal__title" id="cat-modal-title">Categorie Noua</h3><button class="modal__close" id="cat-modal-close">${icons.x}</button></div>
          <div class="modal__body">
            <div class="form-group"><label class="form-label">Nume <span>*</span></label><input type="text" id="cat-name" class="form-input"></div>
            <div class="form-group"><label class="form-label">Descriere</label><textarea id="cat-desc" class="form-textarea" rows="2"></textarea></div>
            <div class="form-group"><label class="form-label">Ordine</label><input type="number" id="cat-order" class="form-input" value="1"></div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" id="cat-cancel">Anuleaza</button>
            <button class="btn btn--primary" id="cat-save">Salveaza</button>
          </div>
        </div>
      </div>`;

    let editingCatId = null;
    const modal = document.getElementById('cat-modal');
    const openModal = (cat = null) => {
      editingCatId = cat ? cat.id : null;
      document.getElementById('cat-modal-title').textContent = cat ? 'Editare Categorie' : 'Categorie Noua';
      document.getElementById('cat-name').value = cat ? cat.name : '';
      document.getElementById('cat-desc').value = cat ? (cat.description||'') : '';
      document.getElementById('cat-order').value = cat ? (cat.order||1) : categories.length + 1;
      modal.classList.add('modal-overlay--visible');
    };
    const closeModal = () => { modal.classList.remove('modal-overlay--visible'); };

    document.getElementById('add-cat-btn').addEventListener('click', () => openModal());
    document.getElementById('cat-modal-close').addEventListener('click', closeModal);
    document.getElementById('cat-cancel').addEventListener('click', closeModal);

    document.getElementById('cat-save').addEventListener('click', async () => {
      const body = {
        name: document.getElementById('cat-name').value,
        description: document.getElementById('cat-desc').value,
        order: document.getElementById('cat-order').value
      };
      if (!body.name) { toast('Numele este obligatoriu.', 'error'); return; }
      try {
        if (editingCatId) await api(`/api/categories/${editingCatId}`, { method: 'PUT', body });
        else await api('/api/categories', { method: 'POST', body });
        toast(editingCatId ? 'Categoria a fost actualizata.' : 'Categoria a fost creata.');
        closeModal();
        renderCategories(container);
      } catch (err) { toast(err.message, 'error'); }
    });

    document.querySelectorAll('[data-edit-cat]').forEach(btn => {
      btn.addEventListener('click', () => openModal(JSON.parse(btn.dataset.editCat)));
    });

    document.querySelectorAll('[data-del-cat]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Sigur doriti sa stergeti aceasta categorie?')) return;
        try {
          await api(`/api/categories/${btn.dataset.delCat}`, { method: 'DELETE' });
          toast('Categoria a fost stearsa.');
          renderCategories(container);
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  // ==========================================
  // Orders
  // ==========================================
  async function renderOrders(container) {
    const orders = await api('/api/orders');

    container.innerHTML = `
      <div class="page-header"><h2 class="page-header__title">Comenzi (${orders.length})</h2></div>
      <div class="table-container">
        ${orders.length === 0
          ? '<div class="empty-state">' + icons.orders + '<h3>Nicio comanda</h3><p>Comenzile vor aparea aici cand clientii plaseaza comenzi.</p></div>'
          : `<table class="data-table"><thead><tr><th>ID</th><th>Client</th><th>Produse</th><th>Total</th><th>Plata</th><th>Status</th><th>Data</th><th>Actiuni</th></tr></thead><tbody>
          ${orders.map(o => `<tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer?.firstName||''} ${o.customer?.lastName||''}<br><span style="font-size:11px;color:#868E96;">${o.customer?.email||''}</span></td>
            <td>${(o.items||[]).length} produse</td>
            <td><strong>${formatPrice(o.total)}</strong></td>
            <td>${paymentLabel(o.paymentMethod)}</td>
            <td><select class="form-select" data-order-status="${o.id}" style="width:auto;padding:4px 8px;font-size:12px;">
              ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}
            </select></td>
            <td style="font-size:12px;color:#868E96;">${new Date(o.createdAt).toLocaleDateString('ro-RO')}</td>
            <td><div class="data-table__actions">
              <button title="Sterge" class="action-delete" data-del-order="${o.id}">${icons.trash}</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>`}
      </div>`;

    // Status change
    document.querySelectorAll('[data-order-status]').forEach(sel => {
      sel.addEventListener('change', async () => {
        try {
          await api(`/api/orders/${sel.dataset.orderStatus}/status`, { method: 'PUT', body: { status: sel.value } });
          toast('Statusul comenzii a fost actualizat.');
        } catch (err) { toast(err.message, 'error'); }
      });
    });

    // Delete order
    document.querySelectorAll('[data-del-order]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Sigur doriti sa stergeti aceasta comanda?')) return;
        try {
          await api(`/api/orders/${btn.dataset.delOrder}`, { method: 'DELETE' });
          toast('Comanda a fost stearsa.');
          renderOrders(container);
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  // ==========================================
  // Blog
  // ==========================================
  async function renderBlog(container) {
    const posts = await api('/api/blog');

    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-header__title">Articole Blog (${posts.length})</h2>
        <button class="btn btn--primary" id="add-post-btn">${icons.plus} Articol Nou</button>
      </div>
      <div class="table-container">
        ${posts.length === 0
          ? '<div class="empty-state">' + icons.blog + '<h3>Niciun articol</h3><p>Creati primul articol de blog.</p></div>'
          : `<table class="data-table"><thead><tr><th>Titlu</th><th>Categorie</th><th>Data</th><th>Timp Lectura</th><th>Actiuni</th></tr></thead><tbody>
          ${posts.map(p => `<tr>
            <td><strong>${p.title}</strong></td>
            <td><span class="badge badge--blue">${blogCategoryLabel(p.category)}</span></td>
            <td>${p.date}</td>
            <td>${p.readTime||'-'}</td>
            <td><div class="data-table__actions">
              <button title="Editeaza" onclick="Admin.navigate('blog-edit:${p.id}')">${icons.edit}</button>
              <button title="Sterge" class="action-delete" data-del-post="${p.id}">${icons.trash}</button>
            </div></td>
          </tr>`).join('')}
        </tbody></table>`}
      </div>`;

    document.getElementById('add-post-btn').addEventListener('click', () => navigate('blog-new'));

    document.querySelectorAll('[data-del-post]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Sigur doriti sa stergeti acest articol?')) return;
        try {
          await api(`/api/blog/${btn.dataset.delPost}`, { method: 'DELETE' });
          toast('Articolul a fost sters.');
          renderBlog(container);
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  // Blog Form
  async function renderBlogForm(container, postId) {
    let post = { title:'', excerpt:'', content:'', category:'ghiduri', date: new Date().toISOString().split('T')[0], readTime:'5 min', published:true };
    if (postId) {
      try { post = await api(`/api/blog/${postId}`); } catch (err) { toast(err.message, 'error'); }
    }
    const isEdit = !!postId;

    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-header__title">${isEdit ? 'Editare Articol' : 'Articol Nou'}</h2>
        <div class="page-header__actions">
          <button class="btn btn--outline" onclick="Admin.navigate('blog')">Anuleaza</button>
          <button class="btn btn--primary" id="save-post-btn">${icons.check} Salveaza</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
        <div class="card">
          <div class="card__body">
            <div class="form-group"><label class="form-label">Titlu <span>*</span></label><input type="text" id="bl-title" class="form-input" value="${esc(post.title)}"></div>
            <div class="form-group"><label class="form-label">Rezumat</label><textarea id="bl-excerpt" class="form-textarea" rows="3">${esc(post.excerpt)}</textarea></div>
            <div class="form-group"><label class="form-label">Continut</label><textarea id="bl-content" class="form-textarea" rows="15">${esc(post.content||'')}</textarea></div>
          </div>
        </div>
        <div>
          <div class="card" style="margin-bottom:20px;">
            <div class="card__body">
              <div class="form-group"><label class="form-label">Categorie</label>
                <select id="bl-category" class="form-select">
                  <option value="ghiduri" ${post.category==='ghiduri'?'selected':''}>Ghiduri</option>
                  <option value="tehnologie" ${post.category==='tehnologie'?'selected':''}>Tehnologie</option>
                  <option value="legislatie" ${post.category==='legislatie'?'selected':''}>Legislatie</option>
                  <option value="sustenabilitate" ${post.category==='sustenabilitate'?'selected':''}>Sustenabilitate</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Data</label><input type="date" id="bl-date" class="form-input" value="${post.date}"></div>
              <div class="form-group"><label class="form-label">Timp Lectura</label><input type="text" id="bl-readtime" class="form-input" value="${post.readTime||'5 min'}"></div>
              <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;">
                <span class="form-label" style="margin:0;">Publicat</span>
                <label class="form-switch"><input type="checkbox" id="bl-published" ${post.published!==false?'checked':''}><span class="form-switch__slider"></span></label>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    document.getElementById('save-post-btn').addEventListener('click', async () => {
      const body = {
        title: document.getElementById('bl-title').value,
        excerpt: document.getElementById('bl-excerpt').value,
        content: document.getElementById('bl-content').value,
        category: document.getElementById('bl-category').value,
        date: document.getElementById('bl-date').value,
        readTime: document.getElementById('bl-readtime').value,
        published: document.getElementById('bl-published').checked
      };
      if (!body.title) { toast('Titlul este obligatoriu.', 'error'); return; }
      try {
        if (isEdit) await api(`/api/blog/${postId}`, { method: 'PUT', body });
        else await api('/api/blog', { method: 'POST', body });
        toast(isEdit ? 'Articolul a fost actualizat.' : 'Articolul a fost creat.');
        navigate('blog');
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  // ==========================================
  // Settings
  // ==========================================
  async function renderSettings(container) {
    let settings = {};
    try { settings = await api('/api/settings'); } catch {}

    container.innerHTML = `
      <div class="page-header"><h2 class="page-header__title">Setari Magazin</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="card">
          <div class="card__header"><h3 class="card__title">General</h3></div>
          <div class="card__body">
            <div class="form-group"><label class="form-label">Nume Magazin</label><input type="text" id="s-name" class="form-input" value="${esc(settings.siteName||'')}"></div>
            <div class="form-group"><label class="form-label">Descriere</label><textarea id="s-desc" class="form-textarea" rows="2">${esc(settings.siteDescription||'')}</textarea></div>
            <div class="form-group"><label class="form-label">Moneda</label><input type="text" id="s-currency" class="form-input" value="${esc(settings.currency||'RON')}"></div>
          </div>
        </div>
        <div class="card">
          <div class="card__header"><h3 class="card__title">Contact</h3></div>
          <div class="card__body">
            <div class="form-group"><label class="form-label">Email</label><input type="email" id="s-email" class="form-input" value="${esc(settings.email||'')}"></div>
            <div class="form-group"><label class="form-label">Telefon</label><input type="text" id="s-phone" class="form-input" value="${esc(settings.phone||'')}"></div>
            <div class="form-group"><label class="form-label">Adresa</label><input type="text" id="s-address" class="form-input" value="${esc(settings.address||'')}"></div>
          </div>
        </div>
        <div class="card">
          <div class="card__header"><h3 class="card__title">Livrare & Plata</h3></div>
          <div class="card__body">
            <div class="form-group"><label class="form-label">Transport gratuit de la (RON)</label><input type="number" id="s-freeship" class="form-input" value="${settings.freeShippingThreshold||5000}"></div>
            <div class="form-group"><label class="form-label">TVA (%)</label><input type="number" id="s-vat" class="form-input" value="${settings.vatRate||19}"></div>
            <div class="form-group"><label class="form-label">Taxa Ramburs (RON)</label><input type="number" id="s-cod" class="form-input" value="${settings.codFee||10}"></div>
          </div>
        </div>
        <div class="card">
          <div class="card__header"><h3 class="card__title">Schimbare Parola</h3></div>
          <div class="card__body">
            <div class="form-group"><label class="form-label">Parola Curenta</label><input type="password" id="s-old-pass" class="form-input"></div>
            <div class="form-group"><label class="form-label">Parola Noua</label><input type="password" id="s-new-pass" class="form-input"></div>
            <button class="btn btn--outline" id="change-pass-btn">Schimba Parola</button>
          </div>
        </div>
      </div>
      <div style="margin-top:20px;text-align:right;">
        <button class="btn btn--primary btn--lg" id="save-settings-btn">${icons.check} Salveaza Setarile</button>
      </div>`;

    document.getElementById('save-settings-btn').addEventListener('click', async () => {
      const body = {
        siteName: document.getElementById('s-name').value,
        siteDescription: document.getElementById('s-desc').value,
        currency: document.getElementById('s-currency').value,
        email: document.getElementById('s-email').value,
        phone: document.getElementById('s-phone').value,
        address: document.getElementById('s-address').value,
        freeShippingThreshold: parseFloat(document.getElementById('s-freeship').value),
        vatRate: parseFloat(document.getElementById('s-vat').value),
        codFee: parseFloat(document.getElementById('s-cod').value)
      };
      try {
        await api('/api/settings', { method: 'PUT', body });
        toast('Setarile au fost salvate.');
      } catch (err) { toast(err.message, 'error'); }
    });

    document.getElementById('change-pass-btn').addEventListener('click', async () => {
      const currentPassword = document.getElementById('s-old-pass').value;
      const newPassword = document.getElementById('s-new-pass').value;
      if (!currentPassword || !newPassword) { toast('Completati ambele campuri.', 'error'); return; }
      try {
        await api('/api/auth/password', { method: 'PUT', body: { currentPassword, newPassword } });
        toast('Parola a fost schimbata.');
        document.getElementById('s-old-pass').value = '';
        document.getElementById('s-new-pass').value = '';
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  // ==========================================
  // Helpers
  // ==========================================
  function formatPrice(amount) {
    return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0) + ' RON';
  }

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function categoryLabel(cat) {
    const labels = { monocrystalline:'Monocristalin', polycrystalline:'Policristalin', inverter:'Invertoare', battery:'Baterii', mounting:'Montaj' };
    return labels[cat] || cat;
  }

  function blogCategoryLabel(cat) {
    const labels = { ghiduri:'Ghiduri', tehnologie:'Tehnologie', legislatie:'Legislatie', sustenabilitate:'Sustenabilitate' };
    return labels[cat] || cat;
  }

  function statusBadge(status) {
    const map = { pending:'badge--orange', confirmed:'badge--blue', processing:'badge--blue', shipped:'badge--blue', delivered:'badge--green', cancelled:'badge--red' };
    return `<span class="badge ${map[status]||'badge--gray'}">${statusLabel(status)}</span>`;
  }

  function statusLabel(status) {
    const labels = { pending:'In asteptare', confirmed:'Confirmata', processing:'In procesare', shipped:'Expediata', delivered:'Livrata', cancelled:'Anulata' };
    return labels[status] || status;
  }

  function paymentLabel(method) {
    const labels = { card:'Card', 'bank-transfer':'Transfer', cod:'Ramburs' };
    return labels[method] || method || '-';
  }

  // Start
  init();

  // Public API
  return { navigate };
})();
