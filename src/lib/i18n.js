"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// English is the default language.
const STRINGS = {
  en: {
    'nav.divisions': 'Divisions',
    'nav.labs': 'Laboratories',
    'nav.industries': 'Industries',
    'nav.vision': 'Vision',
    'nav.portfolio': 'Portfolio',
    'nav.contact': 'Contact',

    'hero.eyebrow': 'Next Frontier Systems',
    'hero.titleA': 'Engineering the next generation of',
    'hero.titleB': 'intelligent systems',
    'hero.sub': 'A U.S. deep-technology company building the platforms, infrastructure, and AI that will define the next frontier.',
    'hero.cta': 'Get in touch',
    'hero.secondary': 'Explore divisions',

    'intro.eyebrow': 'What we are',
    'intro.titleA': 'Not another software company.',
    'intro.titleB': 'A deep-tech company.',
    'intro.body': 'Most technology companies specialize in a single domain — they build software, offer cloud services, or train AI models. Next Frontier Systems brings all of those capabilities under one roof, combining scientific research, software engineering, artificial intelligence, advanced simulation, and enterprise platforms to create technology with real impact.',
    'intro.body2': 'Our goal is not to build applications. Our goal is to engineer the technologies that will define the next frontier.',

    'divisions.eyebrow': 'Core Divisions',
    'divisions.titleA': 'How we engineer',
    'divisions.titleB': 'the next frontier',
    'divisions.desc': 'We integrate research, artificial intelligence, large-scale simulation and software engineering into solutions for the world\'s most complex environments.',
    'common.readmore': 'Read more',

    'labs.eyebrow': 'Research Laboratories',
    'labs.titleA': 'We don\'t just build software.',
    'labs.titleB': 'We research the future.',
    'labs.desc': 'Our laboratories develop next-generation technologies through high-precision simulation, artificial intelligence and scientific computing.',
    'labs.research': 'Research areas',

    'ailab.eyebrow': 'Medical AI Laboratory · Live',
    'ailab.titleA': 'Searching for cures to',
    'ailab.titleB': 'autoimmune disease',
    'ailab.desc': 'A live view of how our Medical AI lab pipelines real patient data into validated therapy candidates — learning the immune mechanism, simulating each patient as a digital twin, and generating molecules against the autoimmune target.',

    'industries.eyebrow': 'Industries We Serve',
    'industries.titleA': 'Built for the sectors',
    'industries.titleB': 'that move the world',

    'vision.eyebrow': 'Vision & Mission',
    'vision.visionTitle': 'Our Vision',
    'vision.vision': 'To become one of the world\'s leading deep-technology companies by creating intelligent systems that transform how humanity designs, operates, simulates, and understands complex environments.',
    'vision.missionTitle': 'Our Mission',
    'vision.mission': 'To engineer advanced technologies that combine artificial intelligence, scientific research, large-scale simulation, and software engineering into solutions that solve humanity\'s most complex challenges.',

    'founder.eyebrow': 'Founder & CEO',
    'founder.name': 'Jean Claude Morales',
    'founder.role': 'Engineer · Founder',
    'founder.bio': 'An engineer and founder building at the intersection of artificial intelligence, scientific simulation and large-scale software. He leads Next Frontier Systems with a single conviction: the hardest problems in healthcare, telecommunications and infrastructure are solved by engineering the fundamental technologies beneath them — not by shipping another app.',
    'founder.contactCta': 'Work with us',
    'contrib.eyebrow': 'Scientific Contributions',
    'contrib.title': 'Research & projects',
    'contrib.read': 'Read',

    'contact.email': 'admin@nextfrontiersystem.com',
    'contact.phone': '+1 786 984 4177',
    'contact.phoneRaw': '+17869844177',

    'portfolio.eyebrow': 'Selected Work',
    'portfolio.titleA': 'Entering the',
    'portfolio.titleB': 'atmosphere',
    'portfolio.desc': 'A selection of platforms and systems engineered across our divisions.',
    'portfolio.view': 'View project',

    'footer.tagline': 'Engineering the next generation of intelligent systems.',
    'footer.company': 'Company',
    'footer.divisions': 'Divisions',
    'footer.connect': 'Connect',
    'footer.newsletter': 'Stay on the frontier',
    'footer.newsletterDesc': 'Research notes and product updates. No noise.',
    'footer.subscribe': 'Subscribe',
    'footer.email': 'your@email.com',
    'footer.rights': '© 2026 Next Frontier Systems LLC. All rights reserved.',
    'footer.location': 'United States',

    'lang.label': 'ES',
  },
  es: {
    'nav.divisions': 'Divisiones',
    'nav.labs': 'Laboratorios',
    'nav.industries': 'Industrias',
    'nav.vision': 'Visión',
    'nav.portfolio': 'Portafolio',
    'nav.contact': 'Contacto',

    'hero.eyebrow': 'Next Frontier Systems',
    'hero.titleA': 'Ingeniería de la próxima generación de',
    'hero.titleB': 'sistemas inteligentes',
    'hero.sub': 'Una empresa estadounidense de tecnología profunda que construye las plataformas, la infraestructura y la IA que definirán la próxima frontera.',
    'hero.cta': 'Contáctanos',
    'hero.secondary': 'Ver divisiones',

    'intro.eyebrow': 'Quiénes somos',
    'intro.titleA': 'No es otra empresa de software.',
    'intro.titleB': 'Es una empresa Deep Tech.',
    'intro.body': 'La mayoría de las empresas tecnológicas se especializan en un solo dominio: desarrollan software, ofrecen servicios en la nube o crean modelos de IA. Next Frontier Systems integra todas esas capacidades bajo un mismo techo, combinando investigación científica, ingeniería de software, inteligencia artificial, simulación avanzada y plataformas empresariales para crear tecnología con impacto real.',
    'intro.body2': 'Nuestro objetivo no es desarrollar aplicaciones. Nuestro objetivo es construir las tecnologías que definirán la próxima frontera.',

    'divisions.eyebrow': 'Divisiones Principales',
    'divisions.titleA': 'Cómo diseñamos',
    'divisions.titleB': 'la próxima frontera',
    'divisions.desc': 'Integramos investigación, inteligencia artificial, simulación a gran escala e ingeniería de software en soluciones para los entornos más complejos del mundo.',
    'common.readmore': 'Leer más',

    'labs.eyebrow': 'Laboratorios de Investigación',
    'labs.titleA': 'No solo desarrollamos software.',
    'labs.titleB': 'Investigamos el futuro.',
    'labs.desc': 'Nuestros laboratorios desarrollan tecnologías de próxima generación mediante simulación de alta precisión, inteligencia artificial y computación científica.',
    'labs.research': 'Áreas de investigación',

    'ailab.eyebrow': 'Laboratorio de IA Médica · En vivo',
    'ailab.titleA': 'En busca de curas para',
    'ailab.titleB': 'enfermedades autoinmunes',
    'ailab.desc': 'Una vista en vivo de cómo nuestro laboratorio de IA médica convierte datos reales de pacientes en candidatos terapéuticos validados — aprendiendo el mecanismo inmune, simulando cada paciente como gemelo digital y generando moléculas contra la diana autoinmune.',

    'industries.eyebrow': 'Industrias que Servimos',
    'industries.titleA': 'Construido para los sectores',
    'industries.titleB': 'que mueven el mundo',

    'vision.eyebrow': 'Visión y Misión',
    'vision.visionTitle': 'Nuestra Visión',
    'vision.vision': 'Convertirnos en una de las empresas líderes de tecnología profunda del mundo, creando sistemas inteligentes que transformen la forma en que la humanidad diseña, opera, simula y comprende entornos complejos.',
    'vision.missionTitle': 'Nuestra Misión',
    'vision.mission': 'Diseñar tecnologías avanzadas que combinen inteligencia artificial, investigación científica, simulación a gran escala e ingeniería de software en soluciones que resuelvan los desafíos más complejos de la humanidad.',

    'founder.eyebrow': 'Fundador y CEO',
    'founder.name': 'Jean Claude Morales',
    'founder.role': 'Ingeniero · Fundador',
    'founder.bio': 'Ingeniero y fundador que construye en la intersección de la inteligencia artificial, la simulación científica y el software a gran escala. Lidera Next Frontier Systems con una sola convicción: los problemas más difíciles en salud, telecomunicaciones e infraestructura se resuelven diseñando las tecnologías fundamentales que hay debajo, no lanzando otra aplicación.',
    'founder.contactCta': 'Trabaja con nosotros',
    'contrib.eyebrow': 'Aportes Científicos',
    'contrib.title': 'Investigación y proyectos',
    'contrib.read': 'Leer',

    'contact.email': 'admin@nextfrontiersystem.com',
    'contact.phone': '+1 786 984 4177',
    'contact.phoneRaw': '+17869844177',

    'portfolio.eyebrow': 'Trabajo Seleccionado',
    'portfolio.titleA': 'Entrando en la',
    'portfolio.titleB': 'atmósfera',
    'portfolio.desc': 'Una selección de plataformas y sistemas diseñados en nuestras divisiones.',
    'portfolio.view': 'Ver proyecto',

    'footer.tagline': 'Ingeniería de la próxima generación de sistemas inteligentes.',
    'footer.company': 'Empresa',
    'footer.divisions': 'Divisiones',
    'footer.connect': 'Conecta',
    'footer.newsletter': 'Mantente en la frontera',
    'footer.newsletterDesc': 'Notas de investigación y novedades. Sin ruido.',
    'footer.subscribe': 'Suscribirse',
    'footer.email': 'tu@correo.com',
    'footer.rights': '© 2026 Next Frontier Systems LLC. Todos los derechos reservados.',
    'footer.location': 'Estados Unidos',

    'lang.label': 'EN',
  },
};

const I18nContext = createContext({ lang: 'en', t: (k) => k, toggle: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('nfs-lang');
    if (saved === 'es' || saved === 'en') setLang(saved);
  }, []);

  const toggle = useCallback(() => {
    setLang((l) => {
      const next = l === 'en' ? 'es' : 'en';
      try { localStorage.setItem('nfs-lang', next); } catch {}
      if (typeof document !== 'undefined') document.documentElement.lang = next;
      return next;
    });
  }, []);

  const t = useCallback((key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang]);

  return <I18nContext.Provider value={{ lang, t, toggle }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
