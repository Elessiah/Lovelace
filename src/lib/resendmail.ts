import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import { getDBInstance } from "@/lib/db"

// Crée le transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Envoie le mail de confirmation à l'user
export async function sendConfirmationEmail(to: string, user_id: number) {
  // Crée un token JWT valable 1h pour la confirmation
  const token = jwt.sign({ user_id }, process.env.JWT_SECRET!, { expiresIn: "1h" })

  // Stocke le token dans la table JWT_Tokens pour vérification ultérieure
  const db = await getDBInstance();
  await db.execute(
    "INSERT INTO JWT_Tokens (token, creation_date, user_id, object) VALUES (?, NOW(), ?, 'confirm')",
    [token, user_id]
  )

  const url = `${process.env.NEXT_PUBLIC_URL}/confirm?token=${token}`

  await transporter.sendMail({
    from: `"Lovelace" <${process.env.SMTP_USER}>`,
    to,
    subject: "Confirme ton inscription",
    html: `<p>Bienvenue sur Lovelace ! Clique <a href="${url}">ici</a> pour confirmer ton email.</p>`,
  })
}

// Confirme un user en fonction du token JWT
export async function confirmUser(token: string) {
  try {
    // Vérifie et décode le token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const user_id = decoded.user_id

    // Vérifie que le token existe encore dans la table JWT_Tokens
    const db = await getDBInstance();
    const [rows]: any = await db.execute(
      "SELECT * FROM JWT_Tokens WHERE token = ? AND object = 'confirm'",
      [token]
    )
    if (rows.length === 0) throw new Error("Token invalide ou déjà utilisé")

    // Met à jour l'user pour le marquer comme actif
    await db.execute("UPDATE Users SET status = 'active' WHERE user_id = ?", [user_id])

    // Supprime le token de la table JWT_Tokens
    await db.execute("DELETE FROM JWT_Tokens WHERE token = ?", [token])

    return { success: true, message: "Email confirmé avec succès !" }
  } catch (err) {
    console.error("Erreur confirmation :", err)
    return { success: false, message: "Token invalide ou expiré" }
  }
}
