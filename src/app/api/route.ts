import { NextRequest, NextResponse } from "next/server"
import { getDBInstance } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const db = await getDBInstance();
    const [rows]: any = await db.execute(
      "SELECT user_id FROM Users WHERE user_id = ?",
      [decoded.user_id]
    );

    if (!rows || rows.length === 0) return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 })

    return NextResponse.json({ success: true, user_id: rows[0].user_id })
  } catch (err) {
    console.error("Erreur /api/route :", err)
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 })
  }
}

export {}
