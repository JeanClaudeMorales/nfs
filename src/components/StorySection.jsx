"use client";

// A full-viewport story panel. Visibility + enter/exit motion are driven by
// GSAP from page.js (see gotoSection). Children marked `.gsap-reveal` are
// staggered in when the section becomes active.
export default function StorySection({ children, id = "", align = "left" }) {
  const alignmentClass =
    align === "right" ? "align-right" : align === "center" ? "align-center" : "align-left";

  return (
    <section id={id} className={`snap-section ${alignmentClass}`}>
      <div className="max-w-[640px] w-full relative">{children}</div>
    </section>
  );
}
