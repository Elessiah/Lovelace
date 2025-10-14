import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")
    if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 })

    // Vérifie la validité du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string; status: string }

    // Mise à jour du compte comme "confirmé"
    const sql = "UPDATE Users SET confirmed = 1 WHERE email = ?"
    await db.execute(sql, [decoded.email])

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/confirmation-success`)
  } catch (err) {
    console.error("Erreur confirmation :", err)
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 })
  }
}

export {}
