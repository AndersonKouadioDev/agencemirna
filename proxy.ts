import { type NextRequest } from "next/server";
import { updateSession } from "@/src/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, robots.txt, sitemap.xml
     * - fichiers avec extension d'image (jpg, png, gif, webp, svg, ico)
     *
     * Note : on rafraîchit le cookie session sur TOUTES les requêtes (pour
     * éviter d'expirer la session) mais la logique de redirection ne
     * s'applique qu'aux routes /admin/* (gérée dans updateSession).
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
