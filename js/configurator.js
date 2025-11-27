const configuratorData = {
  bases: [
    { id: 't1', name: 'Tiny T1 • 6.0m', price: 42000, area: '21 m²' },
    { id: 't2', name: 'Tiny T2 • 7.2m', price: 49500, area: '27 m²' },
    { id: 't3', name: 'Tiny T3 • 8.4m', price: 56900, area: '32 m²' }
  ],
  finishes: [
    { id: 'scandi', name: 'Scandi Minimal', price: 0 },
    { id: 'nordic', name: 'Nordic Warm', price: 1800 },
    { id: 'industrial', name: 'Industrial Chic', price: 2200 }
  ],
  addOns: [
    { id: 'offgrid', name: 'Off-grid pack (solar + batteries)', price: 6200 },
    { id: 'deck', name: 'Covered deck 8 m²', price: 3600 },
    { id: 'sauna', name: 'Outdoor sauna module', price: 8400 },
    { id: 'furniture', name: 'Built-in furniture pack', price: 1900 },
    { id: 'winter', name: 'Winter insulation upgrade', price: 2100 }
  ]
};

const state = {
  base: configuratorData.bases[0].id,
  finish: configuratorData.finishes[0].id,
  addOns: new Set()
};

const currency = (value) => `${value.toLocaleString('ro-RO')} €`;

function renderOptions() {
  const baseContainer = document.querySelector('[data-options="base"]');
  const finishContainer = document.querySelector('[data-options="finish"]');
  const addOnContainer = document.querySelector('[data-options="add-on"]');

  const optionTemplate = (item, type) => `
    <div class="option-card" data-option data-type="${type}" data-id="${item.id}">
      <div class="option-card__label">
        <strong>${item.name}</strong>
        ${item.area ? `<small class="tag">${item.area}</small>` : ''}
      </div>
      <div class="option-card__price">${currency(item.price)}</div>
    </div>
  `;

  baseContainer.innerHTML = configuratorData.bases.map((item) => optionTemplate(item, 'base')).join('');
  finishContainer.innerHTML = configuratorData.finishes.map((item) => optionTemplate(item, 'finish')).join('');
  addOnContainer.innerHTML = configuratorData.addOns.map((item) => optionTemplate(item, 'add-on')).join('');

  updateActiveStates();
}

function updateActiveStates() {
  document.querySelectorAll('[data-option]').forEach((card) => {
    const type = card.dataset.type;
    const id = card.dataset.id;
    let active = false;

    if (type === 'base') active = state.base === id;
    if (type === 'finish') active = state.finish === id;
    if (type === 'add-on') active = state.addOns.has(id);

    card.classList.toggle('option-card--active', active);
  });
}

function attachOptionEvents() {
  document.querySelectorAll('[data-option]').forEach((card) => {
    card.addEventListener('click', () => {
      const { type, id } = card.dataset;
      if (type === 'base') state.base = id;
      if (type === 'finish') state.finish = id;
      if (type === 'add-on') {
        state.addOns.has(id) ? state.addOns.delete(id) : state.addOns.add(id);
      }
      updateActiveStates();
      updateSummary();
    });
  });
}

function updateSummary() {
  const base = configuratorData.bases.find((b) => b.id === state.base);
  const finish = configuratorData.finishes.find((f) => f.id === state.finish);
  const addOns = configuratorData.addOns.filter((a) => state.addOns.has(a.id));

  const subtotal = base.price + finish.price + addOns.reduce((sum, item) => sum + item.price, 0);

  document.querySelector('[data-summary="base"] .summary__value').textContent = `${base.name} (${currency(base.price)})`;
  document.querySelector('[data-summary="finish"] .summary__value').textContent = `${finish.name} (${currency(finish.price)})`;

  const addOnList = document.querySelector('[data-summary="addons"]');
  addOnList.innerHTML = addOns.length
    ? addOns.map((item) => `<li>${item.name} — ${currency(item.price)}</li>`).join('')
    : '<li>Nicio opțiune suplimentară selectată</li>';

  document.querySelector('[data-summary="total"]').textContent = currency(subtotal);
}

function initConfigurator() {
  const configurator = document.querySelector('[data-configurator]');
  if (!configurator) return;
  renderOptions();
  attachOptionEvents();
  updateSummary();
}

document.addEventListener('DOMContentLoaded', initConfigurator);
