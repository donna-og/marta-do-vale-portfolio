const films = [
  {
    title: 'AUDI E-TRON GT QUATTRO',
    subtitle: 'LEO NEUGEBAUER',
    kind: 'youtube',
    videoId: 'gLew21SCHho',
    poster: 'https://static.wixstatic.com/media/dcf30e_b42094eba406450ba4a4e67afbed8766~mv2.jpg'
  },
  {
    title: 'BURGUER KING',
    subtitle: 'MISTERY KING',
    kind: 'youtube',
    videoId: 'J5piUQ29V-c',
    poster: 'https://static.wixstatic.com/media/dcf30e_e4aee655d28c408fb446ef55dd5a88b2~mv2.jpg'
  },
  {
    title: 'AUDI X LEO NEUGEBAUER',
    subtitle: '',
    kind: 'youtube',
    videoId: 'MXnyb9T8XtM',
    poster: 'https://static.wixstatic.com/media/dcf30e_82fd0ef459ba437a87ccd09b454560e9~mv2.jpg'
  },
  {
    title: 'ADIDAS X S. L. BENFICA',
    subtitle: '',
    kind: 'youtube',
    videoId: 'N2nX3rAkyAA',
    poster: 'https://static.wixstatic.com/media/dcf30e_1d1bc74d55da49e5befa576cd287fdce~mv2.jpg'
  },
  {
    title: 'AUCHAN',
    subtitle: 'HÁ COISA QUE SÓ NA AUCHAN',
    kind: 'mp4',
    videoSrc: 'https://video.wixstatic.com/video/dcf30e_9194b77da18f4054b8d43ccd0a168cc9/720p/mp4/file.mp4',
    poster: 'https://static.wixstatic.com/media/dcf30e_9194b77da18f4054b8d43ccd0a168cc9f000.jpg'
  },
  {
    title: 'BUONDI',
    subtitle: 'SENTE TUDO',
    kind: 'youtube',
    videoId: 'gHob8ZTJclY',
    poster: 'https://static.wixstatic.com/media/dcf30e_f86da013cd4441f3a450a466e2e7e8e3~mv2.jpg'
  },
  {
    title: 'BOLLYCAO',
    subtitle: '',
    kind: 'youtube',
    videoId: '5Zl8Sqthj1U',
    poster: 'https://static.wixstatic.com/media/dcf30e_cd32195bbc974be8aecd61f6481ff2f4~mv2.jpg'
  },
  {
    title: 'BURGUER KING X LJUBOMIR',
    subtitle: '',
    kind: 'youtube',
    videoId: 'PVS7Sk3HXdc',
    poster: 'https://static.wixstatic.com/media/dcf30e_8f9d6e4d03394d329c225d043bae0ff5~mv2.jpg'
  },
  {
    title: 'NOA PFLANZLICH',
    subtitle: '',
    kind: 'youtube',
    videoId: '60r7k6Jj1Qs',
    poster: 'https://static.wixstatic.com/media/dcf30e_b28ef97b80cb4bcaa9924d31685b3c2a~mv2.jpg'
  },
  {
    title: 'Untitled Project',
    subtitle: '',
    kind: 'youtube',
    videoId: 'Brv89o8x588',
    poster: 'https://static.wixstatic.com/media/dcf30e_dc45f026294e43fbbcc74d612d06dc77~mv2.jpg'
  },
  {
    title: 'BRICOMARCHE 2026',
    subtitle: 'TUDO NUM BRICO',
    kind: 'youtube',
    videoId: 'NhckCyTUAJ0',
    poster: 'https://static.wixstatic.com/media/dcf30e_6cb1f8996274420791fb6aaad89a88e4~mv2.jpg'
  },
  {
    title: 'BPI',
    subtitle: 'CRÉDITO HABITAÇÃO',
    kind: 'youtube',
    videoId: 'Zfh9JDLS0RQ',
    poster: 'https://static.wixstatic.com/media/maxresdefault.jpg'
  },
  {
    title: 'GOLDENERGY',
    subtitle: 'O PAPAGAIO CANTOR',
    kind: 'youtube',
    videoId: 'pBcWwIs4spc',
    poster: 'https://static.wixstatic.com/media/dcf30e_5163e8d558fc4288b29293aef1a91b59~mv2.jpg'
  },
  {
    title: 'BURGUER KING',
    subtitle: 'CHEGOU KING LJUBOMIR',
    kind: 'youtube',
    videoId: 'ifKgXisikBM',
    poster: 'https://static.wixstatic.com/media/dcf30e_e7988f80b8714037ab5957a8fa5176dd~mv2.jpg'
  },
  {
    title: 'DELTA Q',
    subtitle: 'DELTA Q',
    kind: 'youtube',
    videoId: 'cCstYAr7m5Q',
    poster: 'https://static.wixstatic.com/media/dcf30e_b180b68a703442f9947f688c01a1ab72~mv2.jpg'
  },
  {
    title: 'GOLD ENERGY',
    subtitle: '',
    kind: 'youtube',
    videoId: 'B-02IVnjFYo',
    poster: 'https://static.wixstatic.com/media/dcf30e_764c05cc3d9047a0bcfb0240af595abf~mv2.jpg'
  },
  {
    title: 'POLICIA JUDICIÁRIA',
    subtitle: 'NÃO É SÓ UM JOGO. É CRIME.',
    kind: 'youtube',
    videoId: 'ahbusC8xSxY',
    poster: 'https://static.wixstatic.com/media/dcf30e_ad690c3e45f746c5b262d2544ee7a3e7~mv2.jpg'
  },
  {
    title: 'AUCHAN CUIDA',
    subtitle: 'SAÚDE MENTAL',
    kind: 'youtube',
    videoId: 'QIP5tcPX7Yc',
    poster: 'https://static.wixstatic.com/media/dcf30e_c5efb9b7b1404c2e8c64c0ad436b7c04~mv2.jpg'
  },
  {
    title: 'AUCHAN CUIDA',
    subtitle: 'CLÍNICA GERAL',
    kind: 'youtube',
    videoId: 'JKLSTelieUM',
    poster: 'https://static.wixstatic.com/media/dcf30e_549ff96eac674a78aacadf854fd8934b~mv2.jpg'
  },
  {
    title: 'POLÍCIA JUDICIÁRIA',
    subtitle: 'NÃO É SÓ UM JOGO. É CRIME. ÉS CRIMINOSO?',
    kind: 'youtube',
    videoId: 'WQCq1pAFwlQ',
    poster: 'https://static.wixstatic.com/media/dcf30e_3c9f74eea63c43298d668d8c88638f1d~mv2.jpg'
  },
  {
    title: 'SUPER BOCK SKY',
    subtitle: '',
    kind: 'youtube',
    videoId: 'eQOrApn435s',
    poster: 'https://static.wixstatic.com/media/dcf30e_39e0186a8aee4d969d2d5b6e5f1d53a4~mv2.jpg'
  },
  {
    title: 'SPORT TV',
    subtitle: 'SPORT TV',
    kind: 'youtube',
    videoId: 'NOiypiyC5og',
    poster: 'https://static.wixstatic.com/media/dcf30e_9087bebd325340679aee412a75c4dbe9~mv2.jpg'
  },
  {
    title: 'CETELEM 2024',
    subtitle: 'CASA SUSTENTÁVEL',
    kind: 'youtube',
    videoId: 'aENR1rFbuw4',
    poster: 'https://static.wixstatic.com/media/dcf30e_feb8a6a71bcd47539c4fa7676f136451~mv2.jpg'
  },
  {
    title: 'RUBIS GÁS',
    subtitle: 'FESTIVAL',
    kind: 'mp4',
    videoSrc: 'https://video.wixstatic.com/video/dcf30e_3cc3af957c81412a922acd3848c409c1/720p/mp4/file.mp4',
    poster: 'https://static.wixstatic.com/media/dcf30e_3cc3af957c81412a922acd3848c409c1f000.jpg'
  },
  {
    title: 'OLÁ',
    subtitle: 'CORNETTO BRIGADEIRO',
    kind: 'youtube',
    videoId: 'kRV8b8PB8Vg',
    poster: 'https://static.wixstatic.com/media/dcf30e_bab73277997a4cfb809b3fc0d746b775~mv2.jpg'
  }
];

