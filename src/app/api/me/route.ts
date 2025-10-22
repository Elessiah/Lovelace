// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDBInstance } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Non connecté" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user_id = decoded.user_id;

    // Récupère les infos user depuis la base
    const db = await getDBInstance();
    const [rows]: any = await db.execute(
      `SELECT user_id, first_name, last_name, pp_path FROM Users WHERE user_id = ?`,
      [user_id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const user = rows[0];

    return NextResponse.json({
      success: true,
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      pp_path: user.pp_path,
    });
  } catch (err) {
    console.error("[GET] /api/me error:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
