"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateLeadNotes } from "@/src/actions/admin/leads";

export function LeadNotes({
  id,
  initialNotes,
}: {
  id: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = React.useState(initialNotes ?? "");
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  async function save() {
    setSaving(true);
    const res = await updateLeadNotes(id, notes);
    setSaving(false);
    if (res.ok) {
      setSavedAt(Date.now());
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  // Reset le badge "Enregistré" après 3s
  React.useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 3000);
    return () => clearTimeout(t);
  }, [savedAt]);

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Notes internes
        </h2>
        {savedAt && (
          <span className="text-xs text-green-700">Enregistré.</span>
        )}
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes pour le suivi commercial : appels passés, prochaines actions, contexte client..."
        rows={5}
        className="text-sm"
      />
      <div className="mt-3 flex items-center justify-end">
        <Button
          type="button"
          onClick={save}
          disabled={saving || notes === (initialNotes ?? "")}
          size="sm"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          Enregistrer les notes
        </Button>
      </div>
    </section>
  );
}
