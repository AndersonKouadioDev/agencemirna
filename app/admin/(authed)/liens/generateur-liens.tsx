"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Copy, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CANAUX, construireLienSuivi, slugCampagne } from "@/src/lib/liens-suivis";

type Destination = { chemin: string; libelle: string; bienId: string | null };

async function copier(texte: string) {
  try {
    await navigator.clipboard.writeText(texte);
    toast.success("Lien copié.");
  } catch {
    toast.error("Copie impossible : sélectionnez le lien à la main.");
  }
}

export function GenerateurLiens({ destinations }: { destinations: Destination[] }) {
  const [chemin, setChemin] = React.useState(destinations[0]?.chemin ?? "/");
  const [cleCanal, setCleCanal] = React.useState(CANAUX[0].cle);
  const [campagneSaisie, setCampagneSaisie] = React.useState("");
  const [qr, setQr] = React.useState<string | null>(null);

  const destination = destinations.find((d) => d.chemin === chemin) ?? destinations[0];
  const canal = CANAUX.find((c) => c.cle === cleCanal) ?? CANAUX[0];
  // Par défaut : le nom du bien pour une fiche, sinon le nom du canal.
  const campagneParDefaut = destination?.bienId
    ? slugCampagne(destination.libelle.replace(/^Bien : /, ""))
    : canal.cle;
  const campagne = slugCampagne(campagneSaisie) || campagneParDefaut;
  const lien = construireLienSuivi(chemin, canal, campagne);

  React.useEffect(() => {
    let actif = true;
    QRCode.toDataURL(lien, {
      margin: 1,
      width: 720,
      errorCorrectionLevel: "M",
      color: { dark: "#1f1208", light: "#ffffff" },
    })
      .then((png) => {
        if (actif) setQr(png);
      })
      .catch(() => {
        if (actif) setQr(null);
      });
    return () => {
      actif = false;
    };
  }, [lien]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-secondary">Créer un lien</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lien-destination">Page de destination</Label>
              <select
                id="lien-destination"
                value={chemin}
                onChange={(e) => setChemin(e.target.value)}
                className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm"
              >
                {destinations.map((d) => (
                  <option key={d.chemin} value={d.chemin}>
                    {d.libelle}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lien-canal">Canal</Label>
              <select
                id="lien-canal"
                value={cleCanal}
                onChange={(e) => setCleCanal(e.target.value)}
                className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm"
              >
                {CANAUX.map((c) => (
                  <option key={c.cle} value={c.cle}>
                    {c.libelle}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">{canal.usage}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lien-campagne">Nom de la campagne (facultatif)</Label>
            <Input
              id="lien-campagne"
              value={campagneSaisie}
              onChange={(e) => setCampagneSaisie(e.target.value)}
              placeholder={campagneParDefaut}
              className="h-11"
            />
            <p className="text-xs text-neutral-500">
              Pour distinguer deux opérations sur un même canal, par exemple « fetes-2026 ».
            </p>
          </div>

          <div className="rounded-xl bg-stone-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Lien à utiliser
            </p>
            <p className="break-all font-mono text-sm text-secondary">{lien}</p>
            <Button className="mt-3" onClick={() => void copier(lien)}>
              <Copy className="h-4 w-4" />
              Copier le lien
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-secondary">Liens du site, par canal</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Prêts à coller. Ils mènent à la page d&apos;accueil.
          </p>
          <ul className="mt-4 divide-y divide-stone-100">
            {CANAUX.map((c) => {
              const url = construireLienSuivi("/", c, c.cle);
              return (
                <li key={c.cle} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-secondary">{c.libelle}</p>
                    <p className="text-xs text-neutral-500">{c.usage}</p>
                    <p className="mt-1 break-all font-mono text-xs text-neutral-600">{url}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void copier(url)}>
                    <Copy className="h-3.5 w-3.5" />
                    Copier
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-stone-200 bg-white p-5 text-center">
        <h2 className="text-lg font-bold text-secondary">QR code</h2>
        <div className="mx-auto flex aspect-square w-full max-w-60 items-center justify-center rounded-xl bg-stone-50">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element -- image générée dans le navigateur
            <img src={qr} alt={`QR code vers ${lien}`} className="h-full w-full rounded-xl" />
          )}
        </div>
        <p className="text-xs text-neutral-500">
          Il contient le lien ci-contre. Changez la destination ou le canal : il se met à jour.
        </p>
        {qr && (
          <Button asChild variant="outline" className="w-full">
            <a href={qr} download={`qr-${campagne}-${canal.cle}.png`}>
              <Download className="h-4 w-4" />
              Télécharger (PNG)
            </a>
          </Button>
        )}
        {destination?.bienId && (
          <Button asChild className="w-full">
            <Link href={`/admin/liens/affiche/${destination.bienId}`}>
              <Printer className="h-4 w-4" />
              Affiche du logement
            </Link>
          </Button>
        )}
      </aside>
    </div>
  );
}
