// ============================================
// SHOPPING CART PAGE - MAIN LOGIC
// ============================================

class ShoppingCart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.appliedDiscount = null;
    this.taxRate = 0.18; // 18% GST
    this.freeShippingThreshold = 100;

    this.initElements();
    this.attachEventListeners();
    this.renderCart();
    this.loadRelatedProducts();
    this.updateCartBadge();
  }

  initElements() {
    this.emptyCart = document.getElementById('empty-cart');
    this.cartItemsList = document.getElementById('cart-items');
    this.cartSection = document.getElementById('cart-items');
    this.summarySection = document.getElementById('summary-section');
    this.couponSection = document.getElementById('coupon-section');

    // Summary elements
    this.subtotalPrice = document.getElementById('subtotal-price');
    this.discountPrice = document.getElementById('discount-price');
    this.discountRow = document.getElementById('discount-row');
    this.shippingPrice = document.getElementById('shipping-price');
    this.taxPrice = document.getElementById('tax-price');
    this.grandTotal = document.getElementById('grand-total');
    this.savingsAmount = document.getElementById('savings-amount');
    this.savingsBadge = document.getElementById('savings-badge');

    // Buttons
    this.checkoutBtn = document.getElementById('checkout-btn');
    this.applyCouponBtn = document.getElementById('apply-coupon-btn');
    this.couponInput = document.getElementById('coupon-input');
    this.couponMessage = document.getElementById('coupon-message');

    // Related products
    this.relatedSection = document.getElementById('related-section');
    this.relatedProducts = document.getElementById('related-products');

    // Header
    this.cartBadge = document.querySelector('.cart-badge');
    this.wishlistBadge = document.querySelector('.wishlist-badge');

    // Toast
    this.toastContainer = document.getElementById('toast-container');
  }

  attachEventListeners() {
    this.checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
    this.applyCouponBtn.addEventListener('click', () => this.applyCoupon());
    this.couponInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.applyCoupon();
    });

    // Navigation
    document.querySelectorAll('.header__nav a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
        }
      });
    });
  }

  // ========== RENDER CART ==========
  renderCart() {
    if (this.cart.length === 0) {
      this.emptyCart.style.display = 'flex';
      this.cartItemsList.style.display = 'none';
      this.couponSection.style.display = 'none';
      this.summarySection.style.display = 'none';
      this.relatedSection.style.display = 'none';
      return;
    }

    this.emptyCart.style.display = 'none';
    this.cartItemsList.style.display = 'flex';
    this.couponSection.style.display = 'block';
    this.summarySection.style.display = 'block';

    const itemsHtml = this.cart.map((item, idx) => this.renderCartItem(item, idx)).join('');
    this.cartItemsList.innerHTML = itemsHtml;

    // Attach event listeners to cart item buttons
    document.querySelectorAll('.qty-btn-small').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        const action = e.currentTarget.dataset.action;
        this.updateQuantity(idx, action);
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.removeItem(idx);
      });
    });

    document.querySelectorAll('.save-for-later-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.saveForLater(idx);
      });
    });

    this.calculateTotals();
    this.loadRelatedProducts();
  }

  renderCartItem(item, idx) {
    // Ensure price and originalPrice are numbers
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : (item.price || 0);
    const originalPrice = typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice.replace('$', '')) : (item.originalPrice || price);
    const subtotal = price * item.quantity;
    const savings = (originalPrice - price) * item.quantity;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image" />

        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <div class="cart-item-brand">${item.brand || 'UrbanStep'}</div>
          <div class="cart-item-variant">Color: ${item.color} | Size: ${item.size || 'Not selected'}</div>

          <div class="cart-item-price-block">
            <span class="cart-item-price">$${price.toFixed(2)}</span>
            <span class="cart-item-original">$${originalPrice.toFixed(2)}</span>
            <span class="cart-item-discount">-${Math.round((1 - price / originalPrice) * 100)}%</span>
          </div>
        </div>

        <div class="cart-item-actions">
          <div class="quantity-adjuster">
            <button class="qty-btn-small" data-index="${idx}" data-action="minus" aria-label="Decrease quantity">−</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn-small" data-index="${idx}" data-action="plus" aria-label="Increase quantity">+</button>
          </div>

          <span class="subtotal-price">$${subtotal.toFixed(2)}</span>

          <div style="display: flex; gap: 8px; flex-wrap:wrap; width: 100%; margin-top: 8px;">
            <button class="remove-btn" data-index="${idx}" aria-label="Remove item">Remove</button>
            <button class="save-for-later-btn" data-index="${idx}" aria-label="Save for later">Save for later</button>
          </div>
        </div>
      </div>
    `;
  }

  // ========== QUANTITY MANAGEMENT ==========
  updateQuantity(idx, action) {
    if (action === 'plus') {
      this.cart[idx].quantity++;
    } else if (action === 'minus' && this.cart[idx].quantity > 1) {
      this.cart[idx].quantity--;
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.renderCart();
    this.updateCartBadge();
  }

  removeItem(idx) {
    const item = this.cart[idx];
    this.cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.showToast(`${item.name} removed from cart`, 'info');
    this.renderCart();
    this.updateCartBadge();
  }

  saveForLater(idx) {
    const item = this.cart[idx];
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

    savedItems.push({
      ...item,
      savedAt: Date.now()
    });

    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    this.removeItem(idx);
    this.showToast(`${item.name} saved for later`, 'success');
  }

  // ========== COUPON MANAGEMENT ==========
  applyCoupon() {
    const code = this.couponInput.value.trim().toUpperCase();

    if (!code) {
      this.showCouponMessage('Please enter a coupon code', 'error');
      return;
    }

    // Coupon validation
    const coupons = {
      'SAVE10': { discount: 0.10, message: '10% off applied' },
      'SAVE20': { discount: 0.20, message: '20% off applied' },
      'URBANSTEP': { discount: 0.15, message: '15% off applied' },
      'WELCOME': { discount: 0.05, message: '5% off applied' },
      'FIRST': { discount: 0.25, message: '25% off applied' }
    };

    const coupon = coupons[code];

    if (!coupon) {
      this.showCouponMessage('Invalid coupon code', 'error');
      return;
    }

    this.appliedDiscount = {
      code: code,
      discountRate: coupon.discount,
      message: coupon.message
    };

    localStorage.setItem('appliedCoupon', JSON.stringify(this.appliedDiscount));
    this.showCouponMessage(coupon.message, 'success');
    this.couponInput.value = '';
    this.calculateTotals();
  }

  showCouponMessage(message, type) {
    this.couponMessage.textContent = message;
    this.couponMessage.className = `coupon-message ${type}`;

    setTimeout(() => {
      if (type === 'error') {
        this.couponMessage.textContent = '';
      }
    }, 4000);
  }

  // ========== CALCULATIONS ==========
  calculateTotals() {
    // Normalize prices (handle both string and number formats)
    const normalizedCart = this.cart.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : (item.price || 0),
      originalPrice: typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice.replace('$', '')) : (item.originalPrice || 0)
    }));

    // Subtotal
    const subtotal = normalizedCart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

    // Discount from coupon
    let discountAmount = 0;
    if (this.appliedDiscount) {
      discountAmount = subtotal * this.appliedDiscount.discountRate;
    }
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Shipping
    const shippingCost = subtotal >= this.freeShippingThreshold ? 0 : 15;

    // Tax
    const taxAmount = subtotalAfterDiscount * this.taxRate;

    // Grand Total
    const grandTotal = subtotalAfterDiscount + taxAmount + shippingCost;

    // Calculate original price savings
    const originalTotal = normalizedCart.reduce((sum, item) => sum + ((item.originalPrice || 0) * (item.quantity || 0)), 0);
    const totalSavings = originalTotal - subtotal;

    // Update UI
    this.subtotalPrice.textContent = '$' + subtotal.toFixed(2);
    this.shippingPrice.textContent = shippingCost === 0 ? 'Free' : '$' + shippingCost.toFixed(2);
    this.taxPrice.textContent = '$' + taxAmount.toFixed(2);
    this.grandTotal.textContent = '$' + grandTotal.toFixed(2);

    if (discountAmount > 0) {
      this.discountRow.style.display = 'flex';
      this.discountPrice.textContent = '-$' + discountAmount.toFixed(2);
    } else {
      this.discountRow.style.display = 'none';
    }

    if (totalSavings > 0) {
      this.savingsBadge.style.display = 'block';
      this.savingsAmount.textContent = '$' + totalSavings.toFixed(2);
    } else {
      this.savingsBadge.style.display = 'none';
    }

    // Store totals for checkout
    localStorage.setItem('orderSummary', JSON.stringify({
      subtotal: subtotal,
      discount: discountAmount,
      shipping: shippingCost,
      tax: taxAmount,
      grandTotal: grandTotal,
      coupon: this.appliedDiscount || null
    }));
  }

  // ========== CHECKOUT ==========
  proceedToCheckout() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty', 'error');
      return;
    }

    // Store cart in localStorage (if not already there)
    localStorage.setItem('cart', JSON.stringify(this.cart));

    // Redirect to checkout
    window.location.href = 'checkout.html';
  }

  // ========== RELATED PRODUCTS ==========
  loadRelatedProducts() {
    const products = [
      {
        name: 'Socks Bundle',
        price: 24.99,
        image: 'images/blue_shoe.png',
        category: 'Accessories'
      },
      {
        name: 'Shoe Cleaner',
        price: 19.99,
        image: 'images/red_shoe.png',
        category: 'Care'
      },
      {
        name: 'Insoles Premium',
        price: 34.99,
        image: 'images/purple_shoe.png',
        category: 'Comfort'
      },
      {
        name: 'Shoe Bag',
        price: 29.99,
        image: 'images/sky_shoe.png',
        category: 'Storage'
      }
    ];

    const productsHtml = products.map((product, idx) => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}" class="product-card-img" />
        <div class="product-card-info">
          <h3 class="product-card-name">${product.name}</h3>
          <div class="product-card-price">$${product.price.toFixed(2)}</div>
        </div>
        <button class="product-card-btn" data-index="${idx}" data-product='${JSON.stringify(product)}'>Add to Cart</button>
      </div>
    `).join('');

    this.relatedProducts.innerHTML = productsHtml;

    // Event listeners
    document.querySelectorAll('.product-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const product = JSON.parse(e.target.dataset.product);
        this.addRelatedProductToCart(product);
      });
    });
  }

  addRelatedProductToCart(product) {
    const cartItem = {
      id: product.name.toLowerCase().replace(/\s+/g, '-'),
      name: product.name,
      brand: 'UrbanStep',
      price: product.price,
      originalPrice: product.price,
      image: product.image,
      color: 'N/A',
      size: 'N/A',
      quantity: 1,
      timestamp: Date.now()
    };

    this.cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.renderCart();
    this.updateCartBadge();
    this.showToast(`${product.name} added to cart!`, 'success');
  }

  // ========== CART BADGE UPDATE ==========
  updateCartBadge() {
    const totalQty = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartBadge.textContent = totalQty;
  }

  // ========== TOAST NOTIFICATIONS ==========
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');

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
  new ShoppingCart();
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
