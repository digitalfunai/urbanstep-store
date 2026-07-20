(() => {
  const products = [
    { 
      id: 'gold-pulse',
      name: 'Gold Pulse', 
      brand: 'UrbanStep',
      price: 134.00, 
      originalPrice: 179.00,
      image: 'images/gold_shoe.png', 
      color: 'Gold / Black' 
    },
    { 
      id: 'midnight-runner',
      name: 'Midnight Runner', 
      brand: 'UrbanStep',
      price: 118.00, 
      originalPrice: 165.00,
      image: 'images/navy_shoe.png', 
      color: 'Navy / Black' 
    },
    { 
      id: 'sky-shift',
      name: 'Sky Shift', 
      brand: 'UrbanStep',
      price: 126.00, 
      originalPrice: 172.00,
      image: 'images/sky_shoe.png', 
      color: 'Sky / White' 
    },
    { 
      id: 'crimson-velocity',
      name: 'Crimson Velocity', 
      brand: 'UrbanStep',
      price: 142.00, 
      originalPrice: 185.00,
      image: 'images/red_shoe2.png', 
      color: 'Crimson / White' 
    },
    { 
      id: 'blue-sapphire',
      name: 'Blue Sapphire', 
      brand: 'UrbanStep',
      price: 148.00, 
      originalPrice: 198.00,
      image: 'images/blue_shoe.png', 
      color: 'Blue / White' 
    },
    { 
      id: 'scarlet-drift',
      name: 'Scarlet Drift', 
      brand: 'UrbanStep',
      price: 118.00, 
      originalPrice: 165.00,
      image: 'images/red_shoe.png', 
      color: 'Scarlet / Black' 
    },
    { 
      id: 'grey-motion',
      name: 'Grey Motion', 
      brand: 'UrbanStep',
      price: 149.00, 
      originalPrice: 189.00,
      image: 'images/purple_shoe.png', 
      color: 'Purple / Black' 
    },
    { 
      id: 'azure-eclipse',
      name: 'Azure Eclipse', 
      brand: 'UrbanStep',
      price: 142.00, 
      originalPrice: 189.00,
      image: 'images/blue_shoe2.png', 
      color: 'Azure / White' 
    }
  ];

  const headerStatus = document.getElementById('header-status');
  const cartBadge = document.querySelector('.cart-badge');
  const cartButton = document.getElementById('btn-cart');
  let cartCount = 0;
  let selectedProduct = 0;
  let selectedSize = null;
  const storedWishlistItems = JSON.parse(localStorage.getItem('urbanstep_wishlist') || '[]');
  const wishlist = new Map(storedWishlistItems.map((item) => [item.name, item]));
  const wishlistButton = document.getElementById('btn-wishlist');
  const wishlistBadge = document.querySelector('.wishlist-badge');
  const wishlistDrawer = document.getElementById('wishlist-drawer');
  const wishlistOverlay = document.getElementById('wishlist-overlay');
  const wishlistItems = document.getElementById('wishlist-items');
  const wishlistClose = document.getElementById('wishlist-close');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItems = document.getElementById('cart-items');
  const cartClose = document.getElementById('cart-close');
  
  // Load cart from localStorage (shared across all pages)
  let cartEntries = JSON.parse(localStorage.getItem('cart') || '[]');

  function announce(message) {
    if (headerStatus) headerStatus.textContent = message;
  }

  function syncCartBadge() {
    if (!cartBadge) return;
    if (cartCount <= 0) {
      cartBadge.textContent = '';
      cartBadge.setAttribute('aria-label', '0 items in cart');
      cartBadge.hidden = true;
      localStorage.removeItem('urbanstep_cart_count');
      return;
    }
    cartBadge.textContent = String(cartCount);
    cartBadge.setAttribute('aria-label', `${cartCount} item${cartCount === 1 ? '' : 's'} in cart`);
    cartBadge.hidden = false;
  }

  function updateCart(count = 1, productName = products[selectedProduct]) {
    const product = typeof productName === 'string'
      ? products.find((item) => item.name === productName) || products[selectedProduct]
      : productName;
    const existingItem = cartEntries.find((item) => item.name === product.name);

    if (existingItem) {
      existingItem.quantity = Math.max(0, existingItem.quantity + count);
      if (existingItem.quantity === 0) {
        const index = cartEntries.findIndex((item) => item.name === product.name);
        if (index >= 0) cartEntries.splice(index, 1);
      }
    } else if (count > 0) {
      cartEntries.push({ ...product, quantity: count });
    }

    cartCount = cartEntries.reduce((total, item) => total + item.quantity, 0);
    
    // Save to localStorage (shared across all pages)
    localStorage.setItem('cart', JSON.stringify(cartEntries));
    if (cartCount > 0) localStorage.setItem('urbanstep_cart_count', String(cartCount));
    
    syncCartBadge();
    renderCart();

    if (count > 0) {
      announce(`${product.name} added to cart. ${cartCount} item${cartCount === 1 ? '' : 's'} in cart.`);
      showToast(`${product.name} added to cart`);
    }
  }

  function showToast(message) {
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
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function renderWishlist() {
    if (!wishlistItems) return;
    const items = Array.from(wishlist.values());
    localStorage.setItem('urbanstep_wishlist', JSON.stringify(items));
    if (wishlistBadge) {
      wishlistBadge.textContent = String(items.length);
      wishlistBadge.setAttribute('aria-label', `${items.length} saved item${items.length === 1 ? '' : 's'}`);
      wishlistBadge.hidden = items.length === 0;
    }
    wishlistItems.innerHTML = items.length
      ? `<ul class="wishlist-items">${items.map((item) => `<li class="wishlist-item"><img src="${item.image}" alt="${item.name} sneaker"><div><h3>${item.name}</h3><p>${item.category}</p><strong>${item.price}</strong></div><button type="button" data-wishlist-remove="${item.name}" aria-label="Remove ${item.name} from wishlist">×</button></li>`).join('')}</ul>`
      : '<div class="wishlist-empty"><span aria-hidden="true">♡</span><h3>Your wishlist is empty</h3><p>Save the pairs you want to come back to.</p></div>';
  }

  function setWishlistOpen(isOpen) {
    if (!wishlistDrawer || !wishlistOverlay) return;
    wishlistDrawer.classList.toggle('is-open', isOpen);
    wishlistDrawer.setAttribute('aria-hidden', String(!isOpen));
    wishlistOverlay.hidden = !isOpen;
    document.body.classList.toggle('wishlist-open', isOpen);
    wishlistButton?.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) wishlistClose?.focus(); else wishlistButton?.focus();
  }

  function renderCart() {
    if (!cartItems) return;
    const summary = cartEntries.length
      ? cartEntries.map((item) => `
        <li class="cart-item">
          <img src="${item.image}" alt="${item.name} sneaker">
          <div class="cart-item__content">
            <div class="cart-item__top">
              <div>
                <h3>${item.name}</h3>
                <p>${item.color}</p>
              </div>
              <button class="cart-item__remove" type="button" data-cart-remove="${item.name}" aria-label="Remove ${item.name}">×</button>
            </div>
            <div class="cart-item__footer">
              <div class="cart-item__qty" role="group" aria-label="Quantity controls">
                <button type="button" data-cart-qty="-1" data-cart-name="${item.name}" aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-qty="1" data-cart-name="${item.name}" aria-label="Increase quantity">+</button>
              </div>
              <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          </div>
        </li>
      `).join('')
      : '';

    cartItems.innerHTML = cartEntries.length
      ? `<ul class="cart-items">${summary}</ul>`
      : '<div class="cart-empty"><span aria-hidden="true">🛍️</span><h3>Your cart is empty</h3><p>Add a pair and it will appear here instantly.</p></div>';
  }

  function setCartOpen(isOpen) {
    if (!cartDrawer || !cartOverlay) return;
    cartDrawer.classList.toggle('is-open', isOpen);
    cartDrawer.setAttribute('aria-hidden', String(!isOpen));
    cartOverlay.hidden = !isOpen;
    document.body.classList.toggle('cart-open', isOpen);
    cartButton?.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) cartClose?.focus(); else cartButton?.focus();
  }

  function setFeaturedProduct(index) {
    const product = products[index];
    const feature = document.querySelector('.product-feature');
    if (!feature || !product) return;
    selectedProduct = index;
    const image = feature.querySelector('.product-feature__media > img');
    const title = feature.querySelector('#featured-product-title');
    const price = feature.querySelector('.product-feature__price-row strong');
    const color = feature.querySelector('.product-options legend span');
    if (image) { image.src = product.image; image.alt = `UrbanStep ${product.name} sneaker in ${product.color} colorway`; }
    if (title) title.textContent = product.name;
    if (price) price.textContent = product.price;
    if (color) color.textContent = product.color;
    document.querySelectorAll('.product-swatch').forEach((button) => {
      const isSelected = Number(button.dataset.productIndex) === index;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
  }

  document.querySelectorAll('.product-swatch').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.classList.contains('is-selected')));
    button.addEventListener('click', () => {
      const index = Number(button.dataset.productIndex);
      setFeaturedProduct(index);
      announce(`${products[index].color} selected.`);
    });
  });

  document.querySelectorAll('.size-grid button').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      selectedSize = button.textContent.trim();
      document.querySelectorAll('.size-grid button').forEach((size) => {
        const active = size === button;
        size.classList.toggle('is-selected', active);
        size.setAttribute('aria-pressed', String(active));
      });
      announce(`Size ${selectedSize} selected.`);
    });
  });

  document.querySelectorAll('.btn-add-cart').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isFeaturedAction = button.closest('.product-feature');
      if (isFeaturedAction && !selectedSize) {
        announce('Choose a size before adding this pair to cart.');
        showToast('Please choose your size');
        document.querySelector('.size-grid button')?.focus();
        return;
      }
      updateCart(1, isFeaturedAction ? `${products[selectedProduct].name}${selectedSize ? `, size ${selectedSize}` : ''}` : 'Gold Pulse');
    });
  });

  document.querySelectorAll('.product-card__quick-add').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const name = button.closest('.product-card')?.querySelector('h3')?.textContent.trim() || 'Sneaker';
      updateCart(1, name);
      button.textContent = 'Added ✓';
      window.setTimeout(() => { button.innerHTML = 'Quick add <span aria-hidden="true">+</span>'; }, 1600);
    });
  });

  document.querySelectorAll('.product-card__wish').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const saved = button.getAttribute('aria-pressed') !== 'true';
      const card = button.closest('.product-card');
      const name = card?.querySelector('h3')?.textContent.trim() || 'Product';
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('is-saved', saved);
      button.textContent = saved ? '♥' : '♡';
      button.setAttribute('aria-label', `${saved ? 'Remove' : 'Add'} ${name} ${saved ? 'from' : 'to'} wishlist`);
      if (saved) {
        wishlist.set(name, {
          name,
          image: card?.querySelector('img')?.getAttribute('src') || '',
          category: card?.querySelector('p')?.textContent.trim() || 'UrbanStep sneaker',
          price: card?.querySelector('strong')?.textContent.trim() || ''
        });
      } else {
        wishlist.delete(name);
      }
      renderWishlist();
      announce(saved ? `${name} saved to wishlist.` : `${name} removed from wishlist.`);
    });
  });

  wishlistButton?.addEventListener('click', () => setWishlistOpen(true));
  wishlistClose?.addEventListener('click', () => setWishlistOpen(false));
  wishlistOverlay?.addEventListener('click', () => setWishlistOpen(false));
  cartButton?.addEventListener('click', () => {
    // Reload cart from localStorage to show items added on other pages
    cartEntries = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount = cartEntries.reduce((total, item) => total + item.quantity, 0);
    syncCartBadge();
    renderCart();
    setCartOpen(true);
  });
  cartClose?.addEventListener('click', () => setCartOpen(false));
  cartOverlay?.addEventListener('click', () => setCartOpen(false));
  cartItems?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
      const name = removeButton.dataset.cartRemove;
      const index = cartEntries.findIndex((item) => item.name === name);
      if (index >= 0) {
        cartEntries.splice(index, 1);
        cartCount = cartEntries.reduce((total, item) => total + item.quantity, 0);
        
        // Save to localStorage (shared across all pages)
        localStorage.setItem('cart', JSON.stringify(cartEntries));
        localStorage.setItem('urbanstep_cart_count', String(cartCount));
        
        syncCartBadge();
        renderCart();
        announce(`${name} removed from cart.`);
      }
      return;
    }

    const qtyButton = event.target.closest('[data-cart-qty]');
    if (qtyButton) {
      const name = qtyButton.dataset.cartName;
      updateCart(Number(qtyButton.dataset.cartQty), name);
    }
  });
  wishlistItems?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-wishlist-remove]');
    if (!removeButton) return;
    const name = removeButton.dataset.wishlistRemove;
    wishlist.delete(name);
    document.querySelectorAll('.product-card__wish').forEach((heart) => {
      if (heart.closest('.product-card')?.querySelector('h3')?.textContent.trim() !== name) return;
      heart.setAttribute('aria-pressed', 'false');
      heart.classList.remove('is-saved');
      heart.textContent = '♡';
      heart.setAttribute('aria-label', `Add ${name} to wishlist`);
    });
    renderWishlist();
    announce(`${name} removed from wishlist.`);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (cartDrawer?.classList.contains('is-open')) setCartOpen(false);
    else if (wishlistDrawer?.classList.contains('is-open')) setWishlistOpen(false);
  });
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.header__nav a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  setActiveNav();
  
  // Sync cart count from loaded items
  cartCount = cartEntries.reduce((total, item) => total + item.quantity, 0);
  
  syncCartBadge();
  renderWishlist();
  renderCart();

  document.querySelectorAll('.product-filters button').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.textContent.trim().toLowerCase();
      document.querySelectorAll('.product-filters button').forEach((item) => item.classList.toggle('is-active', item === button));
      document.querySelectorAll('.product-card-wrap').forEach((card) => {
        const visible = filter === 'all' || card.dataset.category === filter;
        card.hidden = !visible;
      });
      announce(`${button.textContent.trim()} products selected.`);
    });
  });

  document.querySelectorAll('.product-card a[href="#featured-product"]').forEach((link) => {
    link.addEventListener('click', () => {
      const name = link.querySelector('h3')?.textContent.trim();
      const index = products.findIndex((product) => product.name === name);
      if (index >= 0) setFeaturedProduct(index);
    });
  });

  document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('newsletter-email');
    if (!input?.value.trim() || !input.checkValidity()) {
      input?.focus();
      announce('Enter a valid email address to join the Drop Club.');
      return;
    }
    event.currentTarget.reset();
    announce('You are in. Welcome to the UrbanStep Drop Club.');
    showToast('Welcome to the Drop Club');
  });

  document.getElementById('btn-profile')?.addEventListener('click', () => {
    announce('Account sign-in will be available with checkout.');
    showToast('Account sign-in coming soon');
  });
  document.getElementById('btn-buy-now')?.addEventListener('click', () => {
    document.getElementById('featured-product')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    announce('Choose your size to complete your purchase.');
  });
  document.querySelectorAll('a[href="#size-guide"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      announce('UrbanStep sizes run true to size. Choose your usual sneaker size.');
      showToast('Fit guide: choose your usual sneaker size');
    });
  });

  // Accessible review slider: buttons, dots, keyboard keys, and responsive paging.
  const reviewTrack = document.querySelector('.review-slider__track');
  const reviewCards = Array.from(document.querySelectorAll('.review-slider .review-card'));
  const reviewCount = document.querySelector('.review-slider__count');
  const reviewDots = Array.from(document.querySelectorAll('.review-slider__dots button'));
  let reviewIndex = 0;

  function visibleReviewCount() {
    if (window.matchMedia('(min-width: 992px)').matches) return 2;
    if (window.matchMedia('(min-width: 768px)').matches) return 2;
    return 1;
  }

  function renderReviewSlider(index) {
    if (!reviewTrack || !reviewCards.length) return;
    const visible = visibleReviewCount();
    const maxIndex = Math.max(0, reviewCards.length - visible);
    reviewIndex = Math.min(Math.max(index, 0), maxIndex);
    const gap = visible === 1 ? 0 : 20;
    const slideWidth = (reviewTrack.parentElement.clientWidth - gap * (visible - 1)) / visible + gap;
    reviewTrack.style.transform = `translateX(${-reviewIndex * slideWidth}px)`;
    if (reviewCount) reviewCount.textContent = `${String(reviewIndex + 1).padStart(2, '0')} / ${String(reviewCards.length).padStart(2, '0')}`;
    reviewDots.forEach((dot, dotIndex) => {
      const active = dotIndex === reviewIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  }

  document.querySelectorAll('[data-review-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.reviewDirection === 'next' ? 1 : -1;
      const maxIndex = Math.max(0, reviewCards.length - visibleReviewCount());
      renderReviewSlider(reviewIndex + direction > maxIndex ? 0 : reviewIndex + direction < 0 ? maxIndex : reviewIndex + direction);
    });
  });
  reviewDots.forEach((dot, index) => dot.addEventListener('click', () => renderReviewSlider(index)));
  document.querySelector('.review-slider')?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') renderReviewSlider(reviewIndex + 1);
    if (event.key === 'ArrowLeft') renderReviewSlider(reviewIndex - 1);
  });
  window.addEventListener('resize', () => renderReviewSlider(reviewIndex));
  renderReviewSlider(0);

  // Keep the FAQ calm and focused by showing one answer at a time.
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item[open]').forEach((openItem) => {
        if (openItem !== item) openItem.open = false;
      });
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('site-header');
      const hamburger = document.getElementById('hamburger-btn');
      if (menu?.classList.contains('nav-open')) {
        menu.classList.remove('nav-open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();
