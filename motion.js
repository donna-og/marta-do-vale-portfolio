(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  const motionEnabled = () => !reducedMotion.matches && finePointer.matches;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function initHeroParallax() {
    const root = document.querySelector('[data-hero-parallax]');
    if (!root) return;

    const ranges = {
      front: { x: 8, y: 6, ry: 2 },
      mid: { x: 5, y: 3, ry: 1.2 },
      back: { x: 3, y: 2, ry: 0.6 }
    };

    const layers = Array.from(root.querySelectorAll('[data-parallax-layer]')).map((el) => ({
      el,
      range: ranges[el.dataset.parallaxLayer] || ranges.back,
      current: { x: 0, y: 0, ry: 0 },
      target: { x: 0, y: 0, ry: 0 }
    }));

    if (!layers.length) return;

    let frameId = null;

    const tick = () => {
      let settled = true;
      for (const layer of layers) {
        const { current, target, el } = layer;
        current.x = lerp(current.x, target.x, 0.09);
        current.y = lerp(current.y, target.y, 0.09);
        current.ry = lerp(current.ry, target.ry, 0.09);
        if (
          Math.abs(current.x - target.x) > 0.04 ||
          Math.abs(current.y - target.y) > 0.04 ||
          Math.abs(current.ry - target.ry) > 0.02
        ) {
          settled = false;
        }
        el.style.transform =
          `perspective(1200px) translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0) rotateY(${current.ry.toFixed(2)}deg)`;
      }
      frameId = settled ? null : requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      if (!motionEnabled()) return;
      const rect = root.getBoundingClientRect();
      const cx = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2), -1, 1);
      const cy = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2), -1, 1);
      for (const layer of layers) {
        layer.target.x = cx * layer.range.x;
        layer.target.y = cy * layer.range.y;
        layer.target.ry = cx * layer.range.ry;
      }
      if (frameId == null) frameId = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      for (const layer of layers) {
        layer.target.x = 0;
        layer.target.y = 0;
        layer.target.ry = 0;
      }
      if (frameId == null) frameId = requestAnimationFrame(tick);
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
  }

  function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    const MAX_TILT = 6;

    cards.forEach((card) => {
      const hasSheen = card.hasAttribute('data-sheen');

      const onEnter = () => {
        if (!motionEnabled()) return;
        card.style.transition = `transform 220ms ${EASE}, box-shadow 220ms ${EASE}`;
        card.style.willChange = 'transform';
        if (hasSheen) card.style.setProperty('--sheen-opacity', '1');
      };

      const onMove = (event) => {
        if (!motionEnabled()) return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * (MAX_TILT * 2);
        const ry = (px - 0.5) * (MAX_TILT * 2);
        card.style.transition = `transform 90ms linear, box-shadow 220ms ${EASE}`;
        card.style.transform =
          `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(8px)`;
        if (hasSheen) {
          card.style.setProperty('--sheen-x', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--sheen-y', `${(py * 100).toFixed(1)}%`);
        }
      };

      const onLeave = () => {
        card.style.transition = `transform 600ms ${EASE}, box-shadow 600ms ${EASE}`;
        card.style.transform = '';
        card.style.willChange = '';
        if (hasSheen) card.style.setProperty('--sheen-opacity', '0');
      };

      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
    });
  }

  function init() {
    if (!motionEnabled()) return;
    initHeroParallax();
    initTiltCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
