import Image from "next/image";
import { Mail, MessageCircle, Phone, Sparkles, Users } from "lucide-react";
import { Card, Chip } from "@heroui/react";
import { getActiveAgents } from "@/src/actions/public";

export const metadata = {
  title: "Notre équipe — Agence Mirna",
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
  return (
    <Card
      variant="default"
      className="bg-white border-stone-200 overflow-hidden"
    >
      <Card.Content className="p-12 sm:p-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
          <Users className="h-7 w-7" />
        </div>
        <h2 className="font-agate text-2xl sm:text-3xl font-bold text-secondary mb-2">
          Notre équipe sera bientôt présentée
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto">
          Nos conseillers sont en cours d'intégration sur le site.
        </p>
      </Card.Content>
    </Card>
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
