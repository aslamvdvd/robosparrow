import React, { useEffect, useRef, useState } from "react";
import { Terminal, ArrowRight, Cpu, Code2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {}

const Landing: React.FC<Props> = () => {
  const navigate = useNavigate();
  const onStart = () => navigate("/studio");
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const bigTitleRef = useRef<HTMLDivElement | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // normalized -1..1
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
      setMouse({ x: nx, y: ny });
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${nx * 12}px, ${ny * 8}px, 0)`;
      }
      if (bigTitleRef.current) {
        // subtle skew and translate for huge title
        bigTitleRef.current.style.transform = `translate3d(${nx * 30}px, ${ny * 10}px, 0) rotate(${nx * 1.8}deg)`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    // small reflow to enable CSS var usage if needed
    requestAnimationFrame(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative overflow-hidden selection:bg-blue-500/30">
      {/* Inline keyframes and helpers */}
      <style>{`
        /* Big cinematic title + glitch + sweep + noise */
        @keyframes sweep { 0% { background-position: -40% 0 } 100% { background-position: 140% 0 } }
        @keyframes pulseGlow { 0%{text-shadow: 0 0 20px rgba(99,102,241,0.08)} 50%{text-shadow: 0 0 36px rgba(59,130,246,0.12)} 100%{text-shadow: 0 0 20px rgba(99,102,241,0.08)} }
        @keyframes floatSlow { 0%{transform: translateY(0)}50%{transform: translateY(-6px)}100%{transform: translateY(0)} }
        @keyframes particleMove {
          0%{ transform: translateY(0) scale(1); opacity:0.9 }
          50%{ transform: translateY(-18px) scale(1.08); opacity:0.6 }
          100%{ transform: translateY(0) scale(1); opacity:0.9 }
        }
        @keyframes glitch {
          0% { clip-path: inset(0 0 0 0); transform: translate(0,0); opacity:1 }
          7% { clip-path: inset(10% 0 10% 0); transform: translate(-6px, -2px); opacity:0.95 }
          14% { clip-path: inset(40% 0 40% 0); transform: translate(6px, 2px); opacity:0.9 }
          21% { clip-path: inset(0 0 0 0); transform: translate(0,0); opacity:1 }
          100% { clip-path: inset(0 0 0 0); transform: translate(0,0); opacity:1 }
        }
        .glow-sweep { background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.09), rgba(255,255,255,0.01)); background-size: 300% 100%; animation: sweep 6s linear infinite; -webkit-background-clip:text; background-clip:text; color: transparent; }
        .title-noise::after {
          content:"";
          position:absolute; inset:0; pointer-events:none;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.03" fill="white"/></svg>');
          mix-blend-mode:overlay; opacity:0.08;
        }
        /* marquee */
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        /* console logs flicker */
        @keyframes flicker { 0%{opacity:0.95} 50%{opacity:0.6} 100%{opacity:0.95} }
      `}</style>

      {/* Ambient blob layers */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[1000px] h-[700px] rounded-full bg-blue-600/8 blur-[140px] animate-floatSlow -z-20" />
      <div className="pointer-events-none absolute right-0 top-12 w-[520px] h-[520px] rounded-full bg-blue-500/6 blur-[160px] -z-30" />

      {/* MASSIVE TITLE HERO */}
      <header className="relative min-h-[88vh] flex items-center">
        {/* Huge background title (stage) */}
        <div
          ref={bigTitleRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10"
          aria-hidden
        >
          <div className="relative transform-gpu">
            <div className="text-[12vw] md:text-[9vw] lg:text-[8.8vw] leading-none font-extrabold uppercase tracking-tight text-transparent bg-clip-text glow-sweep">
              {/* layered duplicates for depth + glitch */}
              <div className="relative">
                <span
                  className="block absolute inset-0 translate-x-3 translate-y-2 opacity-30 blur-sm"
                  style={{ WebkitTextStroke: "0.5px rgba(255,255,255,0.02)" }}
                >
                  ROBO SPARROW
                </span>

                <span
                  className="block relative z-10 title-noise"
                  style={{ fontFeatureSettings: "'kern' 1" }}
                >
                  ROBO SPARROW
                </span>

                {/* magenta/blue subtle color offsets for glitch feel */}
                <span
                  className="block absolute inset-0 z-0"
                  style={{
                    color: "rgba(59,130,246,0.06)",
                    mixBlendMode: "screen",
                    transform: "translateX(-6px) translateY(-2px)",
                  }}
                >
                  ROBO SPARROW
                </span>
                <span
                  className="block absolute inset-0 z-0"
                  style={{
                    color: "rgba(99,102,241,0.04)",
                    mixBlendMode: "screen",
                    transform: "translateX(6px) translateY(2px)",
                  }}
                >
                  ROBO SPARROW
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Foreground stage content */}
        <div className="max-w-7xl mx-auto px-6 w-full z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                <span className="block text-blue-500 mt-2 text-5xl md:text-8xl">
                  Robo Sparrow
                </span>
                <br />
                <span className="block">A living robotics lab</span>
                <span className="block text-blue-500 mt-2 text-5xl md:text-4xl">
                  No hardware. All reality.
                </span>
              </h2>

              <p className="text-gray-300 max-w-2xl">
                Play with signal-accurate circuits, run firmware on virtual
                MCUs, and debug with an AI co-pilot — all inside the browser.
                The platform behaves like the messy, honest bench you actually
                learn from.
              </p>

              <div className="flex flex-wrap gap-4 mt-4">
                <button
                  onClick={onStart}
                  className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-2xl transform transition hover:-translate-y-1"
                >
                  <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 hover:opacity-30 transition-opacity" />
                  Launch Studio
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button className="px-6 py-3 rounded-2xl border border-gray-800 bg-gray-900/60 text-gray-300 hover:bg-gray-800">
                  View Documentation
                </button>
              </div>

              {/* vertical console marquee */}
              <div className="mt-8 overflow-hidden rounded-lg border border-gray-800 bg-gray-900/70 w-full max-w-xl">
                <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Live Console
                </div>
                <div className="relative h-28 bg-gradient-to-b from-gray-950/40 to-transparent overflow-hidden">
                  <div
                    style={
                      {
                        animation: "marquee 18s linear infinite",
                      } as React.CSSProperties
                    }
                    className="absolute left-0 top-0 w-[200%] will-change-transform"
                  >
                    <pre className="text-[13px] text-gray-300 px-4 py-3 whitespace-pre">
                      {`[00:01:31] booting physics engine...
