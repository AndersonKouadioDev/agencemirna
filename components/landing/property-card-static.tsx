import {
  BathIcon,
  BedIcon,
  CarIcon,
  MapPinIcon,
  LocateIcon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Motion from "../motion";

export default function PropertyCardStatic({
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
}) {
  return (
    <div className="self-stretch w-full max-w-xl mx-auto">
      <Motion variant="verticalSlideIn" viewport={{ once: true, amount: 0.2 }}>
        <div className="flex flex-col w-full h-full bg-white border border-gray-200 rounded-3xl shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
          <Link
            href={`/properties`}
            className="group relative h-64 hover:scale-105 transition duration-300 overflow-hidden"
          >
            <Image
              src={imageUrl}
              alt={altText}
              className="w-full h-full object-cover object-bottom"
              width={500}
              height={500}
            />
            <div className="bg-primary absolute bottom-2 right-2 group-hover:opacity-0 opacity-100 transition duration-300 text-sm border border-white text-white px-3 py-1 rounded-full">
              {status}
            </div>
          </Link>
          <div className="flex flex-col relative justify-between flex-1 p-6">
            <div>
              <Link
                href={localisation ?? "#"}
                target="_blank"
                className="flex items-center mb-2 hover:text-primary hover:underline transition-all duration-300"
              >
                <MapPinIcon className="mr-2 size-4 md:size-6" />
                <div className="text-sm text-gray-600">{address}</div>
              </Link>

              <div className="flex flex-col  mb-3">
                <Link
                  href={`/properties`}
                  className="text-xl font-bold hover:underline transition duration-300"
                >
                  {title}
                </Link>
                <p className="text-sm">{detail}</p>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                {area && (
                  <div className="flex items-center gap-1">
                    <LocateIcon size={18} />
                    <span className="text-gray-600 text-sm">{area}</span>
                  </div>
                )}
                {bedrooms && (
                  <div className="flex items-center gap-1">
                    <BedIcon size={18} />
                    <span className="text-gray-600 text-sm">{bedrooms}</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center gap-1">
                    <BathIcon size={18} />
                    <span className="text-gray-600 text-sm">
                      {bathrooms || 3}
                    </span>
                  </div>
                )}
                {parkingSpaces && (
                  <div className="flex items-center gap-1">
                    <CarIcon size={18} />
                    <span className="text-gray-600 text-sm">
                      {parkingSpaces}
                    </span>
                  </div>
                )}
                {capacity && (
                  <div className="flex items-center gap-1">
                    <Users size={18} />
                    <span className="text-gray-600 text-sm">{capacity}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[1px] w-full mb-2 bg-gray-300"></div>
            <div className="flex justify-between items-end">
              {price && (
                <div className="md:text-lg font-bold">{price}/jour</div>
              )}
              {pricePerMonth && (
                <div className="md:text-lg text-primary font-bold text-right">
                  {pricePerMonth}/mois
                </div>
              )}
            </div>
          </div>
        </div>
      </Motion>
    </div>
  );
}
