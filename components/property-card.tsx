import {
  BathIcon,
  BedIcon,
  CarIcon,
  MapPinIcon,
  LocateIcon,
  Users,
  HeartIcon,
  ArrowRightIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Motion from "./motion";

export default function PropertyCard({
  id,
  imageUrl,
  altText,
  address,
  title,
  localisation,
  detail,
  area,
  capacity,
  bedrooms,
  bathrooms,
  parkingSpaces,
  status,
  price,
  pricePerMonth,
  furnished,
}: {
  id: string;
  imageUrl: string;
  altText: string;
  address: string;
  title: string;
  localisation?: string;
  detail?: string;
  capacity?: number;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  status: string;
  price: string;
  pricePerMonth?: string;
  /** Vient de `categories_bien`. Le libellé du service ne dit pas toujours
   *  « meublé » — le service générique « Location » ne le disait pas. */
  furnished?: boolean;
}) {
  const s = (status || "").toLowerCase();
  
  let theme = {
    dotColor: "bg-secondary",
  };

  let priceBlock;

  if (s.includes("vente")) {
    theme.dotColor = "bg-[#F5B324]";
    priceBlock = <div className="text-xl font-bold text-secondary">{price}</div>;
  } else if (furnished || s.includes("meublé") || s.includes("courte") || s.includes("vacance")) {
    theme.dotColor = "bg-indigo-500";
    priceBlock = (
      <div className="flex flex-col">
        <div className="text-xl font-bold text-secondary">
          {price || pricePerMonth} <span className="text-sm font-normal text-stone-500">/jour</span>
        </div>
        {pricePerMonth && price && (
          <div className="text-[11px] text-stone-400 font-medium">{pricePerMonth} /mois</div>
        )}
      </div>
    );
  } else {
    theme.dotColor = "bg-emerald-500";
    priceBlock = (
      <div className="text-xl font-bold text-secondary">
        {pricePerMonth || price} <span className="text-sm font-normal text-stone-500">/mois</span>
      </div>
    );
  }

  return (
    <div className="self-stretch w-full max-w-xl mx-auto h-full">
      <Motion variant="verticalSlideIn" viewport={{ once: true, amount: 0.2 }} className="h-full">
        <div className="flex flex-col w-full h-full bg-white border border-stone-200/50 rounded-[24px] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 group/card relative">
          
          {/* IMAGE SECTION */}
          <div className="relative p-2 pb-0">
            <Link
              href={`/properties/${id}` as any}
              className="block relative h-60 overflow-hidden rounded-[20px]"
            >
              <Image
                src={imageUrl}
                alt={altText}
                className="w-full h-full object-cover object-bottom transition-transform duration-1000 group-hover/card:scale-110"
                width={500}
                height={500}
              />
              
              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
            </Link>

            {/* FLOATING STATUS BADGE */}
            <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm text-stone-800 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${theme.dotColor}`}></div>
              {status}
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="flex flex-col flex-1 p-5 pt-4">
            {/* Header */}
            <div className="mb-4">
              <Link
                href={(localisation ?? "#") as any}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-stone-400 mb-2 hover:text-primary transition-colors"
              >
                <MapPinIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider truncate">{address}</span>
              </Link>
              
              <Link
                href={`/properties/${id}` as any}
                className="block font-agate text-[24px] leading-tight font-bold text-secondary hover:text-primary transition-colors duration-300 line-clamp-1"
              >
                {title}
              </Link>
              <p className="text-sm text-stone-500 mt-1.5 line-clamp-1">{detail}</p>
            </div>

            {/* AMENITIES */}
            <div className="flex flex-wrap items-center gap-2 mb-5 mt-auto">
              {bedrooms != null && (
                <div className="flex items-center gap-1.5 bg-stone-50/80 border border-stone-100 px-2.5 py-1.5 rounded-lg" title="Chambres">
                  <BedIcon className="w-4 h-4 text-stone-400 stroke-[1.5]" />
                  <span className="text-stone-600 text-xs font-semibold">{bedrooms}</span>
                </div>
              )}
              {bathrooms != null && (
                <div className="flex items-center gap-1.5 bg-stone-50/80 border border-stone-100 px-2.5 py-1.5 rounded-lg" title="Salles de bain">
                  <BathIcon className="w-4 h-4 text-stone-400 stroke-[1.5]" />
                  <span className="text-stone-600 text-xs font-semibold">{bathrooms}</span>
                </div>
              )}
              {area && (
                <div className="flex items-center gap-1.5 bg-stone-50/80 border border-stone-100 px-2.5 py-1.5 rounded-lg" title="Surface">
                  <LocateIcon className="w-4 h-4 text-stone-400 stroke-[1.5]" />
                  <span className="text-stone-600 text-xs font-semibold">{area}</span>
                </div>
              )}
              {parkingSpaces != null && (
                <div className="flex items-center gap-1.5 bg-stone-50/80 border border-stone-100 px-2.5 py-1.5 rounded-lg" title="Parkings">
                  <CarIcon className="w-4 h-4 text-stone-400 stroke-[1.5]" />
                  <span className="text-stone-600 text-xs font-semibold">{parkingSpaces}</span>
                </div>
              )}
              {capacity != null && (
                <div className="flex items-center gap-1.5 bg-stone-50/80 border border-stone-100 px-2.5 py-1.5 rounded-lg" title="Capacité">
                  <Users className="w-4 h-4 text-stone-400 stroke-[1.5]" />
                  <span className="text-stone-600 text-xs font-semibold">{capacity}</span>
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="h-px w-full bg-stone-100 mb-4" />

            {/* FOOTER: PRICE & ACTION */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Prix demandé</div>
                {priceBlock}
              </div>
              
              <Link 
                href={`/properties/${id}` as any}
                className="w-11 h-11 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-secondary hover:text-white transition-all duration-300 group-hover/card:-rotate-45"
              >
                <ArrowRightIcon className="w-5 h-5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </Motion>
    </div>
  );
}
