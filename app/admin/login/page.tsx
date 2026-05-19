import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Connexion admin · Agence Mirna",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await props.searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center mb-8 gap-2"
        >
          <Image
            src="/images/logo.png"
            alt="Agence Mirna"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-agate font-bold">AGENCE MIRNA</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Connexion back-office</h1>
            <p className="text-sm text-muted-foreground">
              Accès réservé à l'équipe Agence Mirna.
            </p>
          </div>

          <LoginForm next={params.next ?? "/admin"} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Vous n'êtes pas membre de l'équipe ?{" "}
          <Link href="/" className="text-primary hover:underline">
            Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
