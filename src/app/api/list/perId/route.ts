import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const id_user = req.nextUrl.searchParams.get("id_user");

    let query = `
      SELECT u.id_user, u.first_name, u.last_name, u.email, u.pp_path, a.biographie, a.metier, a.domaine
      FROM Users u
      LEFT JOIN Ambassador_Info a ON u.id_user = a.id_user
      WHERE u.role = 'Ambassadrice' AND u.status = 'active'
    `;

    const values: any[] = [];
    if (id_user) {
      query += " AND u.id_user = ?";
      values.push(id_user);
    }

    const [rows]: any = await db.execute(query, values);

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Erreur serveur" });
  }
}
