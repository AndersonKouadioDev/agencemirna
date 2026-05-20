"use client";

import * as React from "react";
import { Award, Building2, Smile, Users } from "lucide-react";

/**
 * Section de chiffres clés animés (count-up au scroll).
 * Animation déclenchée par IntersectionObserver pour ne pas bouffer
 * de CPU si la section n'est jamais vue.
 */

const STATS = [
  { icon: Building2, value: 100, suffix: "+", label: "Biens gérés" },
  { icon: Smile, value: 120, suffix: "+", label: "Clients satisfaits" },
  { icon: Award, value: 4, suffix: " ans", label: "D'expertise" },
  { icon: Users, value: 6, suffix: "", label: "Services métier" },
];

export default function StatsSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate bg-secondary text-white py-16 sm:py-20 overflow-hidden"
    >
      {/* Décoration */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0, transparent 35%), radial-gradient(circle at 80% 50%, hsl(var(--primary)) 0, transparent 35%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Notre impact
          </p>
          <h2 className="font-agate text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            La confiance, en chiffres
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              visible={visible}
              delay={i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  visible,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  visible: boolean;
  delay: number;
}) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!visible) return;
    const start = performance.now() + delay;
    const duration = 1400;
    let rafId = 0;

    const tick = (now: number) => {
      if (now < start) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(value * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [visible, value, delay]);

  return (
    <div className="text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <div className="font-agate text-5xl sm:text-6xl font-bold tabular-nums leading-none">
        {count}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="mt-2 text-sm text-white/75">{label}</div>
    </div>
  );
}
