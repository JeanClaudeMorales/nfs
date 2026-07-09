// Shared, mutable scene state for the 3D background.
//
// The orbit rig reads these every frame (useFrame); page.js writes the targets
// imperatively from scroll position. Keeping this OUT of React state means the
// scrolling page never re-renders the <Canvas>.
const sceneState = {
  target: 0,       // orbit progress 0..1 (whole-page scroll)
  current: 0,      // damped orbit value the camera/light follow
  dive: 0,         // 0 = normal, 1 = flown into the sphere's atmosphere (portfolio)
  diveCurrent: 0,  // damped dive value
};

export default sceneState;