[00:01:33] device /arduino/uno enumerated
[00:01:34] pwm(13) -> motor-driver #2
[00:01:36] ai: suggestion -> increase pwm slew rate
[00:01:40] compile: success (firmware.bin)`}
                    </pre>
                    <pre className="text-[13px] text-gray-300 px-4 py-3 whitespace-pre opacity-60">
                      {`[00:01:31] booting physics engine...
[00:01:33] device /arduino/uno enumerated
[00:01:34] pwm(13) -> motor-driver #2
[00:01:36] ai: suggestion -> increase pwm slew rate
[00:01:40] compile: success (firmware.bin)`}
                    </pre>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: interactive panel with animated particles & modules */}
            <div className="lg:col-span-5">
              <div
                ref={parallaxRef}
                className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-2xl transform transition-transform will-change-transform"
              >
                <div className="flex items-center justify-between text-xs text-gray-400 px-2 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <div className="ml-3 text-xs">Studio — live</div>
                  </div>
                  <div className="text-xs text-gray-500">v0.1.alpha</div>
                </div>

                <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-950/60 to-gray-900/30">
                  {/* particle network SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 600 400"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="pgrad" x1="0" x2="1">
                        <stop
                          offset="0%"
                          stopColor="#60a5fa"
                          stopOpacity="0.95"
                        />
                        <stop
                          offset="100%"
                          stopColor="#a78bfa"
                          stopOpacity="0.45"
                        />
                      </linearGradient>
                    </defs>

                    {/* generate a network of moving circles/lines */}
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const cx = 40 + ((idx * 43) % 560);
                      const cy = 30 + ((idx * 77) % 340);
                      const r = 3 + (idx % 4);
                      const delay = (idx % 5) * 0.3;
                      return (
                        <g
                          key={idx}
                          style={{
                            transformOrigin: "center",
                            animation: `particleMove 6s ${delay}s ease-in-out infinite`,
                          }}
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="url(#pgrad)"
                            opacity={0.85}
                          />
                        </g>
                      );
                    })}

                    {/* a few animated bezier paths to feel wired */}
                    <path
                      d="M 80 120 C 160 20, 260 260, 340 150"
                      stroke="url(#pgrad)"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                    <path
                      d="M 120 300 C 240 220, 360 320, 480 220"
                      stroke="url(#pgrad)"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.45"
                    />
                  </svg>

                  {/* floating module blocks */}
                  <div className="absolute left-6 top-8 w-28 h-20 rounded-xl border-2 border-teal-600 bg-teal-900/10 text-teal-300 flex items-center justify-center font-mono text-xs shadow-lg transform transition-all hover:scale-105">
                    Arduino
                  </div>

                  <div className="absolute right-6 top-10 w-32 h-20 rounded-full border-2 border-yellow-600 bg-yellow-900/10 text-yellow-300 flex items-center justify-center font-mono text-xs shadow-lg transform transition-all hover:scale-105">
                    Motor Driver
                  </div>

                  <div className="absolute left-[34%] top-[50%] w-36 h-24 rounded-lg border-2 border-gray-700 bg-gray-900/20 text-gray-300 flex items-center justify-center font-mono text-xs shadow-lg transform transition-all hover:scale-105">
                    Physics Core
                  </div>

                  {/* tiny HUD */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-400 px-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-900/60 border border-gray-800">
                        <Code2 className="w-3 h-3 text-green-400" />
                        Live Code
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-900/60 border border-gray-800">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        AI Assist
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      runtime 1.2ms
                    </div>
                  </div>
                </div>

                {/* CTA toolbar */}
                <div className="mt-4 flex items-center justify-between px-1">
                  <div className="text-xs text-gray-400 flex items-center gap-3">
                    <div className="px-2 py-1 rounded-full border border-gray-800 bg-gray-900/60">
                      Virtual Lab
                    </div>
                    <div className="px-2 py-1 rounded-full border border-gray-800 bg-gray-900/60">
                      MCU Runtime
                    </div>
                  </div>
                  <button
                    onClick={onStart}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition transform hover:-translate-y-0.5"
                  >
                    Launch
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Lower feature band */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <FeaturePill icon={<Cpu />} title="Signal-accurate simulation" />
          <FeaturePill icon={<Code2 />} title="Real MCU runtime" />
          <FeaturePill icon={<Zap />} title="AI system co-pilot" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/80 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" /> <span>Robo Sparrow</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            Built with ❤️ for the builders of tomorrow
          </div>
          <div className="flex items-center gap-2 text-white">
            © 2026 Robo Sparrow Simulation Systems
          </div>
        </div>
      </footer>
    </div>
  );
};

/* small presentational helpers */
const FeaturePill = ({ icon, title }: any) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 flex items-start gap-4">
    <div className="p-3 rounded-md bg-gray-950/40">{icon}</div>
    <div className="text-gray-200 font-semibold">{title}</div>
  </div>
);

export default Landing;
