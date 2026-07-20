/**
 * UrbanStep — Centralized LocalStorage Manager
 * Provides a unified API for cart, wishlist, orders, customer, coupon,
 * and recently-viewed data across all pages.
 */
const UrbanStorage = (() => {
  'use strict';

  /* ── Keys ── */
  const KEYS = {
    cart:       'urbanstep_cart',
    wishlist:   'urbanstep_wishlist',
    customer:   'urbanstep_customer',
    orders:     'urbanstep_orders',
    coupon:     'urbanstep_coupon',
    recent:     'urbanstep_recently_viewed',
    shipping:   'urbanstep_shipping',
  };

  /* ── Helpers ── */
  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }

  function _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn('UrbanStorage: write failed', e); }
  }

  function _remove(key) { localStorage.removeItem(key); }

  /* ── Product Catalog ── */
  const PRODUCTS = [
    { id: 'gold-pulse',        name: 'Gold Pulse',        price: 134, originalPrice: 189, image: 'images/gold_shoe.png',    color: 'Gold / Black',    category: 'Performance', brand: 'UrbanStep', sku: 'URB-GP-001', stock: 5, images: ['images/gold_shoe.png','images/gold_shoe2.png'] },
    { id: 'midnight-runner',   name: 'Midnight Runner',   price: 118, originalPrice: 155, image: 'images/navy_shoe.png',    color: 'Navy / Black',    category: 'Lifestyle',   brand: 'UrbanStep', sku: 'URB-MR-002', stock: 8, images: ['images/navy_shoe.png'] },
    { id: 'sky-shift',         name: 'Sky Shift',         price: 126, originalPrice: 168, image: 'images/sky_shoe.png',     color: 'Sky / White',     category: 'Everyday',    brand: 'UrbanStep', sku: 'URB-SS-003', stock: 3, images: ['images/sky_shoe.png'] },
    { id: 'crimson-velocity',  name: 'Crimson Velocity',  price: 142, originalPrice: 185, image: 'images/red_shoe2.png',    color: 'Crimson / White', category: 'Running',     brand: 'UrbanStep', sku: 'URB-CV-004', stock: 6, images: ['images/red_shoe2.png'] },
    { id: 'blue-sapphire',     name: 'Blue Sapphire',     price: 148, originalPrice: 198, image: 'images/blue_shoe.png',    color: 'Blue / White',    category: 'Performance', brand: 'UrbanStep', sku: 'URB-BS-005', stock: 4, images: ['images/blue_shoe.png','images/blue_shoe2.png'] },
    { id: 'scarlet-drift',     name: 'Scarlet Drift',     price: 118, originalPrice: 149, image: 'images/red_shoe.png',     color: 'Scarlet / Black', category: 'Lifestyle',   brand: 'UrbanStep', sku: 'URB-SD-006', stock: 7, images: ['images/red_shoe.png'] },
    { id: 'grey-motion',       name: 'Grey Motion',       price: 149, originalPrice: 199, image: 'images/purple_shoe.png',  color: 'Purple / Black',  category: 'Everyday',    brand: 'UrbanStep', sku: 'URB-GM-007', stock: 5, images: ['images/purple_shoe.png'] },
    { id: 'azure-eclipse',     name: 'Azure Eclipse',     price: 142, originalPrice: 179, image: 'images/blue_shoe2.png',   color: 'Azure / White',   category: 'Running',     brand: 'UrbanStep', sku: 'URB-AE-008', stock: 9, images: ['images/blue_shoe2.png'] },
    { id: 'white-phantom',     name: 'White Phantom',     price: 156, originalPrice: 210, image: 'images/white_shoe.png',   color: 'White / Silver',  category: 'Performance', brand: 'UrbanStep', sku: 'URB-WP-009', stock: 2, images: ['images/white_shoe.png'] },
  ];

  /* ── Cart ── */
  const cart = {
    getAll()       { return _get(KEYS.cart) || []; },
    save(items)    { _set(KEYS.cart, items); _dispatch('cart-updated', items); },
    add(product, size, qty = 1) {
      const items = this.getAll();
      const key = `${product.id}_${size}`;
      const existing = items.find(i => i.key === key);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, product.stock || 10);
      } else {
        items.push({
          key, id: product.id, name: product.name, image: product.image,
          color: product.color, size, price: product.price,
          originalPrice: product.originalPrice, brand: product.brand,
          quantity: Math.min(qty, product.stock || 10),
          category: product.category,
        });
      }
      this.save(items);
      return items;
    },
    updateQty(key, qty) {
      const items = this.getAll();
      const item = items.find(i => i.key === key);
      if (!item) return items;
      item.quantity = Math.max(1, Math.min(qty, 10));
      this.save(items);
      return items;
    },
    remove(key) {
      const items = this.getAll().filter(i => i.key !== key);
      this.save(items);
      return items;
    },
    clear() { _remove(KEYS.cart); _dispatch('cart-updated', []); },
    count() { return this.getAll().reduce((t, i) => t + i.quantity, 0); },
    subtotal() { return this.getAll().reduce((t, i) => t + i.price * i.quantity, 0); },
    savings() { return this.getAll().reduce((t, i) => t + (i.originalPrice - i.price) * i.quantity, 0); },
  };

  /* ── Wishlist ── */
  const wishlist = {
    getAll()    { return _get(KEYS.wishlist) || []; },
    save(items) { _set(KEYS.wishlist, items); _dispatch('wishlist-updated', items); },
    toggle(product) {
      const items = this.getAll();
      const idx = items.findIndex(i => i.id === product.id);
      if (idx >= 0) { items.splice(idx, 1); }
      else { items.push({ id: product.id, name: product.name, image: product.image, price: product.price, category: product.category, color: product.color }); }
      this.save(items);
      return idx < 0; // returns true if added
    },
    has(productId) { return this.getAll().some(i => i.id === productId); },
    remove(productId) {
      const items = this.getAll().filter(i => i.id !== productId);
      this.save(items);
      return items;
    },
    count() { return this.getAll().length; },
  };

  /* ── Customer ── */
  const customer = {
    get()       { return _get(KEYS.customer) || {}; },
    save(data)  { _set(KEYS.customer, data); },
    clear()     { _remove(KEYS.customer); },
  };

  /* ── Orders ── */
  const orders = {
    getAll()  { return _get(KEYS.orders) || []; },
    getLast() { const all = this.getAll(); return all.length ? all[all.length - 1] : null; },
    create(orderData) {
      const all = this.getAll();
      const order = {
        orderId: 'URB-' + String(Math.floor(100000 + Math.random() * 900000)),
        date: new Date().toISOString(),
        status: 'placed',
        ...orderData,
      };
      all.push(order);
      _set(KEYS.orders, all);
      return order;
    },
  };

  /* ── Coupon ── */
  const VALID_COUPONS = {
    'URBAN20': { discount: 20, type: 'percent', label: '20% off' },
    'FIRST10': { discount: 10, type: 'fixed', label: '$10 off' },
    'FREESHIP': { discount: 0, type: 'shipping', label: 'Free shipping' },
  };

  const coupon = {
    get()        { return _get(KEYS.coupon); },
    apply(code)  {
      const c = VALID_COUPONS[code.toUpperCase().trim()];
      if (!c) return null;
      const data = { code: code.toUpperCase().trim(), ...c };
      _set(KEYS.coupon, data);
      return data;
    },
    remove()     { _remove(KEYS.coupon); },
    calculate(subtotal) {
      const c = this.get();
      if (!c) return 0;
      if (c.type === 'percent') return Math.round(subtotal * c.discount / 100 * 100) / 100;
      if (c.type === 'fixed') return Math.min(c.discount, subtotal);
      return 0;
    },
  };

  /* ── Shipping ── */
  const shipping = {
    get()       { return _get(KEYS.shipping) || { method: 'standard', cost: 0 }; },
    save(data)  { _set(KEYS.shipping, data); },
    clear()     { _remove(KEYS.shipping); },
    calculate(subtotal, method = 'standard') {
      if (subtotal >= 100 && method === 'standard') return 0;
      const rates = { standard: 9.99, express: 14.99, sameday: 24.99 };
      return rates[method] || 0;
    },
  };

  /* ── Recently Viewed ── */
  const recent = {
    getAll()  { return _get(KEYS.recent) || []; },
    add(product) {
      let items = this.getAll().filter(i => i.id !== product.id);
      items.unshift({ id: product.id, name: product.name, image: product.image, price: product.price, category: product.category, timestamp: Date.now() });
      if (items.length > 8) items = items.slice(0, 8);
      _set(KEYS.recent, items);
    },
    clear() { _remove(KEYS.recent); },
  };

  /* ── Tax ── */
  function calculateTax(amount) {
    return Math.round(amount * 0.18 * 100) / 100; // 18% GST
  }

  /* ── Event dispatch (for cross-component sync) ── */
  function _dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  /* ── Public API ── */
  return {
    PRODUCTS, cart, wishlist, customer, orders, coupon, shipping, recent, calculateTax,
    getProduct(id) { return PRODUCTS.find(p => p.id === id) || null; },
    getProductByName(name) { return PRODUCTS.find(p => p.name === name) || null; },
  };
})();
