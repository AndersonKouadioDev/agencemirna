"use client";

import { useId, useState, type ComponentType } from "react";
import {
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Music2,
  Phone,
  Save,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type SiteSettingsFormData,
  type SiteSettingsRow,
  upsertSiteSettings,
} from "@/src/actions/admin/settings";
import { useRouter } from "next/navigation";

/**
 * Un champ du formulaire, décrit par ses données plutôt qu'écrit à la main.
 *
 * Le formulaire recopiait dix-huit lignes de JSX par champ ; en ajouter sept
 * (migration 0026) l'aurait porté à plus de trois cents lignes de quasi-copies,
 * où la prochaine correction d'accessibilité aurait dû être faite treize fois.
 */
type Champ = {
  cle: keyof SiteSettingsFormData;
  libelle: string;
  Icone: ComponentType<{ className?: string }>;
  couleur?: string;
  type?: "text" | "email" | "url" | "tel";
  placeholder?: string;
  aide?: string;
  multiligne?: boolean;
};

const COORDONNEES: Champ[] = [
  { cle: "phone", libelle: "Numéro de téléphone", Icone: Phone, type: "tel", placeholder: "+225 01 43 483 131" },
  {
    cle: "phone_secondaire",
    libelle: "Second numéro (facultatif)",
    Icone: Phone,
    type: "tel",
    placeholder: "+225 07 00 00 00 00",
    aide: "Affiché à côté du principal partout où le site liste les numéros.",
  },
  { cle: "whatsapp", libelle: "Numéro WhatsApp", Icone: MessageCircle, couleur: "text-green-500", type: "tel", placeholder: "2250143483131" },
  {
    cle: "whatsapp_message",
    libelle: "Message WhatsApp pré-rempli",
    Icone: MessageSquareText,
    couleur: "text-green-500",
    placeholder: "Bonjour, je souhaite des informations sur un bien.",
    aide: "Le texte qui s'ouvre déjà écrit quand un visiteur clique « Contacter sur WhatsApp ».",
    multiligne: true,
  },
  { cle: "email", libelle: "Adresse e-mail", Icone: Mail, type: "email", placeholder: "info@agencemirna.com", aide: "Les notifications de leads y sont envoyées." },
  {
    cle: "adresse",
    libelle: "Adresse de l'agence",
    Icone: MapPin,
    placeholder: "Cocody Riviera, Abidjan",
    aide: "Affichée au pied de page et sur la page contact.",
    multiligne: true,
  },
  {
    cle: "horaires",
    libelle: "Horaires d'ouverture",
    Icone: Clock,
    placeholder: "Lun–Ven 8h–18h, Sam 9h–13h",
    aide: "Le pied de page annonçait « 24/7 » en dur.",
  },
];

const RESEAUX: Champ[] = [
  { cle: "facebook", libelle: "Facebook", Icone: Facebook, couleur: "text-blue-600", type: "url", placeholder: "https://facebook.com/agencemirna" },
  { cle: "instagram", libelle: "Instagram", Icone: Instagram, couleur: "text-pink-600", type: "url", placeholder: "https://instagram.com/agencemirna" },
  { cle: "tiktok", libelle: "TikTok", Icone: Music2, couleur: "text-neutral-900", type: "url", placeholder: "https://tiktok.com/@agencemirna" },
  { cle: "youtube", libelle: "YouTube", Icone: Youtube, couleur: "text-red-600", type: "url", placeholder: "https://youtube.com/@agencemirna" },
  { cle: "linkedin", libelle: "LinkedIn", Icone: Linkedin, couleur: "text-blue-700", type: "url", placeholder: "https://linkedin.com/company/agencemirna" },
  { cle: "twitter", libelle: "X (Twitter)", Icone: Twitter, couleur: "text-neutral-900", type: "url", placeholder: "https://x.com/agencemirna" },
];

export function SettingsForm({ settings }: { settings: SiteSettingsRow | null }) {
  const [formData, setFormData] = useState<SiteSettingsFormData>({
    phone: settings?.phone ?? "",
    phone_secondaire: settings?.phone_secondaire ?? "",
    whatsapp: settings?.whatsapp ?? "",
    whatsapp_message: settings?.whatsapp_message ?? "",
    email: settings?.email ?? "",
    adresse: settings?.adresse ?? "",
    horaires: settings?.horaires ?? "",
    facebook: settings?.facebook ?? "",
    instagram: settings?.instagram ?? "",
    linkedin: settings?.linkedin ?? "",
    tiktok: settings?.tiktok ?? "",
    youtube: settings?.youtube ?? "",
    twitter: settings?.twitter ?? "",
  });

  // Les libellés n'avaient aucun `htmlFor` : les cliquer ne focalisait rien et
  // un lecteur d'écran annonçait des champs sans nom. Un préfixe unique suffit,
  // les suffixes distinguant les champs.
  const idChamp = useId();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const result = await upsertSiteSettings(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  function rendreChamp(champ: Champ) {
    const id = `${idChamp}-${champ.cle}`;
    const valeur = formData[champ.cle] ?? "";
    const poser = (v: string) => setFormData((d) => ({ ...d, [champ.cle]: v }));
    const { Icone } = champ;
    return (
      <div key={champ.cle} className="space-y-1.5">
        <Label htmlFor={id} className="flex items-center gap-2">
          <Icone className={`h-4 w-4 ${champ.couleur ?? "text-stone-400"}`} />
          {champ.libelle}
        </Label>
        {champ.multiligne ? (
          <Textarea id={id} rows={2} value={valeur} onChange={(e) => poser(e.target.value)} placeholder={champ.placeholder} />
        ) : (
          <Input id={id} type={champ.type ?? "text"} value={valeur} onChange={(e) => poser(e.target.value)} placeholder={champ.placeholder} />
        )}
        {champ.aide && <p className="text-[11px] text-neutral-500">{champ.aide}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Paramètres enregistrés. Le site les affiche dès maintenant.
        </div>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-secondary">Coordonnées de contact</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Reprises sur tout le site : pied de page, fiches de biens, bandeau, liens WhatsApp, page contact.
          </p>
        </div>
        <div className="p-6 space-y-5">{COORDONNEES.map(rendreChamp)}</div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-secondary">Réseaux sociaux</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Liens complets, « https:// » inclus. Un champ vide retire l&apos;icône du pied de page.
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">{RESEAUX.map(rendreChamp)}</div>
      </section>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer les paramètres
        </Button>
      </div>
    </form>
  );
}
