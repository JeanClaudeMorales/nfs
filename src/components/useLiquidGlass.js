"use client";

import { useEffect } from 'react';

// Initialises the @ybouane/liquidglass WebGL effect on a set of glass panels.
//
// Contract required by the library:
//  - every glass element must be a DIRECT child of `root`;
//  - the thing being refracted (here: the reparented react-three-fiber
//    <canvas>, tagged data-dynamic) must also be a direct child of `root`;
//  - init() is async and must run after webfonts are ready, otherwise text
//    captured into the shader falls back to a system font.
export default function useLiquidGlass(rootRef, getGlassElements, ready) {
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    let instance = null;
    let destroyed = false;

    (async () => {
      const { LiquidGlass } = await import('@ybouane/liquidglass');
      // Webfonts must be embedded before capture or the glass shows Times.
      if (document.fonts?.ready) {
        try { await document.fonts.ready; } catch { /* ignore */ }
      }
      if (destroyed) return;

      const glassElements = getGlassElements().filter(Boolean);
      if (glassElements.length === 0) return;

      instance = await LiquidGlass.init({
        root,
        glassElements,
        defaults: {
          blurAmount: 0.18,
          refraction: 0.78,
          chromAberration: 0.09,
          edgeHighlight: 0.55,
          specular: 0.7,
          fresnel: 1.0,
          cornerRadius: 40,
          zRadius: 24,
          saturation: 0.18,
          tintStrength: 0.07,
          brightness: 0.05,
          shadowOpacity: 0.22,
          shadowSpread: 18,
          shadowOffsetY: 7,
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
