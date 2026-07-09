"use client";

import { useEffect, useRef, useState } from 'react';
import ImmersiveScene from '@/components/ImmersiveScene';
import LiquidFooter from '@/components/LiquidFooter';
import Icon from '@/components/icons';
import { Reveal, RevealGroup, RevealItem, Parallax } from '@/components/anim';
import { useI18n } from '@/lib/i18n';
import { divisions, labs, industries, portfolio } from '@/lib/content';
import sceneState from '@/components/sceneState';

const NAV = [
  ['nav.divisions', 'divisions'],
  ['nav.labs', 'labs'],
  ['nav.industries', 'industries'],
  ['nav.vision', 'vision'],
  ['nav.portfolio', 'portfolio'],
];

function Nav() {
  const { t, lang, toggle } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`nav-glass ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#top" onClick={go('top')} className="nav-logo">
        <span className="nav-logo-mark"><Icon name="saturn" /></span>
        Next Frontier
      </a>
      <div className="nav-links">
        {NAV.map(([key, id]) => (
          <a key={id} href={`#${id}`} onClick={go(id)}>{t(key)}</a>
        ))}
      </div>
      <div className="nav-right">
        <a href="#contact" onClick={go('contact')} className="btn-outline nav-cta">{t('nav.contact')}</a>
        <button className="lang-toggle" onClick={toggle} aria-label="Toggle language">
          <span className={lang === 'en' ? 'on' : ''}>EN</span>
          <span className="lang-sep">/</span>
          <span className={lang === 'es' ? 'on' : ''}>ES</span>
        </button>
      </div>
    </nav>
  );
}

