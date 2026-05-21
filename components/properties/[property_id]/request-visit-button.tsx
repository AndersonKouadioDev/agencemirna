"use client";

import * as React from "react";
import {
  Button as HeroButton,
  Modal,
} from "@heroui/react";
import { CalendarDays, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLead } from "@/src/actions/leads";

/**
 * Bouton "Demander une visite" : ouvre un modal HeroUI avec un mini-form
 * qui POST en createLead({source: 'visit_request', bien_id, metadata})
 *
 * Si bienId est fourni, le lead est rattaché à ce bien et apparaitra
 * dans /admin/leads avec un lien direct vers la fiche.
 */
export function RequestVisitButton({
  bienId,
  bienName,
}: {
  bienId?: string | null;
  bienName?: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [date, setDate] = React.useState("");
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createLead({
      source: "visit_request",
      full_name: name,
      phone,
      email: email || null,
      message: message || null,
      bien_id: bienId || null,
      source_url:
        typeof window !== "undefined" ? window.location.pathname : null,
      metadata: {
        bien_name: bienName ?? null,
        date_souhaitee: date || null,
      },
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  function reset() {
    setName("");
    setPhone("");
    setEmail("");
    setDate("");
    setMessage("");
    setError(null);
    setDone(false);
  }

  return (
    <Modal isOpen={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) reset();
    }}>
      <HeroButton
        onPress={() => setOpen(true)}
        className="w-full rounded-full h-10 bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
      >
        <CalendarDays className="h-4 w-4 mr-1.5" />
        Demander une visite
      </HeroButton>
      <Modal.Backdrop className="bg-black/50 backdrop-blur-sm">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[500px] bg-white rounded-2xl">
            <Modal.CloseTrigger />

            {done ? (
              <>
                <Modal.Header className="text-center pt-8">
                  <Modal.Icon className="bg-green-50 text-green-600 mx-auto">
                    <CheckCircle2 className="size-6" />
                  </Modal.Icon>
                  <Modal.Heading className="font-agate text-2xl text-secondary mt-3">
                    Demande envoyée
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="text-center text-neutral-600">
                  <p>
                    Un conseiller vous rappelle sous 24h ouvrées pour
                    confirmer la visite{date ? ` du ${date}` : ""}.
                  </p>
                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-green-700 transition-colors"
                    >
                      Discuter sur WhatsApp en attendant
                    </a>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <HeroButton
                    className="w-full rounded-full h-10 bg-secondary text-white font-semibold"
                    slot="close"
                  >
                    Fermer
                  </HeroButton>
                </Modal.Footer>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                <Modal.Header>
                  <Modal.Heading className="font-agate text-xl text-secondary">
                    Demander une visite
                  </Modal.Heading>
                  {bienName && (
                    <p className="text-sm text-neutral-500 mt-1">
                      {bienName}
                    </p>
                  )}
                </Modal.Header>

                <Modal.Body className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  <Field label="Votre nom" required>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Aïcha K."
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Téléphone" required>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+225 ..."
                        required
                      />
                    </Field>
                    <Field label="Email (optionnel)">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                      />
                    </Field>
                  </div>

                  <Field label="Date souhaitée">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  </Field>

                  <Field label="Message (optionnel)">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Questions, créneau précis souhaité..."
                      rows={3}
                    />
                  </Field>
                </Modal.Body>

                <Modal.Footer className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <HeroButton
                    className="rounded-full h-10 px-5 bg-stone-100 text-neutral-700 font-semibold hover:bg-stone-200"
                    slot="close"
                  >
                    Annuler
                  </HeroButton>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full h-10 px-6 flex-1"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Envoyer la demande
                  </Button>
                </Modal.Footer>
              </form>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
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
      <Label className="mb-1.5 block text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
