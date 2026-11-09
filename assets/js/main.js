(function () {
  var root = document.documentElement;
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}
  }

  function effectiveTheme() {
    var forced = root.getAttribute('data-theme');
    if (forced === 'light' || forced === 'dark') return forced;
    return darkQuery.matches ? 'dark' : 'light';
  }

  function syncThemeControls() {
    var mode = root.getAttribute('data-theme') || 'system';
    root.setAttribute('data-effective-theme', effectiveTheme());
    document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-set') === mode));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    });
  }

  function setTheme(mode) {
    if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
      storageSet('cm-theme', 'dark');
    } else if (mode === 'system') {
      root.removeAttribute('data-theme');
      storageSet('cm-theme', 'system');
    } else {
      root.setAttribute('data-theme', 'light');
      storageSet('cm-theme', null);
    }
    syncThemeControls();
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(btn.getAttribute('data-theme-set'));
    });
  });

  if (darkQuery.addEventListener) {
    darkQuery.addEventListener('change', syncThemeControls);
  }
  syncThemeControls();

  var toastEl = document.querySelector('[data-toast]');
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) return;
    toastEl.querySelector('[data-toast-text]').textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  function formatPrice(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
  }

  var cart = { count: 0, sum: 0 };

  function renderCart() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(cart.count);
      el.setAttribute('data-empty', String(cart.count === 0));
    });
    document.querySelectorAll('[data-cart-sum]').forEach(function (el) {
      el.textContent = formatPrice(cart.sum);
    });
  }

  document.addEventListener('click', function (event) {
    var addBtn = event.target.closest('[data-add]');
    if (!addBtn) return;
    event.preventDefault();
    var qty = 1;
    var unit = Number(addBtn.getAttribute('data-price')) || 0;
    var qtyInput = addBtn.hasAttribute('data-with-qty') ? document.querySelector('[data-qty-input]') : null;
    if (qtyInput) {
      qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      unit = unitPrice(qty);
    }
    cart.count += qty;
    cart.sum += unit * qty;
    renderCart();
    toast('В корзине: ' + addBtn.getAttribute('data-name'));
    addBtn.classList.add('is-added');
    setTimeout(function () {
      addBtn.classList.remove('is-added');
    }, 1400);
  });

  var favCount = 0;

  function renderFav() {
    document.querySelectorAll('[data-fav-count]').forEach(function (el) {
      el.textContent = String(favCount);
      el.setAttribute('data-empty', String(favCount === 0));
    });
  }

  document.addEventListener('click', function (event) {
    var favBtn = event.target.closest('[data-fav]');
    if (!favBtn) return;
    event.preventDefault();
    var pressed = favBtn.getAttribute('aria-pressed') === 'true';
    favBtn.setAttribute('aria-pressed', String(!pressed));
    favCount += pressed ? -1 : 1;
    renderFav();
    toast(pressed ? 'Убрано из избранного' : 'Добавлено в избранное');
  });

  document.addEventListener('click', function (event) {
    var copyBtn = event.target.closest('[data-copy]');
    if (!copyBtn) return;
    var text = copyBtn.getAttribute('data-copy');
    var done = function () {
      toast('Скопировано');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      done();
    }
  });

  document.querySelectorAll('[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      toast(form.getAttribute('data-demo-form'));
      if (form.hasAttribute('data-reset')) form.reset();
    });
  });

  var notice = document.querySelector('[data-notice]');
  var noticeClose = document.querySelector('[data-notice-close]');
  if (notice && noticeClose) {
    noticeClose.addEventListener('click', function () {
      notice.hidden = true;
    });
  }

  var drawer = document.querySelector('[data-drawer]');
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var first = drawer.querySelector('button, a');
    if (first) first.focus();
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-drawer-open]').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      openDrawer();
    });
  });

  document.querySelectorAll('[data-drawer-close]').forEach(function (btn) {
    btn.addEventListener('click', closeDrawer);
  });

  var megaBtn = document.querySelector('[data-mega-toggle]');
  var mega = document.querySelector('[data-mega]');

  function setMega(open) {
    if (!megaBtn || !mega) return;
    mega.hidden = !open;
    megaBtn.setAttribute('aria-expanded', String(open));
  }

  if (megaBtn && mega) {
    megaBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      setMega(mega.hidden);
    });
    document.addEventListener('click', function (event) {
      if (!mega.hidden && !mega.contains(event.target)) setMega(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeDrawer();
      setMega(false);
    }
  });

  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (other) {
          var selected = other === tab;
          other.setAttribute('aria-selected', String(selected));
          other.tabIndex = selected ? 0 : -1;
          document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
        });
      });
      tab.addEventListener('keydown', function (event) {
        var dir = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        var next = tabs[(index + dir + tabs.length) % tabs.length];
        next.focus();
        next.click();
      });
    });
  });

  var tiers = document.querySelectorAll('[data-tier-min]');

  function unitPrice(qty) {
    var price = 0;
    tiers.forEach(function (tier) {
      if (qty >= Number(tier.getAttribute('data-tier-min'))) {
        price = Number(tier.getAttribute('data-tier-price'));
      }
    });
    return price;
  }

  var qtyInput = document.querySelector('[data-qty-input]');

  function renderQty() {
    if (!qtyInput) return;
    var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    qtyInput.value = String(qty);
    var unit = unitPrice(qty);
    tiers.forEach(function (tier) {
      tier.classList.toggle('is-active', Number(tier.getAttribute('data-tier-price')) === unit);
    });
    document.querySelectorAll('[data-unit-price]').forEach(function (el) {
      el.textContent = formatPrice(unit);
    });
    document.querySelectorAll('[data-total-price]').forEach(function (el) {
      el.textContent = qty > 1 ? qty + ' шт. — ' + formatPrice(unit * qty) : 'за 1 шт.';
    });
  }

  if (qtyInput) {
    document.querySelectorAll('[data-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = Number(btn.getAttribute('data-qty-step'));
        qtyInput.value = String(Math.max(1, (parseInt(qtyInput.value, 10) || 1) + step));
        renderQty();
      });
    });
    qtyInput.addEventListener('change', renderQty);
    renderQty();
  }

  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('[data-thumb]'));
    var mainImg = gallery.querySelector('[data-gallery-img]');
    var counter = gallery.querySelector('[data-gallery-counter]');
    var lightbox = document.querySelector('[data-lightbox]');
    var lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    var lightboxCount = lightbox ? lightbox.querySelector('[data-lightbox-count]') : null;
    var current = 0;

    var show = function (index) {
      current = (index + thumbs.length) % thumbs.length;
      var thumb = thumbs[current];
      mainImg.src = thumb.getAttribute('data-full');
      mainImg.alt = thumb.getAttribute('data-alt');
      thumbs.forEach(function (t, i) {
        t.setAttribute('aria-current', String(i === current));
      });
      if (counter) counter.textContent = current + 1 + ' / ' + thumbs.length;
      if (lightboxImg) {
        lightboxImg.src = thumb.getAttribute('data-full');
        lightboxImg.alt = thumb.getAttribute('data-alt');
      }
      if (lightboxCount) lightboxCount.textContent = current + 1 + ' из ' + thumbs.length;
    };

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        show(index);
      });
    });

    var startX = null;
    var mainBtn = gallery.querySelector('[data-gallery-main]');
    mainBtn.addEventListener('touchstart', function (event) {
      startX = event.touches[0].clientX;
    }, { passive: true });
    mainBtn.addEventListener('touchend', function (event) {
      if (startX === null) return;
      var dx = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        mainBtn.setAttribute('data-swiped', 'true');
        show(current + (dx < 0 ? 1 : -1));
      }
    });

    if (lightbox && typeof lightbox.showModal === 'function') {
      mainBtn.addEventListener('click', function () {
        if (mainBtn.getAttribute('data-swiped') === 'true') {
          mainBtn.removeAttribute('data-swiped');
          return;
        }
        show(current);
        lightbox.showModal();
      });
      lightbox.querySelector('[data-lightbox-close]').addEventListener('click', function () {
        lightbox.close();
      });
      lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', function () {
        show(current - 1);
      });
      lightbox.querySelector('[data-lightbox-next]').addEventListener('click', function () {
        show(current + 1);
      });
      lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox || event.target.classList.contains('lightbox__stage')) lightbox.close();
      });
      lightbox.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') show(current + 1);
        if (event.key === 'ArrowLeft') show(current - 1);
      });
    }

    show(0);
  }

  renderCart();
  renderFav();
})();
