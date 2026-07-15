"use client";

import { useRef, useLayoutEffect, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// useLayoutEffect on the client (runs before paint, so the initial hidden state
// is set before the first frame — no flash), useEffect on the server (no-op).
const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EASE = 'power3.out';
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal on enter: fade + rise, driven by GSAP ScrollTrigger. Fires at
// `top 80%` — i.e. once the element has clearly entered from the bottom — so
// the motion plays *in view* instead of finishing before you reach it (the
// framer-motion amount:0.3 version triggered too early / "adelantado").
export function Reveal({ children, className = '', delay = 0, y = 30, once = true, as: As = 'div' }) {
  const ref = useRef(null);
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y, willChange: 'transform, opacity' });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.95, ease: EASE, delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, y, once]);
  return <As ref={ref} className={className}>{children}</As>;
}

// Staggered container: descendant <RevealItem> nodes animate in sequence when
// the group scrolls into view.
export function RevealGroup({ children, className = '', stagger = 0.08, once = true, as: As = 'div' }) {
  const ref = useRef(null);
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-reveal-item]');
    if (!items.length) return;
    if (reduced()) { gsap.set(items, { opacity: 1, y: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.set(items, {
        opacity: 0,
        y: (_, t) => Number(t.getAttribute('data-reveal-item')) || 36,
        willChange: 'transform, opacity',
      });
      gsap.to(items, {
        opacity: 1, y: 0, duration: 0.85, ease: EASE, stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 78%',
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        },
      });
    }, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagger, once]);
  return <As ref={ref} className={className}>{children}</As>;
}

// A single item inside a RevealGroup. `y` is carried on a data attribute so the
// group can read the per-item offset when it sets the initial state.
export function RevealItem({ children, className = '', y = 36, as: As = 'div' }) {
  return <As className={className} data-reveal-item={y}>{children}</As>;
}

// Vertical parallax tied to the element's scroll position: drifts from +speed
// down to -speed as it travels through the viewport (scrubbed to scroll).
export function Parallax({ children, className = '', speed = 60, as: As = 'div' }) {
  const ref = useRef(null);
  useIso(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: speed },
        {
          y: -speed, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [speed]);
  return <As ref={ref} className={className}>{children}</As>;
}
