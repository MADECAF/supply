/**
 * MADECAF — Main Client Engine
 * Features:
 * 1. 40-Second Apple Cinema Canvas Engine (4 Synchronized Terroir Scenes)
 * 2. Interactive B2B Shopping Cart with LocalStorage & Promo Codes (WELCOME15, MADAGASCAR)
 * 3. Algorithmic Coffee Sommelier (Sensory Matchmaker)
 * 4. B2B Checkout & Wholesale Modals with WhatsApp Link Generator
 * 5. Dynamic UI Controllers (Toast, Filter Tabs, Format Selectors)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. DATA & STATE MANAGEMENT
  // =========================================================================
  const PRODUCTS_DATA = {
    p1: {
      id: 'p1',
      name: 'Highland Robusta',
      origin: 'Madagascar',
      type: 'Green Robusta',
      process: 'Natural (Dry Process)',
      description: 'Full-bodied with earthy notes, suitable for everyday coffee blends.',
      basePrice: 80.00,
      formats: {
        '1kg': { label: '1 kg Sample', price: 80.00, multiplier: 1 },
        '5kg': { label: '5 kg Pilot Order', price: 212.50, multiplier: 2.656 },
        '60kg': { label: 'Wholesale (min. 60 kg)', price: 0, isWholesale: true }
      }
    },
    p2: {
      id: 'p2',
      name: 'Select Robusta',
      origin: 'Madagascar',
      type: 'Green Robusta',
      process: 'Washed (Wet Process)',
      description: 'A balanced coffee option for roasters seeking a versatile Robusta with a distinctive Malagasy origin.',
      basePrice: 80.00,
      formats: {
        '1kg': { label: '1 kg Sample', price: 80.00, multiplier: 1 },
        '5kg': { label: '5 kg Pilot Order', price: 212.50, multiplier: 2.656 },
        '60kg': { label: 'Wholesale (min. 60 kg)', price: 0, isWholesale: true }
      }
    },
    p3: {
      id: 'p3',
      name: 'Signature Robusta',
      origin: 'Madagascar',
      type: 'Green Robusta',
      process: 'Honey Process',
      description: 'A distinctive specialty option for roasters exploring different processing methods and signature blends.',
      basePrice: 80.00,
      formats: {
        '1kg': { label: '1 kg Sample', price: 80.00, multiplier: 1 },
        '5kg': { label: '5 kg Pilot Order', price: 212.50, multiplier: 2.656 },
        '60kg': { label: 'Wholesale (min. 60 kg)', price: 0, isWholesale: true }
      }
    }
  };

  const PROMO_CODES = {
    'WELCOME15': { discount: 0.15, label: '15% Off Welcome Promo' },
    'MADAGASCAR': { discount: 0.10, label: '10% Off Direct Origin' }
  };

  let cart = [];
  let appliedPromo = null;

  // Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const stored = localStorage.getItem('madecaf_cart');
      if (stored) {
        cart = JSON.parse(stored);
      }
      const storedPromo = localStorage.getItem('madecaf_promo');
      if (storedPromo && PROMO_CODES[storedPromo]) {
        appliedPromo = storedPromo;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
      cart = [];
    }
  };

  const saveCartToStorage = () => {
    try {
      localStorage.setItem('madecaf_cart', JSON.stringify(cart));
      if (appliedPromo) {
        localStorage.setItem('madecaf_promo', appliedPromo);
      } else {
        localStorage.removeItem('madecaf_promo');
      }
    } catch (e) {
      console.warn('Could not write to localStorage', e);
    }
  };

  // =========================================================================
  // 2. UI NOTIFICATIONS & TOASTS
  // =========================================================================
  const showToast = (message, duration = 3500) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>&#10003;</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // =========================================================================
  // 3. CART CONTROLLER & SLIDE-OVER DRAWER
  // =========================================================================
  const cartSlideover = document.getElementById('cartSlideover');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const btnContinueShopping = document.getElementById('btnContinueShopping');
  const btnContactFromCart = document.getElementById('btnContactFromCart');
  const cartCounter = document.getElementById('cartCounter');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');
  const discountRow = document.getElementById('discountRow');
  const discountCodeName = document.getElementById('discountCodeName');
  const cartDiscountEl = document.getElementById('cartDiscount');
  const promoInput = document.getElementById('promoInput');
  const btnApplyPromo = document.getElementById('btnApplyPromo');
  const promoFeedback = document.getElementById('promoFeedback');

  const openCart = () => {
    cartSlideover.classList.add('active');
    cartBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    cartSlideover.classList.remove('active');
    cartBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (openCartBtn) openCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
  if (btnContinueShopping) btnContinueShopping.addEventListener('click', closeCart);
  if (btnContactFromCart) {
    btnContactFromCart.addEventListener('click', () => {
      closeCart();
    });
  }

  const renderCart = () => {
    // Update counter
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCounter) cartCounter.textContent = totalItems;

    // Render items
    if (!cartItemsList) return;
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p><strong>Your sample cart is empty.</strong></p>
          <p style="font-size:0.85rem; margin-top:0.4rem;">Explore our Malagasy Robusta catalogue and request 1kg cupping or 5kg pilot test pouches.</p>
        </div>
      `;
    } else {
      cartItemsList.innerHTML = cart.map((item, idx) => `
        <div class="cart-item-card" data-index="${idx}">
          <div class="cart-item-top">
            <div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-format">${item.formatLabel} &bull; Unit: RM ${item.price.toFixed(2)}</div>
            </div>
            <button class="cart-item-remove" data-action="remove" data-index="${idx}" aria-label="Remove item">Remove</button>
          </div>
          <div class="cart-item-bottom">
            <div class="qty-controls">
              <button class="qty-btn" data-action="decrease" data-index="${idx}" aria-label="Decrease quantity">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" data-action="increase" data-index="${idx}" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item-price">RM ${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        </div>
      `).join('');
    }

    // Calculate totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discountAmount = 0;

    if (appliedPromo && PROMO_CODES[appliedPromo]) {
      const rate = PROMO_CODES[appliedPromo].discount;
      discountAmount = subtotal * rate;
      if (discountRow) {
        discountRow.style.display = 'flex';
        discountCodeName.textContent = appliedPromo;
        cartDiscountEl.textContent = `-RM ${discountAmount.toFixed(2)}`;
      }
    } else if (discountRow) {
      discountRow.style.display = 'none';
    }

    const grandTotal = Math.max(0, subtotal - discountAmount);

    if (cartSubtotalEl) cartSubtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `RM ${grandTotal.toFixed(2)}`;

    saveCartToStorage();
  };

  // Cart item actions (Event delegation)
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      const index = parseInt(target.getAttribute('data-index'), 10);

      if (action === 'increase') {
        cart[index].quantity += 1;
        renderCart();
      } else if (action === 'decrease') {
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }
        renderCart();
      } else if (action === 'remove') {
        cart.splice(index, 1);
        renderCart();
        showToast('Item removed from cart');
      }
    });
  }

  // Promo Code Validation
  if (btnApplyPromo && promoInput) {
    btnApplyPromo.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      if (PROMO_CODES[code]) {
        appliedPromo = code;
        promoFeedback.className = 'promo-feedback success';
        promoFeedback.textContent = `Promo code "${code}" successfully applied (${PROMO_CODES[code].label})!`;
        promoFeedback.style.display = 'block';
        renderCart();
        showToast(`Promo "${code}" applied!`);
      } else {
        promoFeedback.className = 'promo-feedback error';
        promoFeedback.textContent = `Invalid code. Try "WELCOME15" (-15%) or "MADAGASCAR" (-10%).`;
        promoFeedback.style.display = 'block';
      }
    });
  }

  // Add to cart helper function
  const addToCart = (productId, formatKey = '1kg') => {
    const product = PRODUCTS_DATA[productId];
    if (!product) return;

    const formatData = product.formats[formatKey];
    if (!formatData) return;

    if (formatData.isWholesale) {
      openWholesaleModal(product.name);
      return;
    }

    const existingIndex = cart.findIndex(item => item.id === productId && item.formatKey === formatKey);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        formatKey: formatKey,
        formatLabel: formatData.label,
        price: formatData.price,
        quantity: 1
      });
    }

    renderCart();
    openCart();
    showToast(`Added ${product.name} (${formatKey}) to cart`);
  };

  // =========================================================================
  // 4. PRODUCT CATALOGUE CONTROLLERS (Tabs, Format Selector, Add to Cart)
  // =========================================================================
  const productGrid = document.getElementById('productGrid');
  const catTabBtns = document.querySelectorAll('.cat-tab-btn');

  // Filter tabs
  catTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catTabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');
      const cards = document.querySelectorAll('.product-card');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Format selection on product cards
  document.querySelectorAll('.format-selector').forEach(selector => {
    const card = selector.closest('.product-card');
    const productId = card.getAttribute('data-id');
    const priceAmountEl = card.querySelector('.price-amount');
    const priceUnitEl = card.querySelector('.price-unit');
    const optButtons = selector.querySelectorAll('.format-opt');

    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        optButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const format = btn.getAttribute('data-format');
        const product = PRODUCTS_DATA[productId];
        const actionBtn = card.querySelector('[data-action="add-to-cart"]');
        const btnText = actionBtn ? actionBtn.querySelector('.btn-text') : null;

        if (format === '60kg') {
          priceAmountEl.textContent = 'Min. 60 kg';
          priceUnitEl.textContent = '/ Custom Quote';
          if (actionBtn) {
            actionBtn.classList.add('btn-quote-mode');
            if (btnText) btnText.textContent = 'Request a Quote';
          }
        } else {
          const itemPrice = product.formats[format].price;
          priceAmountEl.textContent = itemPrice.toFixed(2);
          priceUnitEl.textContent = format === '1kg' ? '/ 1 kg sample' : '/ 5 kg pilot';
          if (actionBtn) {
            actionBtn.classList.remove('btn-quote-mode');
            if (btnText) btnText.textContent = 'Add to Cart';
          }
        }
      });
    });
  });

  // Add to cart buttons on cards
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const productId = card.getAttribute('data-id');
      const activeFormatBtn = card.querySelector('.format-opt.active');
      const formatKey = activeFormatBtn ? activeFormatBtn.getAttribute('data-format') : '1kg';

      if (formatKey === '60kg') {
        const product = PRODUCTS_DATA[productId];
        openWholesaleModal(product ? product.name : 'Highland Robusta');
        return;
      }
      addToCart(productId, formatKey);
    });
  });

  // =========================================================================
  // 5. APPLE CINEMA THEATER ENGINE (Dynamic 40s HTML5 Canvas)
  // =========================================================================
  const canvas = document.getElementById('cinemaCanvas');
  const cinemaGlow = document.getElementById('cinemaGlow');
  const hudPlayToggle = document.getElementById('hudPlayToggle');
  const canvasPlayCenter = document.getElementById('canvasPlayCenter');
  const progressBarContainer = document.getElementById('progressBarContainer');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressHandle = document.getElementById('progressHandle');
  const hudTimer = document.getElementById('hudTimer');
  const hudSceneTag = document.getElementById('hudSceneTag');
  const hudFullscreen = document.getElementById('hudFullscreen');
  const chapterBtns = document.querySelectorAll('.chapter-btn');

  let ctx = canvas ? canvas.getContext('2d') : null;
  let isPlaying = true;
  let currentTime = 0; // 0 to 40 seconds
  const DURATION = 40.0;
  let lastTimestamp = 0;
  let animationFrameId = null;

  // Scene definitions
  const SCENES = [
    {
      id: 1,
      start: 0,
      end: 10,
      tag: 'SCENE 1 / 4 &bull; TERROIR & INDIGENOUS CANOPY',
      title: 'THE WILD GREEN HEART',
      sub: 'Mananjary Terroir &bull; -21.4326° S, 48.3712° E &bull; Altitude 450m',
      glow: 'rgba(54, 63, 50, 0.45)'
    },
    {
      id: 2,
      start: 10,
      end: 20,
      tag: 'SCENE 2 / 4 &bull; SELECTIVE HARVEST & SCREEN 18',
      title: 'PRECISION SORTING',
      sub: 'Density Calibration &bull; Defect Count &le; 5 &bull; Moisture 11.2%',
      glow: 'rgba(113, 117, 94, 0.45)'
    },
    {
      id: 3,
      start: 20,
      end: 30,
      tag: 'SCENE 3 / 4 &bull; DIRECT MALAYSIA AIR CORRIDOR',
      title: 'AIR FREIGHT COURIER',
      sub: 'Antananarivo (TNR) &rarr; Kuala Lumpur (KUL) &bull; Nitrogen Foil Pouches',
      glow: 'rgba(164, 136, 102, 0.45)'
    },
    {
      id: 4,
      start: 30,
      end: 40,
      tag: 'SCENE 4 / 4 &bull; THE CUPPING TABLE',
      title: 'SPECIALTY CUPPING SCORE',
      sub: 'Zero Harshness &bull; Rich Crema &bull; Cocoa Nibs, Toasted Almond, Cane Sugar',
      glow: 'rgba(122, 75, 42, 0.45)'
    }
  ];

  const getSceneForTime = (time) => {
    return SCENES.find(s => time >= s.start && time < s.end) || SCENES[3];
  };

  // Particles for atmospheric feel
  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * 1280,
    y: Math.random() * 720,
    radius: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -Math.random() * 0.8 - 0.2,
    alpha: Math.random() * 0.6 + 0.2
  }));

  const drawScene = (t) => {
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const scene = getSceneForTime(t);
    const sceneProgress = (t - scene.start) / (scene.end - scene.start);

    // Dynamic Background Gradient
    let bgGrad = ctx.createLinearGradient(0, 0, w, h);
    if (scene.id === 1) {
      bgGrad.addColorStop(0, '#121911');
      bgGrad.addColorStop(0.5, '#222B1E');
      bgGrad.addColorStop(1, '#0C110B');
    } else if (scene.id === 2) {
      bgGrad.addColorStop(0, '#1C211A');
      bgGrad.addColorStop(0.5, '#2F3630');
      bgGrad.addColorStop(1, '#151914');
    } else if (scene.id === 3) {
      bgGrad.addColorStop(0, '#192026');
      bgGrad.addColorStop(0.5, '#2A343D');
      bgGrad.addColorStop(1, '#11151A');
    } else {
      bgGrad.addColorStop(0, '#261C14');
      bgGrad.addColorStop(0.5, '#3D2A1C');
      bgGrad.addColorStop(1, '#150E09');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Topographic / Atmospheric contour rings
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.5;
    for (let r = 100; r < 900; r += 120) {
      ctx.beginPath();
      ctx.arc(w / 2 + Math.sin(t * 0.5) * 40, h / 2 + Math.cos(t * 0.3) * 30, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Specific Scene Animations
    if (scene.id === 1) {
      // Scene 1: Lush Hills & Sunrise Ray
      ctx.save();
      // Sun glow
      const sunGrad = ctx.createRadialGradient(w * 0.7, h * 0.35, 10, w * 0.7, h * 0.35, 350);
      sunGrad.addColorStop(0, 'rgba(235, 212, 187, 0.4)');
      sunGrad.addColorStop(1, 'rgba(235, 212, 187, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.35, 350, 0, Math.PI * 2);
      ctx.fill();

      // Terroir Rolling Hills silhouettes
      ctx.fillStyle = 'rgba(38, 45, 35, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 40) {
        let y = h * 0.65 + Math.sin((x * 0.003) + (t * 0.2)) * 60 + Math.cos(x * 0.008) * 30;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Front hill
      ctx.fillStyle = '#1A2118';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 40) {
        let y = h * 0.78 + Math.cos((x * 0.004) - (t * 0.3)) * 40;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else if (scene.id === 2) {
      // Scene 2: Calibrated Screen 18 Sieve & Falling Green Beans
      ctx.save();
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Sieve Grid
      ctx.strokeStyle = 'rgba(220, 220, 217, 0.12)';
      ctx.lineWidth = 1;
      for (let gx = cx - 240; gx <= cx + 240; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, cy - 140);
        ctx.lineTo(gx, cy + 140);
        ctx.stroke();
      }
      for (let gy = cy - 140; gy <= cy + 140; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(cx - 240, gy);
        ctx.lineTo(cx + 240, gy);
        ctx.stroke();
      }

      // Screen 18 Precision Circle
      ctx.strokeStyle = '#A48866';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 180 + Math.sin(t * 2) * 5, 0, Math.PI * 2);
      ctx.stroke();

      // Calibrated Bean in Center
      ctx.fillStyle = '#71755E';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 60, 40, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#EBE2D5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0.4, 2.7);
      ctx.stroke();

      ctx.restore();

    } else if (scene.id === 3) {
      // Scene 3: Air Freight Corridor TNR to KUL
      ctx.save();
      const p1x = w * 0.25;
      const p1y = h * 0.65;
      const p2x = w * 0.75;
      const p2y = h * 0.35;

      // Arc Flight Path
      ctx.strokeStyle = 'rgba(164, 136, 102, 0.35)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(w * 0.5, h * 0.1, p2x, p2y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flight plane indicator
      const arcT = (sceneProgress * 1.2) % 1.0;
      const planeX = (1 - arcT) * (1 - arcT) * p1x + 2 * (1 - arcT) * arcT * (w * 0.5) + arcT * arcT * p2x;
      const planeY = (1 - arcT) * (1 - arcT) * p1y + 2 * (1 - arcT) * arcT * (h * 0.1) + arcT * arcT * p2y;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(planeX, planeY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Pulse ring around plane
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(planeX, planeY, 14 + Math.sin(t * 8) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Hub nodes
      ctx.fillStyle = '#A48866';
      ctx.beginPath();
      ctx.arc(p1x, p1y, 9, 0, Math.PI * 2);
      ctx.arc(p2x, p2y, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 15px "Space Grotesk", monospace';
      ctx.fillText('MADAGASCAR (TNR)', p1x - 70, p1y + 35);
      ctx.fillText('KUALA LUMPUR (KUL)', p2x - 70, p2y + 35);
      ctx.restore();

    } else {
      // Scene 4: Cupping Radar & Sensory Notes
      ctx.save();
      const cx = w / 2;
      const cy = h / 2 - 15;

      // Radar rings
      ctx.strokeStyle = 'rgba(235, 226, 213, 0.15)';
      ctx.lineWidth = 1;
      [50, 100, 150].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Sensory polygon
      ctx.fillStyle = 'rgba(122, 75, 42, 0.45)';
      ctx.strokeStyle = '#E5D4BB';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const angles = [0, (Math.PI * 2) / 5, ((Math.PI * 2) * 2) / 5, ((Math.PI * 2) * 3) / 5, ((Math.PI * 2) * 4) / 5];
      const radii = [135, 120, 140, 130, 115];
      angles.forEach((ang, i) => {
        const px = cx + Math.cos(ang - Math.PI / 2) * (radii[i] + Math.sin(t * 2 + i) * 6);
        const py = cy + Math.sin(ang - Math.PI / 2) * (radii[i] + Math.sin(t * 2 + i) * 6);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Floating particles (Misty canopies / green bean pollen)
    ctx.save();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < 0) p.y = h;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      ctx.fillStyle = `rgba(235, 226, 213, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Cinematic Central Typography Overlay
    ctx.save();
    ctx.textAlign = 'center';
    
    // Eyebrow Tag
    ctx.fillStyle = 'rgba(235, 226, 213, 0.75)';
    ctx.font = '700 13px "Space Grotesk", monospace';
    ctx.letterSpacing = '0.15em';
    ctx.fillText(scene.tag.replace('&bull;', '•'), w / 2, h * 0.28);

    // Grand Scene Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(scene.title, w / 2, h * 0.36);

    // Subtitle Spec
    ctx.fillStyle = '#E5D4BB';
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(scene.sub.replace(/&bull;/g, '•').replace('&rarr;', '→').replace('&le;', '≤'), w / 2, h * 0.42);

    ctx.restore();
  };

  // Cinema loop
  const updateCinema = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying) {
      currentTime += dt;
      if (currentTime >= DURATION) {
        currentTime = 0; // Seamless loop
      }
      updateHud();
    }

    drawScene(currentTime);
    animationFrameId = requestAnimationFrame(updateCinema);
  };

  const updateHud = () => {
    // Progress fill & handle
    const pct = (currentTime / DURATION) * 100;
    if (progressBarFill) progressBarFill.style.width = `${pct}%`;
    if (progressHandle) progressHandle.style.left = `${pct}%`;

    // Timer text
    const secs = Math.floor(currentTime);
    const formatted = `00:${secs < 10 ? '0' : ''}${secs} / 00:40`;
    if (hudTimer) hudTimer.textContent = formatted;

    // Scene tag & ambient glow
    const scene = getSceneForTime(currentTime);
    if (hudSceneTag) hudSceneTag.innerHTML = scene.tag;
    if (cinemaGlow) cinemaGlow.style.background = `radial-gradient(circle, ${scene.glow} 0%, rgba(27, 33, 26, 0.2) 50%, transparent 70%)`;

    // Active Chapter button
    chapterBtns.forEach(btn => {
      const seek = parseFloat(btn.getAttribute('data-seek'));
      if (currentTime >= seek && currentTime < seek + 10) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
  };

  const togglePlay = () => {
    isPlaying = !isPlaying;
    const playIcon = hudPlayToggle ? hudPlayToggle.querySelector('.icon-play') : null;
    const pauseIcon = hudPlayToggle ? hudPlayToggle.querySelector('.icon-pause') : null;

    if (isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (canvasPlayCenter) canvasPlayCenter.style.display = 'none';
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (canvasPlayCenter) canvasPlayCenter.style.display = 'flex';
    }
  };

  if (hudPlayToggle) hudPlayToggle.addEventListener('click', togglePlay);
  if (canvasPlayCenter) canvasPlayCenter.addEventListener('click', togglePlay);

  // Chapter buttons seek
  chapterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const seek = parseFloat(btn.getAttribute('data-seek'));
      currentTime = seek;
      if (!isPlaying) togglePlay();
      updateHud();
    });
  });

  // Scrubbing via progress bar
  if (progressBarContainer) {
    progressBarContainer.addEventListener('click', (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      currentTime = pct * DURATION;
      updateHud();
    });
  }

  // Fullscreen toggle for cinema
  if (hudFullscreen && canvas) {
    hudFullscreen.addEventListener('click', () => {
      const theater = document.getElementById('cinemaTheater');
      if (!document.fullscreenElement) {
        if (theater.requestFullscreen) theater.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // Start Cinema loop
  if (canvas) {
    // Initial UI state
    const playIcon = hudPlayToggle ? hudPlayToggle.querySelector('.icon-play') : null;
    const pauseIcon = hudPlayToggle ? hudPlayToggle.querySelector('.icon-pause') : null;
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (canvasPlayCenter) canvasPlayCenter.style.display = 'none';
    animationFrameId = requestAnimationFrame(updateCinema);
  }

  // =========================================================================
  // 6. COFFEE MATCHMAKER (Embedded in Personalised Sourcing)
  // =========================================================================
  const matchmakerForm = document.getElementById('matchmakerForm');
  const matchResult = document.getElementById('matchResult');
  const resultCoffeeName = document.getElementById('resultCoffeeName');
  const resultProcess = document.getElementById('resultProcess');
  const resultRationale = document.getElementById('resultRationale');
  const btnViewMatchedCoffee = document.getElementById('btnViewMatchedCoffee');
  const btnApplyMatchToSourcing = document.getElementById('btnApplyMatchToSourcing');
  const matchmakerPrefillNotice = document.getElementById('matchmakerPrefillNotice');
  const btnApplyMatchToContact = document.getElementById('btnApplyMatchToContact');

  let lastMatch = null;

  if (matchmakerForm) {
    matchmakerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const roastSelect = document.getElementById('critRoast');
      const methodSelect = document.getElementById('critMethod');
      const aromaSelect = document.getElementById('critAroma');
      const needsInput = document.getElementById('critSourcingNeeds');

      const roastVal = roastSelect ? roastSelect.value : 'omni';
      const methodVal = methodSelect ? methodSelect.value : 'specialty';
      const aromaVal = aromaSelect ? aromaSelect.value : 'balanced';
      const customNeeds = needsInput ? needsInput.value.trim() : '';

      const roastText = roastSelect && roastSelect.selectedOptions[0] ? roastSelect.selectedOptions[0].text : roastVal;
      const methodText = methodSelect && methodSelect.selectedOptions[0] ? methodSelect.selectedOptions[0].text : methodVal;
      const aromaText = aromaSelect && aromaSelect.selectedOptions[0] ? aromaSelect.selectedOptions[0].text : aromaVal;

      // Intelligent roastery analysis & recommendation synthesis
      let recTitle = '';
      let processTag = '';
      let synthesisText = '';
      let benchmarkProd = PRODUCTS_DATA.p1;
      let benchmarkRationale = '';

      if (aromaVal === 'distinctive' || (methodVal === 'specialty' && roastVal === 'omni')) {
        recTitle = 'High-Altitude Honey-Processed Robusta Micro-Lot';
        processTag = 'Specialty Honey Process • Screen 18';
        synthesisText = `For ${roastText.toLowerCase()} intended for ${methodText.toLowerCase()}, your roasting protocol benefits from beans with elevated residual mucilage. We recommend a controlled yellowing phase and progressive airflow through first crack to preserve native wild honey sweetness and fruit nuance without harsh astringency.`;
        benchmarkProd = PRODUCTS_DATA.p3; // Signature Robusta Honey
        benchmarkRationale = `Our catalogue benchmark ${benchmarkProd.name} (${benchmarkProd.process}) shares this sweet, complex cup architecture and is available in sample pouches for initial roast calibration.`;
      } else if (aromaVal === 'earthy' || roastVal === 'dark' || methodVal === 'milk') {
        recTitle = 'Dense Natural Robusta High-Body Espresso Foundation';
        processTag = 'Natural Dry Process • Screen 16/18 Grade 1';
        synthesisText = `For ${roastText.toLowerCase()} targeting ${methodText.toLowerCase()}, a natural dry-processed Malagasy lot offers high bean density and exceptional solubility. The natural canopy drying produces thick, long-lasting crema and deep cocoa-hazelnut resonance that slices cleanly through milk drinks.`;
        benchmarkProd = PRODUCTS_DATA.p1; // Highland Robusta Natural
        benchmarkRationale = `Our catalogue benchmark ${benchmarkProd.name} (${benchmarkProd.process}) serves as the reference lot for this heavy-body espresso foundation.`;
      } else {
        recTitle = 'High-Grown Washed Robusta Clean-Cup Selection';
        processTag = 'Fully Washed • Screen 18 Strictly Clean';
        synthesisText = `For a versatile ${roastText.toLowerCase()} crafted for ${methodText.toLowerCase()}, a fully washed Malagasy Robusta offers rare cup clarity, subtle brightness, and balanced nutty sweetness. Thorough washing and mechanical density sorting ensure uniform roast conduction across commercial batches.`;
        benchmarkProd = PRODUCTS_DATA.p2; // Select Robusta Washed
        benchmarkRationale = `Our catalogue benchmark ${benchmarkProd.name} (${benchmarkProd.process}) embodies this balanced, versatile profile for preliminary cupping calibration.`;
      }

      if (customNeeds) {
        synthesisText += ` Specific Roaster Requirement Noted: "${customNeeds}" — this specification will be incorporated directly into your sourcing profile.`;
      }

      lastMatch = {
        recommendationTitle: recTitle,
        processTag: processTag,
        synthesis: synthesisText,
        benchmarkId: benchmarkProd.id,
        benchmarkName: benchmarkProd.name,
        benchmarkProcess: benchmarkProd.process,
        roast: roastText,
        method: methodText,
        aroma: aromaText,
        sourcingNeeds: customNeeds
      };

      // Update Result Box in DOM
      if (resultCoffeeName) resultCoffeeName.textContent = recTitle;
      if (resultProcess) resultProcess.textContent = processTag;
      if (resultRationale) resultRationale.textContent = synthesisText;

      const benchmarkBox = document.getElementById('resultBenchmarkNote');
      if (benchmarkBox) {
        benchmarkBox.innerHTML = `<strong>Reference Benchmark:</strong> ${benchmarkRationale}`;
      }

      if (btnViewMatchedCoffee) {
        btnViewMatchedCoffee.textContent = `Benchmark with ${benchmarkProd.name}`;
      }

      if (matchResult) {
        matchResult.style.display = 'block';
        matchResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (matchmakerPrefillNotice) {
        matchmakerPrefillNotice.style.display = 'block';
      }

      showToast(`Recommendation generated: ${recTitle}`);
    });
  }

  // View Coffee: Smoothly scroll to the benchmark product card and pulse highlight it
  if (btnViewMatchedCoffee) {
    btnViewMatchedCoffee.addEventListener('click', () => {
      if (!lastMatch || !lastMatch.benchmarkId) return;
      const targetCard = document.getElementById(`product-${lastMatch.benchmarkId}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('card-highlight-pulse');
        setTimeout(() => {
          targetCard.classList.remove('card-highlight-pulse');
        }, 2600);
      }
    });
  }

  // Apply to Sourcing Request button inside Match Result Box
  if (btnApplyMatchToSourcing) {
    btnApplyMatchToSourcing.addEventListener('click', () => {
      openPersonalisedSourcingWithMatch();
    });
  }

  function openPersonalisedSourcingWithMatch() {
    const modal = document.getElementById('modalPersonalisedSourcing');
    const form = document.getElementById('personalisedSourcingForm');
    const successBox = document.getElementById('personalisedSourcingSuccess');
    const prefsInput = document.getElementById('sourcingPreferences');
    const qtyInput = document.getElementById('sourcingQuantity');
    const msgTextarea = document.getElementById('sourcingMessage');

    if (lastMatch) {
      if (prefsInput) {
        prefsInput.value = `${lastMatch.recommendationTitle} (${lastMatch.processTag})`;
      }

      if (qtyInput && lastMatch.sourcingNeeds) {
        const qtyMatch = lastMatch.sourcingNeeds.match(/(\d+\s*(?:kg|bags?|tons?|fcl|mt|pallet))/i);
        if (qtyMatch) {
          qtyInput.value = qtyMatch[1];
        }
      }

      if (msgTextarea) {
        let brief = `Target Profile: ${lastMatch.recommendationTitle}\n`;
        brief += `Preferences: Roast: ${lastMatch.roast} | Method: ${lastMatch.method} | Flavour: ${lastMatch.aroma}\n`;
        if (lastMatch.sourcingNeeds) {
          brief += `Specific Sourcing Needs: ${lastMatch.sourcingNeeds}\n`;
        }
        brief += `Consultative Roaster Synthesis:\n${lastMatch.synthesis}\n`;
        brief += `Catalogue Reference: ${lastMatch.benchmarkName} (${lastMatch.benchmarkProcess})`;

        msgTextarea.value = brief;
      }
    }

    if (form) form.style.display = 'block';
    if (successBox) successBox.style.display = 'none';
    if (modal) {
      modal.classList.add('active');
      const firstInput = document.getElementById('sourcingName');
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    }
  }

  // Pre-fill Matchmaker info in the Contact B2B form
  if (btnApplyMatchToContact) {
    btnApplyMatchToContact.addEventListener('click', () => {
      if (!lastMatch) return;
      const coffeeSelect = document.getElementById('contactCoffeeSelection');
      const messageInput = document.getElementById('contactMessage');
      const lookingForSelect = document.getElementById('contactLookingFor');

      if (coffeeSelect && lastMatch.benchmarkName) {
        for (let i = 0; i < coffeeSelect.options.length; i++) {
          if (coffeeSelect.options[i].value.includes(lastMatch.benchmarkName)) {
            coffeeSelect.selectedIndex = i;
            break;
          }
        }
      }

      if (lookingForSelect && lookingForSelect.value === '') {
        lookingForSelect.value = 'Personalised Coffee Sourcing';
      }

      if (messageInput) {
        const matchNote = `Preferences from Coffee Matchmaker: Target Profile "${lastMatch.recommendationTitle}". Roast: ${lastMatch.roast}; Serving Method: ${lastMatch.method}; Flavour: ${lastMatch.aroma}.${lastMatch.sourcingNeeds ? ` Specific Needs: ${lastMatch.sourcingNeeds}.` : ''}`;
        if (!messageInput.value.includes('Coffee Matchmaker')) {
          messageInput.value = messageInput.value ? `${messageInput.value}\n\n${matchNote}` : matchNote;
        }
      }

      showToast('Matchmaker preferences added to contact form.');
    });
  }

  // =========================================================================
  // 7. B2B SAMPLE CHECKOUT MODAL & ORDER CONFIRMATION
  // =========================================================================
  const btnProceedCheckout = document.getElementById('btnProceedCheckout');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutRecapBox = document.getElementById('checkoutRecapBox');
  const checkoutConfirmForm = document.getElementById('checkoutConfirmForm');

  if (btnProceedCheckout) {
    btnProceedCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Please add at least one sample pouch to your cart.');
        return;
      }

      // Render order recap
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const discount = appliedPromo && PROMO_CODES[appliedPromo] ? subtotal * PROMO_CODES[appliedPromo].discount : 0;
      const total = subtotal - discount;

      const itemsSummary = cart.map(i => `&bull; ${i.quantity}x ${i.name} (${i.formatLabel}) — RM ${(i.price * i.quantity).toFixed(2)}`).join('<br>');

      checkoutRecapBox.innerHTML = `
        <div style="font-weight:700; color:var(--c-botanical); margin-bottom:0.4rem;">Selected Sample Pouches (${cart.reduce((a,b)=>a+b.quantity,0)} items):</div>
        <div style="font-size:0.85rem; color:var(--c-muted-text); margin-bottom:0.75rem;">${itemsSummary}</div>
        <div style="border-top:1px solid rgba(54,63,50,0.1); padding-top:0.4rem; font-weight:700;">
          Estimated Total: RM ${total.toFixed(2)} ${appliedPromo ? `(Discount code ${appliedPromo} applied)` : ''}
        </div>
      `;

      closeCart();
      checkoutModal.classList.add('active');
    });
  }

  if (checkoutConfirmForm) {
    checkoutConfirmForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const roastery = document.getElementById('chkRoasteryName').value.trim();
      const person = document.getElementById('chkContactPerson').value.trim();
      const email = document.getElementById('chkEmail').value.trim();
      const phone = document.getElementById('chkPhone').value.trim();
      const address = document.getElementById('chkAddress').value.trim();

      const cartSummaryText = cart.map(i => `${i.quantity}x ${i.name} [${i.formatLabel}]`).join(', ');
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const discount = appliedPromo && PROMO_CODES[appliedPromo] ? subtotal * PROMO_CODES[appliedPromo].discount : 0;
      const total = subtotal - discount;

      // Construct formatted WhatsApp message payload
      const waMsg = encodeURIComponent(
        `*NEW MADECAF B2B SAMPLE ORDER*\n\n` +
        `*Roastery:* ${roastery}\n` +
        `*Contact:* ${person}\n` +
        `*Email:* ${email}\n` +
        `*WhatsApp:* ${phone}\n` +
        `*Delivery Address:* ${address}\n\n` +
        `*Samples Requested:*\n${cartSummaryText}\n` +
        `*Total Estimate:* RM ${total.toFixed(2)}\n\n` +
        `_Please confirm dispatch availability and courier invoice._`
      );

      checkoutModal.classList.remove('active');
      showToast('Sample request transmitted! Opening WhatsApp desk...');

      // Reset cart
      cart = [];
      appliedPromo = null;
      saveCartToStorage();
      renderCart();

      // Open WhatsApp direct hotline
      setTimeout(() => {
        window.open(`https://wa.me/601160808293?text=${waMsg}`, '_blank');
      }, 600);
    });
  }

  // =========================================================================
  // 8. WHOLESALE QUOTE, PERSONALISED SOURCING & EQUIPMENT CONTROLLERS
  // =========================================================================
  const wholesaleModal = document.getElementById('wholesaleModal');
  const wholesaleQuoteForm = document.getElementById('wholesaleQuoteForm');
  const quoteCoffeeSelect = document.getElementById('quoteCoffeeSelect');

  const openWholesaleModal = (coffeeName) => {
    if (wholesaleModal) {
      if (quoteCoffeeSelect && coffeeName) {
        for (let i = 0; i < quoteCoffeeSelect.options.length; i++) {
          if (quoteCoffeeSelect.options[i].value.toLowerCase().includes(coffeeName.toLowerCase()) ||
              coffeeName.toLowerCase().includes(quoteCoffeeSelect.options[i].value.toLowerCase())) {
            quoteCoffeeSelect.selectedIndex = i;
            break;
          }
        }
      }
      const qtyInput = document.getElementById('quoteQuantity');
      if (qtyInput) qtyInput.value = 60;
      const form = document.getElementById('wholesaleQuoteForm');
      const successBox = document.getElementById('wholesaleQuoteSuccess');
      if (form) form.style.display = 'block';
      if (successBox) successBox.style.display = 'none';
      wholesaleModal.classList.add('active');
    }
  };

  if (wholesaleQuoteForm) {
    wholesaleQuoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const coffee = quoteCoffeeSelect ? quoteCoffeeSelect.value : 'Highland Robusta';
      const qtyInput = document.getElementById('quoteQuantity');
      const qty = parseInt(qtyInput ? qtyInput.value : 60, 10) || 60;

      if (qty < 60) {
        showToast('Minimum wholesale order quantity is 60 kg.');
        return;
      }

      const company = document.getElementById('quoteCompanyName').value.trim();
      const email = document.getElementById('quoteEmail').value.trim();
      const message = document.getElementById('quoteMessage').value.trim();

      const successBox = document.getElementById('wholesaleQuoteSuccess');
      const successText = document.getElementById('quoteSuccessText');
      const waLink = document.getElementById('quoteWhatsAppLink');

      if (successText) {
        successText.innerHTML = `Thank you <strong>${company}</strong>! Your wholesale quote request for <strong>${qty} kg</strong> of <strong>${coffee}</strong> has been transmitted. Our origin coordinators will review FOB/CIF delivery terms and email a customized quotation to <strong>${email}</strong> within 24 hours.`;
      }

      const waMsg = encodeURIComponent(
        `*MADECAF WHOLESALE QUOTE REQUEST*\n\n` +
        `*Coffee:* ${coffee}\n` +
        `*Desired Quantity:* ${qty} kg (Min. 60 kg)\n` +
        `*Company:* ${company}\n` +
        `*Email:* ${email}\n` +
        (message ? `*Notes:* ${message}\n\n` : `\n`) +
        `_Please provide tailored wholesale allocation and shipping quote._`
      );

      if (waLink) {
        waLink.href = `https://wa.me/601160808293?text=${waMsg}`;
      }

      wholesaleQuoteForm.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
      showToast(`Wholesale quote request for ${coffee} submitted.`);
    });
  }

  // Section 2: Personalised Coffee Sourcing Modal Controller
  const btnOpenPersonalisedSourcing = document.getElementById('btnOpenPersonalisedSourcing');
  const modalPersonalisedSourcing = document.getElementById('modalPersonalisedSourcing');
  const personalisedSourcingForm = document.getElementById('personalisedSourcingForm');

  if (btnOpenPersonalisedSourcing && modalPersonalisedSourcing) {
    btnOpenPersonalisedSourcing.addEventListener('click', () => {
      openPersonalisedSourcingWithMatch();
    });
  }

  if (personalisedSourcingForm) {
    personalisedSourcingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('sourcingName').value.trim();
      const company = document.getElementById('sourcingCompany').value.trim();
      const email = document.getElementById('sourcingEmail').value.trim();
      const prefs = document.getElementById('sourcingPreferences').value.trim();
      const qty = document.getElementById('sourcingQuantity').value.trim();
      const notes = document.getElementById('sourcingMessage').value.trim();

      const successBox = document.getElementById('personalisedSourcingSuccess');
      const successText = document.getElementById('sourcingSuccessText');
      const waLink = document.getElementById('sourcingWhatsAppLink');

      if (successText) {
        successText.innerHTML = `Thank you <strong>${name}</strong> (${company})! Your sourcing requirements for <em>"${prefs}"</em> (${qty}) have been registered. Our team will review matching Malagasy lots and contact you at <strong>${email}</strong>.`;
      }

      const waMsg = encodeURIComponent(
        `*PERSONALISED COFFEE SOURCING INQUIRY*\n\n` +
        `*Contact:* ${name}\n` +
        `*Company:* ${company}\n` +
        `*Email:* ${email}\n` +
        `*Preferences:* ${prefs}\n` +
        `*Desired Quantity:* ${qty}\n` +
        (notes ? `*Additional Message:* ${notes}\n\n` : `\n`) +
        `_Please advise on matching Malagasy lots._`
      );

      if (waLink) {
        waLink.href = `https://wa.me/601160808293?text=${waMsg}`;
      }

      personalisedSourcingForm.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
      showToast('Personalised sourcing request submitted.');
    });
  }

  // Section 3: Coffee Equipment & Accessories Partner Controllers
  const modalEquipmentAffiliate = document.getElementById('modalEquipmentAffiliate');
  document.querySelectorAll('.btn-partner-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalEquipmentAffiliate) modalEquipmentAffiliate.classList.add('active');
    });
  });

  // =========================================================================
  // 9. GENERAL MODALS (Privacy, Terms, Delivery, Refund, Close triggers)
  // =========================================================================
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.classList.add('active');
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // =========================================================================
  // 10. SOURCING CONTACT FORM CONTROLLER
  // =========================================================================
  const sourcingContactForm = document.getElementById('sourcingContactForm');
  const contactFeedback = document.getElementById('contactFeedback');

  if (sourcingContactForm) {
    sourcingContactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const roastery = document.getElementById('contactRoastery').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const lookingFor = document.getElementById('contactLookingFor').value;
      const quantity = document.getElementById('contactQuantity').value.trim();
      const coffee = document.getElementById('contactCoffeeSelection').value;
      const message = document.getElementById('contactMessage').value.trim();

      contactFeedback.className = 'form-alert success';
      contactFeedback.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 0.35rem;">Thank you, ${name} (${roastery})!</div>
        <p style="margin: 0; line-height: 1.5;">Your inquiry regarding <strong>${lookingFor}</strong>${quantity ? ` (${quantity})` : ''} for <strong>${coffee}</strong> has been received by our sourcing desk. Our team will review your requirements and reach out to <strong>${email}</strong> directly.</p>
        <div style="margin-top: 0.75rem;">
          <a href="https://wa.me/601160808293?text=${encodeURIComponent(`Hello MADECAF, I submitted an inquiry for ${lookingFor} (${coffee}) on behalf of ${roastery}.`)}" target="_blank" rel="noopener noreferrer" class="btn btn-wa-full" style="display: inline-flex; padding: 0.5rem 1rem; font-size: 0.85rem;">
            Continue via WhatsApp Desk (+60 11 6080 8293)
          </a>
        </div>
      `;
      contactFeedback.style.display = 'block';

      showToast('Sourcing enquiry submitted.');
      sourcingContactForm.reset();
    });
  }

  // =========================================================================
  // 11. NAVBAR CONTROLLER & MOBILE MENU
  // =========================================================================
  const mainHeader = document.getElementById('mainHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const primaryNav = document.getElementById('primaryNav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  if (mobileToggle && primaryNav) {
    mobileToggle.addEventListener('click', () => {
      const isActive = primaryNav.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    primaryNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =========================================================================
  // 12. INITIALIZATION
  // =========================================================================
  loadCartFromStorage();
  renderCart();
  console.log('MADECAF Platform initialized successfully (Apple Canvas 40s + B2B Sourcing Cart)');
});
