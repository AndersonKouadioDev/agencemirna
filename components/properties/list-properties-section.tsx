"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertySection from "./property-section";
import Motion from "../motion";
import { getAllBiens } from "@/src/actions/bien.actions";
import { useState, useEffect, Dispatch } from "react";
import { ResetIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default function ListPropertiesSection() {
  const [biens, setBiens] = useState<any>([]);
  const [oldBiens, setOldBiens] = useState<any>([]);
  useEffect(() => {
    const fetchBiens = async () => {
      const biens = await getAllBiens();
      setBiens(biens);
      setOldBiens(biens);
    };
    fetchBiens();
  }, []);

  return (
    <section
      id="hero"
      className="relative isolate py-32 mx-auto max-w-screen-2xl"
    >
      <PropertySearchBar biens={oldBiens} setBiens={setBiens} />
      {biens.length > 0 ? (
        <PropertySection biens={biens} />
      ) : (
        <NoPropertyFound />
      )}
    </section>
  );
}

export const PropertySearchBar = ({
  biens,
  setBiens,
}: {
  biens: any;
  setBiens: Dispatch<any>;
}) => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [service, setService] = useState("");

  const handleSearch = () => {
    let filteredBiens = search
      ? biens.filter((bien: any) => {
          return bien.name.toLowerCase().includes(search.toLowerCase());
        })
      : biens;

    filteredBiens = location
      ? filteredBiens.filter((bien: any) => {
          return (
            bien.address.toLowerCase() +
            " " +
            bien.ville_commune.toLowerCase() +
            " " +
            bien.pays.toLowerCase()
          ).includes(location.toLowerCase());
        })
      : filteredBiens;

    filteredBiens = type
      ? filteredBiens.filter((bien: any) => {
          return bien.types_bien.name.toLowerCase() === type.toLowerCase();
        })
      : filteredBiens;

    filteredBiens = service
      ? filteredBiens.filter((bien: any) => {
          return (
            bien.services_bien.name.toLowerCase() === service.toLowerCase()
          );
        })
      : filteredBiens;

    setBiens(filteredBiens);
  };

  const handleReset = () => {
    setBiens(biens);
    setSearch("");
    setLocation("");
    setType("");
    setService("");
  };
  useEffect(() => {
    handleSearch();
  }, [location, type, service]);

  return (
    <div className="px-6">
      <Motion variant="verticalSlideIn">
        <div className="flex items-center lg:flex-row flex-col gap-4 justify-between z-10 bg-white relative -top-40 w-full mx-auto max-w-screen-lg space-x-2 px-8 md:px-16 py-8 lg:py-4 rounded-xl lg:rounded-full shadow-lg">
          <div className="flex items-center space-x-2 w-full lg:w-2/5">
            <div className="relative flex-grow">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Rechercher une properté..."
                className="pl-10 pr-4 py-2 w-full rounded-full"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="rounded-full px-6" onClick={handleSearch}>
              Rechercher
            </Button>
          </div>
          <div className="flex-1 gap-4 w-full flex sm:flex-row flex-col justify-end items-center space-x-2">
            <Select
              value={location}
              onValueChange={(value: any) => setLocation(value)}
            >
              <SelectTrigger className="w-full rounded-full border-none bg-gray-100">
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marcory zone 4">Marcory Zone 4</SelectItem>
                <SelectItem value="marcory residential">
                  Marcory Résidentiel
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger className="w-full rounded-full border-none bg-gray-100">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studios</SelectItem>
                <SelectItem value="appartement">Appartements</SelectItem>
                <SelectItem value="maison">Maisons</SelectItem>
                <SelectItem value="terrain">Terrains</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={service}
              onValueChange={(value: any) => setService(value)}
            >
              <SelectTrigger className="w-full rounded-full border-none bg-gray-100">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vente">Vente</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
            {(search || location || type || service) && (
              <Button className="rounded-full px-4 md:px-6" onClick={handleReset}>
                <ResetIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Motion>
    </div>
  );
};

function NoPropertyFound() {
  return (
    <div className="container mx-auto flex justify-center items-center">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/images/illustrations/notdata.svg"
          alt="No property found"
          width={100}
          height={100}
        />
        <div className="text-center  rounded-lg p-8">
          <h1 className="text-2xl font-bold">Aucune propriété trouvée</h1>
          <p className="text-gray-500">
            Désolé, aucune propriété ne correspond à vos critères de recherche.
          </p>
        </div>
      </div>
    </div>
  );
}
