"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import ImmersiveScene from '@/components/ImmersiveScene';
import StorySection from '@/components/StorySection';
import useLiquidGlass from '@/components/useLiquidGlass';
import sceneState from '@/components/sceneState';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

const sections = [
  { id: 'hero', number: '01', label: 'Core' },
  { id: 'vision', number: '02', label: 'Visión' },
  { id: 'architecture', number: '03', label: 'Motores' },
  { id: 'products', number: '04', label: 'Ecosistemas' },
  { id: 'cta', number: '05', label: 'Enlace' },
];

export default function Home() {
  const rootRef = useRef(null);       // LiquidGlass root (bg gradient + canvas + glass panels)
  const overlayRef = useRef(null);    // section content, above the glass
  const navRef = useRef(null);
  const footerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  // --- Reparent the r3f <canvas> to be a DIRECT child of the glass root ----
  const handleCanvasReady = useCallback((canvas) => {
    const root = rootRef.current;
    if (!root || !canvas) return;
    canvas.setAttribute('data-dynamic', '');        // re-sampled by the shader every frame
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    root.appendChild(canvas);                        // trailing child — safe alongside React nodes
    setCanvasReady(true);
  }, []);

  // --- Per-panel glass configuration --------------------------------------
  useEffect(() => {
    const pill = (h) => JSON.stringify({ cornerRadius: h / 2, zRadius: Math.min(h / 2, 26) });
    if (navRef.current) navRef.current.dataset.config = pill(58);
    if (footerRef.current) footerRef.current.dataset.config = pill(56);
  }, []);

  useLiquidGlass(rootRef, () => [navRef.current, footerRef.current], canvasReady);

  // --- Section navigation --------------------------------------------------
  const gotoSection = useCallback((targetIndex) => {
    const len = sections.length;
    const current = activeIndexRef.current;
    if (isAnimatingRef.current) return;
    if (targetIndex < 0 || targetIndex >= len || targetIndex === current) return;

    const direction = targetIndex > current ? 1 : -1;
    const els = gsap.utils.toArray('.snap-section');
    const currentEl = els[current];
    const nextEl = els[targetIndex];
    if (!currentEl || !nextEl) return;

    isAnimatingRef.current = true;
    activeIndexRef.current = targetIndex;
    setActiveIndex(targetIndex);
    // Imperative: drives the camera/light orbits without re-rendering <Canvas>.
    sceneState.target = targetIndex / (len - 1);

    gsap.set(nextEl, { zIndex: 2 });
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(currentEl, { zIndex: 0 });
        isAnimatingRef.current = false;
      },
    });

    tl.to(currentEl, {
      yPercent: -14 * direction,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.inOut',
    }, 0);

    tl.fromTo(nextEl,
      { yPercent: 18 * direction, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.inOut' },
      0
    );

    const reveal = nextEl.querySelectorAll('.gsap-reveal');
    if (reveal.length) {
      tl.fromTo(reveal,
        { y: 40, opacity: 0, filter: 'blur(7px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.09, ease: 'power3.out' },
        0.25
      );
    }
  }, []);

  // --- Scroll / gesture observer (created once) ---------------------------
  useEffect(() => {
    gsap.registerPlugin(Observer);
    const els = gsap.utils.toArray('.snap-section');
    if (!els.length) return;

    gsap.set(els, { yPercent: 20, autoAlpha: 0, zIndex: 0 });
    gsap.set(els[0], { yPercent: 0, autoAlpha: 1, zIndex: 1 });
    gsap.fromTo(els[0].querySelectorAll('.gsap-reveal'),
      { y: 44, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
    );

    const observer = Observer.create({
      target: window,
      type: 'wheel,touch,pointer',
      onDown: () => gotoSection(activeIndexRef.current + 1),
      onUp: () => gotoSection(activeIndexRef.current - 1),
      tolerance: 12,
      preventDefault: true,
    });

    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') gotoSection(activeIndexRef.current + 1);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') gotoSection(activeIndexRef.current - 1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      observer.kill();
      window.removeEventListener('keydown', onKey);
    };
  }, [gotoSection]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-white text-[#111]">
      {/* Off-screen r3f mount — its <canvas> gets reparented into the glass root */}
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none opacity-0">
        <ImmersiveScene onReady={handleCanvasReady} />
      </div>

      {/* LIQUID GLASS ROOT — bg gradient + reparented canvas + glass panels */}
      <div ref={rootRef} className="fixed inset-0 z-0">
        {/* soft studio backdrop (captured once, refracted by the glass) */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            background:
              'radial-gradient(120% 90% at 50% 42%, #ffffff 0%, #f3f3f4 46%, #e6e6e8 100%)',
          }}
        />

        {/* NAVBAR (liquid glass) */}
        <nav
          ref={navRef}
          className="glass-panel fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl h-[58px] px-8 flex items-center justify-between"
          style={{ zIndex: 6 }}
        >
          <span className="font-sans font-bold text-[11px] tracking-[0.28em] uppercase text-[#111]">
            N / Frontier
          </span>
          <div className="hidden md:flex gap-8">
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => gotoSection(idx)}
                className={`font-sans text-[11px] uppercase tracking-[0.14em] transition-colors duration-500 ${
                  activeIndex === idx ? 'text-[#ff6b00] font-semibold' : 'text-[#555] hover:text-[#111]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </nav>

        {/* FOOTER (liquid glass) */}
        <footer
          ref={footerRef}
          className="glass-panel fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl h-[56px] px-8 flex items-center justify-between"
          style={{ zIndex: 6 }}
        >
          <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-[#333] uppercase">
            © 2026 NextFrontier
          </span>
          <div className="font-sans text-[10px] font-bold tracking-[0.22em] text-[#333] uppercase flex gap-8">
            <a href="#" className="hover:text-[#ff6b00] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#ff6b00] transition-colors">Terms</a>
          </div>
        </footer>
      </div>

      {/* RIGHT-SIDE PROGRESS INDICATOR */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-end gap-5">
        {sections.map((sec, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={sec.id}
              onClick={() => gotoSection(idx)}
              className="group flex items-center gap-3 cursor-pointer"
            >
              <span
                className={`font-sans text-[10px] tracking-[0.2em] transition-all duration-500 ${
                  active ? 'text-[#ff6b00] opacity-100' : 'text-[#888] opacity-0 group-hover:opacity-70'
                }`}
              >
                {sec.number} — {sec.label}
              </span>
              <span
                className={`rounded-full transition-all duration-500 ${
                  active ? 'w-2.5 h-2.5 bg-[#ff6b00]' : 'w-1.5 h-1.5 bg-[#bbb] group-hover:bg-[#777]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* CONTENT OVERLAY — above the glass, section panels animated by GSAP */}
      <div ref={overlayRef} className="fixed inset-0 z-20 pointer-events-none">
        <StorySection id="hero" align="left">
          <p className="section-subtitle gsap-reveal">01 — Core</p>
          <h1 className="hero-title gsap-reveal">Next<br />Frontier</h1>
          <p className="body-text gsap-reveal mt-8 max-w-md">
            Ingeniería de ecosistemas complejos. Diseñamos la próxima generación
            de plataformas tecnológicas.
          </p>
        </StorySection>

        <StorySection id="vision" align="right">
          <p className="section-subtitle gsap-reveal">02 — Visión</p>
          <h2 className="section-title gsap-reveal">La luz<br />define la forma</h2>
          <p className="body-text gsap-reveal mt-8 max-w-md ml-auto text-right">
            Cada desplazamiento revela un nuevo ángulo. Del eclipse a la
            iluminación total, la materia responde a su entorno.
          </p>
        </StorySection>

        <StorySection id="architecture" align="left">
          <p className="section-subtitle gsap-reveal">03 — Motores</p>
          <h2 className="section-title gsap-reveal">Sistemas<br />vivos</h2>
          <p className="body-text gsap-reveal mt-8 max-w-md">
            Arquitecturas que se adaptan, escalan y aprenden. Construidas para
            durar y evolucionar con precisión.
          </p>
        </StorySection>

        <StorySection id="products" align="right">
          <p className="section-subtitle gsap-reveal">04 — Ecosistemas</p>
          <h2 className="section-title gsap-reveal">Un todo<br />coherente</h2>
          <p className="body-text gsap-reveal mt-8 max-w-md ml-auto text-right">
            Productos que orbitan una misma visión. Interfaces que interactúan
            con la luz, el material y el gesto.
          </p>
        </StorySection>

        <StorySection id="cta" align="center">
          <p className="section-subtitle gsap-reveal justify-center">05 — Enlace</p>
          <h2 className="section-title gsap-reveal">Construyamos<br />el futuro</h2>
          <div className="gsap-reveal mt-10 flex items-center justify-center gap-4 pointer-events-auto">
            <input className="input-field max-w-xs" placeholder="tu@correo.com" type="email" />
            <button className="btn-primary">Contactar</button>
          </div>
        </StorySection>
      </div>
    </main>
  );
}
