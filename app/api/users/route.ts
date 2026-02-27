import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    // Only return ADVISORs so admins can assign them fiches
    const advisors = db.users
      .filter((u) => u.role === "ADVISOR")
      .map((u) => ({ id: u.id, name: u.name, email: u.email }));

    return NextResponse.json(advisors);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
