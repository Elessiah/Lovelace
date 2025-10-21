import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = await getDBInstance();
    const id_user = req.nextUrl.searchParams.get("id_user");

    let query = `
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.pp_path, a.biography, a.job, a.field_id
      FROM Users u
      LEFT JOIN Ambassador_Info a ON u.user_id = a.user_id
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
