import Link from "next/link";

export function SiteBanner() {
  return (
    <div className="relative top-0 bg-primary text-secondary py-3 md:py-0 font-medium">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-12 md:flex-row">
        <Link
          href="/contact_us"
          className="text-center text-sm leading-loose text-secondary"
        >
          ✨
          <span className="font-bold"> Offre spéciale : </span>{" "}
          Estimation gratuite de votre bien - réponse sous 24h ✨
        </Link>
      </div>
      <hr className="absolute bottom-0 m-0 h-px w-full bg-secondary/10" />
    </div>
  );
}
