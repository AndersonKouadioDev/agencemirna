import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
 * Teaser seulement — un extrait, puis renvoi vers la lettre complète sur
 * /about. Les deux lisent `src/data/gerante.ts`.
 *
 * Volontairement dépouillé : une grande photo, une citation, une signature.
 * Les guillemets du titre disent déjà la citation, d'où l'absence de glyphe
 * décoratif, et la seule respiration graphique est l'aplat doré décalé.
 */
export default function MotGeranteSection() {
  return (
    <section className="bg-[#FAF5EE] py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2 lg:gap-20">
        {/* ── Portrait ───────────────────────────────────────────────── */}
        <Motion
          variant="verticalSlideIn"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="relative mx-auto w-full max-w-[520px]">
            {/* Aplat doré décalé : de la profondeur sans ajouter de cadre.
                Masqué sous `sm`, où la colonne prend toute la largeur utile et
                où le décalage ferait scroller la page horizontalement. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden translate-x-5 translate-y-5 rounded-[2rem] bg-[#F5B324]/20 sm:block"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-[#1B3C35] shadow-2xl">
              <Image
                src={GERANTE.photo}
                alt={GERANTE.photoAlt}
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
            </div>
          </div>
        </Motion>

        {/* ── Parole ─────────────────────────────────────────────────── */}
        <div>
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
            <h2 className="font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl md:text-5xl">
              &laquo;&nbsp;{GERANTE.accroche}&nbsp;&raquo;
            </h2>
          </Motion>

          <Motion
            variant="verticalSlideIn"
            animationParams={{ delay: 0.2 }}
            viewport={{ once: true, amount: 0.15 }}
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

            <Button
              asChild
              className="mt-8 h-12 rounded-full bg-secondary px-8 font-bold text-white hover:bg-secondary/90"
            >
              <Link href="/about#mot-de-la-gerante">
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
