"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type StatusKey =
  | "all"
  | "new"
  | "in_progress"
  | "qualified"
  | "converted"
  | "rejected"
  | "archived";

const STATUS_LABELS: { value: StatusKey; label: string; color?: string }[] = [
  { value: "all", label: "Tous" },
  { value: "new", label: "Nouveaux", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "in_progress", label: "En cours", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "qualified", label: "Qualifiés", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { value: "converted", label: "Convertis", color: "text-green-700 bg-green-50 border-green-200" },
  { value: "rejected", label: "Rejetés", color: "text-red-700 bg-red-50 border-red-200" },
  { value: "archived", label: "Archivés", color: "text-neutral-600 bg-neutral-100 border-neutral-200" },
];

const SOURCE_LABELS = [
  { value: "all", label: "Toutes sources" },
  { value: "contact", label: "Contact" },
  { value: "estimation", label: "Estimation" },
  { value: "visit_request", label: "Demande visite" },
  { value: "newsletter", label: "Newsletter" },
  { value: "other", label: "Autre" },
];

export function LeadsFilters({
  currentStatus,
  currentSource,
  counts,
}: {
  currentStatus: string;
  currentSource: string;
  counts: Record<StatusKey, number>;
}) {
  const searchParams = useSearchParams();

  function makeHref(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "all" || !v) params.delete(k);
      else params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
  }

  return (
    <div className="space-y-3">
      {/* Pills par status */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_LABELS.map((s) => {
          const isActive = currentStatus === s.value;
          const count = counts[s.value] ?? 0;
          return (
            <Link
              key={s.value}
              href={makeHref({ status: s.value })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? s.color ?? "bg-primary text-white border-primary"
                  : "border-stone-200 text-neutral-700 hover:bg-stone-50",
                isActive && !s.color && "bg-primary text-white border-primary",
              )}
            >
              {s.label}
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1",
                  isActive
                    ? s.color
                      ? "bg-white/60"
                      : "bg-white/20 text-white"
                    : "bg-stone-100 text-neutral-600",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Filtre source */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500 uppercase tracking-wider">Source :</span>
        {SOURCE_LABELS.map((s) => {
          const isActive = currentSource === s.value;
          return (
            <Link
              key={s.value}
              href={makeHref({ source: s.value })}
              className={cn(
                "rounded-md px-2.5 py-1 transition-colors",
                isActive
                  ? "bg-secondary text-white"
                  : "text-neutral-600 hover:bg-stone-100",
              )}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
