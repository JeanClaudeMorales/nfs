// Shared, mutable scene state for the 3D background.
// The rig reads these each frame (useFrame); page.js writes targets from
// scroll. Keeping it out of React means scrolling never re-renders the Canvas.
const sceneState = {
  target: 0,       // global scroll progress 0..1 (drives monotonic sphere growth)
  current: 0,      // damped global progress
  atmo: 0,         // 0..1 how deep we are in the portfolio "atmosphere" moment
  atmoCurrent: 0,  // damped atmosphere value (clouds + sky blue)
};

export default sceneState;
