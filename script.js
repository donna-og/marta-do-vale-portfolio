const films = [
  {
    title: 'AUDI E-TRON GT QUATTRO',
    subtitle: 'LEO NEUGEBAUER',
    kind: 'youtube',
    videoId: 'gLew21SCHho',
    poster: 'assets/posters/17-dcf30e-b42094eba406450ba4a4e67afbed8766-mv2-jpg.jpg',
    size: 'md:col-span-7 md:row-span-4'
  },
  {
    title: 'BURGUER KING',
    subtitle: 'MISTERY KING',
    kind: 'youtube',
    videoId: 'J5piUQ29V-c',
    poster: 'assets/posters/22-dcf30e-e4aee655d28c408fb446ef55dd5a88b2-mv2-jpg.jpg',
    size: 'md:col-span-5 md:row-span-2'
  },
  {
    title: 'AUDI X LEO NEUGEBAUER',
    subtitle: '',
    kind: 'youtube',
    videoId: 'MXnyb9T8XtM',
    poster: 'assets/posters/10-dcf30e-82fd0ef459ba437a87ccd09b454560e9-mv2-jpg.jpg',
    size: 'md:col-span-5 md:row-span-2'
  },
  {
    title: 'ADIDAS X S. L. BENFICA',
    subtitle: '',
    kind: 'youtube',
    videoId: 'N2nX3rAkyAA',
    poster: 'assets/posters/02-dcf30e-1d1bc74d55da49e5befa576cd287fdce-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'AUCHAN',
    subtitle: 'HÁ COISA QUE SÓ NA AUCHAN',
    kind: 'mp4',
    videoSrc: 'https://video.wixstatic.com/video/dcf30e_9194b77da18f4054b8d43ccd0a168cc9/720p/mp4/file.mp4',
    poster: 'assets/posters/13-dcf30e-9194b77da18f4054b8d43ccd0a168cc9f000-jpg.jpg',
    size: 'md:col-span-4 md:row-span-4'
  },
  {
    title: 'BUONDI',
    subtitle: 'SENTE TUDO',
    kind: 'youtube',
    videoId: 'gHob8ZTJclY',
    poster: 'assets/posters/24-dcf30e-f86da013cd4441f3a450a466e2e7e8e3-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'BOLLYCAO',
    subtitle: '',
    kind: 'youtube',
    videoId: '5Zl8Sqthj1U',
    poster: 'assets/posters/20-dcf30e-cd32195bbc974be8aecd61f6481ff2f4-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'BURGUER KING X LJUBOMIR',
    subtitle: '',
    kind: 'youtube',
    videoId: 'PVS7Sk3HXdc',
    poster: 'assets/posters/11-dcf30e-8f9d6e4d03394d329c225d043bae0ff5-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'NOA PFLANZLICH',
    subtitle: '',
    kind: 'youtube',
    videoId: '60r7k6Jj1Qs',
    poster: 'assets/posters/16-dcf30e-b28ef97b80cb4bcaa9924d31685b3c2a-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'Untitled Project',
    subtitle: '',
    kind: 'youtube',
    videoId: 'Brv89o8x588',
    poster: 'assets/posters/21-dcf30e-dc45f026294e43fbbcc74d612d06dc77-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'BRICOMARCHE 2026',
    subtitle: 'TUDO NUM BRICO',
    kind: 'youtube',
    videoId: 'NhckCyTUAJ0',
    poster: 'assets/posters/08-dcf30e-6cb1f8996274420791fb6aaad89a88e4-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'BPI',
    subtitle: 'CRÉDITO HABITAÇÃO',
    kind: 'youtube',
    videoId: 'Zfh9JDLS0RQ',
    poster: 'assets/posters/01-maxresdefault-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'GOLDENERGY',
    subtitle: 'O PAPAGAIO CANTOR',
    kind: 'youtube',
    videoId: 'pBcWwIs4spc',
    poster: 'assets/posters/06-dcf30e-5163e8d558fc4288b29293aef1a91b59-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'BURGUER KING',
    subtitle: 'CHEGOU KING LJUBOMIR',
    kind: 'youtube',
    videoId: 'ifKgXisikBM',
    poster: 'assets/posters/23-dcf30e-e7988f80b8714037ab5957a8fa5176dd-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'DELTA Q',
    subtitle: 'DELTA Q',
    kind: 'youtube',
    videoId: 'cCstYAr7m5Q',
    poster: 'assets/posters/15-dcf30e-b180b68a703442f9947f688c01a1ab72-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'GOLD ENERGY',
    subtitle: '',
    kind: 'youtube',
    videoId: 'B-02IVnjFYo',
    poster: 'assets/posters/09-dcf30e-764c05cc3d9047a0bcfb0240af595abf-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'POLICIA JUDICIÁRIA',
    subtitle: 'NÃO É SÓ UM JOGO. É CRIME.',
    kind: 'youtube',
    videoId: 'ahbusC8xSxY',
    poster: 'assets/posters/14-dcf30e-ad690c3e45f746c5b262d2544ee7a3e7-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'AUCHAN CUIDA',
    subtitle: 'SAÚDE MENTAL',
    kind: 'youtube',
    videoId: 'QIP5tcPX7Yc',
    poster: 'assets/posters/19-dcf30e-c5efb9b7b1404c2e8c64c0ad436b7c04-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'AUCHAN CUIDA',
    subtitle: 'CLÍNICA GERAL',
    kind: 'youtube',
    videoId: 'JKLSTelieUM',
    poster: 'assets/posters/07-dcf30e-549ff96eac674a78aacadf854fd8934b-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'POLÍCIA JUDICIÁRIA',
    subtitle: 'NÃO É SÓ UM JOGO. É CRIME. ÉS CRIMINOSO?',
    kind: 'youtube',
    videoId: 'WQCq1pAFwlQ',
    poster: 'assets/posters/04-dcf30e-3c9f74eea63c43298d668d8c88638f1d-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'SUPER BOCK SKY',
    subtitle: '',
    kind: 'youtube',
    videoId: 'eQOrApn435s',
    poster: 'assets/posters/03-dcf30e-39e0186a8aee4d969d2d5b6e5f1d53a4-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'SPORT TV',
    subtitle: 'SPORT TV',
    kind: 'youtube',
    videoId: 'NOiypiyC5og',
    poster: 'assets/posters/12-dcf30e-9087bebd325340679aee412a75c4dbe9-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'CETELEM 2024',
    subtitle: 'CASA SUSTENTÁVEL',
    kind: 'youtube',
    videoId: 'aENR1rFbuw4',
    poster: 'assets/posters/25-dcf30e-feb8a6a71bcd47539c4fa7676f136451-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'RUBIS GÁS',
    subtitle: 'FESTIVAL',
    kind: 'mp4',
    videoSrc: 'https://video.wixstatic.com/video/dcf30e_3cc3af957c81412a922acd3848c409c1/720p/mp4/file.mp4',
    poster: 'assets/posters/05-dcf30e-3cc3af957c81412a922acd3848c409c1f000-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  },
  {
    title: 'OLÁ',
    subtitle: 'CORNETTO BRIGADEIRO',
    kind: 'youtube',
    videoId: 'kRV8b8PB8Vg',
    poster: 'assets/posters/18-dcf30e-bab73277997a4cfb809b3fc0d746b775-mv2-jpg.jpg',
    size: 'md:col-span-4 md:row-span-2'
  }
];

const fallbackImage = 'assets/images/hero-living-room.jpg';
const filmGrid = document.getElementById('film-grid');
const videoModal = document.querySelector('.video-modal');
const contactModal = document.querySelector('.contact-modal');
const frame = document.getElementById('video-frame');
const player = document.getElementById('video-player');
const closeButton = document.querySelector('.video-close');
const contactCloseButton = document.querySelector('.contact-close');
const scrollLinks = document.querySelectorAll('[data-scroll-target]');
const contactTriggers = document.querySelectorAll('[data-contact-open]');

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('load', () => {
  const url = new URL(window.location.href);
  if (url.hash) history.replaceState(null, '', `${url.pathname}${url.search}`);
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
});

scrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.dataset.scrollTarget;
    const target = targetId === 'top' ? document.body : document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    history.replaceState(null, '', window.location.pathname + window.location.search);

    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

filmGrid.innerHTML = films.map((film, idx) => `
  <button
    type="button"
    class="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] text-left shadow-luxe transition duration-300 hover:-translate-y-0.5 md:relative ${film.size}"
    data-kind="${film.kind}"
    data-video-id="${film.videoId || ''}"
    data-video-src="${film.videoSrc || ''}"
    data-film-title="${film.title}"
    data-tilt
    data-reveal
    style="--reveal-delay: ${(idx % 4) * 90}ms"
  >
    <div class="grid min-h-[11rem] grid-cols-[136px_minmax(0,1fr)] md:block md:h-full">
      <img src="${film.poster}" data-film-poster loading="lazy" decoding="async" data-fallback="${fallbackImage}" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-full" />
      <div class="flex flex-col justify-between p-4 md:hidden">
        <div>
          <p class="text-[0.68rem] uppercase tracking-[0.22em] text-accent" data-i18n="film.tile.eyebrow">Film</p>
          <h3 class="mt-2 font-serif text-[1.35rem] leading-[0.95] tracking-[-0.03em] text-cream">${film.title}</h3>
          ${film.subtitle ? `<p class="mt-2 text-[0.72rem] uppercase tracking-[0.16em] text-cream/58">${film.subtitle}</p>` : ''}
        </div>
        <p class="mt-4 text-[0.72rem] uppercase tracking-[0.22em] text-cream/50" data-i18n="film.tile.tap">Tap to play</p>
      </div>
    </div>

    <div class="absolute inset-0 hidden bg-gradient-to-b from-black/5 via-black/10 to-black/90 md:block"></div>
    <div class="absolute inset-x-4 top-4 z-10 hidden items-start justify-between gap-3 md:flex">
      <span class="text-[0.72rem] uppercase tracking-[0.22em] text-cream/70" data-i18n="film.tile.eyebrow">Film</span>
    </div>
    <div class="absolute inset-x-4 bottom-4 z-10 hidden max-w-[18rem] md:block">
      <h3 class="font-serif text-[1.65rem] leading-[0.92] tracking-[-0.03em] text-cream">${film.title}</h3>
      ${film.subtitle ? `<p class="mt-1 text-[0.82rem] uppercase tracking-[0.16em] text-cream/60">${film.subtitle}</p>` : ''}
    </div>
  </button>
`).join('');

const updateFilmCardLabels = () => {
  const t = window.MDV_I18N ? window.MDV_I18N.t : (k) => k;
  const playPrefix = t('film.tile.playPrefix') || 'Play';
  document.querySelectorAll('#film-grid [data-film-title]').forEach((card) => {
    const title = card.getAttribute('data-film-title') || '';
    card.setAttribute('aria-label', `${playPrefix} ${title}`.trim());
    const img = card.querySelector('[data-film-poster]');
    if (img) img.setAttribute('alt', title);
  });
};

updateFilmCardLabels();
document.addEventListener('mdv:langchange', updateFilmCardLabels);

document.querySelectorAll('img[data-fallback]').forEach((img) => {
  img.addEventListener('error', () => {
    if (img.dataset.failed === 'true') return;
    img.dataset.failed = 'true';
    img.src = img.dataset.fallback;
  });
});

const videoCards = document.querySelectorAll('[data-kind]');

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea, iframe';
const lastTrigger = { contact: null, video: null };

const trapFocus = (modal) => {
  const handler = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  modal.addEventListener('keydown', handler);
  modal._focusTrap = handler;
};

const releaseFocus = (modal) => {
  if (modal._focusTrap) {
    modal.removeEventListener('keydown', modal._focusTrap);
    modal._focusTrap = null;
  }
};

const closeVideoModal = () => {
  videoModal.classList.add('hidden');
  videoModal.classList.remove('flex');
  videoModal.setAttribute('aria-hidden', 'true');
  frame.src = '';
  frame.classList.add('hidden');
  player.pause();
  player.removeAttribute('src');
  player.load();
  player.classList.add('hidden');
  document.body.style.overflow = '';
  releaseFocus(videoModal);
  if (lastTrigger.video) {
    lastTrigger.video.focus();
    lastTrigger.video = null;
  }
};

const openContactModal = () => {
  lastTrigger.contact = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  contactModal.classList.remove('hidden');
  contactModal.classList.add('flex');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  trapFocus(contactModal);
  contactCloseButton.focus();
};

const closeContactModal = () => {
  contactModal.classList.add('hidden');
  contactModal.classList.remove('flex');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  releaseFocus(contactModal);
  if (lastTrigger.contact) {
    lastTrigger.contact.focus();
    lastTrigger.contact = null;
  }
};

videoCards.forEach((card) => {
  card.addEventListener('click', () => {
    const kind = card.dataset.kind;
    lastTrigger.video = card;

    if (kind === 'youtube') {
      frame.src = `https://www.youtube.com/embed/${card.dataset.videoId}?autoplay=1&rel=0`;
      frame.classList.remove('hidden');
      player.classList.add('hidden');
    } else {
      player.src = card.dataset.videoSrc;
      player.classList.remove('hidden');
      frame.classList.add('hidden');
      player.play();
    }

    videoModal.classList.remove('hidden');
    videoModal.classList.add('flex');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trapFocus(videoModal);
    closeButton.focus();
  });
});

contactTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openContactModal();
  });
});

