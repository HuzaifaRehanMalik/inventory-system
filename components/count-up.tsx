"use client";

import { useEffect, useRef } from "react";

// Counts a KPI up from zero on first paint so the eye lands on the numbers.
// Writes straight to the DOM node (no React state per frame) and renders the
// final value on the server, so it is correct without JS and under reduced motion.
export function CountUp({
  value,
  duration = 1100,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const formatter = new Intl.NumberFormat();
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      node.textContent = formatter.format(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.textContent = formatter.format(value);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  );
}
