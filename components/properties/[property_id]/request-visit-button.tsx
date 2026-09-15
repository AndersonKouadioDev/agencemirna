"use client";

import * as React from "react";
import {
  Button as HeroButton,
  Modal,
} from "@heroui/react";
import { CalendarDays, CheckCircle2, Loader2, Send, X, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLead } from "@/src/actions/leads";

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
        className="w-full rounded-full h-12 bg-primary text-white font-bold tracking-wide hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
      >
        <CalendarDays className="h-5 w-5 mr-2" />
        Demander une visite
      </HeroButton>

      <Modal.Backdrop className="bg-secondary/40 backdrop-blur-md">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[550px] bg-white rounded-[2rem] overflow-hidden shadow-2xl p-0 flex flex-col max-h-[95vh] w-full">
            {/* Header personnalisé */}
            <div className="relative bg-[#FAF5EE] px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center border-b border-stone-200/60 flex-shrink-0">
              <Modal.CloseTrigger className="absolute top-4 right-4 h-8 w-8 bg-white text-stone-500 rounded-full hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-sm z-10 grid place-items-center">
                <X className="h-4 w-4" />
              </Modal.CloseTrigger>
              
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <CalendarDays className="h-6 w-6" />
              </div>
              <Modal.Heading className="font-agate text-3xl text-secondary leading-tight mb-2">
                Planifier une visite
              </Modal.Heading>
              {bienName && (
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest px-4 py-1.5 bg-white rounded-full inline-block border border-stone-200 shadow-sm mt-2">
                  {bienName}
                </p>
              )}
            </div>

            {done ? (
              <div className="p-8 sm:p-10 text-center overflow-y-auto">
                <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="font-agate text-3xl font-bold text-secondary mb-4">
                  Demande confirmée
                </h3>
                <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                  Merci ! Un conseiller de l'Agence Mirna va vous rappeler sous 24h ouvrées pour organiser la visite{date ? ` prévue le ${new Date(date).toLocaleDateString('fr-FR')}` : ""}.
                </p>
                {phone && (
                   <a
                     href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full rounded-full h-14 bg-[#25D366] text-white font-bold text-base hover:bg-[#20bd5a] transition-colors mb-3 flex items-center justify-center shadow-lg shadow-[#25D366]/20"
                   >
                     Échanger sur WhatsApp
                   </a>
                )}
                <HeroButton
                  onPress={() => setOpen(false)}
                  className="w-full rounded-full h-14 bg-stone-100 text-stone-700 font-bold text-base hover:bg-stone-200 transition-colors"
                >
                  Fermer
                </HeroButton>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-5">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
                      <div className="bg-red-200 text-red-700 rounded-full p-1 mt-0.5"><X className="h-3 w-3" /></div>
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Field label="Votre nom complet" required>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-stone-400" />
                        </div>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Aïcha Koné"
                          className="pl-11 h-14 rounded-2xl bg-stone-50 border-stone-200 focus-visible:ring-primary/30 focus-visible:border-primary transition-all text-base"
                          required
                        />
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Téléphone" required>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-stone-400" />
                          </div>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+225 00 00 00 00"
                            className="pl-11 h-14 rounded-2xl bg-stone-50 border-stone-200 focus-visible:ring-primary/30 focus-visible:border-primary transition-all text-base"
                            required
                          />
                        </div>
                      </Field>
                      <Field label="Email" optional>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-stone-400" />
                          </div>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@email.com"
                            className="pl-11 h-14 rounded-2xl bg-stone-50 border-stone-200 focus-visible:ring-primary/30 focus-visible:border-primary transition-all text-base"
                          />
                        </div>
                      </Field>
                    </div>

                    <Field label="Date souhaitée" optional>
                       <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="h-14 rounded-2xl bg-stone-50 border-stone-200 focus-visible:ring-primary/30 focus-visible:border-primary transition-all text-base px-4"
                      />
                    </Field>

                    <Field label="Votre message" optional>
                      <div className="relative">
                        <div className="absolute top-4 left-4 pointer-events-none">
                          <MessageSquare className="h-5 w-5 text-stone-400" />
                        </div>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Un créneau précis en tête ? Une question sur le bien ?"
                          rows={3}
                          className="pl-11 pt-4 rounded-2xl bg-stone-50 border-stone-200 focus-visible:ring-primary/30 focus-visible:border-primary transition-all text-base resize-none"
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-4 border-t border-stone-100 flex-shrink-0 bg-white flex flex-col-reverse sm:flex-row gap-3">
                  <HeroButton
                    onPress={() => setOpen(false)}
                    className="w-full sm:w-auto rounded-full h-14 px-8 bg-white border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-50 hover:border-stone-300 transition-all text-base"
                  >
                    Annuler
                  </HeroButton>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex-1 rounded-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/20 transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Send className="h-5 w-5 mr-2" />
                    )}
                    Confirmer la demande
                  </Button>
                </div>
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
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-secondary">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {optional && (
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Optionnel</span>
        )}
      </div>
      {children}
    </div>
  );
}
