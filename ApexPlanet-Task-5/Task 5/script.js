  
  // =========================
  // Mini Shop — single-file JS
  // Optimizations used:
  // - defer script, minimal DOM queries, batched updates
  // - lazy-loading images with IntersectionObserver + native `loading` fallback
  // - localStorage caching for cart and product list
  // - feature detection with graceful fallbacks
  // =========================

  (function(){
    'use strict';

    // Sample product data (in a real project fetch from API with pagination)
    const PRODUCTS = (()=>{
      const names = ['Canvas Tote','Ceramic Mug','Notebook Pro','Wireless Mouse','Desk Lamp','Plant Pot','Backpack','Minimal Watch','Sunglasses','Bluetooth Speaker','Water Bottle','Hoodie'];
      return names.map((n,i)=>({
        id: 'p'+(i+1),
        name: n,
        price: Math.round((10 + Math.random()*90))*100, // in paise-like cents; we'll show rupee symbol
        desc: n + ' — clean design, made to last.',
        img: `https://picsum.photos/seed/cap${i}/800/600`
      }))
    })();

    // DOM refs
    const $ = sel => document.querySelector(sel);
    const $all = sel => Array.from(document.querySelectorAll(sel));

    const productListEl = $('#product-list');
    const resultCountEl = $('#result-count');
    const qInput = $('#q');
    const sortSelect = $('#sort');
    const cartCountEl = $('#cart-count');
    const cartItemsEl = $('#cart-items');
    const cartTotalEl = $('#cart-total');
    const openCartBtn = $('#open-cart');
    const clearCartBtn = $('#clear-cart');
    const checkoutBtn = $('#checkout');
    const modal = $('#modal');
    const modalBody = $('#checkout-body');
    const closeModalBtn = $('#close-modal');
    const confirmBtn = $('#confirm');

    // state
    let state = {
      products: [],
      filtered: [],
      cart: {},
    };

    // read cart from localStorage
    try{ state.cart = JSON.parse(localStorage.getItem('cap_cart') || '{}') }catch(e){ state.cart = {} }

    // Save cart (debounce-ish simple)
    function saveCart(){ localStorage.setItem('cap_cart', JSON.stringify(state.cart)); }

    // Price formatter
    const fmt = v => '₹' + (v/100).toFixed(2);

    // Render product cards (batched)
    function renderProducts(list){
      productListEl.innerHTML = ''; // simple replace; these nodes are lightweight
      const frag = document.createDocumentFragment();
      list.forEach(p=>{
        const card = document.createElement('article'); card.className='card'; card.setAttribute('tabindex', '0');
        card.innerHTML = `
          <div class="thumb"><img data-src="${p.img}" alt="${p.name}" loading="lazy" /></div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center"><strong>${escapeHtml(p.name)}</strong><div class="price">${fmt(p.price)}</div></div>
            <div class="muted" style="font-size:13px;margin-top:6px">${escapeHtml(p.desc)}</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
            <button class="btn add" data-id="${p.id}">Add</button>
            <button class="btn secondary" data-id="${p.id}">Details</button>
          </div>
        `;
        frag.appendChild(card);
      });
      productListEl.appendChild(frag);
      resultCountEl.textContent = list.length;
      // attach listeners (event delegation would be better; but for clarity we attach per card)
      $all('.add').forEach(btn=>btn.addEventListener('click', onAdd));
      $all('.btn.secondary').forEach(btn=>btn.addEventListener('click', onDetails));
      // lazy-init images
      initLazyImages();
    }

    // Escape HTML (very small helper)
    function escapeHtml(s){return String(s).replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]||c)}

    // Add to cart
    function onAdd(e){
      const id = e.currentTarget.dataset.id; addToCart(id,1);
    }
    function onDetails(e){
      const id = e.currentTarget.dataset.id; const p = state.products.find(x=>x.id===id);
      modalBody.innerHTML = `<p><strong>${escapeHtml(p.name)}</strong></p><p class="muted">${escapeHtml(p.desc)}</p><p><strong>${fmt(p.price)}</strong></p>`;
      showModal();
    }

    function addToCart(id, qty=1){
      state.cart[id] = (state.cart[id]||0) + qty; saveCart(); renderCart();
    }

    function removeFromCart(id){ delete state.cart[id]; saveCart(); renderCart(); }

    function clearCart(){ state.cart = {}; saveCart(); renderCart(); }

    // Render cart sidebar
    function renderCart(){
      cartItemsEl.innerHTML = '';
      const frag = document.createDocumentFragment();
      let total = 0, count = 0;
      Object.keys(state.cart).forEach(id=>{
        const qty = state.cart[id];
        const p = state.products.find(x=>x.id===id) || {name:'Unknown', price:0};
        const line = document.createElement('div'); line.className='cart-item';
        line.innerHTML = `
          <div style="flex:1">
            <div style="font-weight:600">${escapeHtml(p.name)}</div>
            <div class="muted">${fmt(p.price)} × ${qty}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <button class="btn" data-id="${id}" aria-label="increase">+</button>
            <button class="btn secondary" data-id="${id}" aria-label="remove">−</button>
          </div>
        `;
        frag.appendChild(line);
        total += p.price * qty; count += qty;
      });
      cartItemsEl.appendChild(frag);
      cartTotalEl.textContent = fmt(total);
      cartCountEl.textContent = count;
      // bind cart buttons
      $all('#cart-items .btn').forEach(b=>{
        const id = b.dataset.id; if(!id) return;
        if(b.classList.contains('btn') && !b.classList.contains('secondary')) b.addEventListener('click', ()=>{ addToCart(id,1) });
        if(b.classList.contains('secondary')) b.addEventListener('click', ()=>{ removeFromCart(id) });
      });
    }

    // Search & sort
    function applyFilters(){
      const q = qInput.value.trim().toLowerCase();
      const sort = sortSelect.value;
      let list = state.products.slice();
      if(q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
      if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
      state.filtered = list;
      renderProducts(list);
    }

    // Modal helpers
    function showModal(){ modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); }
    function hideModal(){ modal.style.display='none'; modal.setAttribute('aria-hidden','true'); }

    // Lazy load images using IntersectionObserver with fallback
    let io = null;
    function initLazyImages(){
      const imgs = Array.from(productListEl.querySelectorAll('img[data-src]'));
      if(!imgs.length) return;
      // if browser supports native loading attribute we already set loading="lazy" above
      if('IntersectionObserver' in window){
        if(io) imgs.forEach(img=>io.observe(img));
        else{
          io = new IntersectionObserver(entries=>{
            entries.forEach(entry=>{
              if(entry.isIntersecting){
                const img = entry.target; img.src = img.dataset.src; img.removeAttribute('data-src'); io.unobserve(img);
              }
            });
          },{rootMargin:'200px'});
          imgs.forEach(img=>io.observe(img));
        }
      } else {
        // fallback: load images immediately
        imgs.forEach(img=>{ img.src = img.dataset.src; img.removeAttribute('data-src'); });
      }
    }

    // Small debounce util
    function debounce(fn,wait=200){ let t; return function(...a){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),wait) } }

    // Init app
    function init(){
      // emulate fetching products with caching
      const cached = window.sessionStorage.getItem('cap_products');
      if(cached){ state.products = JSON.parse(cached); }
      else{ state.products = PRODUCTS; sessionStorage.setItem('cap_products', JSON.stringify(PRODUCTS)); }

      state.filtered = state.products.slice();
      renderProducts(state.filtered);
      renderCart();

      // events
      qInput.addEventListener('input', debounce(applyFilters,150));
      sortSelect.addEventListener('change', applyFilters);
      clearCartBtn.addEventListener('click', ()=>{ clearCart(); });
      openCartBtn.addEventListener('click', ()=>{ window.scrollTo({top:0,behavior:'smooth'}); });
      checkoutBtn.addEventListener('click', ()=>{
        // simple checkout modal
        const items = Object.keys(state.cart).map(id=>({id,qty:state.cart[id],p:state.products.find(x=>x.id===id)}));
        if(!items.length){ modalBody.innerHTML = '<p class="muted">Your cart is empty.</p>'; showModal(); return; }
        modalBody.innerHTML = '<ul>' + items.map(it=>`<li>${escapeHtml(it.p.name)} × ${it.qty} — ${fmt(it.p.price*it.qty)}</li>`).join('') + '</ul>';
        showModal();
      });
      closeModalBtn.addEventListener('click', hideModal);
      confirmBtn.addEventListener('click', ()=>{ hideModal(); alert('Order placed — demo only'); clearCart(); });

      // keyboard accessibility: Esc to close
      document.addEventListener('keydown', e=>{ if(e.key==='Escape') hideModal(); });

      // initial filters
      applyFilters();

      // register service worker if available
      if('serviceWorker' in navigator){
        navigator.serviceWorker.register('./sw.js').catch(()=>{/*fail silently in demo*/});
      }
    }

    // small safe init after DOM content loaded
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  })();
 
  