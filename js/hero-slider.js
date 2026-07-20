const heroImage = document.getElementById('shoe-main-img');
const shoeWrap = document.getElementById('shoe-wrap');
const dots = Array.from(document.querySelectorAll('.nav-dot'));
const swatches = Array.from(document.querySelectorAll('.color-swatch'));
const searchButton = document.getElementById('btn-search');
const searchForm = document.getElementById('header-search');
const searchInput = document.getElementById('search-input');
const statusElement = document.getElementById('header-status');
const cartButton = document.getElementById('btn-cart');
const cartBadge = document.querySelector('.cart-badge');
const hamburgerBtn = document.getElementById('hamburger-btn');
const siteHeader = document.getElementById('site-header');

const slides = [
  {
    image: 'images/gold_shoe.png',
    badge: 'Exclusive',
    price: '$134',
    brand: 'UrbanStep',
    model: 'Gold Pulse'
  },
  {
    image: 'images/blue_shoe.png',
    badge: 'Exclusive',
    price: '$148',
    brand: 'UrbanStep',
    model: 'Blue Sapphire'
  },
  {
    image: 'images/purple_shoe.png',
    badge: 'New Drop',
    price: '$149',
    brand: 'UrbanStep',
    model: 'Grey Motion'
  },
  {
    image: 'images/sky_shoe.png',
    badge: 'Limited',
    price: '$159',
    brand: 'UrbanStep',
    model: 'Sky Shift'
  }
];

let activeSlide = 0;
let cartCount = Number(cartBadge?.textContent || 0);
let primaryImg = null;
let overlayImg = null;
let isTransitioning = false;
let pendingSlide = null;

function setupImageBuffer() {
  if (!shoeWrap) return;

  // If the page already has the main image, convert it to the primary buffer
  const existing = shoeWrap.querySelector('#shoe-main-img');
  if (existing) {
    primaryImg = existing;
    primaryImg.classList.add('primary-shoe');
  } else {
    primaryImg = document.createElement('img');
    primaryImg.id = 'shoe-main-img';
    primaryImg.className = 'hero__shoe-image primary-shoe';
    shoeWrap.appendChild(primaryImg);
  }

  // Create overlay image (for crossfade)
  overlayImg = shoeWrap.querySelector('.overlay-shoe');
  if (!overlayImg) {
    overlayImg = document.createElement('img');
    overlayImg.className = 'hero__shoe-image overlay-shoe';
    overlayImg.setAttribute('aria-hidden', 'true');
    shoeWrap.appendChild(overlayImg);
  }

  // Ensure overlay sits above primary
  primaryImg.style.position = 'relative';
  overlayImg.style.position = 'absolute';
  overlayImg.style.top = '0';
  overlayImg.style.left = '0';
  overlayImg.style.width = '100%';
  overlayImg.style.height = 'auto';
  overlayImg.style.pointerEvents = 'none';
}

function setStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

function renderSlide(index) {
  const slide = slides[index];
  if (!slide || !shoeWrap) return;

  // Keep the latest click while an image fade is running. This prevents the
  // text controls from getting ahead of the visible product image.
  if (isTransitioning) {
    pendingSlide = index;
    return;
  }

  // Update textual/meta info immediately
  const badge = document.getElementById('exclusive-badge');
  const price = document.getElementById('product-price');
  const brand = document.querySelector('.product__brand');
  const model = document.querySelector('.product__model');

  if (badge) badge.textContent = slide.badge;
  if (price) price.textContent = slide.price;
  if (brand) brand.textContent = slide.brand;
  if (model) model.textContent = slide.model;

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });

  swatches.forEach((swatch, swatchIndex) => {
    const isActive = swatchIndex === index;
    swatch.classList.toggle('active', isActive);
    swatch.setAttribute('aria-pressed', String(isActive));
  });

  // If we don't have buffer images, fall back to simple swap
  if (!primaryImg || !overlayImg) {
    if (heroImage) {
      heroImage.src = slide.image;
      heroImage.alt = `${slide.brand} ${slide.model} sneaker`;
    }
    activeSlide = index;
    return;
  }

  // If asking to render the currently active index, ensure the primary image matches
  if (activeSlide === index) {
    if (primaryImg && primaryImg.src && !primaryImg.src.includes(slide.image)) {
      primaryImg.src = slide.image;
      primaryImg.alt = `${slide.brand} ${slide.model} sneaker`;
    }
    activeSlide = index; // still update state
    return;
  }

  isTransitioning = true;

  // Prepare overlay with next image
  overlayImg.src = slide.image;
  overlayImg.alt = `${slide.brand} ${slide.model} sneaker`;
  overlayImg.classList.remove('fade-in');
  overlayImg.classList.remove('fade-out');
  primaryImg.classList.remove('fade-in');
  primaryImg.classList.remove('fade-out');

  // Force reflow so transitions run
  // eslint-disable-next-line no-unused-expressions
  overlayImg.offsetWidth;

  // Cross-fade: bring overlay up
  overlayImg.classList.add('fade-in');
  primaryImg.classList.add('fade-out');

  const cleanup = () => {
    // after transition, set primary to new image src and reset classes
    primaryImg.src = slide.image;
    primaryImg.alt = overlayImg.alt;
    primaryImg.classList.remove('fade-out');
    overlayImg.classList.remove('fade-in');
    isTransitioning = false;
    activeSlide = index;
    if (pendingSlide !== null && pendingSlide !== index) {
      const nextSlide = pendingSlide;
      pendingSlide = null;
      renderSlide(nextSlide);
    } else {
      pendingSlide = null;
    }
  };

  // Use transitionend when possible, fallback to timeout
  const onEnd = (e) => {
    if (e && e.target !== primaryImg) return;
    primaryImg.removeEventListener('transitionend', onEnd);
    cleanup();
  };

  primaryImg.addEventListener('transitionend', onEnd);
  // fallback
  setTimeout(() => {
    if (isTransitioning) {
      primaryImg.removeEventListener('transitionend', onEnd);
      cleanup();
    }
  }, 900);

}

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const nextIndex = Number(dot.dataset.slide);
    if (!Number.isNaN(nextIndex)) {
      renderSlide(nextIndex);
      setStatus(`Showing ${slides[nextIndex].model}`);
      // reset autoplay when user interacts
      resetAutoSlide();
    }
  });
});

