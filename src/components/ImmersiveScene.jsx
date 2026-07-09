"use client";

import * as THREE from 'three';
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Clouds, Cloud } from '@react-three/drei';
import sceneState from './sceneState';

const smooth = (s) => s * s * s * (s * (s * 6 - 15) + 10);

// ---------------------------------------------------------------------------
// ECLIPSE MATERIAL — meshStandardMaterial + warm Fresnel "event-horizon" rim.
// ---------------------------------------------------------------------------
function useEclipseMaterial() {
  const uniforms = useRef({
    uLightDir: { value: new THREE.Vector3(1, 0, 0.3).normalize() },
    uRimColor: { value: new THREE.Color('#ffcf9c') },
    uRimStrength: { value: 1.05 },
    uRimPower: { value: 2.9 },
  });

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0.0, envMapIntensity: 0.45 });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms.current);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWorldNormal;')
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n  vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWorldNormal;\nuniform vec3 uLightDir;\nuniform vec3 uRimColor;\nuniform float uRimStrength;\nuniform float uRimPower;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
  float _fres = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), uRimPower);
  float _facing = clamp(dot(normalize(vWorldNormal), normalize(uLightDir)), 0.0, 1.0);
  totalEmissiveRadiance += uRimColor * _fres * (0.32 + 1.1 * _facing) * uRimStrength;`);
    };
    return m;
  }, []);

  return { material, uniforms: uniforms.current };
}

// ---------------------------------------------------------------------------
// EVENT-HORIZON GLOW SHELL — an additive Fresnel corona just outside the
// sphere's silhouette. Brightest in the hero (far), fades as we dive in.
// ---------------------------------------------------------------------------
function GlowShell({ uniforms }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        uniforms: {
          uColor: { value: new THREE.Color('#ffc48a') },
          uCore: { value: new THREE.Color('#fff6ec') },
          uIntensity: { value: 1.0 },
          uPower: { value: 4.2 },
        },
        vertexShader: `
          varying vec3 vN; varying vec3 vV;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position,1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform vec3 uColor; uniform vec3 uCore; uniform float uIntensity; uniform float uPower;
          varying vec3 vN; varying vec3 vV;
          void main(){
            float f = 1.0 - clamp(dot(vN, vV), 0.0, 1.0);
            float rim = pow(f, uPower);
            vec3 col = mix(uColor, uCore, pow(f, uPower*2.0));
            gl_FragColor = vec4(col, rim * uIntensity);
          }`,
      }),
    []
  );
  const geo = useMemo(() => new THREE.SphereGeometry(3.3, 96, 96), []);
  useFrame(() => {
    // Fade the corona out as we approach / enter the atmosphere.
    const p = THREE.MathUtils.clamp(sceneState.current, 0, 1);
    const dive = THREE.MathUtils.clamp(sceneState.diveCurrent, 0, 1);
    mat.uniforms.uIntensity.value = (1.35 - p * 0.5) * (1 - dive);
  });
  return <mesh scale={1.035} material={mat} geometry={geo} />;
}

// ---------------------------------------------------------------------------
// VOLUMETRIC ATMOSPHERE — drei Clouds that thicken as we enter (dive).
// ---------------------------------------------------------------------------
function Atmosphere() {
  const g = useRef();
  useFrame((state, delta) => {
    const dive = THREE.MathUtils.clamp(sceneState.diveCurrent, 0, 1);
    if (!g.current) return;
    g.current.visible = dive > 0.02;
    if (!g.current.visible) return;
    g.current.rotation.y += delta * 0.03;
    // Cloud opacity lives on the instanced meshes' shared material.
    g.current.traverse((o) => {
      if (o.material && 'opacity' in o.material) o.material.opacity = dive * 0.9;
    });
  });
  return (
    <group ref={g} visible={false}>
      <Clouds limit={220}>
        <Cloud seed={1} segments={24} bounds={[9, 3, 9]} volume={7} color="#ffe9d3" fade={24} speed={0.16} />
        <Cloud seed={4} segments={20} bounds={[8, 2.5, 8]} volume={6} color="#e7ecff" fade={22} speed={0.2} position={[2, -1, -2]} />
        <Cloud seed={7} segments={16} bounds={[7, 2, 7]} volume={5} color="#ffffff" fade={20} speed={0.24} position={[-2, 1.5, 1]} />
      </Clouds>
    </group>
  );
}

// ---------------------------------------------------------------------------
// ORBIT RIG — storyscroll dolly (far -> atmosphere) + counter-rotating light.
// ---------------------------------------------------------------------------
const CAM_RX = 13.5;
const CAM_RZ = 10.0;
const CAM_HEIGHT = 0.6;
const FAR = 2.25;   // hero distance multiplier (sphere far away)
const NEAR = 1.0;   // by the end (before the dive)

const LIGHT_BASE = THREE.MathUtils.degToRad(75);
const CAM_BASE = THREE.MathUtils.degToRad(75 + 110);
const CAM_SWEEP = THREE.MathUtils.degToRad(70);
const LIGHT_SWEEP = THREE.MathUtils.degToRad(35);
const LIGHT_RADIUS = 12;
const LIGHT_HEIGHT = 3.2;

function OrbitRig({ lightRef, uniforms }) {
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const camPos = useRef(new THREE.Vector3());
  const lightPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const damp = 1 - Math.pow(0.04, delta);
    sceneState.current += (sceneState.target - sceneState.current) * damp;
    sceneState.diveCurrent += (sceneState.dive - sceneState.diveCurrent) * (1 - Math.pow(0.07, delta));
    const p = THREE.MathUtils.clamp(sceneState.current, 0, 1);
    const dive = THREE.MathUtils.clamp(sceneState.diveCurrent, 0, 1);

    // Storyscroll distance: start far, approach, then dive inside.
    const dist = THREE.MathUtils.lerp(FAR, NEAR, smooth(p)) * (1 - dive * 0.62);

    const camA = CAM_BASE - p * CAM_SWEEP;
    camPos.current.set(
      Math.sin(camA) * CAM_RX * dist,
      (CAM_HEIGHT + Math.sin(p * Math.PI) * 0.8) * dist,
      Math.cos(camA) * CAM_RZ * dist
    );
    state.camera.position.copy(camPos.current);
    state.camera.lookAt(lookAt.current);

    const lightA = LIGHT_BASE + p * LIGHT_SWEEP;
    lightPos.current.set(Math.sin(lightA) * LIGHT_RADIUS, LIGHT_HEIGHT, Math.cos(lightA) * LIGHT_RADIUS);
    if (lightRef.current) lightRef.current.position.copy(lightPos.current);
    uniforms.uLightDir.value.copy(lightPos.current).normalize();
  });

  return null;
}

function EclipseScene() {
  const { material, uniforms } = useEclipseMaterial();
  const geometry = useMemo(() => new THREE.SphereGeometry(3.3, 160, 160), []);
  const lightRef = useRef();

  return (
    <>
      <mesh geometry={geometry} material={material} />
      <GlowShell uniforms={uniforms} />
      <Atmosphere />

      <ambientLight intensity={0.92} />
      <directionalLight ref={lightRef} intensity={2.6} color="#fff0d8" />
      <directionalLight position={[-6, 2, -4]} intensity={0.22} color="#eef2ff" />

      <Environment resolution={256} background={false} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={2.4} color="#fff3e6" position={[8, 2, 3]} scale={[6, 10, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="circle" intensity={0.5} color="#ffffff" position={[-6, 3, -4]} scale={14} />
      </Environment>

      <OrbitRig lightRef={lightRef} uniforms={uniforms} />
    </>
  );
}

const INITIAL_CAMERA = {
  position: [Math.sin(CAM_BASE) * CAM_RX * FAR, CAM_HEIGHT * FAR, Math.cos(CAM_BASE) * CAM_RZ * FAR],
  fov: 40,
};

function ImmersiveScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={INITIAL_CAMERA}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <EclipseScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(ImmersiveScene);