const filmGrid = document.getElementById('film-grid');
const modal = document.querySelector('.video-modal');
const frame = document.getElementById('video-frame');
const player = document.getElementById('video-player');
const closeButton = document.querySelector('.video-close');

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  const url = new URL(window.location.href);
  if (url.hash === '#films') {
    history.replaceState(null, '', `${url.pathname}${url.search}`);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
});

filmGrid.innerHTML = films.map((film) => `
  <button class="film-card" data-kind="${film.kind}" data-video-id="${film.videoId || ''}" data-video-src="${film.videoSrc || ''}" aria-label="Play ${film.title}">
    <img src="${film.poster}" alt="${film.title} poster" loading="lazy" />
    <span class="play-pill">Play</span>
    <span class="film-title">
      <strong>${film.title}</strong>
      ${film.subtitle ? `<small>${film.subtitle}</small>` : ''}
    </span>
  </button>
`).join('');

const filmCards = document.querySelectorAll('.film-card');

const closeModal = () => {
  modal.hidden = true;
  frame.src = '';
  frame.hidden = true;
  player.pause();
  player.removeAttribute('src');
  player.load();
  player.hidden = true;
  document.body.style.overflow = '';
};

filmCards.forEach((card) => {
  card.addEventListener('click', () => {
    const kind = card.dataset.kind;

    if (kind === 'youtube') {
      frame.src = `https://www.youtube.com/embed/${card.dataset.videoId}?autoplay=1&rel=0`;
      frame.hidden = false;
      player.hidden = true;
    } else {
      player.src = card.dataset.videoSrc;
      player.hidden = false;
      frame.hidden = true;
      player.play();
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});

closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});
