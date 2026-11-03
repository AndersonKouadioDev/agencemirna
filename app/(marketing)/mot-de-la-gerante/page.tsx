import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Motion from "@/components/motion";
import { BreadcrumbJsonLd } from "@/components/seo/structured-data";
import { GERANTE } from "@/src/data/gerante";
import { getSiteContact } from "@/src/lib/site-contact";

/**
 * Page /mot-de-la-gerante : la lettre complète de la fondatrice.
 *
 * Destination du bloc « Le mot de la gérante » affiché en page d'accueil ;
 * l'extrait de la home et la lettre d'ici viennent du même module
 * `src/data/gerante.ts`.
 */

export const metadata = {
  title: "Le mot de la gérante | Agence Mirna",
  description:
    "Madame Barry Néné Yéro, fondatrice et gérante de l'Agence Mirna, revient sur la mission de l'agence : une expérience immobilière plus transparente, plus professionnelle et plus sereine en Côte d'Ivoire.",
};

export default async function MotGerantePage() {
  const contact = await getSiteContact();
  const [premierParagraphe, ...suiteLettre] = GERANTE.lettre;

  return (
    <main className="bg-[#FAF5EE]">
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "À propos", url: "/about" },
          { name: "Le mot de la gérante", url: "/mot-de-la-gerante" },
        ]}
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#1B3C35] pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#F5B324]/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-16 lg:px-8">
          <div>
            <Motion>
              <span className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5B324]">
                Le mot de la gérante <span>✦</span>
              </span>
            </Motion>

            <Motion variant="verticalSlideIn" animationParams={{ delay: 0.1 }}>
              <h1 className="font-agate text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
                &laquo;&nbsp;{GERANTE.accroche}&nbsp;&raquo;
              </h1>
            </Motion>

            <Motion variant="verticalSlideIn" animationParams={{ delay: 0.2 }}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
                {GERANTE.histoire}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <span className="h-px w-12 shrink-0 bg-[#F5B324]" />
                <div>
                  <p className="font-agate text-xl font-bold text-white">
                    {GERANTE.civilite}
                  </p>
                  <p className="text-sm font-medium text-white/60">
                    {GERANTE.role}
                  </p>
                </div>
              </div>
            </Motion>
          </div>

          <Motion
            variant="verticalSlideIn"
            animationParams={{ delay: 0.15 }}
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="relative mx-auto w-full max-w-[380px]">
              {/* Cadre doré décalé, masqué sous `sm` : la colonne y prend toute
                  la largeur utile et le décalage ferait scroller la page. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden translate-x-4 translate-y-4 rounded-[2.5rem] border-2 border-[#F5B324]/60 sm:block"
              />
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2.5rem] bg-[#102A25] shadow-2xl">
                <Image
                  src={GERANTE.photo}
                  alt={GERANTE.photoAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 85vw, 380px"
                  className="object-cover"
                />
              </div>
            </div>
          </Motion>
        </div>
      </section>

      {/* ── REPÈRES ───────────────────────────────────────────────────── */}
      <section className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 lg:grid-cols-4 lg:px-8">
          {GERANTE.reperes.map((repere) => (
            <div key={repere.libelle} className="text-center">
              <p className="font-agate text-lg font-bold text-secondary md:text-xl">
                {repere.valeur}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-500">
                {repere.libelle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LA LETTRE ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Motion
            variant="verticalSlideIn"
            viewport={{ once: true, amount: 0.1 }}
          >
            <article className="relative rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-stone-100 sm:p-12 md:p-16">
              <Quote
                aria-hidden
                className="absolute right-8 top-8 h-16 w-16 text-[#F5B324]/20 md:right-12 md:top-12 md:h-24 md:w-24"
              />

              <p className="text-lg leading-relaxed text-stone-700 first-letter:float-left first-letter:mr-3 first-letter:font-agate first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-[#F5B324] md:text-xl">
                {premierParagraphe}
              </p>

              <div className="mt-6 space-y-6 text-lg leading-relaxed text-stone-700 md:text-xl">
                {suiteLettre.map((paragraphe) => (
                  <p key={paragraphe}>{paragraphe}</p>
                ))}
              </div>

              <div className="mt-12 flex flex-col gap-5 border-t border-stone-100 pt-8 sm:flex-row sm:items-center">
                {/* Vignette ronde : le portrait détouré, cadré sur le visage —
                    la photo en situation y montrerait surtout l'immeuble. */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#1B3C35]">
                  <Image
                    src={GERANTE.portraitDetoure}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className="font-agate text-2xl font-bold text-secondary">
                    {GERANTE.nom}
                  </p>
                  <p className="text-sm font-medium text-stone-500">
                    {GERANTE.role}, Agence Mirna
                  </p>
                </div>
              </div>
            </article>
          </Motion>
        </div>
      </section>

      {/* ── ENGAGEMENTS ───────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-14 flex flex-col items-center text-center">
            <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5B324]">
              Nos engagements <span>✦</span>
            </span>
            <h2 className="max-w-2xl font-agate text-3xl font-bold leading-tight text-secondary md:text-5xl">
              Ce que cela veut dire au quotidien
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
            {GERANTE.engagements.map((engagement, index) => (
              <div
                key={engagement.titre}
                className="group relative overflow-hidden rounded-[2rem] bg-[#FAF5EE] p-8 transition-colors hover:bg-[#1B3C35] md:p-10"
              >
                <span className="font-agate text-5xl font-bold text-[#F5B324]/40 transition-colors group-hover:text-[#F5B324]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-agate text-xl font-bold text-secondary transition-colors group-hover:text-white md:text-2xl">
                  {engagement.titre}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-stone-600 transition-colors group-hover:text-white/75">
                  {engagement.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <section className="px-4 pb-24 md:px-8">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2.5rem] bg-[#1B3C35] px-8 py-14 md:px-16 md:py-20">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#F5B324]/10 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5B324]">
                Parlons de votre projet <span>✦</span>
              </span>
              <h2 className="font-agate text-3xl font-bold leading-tight text-white md:text-4xl">
                Poussez notre porte,
                <br />
                ou décrochez simplement
              </h2>
              <p className="mt-4 max-w-md text-white/70">
                Nous prenons le temps de comprendre votre projet avant de vous
                proposer quoi que ce soit.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#F5B324] px-7 font-bold text-secondary hover:bg-[#d99f1f]"
                >
                  <Link href="/contact_us">
                    Nous contacter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-white/30 bg-transparent px-7 font-bold text-white hover:bg-white hover:text-secondary"
                >
                  <Link href="/agents">
                    <Users className="mr-2 h-4 w-4" />
                    Notre équipe
                  </Link>
                </Button>
              </div>
            </div>

            <ul className="space-y-4 lg:justify-self-end">
              <li>
                <a
                  href={contact.telHref}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors hover:border-[#F5B324]/40 hover:bg-white/10"
                >
                  <Phone className="h-5 w-5 shrink-0 text-[#F5B324]" />
                  <span className="font-medium">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappMessageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors hover:border-[#F5B324]/40 hover:bg-white/10"
                >
                  <MessageCircle className="h-5 w-5 shrink-0 text-[#F5B324]" />
                  <span className="font-medium">Écrire sur WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors hover:border-[#F5B324]/40 hover:bg-white/10"
                >
                  <Mail className="h-5 w-5 shrink-0 text-[#F5B324]" />
                  <span className="font-medium">{contact.email}</span>
                </a>
              </li>
              {contact.adresse && (
                <li className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white/80">
                  <MapPin className="h-5 w-5 shrink-0 text-[#F5B324]" />
                  <span className="font-medium">{contact.adresse}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
