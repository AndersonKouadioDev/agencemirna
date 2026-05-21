import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Card, Chip } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { getActiveAgents } from "@/src/actions/public";

export const metadata = {
  title: "Notre équipe : Agence Mirna",
  description:
    "Rencontrez l'équipe d'Agence Mirna : conseillers et experts immobiliers à Abidjan.",
};

export default async function AgentsPage() {
  const agents = await getActiveAgents();

  return (
    <main className="bg-[#FAF5EE]">
      {/* HERO */}
      <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Notre équipe
          </div>

          <h1 className="font-agate text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-secondary leading-[1.05]">
            À votre écoute
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Des experts à votre service pour chaque étape de votre projet
            immobilier à Abidjan.
          </p>
        </div>
      </section>

      {/* GRILLE AGENTS */}
      <section className="pb-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {agents.length === 0 ? (
            <EmptyAgents />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ============================================================================

function AgentCard({
  agent,
}: {
  agent: Awaited<ReturnType<typeof getActiveAgents>>[number];
}) {
  return (
    <Card
      variant="default"
      className="overflow-hidden bg-white border-stone-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Photo carrée XL */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        {agent.photo ? (
          <Image
            src={agent.photo}
            alt={agent.full_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10">
            <div className="font-agate text-7xl font-bold text-primary/40">
              {initials(agent.full_name)}
            </div>
          </div>
        )}
        {/* Overlay nom (visible always) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-6">
          <h2 className="font-agate text-2xl text-white font-bold leading-tight">
            {agent.full_name}
          </h2>
          {agent.role && (
            <p className="text-sm text-white/85 mt-0.5">{agent.role}</p>
          )}
        </div>
      </div>

      <Card.Content className="p-6">
        {agent.specialites.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.specialites.map((s) => (
              <Chip
                key={s}
                size="sm"
                variant="soft"
                className="bg-primary/10 text-primary text-xs border-0"
              >
                {s}
              </Chip>
            ))}
          </div>
        )}

        {agent.bio && (
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">
            {agent.bio}
          </p>
        )}
      </Card.Content>

      <Card.Footer className="px-6 pb-6 pt-2 border-t border-stone-100">
        <div className="flex gap-2 w-full pt-4">
          {agent.whatsapp ? (
            <a
              href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 transition-colors"
              aria-label={`WhatsApp ${agent.full_name}`}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : (
            <div className="flex-1" />
          )}
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-stone-300 hover:bg-stone-100 text-neutral-700 transition-colors"
              aria-label={`Appeler ${agent.full_name}`}
              title="Téléphone"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-stone-300 hover:bg-stone-100 text-neutral-700 transition-colors"
              aria-label={`Email ${agent.full_name}`}
              title="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}

// ============================================================================

function EmptyAgents() {
  const promises = [
    {
      icon: ShieldCheck,
      title: "Conseillers certifiés",
      text: "Expertise locale du marché abidjanais, formation continue, intégrité absolue.",
    },
    {
      icon: Headphones,
      title: "Réponse sous 24h",
      text: "Un interlocuteur unique dédié, joignable par WhatsApp, téléphone ou email.",
    },
    {
      icon: Award,
      title: "Accompagnement complet",
      text: "Visite, négociation, signature, gestion : on vous porte de bout en bout.",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
      {/* Colonne gauche : éditorial + CTAs */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary mb-6">
          <Sparkles className="h-3 w-3" />
          Bientôt en ligne
        </div>

        <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary leading-[1.1] mb-5">
          La rencontre, <span className="italic text-primary">en vrai</span>.
        </h2>

        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed mb-8">
          Nos conseillers préparent leur arrivée sur le site. En attendant,
          nous restons à votre écoute : par WhatsApp, téléphone ou en
          rendez-vous dans nos bureaux de Marcory Zone 4.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Button asChild className="rounded-full h-12 px-6">
            <Link
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
                "https://wa.me/22501434831131"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Parler à un conseiller
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full h-12 px-6"
          >
            <Link href="/contact_us">
              Prendre rendez-vous
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Liste promesses */}
        <div className="space-y-5 border-t border-stone-200 pt-8">
          {promises.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex items-start gap-4">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary text-sm sm:text-base">
                    {p.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mt-0.5">
                    {p.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Colonne droite : grille "silhouettes" en attente */}
      <div className="relative">
        {/* Décor blur background */}
        <div
          aria-hidden
          className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 blur-3xl opacity-40"
        />
        <div className="relative grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-white via-stone-50 to-primary/5 border border-stone-200/80 ${
                i === 0 || i === 3 ? "translate-y-6" : ""
              }`}
            >
              {/* Silhouette avatar */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <User className="h-12 w-12 text-white/80" />
                  </div>
                </div>
                <div className="mt-5 h-2.5 w-20 rounded-full bg-stone-200" />
                <div className="mt-2 h-2 w-14 rounded-full bg-stone-200/70" />
              </div>

              {/* Badge "Bientôt" */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary shadow-sm">
                  Bientôt
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau bas */}
        <div className="relative mt-8 flex items-center justify-center gap-2 text-sm text-neutral-600">
          <Users className="h-4 w-4 text-primary" />
          <span>
            <strong className="text-secondary">+10 experts</strong> à votre
            service très bientôt
          </span>
        </div>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
