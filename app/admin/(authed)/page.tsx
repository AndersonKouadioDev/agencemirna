import { Home, Sparkles, Megaphone, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/src/supabase/admin-auth";
import { createClient } from "@/src/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Tableau de bord",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  // Compteurs simples — best-effort. Les tables `promotions` et `agents`
  // n'existent pas encore (migration semaine 2), on les protège avec un wrapper.
  const safeCount = async (table: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    } catch {
      return 0;
    }
  };

  const [biensCount, promotionsCount, agentsCount] = await Promise.all([
    safeCount("biens"),
    safeCount("promotions"),
    safeCount("agents"),
  ]);

  const stats: StatCard[] = [
    {
      label: "Biens",
      value: biensCount,
      href: "/admin/biens",
      icon: Home,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Services",
      value: 6,
      href: "/admin/services",
      icon: Sparkles,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Promotions",
      value: promotionsCount,
      href: "/admin/promotions",
      icon: Megaphone,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Agents",
      value: agentsCount,
      href: "/admin/agents",
      icon: Users,
      color: "bg-green-500/10 text-green-600",
    },
  ];

  const firstName = admin.fullName?.split(" ")[0]?.trim();
  const greeting = firstName ? `Bonjour ${firstName}` : "Bonjour";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Voici un aperçu de ce qui se passe sur agencemirna.com aujourd'hui.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCardComponent key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Bienvenue dans le back-office</h2>
            <p className="text-sm text-muted-foreground">
              Vous pouvez désormais gérer les biens, services, promotions et
              agents directement depuis cette interface. Plus besoin de toucher
              à Supabase Studio.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Prochaines étapes</h2>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Compléter les textes des 6 services</li>
              <li>Ajouter une première promotion</li>
              <li>Créer les fiches des agents</li>
              <li>Vérifier les biens publiés</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type StatCard = {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

function StatCardComponent({ label, value, href, icon: Icon, color }: StatCard) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
    </Link>
  );
}
