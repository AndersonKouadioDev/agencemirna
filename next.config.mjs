import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Force le workspace root pour éviter le warning sur les multiples lockfiles
    // (un pnpm-lock.yaml dans le repo parent crée une ambiguïté)
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
          "https://",
          ""
        ),
        port: "",
        pathname: "/storage/**",
      },
      // Miniatures auto YouTube (utilisées par VideoSection / videos-table
      // quand l'admin n'a pas uploadé de poster custom)
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