closeButton.addEventListener('click', closeVideoModal);
contactCloseButton.addEventListener('click', closeContactModal);

videoModal.addEventListener('click', (event) => {
  if (event.target === videoModal) closeVideoModal();
});

contactModal.addEventListener('click', (event) => {
  if (event.target === contactModal) closeContactModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!videoModal.classList.contains('hidden')) closeVideoModal();
  if (!contactModal.classList.contains('hidden')) closeContactModal();
});

const marqueeItems = [
  'Audi', 'Burger King', 'Adidas × SL Benfica', 'Auchan', 'BPI', 'Delta Q',
  'Super Bock', 'Cetelem', 'Cornetto', 'Polícia Judiciária', 'Bricomarché',
  'GoldEnergy', 'Buondi', 'Bollycão', 'Sport TV', 'Rubis Gás', 'Diamantino',
  'All the Dreams in the World', 'Pela Boca Morre o Peixe', 'Lura'
];

const marqueeMarkup = marqueeItems.map((item) => `<span class="marquee__item">${item}</span>`).join('');
const marqueeA = document.getElementById('marquee-group-a');
const marqueeB = document.getElementById('marquee-group-b');
if (marqueeA && marqueeB) {
  marqueeA.innerHTML = marqueeMarkup;
  marqueeB.innerHTML = marqueeMarkup;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setupReveals = () => {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js-reveals');
    return;
  }

  document.documentElement.classList.add('js-reveals');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.willChange = 'opacity, transform';
      el.classList.add('is-revealed');
      observer.unobserve(el);
      const cleanup = () => {
        el.style.willChange = '';
        el.removeEventListener('transitionend', cleanup);
      };
      el.addEventListener('transitionend', cleanup);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
};

