"use client";

import { useEffect, useRef, useState } from 'react';
import ImmersiveScene from '@/components/ImmersiveScene';
import LiquidFooter from '@/components/LiquidFooter';
import Icon from '@/components/icons';
import AgentGraph from '@/components/AgentGraph';
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

// Mixed serif/sans heading with a weight shift.
function MixedTitle({ a, b, className = 'section-title' }) {
  return (
    <h2 className={className}>
      <span className="t-sans">{a} </span>
      <span className="t-serif">{b}</span>
    </h2>
  );
}

function Nav() {
  const { t, lang, toggle } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const go = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <nav className={`nav-glass ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#top" onClick={go('top')} className="nav-logo">
        <span className="nav-logo-mark"><Icon name="saturn" /></span>
        Next Frontier
      </a>
      <div className="nav-links">
        {NAV.map(([key, id]) => <a key={id} href={`#${id}`} onClick={go(id)}>{t(key)}</a>)}
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

const IND = [
  ['hero', 'Core'],
  ['divisions', 'nav.divisions'],
  ['labs', 'nav.labs'],
  ['industries', 'nav.industries'],
  ['vision', 'nav.vision'],
  ['portfolio', 'nav.portfolio'],
];

// Orbital page indicator: dots on an arc around the sphere, with two
// counter-rotating "gear" rings marking the active section.
function OrbitIndicator() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  useEffect(() => {
    const ids = IND.map(([id]) => id);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = ids.indexOf(e.target.id);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const n = IND.length;
  const pts = IND.map((_, i) => {
    const f = i / (n - 1);
    return { x: 20 + Math.sin(f * Math.PI) * 42, y: 40 + f * 620 };
  });
  const go = (id) => () => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const a = pts[active];

  return (
    <div className="orbit-ind" aria-hidden={false}>
      <svg viewBox="0 0 90 700" width="90" height="700">
        <path d={`M ${pts[0].x} ${pts[0].y} ${pts.map((p) => `L ${p.x} ${p.y}`).join(' ')}`} className="orbit-path" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === active ? 4.5 : 2.6} className={`orbit-dot ${i === active ? 'on' : ''}`} onClick={go(IND[i][0])} style={{ cursor: 'pointer' }} />
        ))}
      </svg>
      {/* counter-rotating gear rings at the active dot */}
      <div className="gear gear-a" style={{ top: a.y, left: a.x }} />
      <div className="gear gear-b" style={{ top: a.y, left: a.x }} />
      <span className="orbit-label" style={{ top: a.y }}>{t(IND[active][1])}</span>
    </div>
  );
}

