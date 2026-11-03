import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Motion from "@/components/motion";
import { GERANTE } from "@/src/data/gerante";

/**
 * « Le mot de la gérante » en page d'accueil.
 *
 * Bloc de confiance, placé entre l'expertise (ServicesBento) et la preuve
 * sociale (avis clients) : on met un visage et une parole avant de laisser
 * parler les clients.
 *
 * Le texte affiché ici est un EXTRAIT de la lettre complète — les deux
 * viennent de `src/data/gerante.ts` pour ne jamais diverger. L'attribution
 * (nom, rôle) vit sous la citation, pas sur la photo : la répéter aux deux
 * endroits alourdissait le bloc.
 */
export default function MotGeranteSection() {
  return (
    <section className="bg-[#FAF5EE] py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-4 md:px-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-20">
        {/* ── Portrait ───────────────────────────────────────────────── */}
        <Motion
          variant="verticalSlideIn"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="relative mx-auto w-full max-w-[380px]">
            {/* Cadre doré décalé. Masqué sous `sm` : la colonne y occupe toute
                la largeur utile, le décalage ferait scroller horizontalement. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden translate-x-4 translate-y-4 rounded-[2.5rem] border-2 border-[#F5B324]/60 sm:block"
            />

            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2.5rem] bg-[#1B3C35] shadow-xl">
              <Image
                src={GERANTE.photo}
                alt={GERANTE.photoAlt}
                fill
                sizes="(max-width: 1024px) 85vw, 380px"
                className="object-cover"
              />
            </div>

            <div className="absolute left-5 top-5 rounded-full bg-[#F5B324] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-secondary shadow-lg">
              Depuis {GERANTE.depuis}
            </div>
          </div>
        </Motion>

        {/* ── Parole ─────────────────────────────────────────────────── */}
        <div className="relative">
          <Quote
            aria-hidden
            className="pointer-events-none absolute -top-10 left-0 h-24 w-24 text-[#F5B324]/15"
          />

          <Motion viewport={{ once: true, amount: 0.3 }}>
            <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5B324]">
              Le mot de la gérante <span>✦</span>
            </span>
          </Motion>

          <Motion
            variant="verticalSlideIn"
            animationParams={{ delay: 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="relative font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
              &laquo;&nbsp;{GERANTE.accroche}&nbsp;&raquo;
            </h2>
          </Motion>

          <Motion
            variant="verticalSlideIn"
            animationParams={{ delay: 0.2 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="mt-6 space-y-4 text-base leading-relaxed text-stone-700 md:text-lg">
              {GERANTE.extrait.map((paragraphe) => (
                <p key={paragraphe}>{paragraphe}</p>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-12 shrink-0 bg-[#F5B324]" />
              <div>
                <p className="font-agate text-xl font-bold text-secondary">
                  {GERANTE.civilite}
                </p>
                <p className="text-sm font-medium text-stone-500">
                  {GERANTE.role}, Agence Mirna
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-stone-500">
              {GERANTE.histoire}
            </p>

            <Button
              asChild
              className="mt-8 h-12 rounded-full bg-secondary px-8 font-bold text-white hover:bg-secondary/90"
            >
              <Link href="/mot-de-la-gerante">
                Lire le mot de la gérante
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Motion>
        </div>
      </div>
    </section>
  );
}
