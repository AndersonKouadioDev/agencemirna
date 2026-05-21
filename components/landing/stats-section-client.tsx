"use client";

import * as React from "react";
import { Award, Building2, Smile, Users } from "lucide-react";

export type StatItem = {
  iconKey: "building" | "smile" | "award" | "users";
  value: number;
  suffix: string;
  label: string;
};

const ICONS = {
  building: Building2,
  smile: Smile,
  award: Award,
  users: Users,
};

/**
 * Bloc client : count-up scroll-triggered. Reçoit les valeurs réelles
 * depuis le wrapper server (StatsSection) qui les calcule via count() DB.
 */
export default function StatsSectionClient({ stats }: { stats: StatItem[] }) {
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
          {stats.map((stat, i) => {
            const Icon = ICONS[stat.iconKey];
            return (
              <StatCard
                key={stat.label}
                icon={Icon}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                visible={visible}
                delay={i * 100}
              />
            );
          })}
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
      const eased = 1 - Math.pow(1 - progress, 3);
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
