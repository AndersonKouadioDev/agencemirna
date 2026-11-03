import Image from "next/image";
import Motion from "../motion";
import { GERANTE } from "@/src/data/gerante";

/**
 * « Le mot de la gérante » sur /about.
 *
 * Placée juste après AboutSection, qui nomme la fondatrice : le lien posé sur
 * son nom descend ici (`#mot-de-la-gerante`, d'où le `scroll-mt`, le header
 * étant fixe).
 *
 * Cette section porte la lettre COMPLÈTE ; la home n'en affiche qu'un extrait.
 * Les deux lisent `src/data/gerante.ts`. Les trois engagements restent dans ce
 * même bloc plutôt que dans une section à part : ce sont les trois mots de sa
 * mission, ils se lisent avec la lettre, pas à côté.
 */
export default function MotGeranteSection() {
  return (
    <section
      id="mot-de-la-gerante"
      className="scroll-mt-32 bg-[#FAF5EE] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Portrait */}
          <Motion
            variant="verticalSlideIn"
            viewport={{ once: true, amount: 0.15 }}
          >
            <div className="relative mx-auto w-full max-w-[520px]">
              {/* Aplat doré décalé : de la profondeur sans ajouter de cadre.
                  Masqué sous `sm`, où la colonne prend toute la largeur utile
                  et où le décalage ferait scroller la page. */}
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

          {/* Lettre */}
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
              <h2 className="font-agate text-3xl font-bold leading-tight text-secondary sm:text-4xl">
                &laquo;&nbsp;{GERANTE.accroche}&nbsp;&raquo;
              </h2>
            </Motion>

            <Motion
              variant="verticalSlideIn"
              animationParams={{ delay: 0.2 }}
              viewport={{ once: true, amount: 0.15 }}
            >
              <div className="mt-6 space-y-5 text-base leading-relaxed text-stone-700 md:text-lg">
                {GERANTE.lettre.map((paragraphe) => (
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
            </Motion>
          </div>
        </div>

        {/* Les trois mots de la mission, dépliés */}
        <Motion variant="verticalSlideIn" viewport={{ once: true, amount: 0.2 }}>
          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-stone-200/80 pt-12 sm:grid-cols-3 md:mt-20 md:gap-12">
            {GERANTE.engagements.map((engagement) => (
              <div key={engagement.titre}>
                <h3 className="font-agate text-xl font-bold text-secondary">
                  {engagement.titre}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-stone-600">
                  {engagement.texte}
                </p>
              </div>
            ))}
          </div>
        </Motion>
      </div>
    </section>
  );
}
