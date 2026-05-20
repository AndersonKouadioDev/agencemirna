"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../../_components/image-uploader";
import {
  upsertAgent,
  type AgentAdminRow,
} from "@/src/actions/admin/agents";

export function AgentForm({ agent }: { agent?: AgentAdminRow }) {
  const router = useRouter();
  const isEdit = !!agent;

  const [fullName, setFullName] = React.useState(agent?.full_name ?? "");
  const [role, setRole] = React.useState(agent?.role ?? "");
  const [bio, setBio] = React.useState(agent?.bio ?? "");
  const [phone, setPhone] = React.useState(agent?.phone ?? "");
  const [email, setEmail] = React.useState(agent?.email ?? "");
  const [whatsapp, setWhatsapp] = React.useState(agent?.whatsapp ?? "");
  const [specialites, setSpecialites] = React.useState<string[]>(
    agent?.specialites && agent.specialites.length > 0
      ? agent.specialites
      : [""],
  );
  const [photoUrls, setPhotoUrls] = React.useState<string[]>(
    agent?.photo ? [agent.photo] : [],
  );
  const [isActive, setIsActive] = React.useState(agent?.is_active ?? true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pathPrefix = React.useMemo(() => {
    if (agent?.id) return `agents/${agent.id}`;
    return `agents/draft-${typeof crypto !== "undefined" ? crypto.randomUUID().slice(0, 8) : Date.now()}`;
  }, [agent?.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertAgent({
      id: agent?.id,
      full_name: fullName,
      role: role || null,
      photo: photoUrls[0] ?? null,
      bio: bio || null,
      phone: phone || null,
      email: email || null,
      whatsapp: whatsapp || null,
      specialites: specialites.filter((s) => s.trim().length > 0),
      is_active: isActive,
      ordre: agent?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/agents?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1 hover:bg-stone-100 text-neutral-600"
          >
            <Link href="/admin/agents" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'équipe
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? fullName || "(sans nom)" : "Nouvel agent"}
          </h1>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting ? "…" : isEdit ? "Enregistrer" : "Créer l'agent"}
          </span>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Identité">
            <Field label="Nom complet" required>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Ex: Anderson Kouadio"
              />
            </Field>
            <Field label="Rôle / Poste">
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Responsable gestion locative"
              />
            </Field>
            <Field label="Biographie courte">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Quelques lignes sur l'agent (parcours, expertise…)"
                rows={4}
              />
            </Field>
          </Section>

          <Section
            title="Photo"
            subtitle="Une photo professionnelle ronde sera affichée. Format carré recommandé."
          >
            <ImageUploader
              value={photoUrls}
              onChange={setPhotoUrls}
              pathPrefix={pathPrefix}
              maxFiles={1}
            />
          </Section>

          <Section
            title="Spécialités"
            subtitle="Tags affichés sur la fiche publique (ex: Vente, Gestion, Location meublée)"
          >
            <div className="space-y-2">
              {specialites.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s}
                    onChange={(e) =>
                      setSpecialites((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? e.target.value : x,
                        ),
                      )
                    }
                    placeholder={`Spécialité ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSpecialites((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="shrink-0 h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                    disabled={specialites.length === 1 && !s}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSpecialites((prev) => [...prev, ""])}
              className="hover:bg-stone-100 border-stone-200"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">Ajouter une spécialité</span>
            </Button>
          </Section>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">
          <Section title="Publication">
            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md p-2 -m-2 hover:bg-stone-50">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="flex-1">
                <span
                  className={`block text-sm font-medium ${isActive ? "text-neutral-900" : "text-neutral-500"}`}
                >
                  {isActive ? "Agent visible" : "Agent désactivé"}
                </span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  {isActive
                    ? "Affiché sur la page /agents publique"
                    : "Masqué du site (utile en cas de départ, congé prolongé…)"}
                </span>
              </span>
            </label>
          </Section>

          <Section title="Contact">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anderson@agencemirna.com"
              />
            </Field>
            <Field label="Téléphone">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 01 23 45 67 89"
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="22501234567 (sans + ni espace)"
              />
              <Hint>
                Format wa.me (chiffres uniquement). Si vide, le bouton WhatsApp
                ne s'affichera pas.
              </Hint>
            </Field>
          </Section>
        </div>
      </div>

      {/* Footer sticky */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-8 bg-white/85 backdrop-blur border-t border-stone-200 px-6 lg:px-8 py-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          asChild
          className="hover:bg-stone-100 border-stone-200"
        >
          <Link href="/admin/agents">Annuler</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1.5">
            {submitting
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer l'agent"}
          </span>
        </Button>
      </div>
    </form>
  );
}

// ---------- Sous-composants ----------

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 space-y-4">
      <header>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-neutral-500 mt-1">{children}</p>;
}
