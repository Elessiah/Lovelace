// /app/api/resend-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendConfirmationEmail } from "@/lib/resendmail"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email requis" }, { status: 400 })
    }

    // Vérifie que l'utilisateur existe et est en "pending"
    const [rows]: any = await db.execute(
      "SELECT id_user, status FROM Users WHERE email = ?",
      [email]
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 })
    }

    const user = rows[0]

    if (user.status !== "pending") {
      return NextResponse.json({
        success: false,
        message: "Le compte est déjà activé ou indisponible pour confirmation",
      }, { status: 400 })
    }

    // Envoie le mail de confirmation
    await sendConfirmationEmail(email, user.id_user)

    return NextResponse.json({ success: true, message: "Mail de confirmation renvoyé !" })
  } catch (err) {
    console.error("Erreur resendmail :", err)
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 })
  }
}

export {}
