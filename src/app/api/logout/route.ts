import { NextResponse } from "next/server";

export async function GET() {
  // Supprime le cookie "token"
  const response = NextResponse.json({ success: true, message: "Déconnecté" });
  response.cookies.set("token", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0, // expire immédiatement
  });
  return response;
}

export {};
