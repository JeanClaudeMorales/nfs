"use client";

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import useLiquidGlass from './useLiquidGlass';
import Icon from './icons';

// Animated backdrop: drifting coloured glows on near-black. It's a real
// <canvas> tagged data-dynamic, so the liquid-glass shader re-samples it live
// every frame and refracts it with chromatic aberration.
function useGlowBackdrop(canvasRef, rootRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext('2d');
    let raf, t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = root.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    // Light, airy palette so the glass reads like the navbar (light frosted).
    const orbs = [
      { c: '#ffd9b3', x: 0.24, y: 0.4, r: 0.55, sx: 0.00007, sy: 0.00005 },
      { c: '#cfe0ff', x: 0.72, y: 0.62, r: 0.6, sx: -0.00006, sy: 0.00008 },
      { c: '#ffffff', x: 0.5, y: 0.18, r: 0.45, sx: 0.00005, sy: -0.00004 },
    ];

    const draw = () => {
      t += 16;
      const w = canvas.width, h = canvas.height;
      // soft light base
      const base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, '#eef0f4');
      base.addColorStop(1, '#e6e8ee');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      for (const o of orbs) {
        const cx = (o.x + Math.sin(t * o.sx) * 0.12) * w;
        const cy = (o.y + Math.cos(t * o.sy) * 0.15) * h;
        const rad = o.r * Math.min(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, o.c + 'cc');
        g.addColorStop(1, o.c + '00');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crisp geometry so the glass has real edges to refract (chromatic
      // aberration + distortion only show up on high-contrast content).
      ctx.save();
      ctx.strokeStyle = 'rgba(17,18,20,0.10)';
      ctx.lineWidth = 1;
      const step = 46 * dpr;
      ctx.beginPath();
      for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      // drifting concentric rings
      const rx = (0.3 + Math.sin(t * 0.00004) * 0.06) * w;
      const ry = 0.5 * h;
      ctx.strokeStyle = 'rgba(17,18,20,0.14)';
      for (let i = 1; i <= 7; i++) {
        ctx.beginPath();
        ctx.arc(rx, ry, i * 34 * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    // Perf: only animate (and let the glass shader re-render) while the footer
    // is near the viewport. Off-screen, drop data-dynamic so the shader idles.
    let running = false;
    const start = () => { if (!running) { running = true; canvas.setAttribute('data-dynamic', ''); draw(); } };
    const stop = () => { if (running) { running = false; cancelAnimationFrame(raf); canvas.removeAttribute('data-dynamic'); } };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '200px' });
    io.observe(root);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [canvasRef, rootRef]);
}

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
  const rootRef = useRef(null);
  const glassRef = useRef(null);
  const bgRef = useRef(null);
  const [ready, setReady] = useState(false);

  useGlowBackdrop(bgRef, rootRef);
  useEffect(() => setReady(true), []);

  // High chromatic aberration + transparency = realistic refractive glass.
  useLiquidGlass(rootRef, () => [glassRef.current], ready, {
    blurAmount: 0.08,
    refraction: 1.0,
    chromAberration: 0.32,
    edgeHighlight: 1.0,
    specular: 1.0,
    fresnel: 1.0,
    distortion: 0.12,
    cornerRadius: 32,
    zRadius: 40,
    saturation: 0.45,
    tintStrength: 0.05,
    brightness: 0.03,
    opacity: 0.68,
    shadowOpacity: 0.32,
    shadowSpread: 34,
    shadowOffsetY: 14,
  });

  const col = (heading, links) => (
    <div>
      <h4 className="footer-col-title">{heading}</h4>
      <ul className="footer-links">
        {links.map((l) => (
          <li key={l}><a href="#">{l}</a></li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer ref={rootRef} className="lg-footer">
      {/* live refracted backdrop (data-dynamic toggled by IntersectionObserver) */}
      <canvas ref={bgRef} className="lg-footer-bg" />

      {/* the glass panel */}
      <div ref={glassRef} className="lg-footer-glass">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark"><Icon name="saturn" /></span>
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
            {col(t('footer.company'), [L('About', 'Nosotros'), L('Vision', 'Visión'), L('Laboratories', 'Laboratorios'), L('Careers', 'Carreras'), L('Contact', 'Contacto')])}
            {col(t('footer.divisions'), [L('Artificial Intelligence', 'Inteligencia Artificial'), L('Telecommunications', 'Telecomunicaciones'), L('Simulation', 'Simulación'), 'Cloud', L('Data Intelligence', 'Inteligencia de Datos')])}
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
