"use client";

import { useI18n } from '@/lib/i18n';

// Footer = one full-bleed frosted-glass sheet spanning the viewport, rising
// from the bottom. It's a single CSS `backdrop-filter` surface (same technique
// as the navbar) so it reads as ONE solid piece of glass edge-to-edge — the
// previous @ybouane WebGL panel was a bevelled floating card whose refracted
// aurora backdrop read as several stacked layers and left gutters at the sides.
// The blur samples the fixed 3D sphere behind it, so the planet still glows
// softly through the glass.

function UsFlag() {
  const sh = 16 / 13; // stripe height
  return (
    <svg className="us-flag" viewBox="0 0 24 16" width="24" height="16" aria-label="United States" role="img">
      <clipPath id="ff"><rect width="24" height="16" rx="2" /></clipPath>
      <g clipPath="url(#ff)">
        <rect width="24" height="16" fill="#fff" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x="0" y={Math.round(i * 2 * sh * 100) / 100} width="24" height={Math.round(sh * 100) / 100} fill="#b22234" />
        ))}
        <rect width="10" height={Math.round(sh * 7 * 100) / 100} fill="#3c3b6e" />
        {Array.from({ length: 4 }).map((_, rIdx) =>
          Array.from({ length: 5 }).map((_, cIdx) => (
            <circle key={`${rIdx}-${cIdx}`} cx={1.4 + cIdx * 1.9} cy={1.3 + rIdx * 1.9} r="0.42" fill="#fff" />
          ))
        )}
      </g>
    </svg>
  );
}

export default function LiquidFooter() {
  const { t, lang } = useI18n();
  const L = (en, es) => (lang === 'es' ? es : en);

  const col = (heading, links) => (
    <div>
      <h4 className="footer-col-title">{heading}</h4>
      <ul className="footer-links">
        {links.map(([label, href]) => (
          <li key={label}><a href={href}>{label}</a></li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="lg-footer">
      <div className="lg-footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Next Frontier Systems" className="footer-logo-mark" width="44" height="24" />
              <span>Next Frontier Systems</span>
            </div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <p className="footer-loc"><UsFlag /> {L('United States of America', 'Estados Unidos de América')}</p>
            <div className="footer-contact">
              <a href={`mailto:${t('contact.email')}`}>{t('contact.email')}</a>
              <a href={`tel:${t('contact.phoneRaw')}`}>{t('contact.phone')}</a>
            </div>
          </div>

          <div className="footer-cols">
            {col(t('footer.company'), [
              [L('About', 'Nosotros'), '#founder'],
              [L('Vision', 'Visión'), '#vision'],
              [L('Laboratories', 'Laboratorios'), '#labs'],
              [L('Careers', 'Carreras'), '#contact'],
              [L('Contact', 'Contacto'), '#contact'],
            ])}
            {col(t('footer.divisions'), [
              [L('Artificial Intelligence', 'Inteligencia Artificial'), '#divisions'],
              [L('Telecommunications', 'Telecomunicaciones'), '#divisions'],
              [L('Simulation', 'Simulación'), '#divisions'],
              ['Cloud', '#divisions'],
              [L('Data Intelligence', 'Inteligencia de Datos'), '#divisions'],
            ])}
            <div>
              <h4 className="footer-col-title">{t('footer.connect')}</h4>
              <ul className="footer-links">
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">X / Twitter</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href={`mailto:${t('contact.email')}`}>Email</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-news">
            <h4 className="footer-col-title">{t('footer.newsletter')}</h4>
            <p className="footer-news-desc">{t('footer.newsletterDesc')}</p>
            <form className="footer-news-form" onSubmit={(e) => e.preventDefault()}>
              <input className="footer-news-input" type="email" placeholder={t('footer.email')} />
              <button className="btn-primary footer-news-btn" type="submit">{t('footer.subscribe')}</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t('footer.rights')}</span>
          <span className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
