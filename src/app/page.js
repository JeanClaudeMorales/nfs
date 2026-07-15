"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImmersiveScene from '@/components/ImmersiveScene';
import LiquidFooter from '@/components/LiquidFooter';
import Icon from '@/components/icons';
import AgentGraph from '@/components/AgentGraph';
import AutoimmuneFlow from '@/components/AutoimmuneFlow';
import Contributions from '@/components/Contributions';
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
        <img src="/logo.png" alt="Next Frontier Systems" className="nav-logo-mark" width="40" height="22" />
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

// Quadratic bezier so the rail is a true curve. Sample points for the dots.
const P0 = [15, 20], P1 = [92, 340], P2 = [15, 660];
const bez = (u) => {
  const v = 1 - u;
  return {
    x: v * v * P0[0] + 2 * v * u * P1[0] + u * u * P2[0],
    y: v * v * P0[1] + 2 * v * u * P1[1] + u * u * P2[1],
  };
};

// Orbital page indicator: dots on a curved rail, two counter-rotating gear
// rings on the active section. Hides once the footer is in view.
function OrbitIndicator() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const ids = IND.map(([id]) => id);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { const i = ids.indexOf(e.target.id); if (i >= 0) setActive(i); }
      }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });

    const footer = document.querySelector('.lg-footer');
    let fObs;
    if (footer) {
      fObs = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { rootMargin: '0px 0px -10% 0px' });
      fObs.observe(footer);
    }
    return () => { obs.disconnect(); fObs?.disconnect(); };
  }, []);

  const n = IND.length;
  const pts = IND.map((_, i) => bez(i / (n - 1)));
  const go = (id) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const a = pts[active];

  return (
    <div className={`orbit-ind ${hidden ? 'is-hidden' : ''}`}>
      <svg viewBox="0 0 110 680" width="110" height="680">
        <path d={`M ${P0} Q ${P1} ${P2}`} className="orbit-path" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === active ? 4.5 : 2.4} className={`orbit-dot ${i === active ? 'on' : ''}`} onClick={go(IND[i][0])} />
        ))}
      </svg>
      <div className="gear gear-a" style={{ top: a.y, left: a.x }} />
      <div className="gear gear-b" style={{ top: a.y, left: a.x }} />
      <span className="orbit-label" style={{ top: a.y, left: a.x }}>{t(IND[active][1])}</span>
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
  const atmoRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Sphere: GSAP feeds whole-page scroll progress (monotonic 0..1) into the
      // shared scene state; the r3f CameraRig damps toward it every frame, so
      // the planet reacts from the very first scroll in the hero.
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => { sceneState.target = self.progress; },
      });

      // Atmosphere (DOM sky + clouds behind the sphere) fades in as the
      // portfolio "entering the atmosphere" moment approaches.
      if (portfolioRef.current) {
        ScrollTrigger.create({
          trigger: portfolioRef.current,
          start: 'top 65%',
          end: 'top top',
          onUpdate: (self) => {
            sceneState.atmo = self.progress;
            if (atmoRef.current) atmoRef.current.style.opacity = self.progress;
          },
        });
      }

      // Hero parallax: the headline block drifts up and dims on the first
      // scroll, so the page feels alive immediately (pairs with the sphere).
      if (!prefersReduced) {
        gsap.to('.hero-inner', {
          yPercent: -14,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 },
        });
      }
    });

    // Web fonts can shift layout after hydration; recompute trigger positions
    // once they're ready so start/end offsets stay accurate.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
    const tid = setTimeout(refresh, 400);

    return () => { clearTimeout(tid); ctx.revert(); };
  }, []);

  return (
    <>
      {/* DOM atmosphere — sky + drifting clouds behind the 3D sphere; fades in
          for the portfolio "entering the atmosphere" moment. */}
      <div ref={atmoRef} className="atmosphere" aria-hidden>
        <span className="cloud cloud-1" />
        <span className="cloud cloud-2" />
        <span className="cloud cloud-3" />
        <span className="cloud cloud-4" />
        <span className="cloud cloud-5" />
      </div>

      <ImmersiveScene />
      <Nav />

      <main id="top" className="content">
        <OrbitIndicator />
        {/* HERO */}
        <section id="hero" className="hero">
          <div className="hero-inner">
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
          </div>
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

          {/* AI LAB IN ACTION — autoimmune cure research flow (React Flow) */}
          <section id="ai-lab" className="section">
            <div className="section-head">
              <div>
                <Reveal as="p" className="eyebrow">{t('ailab.eyebrow')}</Reveal>
                <Reveal delay={0.05}><MixedTitle a={t('ailab.titleA')} b={t('ailab.titleB')} /></Reveal>
              </div>
              <Reveal className="section-head-desc body-text" delay={0.1}>{t('ailab.desc')}</Reveal>
            </div>
            <Reveal delay={0.1}>
              <AutoimmuneFlow lang={lang} />
            </Reveal>
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

          {/* FOUNDER / CEO */}
          <section id="founder" className="section founder">
            <div className="founder-grid">
              <Reveal className="founder-photo">
                <img src="/founder.jpg" alt={t('founder.name')} loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
                <span className="founder-badge"><Icon name="saturn" /></span>
              </Reveal>
              <div className="founder-info">
                <Reveal as="p" className="eyebrow">{t('founder.eyebrow')}</Reveal>
                <Reveal delay={0.05}>
                  <h2 className="founder-name">
                    <span className="t-sans">Jean Claude </span><span className="t-serif">Morales</span>
                  </h2>
                </Reveal>
                <Reveal as="p" className="founder-role" delay={0.1}>{t('founder.role')}</Reveal>
                <Reveal className="body-text" delay={0.15}>{t('founder.bio')}</Reveal>
                <Reveal className="founder-contact" delay={0.2}>
                  <a href={`mailto:${t('contact.email')}`} className="founder-link"><Icon name="signal" /> {t('contact.email')}</a>
                  <a href={`tel:${t('contact.phoneRaw')}`} className="founder-link"><Icon name="route" /> {t('contact.phone')}</a>
                </Reveal>
                <Reveal delay={0.25}>
                  <a href={`mailto:${t('contact.email')}`} className="btn-primary">{t('founder.contactCta')} <span className="arr">↗</span></a>
                </Reveal>
              </div>
            </div>
            <Contributions />
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
