"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  X,
  MapPin,
  Building2,
  Briefcase
} from "lucide-react";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import HeroSearchBar from "./hero-search-bar";
import { GoogleMap, useJsApiLoader, Marker, OverlayViewF } from "@react-google-maps/api";
import { getAllBiens, getBienWithImages } from "@/src/actions/bien.actions";
import { formatNumber } from "@/utils/formatNumber";
import { ABIDJAN_LOCATIONS } from "@/lib/constants/properties";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 5.359951,
  lng: -4.008256, // Abidjan center
};

function HeroMap({ biens, selectedBien, onSelectBien }: { biens: any[], selectedBien: any | null, onSelectBien: (b: any) => void }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapRef = React.useRef<google.maps.Map | null>(null);
  const [hoveredBienId, setHoveredBienId] = React.useState<string | null>(null);

  const geolocated = React.useMemo(() => {
    return biens.filter((b) => typeof b.latitude === "number" && typeof b.longitude === "number");
  }, [biens]);

  // Center based on biens or fallback to Abidjan
  const mapCenter = React.useMemo(() => {
    if (geolocated.length === 0) return center;
    if (geolocated.length === 1) return { lat: geolocated[0].latitude, lng: geolocated[0].longitude };
    const lats = geolocated.map(b => b.latitude);
    const lngs = geolocated.map(b => b.longitude);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    };
  }, [geolocated]);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    if (geolocated.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      geolocated.forEach((b) => {
        bounds.extend({ lat: b.latitude, lng: b.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [geolocated]);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);

  React.useEffect(() => {
    if (selectedBien && mapRef.current) {
      const lat = parseFloat(selectedBien.latitude);
      const lng = parseFloat(selectedBien.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
      }
    }
  }, [selectedBien]);

  const handleMarkerClick = (b: any) => {
    if (mapRef.current) {
      const lat = parseFloat(b.latitude);
      const lng = parseFloat(b.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
      }
      setHoveredBienId(b.id);
    }
    onSelectBien(b);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-200 animate-pulse">
        <MapPin className="h-10 w-10 text-stone-300" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#7c93a3"},{"lightness": "-10"}]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [{"visibility": "on"}]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#a0aab4"}]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#a0aab4"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#e3e8eb"}]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#f5f7f8"}]
  },
  {
    "featureType": "poi",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#e9edf0"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#e6eaf0"}]
  },
  {
    "featureType": "transit",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
  }
],
        tilt: 45, // enables 3D buildings if mapID is present and supported
      }}
    >
      {geolocated.map((b) => (
        <OverlayViewF
          key={b.id}
          position={{ lat: b.latitude, lng: b.longitude }}
          mapPaneName={"overlayMouseTarget"}
        >
          <div 
            className="relative -translate-x-1/2 -translate-y-full cursor-pointer z-10 group"
            onMouseEnter={() => setHoveredBienId(b.id)}
            onMouseLeave={() => setHoveredBienId(null)}
            onClick={() => handleMarkerClick(b)}
          >
            {/* Price Pill */}
            <div className={cn(
              "px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap shadow-lg border border-white/20 transition-all duration-300 origin-bottom",
              hoveredBienId === b.id 
                ? "bg-secondary text-white scale-110 shadow-secondary/30" 
                : "bg-white text-secondary scale-100 hover:scale-105"
            )}>
              {formatNumber(b.prix || b.prix_month)} FCFA
              <div className={cn(
                "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] transition-colors duration-300",
                hoveredBienId === b.id ? "border-t-secondary" : "border-t-white"
              )} />
            </div>

            {/* Hover Card */}
            <AnimatePresence>
              {hoveredBienId === b.id && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden pointer-events-none"
                >
                  <div className="relative h-32 w-full bg-stone-100">
                    {b.image ? (
                      <Image src={b.image} alt={b.name || "Bien"} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {b.services_bien?.name && (
                         <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur text-[10px] font-bold text-primary shadow-sm">
                           {b.services_bien.name}
                         </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-secondary truncate">{b.name}</h3>
                    <div className="flex items-center text-xs text-neutral-500 mt-1 truncate">
                      <MapPin className="w-3 h-3 mr-1" />
                      {b.ville_commune}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </OverlayViewF>
      ))}
    </GoogleMap>
  );
}
const HERO_SLIDES = [
  {
    id: "slide-1",
    badge: "AGENCE IMMOBILIÈRE PREMIUM",
    title1: "Des biens d'exception.",
    title2: "Rien que pour vous.",
    desc: "Studios meublés, villas, appartements et gestion locative. Découvrez l'immobilier premium à Abidjan avec un accompagnement sur mesure.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "slide-2",
    badge: "NOUVEAUX DÉVELOPPEMENTS",
    title1: "Votre nouveau cadre",
    title2: "de vie prestigieux.",
    desc: "Des appartements de très haut standing offrant des vues panoramiques sur la lagune et des prestations inégalées pour un confort absolu.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: "slide-3",
    badge: "EXPERTISE & SÉRÉNITÉ",
    title1: "L'excellence dans",
    title2: "la gestion locative.",
    desc: "Rentabilisez votre patrimoine en toute sérénité. Nos experts s'occupent de tout, de la recherche de locataires jusqu'à l'entretien complet.",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000",
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [biens, setBiens] = React.useState<any[]>([]);
  const [filteredBiens, setFilteredBiens] = React.useState<any[]>([]);
  const [isLoadingBiens, setIsLoadingBiens] = React.useState(false);
  const [selectedBien, setSelectedBien] = React.useState<any | null>(null);
  const [selectedBienImages, setSelectedBienImages] = React.useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [lastSearchParams, setLastSearchParams] = React.useState<{loc: string | null, type: string | null, service: string | null}>({ loc: null, type: null, service: null });

  React.useEffect(() => {
    if (selectedBien) {
      setSelectedBienImages([selectedBien.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"]);
      setCurrentImageIndex(0);
      getBienWithImages(selectedBien.id).then(fullBien => {
        if (fullBien && fullBien.images && fullBien.images.length > 0) {
          setSelectedBienImages(fullBien.images);
        }
      });
    }
  }, [selectedBien]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % selectedBienImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + selectedBienImages.length) % selectedBienImages.length);
  };

  React.useEffect(() => {
    if (isSearchModalOpen && biens.length === 0) {
      setIsLoadingBiens(true);
      getAllBiens().then(data => {
        setBiens(data);
        setFilteredBiens(data);
        setIsLoadingBiens(false);
      });
    }
  }, [isSearchModalOpen]);

  // Auto-play du carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Prevent scroll when modal is open
  React.useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchModalOpen]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <>
      <section
        id="hero"
        className="relative min-h-[90vh] flex flex-col justify-between bg-stone-900 overflow-hidden"
      >
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt="Propriété"
                fill
                className="object-cover"
                priority
              />
              {/* Overlays : Assombrir l'image pour lire le texte blanc */}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 pt-40 pb-32 flex-1 flex flex-col justify-center">
          <div className="max-w-4xl xl:max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Badge style Pomaii */}
                <div className="inline-flex items-center gap-2 mb-6">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                    {slide.badge}
                  </span>
                </div>

                {/* Grand Titre */}
                <h1 className="font-agate text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-white mb-6 w-full max-w-full">
                  <span className="block">{slide.title1}</span>
                  <span className="block text-primary">{slide.title2}</span>
                </h1>
                
                {/* Description */}
                <p className="max-w-xl text-lg sm:text-xl leading-relaxed text-white/80 font-medium mb-10">
                  {slide.desc}
                </p>

                {/* CTA */}
                <Link
                  href="/properties"
                  className={cn(
                    buttonVariants(),
                    "h-14 px-8 text-lg rounded-full font-bold shadow-xl shadow-primary/20",
                  )}
                >
                  Explorer les biens
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Controls (Modern Dots) */}
        <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 bottom-[100px] md:bottom-[150px] lg:right-16 lg:bottom-40 z-20 flex gap-2.5 items-center bg-black/20 backdrop-blur-md px-4 py-3 rounded-full shadow-lg">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "rounded-full transition-all duration-500 ease-out",
                currentSlide === idx
                  ? "bg-primary w-10 h-2.5"
                  : "bg-white/50 hover:bg-white/90 w-2.5 h-2.5"
              )}
              aria-label={`Aller à la slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom Curve (SVG Wave) */}
        <div className="relative z-10 w-full leading-[0] transform translate-y-[1px]">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-[60px] md:h-[120px]"
          >
            <path
              d="M0 120H1440V0C1440 0 1080 120 720 120C360 120 0 0 0 0V120Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Floating Search Pill Trigger */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-4xl">
          
          {/* Mobile view: Compact pill */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden w-full bg-white rounded-full p-3 flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.1)] border border-stone-100 active:scale-[0.98] transition-transform"
          >
            <div className="bg-primary/10 text-primary p-2.5 rounded-full shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-secondary text-[15px]">Où cherchez-vous ?</span>
              <span className="text-xs text-stone-400 font-medium">Localisation • Type • Projet</span>
            </div>
          </button>

          {/* Desktop view: Detailed bar */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden md:flex w-full bg-white rounded-full p-3 items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-stone-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all group"
          >
            <div className="flex-1 grid grid-cols-3 gap-0 w-full px-6 py-0 divide-x divide-stone-100">
              <div className="flex flex-col items-start justify-center pr-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Localisation</span>
                <div className="flex items-center gap-2 text-stone-500 group-hover:text-secondary transition-colors">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-sm">Toute la ville</span>
                </div>
              </div>

              <div className="flex flex-col items-start justify-center px-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Type</span>
                <div className="flex items-center gap-2 text-stone-500 group-hover:text-secondary transition-colors">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Tous les types</span>
                </div>
              </div>

              <div className="flex flex-col items-start justify-center pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Service</span>
                <div className="flex items-center gap-2 text-stone-500 group-hover:text-secondary transition-colors">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium text-sm">Tous les services</span>
                </div>
              </div>
            </div>

            <div className="bg-primary text-secondary px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shrink-0">
              <Search className="h-5 w-5" />
              Rechercher
            </div>
          </button>
        </div>
      </section>

      {/* Full Screen Search Modal (Airbnb Style) */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full h-full max-w-[1800px] rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col"
            >
              {/* Modal Header & Filters */}
              <div className="border-b border-stone-100 bg-white relative z-20">
                <div className="flex items-center justify-between p-6 md:px-10 md:py-6">
                  <div>
                    <h2 className="text-2xl font-bold font-agate text-secondary">
                      Trouvez votre bien idéal
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                      Affinez votre recherche et découvrez nos pépites.
                    </p>
                  </div>
                  <button
                    onClick={() => { setIsSearchModalOpen(false); setHasSearched(false); }}
                    className="h-12 w-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="px-6 md:px-10 pb-6">
                  {/* Search Bar intercepting search to show local results */}
                  {!selectedBien && (
                    hasSearched ? (
                      <div className="flex justify-center mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <button
                          onClick={() => setHasSearched(false)}
                          className="w-full max-w-2xl bg-white rounded-full p-2.5 flex items-center justify-between shadow-lg border border-stone-200 hover:shadow-xl transition-all"
                        >
                          <div className="flex items-center gap-4 pl-2 overflow-hidden">
                            <div className="bg-primary/10 text-primary p-2.5 rounded-full shrink-0">
                              <Search className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col items-start truncate">
                              <span className="font-bold text-stone-700 text-[14px] truncate">
                                {lastSearchParams.loc && lastSearchParams.loc !== "toute la ville" ? lastSearchParams.loc : "Toute la ville"}
                              </span>
                              <span className="text-xs text-stone-400 font-medium truncate">
                                {lastSearchParams.type || "Tous les types"} • {lastSearchParams.service ? lastSearchParams.service.replace("_", " ") : "Tous les projets"}
                              </span>
                            </div>
                          </div>
                          <div className="pr-4 text-xs font-bold text-primary shrink-0">Modifier</div>
                        </button>
                      </div>
                    ) : (
                      <HeroSearchBar onSearch={(params) => {
                         const locVal = params.get("location");
                         const typeVal = params.get("type");
                         const serviceVal = params.get("service");
                         
                         setLastSearchParams({ loc: locVal, type: typeVal, service: serviceVal });
                         setHasSearched(true);

                     // Normalize string helper
                     const normalize = (str: string | undefined | null) => 
                       (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                     const loc = normalize(locVal);
                     const typeStr = normalize(typeVal);
                     const serviceStr = normalize(serviceVal).replace("_", " ");

                     const filtered = biens.filter(b => {
                        let match = true;
                        
                        if (loc && locVal !== "toute la ville") {
                           const locObj = ABIDJAN_LOCATIONS.find(l => l.value === locVal);
                           const locLabel = locObj ? locObj.label.replace(" (toute la commune)", "") : locVal;
                           const searchLoc = normalize(locLabel);
                           
                           const ville = normalize(b.ville_commune);
                           const adresse = normalize(b.address);
                           match = match && (ville.includes(searchLoc) || adresse.includes(searchLoc) || searchLoc.includes(ville));
                        }
                        
                        if (typeStr) {
                           const dbType = normalize(b.types_bien?.name);
                           match = match && dbType.includes(typeStr);
                        }
                        
                        if (serviceStr) {
                           const dbService = normalize(b.services_bien?.name);
                           match = match && dbService.includes(serviceStr);
                        }
                        
                        return match;
                     });

                     setFilteredBiens(filtered);
                     setSelectedBien(null);
                     // setActiveSearchStep removed

                     const resultsGrid = document.getElementById("mock-results-grid");
                     const emptyState = document.getElementById("mock-empty-state");
                     if (resultsGrid && emptyState) {
                       emptyState.style.display = "none";
                       resultsGrid.style.display = "block";
                     }
                  }} />
                    )
                  )}
                  
                </div>
              </div>

              {/* Modal Body with Results (Airbnb Style) */}
              <div className="flex-1 bg-stone-50 overflow-hidden flex flex-col lg:flex-row">
                 {/* Properties Grid */}
                 <div className="flex-1 h-full overflow-y-auto p-6 md:p-10 scrollbar-hide">
                    <div id="mock-empty-state" className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-4">
                      <Search className="h-12 w-12 opacity-20" />
                      <p className="text-lg font-medium">Sélectionnez vos critères et lancez la recherche</p>
                    </div>

                    <div id="mock-results-grid" style={{ display: "none" }} className="pb-32">
                    {/* Selected Bien Detail View */}
                    {selectedBien ? (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <button 
                          onClick={() => { setSelectedBien(null); }}
                          className="mb-6 flex items-center gap-2 text-stone-500 hover:text-primary transition-colors text-sm font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                          Retour aux résultats
                        </button>
                        
                        <div className="flex flex-col gap-0 pb-40 relative">
                          {/* Carousel Section */}
                          <div className="w-full aspect-[4/3] max-h-[500px] rounded-3xl relative overflow-hidden group mb-8 shadow-sm">
                            <AnimatePresence initial={false}>
                              <motion.img
                                key={currentImageIndex}
                                src={selectedBienImages[currentImageIndex] || selectedBien.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"}
                                alt={selectedBien.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full object-cover absolute inset-0"
                              />
                            </AnimatePresence>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                            
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-secondary uppercase shadow-sm tracking-wider z-10">
                              {selectedBien.services_bien?.name ?? "Service"}
                            </div>
                            
                            {/* Carousel Controls */}
                            {selectedBienImages.length > 1 && (
                              <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-secondary flex items-center justify-center hover:bg-white transition-colors z-10 shadow-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-secondary flex items-center justify-center hover:bg-white transition-colors z-10 shadow-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </button>
                                
                                <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex items-center gap-2 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                                  <span className="text-white text-xs font-medium">{currentImageIndex + 1} / {selectedBienImages.length}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Flat Details Section */}
                          <div className="px-2">
                            {/* Header & Price */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
                              <div className="flex-1">
                                <div className="text-primary font-bold text-xs mb-2 tracking-widest uppercase">{selectedBien.types_bien?.name ?? "Bien"}</div>
                                <h2 className="text-3xl font-bold text-secondary font-agate leading-tight mb-3">
                                  {selectedBien.name}
                                </h2>
                                <p className="text-stone-500 flex items-center gap-2 font-medium">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  {selectedBien.ville_commune ? `${selectedBien.ville_commune}, ${selectedBien.pays ?? ""}` : (selectedBien.address || "Abidjan, CI")}
                                </p>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-xs text-stone-500 font-bold mb-1 uppercase tracking-wider">Prix</div>
                                <div className="text-2xl font-black text-primary">
                                  {selectedBien.prix != null ? formatNumber(selectedBien.prix) + " FCFA" : (selectedBien.prix_month != null ? formatNumber(selectedBien.prix_month) + " FCFA" : "Sur demande")}
                                </div>
                                <div className="text-xs text-stone-400 mt-1 font-medium">{selectedBien.prix ? "Total" : "/ mois"}</div>
                              </div>
                            </div>
                            
                            {/* Features Row (No border cards) */}
                            <div className="flex flex-wrap items-center gap-6 mb-10 pb-10 border-b border-stone-200">
                              {selectedBien.chambre && (
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                                  </div>
                                  <div>
                                    <div className="text-lg font-black text-secondary leading-none">{selectedBien.chambre}</div>
                                    <div className="text-xs font-medium text-stone-500 uppercase">Chambres</div>
                                  </div>
                                </div>
                              )}
                              
                              {selectedBien.salon && (
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                                  </div>
                                  <div>
                                    <div className="text-lg font-black text-secondary leading-none">{selectedBien.salon}</div>
                                    <div className="text-xs font-medium text-stone-500 uppercase">Salons</div>
                                  </div>
                                </div>
                              )}
                              
                              {selectedBien.salle_bains && (
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v4"/><path d="M14 2v4"/><path d="M18 2v4"/><path d="M7 10h10"/><path d="M9 22v-4h6v4"/><path d="M5 10h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z"/></svg>
                                  </div>
                                  <div>
                                    <div className="text-lg font-black text-secondary leading-none">{selectedBien.salle_bains}</div>
                                    <div className="text-xs font-medium text-stone-500 uppercase">Salles d'eau</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Description */}
                            <div className="mb-12">
                              <h3 className="font-bold text-secondary text-xl mb-4">À propos de ce bien</h3>
                              <p className="text-stone-600 leading-relaxed text-lg">
                                {selectedBien.short_description || selectedBien.description || "Aucune description détaillée n'est disponible pour ce bien d'exception pour le moment. Veuillez nous contacter pour plus d'informations."}
                              </p>
                            </div>
                          </div>
                          
                          {/* Actions Section */}
                          <div className="bg-white/90 backdrop-blur-md pt-4 pb-2 sticky bottom-0 z-10 mt-auto border-t border-stone-100/50">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <Link 
                                href={`/properties/${selectedBien.id}`} 
                                className="w-full sm:flex-1 bg-secondary text-white py-4 px-6 rounded-2xl font-bold text-center hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/40 flex items-center justify-center gap-2 group"
                              >
                                Découvrir ce bien
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                              </Link>
                              <a 
                                href={process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto bg-[#25D366] text-white py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                Contacter
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold font-agate text-secondary">Biens correspondants</h3>
                        {!isLoadingBiens && <span className="text-sm font-semibold bg-stone-200 text-stone-600 px-3 py-1 rounded-full whitespace-nowrap shrink-0 ml-2">{filteredBiens.length} pépite(s)</span>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                        {/* REAL DATA FROM DB */}
                        {isLoadingBiens ? (
                          <div className="col-span-full flex flex-col items-center justify-center p-10 text-stone-400">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p>Chargement des biens...</p>
                          </div>
                        ) : filteredBiens.length === 0 ? (
                          <div className="col-span-full text-center p-10 text-stone-500">
                            Aucun bien ne correspond à vos critères.
                          </div>
                        ) : (
                          filteredBiens.slice(0, 12).map((bien) => {
                            const typeName = bien.types_bien?.name ?? "Bien";
                            const serviceName = bien.services_bien?.name ?? "Service";
                            const pieces = (bien.types_bien?.id ?? 0) > 1 ? `${(bien.chambre ?? 0) + (bien.salon ?? 0)} pièces` : "";
                            const imageUrl = bien.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop";
                            const priceText = bien.prix != null ? formatNumber(bien.prix) + " FCFA" : (bien.prix_month != null ? formatNumber(bien.prix_month) + " FCFA / mois" : "Prix sur demande");

                            return (
                              <div key={bien.id} onClick={() => setSelectedBien(bien)}>
                                <div className="bg-white rounded-[2rem] p-3 shadow-md border border-stone-100 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full">
                                  <div className="w-full h-48 md:h-56 bg-stone-200 rounded-3xl mb-4 relative overflow-hidden">
                                    <img src={imageUrl} alt={bien.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-secondary uppercase">
                                      {serviceName}
                                    </div>
                                  </div>
                                  <div className="px-2 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-bold text-secondary text-lg leading-tight line-clamp-1">
                                        {`${typeName} ${bien.name ?? ""}`.trim()}
                                      </h4>
                                    </div>
                                    <p className="text-stone-500 text-sm mb-4 line-clamp-1">
                                      {bien.ville_commune ? `${bien.ville_commune}, ${bien.pays ?? ""}` : (bien.address || "Abidjan, CI")}
                                    </p>
                                    
                                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                                      <p className="font-bold text-primary">{priceText}</p>
                                      <div className="flex items-center gap-3 text-stone-400 text-xs font-medium">
                                        {bien.chambre ? (
                                          <>
                                            <span>{bien.chambre} ch.</span>
                                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                          </>
                                        ) : null}
                                        <span>{pieces || "N/A"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      </>
                    )}
                 </div>
                 </div>

                 {/* Map Area */}
                 <div className="hidden lg:block w-[40%] xl:w-[45%] h-full relative overflow-hidden bg-stone-100">
                    <HeroMap biens={filteredBiens} selectedBien={selectedBien} onSelectBien={setSelectedBien} />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
