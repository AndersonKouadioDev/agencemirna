"use client";

import * as React from "react";
import { Eraser } from "lucide-react";

/**
 * Zone de signature au doigt ou au stylet. Renvoie une image PNG (data URL)
 * après chaque trait, ou `null` une fois effacée.
 */
export function PadSignature({
  libelle,
  onChange,
}: {
  libelle: string;
  onChange: (png: string | null) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dessine = React.useRef(false);
  const [vide, setVide] = React.useState(true);

  // Toile à la résolution réelle de l'écran : sinon le trait est flou.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f1208";
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function debut(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dessine.current = true;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function trace(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dessine.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function fin(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dessine.current) return;
    dessine.current = false;
    setVide(false);
    onChange(e.currentTarget.toDataURL("image/png"));
  }

  function effacer() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    setVide(true);
    onChange(null);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-secondary">{libelle}</span>
        <button
          type="button"
          onClick={effacer}
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-red-600"
        >
          <Eraser className="h-3.5 w-3.5" />
          Effacer
        </button>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={debut}
          onPointerMove={trace}
          onPointerUp={fin}
          onPointerCancel={fin}
          className="h-44 w-full touch-none rounded-xl border-2 border-dashed border-stone-300 bg-white"
          aria-label={`Zone de signature : ${libelle}`}
        />
        {vide && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-stone-400">
            Signez ici avec le doigt ou le stylet
          </span>
        )}
      </div>
    </div>
  );
}
