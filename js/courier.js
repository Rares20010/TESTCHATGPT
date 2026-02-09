/* ============================================
   Courier Module
   Shipping options with weight-based cost calc
   ============================================ */

const Courier = (() => {
  const SHIPPING_KEY = 'shipping';

  // Courier definitions with weight-based pricing
  const couriers = [
    {
      id: 'fan-courier',
      name: 'Fan Courier',
      logo: 'FAN',
      eta: '1-2 zile lucratoare',
      basePrice: 19.99,
      pricePerKg: 2.5,     // RON per kg over 5kg
      freeThreshold: 5,     // kg included in base price
      freeShippingOver: 5000 // Free shipping over this subtotal
    },
    {
      id: 'cargus',
      name: 'Cargus',
      logo: 'CGS',
      eta: '2-3 zile lucratoare',
      basePrice: 14.99,
      pricePerKg: 2.0,
      freeThreshold: 5,
      freeShippingOver: 5000
    },
    {
      id: 'sameday',
      name: 'Sameday',
      logo: 'SMD',
      eta: '1 zi lucratoare',
      basePrice: 24.99,
      pricePerKg: 3.0,
      freeThreshold: 3,
      freeShippingOver: 8000
    },
    {
      id: 'pickup',
      name: 'Ridicare din Depozit',
      logo: 'RDP',
      eta: 'Disponibil imediat',
      basePrice: 0,
      pricePerKg: 0,
      freeThreshold: Infinity,
      freeShippingOver: 0,
      isPickup: true,
      address: 'Str. Energiei Nr. 42, Sector 3, Bucuresti'
    }
  ];

  function calculateShippingCost(courierId, totalWeight, subtotal) {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return 0;

    // Free for pickup
    if (courier.isPickup) return 0;

    // Free shipping over threshold
    if (subtotal >= courier.freeShippingOver) return 0;

    // Base price + extra weight charge
    let cost = courier.basePrice;
    const extraWeight = Math.max(0, totalWeight - courier.freeThreshold);
    cost += extraWeight * courier.pricePerKg;

    return Math.round(cost * 100) / 100;
  }

  function getSelected() {
    return Store.get(SHIPPING_KEY, 'fan-courier');
  }

  function setSelected(courierId) {
    Store.set(SHIPPING_KEY, courierId);
    Store.emit('shipping:changed', courierId);
  }

  function getCouriers() {
    return couriers;
  }

  function getCourier(id) {
    return couriers.find(c => c.id === id);
  }

  function renderCourierOptions(containerId) {
    const container = document.querySelector(containerId || '.courier-options');
    if (!container) return;

    const totalWeight = Cart.getTotalWeight();
    const subtotal = Cart.getSubtotal();
    const selectedId = getSelected();

    container.innerHTML = couriers.map(courier => {
      const cost = calculateShippingCost(courier.id, totalWeight, subtotal);
      const isSelected = courier.id === selectedId;
      const isFree = cost === 0 && !courier.isPickup && subtotal >= courier.freeShippingOver;

      return `
        <div class="courier-card ${isSelected ? 'courier-card--selected' : ''} ${courier.isPickup ? 'courier-card--pickup' : ''}"
             data-courier-id="${courier.id}">
          <div class="courier-card__radio"></div>
          <div class="courier-card__logo">${courier.logo}</div>
          <div class="courier-card__info">
            <div class="courier-card__name">${courier.name}</div>
            <div class="courier-card__eta">${courier.eta}${courier.address ? ` - ${courier.address}` : ''}</div>
          </div>
          <div class="courier-card__price ${cost === 0 ? 'courier-card__price--free' : ''}">
            ${courier.isPickup ? 'Gratuit' : (isFree ? 'Gratuit' : UI.formatPrice(cost))}
          </div>
        </div>
      `;
    }).join('');

    // Weight notice
    if (totalWeight > 30) {
      container.insertAdjacentHTML('afterend', `
        <div class="weight-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Comanda dvs. cantareste ${totalWeight.toFixed(1)} kg. Costul de transport include taxa suplimentara pentru greutate.
        </div>
      `);
    }

    // Bind selection events
    container.querySelectorAll('.courier-card').forEach(card => {
      card.addEventListener('click', () => {
        const courierId = card.dataset.courierId;
        setSelected(courierId);
        renderCourierOptions(containerId);
        updateOrderSummary();
      });
    });
  }

  function getCurrentShippingCost() {
    const selectedId = getSelected();
    const totalWeight = Cart.getTotalWeight();
    const subtotal = Cart.getSubtotal();
    return calculateShippingCost(selectedId, totalWeight, subtotal);
  }

  function updateOrderSummary() {
    const subtotal = Cart.getSubtotal();
    const shipping = getCurrentShippingCost();
    const total = subtotal + shipping;

    const subtotalEl = document.querySelector('.order-summary__subtotal');
    const shippingEl = document.querySelector('.order-summary__shipping');
    const totalEl = document.querySelector('.order-summary__total-value');

    if (subtotalEl) subtotalEl.textContent = UI.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratuit' : UI.formatPrice(shipping);
    if (totalEl) totalEl.textContent = UI.formatPrice(total);
  }

  return {
    getCouriers,
    getCourier,
    getSelected,
    setSelected,
    calculateShippingCost,
    getCurrentShippingCost,
    renderCourierOptions,
    updateOrderSummary
  };
})();
