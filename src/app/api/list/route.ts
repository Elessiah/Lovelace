import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = await getDBInstance();
    // Sélectionne uniquement les ambassadrices actives
    const [rows]: any = await db.execute(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.pp_path, a.biography, a.job, a.field_id
       FROM Users u
       LEFT JOIN Ambassador_Info a ON u.user_id = a.user_id
       WHERE u.role = 'Ambassadrice' AND u.status = 'active'`
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Erreur GET /api/list :", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
