import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Sélectionne uniquement les ambassadrices actives
    const [rows]: any = await db.execute(
      `SELECT u.id_user, u.first_name, u.last_name, u.email, u.pp_path, a.biographie, a.metier, a.domaine
       FROM Users u
       LEFT JOIN Ambassador_Info a ON u.id_user = a.id_user
       WHERE u.role = 'Ambassadrice' AND u.status = 'active'`
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Erreur GET /api/list :", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
