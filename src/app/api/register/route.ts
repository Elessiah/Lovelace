 import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDBInstance } from "@/lib/db"
import jwt from "jsonwebtoken"
import fs from "fs"
import path from "path"
import { sendConfirmationEmail } from "@/lib/mailer"

 type registerData = {
  role : "User" | "Model"
  firstname : string
  lastname : string
  email : string
  password : string
 };

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as registerData;
    const status = "pending"

    // Champs manquants
    if (!data.email || !data.password || !data.firstname || !data.role || (data.role == "Model" && !data.lastname)) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
    }

    const db = await getDBInstance();
    // Vérifier email existant
    const [existing]: any = await db.execute("SELECT user_id FROM Users WHERE email = ?", [data.email])
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Cette adresse email est déjà utilisée" }, { status: 400 })
    }

    // Vérifier mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/
    if (!passwordRegex.test(data.password)) {
      return NextResponse.json({
        success: false,
        message: "Le mot de passe doit contenir au moins 12 caractères, 1 majuscule, 1 minuscule et 1 chiffre"
      }, { status: 400 })
    }

    // Hash
    const hash = await bcrypt.hash(data.password, 10)

    // Insertion
    const sql = "INSERT INTO Users (role, last_name, first_name, email, hash, status, pp_path) VALUES (?, ?, ?, ?, ?, ?, ?)"
    const [result]: any = await db.execute(sql, [data.role, data.lastname, data.firstname, data.email, hash, status, ""])
    const id_user = result.insertId

    // Photo de profil
    /*
    if (pp && pp.size) {
      const buffer = Buffer.from(await pp.arrayBuffer())
      const ext = path.extname(pp.name) || ".png"
      const fileName = `pp_${id_user}${ext}`
      const uploadDir = path.join(process.cwd(), "public", "IMG_DATA")
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      fs.writeFileSync(path.join(uploadDir, fileName), buffer)
      await db.execute("UPDATE Users SET pp_path = ? WHERE id_user = ?", [`/IMG_DATA/${fileName}`, id_user])
    }
     */

    // Token JWT
    const signupToken = jwt.sign({ id_user }, process.env.JWT_SECRET!, { expiresIn: "1h" })
    await db.execute("INSERT INTO JWT_Tokens (token, creation_date, user_id, object) VALUES (?, NOW(), ?, ?)", [signupToken, id_user, "register"])

    // Mail de confirmation
    await sendConfirmationEmail(data.email, signupToken)

    // Réponse succès
    return NextResponse.json({ success: true, message: "Inscription réussie ! Vérifie ton mail pour confirmer." }, { status: 200 })
  } catch (err) {
    console.error("Erreur lors de l’inscription :", err)
    return NextResponse.json({ success: false, message: "Erreur serveur lors de l'inscription" }, { status: 500 })
  }
}
