import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { login } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );
    }

    const db = getDb();
    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password || "");
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const userObj = { ...user };
    delete userObj.password;

    await login(userObj);

    return NextResponse.json({ user: userObj }, { status: 200 });
  } catch (error) {
    console.error("Login err:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
