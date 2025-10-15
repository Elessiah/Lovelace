import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import jwt from "jsonwebtoken"
import fs from "fs"
import path from "path"
import { sendConfirmationEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const role = (formData.get("role") as string) || "Utilisateur"
    const last_name = formData.get("prenom") as string
    const first_name = formData.get("nom") as string
    const email = formData.get("email") as string
    const password = formData.get("mdp") as string
    const pp = formData.get("pp") as File | ""
    const status = "pending"

    // Champs manquants
    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json({ success: false, message: "Champs manquants" }, { status: 400 })
    }

    // Vérifier email existant
    const [existing]: any = await db.execute("SELECT id_user FROM Users WHERE email = ?", [email])
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Cette adresse email est déjà utilisée" }, { status: 400 })
    }

    // Vérifier mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json({
        success: false,
        message: "Le mot de passe doit contenir au moins 12 caractères, 1 majuscule, 1 minuscule et 1 chiffre"
      }, { status: 400 })
    }

    // Hash
    const hash = await bcrypt.hash(password, 10)

    // Insertion
    const sql = "INSERT INTO Users (role, last_name, first_name, email, hash, status, pp_path) VALUES (?, ?, ?, ?, ?, ?, ?)"
    const [result]: any = await db.execute(sql, [role, last_name, first_name, email, hash, status, ""])
    const id_user = result.insertId

    // Photo de profil
    if (pp && pp.size) {
      const buffer = Buffer.from(await pp.arrayBuffer())
      const ext = path.extname(pp.name) || ".png"
      const fileName = `pp_${id_user}${ext}`
      const uploadDir = path.join(process.cwd(), "public", "IMG_DATA")
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      fs.writeFileSync(path.join(uploadDir, fileName), buffer)
      await db.execute("UPDATE Users SET pp_path = ? WHERE id_user = ?", [`/IMG_DATA/${fileName}`, id_user])
    }

    // Token JWT
    const signupToken = jwt.sign({ id_user }, process.env.JWT_SECRET!, { expiresIn: "1h" })
    await db.execute("INSERT INTO JWT_Tokens (token, creation_date, id_user, object) VALUES (?, NOW(), ?, ?)", [signupToken, id_user, "signup"])

    // Mail de confirmation
    await sendConfirmationEmail(email, signupToken)

    // Réponse succès
    return NextResponse.json({ success: true, message: "Inscription réussie ! Vérifie ton mail pour confirmer." }, { status: 200 })
  } catch (err) {
    console.error("Erreur lors de l’inscription :", err)
    return NextResponse.json({ success: false, message: "Erreur serveur lors de l'inscription" }, { status: 500 })
  }
}
