
"use client";

import { useState } from "react";
import { Save, Loader2, Phone, Mail, Instagram, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteSettingsRow, SiteSettingsFormData, upsertSiteSettings } from "@/src/actions/admin/settings";
import { useRouter } from "next/navigation";

export function SettingsForm({ settings }: { settings: SiteSettingsRow | null }) {
  const [formData, setFormData] = useState<SiteSettingsFormData>({
    phone: settings?.phone || "",
    whatsapp: settings?.whatsapp || "",
    email: settings?.email || "",
    facebook: settings?.facebook || "",
    instagram: settings?.instagram || "",
    linkedin: settings?.linkedin || "",
  });

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
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
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
          Paramètres enregistrés avec succès.
        </div>
      )}

      {/* Coordonnées */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-secondary">Coordonnées de contact</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-stone-400" />
              Numéro de téléphone
            </Label>
            <Input 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              placeholder="+225 00 00 00 00 00" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              Numéro WhatsApp
            </Label>
            <Input 
              value={formData.whatsapp} 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
              placeholder="+225 00 00 00 00 00" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-stone-400" />
              Adresse Email
            </Label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="contact@agencemirna.com" 
            />
          </div>
        </div>
      </div>

      {/* Réseaux Sociaux */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-secondary">Réseaux Sociaux (Liens complets)</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Label>
            <Input 
              type="url"
              value={formData.facebook} 
              onChange={e => setFormData({...formData, facebook: e.target.value})} 
              placeholder="https://facebook.com/agencemirna" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Label>
            <Input 
              type="url"
              value={formData.instagram} 
              onChange={e => setFormData({...formData, instagram: e.target.value})} 
              placeholder="https://instagram.com/agencemirna" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              LinkedIn
            </Label>
            <Input 
              type="url"
              value={formData.linkedin} 
              onChange={e => setFormData({...formData, linkedin: e.target.value})} 
              placeholder="https://linkedin.com/company/agencemirna" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer les paramètres
        </Button>
      </div>
    </form>
  );
}
