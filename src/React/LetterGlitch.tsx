import { useRef, useEffect } from "react";

const GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\{}[]<>=+-*#$%&@!?~^_|:;.,";

/**
 * Full-bleed cinematic hero canvas.
 *
 * Not OGL/WebGL — a 2D canvas letter field, kept from the original template but
 * rebuilt: it owns the whole viewport, dims to a radial vignette so display type
 * stays readable on top, reacts to pointer movement with a ripple, and pauses
 * itself when scrolled out of view or when the tab is hidden.
 */
const LetterGlitch = ({
  accent = "#c8ff4d",
  dim = "#4a4a52",
  dead = "#202024",
}: {
  accent?: string;
  dim?: string;
  dead?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cells = useRef<
    { char: string; life: number; hue: number; drift: number }[]
  >([]);
  const grid = useRef({ cols: 0, rows: 0 });
  const cellSize = useRef({ w: 14, h: 20 });
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const frame = useRef<number | null>(null);
  const visible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Scale the field down on small screens so glyphs stay legible.
    const size = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cellSize.current = {
        w: rect.width < 640 ? 12 : 14,
        h: rect.width < 640 ? 17 : 20,
      };
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { w, h } = cellSize.current;
      grid.current = {
        cols: Math.ceil(rect.width / w),
        rows: Math.ceil(rect.height / h),
      };
      const total = grid.current.cols * grid.current.rows;
      cells.current = Array.from({ length: total }, (_, i) => ({
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        // Fade the outer ring in on load instead of popping the whole field.
        life: Math.min(1, (i % grid.current.cols) / 12 + (i / total) * 1.4),
        hue: Math.random(),
        drift: (Math.random() - 0.5) * 0.6,
      }));
    };

    const draw = () => {
      const { cols } = grid.current;
      const { w, h } = cellSize.current;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.font = `500 ${h * 0.62}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "middle";

      for (let i = 0; i < cells.current.length; i++) {
        const c = cells.current[i];
        const x = (i % cols) * w;
        const y = Math.floor(i / cols) * h;

        // Distance from pointer drives brightness: cells wake up around the cursor.
        let near = 0;
        if (pointer.current.active) {
          const dx = x - pointer.current.x;
          const dy = y - pointer.current.y;
          const dist = Math.hypot(dx, dy);
          near = Math.max(0, 1 - dist / 190);
          near *= near;
        }

        const base = c.life * 0.55;
        const level = Math.min(1, base + near * 0.9);

        if (level < 0.06) {
          ctx.fillStyle = dead;
          ctx.globalAlpha = 0.5;
        } else if (near > 0.35) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = level;
        } else {
          ctx.fillStyle = dim;
          ctx.globalAlpha = level;
        }

        ctx.fillText(c.char, x, y + h * 0.1);
      }
      ctx.globalAlpha = 1;
    };

    let last = 0;
    const tick = (t: number) => {
      frame.current = requestAnimationFrame(tick);
      // ~14fps of glyph churn reads as "data streaming"; faster is just noise.
      if (t - last < 70) return;
      last = t;

      if (!reduced) {
        const churn = Math.max(1, Math.floor(cells.current.length * 0.012));
        for (let n = 0; n < churn; n++) {
          const idx = Math.floor(Math.random() * cells.current.length);
          const c = cells.current[idx];
          if (!c) continue;
          c.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          c.hue = Math.random();
        }
      }
      draw();
    };

    size();
    draw();
    if (!reduced) frame.current = requestAnimationFrame(tick);

    // Re-seed on resize, debounced so dragging a window doesn't thrash.
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        size();
        draw();
      }, 140);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };

    // Stop burning frames when the hero is scrolled away or the tab is hidden.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const onVis = () => {
      const nowVisible = document.visibilityState === "visible";
      if (nowVisible && visible.current && !reduced) {
        last = 0;
        frame.current = requestAnimationFrame(tick);
      } else if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearTimeout(t);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [accent, dim, dead]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {/* Vignette: holds the type readable over the field without hiding it. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 78% 62% at 22% 46%, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.72) 38%, rgba(10,10,11,0.15) 66%, rgba(10,10,11,0.6) 100%)",
        }}
      />
      {/* Bottom fade into the next section. */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, #0a0a0b 0%, transparent 100%)",
        }}
      />
    </div>
  );
};

export default LetterGlitch;
