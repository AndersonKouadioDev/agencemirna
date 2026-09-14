import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveArticles } from "@/src/actions/public";

/**
 * Section « Actualités & Guides » de l'accueil.
 *
 * Les deux cartes étaient des constantes locales pointant vers `/blog/1` et
 * `/blog/2` : ces routes n'existent pas (le blog n'expose que `/blog` et
 * `/actualites/<slug>`), les deux liens de l'accueil étaient donc deux 404.
 * On repart des articles réellement publiés et on émet le seul chemin de
 * détail qui existe. Quand la base ne renvoie rien, on assume l'état vide
 * plutôt que de servir des cartes factices cliquables.
 */
export default async function NewsGuidesSection() {
  const articles = await getActiveArticles({ limit: 2 });

  return (
    <section className="py-12 md:py-20 bg-[#FAF5EE]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-start">
          {/* Left Text */}
          <div className="w-full lg:w-1/3 flex flex-col items-start pt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
              Besoin d&apos;inspiration ?
            </span>
            <h2 className="font-agate text-4xl md:text-5xl font-bold text-secondary leading-tight mb-6">
              Actualités & Guides
            </h2>
            <p className="text-stone-600 font-medium mb-8 text-lg">
              Obtenez des conseils immobiliers, des guides de quartiers et des histoires inspirantes pour réussir votre projet.
            </p>
            {articles.length > 0 ? (
              <Button className="rounded-full h-12 px-6 bg-[#1B3C35] hover:bg-[#152e29] text-white">
                <Link href="/blog" className="flex items-center gap-2">
                  Lire nos articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button className="rounded-full h-12 px-6 bg-[#1B3C35] hover:bg-[#152e29] text-white">
                <Link href="/contact_us" className="flex items-center gap-2">
                  Poser votre question
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Right Cards */}
          <div className="w-full lg:w-2/3">
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/actualites/${article.slug}`}
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#FAF5EE] rounded-3xl"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-secondary mb-2 leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.read_time_minutes && (
                          <p className="text-sm font-medium text-stone-500">
                            {article.read_time_minutes} min de lecture
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Aucun article publié : un bloc non cliquable, pour ne pas
                 promettre une lecture qui n'existe pas. */
              <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-10 md:p-14 flex flex-col items-center text-center">
                <div className="bg-[#FAF5EE] p-4 rounded-full mb-5 text-stone-500">
                  <Newspaper className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-xl text-secondary mb-2">
                  Nos premiers articles arrivent bientôt
                </h3>
                <p className="text-stone-500 font-medium max-w-md">
                  Aucun guide n&apos;est encore publié. En attendant, nos
                  conseillers répondent directement à vos questions sur le
                  marché abidjanais.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
