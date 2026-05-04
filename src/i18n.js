(function (global) {
  const dict = {
    en: {
      'meta.title': 'Marta do Vale — Art Direction',
      'meta.description': 'Marta do Vale is a Lisbon-based art director and production designer creating cinematic visual worlds for films and commercials.',

      'brand.home': 'Marta do Vale — home',
      'brand.eyebrow': 'Art Direction',

      'nav.cinema': 'Cinema',
      'nav.commercial': 'Commercial',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.langLabel': 'Language',

      'cta.contactFloating': 'Contact Marta',

      'image.alt.heroLiving': 'Cinematic living-room set by Marta do Vale',
      'image.alt.heroNeon': 'Neon-lit sculptural set design',
      'image.alt.heroCandle': 'Warm ensemble frame around a candlelit table',
      'image.alt.aboutStudy': 'Styled study interior with layered props and warm light',

      'film.tile.eyebrow': 'Film',
      'film.tile.tap': 'Tap to play',
      'film.tile.playPrefix': 'Play',

      'modal.video.label': 'Selected film player',
      'modal.video.close': 'Close video',
      'modal.contact.close': 'Close contact',

      'hero.eyebrow': 'Commercial · Cinema · Lisbon',
      'hero.headline': 'Every commercial, a short film. Every short film, a Cannes entry.',
      'hero.lede': "Lisbon-born scenographer. In cinema since 2011, in advertising since 2016. Cannes Critics' Week credit on Diamantino (2018). Direct line — no agent.",
      'hero.cta.work': 'View selected work',
      'hero.cta.contact': 'Contact Marta',
      'hero.card.since.eyebrow': 'Working since',
      'hero.card.since.body': 'Cinema 2011 · Commercials 2016',
      'hero.card.trained.eyebrow': 'Trained',
      'hero.card.trained.body': 'Arroio · Faculdade de Arquitetura · ESTC',

      'about.eyebrow': 'About',
      'about.headline': 'Scenographer by training. Art director by trade.',
      'about.p1': "Lisbon-born, August 1990. Marta trained as a scenographer — Escola Artística António Arroio, then a bachelor's in Scenography at Faculdade de Arquitetura, then a master's in Scene Design at ESTC. She didn't drift into film design from graphics. She came in as an architect of the stage and the frame.",
      'about.p2': "In the cinema arts department since 2011, in advertising since 2016. Pela Boca Morre o Peixe took Best Short at MOTELx 2014. Todos os Sonhos do Mundo, produced by Paulo Branco's Leopardo Filmes, followed in 2017. Then Diamantino — the political satire she helped dress — won the Grand Prize at Semaine de la Critique, Cannes 2018. The range runs from Kafkaesque horror short to Cannes-winning satire to high-gloss automotive.",
      'about.p3': "Today she runs the art department on set, bilingually, on Lisbon-based productions. Cinema and commercials aren't separate practices — the cinema craft is what makes the commercials worth watching. Direct line. No agent.",

      'cinema.eyebrow': 'Selected films',
      'cinema.heading': 'Cinema',
      'cinema.sub': "Marta's cinema credits include a Cannes Critics' Week winner and a MOTELx Best Short.",

      'cinema.diamantino.meta': '2018 · Art Department · Dir. Gabriel Abrantes & Daniel Schmidt',
      'cinema.diamantino.title': 'Diamantino',
      'cinema.diamantino.festival': "Grand Prize · Semaine de la Critique · Cannes 2018",
      'cinema.diamantino.caption': 'A genre-bending political satire whose visual identity is its punchline.',
      'cinema.diamantino.action': 'View on IMDb',

      'cinema.dreams.meta': '2017 · Production Designer (with Mathieu Lazare Fromenteze) · Dir. Laurence Ferreira Barbosa',
      'cinema.dreams.title': 'All the Dreams in the World',
      'cinema.dreams.titleAlt': 'Todos os Sonhos do Mundo · Prod. Paulo Branco / Leopardo Filmes',
      'cinema.dreams.caption': 'A France–Portugal feature about the Portuguese diaspora — design that straddles two countries.',
      'cinema.dreams.action': 'Producer page',

      'cinema.peixe.meta': '2014 · Art Department · Dir. João P. Nunes',
      'cinema.peixe.title': 'Pela Boca Morre o Peixe',
      'cinema.peixe.festival': 'Best Short Film · MOTELx 2014',
      'cinema.peixe.caption': 'A Kafka-inflected horror short about a hunter who becomes the hunted.',
      'cinema.peixe.action': 'View on IMDb',

      'cinema.lura.meta': '2013 · Art Director · Dir. Luís Brás',
      'cinema.lura.title': 'Lura',
      'cinema.lura.caption': 'Her earliest credit on record — adventure drama, short form.',
      'cinema.lura.action': 'View on IMDb',

      'festivals.0': "Cannes Critics' Week 2018",
      'festivals.1': 'MOTELx 2014 Best Short',
      'festivals.2': 'Leopardo Filmes — Paulo Branco',
      'festivals.3': 'In cinema since 2011',

      'commercial.eyebrow': 'Selected campaigns',
      'commercial.heading': 'Commercial',
      'commercial.sub': 'From automotive prestige to public-service campaigns — the through-line is the set.',

      'contact.eyebrow': 'Contact',
      'contact.headline': "Let's talk about the frame.",
      'contact.sub': 'Marta represents herself. Email or WhatsApp lands directly with her — no agents, no gatekeepers, no briefing forms.',
      'contact.email.eyebrow': 'Email',
      'contact.email.action': 'Write to Marta',
      'contact.whatsapp.eyebrow': 'Phone · WhatsApp',
      'contact.whatsapp.action': 'Open WhatsApp',
      'contact.instagram.eyebrow': 'Instagram',
      'contact.instagram.action': 'See recent work',
      'contact.imdb.eyebrow': 'IMDb',
      'contact.imdb.headline': 'Selected film credits',
      'contact.imdb.action': 'Open IMDb profile',
      'contact.closing': 'Lisbon, Portugal · Available worldwide.',

      'notFound.meta.title': 'Off-camera — Marta do Vale',
      'notFound.meta.description': 'This frame is off-camera. Return to selected work by Marta do Vale — art director and production designer based in Lisbon.',
      'notFound.eyebrow': '404 · Off-camera',
      'notFound.headline': "This frame didn't make the final cut.",
      'notFound.body': "Marta's selected work — a Cannes Critics' Week winner, a MOTELx Best Short, and a decade of cinematic commercials — is one cut away.",
      'notFound.cta': 'Back to the work'
    },
    pt: {
      'meta.title': 'Marta do Vale — Direção de Arte',
      'meta.description': 'Marta do Vale é diretora de arte e cenógrafa em Lisboa — mundos visuais cinematográficos para cinema e publicidade.',

      'brand.home': 'Marta do Vale — início',
      'brand.eyebrow': 'Direção de Arte',

      'nav.cinema': 'Cinema',
      'nav.commercial': 'Comercial',
      'nav.about': 'Sobre',
      'nav.contact': 'Contacto',
      'nav.langLabel': 'Idioma',

      'cta.contactFloating': 'Falar com a Marta',

      'image.alt.heroLiving': 'Cenário cinematográfico de sala de estar de Marta do Vale',
      'image.alt.heroNeon': 'Cenário escultórico iluminado a néon',
      'image.alt.heroCandle': 'Enquadramento caloroso à volta de uma mesa à luz das velas',
      'image.alt.aboutStudy': 'Escritório com adereços trabalhados e luz quente',

      'film.tile.eyebrow': 'Filme',
      'film.tile.tap': 'Toca para ver',
      'film.tile.playPrefix': 'Ver',

      'modal.video.label': 'Reprodução do filme selecionado',
      'modal.video.close': 'Fechar vídeo',
      'modal.contact.close': 'Fechar contacto',

      'hero.eyebrow': 'Comercial · Cinema · Lisboa',
      'hero.headline': 'Cada publicidade, uma curta. Cada curta, um filme de Cannes.',
      'hero.lede': 'Cenógrafa lisboeta. No cinema desde 2011, na publicidade desde 2016. Crédito na Semana da Crítica de Cannes com Diamantino (2018). Contacto direto — sem agente.',
      'hero.cta.work': 'Ver trabalho selecionado',
      'hero.cta.contact': 'Falar com a Marta',
      'hero.card.since.eyebrow': 'Em atividade desde',
      'hero.card.since.body': 'Cinema 2011 · Publicidade 2016',
      'hero.card.trained.eyebrow': 'Formação',
      'hero.card.trained.body': 'Arroio · Faculdade de Arquitetura · ESTC',

      'about.eyebrow': 'Sobre',
      'about.headline': 'Cenógrafa de formação. Diretora de arte de profissão.',
      'about.p1': 'Lisboeta, nascida em agosto de 1990. A Marta formou-se cenógrafa — Escola Artística António Arroio, depois licenciatura em Cenografia na Faculdade de Arquitetura e mestrado em Design de Cena na ESTC. Não chegou ao cinema vinda do design gráfico. Entrou como arquiteta do palco e do enquadramento.',
      'about.p2': 'No departamento de arte do cinema desde 2011, na publicidade desde 2016. Pela Boca Morre o Peixe arrecadou o Melhor Curta-Metragem no MOTELx 2014. Todos os Sonhos do Mundo, produzido pela Leopardo Filmes de Paulo Branco, chegou em 2017. Depois Diamantino — a sátira política que ajudou a vestir — venceu o Grande Prémio da Semaine de la Critique, Cannes 2018. O alcance vai do horror kafkiano à sátira premiada em Cannes ao alto-glamour automóvel.',
      'about.p3': 'Hoje dirige o departamento de arte em rodagem, bilíngue, em produções com base em Lisboa. Cinema e publicidade não são duas práticas separadas — é o ofício do cinema que torna a publicidade digna de se ver. Contacto direto. Sem agente.',

      'cinema.eyebrow': 'Filmes selecionados',
      'cinema.heading': 'Cinema',
      'cinema.sub': 'O percurso da Marta no cinema inclui um vencedor da Semana da Crítica de Cannes e um Melhor Curta no MOTELx.',

      'cinema.diamantino.meta': '2018 · Departamento de Arte · Real. Gabriel Abrantes & Daniel Schmidt',
      'cinema.diamantino.title': 'Diamantino',
      'cinema.diamantino.festival': 'Grande Prémio · Semaine de la Critique · Cannes 2018',
      'cinema.diamantino.caption': 'Uma sátira política inclassificável em que a identidade visual é a piada.',
      'cinema.diamantino.action': 'Ver no IMDb',

      'cinema.dreams.meta': '2017 · Direção Artística (com Mathieu Lazare Fromenteze) · Real. Laurence Ferreira Barbosa',
      'cinema.dreams.title': 'Todos os Sonhos do Mundo',
      'cinema.dreams.titleAlt': 'All the Dreams in the World · Prod. Paulo Branco / Leopardo Filmes',
      'cinema.dreams.caption': 'Uma longa franco-portuguesa sobre a diáspora portuguesa — direção de arte entre dois países.',
      'cinema.dreams.action': 'Página da produtora',

      'cinema.peixe.meta': '2014 · Departamento de Arte · Real. João P. Nunes',
      'cinema.peixe.title': 'Pela Boca Morre o Peixe',
      'cinema.peixe.festival': 'Melhor Curta-Metragem · MOTELx 2014',
      'cinema.peixe.caption': 'Uma curta de horror kafkiana sobre um caçador que passa a ser caça.',
      'cinema.peixe.action': 'Ver no IMDb',

      'cinema.lura.meta': '2013 · Direção Artística · Real. Luís Brás',
      'cinema.lura.title': 'Lura',
      'cinema.lura.caption': 'O primeiro crédito registado — drama de aventura, curta-metragem.',
      'cinema.lura.action': 'Ver no IMDb',

      'festivals.0': 'Semana da Crítica de Cannes 2018',
      'festivals.1': 'MOTELx 2014 Melhor Curta',
      'festivals.2': 'Leopardo Filmes — Paulo Branco',
      'festivals.3': 'No cinema desde 2011',

      'commercial.eyebrow': 'Campanhas selecionadas',
      'commercial.heading': 'Comercial',
      'commercial.sub': 'Do prestígio automóvel às campanhas de serviço público — o que liga tudo é o cenário.',

      'contact.eyebrow': 'Contacto',
      'contact.headline': 'Vamos falar do enquadramento.',
      'contact.sub': 'A Marta representa-se a si própria. Email ou WhatsApp chegam-lhe diretamente — sem agentes, sem intermediários, sem formulários.',
      'contact.email.eyebrow': 'Email',
      'contact.email.action': 'Escrever à Marta',
      'contact.whatsapp.eyebrow': 'Telefone · WhatsApp',
      'contact.whatsapp.action': 'Abrir WhatsApp',
      'contact.instagram.eyebrow': 'Instagram',
      'contact.instagram.action': 'Ver trabalho recente',
      'contact.imdb.eyebrow': 'IMDb',
      'contact.imdb.headline': 'Créditos de cinema',
      'contact.imdb.action': 'Abrir perfil IMDb',
      'contact.closing': 'Lisboa, Portugal · Disponível em qualquer lugar.',

      'notFound.meta.title': 'Fora de campo — Marta do Vale',
      'notFound.meta.description': 'Esta cena ficou fora de campo. Voltar ao trabalho selecionado de Marta do Vale — diretora de arte e cenógrafa em Lisboa.',
      'notFound.eyebrow': '404 · Fora de campo',
      'notFound.headline': 'Esta cena não chegou ao corte final.',
      'notFound.body': 'O trabalho selecionado da Marta — um vencedor da Semana da Crítica de Cannes, um Melhor Curta no MOTELx e uma década de publicidade cinematográfica — está a um corte de distância.',
      'notFound.cta': 'Voltar ao trabalho'
    }
  };

  const STORAGE_KEY = 'mdv-lang';
  const SUPPORTED = ['en', 'pt'];
  const FALLBACK = 'en';
  const EVENT_NAME = 'mdv:langchange';

  function detect() {
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
