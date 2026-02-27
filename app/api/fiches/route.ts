import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status");
    const product = searchParams.get("product");
    const search = searchParams.get("search");

    const db = getDb();
    let fiches = [...db.fiches];

    // Role filtering: ADVISOR can only see their own fiches
    if (user.role === "ADVISOR") {
      fiches = fiches.filter((f) => f.advisorId === user.id);
    }

    // Apply filters
    if (status) {
      fiches = fiches.filter((f) => f.status === status);
    }
    if (product) {
      fiches = fiches.filter((f) => f.product === product);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      fiches = fiches.filter((f) =>
        f.clientName.toLowerCase().includes(searchLower),
      );
    }

    // Sort by createdAt descending
    fiches.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Pagination
    const total = fiches.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedFiches = fiches
      .slice(offset, offset + limit)
      .map((fiche) => {
        const advisor = db.users.find((u) => u.id === fiche.advisorId);
        return {
          ...fiche,
          advisorName: advisor ? advisor.name : "Non assigné",
        };
      });

    return NextResponse.json({
      data: paginatedFiches,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET fiches err:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
