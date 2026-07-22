// ============================================
// CHECKOUT PAGE - MAIN LOGIC
// ============================================

class CheckoutProcess {
  constructor() {
    this.currentStep = 'customer';
    this.steps = ['customer', 'shipping', 'payment', 'review'];
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || {};
    this.formData = {};

    // Redirect if no cart
    if (this.cart.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    this.initElements();
    this.attachEventListeners();
    this.renderOrderSummary();
    this.loadSavedData();
    this.updateCartBadge();
  }

  initElements() {
    // Steps
    this.checkoutSteps = document.querySelectorAll('.checkout-step');
    this.progressSteps = document.querySelectorAll('.progress-step');

    // Form inputs
    this.firstNameInput = document.getElementById('first-name');
    this.lastNameInput = document.getElementById('last-name');
    this.emailInput = document.getElementById('email');
    this.phoneInput = document.getElementById('phone');

    this.address1Input = document.getElementById('address-1');
    this.address2Input = document.getElementById('address-2');
    this.cityInput = document.getElementById('city');
    this.countryInput = document.getElementById('country');
    this.stateInput = document.getElementById('state');
    this.zipInput = document.getElementById('zip');

    this.shippingMethodInputs = document.querySelectorAll('input[name="shipping_method"]');

    this.paymentMethodInputs = document.querySelectorAll('input[name="payment_method"]');
    this.cardNumberInput = document.getElementById('card-number');
    this.cardHolderInput = document.getElementById('card-holder');
    this.expiryInput = document.getElementById('expiry');
    this.cvvInput = document.getElementById('cvv');
    this.upiIdInput = document.getElementById('upi-id');

    this.termsCheckbox = document.getElementById('terms-checkbox');

    // Buttons
    this.nextBtns = document.querySelectorAll('.btn-next');
    this.prevBtns = document.querySelectorAll('.btn-prev');
    this.placeOrderBtn = document.getElementById('place-order-btn');

    // Summary
    this.summaryItems = document.getElementById('summary-items');
    this.summarySubtotal = document.getElementById('summary-subtotal');
    this.summaryDiscount = document.getElementById('summary-discount');
    this.summaryDiscountRow = document.getElementById('summary-discount-row');
    this.summaryShipping = document.getElementById('summary-shipping');
    this.summaryTax = document.getElementById('summary-tax');
    this.summaryTotal = document.getElementById('summary-total');

    // Review elements
    this.reviewCustomer = document.getElementById('review-customer');
    this.reviewShipping = document.getElementById('review-shipping');
    this.reviewPayment = document.getElementById('review-payment');
    this.reviewItems = document.getElementById('review-items');

    // Cart badge
    this.cartBadge = document.querySelector('.cart-badge');

    // Toast
    this.toastContainer = document.getElementById('toast-container');
  }

  attachEventListeners() {
    // Navigation buttons
    this.nextBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const nextStep = btn.dataset.next;
        this.goToStep(nextStep);
      });
    });

    this.prevBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prevStep = btn.dataset.prev;
        this.goToStep(prevStep);
      });
    });

    // Payment method change
    this.paymentMethodInputs.forEach(input => {
      input.addEventListener('change', (e) => this.updatePaymentForm(e.target.value));
    });

    // Shipping method change
    this.shippingMethodInputs.forEach(input => {
      input.addEventListener('change', () => this.updateShippingCost());
    });

    // Format card input
    this.cardNumberInput?.addEventListener('input', (e) => this.formatCardNumber(e));
    this.expiryInput?.addEventListener('input', (e) => this.formatExpiry(e));
    this.cvvInput?.addEventListener('input', (e) => this.formatCVV(e));

    // Place order
    this.placeOrderBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.placeOrder();
    });
  }

  // ========== STEP NAVIGATION ==========
  goToStep(stepName) {
    // Validate current step before moving
    if (!this.validateStep(this.currentStep)) {
      return;
    }

    // Save form data
    this.saveFormData(this.currentStep);

    // Update UI
    this.currentStep = stepName;

    // Hide all steps
    this.checkoutSteps.forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepName}`).classList.add('active');

    // Update progress indicator
    this.updateProgressIndicator();

    // Update review if going to review step
    if (stepName === 'review') {
      this.populateReviewStep();
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  updateProgressIndicator() {
    this.progressSteps.forEach(step => {
      const stepName = step.dataset.step;
      const stepIndex = this.steps.indexOf(stepName);
      const currentIndex = this.steps.indexOf(this.currentStep);

      step.classList.remove('active', 'completed');

      if (stepIndex === currentIndex) {
        step.classList.add('active');
      } else if (stepIndex < currentIndex) {
        step.classList.add('completed');
      }
    });
  }

  // ========== FORM VALIDATION ==========
  validateStep(stepName) {
    if (stepName === 'customer') {
      return this.validateCustomerForm();
    } else if (stepName === 'shipping') {
      return this.validateShippingForm();
    } else if (stepName === 'payment') {
      return this.validatePaymentForm();
    }
    return true;
  }

  validateCustomerForm() {
    const firstName = this.firstNameInput.value.trim();
    const lastName = this.lastNameInput.value.trim();
    const email = this.emailInput.value.trim();
    const phone = this.phoneInput.value.trim();

    let isValid = true;

    if (!firstName) {
      this.showFieldError(this.firstNameInput, 'First name is required');
      isValid = false;
    }
    if (!lastName) {
      this.showFieldError(this.lastNameInput, 'Last name is required');
      isValid = false;
    }
    if (!email || !this.isValidEmail(email)) {
      this.showFieldError(this.emailInput, 'Valid email is required');
      isValid = false;
    }
    if (!phone || !this.isValidPhone(phone)) {
      this.showFieldError(this.phoneInput, 'Valid phone is required');
      isValid = false;
    }

    return isValid;
  }

  validateShippingForm() {
    const address1 = this.address1Input.value.trim();
    const city = this.cityInput.value.trim();
    const country = this.countryInput.value;
    const state = this.stateInput.value.trim();
    const zip = this.zipInput.value.trim();

    let isValid = true;

    if (!address1) {
      this.showFieldError(this.address1Input, 'Address is required');
      isValid = false;
    }
    if (!city) {
      this.showFieldError(this.cityInput, 'City is required');
      isValid = false;
    }
    if (!country) {
      this.showFieldError(this.countryInput, 'Country is required');
      isValid = false;
    }
    if (!state) {
      this.showFieldError(this.stateInput, 'State is required');
      isValid = false;
    }
    if (!zip) {
      this.showFieldError(this.zipInput, 'ZIP code is required');
      isValid = false;
    }

    return isValid;
  }

  validatePaymentForm() {
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

    if (paymentMethod === 'card') {
      return this.validateCardForm();
    } else if (paymentMethod === 'upi') {
      return this.validateUPIForm();
    }

    return true;
  }

  validateCardForm() {
    const cardNumber = this.cardNumberInput.value.replace(/\s/g, '');
    const cardHolder = this.cardHolderInput.value.trim();
    const expiry = this.expiryInput.value.trim();
    const cvv = this.cvvInput.value.trim();

    let isValid = true;

    if (!cardNumber || cardNumber.length < 13) {
      this.showFieldError(this.cardNumberInput, 'Valid card number required');
      isValid = false;
    }
    if (!cardHolder) {
      this.showFieldError(this.cardHolderInput, 'Card holder name required');
      isValid = false;
    }
    if (!expiry || !this.isValidExpiry(expiry)) {
      this.showFieldError(this.expiryInput, 'Valid expiry date required');
      isValid = false;
    }
    if (!cvv || cvv.length < 3) {
      this.showFieldError(this.cvvInput, 'Valid CVV required');
      isValid = false;
    }

    return isValid;
  }

  validateUPIForm() {
    const upiId = this.upiIdInput.value.trim();

    if (!upiId || !this.isValidUPI(upiId)) {
      this.showFieldError(this.upiIdInput, 'Valid UPI ID required');
      return false;
    }

    return true;
  }

  showFieldError(field, message) {
    const errorEl = field.nextElementSibling;
    if (errorEl && errorEl.classList.contains('error-message')) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }

    field.classList.add('error');
    field.addEventListener('focus', () => {
      field.classList.remove('error');
      if (errorEl) errorEl.classList.remove('show');
    }, { once: true });
  }

  // ========== VALIDATION HELPERS ==========
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  }

  isValidExpiry(expiry) {
    return /^\d{2}\/\d{2}$/.test(expiry);
  }

  isValidUPI(upi) {
    return /^[\w\.-]+@[\w\.-]+$/.test(upi);
  }

  // ========== FORM DATA MANAGEMENT ==========
  saveFormData(stepName) {
    if (stepName === 'customer') {
      this.formData.customer = {
        firstName: this.firstNameInput.value,
        lastName: this.lastNameInput.value,
        email: this.emailInput.value,
        phone: this.phoneInput.value
      };
    } else if (stepName === 'shipping') {
      this.formData.shipping = {
        address1: this.address1Input.value,
        address2: this.address2Input.value,
        city: this.cityInput.value,
        country: this.countryInput.value,
        state: this.stateInput.value,
        zip: this.zipInput.value,
        method: document.querySelector('input[name="shipping_method"]:checked').value
      };
    } else if (stepName === 'payment') {
      this.formData.payment = {
        method: document.querySelector('input[name="payment_method"]:checked').value
      };
    }

    localStorage.setItem('checkoutFormData', JSON.stringify(this.formData));
  }

  loadSavedData() {
    const saved = JSON.parse(localStorage.getItem('checkoutFormData')) || {};

    if (saved.customer) {
      this.firstNameInput.value = saved.customer.firstName || '';
      this.lastNameInput.value = saved.customer.lastName || '';
      this.emailInput.value = saved.customer.email || '';
      this.phoneInput.value = saved.customer.phone || '';
    }

    if (saved.shipping) {
      this.address1Input.value = saved.shipping.address1 || '';
      this.address2Input.value = saved.shipping.address2 || '';
      this.cityInput.value = saved.shipping.city || '';
      this.countryInput.value = saved.shipping.country || '';
      this.stateInput.value = saved.shipping.state || '';
      this.zipInput.value = saved.shipping.zip || '';
    }
  }

  // ========== INPUT FORMATTING ==========
  formatCardNumber(e) {
    let value = e.target.value.replace(/\s+/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;
  }

  formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  }

  formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
  }

  // ========== PAYMENT METHOD ==========
  updatePaymentForm(method) {
    const cardForm = document.getElementById('card-form');
    const upiForm = document.getElementById('upi-form');

    if (method === 'card') {
      cardForm.classList.add('active');
      upiForm.classList.remove('active');
    } else if (method === 'upi') {
      cardForm.classList.remove('active');
      upiForm.classList.add('active');
    } else {
      cardForm.classList.remove('active');
      upiForm.classList.remove('active');
    }
  }

  // ========== SHIPPING COST ==========
  updateShippingCost() {
    this.renderOrderSummary();
  }

  // ========== ORDER SUMMARY ==========
  renderOrderSummary() {
    // Ensure all prices are numbers (not strings)
    const normalizedCart = this.cart.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price || 0,
      originalPrice: typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice.replace('$', '')) : item.originalPrice || 0
    }));

    const subtotal = normalizedCart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
    let discount = 0;

    if (appliedCoupon) {
      discount = subtotal * appliedCoupon.discountRate;
    }

    const subtotalAfterDiscount = subtotal - discount;
    const shippingMethod = document.querySelector('input[name="shipping_method"]:checked')?.value || 'standard';
    let shippingCost = 0;

    if (shippingMethod === 'express') shippingCost = 15;
    if (shippingMethod === 'overnight') shippingCost = 25;

    const taxRate = 0.18;
    const taxAmount = subtotalAfterDiscount * taxRate;
    const grandTotal = subtotalAfterDiscount + taxAmount + shippingCost;

    // Update summary display
    this.summarySubtotal.textContent = '$' + subtotal.toFixed(2);
    this.summaryShipping.textContent = shippingCost === 0 ? 'Free' : '$' + shippingCost.toFixed(2);
    this.summaryTax.textContent = '$' + taxAmount.toFixed(2);
    this.summaryTotal.textContent = '$' + grandTotal.toFixed(2);

    if (discount > 0) {
      this.summaryDiscountRow.style.display = 'flex';
      this.summaryDiscount.textContent = '-$' + discount.toFixed(2);
    }

    // Render items
    const itemsHtml = normalizedCart.map(item => `
      <div class="summary-item">
        <img src="${item.image}" alt="${item.name}" class="summary-item-img" />
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-variant">${item.color} × ${item.quantity}</div>
          <div class="summary-item-price">$${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
        </div>
      </div>
    `).join('');

    this.summaryItems.innerHTML = itemsHtml;
  }

  // ========== REVIEW STEP ==========
  populateReviewStep() {
    const customer = this.formData.customer || {};
    const shipping = this.formData.shipping || {};
    const payment = this.formData.payment || {};

    // Customer info
    this.reviewCustomer.innerHTML = `
      <p><strong>Name:</strong> ${customer.firstName} ${customer.lastName}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone}</p>
    `;

    // Shipping info
    const shippingMethod = document.querySelector('input[name="shipping_method"]:checked').value;
    this.reviewShipping.innerHTML = `
      <p><strong>Address:</strong> ${shipping.address1} ${shipping.address2}</p>
      <p><strong>City:</strong> ${shipping.city}, ${shipping.state} ${shipping.zip}</p>
      <p><strong>Country:</strong> ${shipping.country}</p>
      <p><strong>Method:</strong> ${shippingMethod.charAt(0).toUpperCase() + shippingMethod.slice(1)} Shipping</p>
    `;

    // Payment info
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    let paymentInfo = `<p><strong>Method:</strong> ${paymentMethod.toUpperCase()}`;

    if (paymentMethod === 'card') {
      const cardLast4 = this.cardNumberInput.value.slice(-4);
      paymentInfo += `<p><strong>Card:</strong> **** **** **** ${cardLast4}</p>`;
    }

    this.reviewPayment.innerHTML = paymentInfo;

    // Items
    const itemsHtml = this.cart.map(item => `
      <p>${item.name} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
    `).join('');

    this.reviewItems.innerHTML = itemsHtml;
  }

  // ========== PLACE ORDER ==========
  placeOrder() {
    // Validate terms
    if (!this.termsCheckbox.checked) {
      document.getElementById('terms-error').textContent = 'You must agree to the terms';
      document.getElementById('terms-error').classList.add('show');
      return;
    }

    // Disable button
    this.placeOrderBtn.disabled = true;
    this.placeOrderBtn.textContent = 'Processing...';

    // Simulate order processing
    setTimeout(() => {
      // Save order
      const order = {
        id: 'ORD-' + Date.now(),
        customer: this.formData.customer,
        shipping: this.formData.shipping,
        payment: this.formData.payment,
        items: this.cart,
        orderSummary: this.orderSummary,
        timestamp: Date.now(),
        status: 'confirmed'
      };

      localStorage.setItem('lastOrder', JSON.stringify(order));

      // Clear cart
      localStorage.removeItem('cart');
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('orderSummary');

      // Redirect to thank you
      window.location.href = 'thank-you.html?orderId=' + order.id;
    }, 2000);
  }

  // ========== CART BADGE ==========
  updateCartBadge() {
    const totalQty = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartBadge.textContent = totalQty;
  }

  // ========== TOAST ==========
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize drawers
function initDrawers() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartBtn = document.getElementById('btn-cart');
  const wishlistDrawer = document.getElementById('wishlist-drawer');
  const wishlistOverlay = document.getElementById('wishlist-overlay');
  const wishlistClose = document.getElementById('wishlist-close');
  const wishlistBtn = document.getElementById('btn-wishlist');

  function setCartOpen(isOpen) {
    if (!cartDrawer || !cartOverlay) return;
    cartDrawer.classList.toggle('is-open', isOpen);
    cartDrawer.setAttribute('aria-hidden', String(!isOpen));
    cartOverlay.hidden = !isOpen;
    document.body.classList.toggle('cart-open', isOpen);
    cartBtn?.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) cartClose?.focus(); else cartBtn?.focus();
  }

  function setWishlistOpen(isOpen) {
    if (!wishlistDrawer || !wishlistOverlay) return;
    wishlistDrawer.classList.toggle('is-open', isOpen);
    wishlistDrawer.setAttribute('aria-hidden', String(!isOpen));
    wishlistOverlay.hidden = !isOpen;
    document.body.classList.toggle('wishlist-open', isOpen);
    wishlistBtn?.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) wishlistClose?.focus(); else wishlistBtn?.focus();
  }

  // Cart drawer handlers
  if (cartBtn) {
    cartBtn.addEventListener('click', () => setCartOpen(true));
  }
  if (cartClose) {
    cartClose.addEventListener('click', () => setCartOpen(false));
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => setCartOpen(false));
  }

  // Wishlist drawer handlers
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => setWishlistOpen(true));
  }
  if (wishlistClose) {
    wishlistClose.addEventListener('click', () => setWishlistOpen(false));
  }
  if (wishlistOverlay) {
    wishlistOverlay.addEventListener('click', () => setWishlistOpen(false));
  }

  // Escape key closes drawers
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (cartDrawer?.classList.contains('is-open')) setCartOpen(false);
    else if (wishlistDrawer?.classList.contains('is-open')) setWishlistOpen(false);
  });
}

// Initialize hamburger menu
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const siteHeader = document.getElementById('site-header');

  if (!hamburgerBtn || !siteHeader) return;

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = siteHeader.classList.toggle('nav-open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (ev) => {
    if (!siteHeader.classList.contains('nav-open')) return;
    if (!siteHeader.contains(ev.target)) {
      siteHeader.classList.remove('nav-open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('.header__nav a').forEach((link) => {
    link.addEventListener('click', () => {
      siteHeader.classList.remove('nav-open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteHeader.classList.contains('nav-open')) {
      siteHeader.classList.remove('nav-open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initDrawers();
  new CheckoutProcess();
});

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
