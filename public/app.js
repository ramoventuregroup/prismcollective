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
      return `<span class="price-old">$${compare.toFixed(2)}</span><span class="price-current">$${price.toFixed(2)}</span>`;
    }
    return `<span class="price-current">$${price.toFixed(2)}</span>`;
  }

  function getBadgeHTML(badges) {
    if (!badges || !badges.length) return '';
    const map = { bestseller: 'Best Seller', onsale: 'Sale', limited: 'Limited' };
    return badges.map(b => {
      const cls = b === 'bestseller' ? '' : 'green';
      return `<span class="product-badge ${cls}">${map[b] || b}</span>`;
    }).join('');
  }

  function getProductCard(product, delay) {
    const img = product.images && product.images[0]
      ? product.images[0]
      : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23ECFDF5"><rect width="400" height="400"/></svg>';
    const detailUrl = `product.html?handle=${product.handle}`;
    const badges = getBadgeHTML(product.badges);
    const stars = getStars(product.rating);
    const price = getPriceHTML(product.price, product.compare_at);
    const title = product.title.replace(/"/g, '&quot;');
    const reviews = product.reviews || 0;

    return `
      <div class="product-card fade-in fade-in-delay-${delay || 1}">
        <a href="${detailUrl}" class="product-card-link">
          <div class="product-img-wrap">
            <img src="${img}" alt="${title}" loading="lazy">
            ${badges ? `<div class="product-badges">${badges}</div>` : ''}
          </div>
          <div class="product-body">
            <h3 class="product-title">${title}</h3>
            <div class="stars">
              <span class="star">${stars}</span>
              <span class="rating-count">(${reviews})</span>
            </div>
            ${price}
          </div>
        </a>
        <div class="product-actions">
          <button class="quick-add-btn" data-pid="${product.id}">Quick Add</button>
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

      setTimeout(showPopup, 5000);
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 10) showPopup();
      });

      const popupForm = document.querySelector('.popup-form');
      if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          closePopup();
          showToast('🎉', 'Your discount code: PRISM10 — saved!');
        });
      }
    }

    // Toast
    window.showToast = function(icon, msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      const iconEl = document.getElementById('toast-icon');
      const msgEl = document.getElementById('toast-msg');
      if (iconEl) iconEl.textContent = icon;
      if (msgEl) msgEl.textContent = msg;
      toast.classList.add('show');
      clearTimeout(window._toastTimeout);
      window._toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    };

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
  window.addToCart = function(productId) {
    const url = `https://jv17sy-r4.myshopify.com/cart/${productId}:1`;
    window.open(url, '_blank');
  };

})();

// Quick add event delegation (defined outside IIFE to attach to future elements)
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.quick-add-btn');
  if (btn) {
    e.preventDefault();
    const pid = btn.dataset.pid;
    if (pid) {
      const url = `https://jv17sy-r4.myshopify.com/cart/${pid}:1`;
      window.open(url, '_blank');
      const toast = document.getElementById('toast');
      if (toast) {
        document.getElementById('toast-icon').textContent = '✅';
        document.getElementById('toast-msg').textContent = 'Added to cart!';
        toast.classList.add('show');
        clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
      }
    }
  }
});
