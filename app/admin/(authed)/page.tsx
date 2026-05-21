import {
  Home,
  Sparkles,
  Megaphone,
  Users,
  ArrowRight,
  Inbox,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/src/supabase/admin-auth";
import { createClient } from "@/src/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { getLeadStats, listLeadsAdmin } from "@/src/actions/admin/leads";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Tableau de bord",
};

const SOURCE_LABELS: Record<string, string> = {
  contact: "Contact",
  estimation: "Estimation",
  visit_request: "Visite",
  newsletter: "Newsletter",
  other: "Autre",
};

const SOURCE_COLORS: Record<string, string> = {
  contact: "bg-blue-100 text-blue-700",
  estimation: "bg-amber-100 text-amber-700",
  visit_request: "bg-purple-100 text-purple-700",
  newsletter: "bg-pink-100 text-pink-700",
  other: "bg-neutral-100 text-neutral-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

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

  const [
    biensCount,
    servicesCount,
    promotionsCount,
    agentsCount,
    leadStats,
    recentLeads,
  ] = await Promise.all([
    safeCount("biens"),
    safeCount("services"),
    safeCount("promotions"),
    safeCount("agents"),
    getLeadStats(),
    listLeadsAdmin().then((all) => all.slice(0, 5)),
  ]);

  const firstName = admin.fullName?.split(" ")[0]?.trim();
  const greeting = firstName ? `Bonjour ${firstName}` : "Bonjour";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Voici un aperçu de ce qui se passe sur agencemirna.com aujourd&apos;hui.
        </p>
      </div>

      {/* Bloc Leads : priorité visuelle en haut, avec alerte si nouveaux */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold inline-flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              Leads entrants
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Demandes reçues via les formulaires du site.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 transition-all"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <LeadStat
            label="Nouveaux"
            value={leadStats.new}
            color="bg-amber-50 text-amber-700 border-amber-200"
            href="/admin/leads?status=new"
            icon={Inbox}
            emphasize={leadStats.new > 0}
          />
          <LeadStat
            label="En cours"
            value={leadStats.in_progress}
            color="bg-blue-50 text-blue-700 border-blue-200"
            href="/admin/leads?status=in_progress"
            icon={Clock}
          />
          <LeadStat
            label="Convertis"
            value={leadStats.converted}
            color="bg-green-50 text-green-700 border-green-200"
            href="/admin/leads?status=converted"
            icon={CheckCircle2}
          />
          <LeadStat
            label="7 derniers jours"
            value={leadStats.this_week}
            color="bg-stone-50 text-secondary border-stone-200"
            href="/admin/leads"
            icon={TrendingUp}
          />
        </div>

        {/* Liste des 5 plus récents */}
        {recentLeads.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-6">
            Aucun lead pour l&apos;instant. Les demandes apparaîtront ici dès
            qu&apos;un visiteur soumet un formulaire.
          </p>
        ) : (
          <div className="border-t border-stone-100 pt-3 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
              5 plus récents
            </p>
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-50 transition-colors group"
              >
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                    SOURCE_COLORS[lead.source] ?? SOURCE_COLORS.other,
                  )}
                >
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </span>
                <span className="flex-1 min-w-0 text-sm font-medium text-secondary truncate">
                  {lead.full_name || (
                    <span className="text-neutral-400 italic">Anonyme</span>
                  )}
                  {lead.bien?.name && (
                    <span className="text-xs text-neutral-500 ml-2">
                      pour {lead.bien.name}
                    </span>
                  )}
                </span>
                <span className="text-xs text-neutral-400 shrink-0">
                  {formatDate(lead.created_at)}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Compteurs catalogue */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          Catalogue
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCardComponent
            label="Biens"
            value={biensCount}
            href="/admin/biens"
            icon={Home}
            color="bg-blue-500/10 text-blue-600"
          />
          <StatCardComponent
            label="Services"
            value={servicesCount}
            href="/admin/services"
            icon={Sparkles}
            color="bg-purple-500/10 text-purple-600"
          />
          <StatCardComponent
            label="Promotions"
            value={promotionsCount}
            href="/admin/promotions"
            icon={Megaphone}
            color="bg-orange-500/10 text-orange-600"
          />
          <StatCardComponent
            label="Agents"
            value={agentsCount}
            href="/admin/agents"
            icon={Users}
            color="bg-green-500/10 text-green-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Bienvenue</h2>
            <p className="text-sm text-muted-foreground">
              Vous pouvez gérer les biens, services, promotions, agents,
              quartiers, témoignages, articles, FAQ, mentions sociales et
              leads directement depuis cette interface.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Prochaines étapes</h2>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Traiter les leads en attente sous 24h</li>
              <li>Publier les nouvelles promotions Colombe 5, 6, 7</li>
              <li>Ajouter quelques articles dans le blog</li>
              <li>Compléter les fiches des agents</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Lead stat card ────────────────────────────────────────────────────────
function LeadStat({
  label,
  value,
  color,
  href,
  icon: Icon,
  emphasize,
}: {
  label: string;
  value: number;
  color: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emphasize?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl border px-4 py-3 transition-all hover:shadow-sm flex items-center gap-3",
        color,
        emphasize && "ring-2 ring-amber-500 ring-offset-2 animate-pulse",
      )}
    >
      <div className="shrink-0">
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none tabular-nums">
          {value}
        </div>
        <div className="text-[11px] uppercase tracking-wider mt-1 opacity-80">
          {label}
        </div>
      </div>
    </Link>
  );
}

// ─── Catalogue stat card ───────────────────────────────────────────────────
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
