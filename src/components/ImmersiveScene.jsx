"use client";

import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import sceneState from './sceneState';

// ---------------------------------------------------------------------------
// ECLIPSE MATERIAL
// meshStandardMaterial extended (onBeforeCompile) with a warm Fresnel rim.
// The rim glows brightest on the limb that faces the light — the "event
// horizon" glow of a backlit sphere during the eclipse phase. uLightDir is
// updated every frame so the glow tracks the orbiting sun.
// ---------------------------------------------------------------------------
function useEclipseMaterial() {
  const uniforms = useRef({
    uLightDir: { value: new THREE.Vector3(1, 0, 0.3).normalize() },
    uRimColor: { value: new THREE.Color('#ffc98c') },   // warm amber
    uRimStrength: { value: 1.5 },
    uRimPower: { value: 2.4 },
  });

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.92,
      metalness: 0.0,
      envMapIntensity: 0.45,
    });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms.current);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWorldNormal;')
        .replace(
          '#include <beginnormal_vertex>',
          '#include <beginnormal_vertex>\n  vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);'
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vWorldNormal;\nuniform vec3 uLightDir;\nuniform vec3 uRimColor;\nuniform float uRimStrength;\nuniform float uRimPower;'
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
  float _fres = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), uRimPower);
  float _facing = clamp(dot(normalize(vWorldNormal), normalize(uLightDir)), 0.0, 1.0);
  totalEmissiveRadiance += uRimColor * _fres * (0.32 + 1.1 * _facing) * uRimStrength;`
        );
    };
    return m;
  }, []);

  return { material, uniforms: uniforms.current };
}

// ---------------------------------------------------------------------------
// ORBIT RIG — the heart of the effect.
//  - `current` is damped toward `target` every frame => smooth velocity curve
//    for BOTH orbits, so nothing ever jumps between positions.
//  - Camera rides an ELLIPTICAL orbit (rx != rz) so its distance to the sphere
//    breathes in and out => a gentle dolly / zoom as you scroll.
//  - The light orbits the OPPOSITE way to the camera, so their relative angle
//    sweeps from ~180deg (eclipse: thin lit crescent + rim glow) to ~0deg
//    (full illumination).
// ---------------------------------------------------------------------------
const CAM_RX = 13.5;      // ellipse radius on X (wide)
const CAM_RZ = 10.0;      // ellipse radius on Z (near) -> distance breathes
const CAM_HEIGHT = 0.6;

// Relative angle camera<->sun goes from ~120deg (a bright warm-rimmed crescent
// on a still-luminous sphere) down to ~5deg (near-full illumination).
const LIGHT_BASE = THREE.MathUtils.degToRad(75);  // sun azimuth at scroll 0
const CAM_BASE = THREE.MathUtils.degToRad(75 + 120); // camera 120deg from sun
const CAM_SWEEP = THREE.MathUtils.degToRad(76);   // camera turns this far (CW)
const LIGHT_SWEEP = THREE.MathUtils.degToRad(39); // sun turns this far (CCW, opposite)
const LIGHT_RADIUS = 12;
const LIGHT_HEIGHT = 3.2;

function OrbitRig({ lightRef, uniforms }) {
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const camPos = useRef(new THREE.Vector3());
  const lightPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    // Damp `current` toward `target` (frame-rate independent). This single
    // eased value drives both orbits => matched, non-jumpy velocity curves.
    const damp = 1 - Math.pow(0.035, delta);
    sceneState.current += (sceneState.target - sceneState.current) * damp;
    const p = THREE.MathUtils.clamp(sceneState.current, 0, 1);

    // Camera: elliptical, clockwise.
    const camA = CAM_BASE - p * CAM_SWEEP;
    camPos.current.set(
      Math.sin(camA) * CAM_RX,
      CAM_HEIGHT + Math.sin(p * Math.PI) * 0.8, // slight vertical arc
      Math.cos(camA) * CAM_RZ
    );
    state.camera.position.copy(camPos.current);
    state.camera.lookAt(lookAt.current);

    // Light: circular, counter-clockwise (opposite the camera).
    const lightA = LIGHT_BASE + p * LIGHT_SWEEP;
    lightPos.current.set(
      Math.sin(lightA) * LIGHT_RADIUS,
      LIGHT_HEIGHT,
      Math.cos(lightA) * LIGHT_RADIUS
    );
    if (lightRef.current) lightRef.current.position.copy(lightPos.current);
    // Feed the light direction to the rim shader (world space, from origin).
    uniforms.uLightDir.value.copy(lightPos.current).normalize();
  });

  return null;
}

// ---------------------------------------------------------------------------
// SPHERE + LIGHTING
// ---------------------------------------------------------------------------
function EclipseScene() {
  const { material, uniforms } = useEclipseMaterial();
  const geometry = useMemo(() => new THREE.SphereGeometry(3.3, 160, 160), []);
  const lightRef = useRef();

  return (
    <>
      <mesh geometry={geometry} material={material} />

      {/* Fill keeps the shadow side a light grey (bright, like the reference)
          without flattening the light->shadow gradient. */}
      <ambientLight intensity={0.62} />
      {/* Warm key / sun — orbits via OrbitRig. Strong so the lit side is white. */}
      <directionalLight ref={lightRef} intensity={2.4} color="#fff0d8" />
      {/* Cool subtle counter-fill so the shadow side doesn't go muddy */}
      <directionalLight position={[-6, 2, -4]} intensity={0.22} color="#eef2ff" />

      {/* Dim env for a faint reflective sheen (not drawn to screen) */}
      <Environment resolution={256} background={false} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={2.4} color="#fff3e6" position={[8, 2, 3]} scale={[6, 10, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="circle" intensity={0.5} color="#ffffff" position={[-6, 3, -4]} scale={14} />
      </Environment>

      <OrbitRig lightRef={lightRef} uniforms={uniforms} />
    </>
  );
}

// ---------------------------------------------------------------------------
// SCENE MANAGER
// onReady hands the raw <canvas> back so it can be reparented into the
// LiquidGlass root. Scroll is read imperatively from sceneState (no props),
// so section changes never re-render this subtree.
// ---------------------------------------------------------------------------
export default function ImmersiveScene({ onReady }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const camA = CAM_BASE;
  return (
    <Canvas
      camera={{ position: [Math.sin(camA) * CAM_RX, CAM_HEIGHT, Math.cos(camA) * CAM_RZ], fov: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        // Required so LiquidGlass can drawImage() the live WebGL frame at
        // any moment inside its own render loop.
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.(gl.domElement);
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <EclipseScene />
      </Suspense>
    </Canvas>
  );
}
