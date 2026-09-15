import Link from "next/link";
import { getSiteContact } from "@/src/lib/site-contact";
import { ArrowRight } from "lucide-react";
import { getInfosBandeau } from "@/src/actions/public";
import { iconeBandeau } from "@/src/lib/bandeau-icones";
import {
  JETON_TELEPHONE,
  lienAvecJetons,
  texteAvecJetons,
  type CoordonneesJetons,
} from "@/src/lib/bandeau";

/**
 * Bandeau défilant en haut du site.
 *
 * Son contenu se pilote depuis /admin/bandeau : texte, pictogramme, lien,
 * ordre, fenêtre d'affichage. Il était jusqu'ici écrit en dur ici même —
 * y compris un tarif « dès 50 000 FCFA/nuit » qui serait devenu faux au
 * premier changement de grille, et une liste de services qui ne suivait pas
 * /admin/taxonomie.
 *
 * Ce que l'admin contient fait foi, dans l'ordre qu'il donne. Les annonces
 * actives ne s'y insèrent plus d'elles-mêmes : on ne peut pas à la fois
 * promettre la maîtrise de l'ordre et glisser des éléments au milieu. Une
 * annonce se met en avant ici comme le reste, par une ligne qui pointe vers
 * elle.
 *
 * Animation CSS pure, pause au survol, `motion-reduce` respecté.
 */

/** Affiché tant que l'agence n'a rien saisi — ou avant la migration 0026. */
function messagesDeRepli(): Array<{
  id: string;
  texte: string;
  lien: string | null;
  icone: string;
}> {
  return [
    {
      id: "repli-estimation",
      texte: "Estimation gratuite de votre bien : réponse sous 24h",
      lien: "/contact_us",
      icone: "megaphone",
    },
    {
      id: "repli-telephone",
      texte: `Une question ? Appelez-nous au ${JETON_TELEPHONE}`,
      lien: JETON_TELEPHONE,
      icone: "telephone",
    },
    {
      id: "repli-services",
      texte: "Découvrez nos services : gestion, vente, location meublée, construction",
      lien: "/services",
      icone: "journal",
    },
  ];
}

export default async function MarqueeBar() {
  const [infos, contact] = await Promise.all([
    getInfosBandeau(),
    getSiteContact(),
  ]);

  const source = infos.length > 0 ? infos : messagesDeRepli();
  const jetons: CoordonneesJetons = {
    phone: contact.phone,
    telHref: contact.telHref,
  };

  const elements = source.map((info) => ({
    id: info.id,
    texte: texteAvecJetons(info.texte, jetons),
    lien: lienAvecJetons(info.lien, jetons),
    Icone: iconeBandeau(info.icone),
  }));

  // Un bandeau vidé depuis l'admin ne doit pas laisser une barre sombre de
  // quarante pixels en haut de chaque page — `messagesDeRepli` le rend
  // improbable, mais un repli n'est pas une garantie.
  if (elements.length === 0) return null;

  // Le contenu est dupliqué pour un défilement sans coupure. La copie est
  // masquée aux lecteurs d'écran : sans cela, chaque message était annoncé
  // deux fois de suite.
  return (
    <div className="relative bg-secondary text-white overflow-hidden border-b border-[#F5B324]/20">
      <div
        className="flex group"
        role="region"
        aria-label="Annonces et informations"
      >
        {[0, 1].map((copie) => (
          <div
            key={copie}
            aria-hidden={copie === 1}
            className="flex shrink-0 animate-marquee-x group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          >
            {elements.map(({ id, texte, lien, Icone }) => {
              const contenu = (
                <>
                  <Icone className="h-4 w-4 text-[#F5B324] shrink-0" />
                  <span>{texte}</span>
                  {lien && (
                    <ArrowRight className="h-3.5 w-3.5 text-[#F5B324] opacity-70" />
                  )}
                </>
              );
              const classes =
                "inline-flex items-center gap-2.5 py-3 px-8 text-sm font-medium whitespace-nowrap border-r border-white/10";

              // Une information sans destination reste du texte : un `href`
              // vide rouvrait la page courante dans le même onglet.
              return lien ? (
                <Link
                  key={`${copie}-${id}`}
                  href={lien}
                  // `tabIndex={-1}` sur la copie : elle est décorative, et la
                  // tabulation la traversait comme un second jeu de liens.
                  tabIndex={copie === 1 ? -1 : undefined}
                  className={`${classes} hover:text-[#F5B324] transition-colors`}
                >
                  {contenu}
                </Link>
              ) : (
                <span key={`${copie}-${id}`} className={classes}>
                  {contenu}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
