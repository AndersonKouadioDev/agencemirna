"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Home, Maximize2, Building2 } from "lucide-react";
import { GoogleMap, useJsApiLoader, OverlayViewF } from "@react-google-maps/api";
import { formatNumber } from "@/utils/formatNumber";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

const containerStyle = {
  width: "100%",
  height: "100%",
};

export function PropertiesMap({ biens }: { biens: any[] }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [hoveredBienId, setHoveredBienId] = React.useState<string | null>(null);
  const [activeMarker, setActiveMarker] = React.useState<string | null>(null);

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

  const { center } = React.useMemo(() => {
    if (geolocated.length === 0) {
      return { center: { lat: 5.36, lng: -4.0083 } };
    }
    if (geolocated.length === 1) {
      return { center: { lat: geolocated[0].latitude, lng: geolocated[0].longitude } };
    }
    const lats = geolocated.map((g) => g.latitude);
    const lngs = geolocated.map((g) => g.longitude);
    return {
      center: {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      }
    };
  }, [geolocated]);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    if (geolocated.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      geolocated.forEach(({ latitude, longitude }) => {
        bounds.extend({ lat: latitude, lng: longitude });
      });
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [geolocated]);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  if (geolocated.length === 0) {
    return (
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="rounded-[24px] border-2 border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="font-agate text-xl text-secondary mb-2">
            Aucun bien géolocalisé pour le moment
          </h2>
          <p className="text-sm text-neutral-600 max-w-md mx-auto">
            Pour afficher les biens sur la carte, l'administrateur doit renseigner les coordonnées GPS.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="w-full h-[600px] rounded-[24px] bg-stone-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-6">
      <div className="relative rounded-[24px] overflow-hidden border border-stone-200 shadow-sm">
        <div style={{ height: "600px", width: "100%" }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={geolocated.length === 1 ? 15 : 12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: "all",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#7c93a3" }, { lightness: "-10" }],
                },
                {
                  featureType: "administrative.country",
                  elementType: "geometry",
                  stylers: [{ visibility: "on" }],
                },
                {
                  featureType: "administrative.country",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#a0aab4" }],
                },
                {
                  featureType: "administrative.province",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#a0aab4" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry.fill",
                  stylers: [{ color: "#e3e8eb" }],
                },
                {
                  featureType: "landscape",
                  elementType: "geometry.fill",
                  stylers: [{ color: "#f5f7f8" }],
                },
                {
                  featureType: "poi",
                  elementType: "geometry.fill",
                  stylers: [{ color: "#e9edf0" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {geolocated.map((bien) => (
              <OverlayViewF
                key={bien.id}
                position={{ lat: bien.latitude, lng: bien.longitude }}
                mapPaneName={"overlayMouseTarget"}
              >
                <div
                  className="relative -translate-x-1/2 -translate-y-full cursor-pointer z-10 group"
                  onMouseEnter={() => setHoveredBienId(bien.id)}
                  onMouseLeave={() => setHoveredBienId(null)}
                  onClick={() => {
                    setActiveMarker(bien.id === activeMarker ? null : bien.id);
                    if (map) {
                      map.panTo({ lat: bien.latitude, lng: bien.longitude });
                    }
                  }}
                >
                  {/* Price Pill */}
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap shadow-lg border border-white/20 transition-all duration-300 origin-bottom",
                      hoveredBienId === bien.id || activeMarker === bien.id
                        ? "bg-secondary text-white scale-110 shadow-secondary/30"
                        : "bg-white text-secondary scale-100 hover:scale-105"
                    )}
                  >
                    {formatNumber(bien.prix || bien.prix_month)} FCFA
                    <div
                      className={cn(
                        "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] transition-colors duration-300",
                        hoveredBienId === bien.id || activeMarker === bien.id
                          ? "border-t-secondary"
                          : "border-t-white"
                      )}
                    />
                  </div>

                  {/* Hover/Click Card */}
                  <AnimatePresence>
                    {(hoveredBienId === bien.id || activeMarker === bien.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden",
                          activeMarker === bien.id ? "pointer-events-auto" : "pointer-events-none"
                        )}
                      >
                        <div className="relative h-32 w-full bg-stone-100">
                          {bien.image ? (
                            <Image
                              src={bien.image}
                              alt={bien.name || "Bien"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <Building2 className="w-8 h-8" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-secondary uppercase shadow-sm">
                            {bien.types_bien?.name || "Bien"}
                          </div>
                          
                          {/* Close button if active marker */}
                          {activeMarker === bien.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMarker(null);
                              }}
                              className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-1 rounded-full text-secondary shadow-sm hover:bg-stone-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-agate font-bold text-secondary text-base leading-tight mb-1 truncate">
                            {bien.name}
                          </h3>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 text-primary" />
                            {bien.ville_commune || "Abidjan"}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-primary font-bold text-sm">
                              {formatNumber(bien.prix || bien.prix_month)} FCFA
                            </div>
                            <Link
                              href={`/properties/${bien.id}`}
                              className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Voir <Maximize2 className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </OverlayViewF>
            ))}
          </GoogleMap>
        </div>

        <div className="absolute top-4 left-4 z-[10] rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-semibold text-secondary shadow-md inline-flex items-center gap-1.5">
          <Home className="h-3 w-3 text-primary" />
          {geolocated.length} bien{geolocated.length > 1 ? "s" : ""} sur la carte
        </div>
      </div>

      {geolocated.length < biens.length && (
        <p className="mt-3 text-xs text-neutral-500 text-center">
          {biens.length - geolocated.length} autre
          {biens.length - geolocated.length > 1 ? "s" : ""} bien
          {biens.length - geolocated.length > 1 ? "s" : ""} non géolocalisé
          {biens.length - geolocated.length > 1 ? "s" : ""}. Basculez en vue liste pour les voir.
        </p>
      )}
    </div>
  );
}
