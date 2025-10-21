import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";
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

    const author_id = decoded.id_user;
    const receiver_id = Number(body.receiver_id);

    if (!receiver_id || isNaN(receiver_id)) {
      console.warn("[POST /api/chat/start] Destinataire manquant ou invalide");
      return NextResponse.json({ success: false, message: "Destinataire manquant ou invalide" }, { status: 400 });
    }

    if (receiver_id === author_id) {
      console.warn("[POST /api/chat/start] Tentative de se chater soi-même");
      return NextResponse.json({ success: false, message: "Impossible de se chater soi-même" }, { status: 400 });
    }

    // Vérifie si le chat existe déjà
    const db = await getDBInstance();
    const [rows] = await db.execute(
      "SELECT chat_id, chat_key FROM Chats WHERE (author_id = ? AND receiver_id = ?) OR (author_id = ? AND receiver_id = ?)",
      [author_id, receiver_id, receiver_id, author_id]
    ) as any[];
    console.log("[POST /api/chat/start] Chats existants:", rows);

    let chat_id: number;
    let chat_key: string;

    if (rows.length > 0) {
      chat_id = rows[0].chat_id;
      chat_key = rows[0].chat_key;
      console.log("[POST /api/chat/start] Chats existant trouvé, chat_id =", chat_id);
    } else {
      chat_key = crypto.randomBytes(32).toString("hex"); // 256-bit clé AES
      console.log("[POST /api/chat/start] Création d'un nouveau chat avec clé =", chat_key);

      const [result] = await db.execute(
        "INSERT INTO Chats (author_id, receiver_id, chat_key, encrypted_msg) VALUES (?, ?, ?, ?)",
        [author_id, receiver_id, chat_key, JSON.stringify([])]
      ) as any[];
      chat_id = result.insertId;
      console.log("[POST /api/chat/start] Nouveau chat créé, chat_id =", chat_id);
    }

    return NextResponse.json({ success: true, chat_id, chat_key });
  } catch (err) {
    console.error("[POST /api/chat/start] Erreur serveur:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
