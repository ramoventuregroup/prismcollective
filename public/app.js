/* ============================================
   PRISMCOLLECTIVE — App JavaScript
   Claude design + real product data rendering
   ============================================ */

(function() {
  'use strict';

  // === HELPERS ===
  function getStars(rating) {
    if (!rating) rating = 4.5;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
  }

  function getPriceHTML(price, compare) {
    if (compare && compare > price) {
      return `<span class="product-price-old">$${compare.toFixed(2)}</span><span class="product-price">$${price.toFixed(2)}</span>`;
    }
    return `<span class="product-price">$${price.toFixed(2)}</span>`;
  }

  function getBadgeHTML(badges) {
    if (!badges || !badges.length) return '';
    const map = { bestseller: 'Best Seller', onsale: 'Sale', limited: 'Limited' };
    return badges.map(b => {
      const cls = b === 'bestseller' ? '' : 'green';
      return `<div class="product-badge ${cls}">${map[b] || b}</div>`;
    }).join('');
  }

  function addToCart(btn) {
    cartCount++;
    const badge = document.getElementById('cart-count');
    badge.textContent = cartCount;
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
    showToast('✅', 'Added to cart successfully!');
  }

  function getProductCard(product, delay) {
    const img = product.images && product.images[0]
      ? product.images[0]
      : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23ECFDF5"><rect width="400" height="400"/></svg>';
    const checkoutUrl = `https://jv17sy-r4.myshopify.com/cart/${product.id}:1`;

    return `
      <div class="product-card fade-in fade-in-delay-${delay || 1}">
        <div class="product-img-wrap">
          <a href="${checkoutUrl}">
            <img src="${img}" alt="${product.title.replace(/"/g, '&quot;')}" loading="lazy">
          </a>
          ${getBadgeHTML(product.badges)}
          <div class="product-wishlist">🤍</div>
        </div>
        <div class="product-body">
          <h3 class="product-title">${product.title}</h3>
          <div class="stars">
            <span class="star">${getStars(product.rating)}</span>
            <span class="rating-count">(${product.reviews || 0})</span>
          </div>
          <div class="product-price-row">
            <div>${getPriceHTML(product.price, product.compare_at)}</div>
            <a href="${checkoutUrl}" class="add-cart-btn" aria-label="Add to cart">+</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderProducts(containerId, collectionHandle, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const col = PRISM_DATA.collections[collectionHandle];
    if (!col) return;

    const handles = col.product_handles || [];
    const products = handles
      .map(h => PRISM_DATA.products.find(p => p.handle === h))
      .filter(Boolean)
      .slice(0, count || 8);

    if (!products.length) return;

    container.innerHTML = products.map((p, i) => getProductCard(p, (i % 4) + 1)).join('');
  }

  // === EXISTING CLAUDE FUNCTIONS ===
  let cartCount = 0;

  let toastTimeout;
  function showToast(icon, msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const iconEl = document.getElementById('toast-icon');
    const msgEl = document.getElementById('toast-msg');
    if (iconEl) iconEl.textContent = icon;
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(hideToast, 3500);
  }
  function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
  }
  window.hideToast = hideToast;

  // === INIT ===
  document.addEventListener('DOMContentLoaded', function() {
    // Render product grids
    renderProducts('eco-home-grid', 'eco-home', 8);
    renderProducts('eco-pet-grid', 'eco-pet', 8);

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        const open = mobileNav.classList.toggle('open');
        hamburger.classList.toggle('open', open);
      });
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          hamburger.classList.remove('open');
        });
      });
      document.addEventListener('click', (e) => {
        if (mobileNav.classList.contains('open') &&
            !hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
          mobileNav.classList.remove('open');
          hamburger.classList.remove('open');
        }
      });
    }

    // Scroll glass header
    const header = document.getElementById('main-header');
    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // Intersection Observer fade-in
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

    // Newsletter
    const newsForm = document.getElementById('newsletter-form');
    if (newsForm) {
      newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email');
        if (!email || !email.value || !email.value.includes('@')) {
          showToast('⚠️', 'Please enter a valid email address.');
          return;
        }
        email.value = '';
        showToast('💚', 'Welcome to the green family! Check your inbox.');
      });
    }

    // Exit intent popup
    let popupShown = false;
    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) {
      function showPopup() {
        if (!popupShown) {
          popupShown = true;
          popupOverlay.classList.add('show');
        }
      }
      function closePopup() {
        popupOverlay.classList.remove('show');
      }
      window.closePopup = closePopup;

      const closeBtn = document.getElementById('popup-close');
      if (closeBtn) closeBtn.addEventListener('click', closePopup);
      popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) closePopup();
      });

      // Show after 5 seconds
      setTimeout(showPopup, 5000);
      // Exit intent
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 10) showPopup();
      });

      // Popup form
      const popupForm = document.querySelector('.popup-form');
      if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          closePopup();
          showToast('🎉', 'Your discount code: PRISM10 — saved!');
        });
      }
    }

    // Wishlist toggle
    document.querySelectorAll('.product-wishlist').forEach(btn => {
      btn.addEventListener('click', function() {
        this.textContent = this.textContent === '🤍' ? '❤️' : '🤍';
        if (this.textContent === '❤️') showToast('❤️', 'Added to wishlist!');
      });
    });

    // Keyboard escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (popupOverlay) popupOverlay.classList.remove('show');
        if (mobileNav) {
          mobileNav.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
        }
      }
    });

    // Re-observe fade-in after dynamic content loads
    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
    }, 200);
  });

  // Expose for inline onclick
  window.addToCart = addToCart;
  window.showToast = showToast;

})();
