import { NextRequest, NextResponse } from "next/server"
import { getDBInstance } from "@/lib/db"
import { sendResetEmail } from "@/lib/reinit"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Vérifie que l'email existe
    const db = await getDBInstance();
    const [users]: any = await db.execute("SELECT * FROM Users WHERE email = ?", [email])
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: "Email non trouvé" })
    }

    const user = users[0]
    await sendResetEmail(email, user.id_user)

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec le lien de réinitialisation",
    })
  } catch (err) {
    console.error("Erreur /reinit-password:", err)
    return NextResponse.json({ success: false, message: "Erreur serveur" })
  }
}
