"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, use } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  Wallet,
  Activity,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FicheDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ficheId = resolvedParams.id;

  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  const { data: fiche, isLoading: ficheLoading } = useQuery({
    queryKey: ["fiche", ficheId],
    queryFn: async () => {
      const res = await fetch(`/api/fiches/${ficheId}`);
      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          router.push("/dashboard/fiches");
          toast.error("Fiche introuvable ou accès refusé");
        }
        throw new Error("Erreur de récupération");
      }
      return res.json();
    },
  });

  // Only fetch users if current user is ADMIN
  const { data: advisors } = useQuery({
    queryKey: ["users", "advisors"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Erreur de récupération des conseillers");
      return res.json();
    },
    enabled: user?.role === "ADMIN",
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      status?: string;
      advisorId?: string | null;
    }) => {
      const res = await fetch(`/api/fiches/${ficheId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiche", ficheId] });
      queryClient.invalidateQueries({ queryKey: ["fiches"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Mise à jour effectuée avec succès");
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la mise à jour");
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setIsUpdatingStatus(true);
    updateMutation.mutate(
      { status: newStatus },
      { onSettled: () => setIsUpdatingStatus(false) },
    );
  };

  const handleAdvisorChange = (newAdvisor: string) => {
    setIsReassigning(true);
    updateMutation.mutate(
      { advisorId: newAdvisor === "unassigned" ? null : newAdvisor },
      { onSettled: () => setIsReassigning(false) },
    );
  };

  if (ficheLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fiche introuvable
          </h2>
          <p className="text-sm text-slate-500">
            La fiche que vous recherchez n'existe pas ou a été supprimée.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-sm px-3 py-1">
            Nouveau
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-sm px-3 py-1">
            Assigné
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-sm px-3 py-1">
            En cours
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-sm px-3 py-1">
            Clôturé
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-sm px-3 py-1">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fiche {String(fiche.id).padStart(3, "0")}
          </h2>
          <p className="text-sm text-slate-500">
            Créée le{" "}
            {format(new Date(fiche.createdAt), "d MMMM yyyy 'à' HH:mm", {
              locale: fr,
            })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {getStatusBadge(fiche.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section Client */}
        <Card className="col-span-1 md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-2">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Informations Client</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Nom complet
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {fiche.clientName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" /> Téléphone
                </dt>
                <dd className="mt-1 text-base text-slate-900 font-mono">
                  {fiche.phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> Email
                </dt>
                <dd className="mt-1 text-base text-blue-600">{fiche.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Section Actions */}
        <Card className="col-span-1 border-slate-200 shadow-sm bg-slate-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Actions Rapides</CardTitle>
            </div>
            <CardDescription>Gérez l'état et l'attribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Changer le statut
              </label>
              <Select
                disabled={isUpdatingStatus}
                value={fiche.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Nouveau</SelectItem>
                  <SelectItem value="ASSIGNED">Assigné</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="CLOSED">Clôturé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {user?.role === "ADMIN" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Assigner à
                </label>
                <Select
                  disabled={isReassigning || !advisors}
                  value={fiche.advisorId || "unassigned"}
                  onValueChange={handleAdvisorChange}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Sélectionner conseiller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      -- Non assigné --
                    </SelectItem>
                    {advisors?.map((adv: any) => (
                      <SelectItem key={adv.id} value={adv.id}>
                        {adv.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {user?.role !== "ADMIN" && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Assigné à: </span>
                  {fiche.advisorId === user?.id
                    ? "Vous-même"
                    : "Autre conseiller"}
                </p>
                <p className="text-xs text-slate-500 mt-1 italic">
                  Seul un admin peut modifier l'assignation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Produit */}
        <Card className="col-span-1 md:col-span-3 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">
                Détails du Produit d'Assurance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 block">
                  Type de contrat
                </span>
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                  {fiche.product} - {fiche.type}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 block">
                  Prime annuelle
                </span>
                <div className="flex items-center gap-2 text-lg font-bold text-emerald-600">
                  <Wallet className="h-5 w-5" />
                  {fiche.prime} MAD
                </div>
              </div>

              <div className="space-y-2 md:col-span-3 mt-2">
                <span className="text-sm font-medium text-slate-500 block">
                  Garanties incluses
                </span>
                <div className="flex flex-wrap gap-2">
                  {fiche.garanties.map((g: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
