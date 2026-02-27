import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb, Fiche } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function getFicheOr404(
  id: string,
  user: any,
): Promise<{ fiche?: Fiche; error?: string; status?: number }> {
  const db = getDb();
  const fiche = db.fiches.find((f) => f.id === id);

  if (!fiche) {
    return { error: "Non trouvé", status: 404 };
  }

  // If the user is an advisor and the fiche does not belong to them, return 403 Forbidden
  if (user.role === "ADVISOR" && fiche.advisorId !== user.id) {
    return { error: "Non autorisé", status: 403 };
  }

  return { fiche };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !session.user)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const { fiche, error, status } = await getFicheOr404(id, session.user);
    if (!fiche) return NextResponse.json({ error }, { status });

    return NextResponse.json(fiche);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !session.user)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const { fiche, error, status } = await getFicheOr404(id, session.user);
    if (!fiche) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const db = getDb();

    const ficheIndex = db.fiches.findIndex((f) => f.id === id);
    if (ficheIndex === -1)
      return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

    const updatedFiche = { ...db.fiches[ficheIndex] };

    // Advisor can only update status. Only ADMIN can update assignment
    if (body.status) updatedFiche.status = body.status;

    if (body.advisorId !== undefined) {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Seul un admin peut réassigner une fiche" },
          { status: 403 },
        );
      }
      updatedFiche.advisorId = body.advisorId;
    }

    db.fiches[ficheIndex] = updatedFiche;
    saveDb(db);

    return NextResponse.json(updatedFiche);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !session.user)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    if (session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const { id } = await params;
    const db = getDb();

    const ficheIndex = db.fiches.findIndex((f) => f.id === id);
    if (ficheIndex === -1)
      return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

    // Remove the fiche
    db.fiches.splice(ficheIndex, 1);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
