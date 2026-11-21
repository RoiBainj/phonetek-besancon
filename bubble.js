/* Effet bulle liquid glass : une loupe de verre suit le doigt / la souris sur les boutons */
(function(){
  var SEL = '.btn, .chip, .rc-opt > span, .nav-links a, .sw button, .menu-toggle';
  var hideT = new WeakMap();

  function setup(el){
    if (el.__bubble) return el.__bubble;
    var b = document.createElement('span');
    b.className = 'bubble';
    b.setAttribute('aria-hidden','true');
    el.appendChild(b);
    el.__bubble = b;
    return b;
  }
  function moveTo(el, b, clientX){
    var r = el.getBoundingClientRect();
    var half = b.offsetWidth / 2;
    var x = clientX - r.left;
    /* la bulle reste dans les limites du bouton, comme le highlight iOS */
    var min = Math.min(half * .55, r.width / 2);
    var max = Math.max(r.width - half * .55, r.width / 2);
    b.style.left = Math.max(min, Math.min(max, x)) + 'px';
  }
  function show(el, clientX, instant){
    var b = setup(el);
    clearTimeout(hideT.get(el));
    if (instant) { b.classList.add('track'); }
    moveTo(el, b, clientX);
    requestAnimationFrame(function(){ b.classList.add('on'); });
    if (instant) setTimeout(function(){ b.classList.remove('track'); }, 30);
  }
  function hide(el, delay){
    var b = el.__bubble; if (!b) return;
    clearTimeout(hideT.get(el));
    hideT.set(el, setTimeout(function(){ b.classList.remove('on'); }, delay || 0));
  }

  document.addEventListener('pointerenter', function(e){
    var el = e.target.closest && e.target.closest(SEL);
    if (el && e.pointerType === 'mouse') show(el, e.clientX, true);
  }, true);
  document.addEventListener('pointermove', function(e){
    var el = e.target.closest && e.target.closest(SEL);
    if (!el || !el.__bubble || !el.__bubble.classList.contains('on')) return;
    if (e.pointerType === 'mouse' || e.buttons) { el.__bubble.classList.add('track'); moveTo(el, el.__bubble, e.clientX); }
  }, true);
  document.addEventListener('pointerleave', function(e){
    var el = e.target.closest && e.target.closest(SEL);
    if (el && e.pointerType === 'mouse') hide(el, 0);
  }, true);

  /* tactile : la bulle apparait sous le doigt et reste un instant apres le relachement */
  document.addEventListener('pointerdown', function(e){
    var el = e.target.closest && e.target.closest(SEL);
    if (el) show(el, e.clientX, true);
  }, true);
  ['pointerup','pointercancel'].forEach(function(t){
    document.addEventListener(t, function(e){
      var el = e.target.closest && e.target.closest(SEL);
      if (el) hide(el, e.pointerType === 'mouse' ? 250 : 450);
    }, true);
  });

  /* clavier */
  document.addEventListener('focusin', function(e){
    var el = e.target.closest && e.target.closest(SEL);
    if (el && el.matches(':focus-visible')) { var r = el.getBoundingClientRect(); show(el, r.left + r.width / 2); }
  });
  document.addEventListener('focusout', function(e){
    var el = e.target.closest && e.target.closest(SEL);
    if (el) hide(el, 0);
  });

  /* les cartes d'options (radios/cases) cachees : montrer la bulle quand on coche */
  document.addEventListener('change', function(e){
    var i = e.target;
    if (i.matches && i.matches('.rc-opt input')) {
      var s = i.nextElementSibling;
      if (s) { var r = s.getBoundingClientRect(); show(s, r.left + r.width / 2); hide(s, 600); }
    }
  });
})();
