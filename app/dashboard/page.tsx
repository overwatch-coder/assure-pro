"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import {
  FileText,
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  ASSIGNED: "#8b5cf6",
  IN_PROGRESS: "#f59e0b",
  CLOSED: "#22c55e",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau",
  ASSIGNED: "Assigné",
  IN_PROGRESS: "En cours",
  CLOSED: "Clôturé",
};

const PRODUCT_COLORS: Record<string, string> = {
  AUTO: "#0ea5e9",
  MRH: "#8b5cf6",
  RCPRO: "#ec4899",
  SANTE: "#22c55e",
  VIE: "#f97316",
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "NEW":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
          Nouveau
        </Badge>
      );
    case "ASSIGNED":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
          Assigné
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none">
          En cours
        </Badge>
      );
    case "CLOSED":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
          Clôturé
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  isLoading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
        <Skeleton className="h-4 w-28 bg-slate-100" />
        <Skeleton className="h-8 w-16 bg-slate-100" />
        <Skeleton className="h-3 w-20 bg-slate-100" />
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: accent + "20" }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function DashboardClient() {
  const { user } = useAuth();
  const isAdvisor = user?.role === "ADVISOR";

  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(`/api/analytics`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const total = data?.totalFiches ?? 0;
  const totalPrimes = data?.totalPrimes ?? 0;
  const avgPrime = total > 0 ? Math.round(totalPrimes / total) : 0;
  const closedCount = data?.statusCounts?.CLOSED ?? 0;
  const closureRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;

  const statusCounts = ["NEW", "ASSIGNED", "IN_PROGRESS", "CLOSED"].map(
    (s) => ({
      statut: s,
      label: STATUS_LABELS[s],
      count: data?.statusCounts?.[s] ?? 0,
      fill: STATUS_COLORS[s],
    }),
  );

  const productCounts = ["AUTO", "MRH", "RCPRO"].map((p) => ({
    produit: p,
    label: p,
    count: data?.productCounts?.[p] ?? 0,
    fill: PRODUCT_COLORS[p],
  }));

  const advisorCounts =
    !isAdvisor && data?.advisorCounts ? data.advisorCounts.slice(0, 5) : [];
  const monthlyData = data?.monthlyData ?? [];
  const recentFiches = data?.recentFiches ?? [];

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total fiches"
          value={isLoading ? "—" : total}
          sub={isAdvisor ? "Mes fiches assignées" : "Dans le portefeuille"}
          icon={FileText}
          accent="#3b82f6"
          isLoading={isLoading}
        />
        <KpiCard
          label="En cours"
          value={isLoading ? "—" : (data?.statusCounts?.IN_PROGRESS ?? 0)}
          sub="Fiches actives"
          icon={Activity}
          accent="#f59e0b"
          isLoading={isLoading}
        />
        {!isAdvisor && (
          <KpiCard
            label="Primes totales"
            value={
              isLoading ? "—" : `${totalPrimes.toLocaleString("fr-FR")} MAD`
            }
            sub={`Moy. ${avgPrime.toLocaleString("fr-FR")} MAD / fiche`}
            icon={DollarSign}
            accent="#22c55e"
            isLoading={isLoading}
          />
        )}
        <KpiCard
          label="Taux de clôture"
          value={isLoading ? "—" : `${closureRate} %`}
          sub={`${closedCount} fiche${closedCount > 1 ? "s" : ""} clôturée${
            closedCount > 1 ? "s" : ""
          }`}
          icon={TrendingUp}
          accent="#8b5cf6"
          isLoading={isLoading}
        />
      </div>

      {/* Charts row 1: trend + statut pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Area chart: monthly creations */}
        <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Évolution mensuelle
            </h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-lg bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(v: any) => {
                    const value = Number(v);
                    return [`${value} fiche${value > 1 ? "s" : ""}`, "Créées"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="fiches"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                  dot={{ fill: "#3b82f6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: statut distribution */}
        <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Répartition par statut
            </h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-lg bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusCounts.filter((s) => s.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="label"
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(v: any, _name: any, { payload }: any) => {
                    const val = Number(v);
                    return [`${val} fiche${val > 1 ? "s" : ""}`, payload.label];
                  }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2: produits bar + recent fiches */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Bar chart: produits */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 shadow-sm bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Fiches par produit
            </h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-lg bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={productCounts}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                barSize={28}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(v: any) => {
                    const val = Number(v);
                    return [`${val} fiche${val > 1 ? "s" : ""}`, ""];
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fiches récentes */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 shadow-sm bg-white p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Fiches récentes
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Link href="/dashboard/fiches">
                Tout voir
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-28 bg-slate-100" />
                      <Skeleton className="h-3 w-20 bg-slate-100" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full bg-slate-100" />
                  </div>
                ))
              : recentFiches.map((fiche: any) => (
                  <Link
                    key={fiche.id}
                    href={`/dashboard/fiches/${fiche.id}`}
                    className="flex items-center justify-between py-2.5 gap-3 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {fiche.clientName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        FICH-{String(fiche.id).padStart(3, "0")}
                      </p>
                    </div>
                    <StatusBadge status={fiche.status} />
                  </Link>
                ))}
          </div>
        </div>
      </div>

      {/* Advisor breakdown – Visible to ADMIN only */}
      {!isAdvisor && advisorCounts.length > 0 && (
        <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Charge par conseiller (Top 5)
            </h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-lg bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={advisorCounts
                  ?.sort((a: any, b: any) => b.count - a.count)
                  .slice(0, 5)}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
                barSize={14}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(v: any) => {
                    const val = Number(v);
                    return [`${val} fiche${val > 1 ? "s" : ""}`, ""];
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
        <span>
          {isAdvisor
            ? `Vous gérez ${total} fiche${
                total > 1 ? "s" : ""
              } dans votre portefeuille.`
            : `Portefeuille global : ${total} fiche${
                total > 1 ? "s" : ""
              } et Primes annuelles estimatives : ${totalPrimes.toLocaleString(
                "fr-FR",
              )} MAD.`}
        </span>
      </div>
    </div>
  );
}
