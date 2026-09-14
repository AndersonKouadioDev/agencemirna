"use client";

import { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";

const libraries: ("places")[] = ["places"];

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  /** Identifiant du <input>, pour que l'étiquette du formulaire le vise. */
  id?: string;
}

export function AddressAutocomplete({ value, onChange, onPlaceSelected, placeholder, id }: AddressAutocompleteProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Les deux callbacks sont des fonctions inline du formulaire parent, donc
  // recréées à chaque frappe dans n'importe lequel de ses champs. En
  // dépendances de l'effet, elles instanciaient un widget Google Places de
  // plus par caractère tapé — autant d'écouteurs branchés sur le même <input>,
  // autant de conteneurs de suggestions empilés et de requêtes facturées. On
  // les lit à travers une référence : l'effet ne dépend plus que du script.
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onChange, onPlaceSelected]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "address_components", "url"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChangeRef.current(place.formatted_address);
      }
      onPlaceSelectedRef.current(place);
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
      // Google attache sa liste de suggestions au <body> et ne la retire
      // jamais : sans ce nettoyage, chaque démontage du formulaire laisse un
      // conteneur orphelin qui se superpose au suivant.
      document.querySelectorAll(".pac-container").forEach((el) => el.remove());
    };
  }, [isLoaded]);

  return (
    <Input
      id={id}
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Saisissez une adresse..."}
    />
  );
}
