"use client";

import * as THREE from 'three';
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import sceneState from './sceneState';

// Blend of linear + smoothstep: keeps a non-zero slope at s=0 so the sphere
// reacts to the very first scroll in the hero (pure smootherstep was flat near
// 0, which made motion look like it only began at the second section), while
// still easing through the middle and retaining slope at s=1 for the arrival.
const smooth = (s) => 0.42 * s + 0.58 * (s * s * (3 - 2 * s));
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------------------
// SPHERE MATERIAL — clean white with a soft sheen (photoreal) + a faint warm
// Fresnel so the limb stays alive.
// ---------------------------------------------------------------------------
function useSphereMaterial() {
  return useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.42, metalness: 0, envMapIntensity: 0.78 });
    // Ordered dithering breaks up the 8-bit colour banding that showed as
    // concentric contour "rings" across the near-white sphere at large scale
    // (the "varias capas" artifact when the planet fills the screen).
    m.dithering = true;
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uRim = { value: new THREE.Color('#ffd9ad') };
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uRim;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  float _f = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.2);
  totalEmissiveRadiance += uRim * _f * 0.35;`);
    };
    return m;
  }, []);
}

// ---------------------------------------------------------------------------
// GLOW SPRITE — billboarded additive Gaussian glow behind the sphere = a soft,
// real backlight (event-horizon look), not a painted ring.
// ---------------------------------------------------------------------------
function GlowSprite() {
  const mesh = useRef();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color('#ffb060') },
          uCore: { value: new THREE.Color('#fff1e0') },
          uIntensity: { value: 1.0 },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
        fragmentShader: `
          uniform vec3 uColor; uniform vec3 uCore; uniform float uIntensity; varying vec2 vUv;
          void main(){
            float r = length(vUv - 0.5) * 2.0;
            float g = exp(-r*r*6.5);
            float core = exp(-r*r*16.0);
            vec3 col = mix(uColor, uCore, core);
            gl_FragColor = vec4(col, (g*1.1 + core*0.7) * uIntensity);
          }`,
      }),
    []
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.quaternion.copy(state.camera.quaternion);
    const p = clamp01(sceneState.current);
    const sc = 13 - p * 5;
    mesh.current.scale.set(sc, sc, sc);
    mat.uniforms.uIntensity.value = (0.95 - p * 0.85) * (1 - p * 0.4); // fade out on arrival so the sphere reads clean
  });

  return <mesh ref={mesh} geometry={geo} material={mat} renderOrder={-1} position={[0, 0, -0.6]} />;
}

// ---------------------------------------------------------------------------
// CAMERA RIG — monotonic small->large approach on a DESCENDING SPIRAL (re-entry
// feel): starts high & far, sweeps down and around as it closes on the sphere.
// ---------------------------------------------------------------------------
const R_FAR = 17.5; // closer start => the hero sphere reads a touch larger
const R_NEAR = 7; // end: large planet presence spanning the width behind the footer
const ANGLE_BASE = THREE.MathUtils.degToRad(205);
const ANGLE_SWEEP = THREE.MathUtils.degToRad(255);
const H_START = 7.2;
const H_END = 0.3;
const LIGHT_BASE = THREE.MathUtils.degToRad(70);

function CameraRig({ lightRef }) {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const pos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const damp = 1 - Math.pow(0.045, delta);
    sceneState.current += (sceneState.target - sceneState.current) * damp;
    sceneState.atmoCurrent += (sceneState.atmo - sceneState.atmoCurrent) * (1 - Math.pow(0.06, delta));
    const p = clamp01(sceneState.current);
    const e = smooth(p);
    const t = state.clock.elapsedTime;

    const radius = THREE.MathUtils.lerp(R_FAR, R_NEAR, e);
    const a = ANGLE_BASE + e * ANGLE_SWEEP + Math.sin(t * 0.14) * 0.05;
    const hDrop = THREE.MathUtils.lerp(H_START, H_END, e * e * (3 - 2 * e));
    const h = hDrop + Math.sin(e * Math.PI) * 1.6 + Math.sin(t * 0.22) * 0.3;
    pos.current.set(Math.sin(a) * radius, h, Math.cos(a) * radius);
    state.camera.position.copy(pos.current);

    // lookAt rises at the end -> the sphere sinks low in frame, its huge arc
    // spanning the full width like a planet horizon behind the footer. Idle
    // drift fades out on arrival so it settles centred.
    const drift = 1 - e * 0.75;
    target.current.set(
      THREE.MathUtils.lerp(-1.8, 0, e) + Math.sin(t * 0.13) * 0.45 * drift,
      THREE.MathUtils.lerp(1.4, 2.2, e) + Math.cos(t * 0.17) * 0.3 * drift,
      0
    );
    state.camera.lookAt(target.current);
    state.camera.rotateZ(Math.sin(t * 0.25) * 0.03 + Math.sin(e * Math.PI) * 0.08);

    if (lightRef.current) {
      const la = LIGHT_BASE - e * 0.5;
      lightRef.current.position.set(Math.sin(la) * 9, 6.5, Math.cos(la) * 9);
    }
  });
  return null;
}

function Scene() {
  const material = useSphereMaterial();
  const geometry = useMemo(() => new THREE.SphereGeometry(3.55, 180, 180), []);
  const lightRef = useRef();

  return (
    <>
      <GlowSprite />
      <mesh geometry={geometry} material={material} />

      <ambientLight intensity={0.42} />
      <directionalLight ref={lightRef} intensity={2.35} color="#fff6ec" />
      <directionalLight position={[-7, 3, 4]} intensity={0.42} color="#eaf0ff" />

      <Environment resolution={512} background={false} environmentIntensity={0.72}>
        <Lightformer form="rect" intensity={3.5} color="#ffffff" position={[0, 6, 2]} scale={[10, 6, 1]} rotation-x={Math.PI / 2.2} />
        <Lightformer form="rect" intensity={2} color="#fff3e6" position={[7, 2, 3]} scale={[5, 8, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="circle" intensity={0.7} color="#eaf0ff" position={[-6, 0, -4]} scale={12} />
      </Environment>

      <CameraRig lightRef={lightRef} />
    </>
  );
}

const INITIAL_CAMERA = {
  position: [Math.sin(ANGLE_BASE) * R_FAR, H_START, Math.cos(ANGLE_BASE) * R_FAR],
  fov: 38,
};

function ImmersiveScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <Canvas
        camera={INITIAL_CAMERA}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(ImmersiveScene);
