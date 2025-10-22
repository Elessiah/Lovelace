import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
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

// Envoie le mail de confirmation
export async function sendConfirmationEmail(to: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_URL}/confirm?token=${token}`

  await transporter.sendMail({
    from: `"Lovelace" <${process.env.SMTP_USER}>`,
    to,
    subject: "Confirme ton inscription",
    html: `<p>Bienvenue sur Lovelace ! Clique <a href="${url}">ici</a> pour confirmer ton email.</p>`,
  })
}

// Confirme un user via son token
export async function confirmUser(token: string) {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const user_id = decoded.user_id

    // Vérifie la validité du token
    const db = await getDBInstance();
    const [rows]: any = await db.execute(
      "SELECT * FROM JWT_Tokens WHERE token = ? AND object = 'register'",
      [token]
    )
    if (rows.length === 0) throw new Error("Token invalide ou déjà utilisé")

    // Récupère l'user
    const [users]: any = await db.execute("SELECT * FROM Users WHERE user_id = ?", [user_id])
    if (users.length === 0) throw new Error("Utilisateur non trouvé")
    const user = users[0]

    // Active selon le rôle
    if (user.role === "User") {
      await db.execute("UPDATE Users SET status = 'active' WHERE user_id = ?", [user_id])
    } else if (user.role === "Model") {
      await db.execute("UPDATE Users SET status = 'manual_pending' WHERE user_id = ?", [user_id])

      // Vérifie si déjà présent
      const [exists]: any = await db.execute(
        "SELECT ambassador_id FROM Ambassador_Info WHERE user_id = ?",
        [user_id]
      )

      if (exists.length === 0) {
        await db.execute(`
          INSERT INTO Ambassador_Info 
          (user_id, biography, background, field_id, job, pitch, company)
          VALUES (?, '', '', '', '', '', '')
        `, [user_id])
      }

      // Mail admin
      await transporter.sendMail({
        from: `"Lovelace" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `Nouvelle ambassadrice en attente: ${user.email}`,
        html: `<p>L'utilisatrice ${user.email} souhaite devenir ambassadrice.<br>
        Confirmez manuellement son inscription dans la DB (status = 'active').</p>`,
      })
    }

    // Supprime le token
    await db.execute("DELETE FROM JWT_Tokens WHERE token = ?", [token])

    return { success: true, message: "Compte confirmé !" }
  } catch (err) {
    console.error("Erreur confirmation :", err)
    return { success: false, message: "Token invalide ou expiré" }
  }
}
