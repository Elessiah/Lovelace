import { NextRequest, NextResponse } from "next/server"
import { resetPassword } from "@/lib/reinit"

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, message: "Paramètres manquants" })
    }

    const result = await resetPassword(token, newPassword)
    return NextResponse.json(result)
  } catch (err) {
    console.error("Erreur /reinit-confirm:", err)
    return NextResponse.json({ success: false, message: "Erreur serveur" })
  }
}
