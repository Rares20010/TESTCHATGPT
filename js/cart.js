/* ============================================
   Cart Module
   Add/remove/update items, calculate totals
   ============================================ */

const Cart = (() => {
  const CART_KEY = 'cart';

  function getItems() {
    return Store.get(CART_KEY, []);
  }

  function save(items) {
    Store.set(CART_KEY, items);
    updateBadge();
  }

  function addItem(product, quantity = 1) {
    const items = getItems();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images ? product.images[0] : null,
        specs: product.specs || {},
        quantity: quantity,
        weight: product.specs?.weight || 0
      });
    }

    save(items);
    Store.emit('cart:added', { product, quantity });
    return items;
  }

  function removeItem(productId) {
    const items = getItems().filter(item => item.id !== productId);
    save(items);
    Store.emit('cart:removed', { productId });
    return items;
  }

  function updateQuantity(productId, quantity) {
    const items = getItems();
    const item = items.find(item => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        return removeItem(productId);
      }
      item.quantity = quantity;
      save(items);
    }

    return items;
  }

  function getCount() {
    return getItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function getTotalWeight() {
    return getItems().reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  }

  function clear() {
    Store.set(CART_KEY, []);
    updateBadge();
    Store.emit('cart:cleared');
  }

  function updateBadge() {
    const badges = document.querySelectorAll('.header__cart-badge');
    const count = getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.setAttribute('data-count', count);
    });
  }

  // Initialize badge on load
  document.addEventListener('DOMContentLoaded', updateBadge);

  return {
    getItems,
    addItem,
    removeItem,
    updateQuantity,
    getCount,
    getSubtotal,
    getTotalWeight,
    clear,
    updateBadge
  };
})();
