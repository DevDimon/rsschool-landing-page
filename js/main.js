(function () {
  'use strict';

  /* ----- Год в футере ----- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ----- Слайдер (бесшовное зацикливание) ----- */
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var track    = slider.querySelector('[data-slider-track]');
    var prevBtn  = slider.querySelector('[data-slider-prev]');
    var nextBtn  = slider.querySelector('[data-slider-next]');
    var dotsWrap = slider.querySelector('[data-slider-dots]');

    var slides = Array.prototype.slice.call(track.children);
    var total  = slides.length;

    /* Клонируем края: [clone(last), s1, s2, ..., sN, clone(first)] */
    var firstClone = slides[0].cloneNode(true);
    var lastClone  = slides[total - 1].cloneNode(true);

    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    firstClone.classList.add('slider__slide--clone');
    lastClone.classList.add('slider__slide--clone');

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    var index    = 1;
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
      else if (index === 0)   snapTo(total);
      animating = false;
    });

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    if (dotsWrap) {
      dotsWrap.addEventListener('click', function (e) {
        var dot = e.target.closest('.slider__dot');
        if (!dot || animating) return;

        var target   = parseInt(dot.dataset.index, 10) || 0;
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
    slider.addEventListener('focusin',    function () { clearInterval(auto); });

    track.style.transition = 'none';
    track.style.transform  = 'translateX(-100%)';
    void track.offsetWidth;

    renderDots();
  }

  /* ----- Каталог: табы + показать ещё ----- */
  var tabs    = document.querySelectorAll('.tab[data-category]');
  var grids   = document.querySelectorAll('[data-grid]');
  var moreWrap = document.querySelector('.catalog__more');
  var moreBtn  = document.querySelector('[data-show-more]');

  function activeGrid() {
    for (var i = 0; i < grids.length; i++) {
      if (!grids[i].hidden) return grids[i];
    }
    return null;
  }

  function refreshMoreButton() {
    if (!moreWrap || !moreBtn) return;
    var grid = activeGrid();
    if (!grid) { moreWrap.hidden = true; return; }
    var extras = grid.querySelectorAll('.grid__item--extra');
    var hasHidden = Array.prototype.some.call(extras, function (el) { return el.hidden; });
    moreWrap.hidden = !hasHidden;
  }

  if (tabs.length && grids.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var cat = tab.dataset.category;
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle('tab--active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        grids.forEach(function (g) { g.hidden = g.dataset.grid !== cat; });
        refreshMoreButton();
      });
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      var grid = activeGrid();
      if (!grid) return;
      grid.querySelectorAll('.grid__item--extra[hidden]').forEach(function (el) {
        el.hidden = false;
      });
      refreshMoreButton();
    });
  }

  refreshMoreButton();
})();