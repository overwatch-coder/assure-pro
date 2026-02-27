import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

const PRIMES: Record<string, number> = {
  AUTO: 800,
  MRH: 450,
  RCPRO: 1200,
  SANTE: 700,
  VIE: 1500,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { user } = session;
    const db = getDb();

    let fiches = [...db.fiches];

    // ADVISOR can only see their own fiches
    if (user.role === "ADVISOR") {
      fiches = fiches.filter((f) => f.advisorId === user.id);
    }

    const totalFiches = fiches.length;

    const statusCounts: Record<string, number> = {
      NEW: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      CLOSED: 0,
    };
    const productCounts: Record<string, number> = { AUTO: 0, MRH: 0, RCPRO: 0 };

    let totalPrimes = 0;
    const monthlyMap: Record<string, number> = {};
    const conseillerMap: Record<string, number> = {};

    fiches.forEach((f) => {
      // Status & Product
      if (statusCounts[f.status] !== undefined) statusCounts[f.status]++;
      if (productCounts[f.product] !== undefined) productCounts[f.product]++;

      // Primes
      totalPrimes += PRIMES[f.product] || 500;

      // Monthly Trend
      const date = new Date(f.createdAt);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[yearMonth] = (monthlyMap[yearMonth] || 0) + 1;

      // Advisor
      if (f.advisorId) {
        conseillerMap[f.advisorId] = (conseillerMap[f.advisorId] || 0) + 1;
      }
    });

    // Fill the last 6 months with 0 if they don't exist to ensure smooth rendering even without records
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap[ym] === undefined) {
        monthlyMap[ym] = 0;
      }
    }

    const activeFiches =
      statusCounts["IN_PROGRESS"] +
      statusCounts["ASSIGNED"] +
      statusCounts["NEW"];

    const monthlyData = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        mois: new Date(`${month}-01`).toLocaleDateString("fr-FR", {
          month: "short",
          year: "2-digit",
        }),
        fiches: count,
      }));

    const allUsers = db.users.reduce((acc: any, u) => {
      acc[u.id] = u.name;
      return acc;
    }, {});

    const conseillerCounts = Object.entries(conseillerMap)
      .map(([id, count]) => ({
        nom: allUsers[id]?.split(" ")[0] || "Inconnu",
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent 5 Fiches
    const recentFiches = [...fiches]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((f) => ({
        id: f.id,
        clientName: f.clientName,
        status: f.status,
      }));

    return NextResponse.json({
      totalFiches,
      activeFiches,
      statusCounts,
      productCounts,
      totalPrimes,
      monthlyData,
      conseillerCounts,
      recentFiches,
    });
  } catch (error) {
    console.error("GET analytics error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des données" },
      { status: 500 },
    );
  }
}
