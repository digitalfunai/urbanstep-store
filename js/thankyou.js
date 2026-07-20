// ============================================
// THANK YOU PAGE - ORDER CONFIRMATION
// ============================================

class ThankYouPage {
  constructor() {
    this.order = JSON.parse(localStorage.getItem('lastOrder')) || null;

    // Redirect if no order
    if (!this.order) {
      window.location.href = 'product-details.html';
      return;
    }

    this.initElements();
    this.displayOrder();
    this.attachEventListeners();
  }

  initElements() {
    this.orderId = document.getElementById('order-id');
    this.orderDate = document.getElementById('order-date');
    this.deliveryAddress = document.getElementById('delivery-address');
    this.estimatedDelivery = document.getElementById('estimated-delivery');
    this.paymentMethod = document.getElementById('payment-method');
    this.itemsList = document.getElementById('items-list');
    this.addressContent = document.getElementById('address-content');

    // Summary
    this.summarySubtotal = document.getElementById('summary-subtotal');
    this.summaryDiscount = document.getElementById('summary-discount');
    this.summaryDiscountRow = document.getElementById('summary-discount-row');
    this.summaryShipping = document.getElementById('summary-shipping');
    this.summaryTax = document.getElementById('summary-tax');
    this.summaryTotal = document.getElementById('summary-total');

    // Buttons
    this.btnTrack = document.getElementById('btn-track-order');
    this.btnDownload = document.getElementById('btn-download-invoice');
    this.btnPrint = document.getElementById('btn-print');

    // Newsletter form
    this.newsletterForm = document.getElementById('newsletter-form');

    // Toast
    this.toastContainer = document.getElementById('toast-container');
  }

  attachEventListeners() {
    this.btnTrack?.addEventListener('click', () => this.trackOrder());
    this.btnDownload?.addEventListener('click', () => this.downloadInvoice());
    this.btnPrint?.addEventListener('click', () => window.print());
    this.newsletterForm?.addEventListener('submit', (e) => this.handleNewsletter(e));
  }

  // ========== DISPLAY ORDER ==========
  displayOrder() {
    // Order basics
    this.orderId.textContent = this.order.id;
    this.orderDate.textContent = this.formatDate(this.order.timestamp);
    this.paymentMethod.textContent = this.order.payment?.method?.toUpperCase() || 'CARD';

    // Shipping address
    const shipping = this.order.shipping || {};
    this.deliveryAddress.textContent = `${shipping.address1} ${shipping.address2}, ${shipping.city}, ${shipping.state} ${shipping.zip}`;
    this.estimatedDelivery.textContent = this.getEstimatedDelivery();

    this.addressContent.innerHTML = `
      <p><strong>${this.order.customer?.firstName} ${this.order.customer?.lastName}</strong></p>
      <p>${shipping.address1}<br/>${shipping.address2 ? shipping.address2 + '<br/>' : ''}</p>
      <p>${shipping.city}, ${shipping.state} ${shipping.zip}</p>
      <p>${shipping.country}</p>
      <p style="margin-top: 12px; font-size: 12px; color: var(--ty-text-muted);">
        Phone: ${this.order.customer?.phone}
      </p>
    `;

    // Display items
    this.displayOrderItems();

    // Display summary
    this.displayOrderSummary();

    // Timeline
    this.updateTimeline();
  }

