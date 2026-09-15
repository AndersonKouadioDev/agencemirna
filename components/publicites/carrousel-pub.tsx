"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicPublicite } from "@/src/actions/public";
import type { FormatPub } from "@/src/lib/publicites";
import { PubCarte } from "./pub-carte";

/**
 * Plusieurs publicités sur un même emplacement : elles défilent.
 *
 * Défilement automatique, mais qui s'arrête dès que le visiteur s'y intéresse
 * — survol, focus clavier, ou préférence système de mouvement réduit. Une pub
 * qui change sous le curseur au moment de cliquer est une pub qu'on ne
 * clique plus, et une vidéo en lecture ne doit pas être emportée.
 */
const INTERVALLE_MS = 6000;

export function CarrouselPub({ pubs, format }: { pubs: PublicPublicite[]; format: FormatPub }) {
  const [refEmbla, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [index, setIndex] = React.useState(0);
  const [enPause, setEnPause] = React.useState(false);

  React.useEffect(() => {
    if (!embla) return;
    const surSelection = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", surSelection);
    return () => {
      embla.off("select", surSelection);
    };
  }, [embla]);

  React.useEffect(() => {
    if (!embla || enPause) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Une vidéo en cours ne doit pas être emportée par le défilement.
    const t = window.setInterval(() => {
      const actif = embla.slideNodes()[embla.selectedScrollSnap()];
      if (actif?.querySelector("iframe, video")) return;
      embla.scrollNext();
    }, INTERVALLE_MS);
    return () => window.clearInterval(t);
  }, [embla, enPause]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocusCapture={() => setEnPause(true)}
      onBlurCapture={() => setEnPause(false)}
      role="region"
      aria-roledescription="carrousel"
      aria-label="Publicités"
    >
      <div ref={refEmbla} className="overflow-hidden rounded-[24px]">
        <div className="flex">
          {pubs.map((pub, i) => (
            <div
              key={pub.id}
              className="min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} sur ${pubs.length}`}
            >
              <PubCarte pub={pub} format={format} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => embla?.scrollPrev()}
        aria-label="Publicité précédente"
        className="absolute left-3 top-1/2 z-[3] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-secondary shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => embla?.scrollNext()}
        aria-label="Publicité suivante"
        className="absolute right-3 top-1/2 z-[3] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-secondary shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5" aria-hidden>
        {pubs.map((p, i) => (
          <button
            key={p.id}
            type="button"
            tabIndex={-1}
            onClick={() => embla?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#F5B324]" : "w-1.5 bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
