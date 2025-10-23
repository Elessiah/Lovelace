// /app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDBInstance } from "@/lib/db"

// Map pour tracker les tentatives : clé = IP, valeur = tableau de timestamps
const loginAttempts = new Map<string, number[]>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 1000 // 1 minute

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email as string)
    const password = (body.password as string);

    // récupérer IP
    const ipHeader = req.headers.get("x-forwarded-for")
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown"

    // Nettoyer les anciennes tentatives
    const now = Date.now()
    const attempts = loginAttempts.get(ip) || []
    const recentAttempts = attempts.filter(timestamp => now - timestamp < WINDOW_MS)

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, message: "Trop de tentatives. Réessaie dans une minute." },
        { status: 429 }
      )
    }

    // ajouter tentative actuelle
    recentAttempts.push(now)
    loginAttempts.set(ip, recentAttempts)

    // validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email et mot de passe requis." },
        { status: 400 }
      )
    }

    const db = await getDBInstance();
    const [rows]: any = await db.execute(
      "SELECT user_id, hash, role, status FROM Users WHERE email = ?",
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email ou mot de passe invalide." },
        { status: 401 }
      )
    }

    const user: UserLogin = rows[0];

    // vérifier le mot de passe
    const match = await bcrypt.compare(password, user.hash)
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Email ou mot de passe invalide." },
        { status: 401 }
      )
    }

    // vérifier statut
    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message:
            user.status === "pending"
              ? "Compte non confirmé : vérifie ton email."
              : user.status === "manual_pending"
              ? "Compte en attente de validation par l'administrateur."
              : "Compte non activé.",
        },
        { status: 403 }
      )
    }

    // créer JWT (1h)
    const payload = { user_id: user.user_id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

    // stocker le token pour historique ou révocation
    await db.execute(
      "INSERT INTO JWT_Tokens (token, creation_date, user_id, object) VALUES (?, NOW(), ?, ?)",
      [token, user.user_id, "login"]
    );

    // redirection après login
    const redirect = `/dashboard/${user.user_id}`;

    // créer réponse JSON
    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie.",
      token,
      redirect,
    });

    // ajouter cookie HttpOnly
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      maxAge: 60 * 60, // 1h
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("Erreur POST /api/login :", err)
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    )
  }
}

export {}
