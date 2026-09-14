import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes nécessitant un compte admin connecté.
 * /admin/login est exclu (sinon boucle de redirection).
 */
const ADMIN_PROTECTED_PREFIX = "/admin";
const ADMIN_PUBLIC_ROUTES = ["/admin/login"];

/**
 * Middleware Supabase : rafraîchit le cookie de session sur chaque requête
 * et protège les routes /admin/*.
 *
 * IMPORTANT : ne PAS toucher au reste du site. Les pages marketing
 * (/, /about, /properties, /contact_us) restent publiques.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ce getUser() rafraîchit le token côté serveur sur chaque
  // requête, ce qui maintient la session vivante.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith(ADMIN_PROTECTED_PREFIX);
  const isAdminPublicRoute = ADMIN_PUBLIC_ROUTES.includes(pathname);

  // Route admin protégée + pas de user → redirect login
  if (isAdminRoute && !isAdminPublicRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    // Le clone hérite de la query string de la page demandée : on la vide,
    // sinon /admin/login recevrait des paramètres qui ne le concernent pas
    // (il lit `next` et `error`).
    url.search = "";
    // Garder l'URL d'origine, QUERY STRING COMPRISE : les raccourcis du
    // tableau de bord pointent vers des vues filtrées (/admin/leads?status=new)
    // et l'admin se retrouvait sinon sur la liste complète après connexion.
    // `safeNext` (src/actions/admin/auth.ts) reste satisfait : la valeur
    // commence toujours par « /admin ».
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Bonus : user déjà connecté qui visite /admin/login → renvoyer au dashboard
  if (isAdminPublicRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
