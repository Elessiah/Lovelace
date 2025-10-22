import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDBInstance } from "@/lib/db"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// --- Envoie le mail de réinitialisation ---
export async function sendResetEmail(to: string, user_id: string) {
  try {
    // Génère un token JWT d'une heure
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET!, { expiresIn: "1h" })

    // Sauvegarde du token en DB (adapté à ta table TEXT)
    const db = await getDBInstance()
    await db.execute(
      "INSERT INTO JWT_Tokens (token, creation_date, user_id, object) VALUES (?, ?, ?, ?)",
      [token, new Date().toISOString(), user_id.toString(), "reinit"]
    )

    // Lien de réinitialisation
    const url = `${process.env.NEXT_PUBLIC_URL}/reinit?token=${token}`

    // Envoi du mail
    await transporter.sendMail({
      from: `"Lovelace" <${process.env.SMTP_USER}>`,
      to,
      subject: "Réinitialisation de ton mot de passe",
      html: `
        <p>Tu as demandé à réinitialiser ton mot de passe.</p>
        <p>Pour le faire, clique <a href="${url}">ici</a>.</p>
        <p>Ce lien est valide pendant 1 heure.</p>
      `,
    })

    return { success: true, message: "Email envoyé avec succès" }
  } catch (err) {
    console.error("Erreur sendResetEmail :", err)
    return { success: false, message: "Erreur lors de l'envoi du mail" }
  }
}

// --- Réinitialise le mot de passe ---
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Vérifie et décode le token JWT
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const user_id = decoded.user_id.toString()

    // Vérifie la présence du token en DB
    const db = await getDBInstance()
    const [rows]: any = await db.execute(
      "SELECT * FROM JWT_Tokens WHERE token = ? AND object = 'reinit' AND user_id = ?",
      [token, user_id]
    )
    if (rows.length === 0) throw new Error("Token invalide ou expiré")

    // Vérifie la sécurité du nouveau mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/
    if (!passwordRegex.test(newPassword)) {
      return {
        success: false,
        message:
          "Le mot de passe doit contenir au moins 12 caractères, 1 majuscule, 1 minuscule et 1 chiffre.",
      }
    }

    // Hash du nouveau mot de passe
    const hash = await bcrypt.hash(newPassword, 10)

    // Met à jour le mot de passe (colonne `hash`, comme dans register)
    await db.execute("UPDATE Users SET hash = ? WHERE user_id = ?", [hash, user_id])

    // Supprime le token pour empêcher réutilisation
    await db.execute("DELETE FROM JWT_Tokens WHERE token = ?", [token])

    return { success: true, message: "Mot de passe réinitialisé avec succès !" }
  } catch (err) {
    console.error("Erreur resetPassword :", err)
    return { success: false, message: "Token invalide ou expiré" }
  }
}
