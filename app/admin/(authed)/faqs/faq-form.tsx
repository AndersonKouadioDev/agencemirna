"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertFaq, type FaqRow } from "@/src/actions/admin/content";

export function FaqForm({ row }: { row?: FaqRow }) {
  const router = useRouter();
  const isEdit = !!row;

  const [question, setQuestion] = React.useState(row?.question ?? "");
  const [answer, setAnswer] = React.useState(row?.answer ?? "");
  const [isActive, setIsActive] = React.useState(row?.is_active ?? true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await upsertFaq({
      id: row?.id,
      question,
      answer,
      is_active: isActive,
      ordre: row?.ordre,
    });

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/faqs?flash=saved");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/faqs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux questions
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {isEdit ? "Enregistrer les modifications" : "Créer la question"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? "Modifier la question" : "Nouvelle question FAQ"}
      </h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <Field label="Question" required>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex : Quels sont vos frais d'agence ?"
                required
              />
            </Field>

            <Field label="Réponse" required>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Réponse complète et détaillée. Les sauts de ligne sont préservés à l'affichage."
                rows={10}
                required
              />
            </Field>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
            <h2 className="font-semibold text-secondary">Publication</h2>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  Question active
                </span>
                <span className="block text-xs text-neutral-500">
                  Visible dans la FAQ publique si coché.
                </span>
              </span>
            </label>
          </section>
        </div>
      </div>
    </form>
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
  return (
    <div>
      <Label className="mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
