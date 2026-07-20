// ============================================
// PRODUCT DETAILS PAGE - MAIN LOGIC
// ============================================

class ProductDetails {
  constructor() {
    // Get product from URL parameter or localStorage
    this.productId = this.getProductIdFromUrl();
    this.product = this.loadProduct();

    // Redirect to home if product not found
    if (!this.product) {
      window.location.href = 'index.html';
      return;
    }

    this.selectedColor = this.product.colors?.[0] || 'Gold / Black';
    this.selectedSize = null;
    this.selectedQuantity = 1;
    this.maxQuantity = 10;

    this.initElements();
    this.attachEventListeners();
    this.displayProduct();
    this.loadReviews();
    this.loadRelatedProducts();
    this.initCartDrawer();
    this.initWishlistDrawer();
  }

  getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'gold-pulse';
  }

  loadProduct() {
    const products = {
      'gold-pulse': {
        id: 'gold-pulse',
        name: 'Gold Pulse',
        brand: 'UrbanStep',
        category: 'Performance / Running',
        price: 134.00,
        originalPrice: 179.00,
        image: 'images/gold_shoe.png',
        colors: ['Gold / Black', 'Blue Sapphire', 'Purple', 'Sky Shift'],
        colorImages: {
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png',
          'Purple': 'images/purple_shoe.png',
          'Sky Shift': 'images/sky_shoe.png'
        },
        colorValues: {
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba',
          'Purple': '#6b4ba8',
          'Sky Shift': '#87ceeb'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Inspired by the design of the latest Air Jordan game shoe, the UrbanStep Gold Pulse helps up-and-coming players level up their game.',
        rating: 4.9,
        reviewCount: 234,
        inStock: true,
        sku: 'US-GP-001'
      },
      'blue-sapphire': {
        id: 'blue-sapphire',
        name: 'Blue Sapphire',
        brand: 'UrbanStep',
        category: 'Performance / Running',
        price: 148.00,
        originalPrice: 198.00,
        image: 'images/blue_shoe.png',
        colors: ['Blue Sapphire', 'Gold / Black', 'Purple'],
        colorImages: {
          'Blue Sapphire': 'images/blue_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Purple': 'images/purple_shoe.png'
        },
        colorValues: {
          'Blue Sapphire': '#0f52ba',
          'Gold / Black': '#d4af37',
          'Purple': '#6b4ba8'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Premium performance sneaker with responsive cushioning and dynamic support.',
        rating: 4.9,
        reviewCount: 187,
        inStock: true,
        sku: 'US-BS-005'
      },
      'sky-shift': {
        id: 'sky-shift',
        name: 'Sky Shift',
        brand: 'UrbanStep',
        category: 'Everyday / Lifestyle',
        price: 126.00,
        originalPrice: 168.00,
        image: 'images/sky_shoe.png',
        colors: ['Sky Shift', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Sky Shift': 'images/sky_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Sky Shift': '#87ceeb',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Lightweight everyday sneaker perfect for any occasion.',
        rating: 4.8,
        reviewCount: 156,
        inStock: true,
        sku: 'US-SS-003'
      },
      'crimson-velocity': {
        id: 'crimson-velocity',
        name: 'Crimson Velocity',
        brand: 'UrbanStep',
        category: 'Running / Performance',
        price: 142.00,
        originalPrice: 185.00,
        image: 'images/red_shoe2.png',
        colors: ['Crimson / White', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Crimson / White': 'images/red_shoe2.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Crimson / White': '#dc143c',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'High-performance running sneaker with advanced cushioning technology.',
        rating: 4.9,
        reviewCount: 198,
        inStock: true,
        sku: 'US-CV-004'
      },
      'midnight-runner': {
        id: 'midnight-runner',
        name: 'Midnight Runner',
        brand: 'UrbanStep',
        category: 'Lifestyle / Street',
        price: 118.00,
        originalPrice: 155.00,
        image: 'images/navy_shoe.png',
        colors: ['Navy / Black', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Navy / Black': 'images/navy_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Navy / Black': '#001a33',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Sleek lifestyle sneaker perfect for urban exploration and everyday wear.',
        rating: 4.8,
        reviewCount: 142,
        inStock: true,
        sku: 'US-MR-002'
      },
      'scarlet-drift': {
        id: 'scarlet-drift',
        name: 'Scarlet Drift',
        brand: 'UrbanStep',
        category: 'Lifestyle / Street',
        price: 118.00,
        originalPrice: 147.00,
        image: 'images/red_shoe.png',
        colors: ['Navy / Black', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Navy / Black': 'images/navy_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Navy / Black': '#001a33',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Sleek lifestyle sneaker perfect for urban exploration and everyday wear.',
        rating: 4.8,
        reviewCount: 142,
        inStock: true,
        sku: 'US-MR-002'
      },
      'grey-motion': {
        id: 'grey-motion',
        name: 'Grey Motion',
        brand: 'UrbanStep',
        category: 'Lifestyle / Street',
        price: 149.00,
        originalPrice: 189.00,
        image: 'images/purple_shoe.png',
        colors: ['Navy / Black', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Navy / Black': 'images/navy_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Navy / Black': '#001a33',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Sleek lifestyle sneaker perfect for urban exploration and everyday wear.',
        rating: 4.8,
        reviewCount: 142,
        inStock: true,
        sku: 'US-MR-002'
      },
      'azure-eclipse': {
        id: 'azure-eclipse',
        name: 'Azure Eclipse',
        brand: 'UrbanStep',
        category: 'Lifestyle / Street',
        price: 149.00,
        originalPrice: 189.00,
        image: 'images/blue_shoe2.png',
        colors: ['Navy / Black', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Navy / Black': 'images/navy_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Navy / Black': '#001a33',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Sleek lifestyle sneaker perfect for urban exploration and everyday wear.',
        rating: 4.8,
        reviewCount: 142,
        inStock: true,
        sku: 'US-MR-002'
      },
      'luxe-gold': {
        id: 'luxe-gold',
        name: 'Luxe Gold',
        brand: 'UrbanStep',
        category: 'Lifestyle / Street',
        price: 189.00,
        originalPrice: 219.00,
        image: 'images/gold_shoe2.png',
        colors: ['Navy / Black', 'Gold / Black', 'Blue Sapphire'],
        colorImages: {
          'Navy / Black': 'images/navy_shoe.png',
          'Gold / Black': 'images/gold_shoe.png',
          'Blue Sapphire': 'images/blue_shoe.png'
        },
        colorValues: {
          'Navy / Black': '#001a33',
          'Gold / Black': '#d4af37',
          'Blue Sapphire': '#0f52ba'
        },
        sizes: ['7', '8', '9', '10', '11', '12', '13', '14'],
        description: 'Sleek lifestyle sneaker perfect for urban exploration and everyday wear.',
        rating: 4.8,
        reviewCount: 142,
        inStock: true,
        sku: 'US-MR-002'
      }
    };
    return products[this.productId] || null;
  }

  displayProduct() {
    // Update page title
    document.getElementById('product-title').textContent = this.product.name;

    // Update basic info
    document.querySelector('.product-brand').textContent = this.product.brand;
    document.querySelector('.product-category').textContent = this.product.category;

    // Update pricing
    document.querySelector('.price-current').textContent = '$' + this.product.price.toFixed(2);
    document.querySelector('.price-original').textContent = '$' + this.product.originalPrice.toFixed(2);

    // Update main image
    this.mainImage.src = this.product.image;

    // Update rating
    document.querySelector('.rating-value').textContent = this.product.rating;
    document.querySelector('.review-count').textContent = '(' + this.product.reviewCount + ' reviews)';

    // Update color swatches
    this.updateColorSwatches();

    // Update selected color
    this.selectedColor = this.product.colors?.[0] || 'Gold / Black';
    document.getElementById('selected-color').textContent = this.selectedColor;

    // Update SKU
    document.querySelector('.sku').textContent = 'SKU: ' + this.product.sku;
  }

  updateColorSwatches() {
    const swatchContainer = document.querySelector('.color-swatches');
    swatchContainer.innerHTML = '';

    this.product.colors?.forEach((color, index) => {
      const button = document.createElement('button');
      button.className = 'color-swatch' + (index === 0 ? ' active' : '');
      button.dataset.color = color;
      button.dataset.colorValue = this.product.colorValues[color];
      button.dataset.image = this.product.colorImages[color];
      button.style.backgroundColor = this.product.colorValues[color];
      button.setAttribute('aria-label', color + (index === 0 ? ' (Selected)' : ''));
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.setAttribute('title', color);
      button.addEventListener('click', (e) => this.selectColor(e));

      swatchContainer.appendChild(button);
    });

    // Re-bind color swatches
    this.colorSwatches = document.querySelectorAll('.color-swatch');
  }


  initElements() {
    // Image Gallery
    this.mainImage = document.getElementById('main-product-image');
    this.mainImageWrap = document.getElementById('main-image-wrap');
    this.thumbnails = document.querySelectorAll('.thumbnail');
    this.magnifier = document.getElementById('magnifier');

    // Product Info
    this.selectedColorDisplay = document.getElementById('selected-color');
    this.colorSwatches = document.querySelectorAll('.color-swatch');
    this.sizeBtns = document.querySelectorAll('.size-btn');
    this.sizeError = document.getElementById('size-error');

    // Quantity
    this.quantityInput = document.getElementById('quantity-input');
    this.qtyMinusBtn = document.querySelector('.qty-minus');
    this.qtyPlusBtn = document.querySelector('.qty-plus');

    // Buttons
    this.addToCartBtn = document.getElementById('btn-add-to-cart');
    this.buyNowBtn = document.getElementById('btn-buy-now');
    // this.wishlistBtn = document.getElementById('btn-wishlist-product');
    // this.shareBtn = document.getElementById('btn-share');

    // Tabs
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');

    // Reviews & Related
    this.reviewsContainer = document.getElementById('reviews-container');
    this.loadMoreReviewsBtn = document.getElementById('btn-load-more-reviews');
    this.relatedProductsContainer = document.querySelector('.product-grid');

    // Header Actions
    this.cartBadge = document.querySelector('.cart-badge');
    this.wishlistBadge = document.querySelector('.wishlist-badge');
    this.cartDrawerBtn = document.getElementById('btn-cart');
    this.wishlistDrawerBtn = document.getElementById('btn-wishlist');
    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartItems = document.getElementById('cart-items');
    this.wishlistDrawer = document.getElementById('wishlist-drawer');
    this.wishlistItems = document.getElementById('wishlist-items');
  }

  attachEventListeners() {
    // Image Gallery
    this.thumbnails.forEach(thumb => {
      thumb.addEventListener('click', e => this.changeThumbnail(e));
    });

    this.mainImageWrap.addEventListener('mousemove', e => this.updateMagnifier(e));
    this.mainImageWrap.addEventListener('mouseleave', () => {
      this.magnifier.style.opacity = '0';
    });

    // Color Selection
    this.colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', e => this.selectColor(e));
    });

    // Size Selection
    this.sizeBtns.forEach(btn => {
      btn.addEventListener('click', e => this.selectSize(e));
    });

    // Quantity
    this.quantityInput.addEventListener('change', e => this.updateQuantity(e));
    this.qtyMinusBtn.addEventListener('click', () => this.decreaseQuantity());
    this.qtyPlusBtn.addEventListener('click', () => this.increaseQuantity());

    // Buttons
    this.addToCartBtn.addEventListener('click', () => this.addToCart());
    this.buyNowBtn.addEventListener('click', () => this.buyNow());
    // this.wishlistBtn.addEventListener('click', () => this.toggleWishlist());
    // this.shareBtn.addEventListener('click', () => this.shareProduct());

    // Tabs
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', e => this.switchTab(e));
    });

    // Load More Reviews
    if (this.loadMoreReviewsBtn) {
      this.loadMoreReviewsBtn.addEventListener('click', () => this.loadMoreReviews());
    }

    // Header Drawers
    this.cartDrawerBtn.addEventListener('click', () => this.toggleCartDrawer());
    this.wishlistDrawerBtn.addEventListener('click', () => this.toggleWishlistDrawer());

    // Close buttons
    document.getElementById('cart-close')?.addEventListener('click', () => this.closeCartDrawer());
    document.getElementById('wishlist-close')?.addEventListener('click', () => this.closeWishlistDrawer());

    // Overlay clicks
    document.getElementById('cart-overlay')?.addEventListener('click', () => this.closeCartDrawer());
    document.getElementById('wishlist-overlay')?.addEventListener('click', () => this.closeWishlistDrawer());

    // Close drawers on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.cartDrawer && this.cartDrawer.getAttribute('aria-hidden') === 'false') {
          this.closeCartDrawer();
        }
        if (this.wishlistDrawer && this.wishlistDrawer.getAttribute('aria-hidden') === 'false') {
          this.closeWishlistDrawer();
        }
      }
    });
  }

  // ========== IMAGE GALLERY ==========
  changeThumbnail(e) {
    const thumbnail = e.currentTarget;
    const src = thumbnail.dataset.src;

    // Update main image
    this.mainImage.src = src;

    // Update active state
    this.thumbnails.forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');

    // Smooth fade animation
    this.mainImage.style.animation = 'none';
    setTimeout(() => {
      this.mainImage.style.animation = 'fadeIn 0.3s ease';
    }, 10);
  }

  updateMagnifier(e) {
    const rect = this.mainImageWrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.magnifier.style.left = (x - 60) + 'px';
    this.magnifier.style.top = (y - 60) + 'px';
  }

  // ========== VARIANT SELECTION ==========
  selectColor(e) {
    const swatch = e.currentTarget;
    const color = swatch.dataset.color;
    const image = swatch.dataset.image;

    // Update selection
    this.selectedColor = color;
    this.selectedColorDisplay.textContent = color;

    // Update active state
    this.colorSwatches.forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-pressed', 'false');
    });
    swatch.classList.add('active');
    swatch.setAttribute('aria-pressed', 'true');
    swatch.setAttribute('aria-label', color + ' (Selected)');

    // Change main image with smooth transition
    this.mainImage.style.opacity = '0.7';
    setTimeout(() => {
      this.mainImage.src = image;
      this.mainImage.style.opacity = '1';
    }, 150);
  }

  selectSize(e) {
    const btn = e.currentTarget;
    const size = btn.dataset.size;

    // Update selection
    this.selectedSize = size;

    // Hide error if shown
    this.sizeError.classList.remove('show');

    // Update active state
    this.sizeBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  // ========== QUANTITY MANAGEMENT ==========
  updateQuantity(e) {
    let value = parseInt(e.target.value) || 1;
    value = Math.max(1, Math.min(value, this.maxQuantity));
    this.selectedQuantity = value;
    this.quantityInput.value = value;
  }

  increaseQuantity() {
    if (this.selectedQuantity < this.maxQuantity) {
      this.selectedQuantity++;
      this.quantityInput.value = this.selectedQuantity;
    }
  }

  decreaseQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
      this.quantityInput.value = this.selectedQuantity;
    }
  }

  // ========== ADD TO CART ==========
  addToCart() {
    // Validate size selection
    if (!this.selectedSize) {
      this.sizeError.classList.add('show');
      this.sizeError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Create cart item using actual product data
    const cartItem = {
      id: `${this.product.id}-${this.selectedColor}-${this.selectedSize}`,
      name: this.product.name,
      brand: this.product.brand,
      price: this.product.price,
      originalPrice: this.product.originalPrice,
      image: this.product.image,
      color: this.selectedColor,
      size: this.selectedSize,
      quantity: this.selectedQuantity,
      timestamp: Date.now()
    };

    // Get cart from storage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if item already exists
    const existingItem = cart.find(item => item.id === cartItem.id);
    if (existingItem) {
      existingItem.quantity += this.selectedQuantity;
    } else {
      cart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    this.updateCartBadge();
    this.renderCartItems();
    this.openCartDrawer();
    
    this.showToast(`${this.selectedQuantity} item(s) added to cart!`, 'success');

    // Reset quantity
    this.selectedQuantity = 1;
    this.quantityInput.value = 1;
  }

  buyNow() {
    // Validate size
    if (!this.selectedSize) {
      this.sizeError.classList.add('show');
      this.sizeError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Add to cart and redirect
    this.addToCart();

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 500);
  }

  // ========== WISHLIST ==========
  toggleWishlist() {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    const item = {
      id: 'gold-pulse',
      name: 'Gold Pulse',
      brand: 'UrbanStep',
      price: 134.00,
      image: 'images/gold_shoe.png',
      color: this.selectedColor
    };

    const exists = wishlist.some(w => w.id === item.id);

    if (exists) {
      wishlist = wishlist.filter(w => w.id !== item.id);
      this.showToast('Removed from wishlist', 'info');
    } else {
      wishlist.push(item);
      this.showToast('Added to wishlist', 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    this.updateWishlistBadge();
    this.updateWishlistBtn();
  }

  // updateWishlistBtn() {
  //   const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  //   const isWishlisted = wishlist.some(w => w.id === 'gold-pulse');

  //   if (isWishlisted) {
  //     this.wishlistBtn.style.color = '#f0c040';
  //   } else {
  //     this.wishlistBtn.style.color = 'inherit';
  //   }
  // }

  // ========== SHARE ==========
  shareProduct() {
    const url = window.location.href;
    const text = 'Check out this amazing UrbanStep Gold Pulse sneaker!';

    if (navigator.share) {
      navigator.share({
        title: 'UrbanStep Gold Pulse',
        text: text,
        url: url
      }).catch(err => console.log('Share failed:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      this.showToast('Link copied to clipboard!', 'success');
    }
  }

  // ========== TABS ==========
  switchTab(e) {
    const btn = e.currentTarget;
    const tabId = btn.getAttribute('aria-controls');

    // Update buttons
    this.tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Update panels
    this.tabPanels.forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
  }

  // ========== REVIEWS ==========
  loadReviews(loadMore = false) {
    const reviews = [
      {
        rating: 5,
        text: "The fit is locked in, but it still feels impossibly light. My new everyday pair.",
        author: "Jordan M.",
        product: "Gold Pulse",
        verified: true
      },
      {
        rating: 5,
        text: "The cushioning is outstanding. I can feel the difference on longer runs.",
        author: "Priya S.",
        product: "Gold Pulse",
        verified: true
      },
      {
        rating: 5,
        text: "It turns heads without trying too hard. The quality is right there.",
        author: "Alex R.",
        product: "Gold Pulse",
        verified: true
      },
      {
        rating: 5,
        text: "Best investment I've made in sneakers. Worth every penny.",
        author: "Mike T.",
        product: "Gold Pulse",
        verified: true
      },
      {
        rating: 4,
        text: "Great shoe, very comfortable. Size runs slightly small.",
        author: "Sarah K.",
        product: "Gold Pulse",
        verified: true
      },
      {
        rating: 5,
        text: "Perfect for both gym and casual wear. Highly recommended!",
        author: "David L.",
        product: "Gold Pulse",
        verified: true
      }
    ];

    const reviewsHtml = reviews.map(review => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
          ${review.verified ? '<span class="verified-badge">Verified Purchase</span>' : ''}
        </div>
        <p class="review-text">"${review.text}"</p>
        <div class="review-meta">
          <div>
            <div class="reviewer-name">${review.author}</div>
            <div class="review-product">${review.product}</div>
          </div>
          <button class="review-helpful" aria-label="Mark review as helpful">👍 Helpful</button>
        </div>
      </div>
    `).join('');

    this.reviewsContainer.innerHTML = reviewsHtml;

    // Add event listeners to helpful buttons
    document.querySelectorAll('.review-helpful').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.style.opacity = '0.5';
        btn.disabled = true;
        this.showToast('Thank you for your feedback!', 'success');
      });
    });
  }

  loadMoreReviews() {
    this.showToast('Loading more reviews...', 'info');
    setTimeout(() => {
      this.loadReviews(true);
      this.showToast('More reviews loaded!', 'success');
    }, 500);
  }

  // ========== RELATED PRODUCTS ==========
  loadRelatedProducts() {
    const products = [
      {
        name: 'Blue Sapphire',
        category: 'Performance',
        price: 148.00,
        image: 'images/blue_shoe.png'
      },
      {
        name: 'Crimson Velocity',
        category: 'Running',
        price: 142.00,
        image: 'images/red_shoe2.png'
      },
      {
        name: 'Sky Shift',
        category: 'Everyday',
        price: 126.00,
        image: 'images/sky_shoe.png'
      },
      {
        name: 'Midnight Runner',
        category: 'Lifestyle',
        price: 118.00,
        image: 'images/navy_shoe.png'
      }
    ];

    const productsHtml = products.map((product, idx) => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}" class="product-card-img" />
        <div class="product-card-info">
          <h3 class="product-card-name">${product.name}</h3>
          <p class="product-card-category">${product.category}</p>
          <div class="product-card-price">$${product.price.toFixed(2)}</div>
        </div>
        <button class="product-card-button" data-index="${idx}">Quick Add</button>
      </div>
    `).join('');

    this.relatedProductsContainer.innerHTML = productsHtml;

    // Add event listeners
    document.querySelectorAll('.product-card-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.index;
        const product = products[idx];
        this.addRelatedProductToCart(product);
      });
    });
  }

  addRelatedProductToCart(product) {
    const cartItem = {
      id: `${product.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: product.name,
      brand: 'UrbanStep',
      price: product.price,
      image: product.image,
      color: 'As displayed',
      size: '10',
      quantity: 1,
      timestamp: Date.now()
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const exists = cart.find(item => item.id === cartItem.id);

    if (exists) {
      exists.quantity++;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartBadge();
    this.showToast(`${product.name} added to cart!`, 'success');
  }

  // ========== CART DRAWER ==========
  initCartDrawer() {
    this.updateCartBadge();
  }

  toggleCartDrawer() {
    if (this.cartDrawer.getAttribute('aria-hidden') === 'true') {
      this.openCartDrawer();
    } else {
      this.closeCartDrawer();
    }
  }

  openCartDrawer() {
    this.cartDrawer.setAttribute('aria-hidden', 'false');
    document.getElementById('cart-overlay').hidden = false;
    document.body.classList.add('cart-open');
    // Reload cart from localStorage to ensure fresh data
    this.renderCartItems();
  }

  closeCartDrawer() {
    this.cartDrawer.setAttribute('aria-hidden', 'true');
    document.getElementById('cart-overlay').hidden = true;
    document.body.classList.remove('cart-open');
  }

  renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
      this.cartItems.innerHTML = `
        <div style="padding: 40px 20px; text-align: center;">
          <p style="font-size: 18px; margin-bottom: 20px;">🛍️ Your cart is empty</p>
          <p style="color: rgba(0,0,0,0.65); font-size: 14px;">Add a pair and it will appear here instantly.</p>
          <a href="product-details.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #f0c040; color: #1a1a1a; border-radius: 8px; font-weight: 600; text-decoration: none;">Continue Shopping</a>
        </div>
      `;
      return;
    }

    const cartHtml = cart.map((item, idx) => `
      <div style="padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.08); display: flex; gap: 12px;">
        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain; background: #f9f9f9; border-radius: 8px;" />
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 14px;">${item.name}</div>
          <div style="font-size: 12px; color: rgba(0,0,0,0.65); margin-top: 2px;">${item.color} / Size ${item.size}</div>
          <div style="font-weight: 700; margin-top: 8px;">$${(item.price * item.quantity).toFixed(2)}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <button class="qty-btn-cart" data-index="${idx}" data-action="minus" style="width: 28px; height: 28px; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; cursor: pointer;">−</button>
            <span style="min-width: 30px; text-align: center; font-size: 14px; font-weight: 600;">${item.quantity}</span>
            <button class="qty-btn-cart" data-index="${idx}" data-action="plus" style="width: 28px; height: 28px; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; cursor: pointer;">+</button>
            <button class="remove-cart-item" data-index="${idx}" style="margin-left: auto; padding: 6px 12px; background: transparent; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; font-size: 12px; cursor: pointer; color: #ef4444;">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    this.cartItems.innerHTML = cartHtml + `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 16px; font-weight: 700;">
          <span>Subtotal:</span>
          <span>$${totalPrice.toFixed(2)}</span>
        </div>
        <a href="cart.html" style="display: block; width: 100%; padding: 14px; background: #f0c040; color: #1a1a1a; border: none; border-radius: 8px; text-align: center; font-weight: 700; text-decoration: none; cursor: pointer; margin-bottom: 10px;">View Cart</a>
        <a href="checkout.html" style="display: block; width: 100%; padding: 14px; background: #1a1a1a; color: white; border: none; border-radius: 8px; text-align: center; font-weight: 700; text-decoration: none; cursor: pointer;">Checkout</a>
      </div>
    `;

    // Event listeners
    document.querySelectorAll('.qty-btn-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const action = e.target.dataset.action;
        if (action === 'plus') {
          cart[idx].quantity++;
        } else if (action === 'minus' && cart[idx].quantity > 1) {
          cart[idx].quantity--;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.renderCartItems();
        this.updateCartBadge();
      });
    });

    document.querySelectorAll('.remove-cart-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        cart.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.renderCartItems();
        this.updateCartBadge();
      });
    });
  }

  updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartBadge.textContent = count;
  }

  // ========== WISHLIST DRAWER ==========
  // initWishlistDrawer() {
  //   this.updateWishlistBadge();
  //   this.updateWishlistBtn();
  // }

  toggleWishlistDrawer() {
    if (this.wishlistDrawer.getAttribute('aria-hidden') === 'true') {
      this.openWishlistDrawer();
    } else {
      this.closeWishlistDrawer();
    }
  }

  openWishlistDrawer() {
    this.wishlistDrawer.setAttribute('aria-hidden', 'false');
    document.getElementById('wishlist-overlay').hidden = false;
    document.body.classList.add('wishlist-open');
    this.renderWishlistItems();
  }

  closeWishlistDrawer() {
    this.wishlistDrawer.setAttribute('aria-hidden', 'true');
    document.getElementById('wishlist-overlay').hidden = true;
    document.body.classList.remove('wishlist-open');
  }

  renderWishlistItems() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.length === 0) {
      this.wishlistItems.innerHTML = `
        <div style="padding: 40px 20px; text-align: center;">
          <p style="font-size: 18px; margin-bottom: 20px;">❤️ Your wishlist is empty</p>
          <p style="color: rgba(0,0,0,0.65); font-size: 14px;">Save the pairs you want to come back to.</p>
        </div>
      `;
      return;
    }

    const wishlistHtml = wishlist.map((item, idx) => `
      <div style="padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.08); display: flex; gap: 12px;">
        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain; background: #f9f9f9; border-radius: 8px;" />
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 14px;">${item.name}</div>
          <div style="font-size: 12px; color: rgba(0,0,0,0.65); margin-top: 2px;">${item.brand}</div>
          <div style="font-weight: 700; margin-top: 8px;">$${item.price.toFixed(2)}</div>
          <button class="remove-wishlist-item" data-index="${idx}" style="margin-top: 8px; padding: 6px 12px; background: transparent; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; font-size: 12px; cursor: pointer; color: #ef4444;">Remove</button>
        </div>
      </div>
    `).join('');

    this.wishlistItems.innerHTML = wishlistHtml;

    document.querySelectorAll('.remove-wishlist-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        wishlist.splice(idx, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        this.renderWishlistItems();
        this.updateWishlistBadge();
      });
    });
  }

  updateWishlistBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    this.wishlistBadge.textContent = wishlist.length;
  }

  // ========== TOAST NOTIFICATIONS ==========
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  new ProductDetails();
});

// Add CSS animation
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
