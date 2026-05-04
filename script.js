const slugify = (text) => String(text || '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Drift between this array, the commercial
// VideoObject ItemList in index.html, and the
// poster entries in sitemap.xml is caught by
// scripts/check-films-sync.mjs (run on every
// npm test).
const films = [
  {
    title: 'AUDI E-TRON GT QUATTRO',
    subtitle: 'LEO NEUGEBAUER',
    kind: 'youtube',
    videoId: 'gLew21SCHho',
    poster: 'assets/posters/17-dcf30e-b42094eba406450ba4a4e67afbed8766-mv2-jpg.jpg'
  },
  {
    title: 'BURGER KING',
    subtitle: 'MISTERY KING',
    kind: 'youtube',
    videoId: 'J5piUQ29V-c',
    poster: 'assets/posters/22-dcf30e-e4aee655d28c408fb446ef55dd5a88b2-mv2-jpg.jpg'
  },
  {
    title: 'AUDI X LEO NEUGEBAUER',
    subtitle: '',
    kind: 'youtube',
    videoId: 'MXnyb9T8XtM',
    poster: 'assets/posters/10-dcf30e-82fd0ef459ba437a87ccd09b454560e9-mv2-jpg.jpg'
  },
  {
    title: 'ADIDAS X SL BENFICA',
    subtitle: '',
    kind: 'youtube',
    videoId: 'N2nX3rAkyAA',
    poster: 'assets/posters/02-dcf30e-1d1bc74d55da49e5befa576cd287fdce-mv2-jpg.jpg'
  },
  {
    title: 'AUCHAN',
    subtitle: 'HÁ COISA QUE SÓ NA AUCHAN',
    kind: 'mp4',
    videoSrc: 'https://video.wixstatic.com/video/dcf30e_9194b77da18f4054b8d43ccd0a168cc9/720p/mp4/file.mp4',
    poster: 'assets/posters/13-dcf30e-9194b77da18f4054b8d43ccd0a168cc9f000-jpg.jpg'
  },
  {
    title: 'BUONDI',
    subtitle: 'SENTE TUDO',
    kind: 'youtube',
    videoId: 'gHob8ZTJclY',
    poster: 'assets/posters/24-dcf30e-f86da013cd4441f3a450a466e2e7e8e3-mv2-jpg.jpg'
  },
  {
    title: 'BOLLYCÃO',
    subtitle: '',
    kind: 'youtube',
    videoId: '5Zl8Sqthj1U',
    poster: 'assets/posters/20-dcf30e-cd32195bbc974be8aecd61f6481ff2f4-mv2-jpg.jpg'
  },
  {
    title: 'BURGER KING X LJUBOMIR',
    subtitle: '',
    kind: 'youtube',
    videoId: 'PVS7Sk3HXdc',
    poster: 'assets/posters/11-dcf30e-8f9d6e4d03394d329c225d043bae0ff5-mv2-jpg.jpg'
  },
  {
    title: 'NOA PFLANZLICH',
    subtitle: '',
    kind: 'youtube',
    videoId: '60r7k6Jj1Qs',
    poster: 'assets/posters/16-dcf30e-b28ef97b80cb4bcaa9924d31685b3c2a-mv2-jpg.jpg'
  },
  {
    title: 'Untitled Project',
    subtitle: '',
    kind: 'youtube',
    videoId: 'Brv89o8x588',
    poster: 'assets/posters/21-dcf30e-dc45f026294e43fbbcc74d612d06dc77-mv2-jpg.jpg'
  },
  {
    title: 'BRICOMARCHE 2026',
    subtitle: 'TUDO NUM BRICO',
    kind: 'youtube',
    videoId: 'NhckCyTUAJ0',
    poster: 'assets/posters/08-dcf30e-6cb1f8996274420791fb6aaad89a88e4-mv2-jpg.jpg'
  },
  {
    title: 'BPI',
    subtitle: 'CRÉDITO HABITAÇÃO',
    kind: 'youtube',
    videoId: 'Zfh9JDLS0RQ',
    poster: 'assets/posters/01-maxresdefault-jpg.jpg'
  },
  {
    title: 'GOLDENERGY',
    subtitle: 'O PAPAGAIO CANTOR',
    kind: 'youtube',
    videoId: 'pBcWwIs4spc',
    poster: 'assets/posters/06-dcf30e-5163e8d558fc4288b29293aef1a91b59-mv2-jpg.jpg'
  },
  {
    title: 'BURGER KING',
    subtitle: 'CHEGOU KING LJUBOMIR',
    kind: 'youtube',
    videoId: 'ifKgXisikBM',
    poster: 'assets/posters/23-dcf30e-e7988f80b8714037ab5957a8fa5176dd-mv2-jpg.jpg'
  },
  {
    title: 'DELTA Q',
    subtitle: '',
    kind: 'youtube',
    videoId: 'cCstYAr7m5Q',
    poster: 'assets/posters/15-dcf30e-b180b68a703442f9947f688c01a1ab72-mv2-jpg.jpg'
  },
  {
    title: 'GOLDENERGY',
    subtitle: '',
    kind: 'youtube',
    videoId: 'B-02IVnjFYo',
    poster: 'assets/posters/09-dcf30e-764c05cc3d9047a0bcfb0240af595abf-mv2-jpg.jpg'
  },
  {
    title: 'POLÍCIA JUDICIÁRIA',
    subtitle: 'NÃO É SÓ UM JOGO. É CRIME.',
    kind: 'youtube',
    videoId: 'ahbusC8xSxY',
    poster: 'assets/posters/14-dcf30e-ad690c3e45f746c5b262d2544ee7a3e7-mv2-jpg.jpg'
  },
  {
    title: 'AUCHAN CUIDA',
    subtitle: 'SAÚDE MENTAL',
    kind: 'youtube',
    videoId: 'QIP5tcPX7Yc',
    poster: 'assets/posters/19-dcf30e-c5efb9b7b1404c2e8c64c0ad436b7c04-mv2-jpg.jpg'
  },
  {
    title: 'AUCHAN CUIDA',
    subtitle: 'CLÍNICA GERAL',
    kind: 'youtube',
    videoId: 'JKLSTelieUM',
    poster: 'assets/posters/07-dcf30e-549ff96eac674a78aacadf854fd8934b-mv2-jpg.jpg'
  },
  {
    title: 'POLÍCIA JUDICIÁRIA',
    subtitle: 'NÃO É SÓ UM JOGO. É CRIME. ÉS CRIMINOSO?',
    kind: 'youtube',
    videoId: 'WQCq1pAFwlQ',
    poster: 'assets/posters/04-dcf30e-3c9f74eea63c43298d668d8c88638f1d-mv2-jpg.jpg'
  },
  {
    title: 'SUPER BOCK SKY',
    subtitle: '',
    kind: 'youtube',
    videoId: 'eQOrApn435s',
    poster: 'assets/posters/03-dcf30e-39e0186a8aee4d969d2d5b6e5f1d53a4-mv2-jpg.jpg'
  },
  {
    title: 'SPORT TV',
    subtitle: '',
    kind: 'youtube',
    videoId: 'NOiypiyC5og',
    poster: 'assets/posters/12-dcf30e-9087bebd325340679aee412a75c4dbe9-mv2-jpg.jpg'
  },
  {
    title: 'CETELEM 2024',
    subtitle: 'CASA SUSTENTÁVEL',
    kind: 'youtube',
    videoId: 'aENR1rFbuw4',
    poster: 'assets/posters/25-dcf30e-feb8a6a71bcd47539c4fa7676f136451-mv2-jpg.jpg'
  },
  {
    title: 'RUBIS GÁS',
    subtitle: 'FESTIVAL',
    kind: 'mp4',
    videoSrc: 'https://video.wixstatic.com/video/dcf30e_3cc3af957c81412a922acd3848c409c1/720p/mp4/file.mp4',
    poster: 'assets/posters/05-dcf30e-3cc3af957c81412a922acd3848c409c1f000-jpg.jpg'
  },
  {
    title: 'OLÁ',
    subtitle: 'CORNETTO BRIGADEIRO',
    kind: 'youtube',
    videoId: 'kRV8b8PB8Vg',
    poster: 'assets/posters/18-dcf30e-bab73277997a4cfb809b3fc0d746b775-mv2-jpg.jpg'
  }
];

// Additional commercial work beyond the curated 25 in the bento grid.
// Sourced from martadovale.pt — the long tail of campaigns, alternate
// cuts, and earlier-career spots (IKEA, Vodafone, Cofidis, Pingo Doce,
// ALDI, Sagres, Leroy Merlin, etc.). Rendered below the bento as a flat
// archive grid; not part of the JSON-LD ItemList or sitemap.
//
// `wp` = Wix CDN poster (we don't host these locally — they're loaded
// from static.wixstatic.com, which is whitelisted in CSP img-src).
const wp = (id) => `https://static.wixstatic.com/media/${id}`;

const commercialMore = [
  { title: 'INTERMARCHÉ',     subtitle: 'POR SI',                   kind: 'youtube', videoId: 'YmGwWBBSCiM' },
  { title: 'OLÁ',             subtitle: 'SOLERO',                   kind: 'youtube', videoId: 'sSQ-G0Q3sik' },
  { title: 'TOYOTA',          subtitle: 'RELAX',                    kind: 'youtube', videoId: 'BH6Sxl4pgFU' },
  { title: 'INTERMARCHÉ',     subtitle: 'NATAL 2023',               kind: 'youtube', videoId: 'X38zefLAL7M' },
  { title: 'CETELEM',         subtitle: 'RENOVE A CASA',            kind: 'youtube', videoId: 'HN1NA0F8PjI' },
  { title: 'EDP',             subtitle: 'ACREDITA NO SOL',          kind: 'youtube', videoId: 'at5-8N1t5_s' },
  { title: 'CETELEM 2024',    subtitle: 'JUNTAR CRÉDITOS',          kind: 'youtube', videoId: 'HzA-7c1Jp4M' },
  { title: 'BERTRAND',        subtitle: 'NATAL 2023',               kind: 'youtube', videoId: 'dsm2XaFVTSw' },
  { title: 'INTERMARCHÉ',     subtitle: 'NA HORA DE COMPRAR',       kind: 'youtube', videoId: 'Xbs10-t-194' },
  { title: 'INTERMARCHÉ',     subtitle: 'NA HORA DE COMPARAR',      kind: 'youtube', videoId: '_f_nrU7w0mE' },
  { title: 'INTERMARCHÉ',     subtitle: 'O SUPER DAQUI',            kind: 'youtube', videoId: 'qh47cIWY3mk' },
  { title: 'INTERMARCHÉ',     subtitle: '32º ANIVERSÁRIO',          kind: 'youtube', videoId: 'xfdfcwQJm2U' },
  { title: 'CETELEM',         subtitle: 'O CRÉDITO BEM PENSADO',    kind: 'youtube', videoId: '2nsUPDPWJPo' },
  { title: 'INTERMARCHÉ',     subtitle: 'FESTA QUE NINGUÉM PEDIU',  kind: 'youtube', videoId: 'ayfBhrYVkKY' },
  { title: 'OLÁ',             subtitle: 'SOLERO 2',                 kind: 'youtube', videoId: 'BRWey0IuduU' },
  { title: 'INTERMARCHÉ',     subtitle: 'VENHAM CÁ VER ISTO',       kind: 'youtube', videoId: 'Z01mFBYqQQU' },
  { title: 'EDP',             subtitle: 'A TERRA ESTÁ A CHAMAR-TE', kind: 'youtube', videoId: '8FtmzY_GJ_A' },
  { title: 'BIMBO OROWEAT',   subtitle: 'DEIXA-TE LEVAR PELO SABOR',kind: 'youtube', videoId: 'zISozPO8c-Q' },
  { title: 'INTERMARCHÉ',     subtitle: 'NATAL 2022',               kind: 'youtube', videoId: 'HRfLECCjDEo' },
  { title: 'CETELEM',         subtitle: 'PENSE BEM',                kind: 'youtube', videoId: 'bq9s6TYio68' },
  { title: 'CETELEM',         subtitle: 'BLACK PLUS',               kind: 'youtube', videoId: 'F9KobERkHH8' },
  { title: 'CETELEM',         subtitle: 'ABRA A PORTA',             kind: 'youtube', videoId: 'KXhJ28rRBxY' },
  { title: 'ALDI',            subtitle: '15º ANIVERSÁRIO',          kind: 'youtube', videoId: 't7JUkxH3VYU' },
  { title: 'PINGO DOCE',      subtitle: 'QUEM FAZ CONTAS',          kind: 'youtube', videoId: 'bCrtlrE-_D4' },
  { title: 'PINGO DOCE',      subtitle: 'QUEM FAZ CONTAS · II',     kind: 'youtube', videoId: 'ZyT3ukY0Klc' },
  { title: 'TAP',             subtitle: 'VÍDEO DE SEGURANÇA 2016',  kind: 'youtube', videoId: '3ZzX8oFonuA' },
  { title: 'RUBIS GÁS',       subtitle: 'XADREZ',                   kind: 'mp4',     videoSrc: 'https://video.wixstatic.com/video/dcf30e_9830059efce54e438620322eb39cf4af/720p/mp4/file.mp4', poster: wp('dcf30e_9830059efce54e438620322eb39cf4af~mv2.png') },
  { title: 'ALDI',            subtitle: 'AVÓ',                      kind: 'vimeo',   videoId: '596490301',  poster: wp('dcf30e_b7dcee5e746a4fd6b09cb371cc23311d~mv2.jpg') },
  { title: 'BECKEN',          subtitle: 'MOTHER',                   kind: 'vimeo',   videoId: '355950398',  poster: wp('dcf30e_707f258acadb4a239f41b39f447e99df~mv2.jpg') },
  { title: 'LEROY MERLIN',    subtitle: 'FESTA HAVAIANA',           kind: 'vimeo',   videoId: '767686592',  poster: wp('dcf30e_c0a2d8f31d8b40aea9ec130c7d102a9d~mv2.jpg') },
  { title: 'BIMBO',           subtitle: 'BAGELS',                   kind: 'vimeo',   videoId: '744527379',  poster: wp('dcf30e_1cec2783e9b140e49521318061a2e4a8~mv2.jpg') },
  { title: 'WTF',             subtitle: 'UBER OU MAMÃ?',            kind: 'vimeo',   videoId: '233682546',  poster: wp('dcf30e_f35fd01ea58c401181295aaa6d9d44f4~mv2.jpg') },
  { title: 'LEROY MERLIN',    subtitle: 'FESTA ANOS 80',            kind: 'vimeo',   videoId: '767686554',  poster: wp('dcf30e_bfc0f9d1af184d0781abe466ba62347a~mv2.jpg') },
  { title: 'ALDI',            subtitle: 'QUANDO PENSAS',            kind: 'vimeo',   videoId: '595218175',  poster: wp('dcf30e_866a4f516de147558e0a4e6edae2a5e9~mv2.jpg') },
  { title: 'LEROY MERLIN',    subtitle: 'FESTA EM CASA',            kind: 'vimeo',   videoId: '767686573',  poster: wp('dcf30e_dd9e4627a3bb4358ae0725ec0345e075~mv2.jpg') },
  { title: 'LEROY MERLIN',    subtitle: 'FESTA DAS ALMOFADAS',      kind: 'vimeo',   videoId: '767686582',  poster: wp('dcf30e_88756d6197a94cd0a08cbbece5229233~mv2.jpg') },
  { title: 'INTERMARCHÉ',     subtitle: '1, 2, 3 VOU POUPAR',       kind: 'vimeo',   videoId: '809093622',  poster: wp('dcf30e_8db8b9da8ac64b2ebd9b685d81775057~mv2.jpg') },
  { title: 'CETELEM',         subtitle: 'PRÉDIO',                   kind: 'vimeo',   videoId: '692526747',  poster: wp('dcf30e_016dd0fa59a84337b06adee95b74737d~mv2.jpg') },
  { title: 'VODAFONE',        subtitle: 'RALLY',                    kind: 'vimeo',   videoId: '229827911',  poster: wp('dcf30e_e6c70e01e3a14aa39537e39df702bc63~mv2.jpg') },
  { title: 'VODAFONE',        subtitle: 'PAREDES DE COURA',         kind: 'vimeo',   videoId: '341761584',  poster: wp('dcf30e_303844b286cd4d8fa97132ef8d717796~mv2.jpg') },
  { title: 'IKEA',            subtitle: 'DIA DA ARRUMAÇÃO · CASAL', kind: 'vimeo',   videoId: '213856565',  poster: wp('dcf30e_e75e00ddedf94120b68a3a4c4ac0dcc6~mv2.jpg') },
  { title: 'DIETA 3 PASSOS',  subtitle: 'SET DECORATION',           kind: 'vimeo',   videoId: '333371657',  poster: wp('dcf30e_a7f89aa1df724c6682c92c4bbd634c12~mv2.jpg') },
  { title: 'ÁGUA LUSO',       subtitle: 'COMBINAÇÕES PERFEITAS',    kind: 'vimeo',   videoId: '254533618',  poster: wp('dcf30e_449edb4f8f5e42fd813342f366cb19fa~mv2.jpg') },
  { title: 'IKEA',            subtitle: 'DIA DA ARRUMAÇÃO · FAMÍLIA', kind: 'vimeo', videoId: '233334886',  poster: wp('dcf30e_bbbca4d935a240bcb408eeb6ef12f54c~mv2.jpg') },
  { title: 'IKEA',            subtitle: 'MARIANA SEARA CARDOSO',    kind: 'vimeo',   videoId: '211285458',  poster: wp('dcf30e_e87f140f01a54f50accffc664b33aad9~mv2.jpg') },
  { title: 'IKEA',            subtitle: 'DIA DA ARRUMAÇÃO · ESTILO', kind: 'vimeo',  videoId: '232368981',  poster: wp('dcf30e_9f0385ffe23a433e82b31c488e30bc4a~mv2.jpg') },
  { title: 'SAGRES',          subtitle: 'BOHÉMIA',                  kind: 'vimeo',   videoId: '230744775',  poster: wp('dcf30e_062e44f277e6478784b1808d256b80d1~mv2.jpg') },
  { title: 'MIMOSA',          subtitle: 'PEQUENO-ALMOÇO',           kind: 'vimeo',   videoId: '232368952',  poster: wp('dcf30e_10941dc83aec45d08a9f355df6a8515f~mv2.jpg') },
  { title: 'COFIDIS',         subtitle: 'RELAÇÕES VIVAS',           kind: 'vimeo',   videoId: '171906632',  poster: wp('dcf30e_d0afd06551d3491898557d992f930d0f~mv2.jpg') },
  { title: 'COFIDIS',         subtitle: 'GREAT PLACE TO WORK',      kind: 'vimeo',   videoId: '174649598',  poster: wp('dcf30e_79eeae897a0a4214b0a05abc26476464~mv2.jpg') },
  { title: 'COFIDIS',         subtitle: 'ACOMPANHAMENTO FILHOS',    kind: 'vimeo',   videoId: '180197318',  poster: wp('dcf30e_be7c02cfb8d242af949ffb7a4b5d6e08~mv2.jpg') }
];

// Additional cinema credits beyond the four curated cards above. Sourced
// from martadovale.pt (her authoritative portfolio). Mostly props master,
// wardrobe, and make-up assistant credits — the early career on the way
// to the headline art-director jobs. Rendered as a compact thumbnail grid.
const cinemaCredits = [
  { title: 'Le Divan de Staline',                    role: 'Props Master',                 director: 'Fanny Ardant',          kind: 'youtube', videoId: '9RdBz6cPGKA' },
  { title: 'Como Fernando Pessoa Salvou Portugal',   role: 'Props Master',                 director: 'Eugène Green',          kind: 'youtube', videoId: 'UqLvt3MSNX0' },
  { title: 'Axilas',                                  role: 'Props Master',                 director: 'José Fonseca e Costa',  kind: 'youtube', videoId: '7kapkG8LjJY' },
  { title: 'Cosmos',                                  role: 'Props Master',                 director: '',                       kind: 'youtube', videoId: 'd112a5MCpio' },
  { title: 'A Uma Hora Incerta',                      role: 'Props Master',                 director: '',                       kind: 'youtube', videoId: 'jB8RqdCLzuk' },
  { title: 'Fado',                                    role: 'Props Master',                 director: '',                       kind: 'youtube', videoId: 'ungO3-RQwXs' },
  { title: 'Monday',                                  role: 'Props Master',                 director: '',                       kind: 'vimeo',   videoId: '287051681' },
  { title: 'À Jamais',                                role: 'Props Master',                 director: '',                       kind: 'youtube', videoId: 'Qe0mfHiMpXw' },
  { title: 'The Hunchback',                           role: 'Props Master',                 director: '',                       kind: 'youtube', videoId: 'CNQjmbuEcJs' },
  { title: 'Jeunesse',                                role: 'Wardrobe',                     director: '',                       kind: 'youtube', videoId: '4kT0VdZU9t4' },
  { title: 'Os Maias',                                role: 'Make-up & Hair Assistant',     director: '',                       kind: 'youtube', videoId: 'eHSaq8OOB2g' },
  { title: 'Soltar',                                  role: 'Art Director',                 director: '',                       kind: 'vimeo',   videoId: '288566028' },
  { title: '3, 2, 1 Acção!',                          role: 'Make-up & Special Effects',    director: '',                       kind: 'youtube', videoId: 'zG__ih9TelI' }
];

const fallbackImage = 'assets/images/hero-living-room.jpg';

const posterSources = (originalPath) => {
  const match = originalPath.match(/^assets\/posters\/(.+)\.jpe?g$/i);
  if (!match) return { jpg: originalPath, avif: '', webp: '' };
  const base = `assets/posters/optimized/${match[1]}`;
  return {
    jpg: `${base}-800.jpg`,
    avif: `${base}-400.avif 400w, ${base}-800.avif 800w`,
    webp: `${base}-400.webp 400w, ${base}-800.webp 800w`
  };
};

const filmGrid = document.getElementById('film-grid');
const videoModal = document.querySelector('.video-modal');
const contactModal = document.querySelector('.contact-modal');
const frame = document.getElementById('video-frame');
const player = document.getElementById('video-player');
const closeButton = document.querySelector('.video-close');
const prevButton = document.querySelector('.video-prev');
const nextButton = document.querySelector('.video-next');
const shareButton = document.querySelector('.video-share');
const videoLive = document.getElementById('video-live');
const videoToast = document.getElementById('video-toast');
const contactCloseButton = document.querySelector('.contact-close');
const scrollLinks = document.querySelectorAll('[data-scroll-target]');
const contactTriggers = document.querySelectorAll('[data-contact-open]');

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('beforeprint', () => {
  const el = document.getElementById('print-date');
  if (el) el.textContent = new Date().toISOString().slice(0, 10);
});

const filmHashPattern = /^#film=.+$/;

window.addEventListener('load', () => {
  const url = new URL(window.location.href);
  const isFilmHash = filmHashPattern.test(url.hash);
  if (url.hash && !isFilmHash) history.replaceState(null, '', `${url.pathname}${url.search}`);
  if (!isFilmHash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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

// Both arrays render into the same #film-grid as one continuous stream:
// the curated 25 (with sitemap + JSON-LD ItemList tracking) come first,
// followed by the long-tail archive — same tile template throughout, no
// visual separator between them.
const allCommercials = [
  ...films,
  ...commercialMore.map((c) => ({
    ...c,
    poster: c.poster || (c.kind === 'youtube' ? `https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg` : '')
  }))
];

filmGrid.innerHTML = allCommercials.map((film, idx) => {
  const sources = posterSources(film.poster);
  return `
  <button
    type="button"
    class="group relative block overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] text-left shadow-luxe transition duration-300 hover:-translate-y-0.5"
    data-kind="${film.kind}"
    data-video-id="${film.videoId || ''}"
    data-video-src="${film.videoSrc || ''}"
    data-film-title="${film.title}${film.subtitle ? ' · ' + film.subtitle : ''}"
    data-film-slug="${slugify(`${film.title} ${film.subtitle || ''}`)}"
    data-tilt
    data-reveal
    style="--reveal-delay: ${(idx % 6) * 60}ms"
  >
    <picture class="block aspect-video w-full">
      ${sources.avif ? `<source type="image/avif" srcset="${sources.avif}" sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw">` : ''}
      ${sources.webp ? `<source type="image/webp" srcset="${sources.webp}" sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw">` : ''}
      <img src="${sources.jpg}" data-film-poster loading="lazy" decoding="async" data-fallback="${fallbackImage}" width="1280" height="720" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
    </picture>

    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

    <div class="absolute inset-x-4 bottom-4 z-10 max-w-[22rem]">
      <h3 class="font-serif text-[1.2rem] leading-[1] tracking-[-0.02em] text-cream md:text-[1.4rem]">${film.title}</h3>
      ${film.subtitle ? `<p class="mt-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-cream/60">${film.subtitle}</p>` : ''}
    </div>

    <span class="pointer-events-none absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-cream backdrop-blur-md transition group-hover:bg-accent group-hover:text-black" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5"><path d="M8 5v14l11-7z"/></svg>
    </span>
  </button>
`;
}).join('');

const cinemaCreditsGrid = document.getElementById('cinema-credits-grid');
if (cinemaCreditsGrid) {
  cinemaCreditsGrid.innerHTML = cinemaCredits.map((c, idx) => {
    const isYoutube = c.kind === 'youtube';
    const slug = slugify(c.title);
    const posterImg = isYoutube
      ? `<img src="https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg" loading="lazy" decoding="async" width="480" height="360" alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />`
      : `<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1f] to-[#0b0b0d] text-[0.68rem] uppercase tracking-[0.28em] text-accent/70">Vimeo</div>`;
    const meta = [c.role, c.director ? `Dir. ${c.director}` : ''].filter(Boolean).join(' · ');
    return `
      <button
        type="button"
        class="group relative block overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.04] text-left shadow-luxe transition duration-300 hover:-translate-y-0.5"
        data-kind="${c.kind}"
        data-video-id="${c.videoId}"
        data-film-title="${c.title}"
        data-film-slug="${slug}"
        aria-label="Play ${c.title}"
        data-tilt
        data-reveal
        style="--reveal-delay: ${(idx % 6) * 50}ms"
      >
        <div class="aspect-video w-full overflow-hidden bg-[#0b0b0d]">${posterImg}</div>
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
        <div class="absolute inset-x-3 bottom-3 z-10">
          <h4 class="font-serif text-[1.05rem] leading-[1.05] tracking-[-0.02em] text-cream md:text-[1.15rem]">${c.title}</h4>
          ${meta ? `<p class="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-cream/60">${meta}</p>` : ''}
        </div>
        <span class="pointer-events-none absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-cream backdrop-blur-md transition group-hover:bg-accent group-hover:text-black" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><path d="M8 5v14l11-7z"/></svg>
        </span>
      </button>
    `;
  }).join('');
}

const updateFilmCardLabels = () => {
  const t = window.MDV_I18N ? window.MDV_I18N.t : (k) => k;
  const playPrefix = t('film.tile.playPrefix') || 'Play';
  document.querySelectorAll('#film-grid [data-film-title]').forEach((card) => {
    const title = card.getAttribute('data-film-title') || '';
    card.setAttribute('aria-label', `${playPrefix} ${title}`.trim());
    const img = card.querySelector('[data-film-poster]');
    if (img) img.setAttribute('alt', '');
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

const isSaveData = () => {
  try { if (matchMedia('(prefers-reduced-data: reduce)').matches) return true; } catch (e) {}
  return !!(navigator.connection && navigator.connection.saveData);
};

let placeholderEl = null;
const removePlaceholder = () => { placeholderEl && (placeholderEl.remove(), placeholderEl = null); };

const resetPlayer = () => {
  removePlaceholder();
  frame.src = '';
  frame.classList.add('hidden');
  player.pause();
  player.removeAttribute('src');
  player.load();
  player.classList.add('hidden');
};

const mountPlaceholder = (card) => {
  removePlaceholder();
  const el = document.createElement('div');
  el.className = 'flex h-full w-full flex-col items-center justify-center gap-5 bg-black p-8 text-center';
  el.innerHTML = '<p class="max-w-md text-[0.85rem] uppercase tracking-[0.22em] text-cream/72" data-i18n="modal.video.saveDataNotice"></p><button type="button" class="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[0.78rem] uppercase tracking-[0.22em] text-cream transition hover:border-accent hover:text-accent" data-i18n="modal.video.saveDataLoad"></button>';
  el.querySelector('button').addEventListener('click', () => { removePlaceholder(); mountPlayer(card); });
  frame.parentElement.appendChild(el);
  if (window.MDV_I18N) window.MDV_I18N.apply(el);
  placeholderEl = el;
};

const playFor = (card) => isSaveData() ? mountPlaceholder(card) : mountPlayer(card);

const mountPlayer = (card) => {
  const kind = card.dataset.kind;
  frame.title = card.dataset.filmTitle || 'Selected film';
  if (kind === 'youtube') {
    // YouTube's nocookie embed throws "Video player configuration error"
    // (error 153 / embedder.identity.missing.referrer) when it can't
    // verify the embedding origin. The referrerpolicy attr on the iframe
    // covers most cases; the explicit origin= URL param is the belt-and-
    // suspenders that makes file://, localhost, and HTTPS all behave.
    // playsinline=1 is for iOS, modestbranding=1 / iv_load_policy=3
    // remove YouTube branding/annotations to keep the modal cinematic.
    const ytParams = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      playsinline: '1',
      modestbranding: '1',
      iv_load_policy: '3',
      origin: location.origin
    });
    frame.src = `https://www.youtube-nocookie.com/embed/${card.dataset.videoId}?${ytParams}`;
    frame.classList.remove('hidden');
    player.classList.add('hidden');
  } else if (kind === 'vimeo') {
    frame.src = `https://player.vimeo.com/video/${card.dataset.videoId}?autoplay=1&dnt=1`;
    frame.classList.remove('hidden');
    player.classList.add('hidden');
  } else {
    player.src = card.dataset.videoSrc;
    player.classList.remove('hidden');
    frame.classList.add('hidden');
    player.play();
  }
};

const syncFilmHash = (slug) => {
  if (!slug) return;
  const desiredHash = '#film=' + slug;
  if (window.location.hash !== desiredHash) {
    history.pushState(null, '', window.location.pathname + window.location.search + desiredHash);
  }
};

const closeVideoModal = () => {
  videoModal.classList.add('hidden');
  videoModal.classList.remove('flex');
  videoModal.setAttribute('aria-hidden', 'true');
  resetPlayer();
  document.body.style.overflow = '';
  releaseFocus(videoModal);
  if (lastTrigger.video) {
    lastTrigger.video.focus();
    lastTrigger.video = null;
  }
  if (filmHashPattern.test(window.location.hash)) {
    history.pushState(null, '', window.location.pathname + window.location.search);
  }
  if (videoLive) videoLive.textContent = '';
  hideToast();
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

const openVideoModal = (card) => {
  lastTrigger.video = card;
  playFor(card);
  videoModal.classList.remove('hidden');
  videoModal.classList.add('flex');
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  trapFocus(videoModal);
  closeButton.focus();
  syncFilmHash(card.dataset.filmSlug);
};

const playableCards = Array.from(document.querySelectorAll('[data-video-id]'));

const switchFilm = (direction) => {
  if (!playableCards.length || !lastTrigger.video) return;
  const current = playableCards.indexOf(lastTrigger.video);
  if (current < 0) return;
  const nextIndex = (current + direction + playableCards.length) % playableCards.length;
  const nextCard = playableCards[nextIndex];
  resetPlayer();
  playFor(nextCard);
  lastTrigger.video = nextCard;
  syncFilmHash(nextCard.dataset.filmSlug);
  if (videoLive) videoLive.textContent = nextCard.dataset.filmTitle || '';
};

let liveClearTimer = null;
let toastHideTimer = null;
const tr = (k, f) => (window.MDV_I18N && window.MDV_I18N.t(k)) || f;

const announce = (msg) => {
  if (!videoLive || !msg) return;
  videoLive.textContent = msg;
  clearTimeout(liveClearTimer);
  liveClearTimer = setTimeout(() => { videoLive.textContent = ''; }, 3000);
};

const hideToast = () => {
  if (!videoToast) return;
  clearTimeout(toastHideTimer);
  toastHideTimer = null;
  videoToast.classList.remove('opacity-100');
  videoToast.classList.add('opacity-0');
};

const showToast = (msg) => {
  if (!videoToast || !msg) return;
  videoToast.textContent = msg;
  videoToast.classList.remove('opacity-0');
  videoToast.classList.add('opacity-100');
  clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(hideToast, 2000);
};

const handleShare = async () => {
  const card = lastTrigger.video;
  const slug = card && card.dataset.filmSlug;
  if (!slug) return;
  const url = `${location.origin}${location.pathname}#film=${slug}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: card.dataset.filmTitle || 'Marta do Vale', url });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    const msg = tr('modal.video.shareCopied', 'Link copied');
    announce(msg);
    showToast(msg);
  } catch (err) {
    announce(`${tr('modal.video.shareFailed', 'Copy this link:')} ${url}`);
  }
};

const findCardBySlug = (slug) => Array.from(document.querySelectorAll('[data-film-slug]'))
  .find((el) => el.dataset.filmSlug === slug);

videoCards.forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('[data-cinema-secondary]')) return;
    openVideoModal(card);
  });
});

document.querySelectorAll('[data-cinema-secondary]').forEach((link) => {
  link.addEventListener('click', (event) => event.stopPropagation());
});

const openFromHash = (hash) => {
  const match = hash.match(/^#film=(.+)$/);
  if (!match) return false;
  let slug;
  try { slug = decodeURIComponent(match[1]); }
  catch (e) { return false; }
  const card = findCardBySlug(slug);
  if (!card) return false;
  const section = card.closest('section');
  if (section) section.scrollIntoView({ behavior: 'auto', block: 'center' });
  openVideoModal(card);
  return true;
};

openFromHash(window.location.hash);

window.addEventListener('popstate', () => {
  const isModalOpen = !videoModal.classList.contains('hidden');
  if (filmHashPattern.test(window.location.hash)) {
    if (!isModalOpen) {
      openFromHash(window.location.hash);
      return;
    }
    const m = window.location.hash.match(/^#film=(.+)$/);
    let slug = '';
    try { slug = decodeURIComponent(m[1]); } catch (e) {}
    const card = findCardBySlug(slug);
    if (card && card !== lastTrigger.video) {
      resetPlayer();
      playFor(card);
      lastTrigger.video = card;
      if (videoLive) videoLive.textContent = card.dataset.filmTitle || '';
    }
  } else if (isModalOpen) {
    closeVideoModal();
  }
});

contactTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openContactModal();
  });
});

closeButton.addEventListener('click', closeVideoModal);
if (prevButton) prevButton.addEventListener('click', () => switchFilm(-1));
if (nextButton) nextButton.addEventListener('click', () => switchFilm(1));
if (shareButton) shareButton.addEventListener('click', handleShare);
contactCloseButton.addEventListener('click', closeContactModal);

videoModal.addEventListener('click', (event) => {
  if (event.target === videoModal) closeVideoModal();
});

let swipeStart = null;
videoModal.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch') return;
  if (event.target.closest('iframe, video, button')) return;
  swipeStart = { x: event.clientX, y: event.clientY, t: Date.now() };
});
videoModal.addEventListener('pointerup', (event) => {
  if (!swipeStart || event.pointerType !== 'touch') { swipeStart = null; return; }
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  const dt = Date.now() - swipeStart.t;
  swipeStart = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) {
    switchFilm(dx < 0 ? 1 : -1);
  }
});
videoModal.addEventListener('pointercancel', () => { swipeStart = null; });

contactModal.addEventListener('click', (event) => {
  if (event.target === contactModal) closeContactModal();
});

document.addEventListener('keydown', (event) => {
  const videoOpen = !videoModal.classList.contains('hidden');
  if (event.key === 'Escape') {
    if (videoOpen) closeVideoModal();
    if (!contactModal.classList.contains('hidden')) closeContactModal();
    return;
  }
  if (!videoOpen) return;
  if (event.key === 'ArrowRight' || event.key === 'j') {
    event.preventDefault();
    switchFilm(1);
  } else if (event.key === 'ArrowLeft' || event.key === 'k') {
    event.preventDefault();
    switchFilm(-1);
  }
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

const setupScrollSpy = () => {
  if (!('IntersectionObserver' in window)) return;

  const ids = ['cinema', 'commercial', 'about'];
  const map = new Map();
  ids.forEach((id) => {
    const section = document.getElementById(id);
    const link = document.querySelector(`[data-scroll-spy="${id}"]`);
    if (section && link) map.set(section, link);
  });
  if (!map.size) return;

  const setActive = (link) => {
    map.forEach((l) => {
      l.classList.toggle('is-active', l === link);
    });
  };

  const visibility = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    });

    let bestSection = null;
    let bestRatio = 0;
    visibility.forEach((ratio, section) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestSection = section;
      }
    });

    setActive(bestSection ? map.get(bestSection) : null);
  }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

  map.forEach((_, section) => observer.observe(section));
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
  setupScrollSpy();
  setupLangToggle();
  if (window.MDV_I18N) window.MDV_I18N.apply();
});