function Carousel({ children }) {
  const ref = useRef(null);
  const by = (dir) => ref.current?.scrollBy({ left: dir * 372, behavior: 'smooth' });
  return (
    <div className="carousel">
      <div className="carousel-track" ref={ref}>{children}</div>
      <div className="carousel-nav">
        <button aria-label="Previous" onClick={() => by(-1)}>←</button>
        <button aria-label="Next" onClick={() => by(1)}>→</button>
      </div>
    </div>
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

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Monotonic 0..1 across the whole page: the sphere grows the whole way.
      sceneState.target = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <ImmersiveScene />
      <Nav />

      <main id="top" className="content">
        <OrbitIndicator />
        {/* HERO */}
        <section id="hero" className="hero">
          <Reveal as="p" className="eyebrow">{t('hero.eyebrow')}</Reveal>
          <Reveal as="h1" className="hero-title" delay={0.05}>
            {(() => {
              const accent = lang === 'es' ? 'próxima' : 'next';
              const [pre, post] = t('hero.titleA').split(accent);
              return (
                <>
                  <span className="t-sans">{pre}</span>
                  <span className="t-serif">{accent}</span>
                  <span className="t-sans">{post} </span>
                  <span className="t-serif">{t('hero.titleB')}</span>
                </>
              );
            })()}
          </Reveal>
          <Reveal className="hero-sub" delay={0.15}>{t('hero.sub')}</Reveal>
          <Reveal className="hero-actions" delay={0.25}>
            <a href="#contact" className="btn-primary">{t('hero.cta')} <span className="arr">↗</span></a>
            <a href="#divisions" className="btn-outline">{t('hero.secondary')}</a>
          </Reveal>
          <div className="scroll-hint"><span /></div>
        </section>

        <div className="sheet">
          {/* INTRO */}
          <section className="section intro">
            <Parallax speed={70} className="deco deco-intro"><Icon name="rings" /></Parallax>
            <div className="intro-grid">
              <div>
                <Reveal as="p" className="eyebrow">{t('intro.eyebrow')}</Reveal>
                <Reveal delay={0.05}><MixedTitle a={t('intro.titleA')} b={t('intro.titleB')} /></Reveal>
              </div>
              <div className="intro-body">
                <Reveal className="body-text" delay={0.1}>{t('intro.body')}</Reveal>
                <Reveal className="body-text strong" delay={0.2}>{t('intro.body2')}</Reveal>
              </div>
            </div>
            <Reveal className="ag-wrap" delay={0.15}>
              <span className="ag-tag">{lang === 'es' ? 'Orquestación multi-agente · en vivo' : 'Multi-agent orchestration · live'}</span>
              <AgentGraph />
            </Reveal>
          </section>

          {/* DIVISIONS */}
          <section id="divisions" className="section">
            <span className="section-index">01</span>
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('divisions.eyebrow')}</Reveal>
                <Reveal delay={0.05}><MixedTitle a={t('divisions.titleA')} b={t('divisions.titleB')} /></Reveal>
              </div>
              <Reveal className="section-head-desc body-text" delay={0.1}>{t('divisions.desc')}</Reveal>
            </div>
            <Carousel>
              {divisions.map((div) => {
                const d = div[lang];
                return (
                  <div key={d.title} className="card">
                    <span className="card-icon"><Icon name={div.icon} /></span>
                    <h3 className="card-title">{d.title}</h3>
                    <p className="card-desc">{d.desc}</p>
                    <div className="card-tags">
                      {d.tags.slice(0, 5).map((tg) => <span key={tg} className="tag">{tg}</span>)}
                    </div>
                    <a href="#" className="card-link">{t('common.readmore')} <span>→</span></a>
                  </div>
                );
              })}
            </Carousel>
          </section>

          {/* LABS */}
          <section id="labs" className="section">
            <span className="section-index">02</span>
            <Parallax speed={90} className="deco deco-labs"><Icon name="burst" /></Parallax>
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('labs.eyebrow')}</Reveal>
                <Reveal delay={0.05}><MixedTitle a={t('labs.titleA')} b={t('labs.titleB')} /></Reveal>
              </div>
              <Reveal className="section-head-desc body-text" delay={0.1}>{t('labs.desc')}</Reveal>
            </div>
            <RevealGroup className="accordion-wrap" stagger={0.04}>
              <Accordion items={labs} lang={lang} />
            </RevealGroup>
          </section>

          {/* INDUSTRIES */}
          <section id="industries" className="section">
            <span className="section-index">03</span>
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('industries.eyebrow')}</Reveal>
                <Reveal delay={0.05}><MixedTitle a={t('industries.titleA')} b={t('industries.titleB')} /></Reveal>
              </div>
            </div>
            <RevealGroup className="industry-grid" stagger={0.025}>
              {industries[lang].map((ind) => (
                <RevealItem key={ind} className="industry-item" y={18}>
                  <span className="industry-dot" />{ind}
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          {/* VISION & MISSION */}
          <section id="vision" className="section vision">
            <Parallax speed={60} className="deco deco-vision"><Icon name="saturn" /></Parallax>
            <Reveal as="p" className="eyebrow center">{t('vision.eyebrow')}</Reveal>
            <div className="vision-grid">
              <Reveal className="vision-card">
                <span className="vision-mark"><Icon name="burst" /></span>
                <h3 className="vision-title"><span className="t-serif">{t('vision.visionTitle')}</span></h3>
                <p className="body-text">{t('vision.vision')}</p>
              </Reveal>
              <Reveal className="vision-card" delay={0.12}>
                <span className="vision-mark"><Icon name="orbit" /></span>
                <h3 className="vision-title"><span className="t-serif">{t('vision.missionTitle')}</span></h3>
                <p className="body-text">{t('vision.mission')}</p>
              </Reveal>
            </div>
          </section>
        </div>

        {/* PORTFOLIO — enters the sphere's atmosphere */}
        <section id="portfolio" ref={portfolioRef} className="portfolio">
          <div className="portfolio-head">
            <Reveal as="p" className="eyebrow center">{t('portfolio.eyebrow')}</Reveal>
            <Reveal delay={0.05}>
              <h2 className="portfolio-title">
                <span className="t-sans">{t('portfolio.titleA')} </span>
                <span className="t-serif">{t('portfolio.titleB')}</span>
              </h2>
            </Reveal>
            <Reveal className="body-text center portfolio-desc" delay={0.1}>{t('portfolio.desc')}</Reveal>
          </div>
          <RevealGroup className="portfolio-grid" stagger={0.07}>
            {portfolio.map((p) => {
              const d = p[lang];
              return (
                <RevealItem key={d.title} className="project" y={46}>
                  <div className="project-top">
                    <span className="project-icon"><Icon name={p.icon} /></span>
                    <span className="project-year">{p.year}</span>
                  </div>
                  <div className="project-body">
                    <span className="project-field">{d.field}</span>
                    <h3 className="project-title">{d.title}</h3>
                    <p className="project-desc">{d.desc}</p>
                    <a href="#" className="card-link">{t('portfolio.view')} <span>→</span></a>
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
