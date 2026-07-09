// Shared, mutable scroll state for the 3D scene.
//
// The camera/light orbits read `current` every frame (useFrame) while page.js
// writes `target` imperatively on each section change. Keeping this OUT of
// React state means changing sections never re-renders the <Canvas> subtree —
// which is what removes the visible "pulse"/re-mount flash on every scroll.
const sceneState = {
  target: 0,   // where we want to be (0..1), set by page.js
  current: 0,  // damped value the orbits actually follow (velocity curve)
};

export default sceneState;
