/**
 * UrbanStep — Shared Utilities
 * Toast notifications, animations, formatting, and UI helpers.
 */
const UrbanUtils = (() => {
  'use strict';

  /* ── Toast Notification ── */
  function showToast(message, duration = 2600) {
    let toast = document.querySelector('.site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), duration);
  }

  /* ── Currency Formatting ── */
  function formatCurrency(amount) {
    return '$' + Number(amount).toFixed(2);
  }

  /* ── Counter Animation ── */
  function animateCounter(element, target, duration = 1200) {
    if (!element) return;
    const start = 0;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      element.textContent = formatCurrency(current);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── Scroll Reveal (IntersectionObserver) ── */
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    elements.forEach(el => observer.observe(el));
  }

  /* ── Button Ripple Effect ── */
  function rippleEffect(event) {
    const btn = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  /* ── Debounce ── */
  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  /* ── Sync Header Badges ── */
  function syncBadges() {
    const cartBadge = document.querySelector('.cart-badge');
    const wishBadge = document.querySelector('.wishlist-badge');
    if (cartBadge) {
      const count = UrbanStorage.cart.count();
      cartBadge.textContent = count > 0 ? String(count) : '';
      cartBadge.hidden = count === 0;
      cartBadge.setAttribute('aria-label', `${count} item${count === 1 ? '' : 's'} in cart`);
    }
    if (wishBadge) {
      const count = UrbanStorage.wishlist.count();
      wishBadge.textContent = count > 0 ? String(count) : '';
      wishBadge.hidden = count === 0;
      wishBadge.setAttribute('aria-label', `${count} saved item${count === 1 ? '' : 's'}`);
    }
  }

  /* ── Generate Order Date ── */
  function formatDate(isoString) {
    const d = new Date(isoString || Date.now());
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function estimatedDelivery(method = 'standard') {
    const d = new Date();
    const days = method === 'sameday' ? 0 : method === 'express' ? 3 : 6;
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  /* ── Shared Header/Footer Init ── */
  function initSharedUI() {
    // Hamburger toggle
    const hamburger = document.getElementById('hamburger-btn');
    const siteHeader = document.getElementById('site-header');
    hamburger?.addEventListener('click', () => {
      const isOpen = siteHeader.classList.toggle('nav-open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav on link click
    document.querySelectorAll('.header__nav a').forEach(link => {
      link.addEventListener('click', () => {
        siteHeader?.classList.remove('nav-open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
      });
    });

    // Cart drawer
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartBtn = document.getElementById('btn-cart');
    const cartItems = document.getElementById('cart-items');

    function setCartOpen(open) {
      if (!cartDrawer || !cartOverlay) return;
      cartDrawer.classList.toggle('is-open', open);
      cartDrawer.setAttribute('aria-hidden', String(!open));
      cartOverlay.hidden = !open;
      document.body.classList.toggle('cart-open', open);
      if (open) { renderCartDrawer(); cartClose?.focus(); }
    }

    function renderCartDrawer() {
      if (!cartItems) return;
      const items = UrbanStorage.cart.getAll();
      if (!items.length) {
        cartItems.innerHTML = '<div class="cart-empty"><span aria-hidden="true">🛍️</span><h3>Your cart is empty</h3><p>Add a pair and it will appear here instantly.</p></div>';
        return;
      }
      cartItems.innerHTML = `<ul class="cart-items">${items.map(item => `
        <li class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item__content">
            <div class="cart-item__top">
              <div><h3>${item.name}</h3><p>${item.color} · Size ${item.size || '-'}</p></div>
              <button class="cart-item__remove" type="button" data-cart-remove="${item.key}" aria-label="Remove ${item.name}">×</button>
            </div>
            <div class="cart-item__footer">
              <div class="cart-item__qty" role="group" aria-label="Quantity">
                <button type="button" data-cart-qty-change="${item.key}" data-delta="-1" aria-label="Decrease">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-qty-change="${item.key}" data-delta="1" aria-label="Increase">+</button>
              </div>
              <strong>${UrbanUtils.formatCurrency(item.price * item.quantity)}</strong>
            </div>
          </div>
        </li>`).join('')}</ul>
        <div style="padding:16px 20px;border-top:1px solid rgba(255,255,255,.08);margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:rgba(255,255,255,.68);font-size:13px;">Subtotal</span>
          <strong style="font-size:16px;">${UrbanUtils.formatCurrency(UrbanStorage.cart.subtotal())}</strong>
        </div>
        <div style="padding:0 20px 8px;">
          <a href="pages/cart.html" class="btn-add-cart" style="display:block;text-align:center;margin-top:12px;border-radius:12px;">View Cart</a>
          <a href="pages/checkout.html" class="btn-buy-now" style="display:block;text-align:center;margin-top:8px;border-radius:12px;">Checkout</a>
        </div>`;
    }

    cartBtn?.addEventListener('click', () => setCartOpen(true));
    cartClose?.addEventListener('click', () => setCartOpen(false));
    cartOverlay?.addEventListener('click', () => setCartOpen(false));
    cartItems?.addEventListener('click', (e) => {
      const rem = e.target.closest('[data-cart-remove]');
      if (rem) { UrbanStorage.cart.remove(rem.dataset.cartRemove); renderCartDrawer(); syncBadges(); return; }
      const qty = e.target.closest('[data-cart-qty-change]');
      if (qty) {
        const key = qty.dataset.cartQtyChange;
        const delta = Number(qty.dataset.delta);
        const items = UrbanStorage.cart.getAll();
        const item = items.find(i => i.key === key);
        if (item) { UrbanStorage.cart.updateQty(key, item.quantity + delta); renderCartDrawer(); syncBadges(); }
      }
    });

    // Wishlist drawer
    const wishDrawer = document.getElementById('wishlist-drawer');
    const wishOverlay = document.getElementById('wishlist-overlay');
    const wishClose = document.getElementById('wishlist-close');
    const wishBtn = document.getElementById('btn-wishlist');
    const wishItems = document.getElementById('wishlist-items');

    function setWishOpen(open) {
      if (!wishDrawer || !wishOverlay) return;
      wishDrawer.classList.toggle('is-open', open);
      wishDrawer.setAttribute('aria-hidden', String(!open));
      wishOverlay.hidden = !open;
      document.body.classList.toggle('wishlist-open', open);
      if (open) { renderWishDrawer(); wishClose?.focus(); }
    }

    function renderWishDrawer() {
      if (!wishItems) return;
      const items = UrbanStorage.wishlist.getAll();
      if (!items.length) {
        wishItems.innerHTML = '<div class="wishlist-empty"><span aria-hidden="true">♡</span><h3>Your wishlist is empty</h3><p>Save the pairs you want to come back to.</p></div>';
        return;
      }
      wishItems.innerHTML = `<ul class="wishlist-items">${items.map(item => `
        <li class="wishlist-item">
          <img src="${item.image}" alt="${item.name}">
          <div><h3>${item.name}</h3><p>${item.category || 'UrbanStep'}</p><strong>${UrbanUtils.formatCurrency(item.price)}</strong></div>
          <button type="button" data-wish-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
        </li>`).join('')}</ul>`;
    }

    wishBtn?.addEventListener('click', () => setWishOpen(true));
    wishClose?.addEventListener('click', () => setWishOpen(false));
    wishOverlay?.addEventListener('click', () => setWishOpen(false));
    wishItems?.addEventListener('click', (e) => {
      const rem = e.target.closest('[data-wish-remove]');
      if (rem) { UrbanStorage.wishlist.remove(rem.dataset.wishRemove); renderWishDrawer(); syncBadges(); }
    });

    // Escape key closes drawers
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (cartDrawer?.classList.contains('is-open')) setCartOpen(false);
      else if (wishDrawer?.classList.contains('is-open')) setWishOpen(false);
    });

    // Listen for cart/wishlist changes from other modules
    window.addEventListener('cart-updated', () => { syncBadges(); });
    window.addEventListener('wishlist-updated', () => { syncBadges(); });

    syncBadges();
    initScrollReveal();
  }

  return {
    showToast, formatCurrency, animateCounter, initScrollReveal,
    rippleEffect, debounce, syncBadges, formatDate, estimatedDelivery, initSharedUI,
  };
})();