function Accordion({ items, lang }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="accordion">
      {items.map((lab, i) => {
        const d = lab[lang];
        const isOpen = open === i;
        return (
          <RevealItem key={d.name} className={`acc-item ${isOpen ? 'open' : ''}`}>
            <button className="acc-head" onClick={() => setOpen(isOpen ? -1 : i)}>
              <span className="acc-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="acc-name">{d.name}</span>
              <span className="acc-sign">{isOpen ? '–' : '+'}</span>
            </button>
            <div className="acc-body" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="acc-body-inner">
                <div className="acc-tags">
                  {d.items.map((it) => <span key={it} className="tag">{it}</span>)}
                </div>
              </div>
            </div>
          </RevealItem>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { t, lang } = useI18n();
  const portfolioRef = useRef(null);

  // Drive the 3D orbit + atmosphere dive from native scroll (imperative).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const overall = max > 0 ? window.scrollY / max : 0;
      sceneState.target = Math.min(1, overall * 1.35);

      const r = portfolioRef.current?.getBoundingClientRect();
      if (r) {
        const enter = Math.min(1, Math.max(0, (vh - r.top) / vh));
        const exit = Math.min(1, Math.max(0, r.bottom / vh));
        sceneState.dive = Math.min(enter, exit);
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const heroTitle = t('hero.title').split('\n');
  const introTitle = t('intro.title').split('\n');

  return (
    <>
      <ImmersiveScene />
      <Nav />

      <main id="top" className="content">
        {/* HERO */}
        <section className="hero">
          <Reveal as="p" className="eyebrow">{t('hero.eyebrow')}</Reveal>
          <Reveal as="h1" className="hero-title" delay={0.05}>
            {heroTitle.map((l, i) => <span key={i} className="block">{l}</span>)}
          </Reveal>
          <Reveal className="hero-sub" delay={0.15}>{t('hero.sub')}</Reveal>
          <Reveal className="hero-actions" delay={0.25}>
            <a href="#contact" className="btn-primary">{t('hero.cta')} <span className="arr">↗</span></a>
            <a href="#divisions" className="btn-outline">{t('hero.secondary')}</a>
          </Reveal>
        </section>

        {/* content sheet — opaque light backdrop for readable sections */}
        <div className="sheet">
          {/* INTRO */}
          <section className="section intro">
            <div className="intro-grid">
              <div>
                <Reveal as="p" className="eyebrow">{t('intro.eyebrow')}</Reveal>
                <Reveal as="h2" className="section-title" delay={0.05}>
                  {introTitle.map((l, i) => <span key={i} className="block">{l}</span>)}
                </Reveal>
              </div>
              <div className="intro-body">
                <Reveal className="body-text" delay={0.1}>{t('intro.body')}</Reveal>
                <Reveal className="body-text strong" delay={0.2}>{t('intro.body2')}</Reveal>
              </div>
            </div>
          </section>

          {/* DIVISIONS */}
          <section id="divisions" className="section">
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('divisions.eyebrow')}</Reveal>
                <Reveal as="h2" className="section-title" delay={0.05}>
                  {t('divisions.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
                </Reveal>
              </div>
              <Reveal className="section-head-desc body-text" delay={0.1}>{t('divisions.desc')}</Reveal>
            </div>

            <RevealGroup className="card-grid" stagger={0.06}>
              {divisions.map((div) => {
                const d = div[lang];
                return (
                  <RevealItem key={d.title} className="card">
                    <span className="card-icon"><Icon name={div.icon} /></span>
                    <h3 className="card-title">{d.title}</h3>
                    <p className="card-desc">{d.desc}</p>
                    <div className="card-tags">
                      {d.tags.slice(0, 5).map((tg) => <span key={tg} className="tag">{tg}</span>)}
                    </div>
                    <a href="#" className="card-link">{t('common.readmore')} <span>→</span></a>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </section>

          {/* LABS */}
          <section id="labs" className="section">
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('labs.eyebrow')}</Reveal>
                <Reveal as="h2" className="section-title" delay={0.05}>
                  {t('labs.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
                </Reveal>
              </div>
              <Reveal className="section-head-desc body-text" delay={0.1}>{t('labs.desc')}</Reveal>
            </div>
            <RevealGroup className="accordion-wrap" stagger={0.05}>
              <Accordion items={labs} lang={lang} />
            </RevealGroup>
          </section>

          {/* INDUSTRIES */}
          <section id="industries" className="section">
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('industries.eyebrow')}</Reveal>
                <Reveal as="h2" className="section-title" delay={0.05}>
                  {t('industries.title').split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
                </Reveal>
              </div>
            </div>
            <RevealGroup className="industry-grid" stagger={0.03}>
              {industries[lang].map((ind) => (
                <RevealItem key={ind} className="industry-item" y={20}>
                  <span className="industry-dot" />
                  {ind}
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          {/* VISION & MISSION */}
          <section id="vision" className="section vision">
            <Parallax speed={40}>
              <Reveal as="p" className="eyebrow center">{t('vision.eyebrow')}</Reveal>
            </Parallax>
            <div className="vision-grid">
              <Reveal className="vision-card">
                <span className="vision-mark"><Icon name="burst" /></span>
                <h3 className="vision-title">{t('vision.visionTitle')}</h3>
                <p className="body-text">{t('vision.vision')}</p>
              </Reveal>
              <Reveal className="vision-card" delay={0.12}>
                <span className="vision-mark"><Icon name="orbit" /></span>
                <h3 className="vision-title">{t('vision.missionTitle')}</h3>
                <p className="body-text">{t('vision.mission')}</p>
              </Reveal>
            </div>
          </section>
        </div>

        {/* PORTFOLIO — enters the sphere's atmosphere */}
        <section id="portfolio" ref={portfolioRef} className="portfolio">
          <div className="portfolio-head">
            <Reveal as="p" className="eyebrow center">{t('portfolio.eyebrow')}</Reveal>
            <Reveal as="h2" className="portfolio-title" delay={0.05}>{t('portfolio.title')}</Reveal>
            <Reveal className="body-text center portfolio-desc" delay={0.1}>{t('portfolio.desc')}</Reveal>
          </div>
          <RevealGroup className="portfolio-grid" stagger={0.08}>
            {portfolio.map((p) => {
              const d = p[lang];
              return (
                <RevealItem key={d.title} className="project" y={50}>
                  <div className="project-top">
                    <span className="project-icon"><Icon name={p.icon} /></span>
                    <span className="project-year">{p.year}</span>
                  </div>
                  <div className="project-body">
                    <span className="project-field">{d.field}</span>
                    <h3 className="project-title">{d.title}</h3>
                    <p className="project-desc">{d.desc}</p>
                    <a href="#" className="card-link light">{t('portfolio.view')} <span>→</span></a>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </section>

        <div id="contact" />
        <LiquidFooter />
      </main>
    </>
  );
}
