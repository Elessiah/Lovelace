// hashage
//      const hash = await bcrypt.hash(password, id_user);
//      await db.save({ email, hash });

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import crypto from "crypto"
import { sendConfirmationEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    // 🔹 Récupération des champs du formulaire
    const formData = await req.formData()
    const email = formData.get("email") as string
    const password = formData.get("mdp") as string
    const first_name = (formData.get("nom") as string) || ""
    const last_name = (formData.get("prenom") as string) || ""
    const status = (formData.get("status") as string) || "Utilisateur" // "Utilisateur" ou "Ambassadrice"

    // 🔹 Hash du mot de passe
    const hash = await bcrypt.hash(password, 10)

    // 🔹 Générer un token unique pour la confirmation par mail
    const token = crypto.randomBytes(32).toString("hex")

    // 🔹 Insérer le nouvel utilisateur dans la table MySQL
    const sql =
      "INSERT INTO Users (email, first_name, last_name, hash, token, status) VALUES (?, ?, ?, ?, ?, ?)"
    await db.execute(sql, [email, first_name, last_name, hash, token, status])

    // 🔹 Envoi du mail de confirmation via OVH
    await sendConfirmationEmail(email, token)

    // Pas de message visible — succès silencieux côté frontend
    return new Response(null, { status: 200 })
  } catch (err) {
    console.error("Erreur lors de l’inscription :", err)
    return new Response(null, { status: 500 })
  }
}

export {}