"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Key, Sofa, Building, HardHat, Paintbrush, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicService } from "@/src/data/services";

const SERVICE_IMAGES: Record<string, string> = {
  "vente": "/images/biens/bien1.jpg",
  "location-meublee": "/images/biens/bien11.jpg",
  "gestion-immobiliere": "/images/biens/bien14.jpg",
  "construction": "/images/photos/immeuble.jpeg",
  "decoration-amenagement": "/images/biens/bien13.jpg",
  "promotion-immobiliere": "/images/photos/immeuble1.jpg",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Key,
  Sofa,
  Building,
  HardHat,
  Paintbrush,
  Briefcase,
  Sparkles,
};

export function AnimatedServices({ services }: { services: PublicService[] }) {
  return (
    <div className="flex flex-col gap-24 lg:gap-32">
      {services.map((service, index) => {
        const isEven = index % 2 === 0;
        const imageUrl = SERVICE_IMAGES[service.slug] || "/images/biens/bien10.jpg";
        const Icon = service.icon ? iconMap[service.icon] || Sparkles : Sparkles;

        return (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center"
          >
            {/* Colonne Image */}
            <div className={`relative w-full aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl group ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
              <Image 
                src={imageUrl} 
                alt={service.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="h-14 w-14 rounded-full bg-white/95 backdrop-blur shadow-lg flex items-center justify-center text-primary mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Colonne Texte */}
            <div className={`flex flex-col ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary w-fit mb-6">
                <Icon className="h-4 w-4" />
                <span>Expertise</span>
              </div>
              
              <h2 className="font-agate text-4xl sm:text-5xl font-bold text-secondary mb-6 leading-tight">
                {service.name}
              </h2>
              
              <p className="text-lg text-neutral-600 leading-relaxed mb-10">
                {service.short_description}
              </p>
              
              <Button asChild size="lg" className="w-fit rounded-full px-8 h-14 bg-secondary text-white hover:bg-secondary/90 shadow-xl shadow-secondary/20 group">
                <Link href={`/services/${service.slug}`}>
                  Découvrir ce service
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
