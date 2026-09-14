"use client";

import React from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function PropertyLocationMap({ 
  latitude, 
  longitude, 
  name, 
  address 
}: { 
  latitude?: number | null, 
  longitude?: number | null, 
  name?: string | null, 
  address?: string | null 
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [infoOpen, setInfoOpen] = React.useState(true);

  // Les Hooks doivent précéder tout retour conditionnel : déclarés après le
  // garde « coordonnées absentes », leur nombre variait d'un rendu à l'autre
  // et React levait « Rendered fewer hooks than expected ».
  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(_map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!latitude || !longitude) {
    return (
      <div className="rounded-[24px] border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center h-[400px] flex flex-col justify-center items-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <MapPin className="h-6 w-6" />
        </div>
        <p className="text-base text-neutral-600 font-medium">Localisation exacte non définie pour ce bien.</p>
      </div>
    );
  }

  const center = {
    lat: latitude,
    lng: longitude,
  };

  if (!isLoaded) {
    return <div className="h-[400px] w-full bg-stone-100 animate-pulse rounded-[24px]" />;
  }

  return (
    <div className="relative w-full h-[400px] rounded-[24px] overflow-hidden border border-stone-200 shadow-sm z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={18} // "zoom bien le bien dans la maps" -> zoom 18 instead of 15
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        <Marker 
          position={center} 
          onClick={() => setInfoOpen(!infoOpen)}
        >
          {infoOpen && (
            <InfoWindow 
              position={center} 
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-1 max-w-[200px]">
                <div className="text-sm font-bold text-gray-900 mb-1">{name || "Ce bien"}</div>
                {address && <div className="text-xs text-gray-600 leading-tight">{address}</div>}
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>
    </div>
  );
}
