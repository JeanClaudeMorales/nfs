"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

// Reveal on enter: fade + rise. (No blur filter — it's the main scroll-jank
// culprit; transform+opacity stay on the compositor.)
export function Reveal({ children, className = '', delay = 0, y = 30, once = true, as = 'div' }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

// Staggered container: children with <RevealItem> animate in sequence.
export function RevealGroup({ children, className = '', stagger = 0.08, once = true }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = '', y = 36, as = 'div' }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }}
    >
      {children}
    </M>
  );
}

// Vertical parallax tied to the element's scroll position.
export function Parallax({ children, className = '', speed = 60 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
