import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaBannerSection() {
  return (
    <section className="px-4 md:px-8 py-12 max-w-[1400px] mx-auto bg-[#FAF5EE]">
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#1B3C35] flex flex-col md:flex-row items-center">
        
        {/* Left Side: Image */}
        <div className="w-full md:w-[45%] h-64 md:h-[400px] relative">
          <Image
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"
            alt="Paysage immobilier"
            fill
            className="object-cover"
          />
          {/* Gradient fade to blend with background */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1B3C35] to-transparent opacity-100" />
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-16 relative z-10">
          <div className="flex flex-col items-start text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5B324] mb-3 flex items-center gap-2">
              Offre Spéciale <span>✦</span>
            </span>
            <h2 className="font-agate text-3xl md:text-5xl font-bold leading-tight mb-4">
              Votre prochain projet<br/>commence ici
            </h2>
            <p className="text-white/80 font-medium mb-8 max-w-md">
              Des biens exclusifs. Un accompagnement flexible. Des souvenirs pour la vie.
            </p>
            <Button asChild className="rounded-full h-12 px-8 bg-[#F5B324] hover:bg-[#d99f1f] text-secondary font-bold">
              <Link href="/contact_us">
                Découvrir nos offres
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Floral/Decorative element on the right (mockup style) */}
        <div className="hidden lg:block absolute bottom-0 right-0 h-48 w-48 opacity-90 pointer-events-none translate-x-12 translate-y-12">
          {/* We'll use a generic abstract shape instead of a specific flower image if we don't have one */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F5B324]/20 to-transparent rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}