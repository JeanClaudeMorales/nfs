"use client";

import * as THREE from 'three';
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Clouds, Cloud } from '@react-three/drei';
import sceneState from './sceneState';

const smooth = (s) => s * s * s * (s * (s * 6 - 15) + 10);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ---------------------------------------------------------------------------
// SPHERE MATERIAL — clean white, soft sheen (photoreal). A faint warm Fresnel
// keeps the limb alive; the real "light behind" is the additive GlowSprite.
// ---------------------------------------------------------------------------
function useSphereMaterial() {
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.48, metalness: 0.0, envMapIntensity: 0.9 });
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
  return material;
}

// ---------------------------------------------------------------------------
// GLOW SPRITE — a billboarded additive plane with a soft Gaussian falloff.
// Rendered behind the sphere (sphere occludes its core), so only the diffuse
// halo spills around the silhouette = real backlight, not a painted ring.
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
            float r = length(vUv - 0.5) * 2.0;          // 0 center .. 1 edge
            float g = exp(-r*r*6.5);                     // soft gaussian (fades before plane edge)
            float core = exp(-r*r*16.0);                 // hotter middle
            vec3 col = mix(uColor, uCore, core);
            gl_FragColor = vec4(col, (g*1.1 + core*0.7) * uIntensity);
          }`,
      }),
    []
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.quaternion.copy(state.camera.quaternion); // billboard
    const p = clamp01(sceneState.current);
    // Big glow when far (hero), softening as we arrive inside the atmosphere.
    const s = 13 - p * 3;
    mesh.current.scale.set(s, s, s);
    mat.uniforms.uIntensity.value = 0.95 - p * 0.45;
  });

  return <mesh ref={mesh} geometry={geo} material={mat} renderOrder={-1} position={[0, 0, -0.6]} />;
}

// ---------------------------------------------------------------------------
// VOLUMETRIC ATMOSPHERE — clouds that fade in through the final third.
// ---------------------------------------------------------------------------
function Atmosphere() {
  const g = useRef();
  // drei <Cloud> re-applies opacity from its PROP every frame, so a ref-traverse
  // is overwritten. Drive the opacity prop via throttled state instead.
  const [op, setOp] = useState(0);
  const opRef = useRef(0);

  useFrame((state, delta) => {
    const target = clamp01(sceneState.atmoCurrent);
    if (Math.abs(target - opRef.current) > 0.025) { opRef.current = target; setOp(target); }
    if (g.current) g.current.rotation.y += delta * 0.05;
  });

  if (op <= 0.01) return null;
  const o = op * 0.98;
  return (
    <group ref={g}>
      {/* White puffs — the scene background lerps to sky-blue as we enter, so
          white clouds read clearly (like flying into an atmosphere). */}
      <Clouds limit={400}>
        <Cloud seed={1} segments={40} bounds={[12, 3.5, 12]} volume={11} color="#ffffff" fade={8} speed={0.2} opacity={o} position={[0, 0.3, 2]} />
        <Cloud seed={4} segments={34} bounds={[10, 3, 10]} volume={9} color="#f2f6ff" fade={8} speed={0.24} opacity={o * 0.95} position={[4, -1.6, -1]} />
        <Cloud seed={7} segments={30} bounds={[10, 2.6, 10]} volume={8} color="#ffffff" fade={7} speed={0.28} opacity={o * 0.95} position={[-4, 1.8, 2]} />
        <Cloud seed={11} segments={26} bounds={[9, 2.4, 9]} volume={7} color="#eaf1ff" fade={9} speed={0.32} opacity={o * 0.85} position={[0, -2.2, -2]} />
      </Clouds>
    </group>
  );
}

// ---------------------------------------------------------------------------
// CAMERA RIG — MONOTONIC approach: sphere starts small (far) and grows all the
// way to the footer (near / inside). One direction, never big->small->big.
// ---------------------------------------------------------------------------
const R_FAR = 22;    // hero: sphere sizeable but with room ahead
const R_NEAR = 5.0;  // footer: sphere fills the frame (inside the atmosphere)
const ANGLE_BASE = THREE.MathUtils.degToRad(205);
const ANGLE_SWEEP = THREE.MathUtils.degToRad(255); // long re-entry spiral
const H_START = 7.2; // starts high, looking down
const H_END = 0.2;   // descends to near the equator
const LIGHT_BASE = THREE.MathUtils.degToRad(70);
const BG_LIGHT = new THREE.Color('#eef0f2');
const BG_SKY = new THREE.Color('#a9bbd6'); // soft atmosphere blue at the end
const _bgTmp = new THREE.Color();

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

    // Re-entry: a DESCENDING SPIRAL — high & far, sweeping down and around as
    // it closes on the sphere. More orbit + a curved fall = cinematic dive.
    const radius = THREE.MathUtils.lerp(R_FAR, R_NEAR, e);
    const a = ANGLE_BASE + e * ANGLE_SWEEP + Math.sin(t * 0.14) * 0.05;
    // ease the descent (starts gentle, steepens) for a curved re-entry arc
    const hDrop = THREE.MathUtils.lerp(H_START, H_END, e * e * (3 - 2 * e));
    const h = hDrop + Math.sin(e * Math.PI) * 1.6 + Math.sin(t * 0.22) * 0.3;
    pos.current.set(Math.sin(a) * radius, h, Math.cos(a) * radius);
    state.camera.position.copy(pos.current);

    // Off-centre, drifting framing (the sphere isn't glued to the middle).
    target.current.set(
      THREE.MathUtils.lerp(-1.8, 0, e) + Math.sin(t * 0.13) * 0.45,
      THREE.MathUtils.lerp(1.4, 0, e) + Math.cos(t * 0.17) * 0.3,
      0
    );
    state.camera.lookAt(target.current);
    // Banking roll — stronger through the turn for the re-entry feel.
    state.camera.rotateZ(Math.sin(t * 0.25) * 0.03 + Math.sin(e * Math.PI) * 0.08);

    // Entering the atmosphere: fade the sky from near-white to soft blue so
    // the white clouds read against it.
    if (state.scene.background) {
      const sky = clamp01(sceneState.atmoCurrent);
      state.scene.background.copy(_bgTmp.copy(BG_LIGHT).lerp(BG_SKY, sky));
    }

    if (lightRef.current) {
      const la = LIGHT_BASE - e * 0.5;
      lightRef.current.position.set(Math.sin(la) * 9, 6.5, Math.cos(la) * 9);
    }
  });
  return null;
}

function Scene() {
  const material = useSphereMaterial();
  const geometry = useMemo(() => new THREE.SphereGeometry(3.3, 160, 160), []);
  const lightRef = useRef();

  return (
    <>
      <color attach="background" args={['#eef0f2']} />

      <GlowSprite />
      <mesh geometry={geometry} material={material} />
      <Atmosphere />

      {/* Photoreal white studio lighting: soft bright key from top-left,
          gentle fills, cool rim — smooth top->bottom gradient. */}
      <ambientLight intensity={0.55} />
      <directionalLight ref={lightRef} intensity={2.2} color="#fff6ec" />
      <directionalLight position={[-7, 3, 4]} intensity={0.5} color="#eaf0ff" />

      <Environment resolution={512} background={false} environmentIntensity={0.85}>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={INITIAL_CAMERA}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
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
