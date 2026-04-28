/* ============================================
   PRISMCOLLECTIVE — Application JavaScript
   Mobile-first | All interactions
   ============================================ */

(function() {
  'use strict';

  const DATA = window.PRISM_DATA;
  const SHOPIFY_STORE = 'jv17sy-r4';

  /* --- Helpers --- */
  function qs(s, ctx) { return (ctx||document).querySelector(s); }
  function qsa(s, ctx) { return (ctx||document).querySelectorAll(s); }
  function $id(id) { return document.getElementById(id); }

  function getStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function getBadgeHTML(badges) {
    if (!badges || !badges.length) return '';
    const map = { bestseller: 'Best Seller', onsale: 'Sale', limited: 'Limited' };
    return badges.map(b => {
      const cls = `badge-${b}`;
      return `<span class="badge ${cls}">${map[b] || b}</span>`;
    }).join('');
  }

  function getPriceHTML(price, compare) {
    if (compare && compare > price) {
      return `<span class="price-current">$${price.toFixed(2)}</span><span class="price-compare">$${compare.toFixed(2)}</span>`;
    }
    return `<span class="price-current">$${price.toFixed(2)}</span>`;
  }

  function getProductCard(product) {
    const img = product.images && product.images[0] ? product.images[0] : '';
    return `
      <a href="/product.html?handle=${product.handle}" class="product-card fade-in">
        <div class="product-card__image-wrapper">
          <img src="${img}" alt="${product.title}" loading="lazy">
          <div class="product-card__badges">${getBadgeHTML(product.badges)}</div>
        </div>
        <div class="product-card__info">
          <div class="product-card__title">${product.title}</div>
          <div class="product-card__rating">
            <span class="stars">${getStars(product.rating || 4.5)}</span>
            <span class="review-count">(${product.reviews || 0})</span>
          </div>
          <div class="product-card__price">${getPriceHTML(product.price, product.compare_at)}</div>
        </div>
      </a>
    `;
  }

  function renderProductGrid(containerId, products) {
    const container = $id(containerId);
    if (!container) return;
    container.innerHTML = products.map(getProductCard).join('');
    setTimeout(() => {
      qsa('.fade-in', container).forEach(el => el.classList.add('visible'));
    }, 100);
  }

  function scrollToSection(section) {
    const map = {
      'bestsellers': 'bestsellers',
      'bundles': 'bundles',
      'eco-home': 'featuredHome',
      'eco-pet': 'petGrid'
    };
    const targetId = map[section];
    if (targetId) {
      const el = $id(targetId) || document.querySelector(`[data-section="${section}"]`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }

  /* --- Hamburger Menu --- */
  function initHamburger() {
    const btn = $id('hamburgerBtn');
    const nav = $id('headerNav');
    const overlay = $id('navOverlay');
    if (!btn || !nav) return;

    function closeMenu() {
      btn.classList.remove('active');
      nav.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }

    btn.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      if (isOpen) { closeMenu(); }
      else {
        btn.classList.add('active');
        nav.classList.add('open');
        if (overlay) overlay.classList.add('open');
      }
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close on nav link click
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* --- Search Toggle --- */
  function initSearch() {
    const toggle = $id('searchToggle');
    const bar = $id('searchBar');
    const input = $id('searchInput');
    const close = $id('searchClose');
    if (!toggle || !bar) return;

    toggle.addEventListener('click', () => {
      bar.classList.toggle('open');
      if (bar.classList.contains('open') && input) { input.focus(); }
    });

    if (close) close.addEventListener('click', () => bar.classList.remove('open'));

    if (input) {
      input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        if (q.length < 2) return;
        const results = DATA.products.filter(p =>
          p.title.toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q))
        ).slice(0, 5);
        // Show results — for simplicity, navigate to shop-all with search param
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = input.value.trim();
          if (q) window.location.href = `/collections.html?collection=shop-all&q=${encodeURIComponent(q)}`;
        }
      });
    }
  }

  /* --- Exit Intent Popup --- */
  function initPopup() {
    const overlay = $id('popupOverlay');
    if (!overlay) return;
    const close = $id('popupClose');
    const form = $id('popupForm');

    // Check cookie
    if (document.cookie.includes('prism_popup=')) return;

    function showPopup() {
      overlay.classList.add('open');
    }

    function hidePopup() {
      overlay.classList.remove('open');
      document.cookie = 'prism_popup=1; max-age=' + (30*24*60*60) + '; path=/';
    }

    // Show after 5 seconds
    setTimeout(showPopup, 5000);

    // Exit intent
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !overlay.classList.contains('open') && !document.cookie.includes('prism_popup=')) {
        showPopup();
      }
    });

    if (close) close.addEventListener('click', hidePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hidePopup();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        if (email) {
          hidePopup();
          showToast('Check your email for your discount code!');
          // Could also POST to Shopify customer API
        }
      });
    }
  }

  /* --- Newsletter --- */
  function initNewsletter() {
    const form = $id('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (email) {
        showToast('Thanks for joining! Check your inbox.');
        form.reset();
      }
    });
  }

  /* --- FAQ Accordion --- */
  function initFAQ() {
    qsa('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');

        // Close all others
        qsa('.faq-item.open').forEach(i => i.classList.remove('open'));

        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* --- Scroll Animations --- */
  function initScrollAnimation() {
    const els = qsa('.fade-in');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /* --- Counter Animation --- */
  function initCounters() {
    qsa('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target);
      if (!target) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(el);
    });

    function animateCounter(el, target) {
      let current = 0;
      const step = Math.ceil(target / 30);
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + (target === 100 ? '%' : '');
      }, 40);
    }
  }

  /* --- Toast --- */
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  /* --- Product Page --- */
  function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const handle = params.get('handle');
    if (!handle) return;

    const product = DATA.products.find(p => p.handle === handle);
    if (!product) {
      qs('.product-page .container').innerHTML = '<p>Product not found.</p>';
      return;
    }

    // Set title
    document.title = product.title + ' — PrismCollective';
    const bt = $id('breadcrumbTitle');
    if (bt) bt.textContent = product.title;

    // Set badges
    const badgeEl = $id('productBadges');
    if (badgeEl) badgeEl.innerHTML = getBadgeHTML(product.badges);

    // Set title
    const titleEl = $id('productTitle');
    if (titleEl) titleEl.textContent = product.title;

    // Rating
    const ratingEl = $id('productRating');
    if (ratingEl) {
      ratingEl.innerHTML = `<span class="stars">${getStars(product.rating || 4.5)}</span> <span>${product.rating || 4.5}</span> <span class="review-count">(${product.reviews || 0} reviews)</span>`;
    }

    // Price
    const priceEl = $id('productPrice');
    if (priceEl) priceEl.innerHTML = getPriceHTML(product.price, product.compare_at);

    // Description
    const descEl = $id('productDesc');
    if (descEl) descEl.innerHTML = `<p>${product.description}</p>`;

    // Gallery
    const mainImg = $id('mainImage');
    const thumbs = $id('galleryThumbs');
    if (mainImg && product.images.length) {
      mainImg.src = product.images[0] + '&width=600';
      mainImg.alt = product.title;

      if (thumbs) {
        product.images.forEach((img, i) => {
          const thumb = document.createElement('img');
          thumb.src = img + '&width=100';
          thumb.alt = product.title + ' ' + (i+1);
          if (i === 0) thumb.classList.add('active');
          thumb.addEventListener('click', () => {
            mainImg.src = img + '&width=600';
            thumbs.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
          });
          thumbs.appendChild(thumb);
        });
      }
    }

    // Quantity
    const qtyInput = $id('qtyInput');
    const qtyMinus = $id('qtyMinus');
    const qtyPlus = $id('qtyPlus');
    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
      });
      qtyPlus.addEventListener('click', () => {
        if (parseInt(qtyInput.value) < 99) qtyInput.value = parseInt(qtyInput.value) + 1;
      });
    }

    // Get variant ID from product data or fallback
    function getVariantQuantity() {
      return parseInt(qtyInput ? qtyInput.value : 1);
    }

    function buildCheckoutUrl() {
      return `https://${SHOPIFY_STORE}.myshopify.com/cart/${product.id}:${getVariantQuantity()}`;
    }

    // Add to Cart
    const addBtn = $id('addToCartBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.location.href = buildCheckoutUrl();
      });
    }

    // Buy Now
    const buyBtn = $id('buyNowBtn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        window.location.href = buildCheckoutUrl();
      });
    }

    // Sticky cart
    const stickyAdd = $id('stickyAddBtn');
    if (stickyAdd) {
      stickyAdd.addEventListener('click', () => {
        window.location.href = buildCheckoutUrl();
      });
    }
    const stickyPrice = $id('stickyPrice');
    if (stickyPrice) {
      stickyPrice.textContent = '$' + product.price.toFixed(2);
    }

    // Related products — same type/collections
    const related = DATA.products
      .filter(p => p.handle !== handle && p.collections.some(c => (product.collections||[]).includes(c)))
      .slice(0, 4);
    if (related.length) {
      renderProductGrid('relatedGrid', related);
    }
  }

  /* --- Collections Page --- */
  function initCollectionsPage() {
    const params = new URLSearchParams(window.location.search);
    const collHandle = params.get('collection') || 'shop-all';
    const searchQ = params.get('q') || '';

    const col = DATA.collections[collHandle];
    if (!col) return;

    // Title
    const titleEl = $id('collectionTitle');
    if (titleEl) titleEl.textContent = col.title;

    // Collection nav
    const nav = $id('collectionNav');
    if (nav) {
      Object.entries(DATA.collections).forEach(([handle, c]) => {
        const a = document.createElement('a');
        a.href = `/collections.html?collection=${handle}`;
        a.textContent = c.title;
        if (handle === collHandle) a.classList.add('active');
        nav.appendChild(a);
      });
    }

    // Products
    const handles = col.product_handles || [];
    const products = handles
      .map(h => DATA.products.find(p => p.handle === h))
      .filter(Boolean);

    // Search filter
    let filtered = products;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      filtered = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.tags||[]).some(t => t.toLowerCase().includes(q))
      );
    }

    renderProductGrid('collectionGrid', filtered);
  }

  /* --- Homepage initializations --- */
  function initHomepage() {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section) {
      scrollToSection(section);
    }

    // Eco Home grid (first 8)
    const homeHandles = (DATA.collections['eco-home'] && DATA.collections['eco-home'].product_handles) || [];
    const homeProducts = homeHandles.map(h => DATA.products.find(p => p.handle === h)).filter(Boolean).slice(0, 8);
    renderProductGrid('homeGrid', homeProducts);

    // Eco Pet grid (first 8)
    const petHandles = (DATA.collections['eco-pet'] && DATA.collections['eco-pet'].product_handles) || [];
    const petProducts = petHandles.map(h => DATA.products.find(p => p.handle === h)).filter(Boolean).slice(0, 8);
    renderProductGrid('petGrid', petProducts);

    // Best Sellers grid
    const bestsellers = DATA.products.filter(p => (p.badges||[]).includes('bestseller')).slice(0, 8);
    renderProductGrid('bestsellersGrid', bestsellers);
  }

  /* --- Cart count --- */
  function initCartCount() {
    // Could track via localStorage or cookie
    const count = $id('cartCount');
    if (!count) return;
    // Try to detect if there's a cart count via URL params
    // For now keep it at 0
  }

  /* --- Contact Form --- */
  function initContactForm() {
    const form = $id('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent! We\'ll get back to you soon.');
      form.reset();
    });
  }

  /* --- Sticky Cart Visibility --- */
  function initStickyCart() {
    const sticky = document.querySelector('.sticky-cart');
    if (!sticky) return;
    // Show when scrolled past buy buttons
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        sticky.classList.toggle('visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    const mainActions = document.querySelector('.product-actions');
    if (mainActions) observer.observe(mainActions);
  }

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', () => {
    initHamburger();
    initSearch();
    initPopup();
    initNewsletter();
    initFAQ();
    initScrollAnimation();
    initCounters();
    initContactForm();
    initCartCount();

    const path = window.location.pathname;

    if (path === '/' || path === '' || path.endsWith('index.html')) {
      initHomepage();
    } else if (path.includes('product.html')) {
      initProductPage();
      initStickyCart();
    } else if (path.includes('collections.html')) {
      initCollectionsPage();
    }
  });

  // Re-run scroll animation for dynamically loaded content
  window.addEventListener('load', () => {
    initScrollAnimation();
    // Mark visible elements that are already in viewport
    qsa('.fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  });

})();
