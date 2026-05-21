"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Home, Maximize2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Leaflet utilise window/document : import dynamic avec ssr false
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
);

type BienOnMap = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  ville_commune: string | null;
  prix: number | null;
  prix_month: number | null;
  image: string | null;
  types_bien?: { name: string | null } | null;
  services_bien?: { name: string | null } | null;
};

/**
 * Vue carte des biens. Affiche tous les biens ayant lat/lng valides
 * sur une carte Leaflet + tuiles OpenStreetMap (gratuit, sans clé API).
 *
 * Centre par défaut : Abidjan (5.3600, -4.0083). Zoom auto pour englober
 * tous les marqueurs si plusieurs biens.
 *
 * Si aucun bien n'a de coordonnées, affiche un état vide avec instructions.
 */
export function PropertiesMap({ biens }: { biens: any[] }) {
  // Filtre les biens géolocalisés (lat ET lng requis et valides)
  const geolocated: BienOnMap[] = React.useMemo(() => {
    return biens
      .filter(
        (b: any) =>
          typeof b.latitude === "number" &&
          typeof b.longitude === "number" &&
          !Number.isNaN(b.latitude) &&
          !Number.isNaN(b.longitude),
      )
      .map((b: any) => ({
        id: b.id,
        name: b.name,
        latitude: b.latitude,
        longitude: b.longitude,
        ville_commune: b.ville_commune,
        prix: b.prix,
        prix_month: b.prix_month,
        image: b.image,
        types_bien: b.types_bien,
        services_bien: b.services_bien,
      }));
  }, [biens]);

  // Configuration icône Leaflet (fix bug par défaut avec bundlers)
  React.useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      // @ts-expect-error _getIconUrl manipulation interne
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  // Centre + zoom calculés depuis les biens géolocalisés
  const { center, bounds } = React.useMemo(() => {
    if (geolocated.length === 0) {
      // Abidjan par défaut
      return { center: [5.36, -4.0083] as [number, number], bounds: null };
    }
    if (geolocated.length === 1) {
      return {
        center: [geolocated[0].latitude, geolocated[0].longitude] as [
          number,
          number,
        ],
        bounds: null,
      };
    }
    // Bounds englobant
    const lats = geolocated.map((g) => g.latitude);
    const lngs = geolocated.map((g) => g.longitude);
    return {
      center: [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ] as [number, number],
      bounds: [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ] as [[number, number], [number, number]],
    };
  }, [geolocated]);

  if (geolocated.length === 0) {
    return (
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="font-agate text-xl text-secondary mb-2">
            Aucun bien géolocalisé pour le moment
          </h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Pour afficher les biens sur la carte, l&apos;administrateur doit
            renseigner les coordonnées GPS (latitude + longitude) depuis
            la fiche admin de chaque bien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-6">
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
        <MapContainer
          center={center}
          zoom={geolocated.length === 1 ? 15 : 12}
          bounds={bounds ?? undefined}
          scrollWheelZoom={true}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geolocated.map((bien) => (
            <Marker
              key={bien.id}
              position={[bien.latitude, bien.longitude]}
            >
              <Popup>
                <div className="w-56">
                  {bien.image && (
                    <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden bg-stone-100">
                      <Image
                        src={bien.image}
                        alt={bien.name ?? ""}
                        fill
                        sizes="224px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-agate text-base font-bold text-secondary leading-tight mb-1">
                    {bien.name ?? "Bien"}
                  </h3>
                  {bien.ville_commune && (
                    <div className="text-xs text-neutral-500 inline-flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {bien.ville_commune}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] mb-2">
                    {bien.types_bien?.name && (
                      <span className="rounded-full bg-secondary/10 text-secondary px-2 py-0.5 font-semibold">
                        {bien.types_bien.name}
                      </span>
                    )}
                    {bien.services_bien?.name && (
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">
                        {bien.services_bien.name}
                      </span>
                    )}
                  </div>
                  {(bien.prix ?? bien.prix_month) && (
                    <div className="text-sm font-bold text-secondary mb-2">
                      {(bien.prix ?? bien.prix_month ?? 0).toLocaleString(
                        "fr-FR",
                      )}{" "}
                      FCFA
                      <span className="text-xs font-normal text-neutral-500">
                        {bien.prix ? " /nuit" : " /mois"}
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/properties/${bien.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Voir la fiche <Maximize2 className="h-3 w-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Compteur de biens visibles */}
        <div className="absolute top-4 left-4 z-[1000] rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-semibold text-secondary shadow-md inline-flex items-center gap-1.5">
          <Home className="h-3 w-3 text-primary" />
          {geolocated.length} bien{geolocated.length > 1 ? "s" : ""} sur la
          carte
        </div>
      </div>

      {/* Info biens non géolocalisés */}
      {geolocated.length < biens.length && (
        <p className="mt-3 text-xs text-neutral-500 text-center">
          {biens.length - geolocated.length} autre
          {biens.length - geolocated.length > 1 ? "s" : ""} bien
          {biens.length - geolocated.length > 1 ? "s" : ""} non géolocalisé
          {biens.length - geolocated.length > 1 ? "s" : ""}. Basculez en vue
          liste pour les voir.
        </p>
      )}
    </div>
  );
}
