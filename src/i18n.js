(function (global) {
  const dict = {
    en: {
      'meta.title': 'Marta do Vale · Art Direction',
      'meta.description': 'Marta do Vale is a Lisbon-based art director and production designer creating cinematic visual worlds for films and commercials.',

      'brand.home': 'Marta do Vale · home',
      'brand.eyebrow': 'Art Direction',

      'a11y.skipToMain': 'Skip to content',

      'nav.cinema': 'Cinema',
      'nav.commercial': 'Commercial',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.langLabel': 'Language',

      'cta.contactFloating': 'Contact Marta',

      'image.alt.aboutStudy': 'Styled study interior with layered props and warm light',

      'film.tile.playPrefix': 'Play',

      'modal.video.label': 'Selected film player',
      'modal.video.close': 'Close video',
      'modal.video.prev': 'Previous film',
      'modal.video.next': 'Next film',
      'modal.video.share': 'Share this film',
      'modal.video.shareCopied': 'Link copied',
      'modal.video.shareFailed': 'Copy this link:',
      'modal.video.saveDataNotice': 'Trailers play from YouTube and Vimeo. Loading uses data.',
      'modal.video.saveDataLoad': 'Load trailer',
      'modal.contact.close': 'Close contact',

      'hero.eyebrow': 'Art Director · Lisbon',
      'hero.headline': 'Every commercial, a short film. Every short film, a Cannes entry.',
      'hero.lede': "Marta do Vale is an art director based in Lisbon. Cinema since 2011, commercials since 2016. Cannes Critics' Week credit on Diamantino (2018). Direct line. No agent.",
      'hero.cta.commercials': 'View commercials',
      'hero.cta.movies': 'View movies',
      'hero.card.since.eyebrow': 'Working since',
      'hero.card.since.body': 'Cinema 2011 · Commercials 2016',
      'hero.card.clients.eyebrow': 'Selected clients',
      'hero.card.clients.body': 'Audi · Burger King · Adidas · Auchan · BPI · Polícia Judiciária',
      'hero.card.line.eyebrow': 'Direct line',

      'about.eyebrow': 'About',
      'about.headline': 'Art director. Cinema rigor for every brief.',
      'about.p1': "Lisbon-born, August 1990. Art director by trade. Cinema since 2011, commercials since 2016. Educated at Escola Artística António Arroio, Faculdade de Arquitetura, and ESTC.",
      'about.p2': "Pela Boca Morre o Peixe took Best Short at MOTELx 2014. Todos os Sonhos do Mundo (Leopardo Filmes / Paulo Branco) followed in 2017. Diamantino, the satire she helped dress, won the Grand Prize at Semaine de la Critique, Cannes 2018.",
      'about.p3': "She runs the art department on set, bilingually, on Lisbon-based productions. Cinema and commercials aren't separate practices. The cinema craft is what makes the commercials worth watching. Direct line. No agent.",

      'cinema.eyebrow': 'Selected films',
      'cinema.heading': 'Cinema',
      'cinema.sub': "A Cannes Critics' Week winner. A MOTELx Best Short. A decade in the art department.",
      'cinema.play.badge': 'Play trailer',

      'cinema.diamantino.meta': '2018 · Wardrobe · Dir. Gabriel Abrantes & Daniel Schmidt',
      'cinema.diamantino.title': 'Diamantino',
      'cinema.diamantino.festival': "Grand Prize · Semaine de la Critique · Cannes 2018",
      'cinema.diamantino.caption': 'A genre-bending political satire whose visual identity is its punchline.',
      'cinema.diamantino.action': 'View on IMDb',

      'cinema.dreams.meta': '2017 · Art Director · Dir. Laurence Ferreira Barbosa',
      'cinema.dreams.title': 'All the Dreams in the World',
      'cinema.dreams.titleAlt': 'Todos os Sonhos do Mundo',
      'cinema.dreams.festival': 'Leopardo Filmes · Paulo Branco',
      'cinema.dreams.caption': 'A France–Portugal feature on the diaspora. Design across two countries.',
      'cinema.dreams.action': 'View on IMDb',

      'cinema.peixe.meta': '2014 · Art Department · Dir. João P. Nunes',
      'cinema.peixe.title': 'Pela Boca Morre o Peixe',
      'cinema.peixe.festival': 'Best Short Film · MOTELx 2014',
      'cinema.peixe.caption': 'A Kafka-inflected horror short. The hunter becomes the hunted.',
      'cinema.peixe.action': 'View on IMDb',

      'cinema.lura.meta': '2013 · Art Director · Dir. Luís Brás',
      'cinema.lura.title': 'Lura',
      'cinema.lura.caption': 'Earliest credit on record. Short, adventure drama.',
      'cinema.lura.action': 'View on IMDb',

      'festivals.0': "Cannes Critics' Week 2018",
      'festivals.1': 'MOTELx 2014 Best Short',
      'festivals.2': 'Leopardo Filmes · Paulo Branco',
      'festivals.3': 'In cinema since 2011',

      'commercial.eyebrow': 'Selected campaigns',
      'commercial.heading': 'Commercial',
      'commercial.sub': 'Automotive prestige, retail, public service. The through-line is the set.',
      'commercial.noscript.heading': 'Selected commercials',
      'commercial.noscript.lede': "If video isn't loading, open any spot directly:",

      'contact.eyebrow': 'Contact',
      'contact.headline': "Let's talk about the frame.",
      'contact.sub': 'Marta represents herself. Email or WhatsApp lands directly with her. No agents, no gatekeepers, no briefing forms.',
      'contact.email.eyebrow': 'Email',
      'contact.email.action': 'Write to Marta',
      'contact.whatsapp.eyebrow': 'Phone · WhatsApp',
      'contact.whatsapp.action': 'Open WhatsApp',
      'contact.instagram.eyebrow': 'Instagram',
      'contact.instagram.action': 'See recent work',
      'contact.imdb.eyebrow': 'IMDb',
      'contact.imdb.headline': 'Selected film credits',
      'contact.imdb.action': 'Open IMDb profile',
      'contact.vcard.eyebrow': 'vCard',
      'contact.vcard.headline': 'Save to contacts',
      'contact.vcard.action': 'Download .vcf',
      'contact.closing': 'Lisbon, Portugal · Available worldwide.',

      'notFound.meta.title': 'Off-camera · Marta do Vale',
      'notFound.meta.description': 'This frame is off-camera. Return to selected work by Marta do Vale, art director based in Lisbon.',
      'notFound.eyebrow': '404 · Off-camera',
      'notFound.headline': "This frame didn't make the final cut.",
      'notFound.body': "Marta's selected work: a Cannes Critics' Week winner, a MOTELx Best Short, and a decade of cinematic commercials. One cut away.",
      'notFound.cta': 'Back to the work'
    },
    pt: {
      'meta.title': 'Marta do Vale · Direção de Arte',
      'meta.description': 'Marta do Vale é diretora de arte em Lisboa. Mundos visuais cinematográficos para cinema e publicidade.',

      'brand.home': 'Marta do Vale · início',
      'brand.eyebrow': 'Direção de Arte',

      'a11y.skipToMain': 'Ir para o conteúdo',

      'nav.cinema': 'Cinema',
      'nav.commercial': 'Comercial',
      'nav.about': 'Sobre',
      'nav.contact': 'Contacto',
      'nav.langLabel': 'Idioma',

      'cta.contactFloating': 'Falar com a Marta',

      'image.alt.aboutStudy': 'Escritório com adereços trabalhados e luz quente',

      'film.tile.playPrefix': 'Ver',

      'modal.video.label': 'Reprodução do filme selecionado',
      'modal.video.close': 'Fechar vídeo',
      'modal.video.prev': 'Filme anterior',
      'modal.video.next': 'Filme seguinte',
      'modal.video.share': 'Partilhar filme',
      'modal.video.shareCopied': 'Link copiado',
      'modal.video.shareFailed': 'Copia este link:',
      'modal.video.saveDataNotice': 'Os trailers carregam do YouTube e do Vimeo. Reprodução consome dados.',
      'modal.video.saveDataLoad': 'Carregar trailer',
      'modal.contact.close': 'Fechar contacto',

      'hero.eyebrow': 'Diretora de Arte · Lisboa',
      'hero.headline': 'Cada publicidade, uma curta. Cada curta, um filme de Cannes.',
      'hero.lede': 'Marta do Vale é diretora de arte em Lisboa. No cinema desde 2011, na publicidade desde 2016. Crédito na Semana da Crítica de Cannes com Diamantino (2018). Contacto direto. Sem agente.',
      'hero.cta.commercials': 'Ver comerciais',
      'hero.cta.movies': 'Ver filmes',
      'hero.card.since.eyebrow': 'Em atividade desde',
      'hero.card.since.body': 'Cinema 2011 · Publicidade 2016',
      'hero.card.clients.eyebrow': 'Clientes selecionados',
      'hero.card.clients.body': 'Audi · Burger King · Adidas · Auchan · BPI · Polícia Judiciária',
      'hero.card.line.eyebrow': 'Contacto direto',

      'about.eyebrow': 'Sobre',
      'about.headline': 'Diretora de arte. Rigor de cinema em qualquer briefing.',
      'about.p1': 'Lisboeta, agosto de 1990. Diretora de arte de profissão. No cinema desde 2011, na publicidade desde 2016. Formação na Escola Artística António Arroio, Faculdade de Arquitetura e ESTC.',
      'about.p2': 'Pela Boca Morre o Peixe arrecadou o Melhor Curta-Metragem no MOTELx 2014. Todos os Sonhos do Mundo (Leopardo Filmes / Paulo Branco) chegou em 2017. Diamantino, a sátira que ajudou a vestir, venceu o Grande Prémio da Semaine de la Critique, Cannes 2018.',
      'about.p3': 'Dirige o departamento de arte em rodagem, bilíngue, em produções com base em Lisboa. Cinema e publicidade não são práticas separadas. É o ofício do cinema que torna a publicidade digna de se ver. Contacto direto. Sem agente.',

      'cinema.eyebrow': 'Filmes selecionados',
      'cinema.heading': 'Cinema',
      'cinema.sub': 'Vencedor da Semana da Crítica de Cannes. Melhor Curta no MOTELx. Uma década no departamento de arte.',
      'cinema.play.badge': 'Ver trailer',

      'cinema.diamantino.meta': '2018 · Guarda-Roupa · Real. Gabriel Abrantes & Daniel Schmidt',
      'cinema.diamantino.title': 'Diamantino',
      'cinema.diamantino.festival': 'Grande Prémio · Semaine de la Critique · Cannes 2018',
      'cinema.diamantino.caption': 'Uma sátira política inclassificável em que a identidade visual é a piada.',
      'cinema.diamantino.action': 'Ver no IMDb',

      'cinema.dreams.meta': '2017 · Direção de Arte · Real. Laurence Ferreira Barbosa',
      'cinema.dreams.title': 'Todos os Sonhos do Mundo',
      'cinema.dreams.titleAlt': 'All the Dreams in the World',
      'cinema.dreams.festival': 'Leopardo Filmes · Paulo Branco',
      'cinema.dreams.caption': 'Uma longa franco-portuguesa sobre a diáspora. Direção de arte entre dois países.',
      'cinema.dreams.action': 'Ver no IMDb',

      'cinema.peixe.meta': '2014 · Departamento de Arte · Real. João P. Nunes',
      'cinema.peixe.title': 'Pela Boca Morre o Peixe',
      'cinema.peixe.festival': 'Melhor Curta-Metragem · MOTELx 2014',
      'cinema.peixe.caption': 'Uma curta de horror kafkiana. O caçador passa a ser caça.',
      'cinema.peixe.action': 'Ver no IMDb',

      'cinema.lura.meta': '2013 · Direção Artística · Real. Luís Brás',
      'cinema.lura.title': 'Lura',
      'cinema.lura.caption': 'Primeiro crédito registado. Curta, drama de aventura.',
      'cinema.lura.action': 'Ver no IMDb',

      'festivals.0': 'Semana da Crítica de Cannes 2018',
      'festivals.1': 'MOTELx 2014 Melhor Curta',
      'festivals.2': 'Leopardo Filmes · Paulo Branco',
      'festivals.3': 'No cinema desde 2011',

      'commercial.eyebrow': 'Campanhas selecionadas',
      'commercial.heading': 'Comercial',
      'commercial.sub': 'Prestígio automóvel, retalho, serviço público. O que liga tudo é o cenário.',
      'commercial.noscript.heading': 'Comerciais selecionados',
      'commercial.noscript.lede': 'Se o vídeo não carregar, abre qualquer trabalho diretamente:',

      'contact.eyebrow': 'Contacto',
      'contact.headline': 'Vamos falar do enquadramento.',
      'contact.sub': 'A Marta representa-se a si própria. Email ou WhatsApp chegam-lhe diretamente. Sem agentes, sem intermediários, sem formulários.',
      'contact.email.eyebrow': 'Email',
      'contact.email.action': 'Escrever à Marta',
      'contact.whatsapp.eyebrow': 'Telefone · WhatsApp',
      'contact.whatsapp.action': 'Abrir WhatsApp',
      'contact.instagram.eyebrow': 'Instagram',
      'contact.instagram.action': 'Ver trabalho recente',
      'contact.imdb.eyebrow': 'IMDb',
      'contact.imdb.headline': 'Créditos de cinema',
      'contact.imdb.action': 'Abrir perfil IMDb',
      'contact.vcard.eyebrow': 'vCard',
      'contact.vcard.headline': 'Guardar nos contactos',
      'contact.vcard.action': 'Descarregar .vcf',
      'contact.closing': 'Lisboa, Portugal · Disponível em qualquer lugar.',

      'notFound.meta.title': 'Fora de campo · Marta do Vale',
      'notFound.meta.description': 'Esta cena ficou fora de campo. Voltar ao trabalho selecionado de Marta do Vale, diretora de arte em Lisboa.',
      'notFound.eyebrow': '404 · Fora de campo',
      'notFound.headline': 'Esta cena não chegou ao corte final.',
      'notFound.body': 'O trabalho selecionado da Marta: um vencedor da Semana da Crítica de Cannes, um Melhor Curta no MOTELx e uma década de publicidade cinematográfica. A um corte de distância.',
      'notFound.cta': 'Voltar ao trabalho'
    }
  };

  const STORAGE_KEY = 'mdv-lang';
  const SUPPORTED = ['en', 'pt'];
  const FALLBACK = 'en';
  const EVENT_NAME = 'mdv:langchange';

  function readQueryLang() {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = (params.get('lang') || '').toLowerCase();
      if (SUPPORTED.indexOf(value) !== -1) return value;
    } catch (e) {}
    return null;
  }

  function detect() {
    const fromQuery = readQueryLang();
    if (fromQuery) return fromQuery;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    const navLangs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || FALLBACK];
    for (let i = 0; i < navLangs.length; i++) {
      const code = String(navLangs[i] || '').toLowerCase().split('-')[0];
      if (code === 'pt') return 'pt';
      if (code === 'en') return 'en';
    }
    return FALLBACK;
  }

  function syncUrl(lang) {
    if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;
    let params;
    try { params = new URLSearchParams(window.location.search); }
    catch (e) { return; }
    const current = (params.get('lang') || '').toLowerCase();
    if (lang === FALLBACK) {
      if (!params.has('lang')) return;
      params.delete('lang');
    } else {
      if (current === lang) return;
      params.set('lang', lang);
    }
    const query = params.toString();
    const next = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
    try { window.history.replaceState(window.history.state, '', next); } catch (e) {}
  }

  let currentLang = detect();

  function t(key) {
    const table = dict[currentLang] || dict[FALLBACK];
    if (key in table) return table[key];
    if (key in dict[FALLBACK]) return dict[FALLBACK][key];
    return '';
  }

  function apply(root) {
    root = root || document;
    const textNodes = root.querySelectorAll('[data-i18n]');
    for (let i = 0; i < textNodes.length; i++) {
      const el = textNodes[i];
      const value = t(el.getAttribute('data-i18n'));
      if (value) el.textContent = value;
    }
    const attrNodes = root.querySelectorAll('[data-i18n-attr]');
    for (let j = 0; j < attrNodes.length; j++) {
      const el = attrNodes[j];
      const spec = el.getAttribute('data-i18n-attr');
      const pairs = spec.split(',');
      for (let k = 0; k < pairs.length; k++) {
        const parts = pairs[k].split(':');
        const attr = (parts[0] || '').trim();
        const key = (parts[1] || '').trim();
        if (!attr || !key) continue;
        const value = t(key);
        if (value) el.setAttribute(attr, value);
      }
    }
    const title = t('meta.title');
    if (title) document.title = title;
    const desc = t('meta.description');
    if (desc) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', desc);
    }
    document.documentElement.setAttribute('lang', currentLang);
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    if (lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    syncUrl(lang);
    apply();
    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { lang: lang } }));
  }

  function getLang() { return currentLang; }

  global.MDV_I18N = { dict: dict, t: t, apply: apply, setLang: setLang, getLang: getLang };

  document.documentElement.setAttribute('lang', currentLang);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    apply();
  }
})(window);
