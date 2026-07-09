"use client";

import { useEffect } from 'react';

// Initialises @ybouane/liquidglass on a set of glass panels.
//
// Contract required by the library:
//  - every glass element must be a DIRECT child of `root`;
//  - the refracted content must also be a direct child of `root`
//    (an <img>/<canvas>/<video>, or a data-dynamic node for live content);
//  - init() is async and must run after webfonts are ready.
export default function useLiquidGlass(rootRef, getGlassElements, ready, defaults = {}) {
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    let instance = null;
    let destroyed = false;

    (async () => {
      const { LiquidGlass } = await import('@ybouane/liquidglass');
      if (document.fonts?.ready) {
        try { await document.fonts.ready; } catch {}
      }
      if (destroyed) return;

      const glassElements = getGlassElements().filter(Boolean);
      if (glassElements.length === 0) return;

      instance = await LiquidGlass.init({
        root,
        glassElements,
        defaults: {
          blurAmount: 0.14,
          refraction: 0.72,
          chromAberration: 0.06,
          edgeHighlight: 0.4,
          specular: 0.6,
          fresnel: 1.0,
          cornerRadius: 40,
          zRadius: 24,
          saturation: 0.14,
          tintStrength: 0.05,
          brightness: 0.05,
          shadowOpacity: 0.2,
          shadowSpread: 16,
          shadowOffsetY: 7,
          ...defaults,
        },
      });
      if (destroyed && instance) instance.destroy();
    })();

    return () => {
      destroyed = true;
      if (instance) instance.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}