swatches.forEach((swatch) => {
  swatch.addEventListener('click', () => {
    const nextIndex = Number(swatch.dataset.slide);
    if (!Number.isNaN(nextIndex)) {
      renderSlide(nextIndex);
      setStatus(`Color variant: ${slides[nextIndex].model}`);
      // reset autoplay when user interacts
      resetAutoSlide();
    }
  });
});

searchButton?.addEventListener('click', (event) => {
  event.preventDefault();
  searchForm?.classList.toggle('is-open');

  if (searchForm?.classList.contains('is-open')) {
    searchInput?.focus();
  } else {
    setStatus('');
  }
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput?.value.trim();
  if (!query) {
    setStatus('Please enter a sneaker name.');
    return;
  }

  searchForm.classList.remove('is-open');
  setStatus(`Showing results for “${query}”`);
});

cartButton?.addEventListener('click', () => {
  setStatus(`Your cart has ${cartCount} item${cartCount === 1 ? '' : 's'}.`);
});

// Hamburger toggle for mobile nav
if (hamburgerBtn && siteHeader) {
  hamburgerBtn.setAttribute('role', 'button');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = siteHeader.classList.toggle('nav-open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when clicking outside
  document.addEventListener('click', (ev) => {
    if (!siteHeader.classList.contains('nav-open')) return;
    if (!siteHeader.contains(ev.target)) {
      siteHeader.classList.remove('nav-open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ----------------------
// Autoplay (auto slide) — initialize after DOM ready
// ----------------------
let autoTimer = null;
const AUTO_DELAY = 5000; // ms

function startAutoSlide() {
  stopAutoSlide();
  if (slides.length <= 1) return;
  console.debug('hero-slider: startAutoSlide');
  autoTimer = setInterval(() => {
    const next = (activeSlide + 1) % slides.length;
    renderSlide(next);
  }, AUTO_DELAY);
}

function stopAutoSlide() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    console.debug('hero-slider: stopAutoSlide');
  }
}

function resetAutoSlide() {
  stopAutoSlide();
  // small delay before restarting to avoid immediate change after click
  setTimeout(startAutoSlide, 800);
}

function bindHoverPause(heroEl) {
  // Only bind hover pause on devices that support hover
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    heroEl.addEventListener('mouseenter', stopAutoSlide);
    heroEl.addEventListener('mouseleave', startAutoSlide);
    heroEl.addEventListener('focusin', stopAutoSlide);
    heroEl.addEventListener('focusout', startAutoSlide);
  }
}

// Pause when tab inactive
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoSlide(); else startAutoSlide();
});

function initSlider() {
  setupImageBuffer();
  renderSlide(activeSlide);

  const heroEl = document.getElementById('hero');
  if (heroEl) bindHoverPause(heroEl);

  // safely start autoplay after a short delay
  setTimeout(() => startAutoSlide(), 100);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initSlider();
} else {
  document.addEventListener('DOMContentLoaded', initSlider);
}