const setupHeaderScroll = () => {
  const header = document.querySelector('.header-shell');
  if (!header) return;

  const apply = (t) => {
    header.style.setProperty('--header-bg-opacity', (0.45 + (0.92 - 0.45) * t).toFixed(3));
    header.style.setProperty('--header-blur', `${(12 + 16 * t).toFixed(1)}px`);
    header.style.setProperty('--wordmark-scale', (1 - 0.15 * t).toFixed(3));
    header.style.setProperty('--eyebrow-opacity', (0.6 - 0.25 * t).toFixed(3));
  };

  if (reducedMotion.matches) {
    apply(0);
    return;
  }

  let ticking = false;
  const update = () => {
    const range = Math.min(window.innerHeight * 0.6, 600);
    const t = Math.max(0, Math.min(1, window.scrollY / range));
    apply(t);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
};

const setupLangToggle = () => {
  if (!window.MDV_I18N) return;
  const toggle = document.querySelector('[data-lang-toggle]');
  const opts = document.querySelectorAll('[data-lang-opt]');
  if (!toggle || !opts.length) return;

  const sync = (lang) => {
    opts.forEach((el) => {
      el.classList.toggle('is-active', el.dataset.langOpt === lang);
    });
    toggle.setAttribute('aria-label', `Language: ${lang.toUpperCase()}`);
  };

  toggle.addEventListener('click', () => {
    const next = window.MDV_I18N.getLang() === 'en' ? 'pt' : 'en';
    window.MDV_I18N.setLang(next);
  });

  document.addEventListener('mdv:langchange', (event) => sync(event.detail.lang));
  sync(window.MDV_I18N.getLang());
};

const onReady = (fn) => {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
};

onReady(() => {
  setupReveals();
  setupHeaderScroll();
  setupLangToggle();
  if (window.MDV_I18N) window.MDV_I18N.apply();
});
