/* ============================================
   Checkout Module
   Form validation, payment toggle, order placement
   ============================================ */

const Checkout = (() => {
  let selectedPayment = 'card';
  let isGuest = true;

  function init() {
    renderOrderItems();
    bindAccountToggle();
    bindPaymentMethods();
    bindFormValidation();
    bindPlaceOrder();
    Courier.renderCourierOptions('.shipping-methods');
    Courier.updateOrderSummary();

    // Listen for shipping changes
    Store.on('shipping', () => {
      Courier.updateOrderSummary();
    });
  }

  function renderOrderItems() {
    const container = document.querySelector('.checkout-items');
    if (!container) return;

    const items = Cart.getItems();

    if (items.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="summary-item">
        <div class="summary-item__image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="color:var(--color-gray-300)">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <span class="summary-item__qty">${item.quantity}</span>
        </div>
        <div class="summary-item__info">
          <div class="summary-item__name">${item.name}</div>
          <div class="summary-item__variant">${item.brand}</div>
        </div>
        <div class="summary-item__price">${UI.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');
  }

  function bindAccountToggle() {
    const toggleBtns = document.querySelectorAll('.account-toggle__btn');
    const guestFields = document.querySelector('.guest-fields');
    const accountFields = document.querySelector('.account-fields');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('account-toggle__btn--active'));
        btn.classList.add('account-toggle__btn--active');
        isGuest = btn.dataset.type === 'guest';

        if (guestFields && accountFields) {
          guestFields.style.display = isGuest ? 'block' : 'none';
          accountFields.style.display = isGuest ? 'none' : 'block';
        }
      });
    });
  }

  function bindPaymentMethods() {
    const methods = document.querySelectorAll('.payment-method');

    methods.forEach(method => {
      const radio = method.querySelector('input[type="radio"]');
      const header = method.querySelector('.payment-method__header');

      header.addEventListener('click', () => {
        methods.forEach(m => {
          m.classList.remove('payment-method--selected');
          const r = m.querySelector('input[type="radio"]');
          if (r) r.checked = false;
        });

        method.classList.add('payment-method--selected');
        if (radio) radio.checked = true;
        selectedPayment = radio ? radio.value : 'card';
      });
    });
  }

  function bindFormValidation() {
    const form = document.querySelector('.checkout-form');
    if (!form) return;

    // Real-time validation on blur
    form.querySelectorAll('.form-input[required]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('form-input--error')) {
          validateField(input);
        }
      });
    });

    // Email format
    const emailInput = form.querySelector('#checkout-email');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
          showFieldError(emailInput, 'Adresa de email nu este valida.');
        }
      });
    }

    // Phone format
    const phoneInput = form.querySelector('#checkout-phone');
    if (phoneInput) {
      phoneInput.addEventListener('blur', () => {
        const phoneRegex = /^(\+40|0)[0-9]{9}$/;
        if (phoneInput.value && !phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
          showFieldError(phoneInput, 'Numarul de telefon nu este valid.');
        }
      });
    }
  }

  function validateField(input) {
    const error = input.parentElement.querySelector('.form-error');

    if (input.required && !input.value.trim()) {
      showFieldError(input, 'Acest camp este obligatoriu.');
      return false;
    }

    // Clear error
    input.classList.remove('form-input--error');
    if (error) error.remove();
    return true;
  }

  function showFieldError(input, message) {
    input.classList.add('form-input--error');
    let error = input.parentElement.querySelector('.form-error');
    if (!error) {
      error = document.createElement('div');
      error.className = 'form-error';
      input.parentElement.appendChild(error);
    }
    error.textContent = message;
  }

  function validateForm() {
    const requiredFields = document.querySelectorAll('.checkout-form .form-input[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      // Skip hidden fields
      if (field.offsetParent === null) return;
      if (!validateField(field)) isValid = false;
    });

    // Check terms checkbox
    const terms = document.querySelector('#checkout-terms');
    if (terms && !terms.checked) {
      isValid = false;
      UI.showToast('Trebuie sa acceptati termenii si conditiile.', 'error');
    }

    return isValid;
  }

  function bindPlaceOrder() {
    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (!placeOrderBtn) return;

    placeOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (!validateForm()) {
        UI.showToast('Va rugam sa completati toate campurile obligatorii.', 'error');
        // Scroll to first error
        const firstError = document.querySelector('.form-input--error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Simulate order placement
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div> Se proceseaza...';

      setTimeout(() => {
        Cart.clear();
        showOrderConfirmation();
      }, 2000);
    });
  }

  function showOrderConfirmation() {
    const main = document.querySelector('.checkout-layout');
    if (main) {
      const orderId = 'ST-' + Date.now().toString(36).toUpperCase();
      main.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: var(--space-16) var(--space-6);">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--color-accent-light);color:var(--color-accent);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-6);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 class="empty-state__title">Comanda a fost plasata cu succes!</h2>
          <p class="empty-state__desc">Numarul comenzii: <strong>${orderId}</strong></p>
          <p class="empty-state__desc" style="margin-top:var(--space-2);margin-bottom:var(--space-6);">Veti primi un email de confirmare in cateva minute.</p>
          <a href="index.html" class="btn btn--primary btn--lg">Inapoi la Magazin</a>
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-layout')) {
      init();
    }
  });

  return { init, validateForm };
})();
