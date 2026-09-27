(function () {
  'use strict';

  var isMobileMQ = window.matchMedia('(max-width: 768px)');
  var MOBILE_INITIAL = 4;

  function isMobile() {
    return isMobileMQ.matches;
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var burgerEl = document.querySelector('[data-burger]');
  var mobileMenuEl = document.querySelector('[data-mobile-menu]');
  var modalEl = document.querySelector('[data-modal]');

  function updateScrollLock() {
    var menuOpen = burgerEl && burgerEl.getAttribute('aria-expanded') === 'true';
    var modalOpen = modalEl && !modalEl.hidden;
    document.body.style.overflow = (menuOpen || modalOpen) ? 'hidden' : '';
  }

  if (burgerEl && mobileMenuEl) {
    var setMenu = function (open) {
      burgerEl.setAttribute('aria-expanded', open ? 'true' : 'false');
      burgerEl.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mobileMenuEl.hidden = !open;
      updateScrollLock();
    };

    burgerEl.addEventListener('click', function () {
      var isOpen = burgerEl.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    mobileMenuEl.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burgerEl.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
      }
    });

    var resizeMenuHandler = function () {
      if (window.matchMedia('(min-width: 769px)').matches &&
        burgerEl.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
      }
    };
    if (isMobileMQ.addEventListener) isMobileMQ.addEventListener('change', resizeMenuHandler);
    else if (isMobileMQ.addListener) isMobileMQ.addListener(resizeMenuHandler);
  }

  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var track = slider.querySelector('[data-slider-track]');
    var prevBtn = slider.querySelector('[data-slider-prev]');
    var nextBtn = slider.querySelector('[data-slider-next]');
    var dotsWrap = slider.querySelector('[data-slider-dots]');

    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;

    var firstClone = slides[0].cloneNode(true);
    var lastClone = slides[total - 1].cloneNode(true);

    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    firstClone.classList.add('slider__slide--clone');
    lastClone.classList.add('slider__slide--clone');

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    var index = 1;
    var animating = false;

    function realIndex() {
      return ((index - 1) % total + total) % total;
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot' + (i === realIndex() ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
        dot.dataset.index = i;
        dotsWrap.appendChild(dot);
      }
    }

    function syncDots() {
      if (!dotsWrap) return;
      var real = realIndex();
      Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
        dot.classList.toggle('is-active', i === real);
      });
    }

    function applyTransform(animate) {
      track.style.transition = animate
        ? 'transform .55s cubic-bezier(.4, 0, .2, 1)'
        : 'none';
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
    }

    function snapTo(newIndex) {
      track.style.transition = 'none';
      index = newIndex;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      void track.offsetWidth;
    }

    function goNext() {
      if (animating) return;
      animating = true;
      index++;
      applyTransform(true);
      syncDots();
    }

    function goPrev() {
      if (animating) return;
      animating = true;
      index--;
      applyTransform(true);
      syncDots();
    }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (index === total + 1) snapTo(1);
      else if (index === 0) snapTo(total);
      animating = false;
    });

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    if (dotsWrap) {
      dotsWrap.addEventListener('click', function (e) {
        var dot = e.target.closest('.slider__dot');
        if (!dot || animating) return;
        var target = parseInt(dot.dataset.index, 10) || 0;
        var trackPos = target + 1;
        if (trackPos === index) return;
        animating = true;
        index = trackPos;
        applyTransform(true);
        syncDots();
      });
    }

    var auto = setInterval(goNext, 7000);
    slider.addEventListener('mouseenter', function () { clearInterval(auto); });
    slider.addEventListener('focusin', function () { clearInterval(auto); });

    track.style.transition = 'none';
    track.style.transform = 'translateX(-100%)';
    void track.offsetWidth;

    renderDots();
  }

  var tabs = document.querySelectorAll('.tab[data-category]');
  var grids = document.querySelectorAll('[data-grid]');
  var moreWrap = document.querySelector('.catalog__more');
  var moreBtn = document.querySelector('[data-show-more]');

  var currentCategory = 'coffee';
  var showAllState = { coffee: false, tea: false, dessert: false };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderGrid(category) {
    var grid = document.querySelector('[data-grid="' + category + '"]');
    if (!grid || !window.PRODUCTS) return;

    var items = window.PRODUCTS.filter(function (p) {
      return p.category === category;
    });

    grid.innerHTML = items.map(function (item) {
      var price = item.sizes[0].price.toFixed(2);
      return '<li class="grid__item">' +
        '<article class="card card--product" data-id="' + escapeHtml(item.id) + '"' +
        ' role="button" tabindex="0" aria-label="Открыть ' + escapeHtml(item.name) + '">' +
        '<img class="card__img" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
        '<div class="card__body">' +
        '<h3 class="card__title">' + escapeHtml(item.name) + '</h3>' +
        '<p class="card__text">' + escapeHtml(item.description) + '</p>' +
        '<span class="price">$' + price + '</span>' +
        '</div>' +
        '</article>' +
        '</li>';
    }).join('');
  }

  function renderAllGrids() {
    ['coffee', 'tea', 'dessert'].forEach(renderGrid);
  }

  function activeGrid() {
    for (var i = 0; i < grids.length; i++) {
      if (!grids[i].hidden) return grids[i];
    }
    return null;
  }

  function applyShowMore() {
    if (!moreWrap || !moreBtn) return;
    var grid = activeGrid();
    if (!grid) { moreWrap.hidden = true; return; }

    var items = Array.prototype.slice.call(grid.querySelectorAll('.grid__item'));

    if (!isMobile()) {
      items.forEach(function (li) { li.classList.remove('is-hidden'); });
      moreWrap.hidden = true;
      return;
    }

    if (showAllState[currentCategory]) {
      items.forEach(function (li) { li.classList.remove('is-hidden'); });
      moreWrap.hidden = true;
    } else {
      items.forEach(function (li, i) {
        li.classList.toggle('is-hidden', i >= MOBILE_INITIAL);
      });
      moreWrap.hidden = items.length <= MOBILE_INITIAL;
    }
  }

  function setCategory(cat) {
    currentCategory = cat;
    showAllState = { coffee: false, tea: false, dessert: false };

    tabs.forEach(function (t) {
      t.classList.toggle('tab--active', t.dataset.category === cat);
    });
    grids.forEach(function (g) {
      g.hidden = g.dataset.grid !== cat;
    });
    applyShowMore();
  }

  if (tabs.length && grids.length) {
    renderAllGrids();

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setCategory(tab.dataset.category);
      });
    });

    if (moreBtn) {
      moreBtn.addEventListener('click', function () {
        showAllState[currentCategory] = true;
        applyShowMore();
      });
    }

    var resizeTimer;
    var onResize = function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyShowMore, 120);
    };
    if (isMobileMQ.addEventListener) isMobileMQ.addEventListener('change', onResize);
    else if (isMobileMQ.addListener) isMobileMQ.addListener(onResize);

    setCategory('coffee');
  }

  if (modalEl) {
    var modalImg = modalEl.querySelector('[data-modal-img]');
    var modalTitle = modalEl.querySelector('[data-modal-title]');
    var modalDesc = modalEl.querySelector('[data-modal-desc]');
    var modalSizes = modalEl.querySelector('[data-modal-sizes]');
    var modalAdds = modalEl.querySelector('[data-modal-additives]');
    var modalTotal = modalEl.querySelector('[data-modal-total]');
    var modalOverlay = modalEl.querySelector('[data-modal-overlay]');

    var currentProduct = null;
    var selectedSizeIndex = 0;
    var selectedAdditives = [];

    function findProduct(id) {
      if (!window.PRODUCTS) return null;
      for (var i = 0; i < window.PRODUCTS.length; i++) {
        if (window.PRODUCTS[i].id === id) return window.PRODUCTS[i];
      }
      return null;
    }

    function renderSizes() {
      modalSizes.innerHTML = currentProduct.sizes.map(function (s, i) {
        return '<button class="pill' + (i === selectedSizeIndex ? ' pill--active' : '') + '"' +
          ' type="button" data-size-index="' + i + '">' +
          '<span class="pill__letter">' + escapeHtml(s.label) + '</span>' +
          '<span class="pill__value">' + escapeHtml(s.volume) + '</span>' +
          '</button>';
      }).join('');
    }

    function renderAdditives() {
      modalAdds.innerHTML = currentProduct.additives.map(function (a, i) {
        var active = selectedAdditives.indexOf(a.id) !== -1;
        return '<button class="pill' + (active ? ' pill--active' : '') + '"' +
          ' type="button" data-additive-id="' + escapeHtml(a.id) + '">' +
          '<span class="pill__letter">' + (i + 1) + '</span>' +
          '<span class="pill__value">' + escapeHtml(a.label) + '</span>' +
          '</button>';
      }).join('');
    }

    function updateTotal() {
      var total = currentProduct.sizes[selectedSizeIndex].price;
      currentProduct.additives.forEach(function (a) {
        if (selectedAdditives.indexOf(a.id) !== -1) total += a.price;
      });
      modalTotal.textContent = '$' + total.toFixed(2);
    }

    function openModal(id) {
      var product = findProduct(id);
      if (!product) return;

      currentProduct = product;
      selectedSizeIndex = 0;
      selectedAdditives = [];

      modalImg.src = product.image;
      modalImg.alt = product.name;
      modalTitle.textContent = product.name;
      modalDesc.textContent = product.description;

      renderSizes();
      renderAdditives();
      updateTotal();

      modalEl.hidden = false;
      updateScrollLock();
    }

    function closeModal() {
      modalEl.hidden = true;
      currentProduct = null;
      updateScrollLock();
    }

    modalSizes.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-size-index]');
      if (!btn) return;
      selectedSizeIndex = parseInt(btn.dataset.sizeIndex, 10) || 0;
      renderSizes();
      updateTotal();
    });

    modalAdds.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-additive-id]');
      if (!btn) return;
      var id = btn.dataset.additiveId;
      var idx = selectedAdditives.indexOf(id);
      if (idx === -1) selectedAdditives.push(id);
      else selectedAdditives.splice(idx, 1);
      renderAdditives();
      updateTotal();
    });

    modalEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]') ||
        e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalEl.hidden) closeModal();
    });

    document.addEventListener('click', function (e) {
      var card = e.target.closest('.card--product');
      if (!card || modalEl.contains(card)) return;
      if (card.dataset.id) openModal(card.dataset.id);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var card = e.target.closest('.card--product');
      if (!card) return;
      if (card.dataset.id) {
        e.preventDefault();
        openModal(card.dataset.id);
      }
    });
  }
})();