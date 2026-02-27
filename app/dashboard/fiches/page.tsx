"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Loader2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";

export default function FichesListPage() {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [product, setProduct] = useState("ALL");
  const queryClient = useQueryClient();

  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["fiches", page, debouncedSearch, status, product],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (status !== "ALL") params.append("status", status);
      if (product !== "ALL") params.append("product", product);

      const res = await fetch(`/api/fiches?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des fiches");
      return res.json();
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleProductChange = (val: string) => {
    setProduct(val);
    setPage(1);
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(`/api/fiches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
      toast.success("Fiche supprimée avec succès.");
      queryClient.invalidateQueries({ queryKey: ["fiches"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    } catch (error) {
      toast.error("Erreur lors de la suppression de la fiche.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
            Nouveau
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
            Assigné
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200">
            En cours
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
            Clôturé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Liste des Fiches
          </h2>
          <p className="text-sm text-slate-500">
            Gérez et consultez les dossiers d'assurance.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom..."
                className="pl-9 h-10 w-full bg-slate-50 border-slate-200"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous statuts</SelectItem>
                  <SelectItem value="NEW">Nouveau</SelectItem>
                  <SelectItem value="ASSIGNED">Assigné</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="CLOSED">Clôturé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={product} onValueChange={handleProductChange}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Produit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous produits</SelectItem>
                  <SelectItem value="AUTO">Automobile</SelectItem>
                  <SelectItem value="MRH">Habitation</SelectItem>
                  <SelectItem value="RCPRO">Responsabilité Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                Aucune fiche trouvée
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Essayez d'ajuster vos filtres de recherche.
              </p>
              {(search || status !== "ALL" || product !== "ALL") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setStatus("ALL");
                    setProduct("ALL");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-200">
                      <TableHead className="w-[100px] font-semibold text-slate-600">
                        ID Fiche
                      </TableHead>
                      <TableHead className="w-[200px] font-semibold text-slate-600">
                        Client
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Conseiller
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Produit
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Statut
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Création
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-600">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((fiche: any) => (
                      <TableRow
                        key={fiche.id}
                        className="group border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-500 py-3 font-mono text-sm">
                          FICH-{String(fiche.id).padStart(3, "0")}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 py-3">
                          {fiche.clientName}
                          <div className="text-xs font-normal text-slate-500 mt-1">
                            {fiche.email}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-slate-600">
                          {fiche.advisorName || "Non assigné"}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                            {fiche.product}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          {getStatusBadge(fiche.status)}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm py-3">
                          {format(new Date(fiche.createdAt), "d MMM yyyy", {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell className="text-right py-3 space-x-2">
                          {user?.role === "ADMIN" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hidden border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4 sm:mr-2" />
                                  <span className="hidden sm:inline">
                                    Supprimer
                                  </span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Supprimer la fiche ?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. La fiche
                                    FICH-{String(fiche.id).padStart(3, "0")}{" "}
                                    sera définitivement supprimée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(fiche.id)}
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Link href={`/dashboard/fiches/${fiche.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data?.meta?.totalPages > 1 && (
                <div className="flex flex-col gap-4 items-center justify-between px-4 py-3 border-t border-slate-200 sm:flex-row sm:px-6">
                  <div className="w-full text-center sm:w-auto sm:text-left">
                    <p className="text-sm text-slate-700">
                      Affichage de{" "}
                      <span className="font-medium">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      à{" "}
                      <span className="font-medium">
                        {Math.min(page * limit, data.meta.total)}
                      </span>{" "}
                      sur <span className="font-medium">{data.meta.total}</span>{" "}
                      résultats
                    </p>
                  </div>
                  <div className="w-full flex justify-center sm:w-auto sm:justify-end">
                    <nav
                      className="relative z-0 inline-flex items-center gap-2"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-md border-slate-300 hover:bg-slate-50"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <span className="sr-only">Précédent</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from(
                        { length: data.meta.totalPages },
                        (_, i) => i + 1,
                      ).map((p) => (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "outline"}
                          className={cn(
                            "rounded-md border-slate-300 transition-colors",
                            page === p
                              ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                              : "bg-white text-slate-700 hover:bg-slate-50",
                          )}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-md border-slate-300 hover:bg-slate-50"
                        onClick={() =>
                          setPage((p) => Math.min(data.meta.totalPages, p + 1))
                        }
                        disabled={page === data.meta.totalPages}
                      >
                        <span className="sr-only">Suivant</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
