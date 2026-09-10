import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ARTICLES = [
  {
    id: 1,
    title: "10 pépites cachées à Abidjan",
    readTime: "5 min de lecture",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    href: "/blog/1",
  },
  {
    id: 2,
    title: "Les essentiels pour un investissement réussi",
    readTime: "4 min de lecture",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
    href: "/blog/2",
  },
];

export default function NewsGuidesSection() {
  return (
    <section className="py-12 md:py-20 bg-[#FAF5EE]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-start">
          {/* Left Text */}
          <div className="w-full lg:w-1/3 flex flex-col items-start pt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
              Besoin d'inspiration ?
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight mb-6">
              Actualités & Guides
            </h2>
            <p className="text-stone-600 font-medium mb-8 text-lg">
              Obtenez des conseils immobiliers, des guides de quartiers et des histoires inspirantes pour réussir votre projet.
            </p>
            <Button className="rounded-full h-12 px-6 bg-[#1B3C35] hover:bg-[#152e29] text-white">
              <Link href="/blog" className="flex items-center gap-2">
                Lire nos articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Right Cards */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ARTICLES.map((article) => (
              <Link key={article.id} href={article.href} className="group block">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-secondary mb-2 leading-tight group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm font-medium text-stone-500">
                      {article.readTime}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
