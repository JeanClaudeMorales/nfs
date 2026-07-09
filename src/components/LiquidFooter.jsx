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

    const orbs = [
      { c: '#ff8a3d', x: 0.22, y: 0.35, r: 0.5, sx: 0.00007, sy: 0.00005 },
      { c: '#5b8cff', x: 0.7, y: 0.6, r: 0.55, sx: -0.00006, sy: 0.00008 },
      { c: '#b98cff', x: 0.5, y: 0.2, r: 0.4, sx: 0.00005, sy: -0.00004 },
    ];

    const draw = () => {
      t += 16;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = '#0b0b0d';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const o of orbs) {
        const cx = (o.x + Math.sin(t * o.sx) * 0.12) * w;
        const cy = (o.y + Math.cos(t * o.sy) * 0.15) * h;
        const rad = o.r * Math.min(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, o.c + '66');
        g.addColorStop(1, o.c + '00');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [canvasRef, rootRef]);
}

export default function LiquidFooter() {
  const { t } = useI18n();
  const rootRef = useRef(null);
  const glassRef = useRef(null);
  const bgRef = useRef(null);
  const [ready, setReady] = useState(false);

  useGlowBackdrop(bgRef, rootRef);
  useEffect(() => setReady(true), []);

  // High chromatic aberration + transparency = realistic refractive glass.
  useLiquidGlass(rootRef, () => [glassRef.current], ready, {
    blurAmount: 0.1,
    refraction: 0.92,
    chromAberration: 0.22,
    edgeHighlight: 0.7,
    specular: 0.9,
    fresnel: 1.0,
    cornerRadius: 28,
    zRadius: 26,
    saturation: 0.35,
    tintStrength: 0.06,
    brightness: 0.02,
    opacity: 0.85,
    shadowOpacity: 0.35,
    shadowSpread: 30,
    shadowOffsetY: 12,
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
      {/* live refracted backdrop */}
      <canvas ref={bgRef} data-dynamic className="lg-footer-bg" />

      {/* the glass panel */}
      <div ref={glassRef} className="lg-footer-glass">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark"><Icon name="saturn" /></span>
              <span>Next Frontier Systems</span>
            </div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <p className="footer-loc">{t('footer.location')}</p>
          </div>

          <div className="footer-cols">
            {col(t('footer.company'), ['About', 'Vision', 'Laboratories', 'Careers', 'Contact'])}
            {col(t('footer.divisions'), ['Artificial Intelligence', 'Telecommunications', 'Simulation', 'Cloud', 'Data Intelligence'])}
            {col(t('footer.connect'), ['LinkedIn', 'X / Twitter', 'GitHub', 'Email'])}
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
