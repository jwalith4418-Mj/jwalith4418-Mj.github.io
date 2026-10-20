(() => {
  'use strict';
  const body = document.body;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const status = document.querySelector('#hero-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const heroes = [...document.querySelectorAll('[data-hero]')].map((button, index) => ({
    id: button.dataset.hero, button, image: button.querySelector('img'),
    art: button.closest('.hero-art'), section: button.closest('[data-chapter]'),
    name: button.querySelector('img').alt, index, entered: false,
    visible: false, reveal: 0, x: 0, dragX: 0, power: 0, powerAge: 0, hover: false, focused: false, attention: 0,
  }));
  const links = [...document.querySelectorAll('[data-hero-link]')];
  heroes.forEach(hero => {
    const canvas = hero.button.querySelector('.hero-effects');
    hero.effects = window.HeroEffects?.create(canvas, hero.id, hero.image);
    hero.rig=window.FigureRig?.create(hero.image,hero.id);hero.rigTime=-1;hero.rigActive=false;
  });
  const canvas = document.querySelector('#city-world');
  let ctx = null;
  try { ctx = canvas.getContext('2d'); } catch { /* Static city remains available. */ }
  if (!ctx) canvas.hidden = true;
  let raf = 0, lastTime = 0, clock = 0, active = '', width = 0, height = 0, lastDraw = 0;
  const pointer = {x: 0, y: 0, sx: 0, sy: 0};
  const quiet = () => reduced.matches || body.classList.contains('reading-mode') || body.classList.contains('reduced-motion');
  const paused = () => body.classList.contains('motion-paused');
  const running = () => !document.hidden && !body.classList.contains('modal-open') && !quiet() && !paused();

  function size() {
    width = innerWidth; height = innerHeight;
    heroes.forEach(hero => {hero.effects?.resize();hero.rig?.resize();});
    if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, width < 760 ? 1.5 : 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function updateSections() {
    let current = heroes[0];
    for (const hero of heroes) {
      if (hero.section.getBoundingClientRect().top < innerHeight * .48) current = hero;
      const rect = hero.art.getBoundingClientRect();
      // Render just outside the viewport; only reset once fully away from it.
      // Reversing a small scroll therefore continues the same reveal.
      hero.visible = rect.bottom > -96 && rect.top < innerHeight + 96;
      if (hero.visible) hero.entered = true;
      else if (rect.bottom < -160 || rect.top > innerHeight + 160) {
        hero.entered = false; hero.reveal = 0;
        if(hero.rigActive){hero.rig?.release();hero.rigActive=false;hero.rigTime=-1;}
      }
    }
    const previous = heroes.find(hero => hero.id === active);
    if (previous && current !== previous) {
      const boundary = current.index > previous.index ? current : previous;
      const threshold = innerHeight * (current.index > previous.index ? .445 : .515);
      const top = boundary.section.getBoundingClientRect().top;
      if (current.index > previous.index ? top >= threshold : top <= threshold) current = previous;
    }
    if (current && active !== current.id) {
      active = current.id;
      body.setAttribute('data-active-hero', active);
      links.forEach(link => {
        if (link.dataset.heroLink === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      status.textContent = current.name.toUpperCase() + ' / READY';
      window.HeroAudio?.play(active, true);
    }
  }
  function drawCity() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#83dfff'; ctx.fillStyle = '#83dfff';
    const count = width < 760 ? 20 : 38;
    for (let i = 0; i < count; i++) {
      const x = ((i * 137.27 + clock * (2 + i % 4)) % (width + 80)) - 40 + pointer.sx * 12;
      const y = ((i * 193.19 + clock * (1 + i % 3)) % (height + 80)) - 40;
      ctx.globalAlpha = .13 + .09 * Math.sin(clock + i);
      ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 1.8 : .8, 0, Math.PI * 2); ctx.fill();
      if (i % 5 === 0) {
        ctx.globalAlpha = .045;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 45, y - 65); ctx.lineTo(x + 95, y - 50); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function paint(hero, dt) {
    if (!hero.visible) return;
    hero.reveal = quiet() ? 1 : clamp(hero.reveal + dt * 1.65, 0, 1);
    hero.x += (hero.dragX - hero.x) * (1 - Math.exp(-dt * 12));
    hero.attention += ((hero.hover || hero.focused ? 1 : 0) - hero.attention) * (1 - Math.exp(-dt * 7));
    if (hero.power > 0) {
      hero.powerAge += dt;
      hero.power = Math.max(0, 1 - hero.powerAge / 1.15);
      if (!hero.power) hero.art.classList.remove('powered');
    }
    const progress = 1 - Math.pow(1 - hero.reveal, 3);
    const rect = hero.art.getBoundingClientRect();
    const edge = clamp(Math.min(rect.bottom, innerHeight - rect.top) / 140, 0, 1);
    const visibility = edge * edge * (3 - 2 * edge);
    const scroll = clamp((innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight, -.7, .7);
    const pose = window.CharacterMotion.pose(hero.id, {time:clock, power:hero.power, age:hero.powerAge, attention:hero.attention, pointerX:pointer.sx, pointerY:pointer.sy});
    const amplitude = width < 760 ? .68 : 1;
    let x = hero.x + pose.x * amplitude, y = pose.y * amplitude - scroll * 18 + (1 - progress) * 65;
    let rotation = pose.rotation * amplitude, scale = .94 + progress * .06 + (pose.scale - 1) * amplitude;
    if (quiet()) { x = 0; y = 0; rotation = 0; scale = 1; }
    else if (hero.art.classList.contains('poster-art')) {
      x *= .28; y *= .3; rotation *= .22;
      scale = .975 + progress * .025;
    }
    hero.image.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    hero.image.style.opacity = String(quiet() ? 1 : progress * visibility);
    if(quiet())hero.rig?.quiet();
    else if(clock-hero.rigTime>=(width<760?.05:.032)){
      hero.rig?.draw({time:clock,power:hero.power,age:hero.powerAge,attention:hero.attention,yaw:hero.x/70*2.6,pointerX:pointer.sx,pointerY:pointer.sy});hero.rigTime=clock;hero.rigActive=true;
    }
    hero.rig?.sync();
    hero.art.querySelector('.power-ring').style.transform = `rotate(${hero.id === 'strange' ? clock * 9 : -20 + scroll * 12}deg)`;
    if (hero.effects) {
      hero.button.querySelector('.hero-effects').style.transform = hero.image.style.transform;
      hero.button.querySelector('.hero-effects').style.opacity = hero.image.style.opacity;
      if (quiet()) hero.effects.clear(); else if(clock-(hero.effectsTime??-1)>=.032){hero.effects.draw(hero.power, clock, hero.powerAge, hero.attention);hero.effectsTime=clock;}
    }
  }
  function frame(now) {
    raf = 0;
    updateSections();
    const dt = clamp((now - (lastTime || now - 16)) / 1000, .001, .05);
    lastTime = now;
    if (running()) {
      clock += dt;
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 4));
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 4));
      heroes.forEach(hero => paint(hero, dt));
      window.ChapterEnvironments?.frame(clock, dt);
      if (now - lastDraw >= 32) { drawCity(); lastDraw = now; }
      if(window.PortfolioActivity?.active()!==false)raf = requestAnimationFrame(frame);
    } else if(paused()&&!document.hidden&&!body.classList.contains('modal-open')&&!quiet()) {
      heroes.forEach(hero=>paint(hero,0));
    } else if (quiet()) {
      heroes.forEach(hero => { hero.reveal = 1; hero.art.classList.remove('powered'); paint(hero, 0); });
      if (ctx) ctx.clearRect(0, 0, width, height);
    }
  }
  function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
  document.addEventListener('portfolio-activity',schedule);
  function syncMode() {
    if(body.classList.contains('activity-hidden')!==document.hidden)body.classList.toggle('activity-hidden',document.hidden);
    if (raf) cancelAnimationFrame(raf);
    raf = 0; lastTime = 0;
    window.ChapterEnvironments?.setMode(running(), quiet());
    heroes.forEach(hero => {
      if (!running()) { hero.hover = false; hero.focused = false; hero.attention = 0; hero.cancelDrag?.(); }
      hero.button.setAttribute('aria-disabled', String(quiet() || paused()));
      if (quiet()) { hero.power = 0; hero.art.classList.remove('powered');hero.rig?.quiet(); }
    });
    schedule();
  }
  function power(hero) {
    if (!running()) return;
    hero.power = 1; hero.powerAge = 0;
    hero.art.classList.remove('powered');
    void hero.art.offsetWidth; // Restart the short CSS power effect on repeated presses.
    hero.art.classList.add('powered');
    window.HeroAudio?.play(hero.id);
    const anchor = window.HeroEffects?.anchor(hero.image, hero.id,{time:clock,power:hero.power,age:hero.powerAge,attention:hero.attention});
    if(anchor)window.ChapterEnvironments?.trigger(hero.id, anchor.x / innerWidth, anchor.y / innerHeight);
    status.textContent = hero.name.toUpperCase() + ' / ' + hero.button.querySelector('.hero-power-label').textContent.replace('↗', '').trim().toUpperCase();
    schedule();
  }
  heroes.forEach(hero => {
    let drag = null, suppress = false;
    hero.button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch' && running()) { hero.hover = true; schedule(); } });
    hero.button.addEventListener('pointerleave', () => { hero.hover = false; });
    hero.button.addEventListener('focus', () => { if (running()) { hero.focused = true; schedule(); } });
    hero.button.addEventListener('blur', () => { hero.focused = false; });
    hero.cancelDrag = () => { drag = null; hero.dragX = 0; hero.button.classList.remove('dragging'); };
    hero.button.addEventListener('pointerdown', event => {
      if (!running() || event.button !== 0) return;
      drag = {id: event.pointerId, x: event.clientX, base: hero.dragX, moved: false};
      suppress = false;
      hero.button.classList.add('dragging');
      hero.button.setPointerCapture?.(event.pointerId);
    });
    hero.button.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id || !running()) return;
      const distance = event.clientX - drag.x;
      drag.moved ||= Math.abs(distance) > 7;
      hero.dragX = clamp(drag.base + distance * .55, -70, 70);
      schedule();
    });
    function finish(event) {
      if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
      suppress = drag.moved;
      const capturedId = drag.id; drag = null; hero.dragX = 0;
      hero.button.classList.remove('dragging');
      if (hero.button.hasPointerCapture?.(capturedId)) hero.button.releasePointerCapture(capturedId);
    }
    hero.button.addEventListener('pointerup', finish);
    hero.button.addEventListener('pointercancel', finish);
    hero.button.addEventListener('lostpointercapture', finish);
    window.addEventListener('blur', () => { hero.hover = false; hero.focused = false; hero.cancelDrag(); });
    hero.button.addEventListener('click', event => {
      if (suppress && event.detail !== 0) { suppress = false; return; }
      suppress = false; power(hero);
    });
    hero.button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key) || !running()) return;
      event.preventDefault();
      hero.dragX = event.key === 'Home' ? 0 : clamp(hero.dragX + (event.key === 'ArrowRight' ? 18 : -18), -70, 70);
      schedule();
    });
  });
  // Native smooth anchor navigation remains interruptible by the visitor.
  // Decode the destination artwork before it enters the viewport, avoiding a pop-in.
  links.forEach(link => {
    function prepare() {
      const destination = heroes.find(hero => hero.id === link.dataset.heroLink);
      if (destination) {
        destination.image.loading = 'eager';
        destination.image.decode?.().catch(() => {});
      }
    }
    link.addEventListener('pointerenter', prepare);
    link.addEventListener('focus', prepare);
    link.addEventListener('click', prepare);
  });
  function replay() {
    window.ChapterEnvironments?.reset();
    heroes.forEach(hero => { hero.reveal = 0; hero.entered = false; hero.dragX = 0; hero.power = 0; hero.art.classList.remove('powered'); });
    document.querySelector('#home').scrollIntoView({behavior: quiet() || paused() ? 'auto' : 'smooth'});
    status.textContent = quiet() ? 'READING MODE / READY' : 'REVEALS / RESTARTED';
    schedule();
  }
  document.querySelector('#replay-reveals').addEventListener('click', replay);
  const credits = document.querySelector('#credits-dialog');
  document.querySelector('#art-credits').addEventListener('click', () => {
    if (!credits.open) credits.showModal();
    body.classList.add('modal-open');
  });
  credits.addEventListener('close', () => {
    if (![...document.querySelectorAll('dialog')].some(dialog => dialog.open)) body.classList.remove('modal-open');
  });
  window.addEventListener('pointermove', event => {
    if(event.pointerType==='touch')return;
    pointer.x = clamp(event.clientX / innerWidth * 2 - 1,-1,1); pointer.y = clamp(event.clientY / innerHeight * 2 - 1,-1,1);
  }, {passive: true});
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', () => { size(); schedule(); }, {passive: true});
  document.addEventListener('visibilitychange', syncMode);
  reduced.addEventListener('change', syncMode);
  new MutationObserver(syncMode).observe(body, {attributes: true, attributeFilter: ['class']});
  window.MarvelExperience = Object.freeze({replay, get activeHero() { return active; }});
  size(); syncMode();
})();
