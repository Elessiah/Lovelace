import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[POST /api/chat/start] body =", body);

    const token = req.cookies.get("token")?.value;
    if (!token) {
      console.warn("[POST /api/chat/start] Token manquant");
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
      console.log("[POST /api/chat/start] JWT decoded:", decoded);
    } catch (err) {
      console.error("[POST /api/chat/start] JWT invalide:", err);
      return NextResponse.json({ success: false, message: "Token invalide" }, { status: 401 });
    }

    const id_auteur = decoded.id_user;
    const id_destinataire = Number(body.id_destinataire);

    if (!id_destinataire || isNaN(id_destinataire)) {
      console.warn("[POST /api/chat/start] Destinataire manquant ou invalide");
      return NextResponse.json({ success: false, message: "Destinataire manquant ou invalide" }, { status: 400 });
    }

    if (id_destinataire === id_auteur) {
      console.warn("[POST /api/chat/start] Tentative de se chater soi-même");
      return NextResponse.json({ success: false, message: "Impossible de se chater soi-même" }, { status: 400 });
    }

    // Vérifie si le chat existe déjà
    const [rows] = await db.execute(
      "SELECT id_chat, chat_key FROM Chat WHERE (id_auteur = ? AND id_destinataire = ?) OR (id_auteur = ? AND id_destinataire = ?)",
      [id_auteur, id_destinataire, id_destinataire, id_auteur]
    ) as any[];
    console.log("[POST /api/chat/start] Chats existants:", rows);

    let id_chat: number;
    let chat_key: string;

    if (rows.length > 0) {
      id_chat = rows[0].id_chat;
      chat_key = rows[0].chat_key;
      console.log("[POST /api/chat/start] Chat existant trouvé, id_chat =", id_chat);
    } else {
      chat_key = crypto.randomBytes(32).toString("hex"); // 256-bit clé AES
      console.log("[POST /api/chat/start] Création d'un nouveau chat avec clé =", chat_key);

      const [result] = await db.execute(
        "INSERT INTO Chat (id_auteur, id_destinataire, chat_key, encrypted_msg) VALUES (?, ?, ?, ?)",
        [id_auteur, id_destinataire, chat_key, JSON.stringify([])]
      ) as any[];
      id_chat = result.insertId;
      console.log("[POST /api/chat/start] Nouveau chat créé, id_chat =", id_chat);
    }

    return NextResponse.json({ success: true, id_chat, chat_key });
  } catch (err) {
    console.error("[POST /api/chat/start] Erreur serveur:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
