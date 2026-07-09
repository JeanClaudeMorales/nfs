// Geometric line icons — thin single-stroke marks inspired by the reference
// sheet. All use currentColor so they inherit text colour.

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Round trig coords so SSR and client render byte-identical strings (no
// hydration mismatch).
const r = (n) => Math.round(n * 100) / 100;

const wrap = (children) => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden>
    <g {...S}>{children}</g>
  </svg>
);

// Stacked rings (growth)
const Rings = () =>
  wrap(
    [0, 1, 2, 3].map((i) => (
      <ellipse key={i} cx="24" cy={16 + i * 6} rx="13" ry="4.4" />
    ))
  );

// Radial starburst (a good result)
const Burst = () =>
  wrap(
    Array.from({ length: 24 }).map((_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r1 = 5, r2 = 18;
      return (
        <line
          key={i}
          x1={r(24 + Math.cos(a) * r1)}
          y1={r(24 + Math.sin(a) * r1)}
          x2={r(24 + Math.cos(a) * r2)}
          y2={r(24 + Math.sin(a) * r2)}
        />
      );
    })
  );

// Overlapping circles (orbit / process)
const Orbit = () =>
  wrap(
    <>
      <circle cx="18" cy="24" r="11" />
      <circle cx="30" cy="24" r="11" />
    </>
  );

// Sprout / branching lines (performance)
const Sprout = () =>
  wrap(
    <>
      <path d="M24 40 V16" />
      <path d="M24 22 C24 18 20 14 14 13" />
      <path d="M24 22 C24 18 28 14 34 13" />
      <path d="M24 28 C24 25 21 22 16 21" />
      <path d="M24 28 C24 25 27 22 32 21" />
    </>
  );

// Saturn / planet (ethical / vision)
const Saturn = () =>
  wrap(
    <>
      <circle cx="24" cy="24" r="10" />
      <ellipse cx="24" cy="24" rx="19" ry="6" transform="rotate(-20 24 24)" />
    </>
  );

// Dot grid 3x3 (enterprise)
const Grid = () =>
  wrap(
    [0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <circle key={`${r}-${c}`} cx={13 + c * 11} cy={13 + r * 11} r="2.4" fill="currentColor" stroke="none" />
      ))
    )
  );

// Concentric arcs (signal / telecom)
const Signal = () =>
  wrap(
    <>
      <circle cx="24" cy="30" r="2.6" fill="currentColor" stroke="none" />
      <path d="M15 26 a12 12 0 0 1 18 0" />
      <path d="M11 21 a18 18 0 0 1 26 0" />
      <path d="M7 16 a24 24 0 0 1 34 0" />
    </>
  );

// Nested squares / digital twin
const Twin = () =>
  wrap(
    <>
      <rect x="10" y="10" width="20" height="20" />
      <rect x="18" y="18" width="20" height="20" />
    </>
  );

// Bracket frame (principle)
const Frame = () =>
  wrap(
    <>
      <path d="M14 10 H10 V14" />
      <path d="M34 10 H38 V14" />
      <path d="M14 38 H10 V34" />
      <path d="M34 38 H38 V34" />
    </>
  );

// Interlocking loops (peace of mind / route)
const Route = () =>
  wrap(
    <>
      <path d="M18 30 a7 7 0 1 1 7 -7 a7 7 0 1 0 7 -7" />
      <circle cx="18" cy="30" r="7" />
      <circle cx="32" cy="16" r="7" />
    </>
  );

// Cloud
const Cloud = () =>
  wrap(<path d="M16 32 a7 7 0 0 1 0 -14 a9 9 0 0 1 17 -1 a6 6 0 0 1 1 15 Z" />);

// Device
const Device = () =>
  wrap(
    <>
      <rect x="17" y="8" width="14" height="32" rx="2.5" />
      <line x1="22" y1="35" x2="26" y2="35" />
    </>
  );

// Shield
const Shield = () =>
  wrap(
    <>
      <path d="M24 8 L37 13 V25 C37 33 31 38 24 40 C17 38 11 33 11 25 V13 Z" />
      <path d="M19 24 l4 4 l7 -8" />
    </>
  );

// Radiating dots (acceleration)
const Radiate = () =>
  wrap(
    Array.from({ length: 12 }).flatMap((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [0, 1, 2].map((j) => {
        const rr = 8 + j * 5;
        return (
          <circle key={`${i}-${j}`} cx={r(24 + Math.cos(a) * rr)} cy={r(24 + Math.sin(a) * rr)} r={1.3} fill="currentColor" stroke="none" />
        );
      });
    })
  );

const MAP = {
  rings: Rings,
  burst: Burst,
  orbit: Orbit,
  sprout: Sprout,
  saturn: Saturn,
  grid: Grid,
  signal: Signal,
  twin: Twin,
  frame: Frame,
  route: Route,
  cloud: Cloud,
  device: Device,
  shield: Shield,
  radiate: Radiate,
};

export default function Icon({ name, className = '' }) {
  const Cmp = MAP[name] || Rings;
  return (
    <span className={`inline-block ${className}`} style={{ lineHeight: 0 }}>
      <Cmp />
    </span>
  );
}
