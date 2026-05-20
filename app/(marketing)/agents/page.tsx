import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, Phone, User, Users } from "lucide-react";
import { getActiveAgents } from "@/src/actions/public";

export const metadata = {
  title: "Notre équipe — Agence Mirna",
  description:
    "Rencontrez l'équipe d'Agence Mirna : conseillers et experts immobiliers à Abidjan.",
};

export default async function AgentsPage() {
  const agents = await getActiveAgents();

  return (
    <main className="relative isolate bg-primary/5">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-agate font-bold tracking-tight">
          Notre équipe
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
          Des experts à votre écoute pour chaque étape de votre projet
          immobilier.
        </p>
      </section>

      {/* Grille agents */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-32">
        {agents.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <Users className="h-10 w-10 mx-auto text-neutral-300 mb-4" />
            <p className="text-sm text-neutral-600">
              Notre équipe sera bientôt présentée ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-shadow"
              >
                {/* Photo */}
                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                  {agent.photo ? (
                    <Image
                      src={agent.photo}
                      alt={agent.full_name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <User className="h-20 w-20 text-primary/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col p-6">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {agent.full_name}
                  </h2>
                  {agent.role && (
                    <p className="text-sm text-primary mt-0.5">
                      {agent.role}
                    </p>
                  )}
                  {agent.specialites.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {agent.specialites.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {agent.bio && (
                    <p className="mt-4 text-sm text-neutral-600 leading-relaxed flex-1">
                      {agent.bio}
                    </p>
                  )}

                  {/* Contact actions */}
                  <div className="mt-5 flex gap-2 pt-4 border-t border-stone-100">
                    {agent.whatsapp && (
                      <a
                        href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 transition-colors"
                        aria-label={`WhatsApp ${agent.full_name}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-stone-200 hover:bg-stone-100 text-neutral-600 transition-colors"
                        aria-label={`Appeler ${agent.full_name}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {agent.email && (
                      <a
                        href={`mailto:${agent.email}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-stone-200 hover:bg-stone-100 text-neutral-600 transition-colors"
                        aria-label={`Email ${agent.full_name}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