  displayOrderItems() {
    const itemsHtml = this.order.items?.map(item => `
      <div class="item-row">
        <div class="item-details">
          <img src="${item.image}" alt="${item.name}" class="item-img" />
          <div class="item-info">
            <p class="item-name">${item.name}</p>
            <p class="item-variant">${item.color} | Size ${item.size}</p>
            <p class="item-qty">Qty: ${item.quantity}</p>
          </div>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    this.itemsList.innerHTML = itemsHtml;
  }

  displayOrderSummary() {
    const summary = this.order.orderSummary || {};

    this.summarySubtotal.textContent = '$' + (summary.subtotal || 0).toFixed(2);
    this.summaryShipping.textContent = summary.shipping === 0 ? 'Free' : '$' + summary.shipping.toFixed(2);
    this.summaryTax.textContent = '$' + (summary.tax || 0).toFixed(2);
    this.summaryTotal.textContent = '$' + (summary.grandTotal || 0).toFixed(2);

    if (summary.discount && summary.discount > 0) {
      this.summaryDiscountRow.style.display = 'flex';
      this.summaryDiscount.textContent = '-$' + summary.discount.toFixed(2);
    }
  }

  // ========== DATE FORMATTING ==========
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  getEstimatedDelivery() {
    const date = new Date();
    date.setDate(date.getDate() + 5); // Assume 5 days delivery
    return this.formatDate(date.getTime());
  }

  // ========== TIMELINE ==========
  updateTimeline() {
    // Add date to timeline
    const placedElement = document.getElementById('timeline-placed');
    if (placedElement) {
      const time = new Date(this.order.timestamp);
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      placedElement.textContent = `${this.formatDate(this.order.timestamp)} at ${hours}:${minutes}`;
    }
  }

  // ========== TRACK ORDER ==========
  trackOrder() {
    this.showToast('Redirecting to tracking page...', 'info');
    setTimeout(() => {
      window.location.href = `#tracking/${this.order.id}`;
    }, 1000);
  }

  // ========== DOWNLOAD INVOICE ==========
  downloadInvoice() {
    const invoice = this.generateInvoice();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoice));
    element.setAttribute('download', `Invoice-${this.order.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.showToast('Invoice downloaded successfully!', 'success');
  }

  generateInvoice() {
    const customer = this.order.customer || {};
    const shipping = this.order.shipping || {};
    const summary = this.order.orderSummary || {};

    let invoice = `
=====================================
           ORDER INVOICE
=====================================

Order ID: ${this.order.id}
Date: ${this.formatDate(this.order.timestamp)}

=====================================
CUSTOMER INFORMATION
=====================================
Name: ${customer.firstName} ${customer.lastName}
Email: ${customer.email}
Phone: ${customer.phone}

=====================================
SHIPPING ADDRESS
=====================================
${shipping.address1}
${shipping.address2 ? shipping.address2 + '\n' : ''}${shipping.city}, ${shipping.state} ${shipping.zip}
${shipping.country}

=====================================
ORDER ITEMS
=====================================
`;

    this.order.items?.forEach(item => {
      invoice += `
${item.name}
  Color: ${item.color} | Size: ${item.size}
  Quantity: ${item.quantity}
  Price: $${item.price.toFixed(2)} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
`;
    });

    invoice += `
=====================================
ORDER SUMMARY
=====================================
Subtotal:        $${(summary.subtotal || 0).toFixed(2)}
${summary.discount ? `Discount:        -$${summary.discount.toFixed(2)}\n` : ''}Shipping:        ${summary.shipping === 0 ? 'Free' : '$' + summary.shipping.toFixed(2)}
Tax (GST):       $${(summary.tax || 0).toFixed(2)}
-------------------------------------
GRAND TOTAL:     $${(summary.grandTotal || 0).toFixed(2)}

=====================================
PAYMENT METHOD
=====================================
${this.order.payment?.method?.toUpperCase() || 'CARD'}

=====================================
Thank you for your purchase!
UrbanStep - Made for those moving forward
© 2026 UrbanStep. All rights reserved.
=====================================
`;

    return invoice;
  }

  // ========== NEWSLETTER SIGNUP ==========
  handleNewsletter(e) {
    e.preventDefault();

    const email = document.getElementById('newsletter-email').value;

    if (!email) {
      this.showToast('Please enter your email', 'error');
      return;
    }

    // Save newsletter subscription
    let subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
    }

    this.showToast('Successfully subscribed to our newsletter!', 'success');
    document.getElementById('newsletter-email').value = '';
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

  // Cart drawer handlers
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (cartDrawer) {
        cartDrawer.setAttribute('aria-hidden', 'false');
        cartOverlay.hidden = false;
      }
    });
  }
  if (cartClose) {
    cartClose.addEventListener('click', () => {
      if (cartDrawer) {
        cartDrawer.setAttribute('aria-hidden', 'true');
        cartOverlay.hidden = true;
      }
    });
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      if (cartDrawer) {
        cartDrawer.setAttribute('aria-hidden', 'true');
        cartOverlay.hidden = true;
      }
    });
  }

  // Wishlist drawer handlers
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      if (wishlistDrawer) {
        wishlistDrawer.setAttribute('aria-hidden', 'false');
        wishlistOverlay.hidden = false;
      }
    });
  }
  if (wishlistClose) {
    wishlistClose.addEventListener('click', () => {
      if (wishlistDrawer) {
        wishlistDrawer.setAttribute('aria-hidden', 'true');
        wishlistOverlay.hidden = true;
      }
    });
  }
  if (wishlistOverlay) {
    wishlistOverlay.addEventListener('click', () => {
      if (wishlistDrawer) {
        wishlistDrawer.setAttribute('aria-hidden', 'true');
        wishlistOverlay.hidden = true;
      }
    });
  }

  // Escape key closes drawers
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (cartDrawer && cartDrawer.getAttribute('aria-hidden') === 'false') {
      cartDrawer.setAttribute('aria-hidden', 'true');
      cartOverlay.hidden = true;
    }
    if (wishlistDrawer && wishlistDrawer.getAttribute('aria-hidden') === 'false') {
      wishlistDrawer.setAttribute('aria-hidden', 'true');
      wishlistOverlay.hidden = true;
    }
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
  new ThankYouPage();
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
