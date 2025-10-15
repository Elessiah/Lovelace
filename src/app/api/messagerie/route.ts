import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// GET : lister tous les chats de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const id_user = decoded.id_user;

    const [chats]: any = await db.execute(
      `SELECT * FROM Chat WHERE id_auteur = ? OR id_destinataire = ?`,
      [id_user, id_user]
    );

    return NextResponse.json({ success: true, data: chats });
  } catch (err) {
    console.error("[GET] /api/messagerie error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// POST : envoyer un message
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const id_user = decoded.id_user;

    const { id_chat, message } = await req.json();
    if (!id_chat || !message) return NextResponse.json({ success: false, message: "Paramètres manquants" }, { status: 400 });

    // Récupère le chat
    const [rows]: any = await db.execute(`SELECT * FROM Chat WHERE id_chat = ?`, [id_chat]);
    if (rows.length === 0) return NextResponse.json({ success: false, message: "Chat non trouvé" }, { status: 404 });

    const chat = rows[0];
    if (!chat.chat_key) return NextResponse.json({ success: false, message: "Clé de chat manquante" }, { status: 500 });

    // Chiffrement AES
    const key = Buffer.from(chat.chat_key, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    const newMsg = {
      auteur: id_user,
      msg: encrypted,
      iv: iv.toString("hex"),
      timestamp: Date.now(),
    };

    const msgs = chat.encrypted_msg ? JSON.parse(chat.encrypted_msg) : [];
    msgs.push(newMsg);

    await db.execute(`UPDATE Chat SET encrypted_msg = ? WHERE id_chat = ?`, [JSON.stringify(msgs), id_chat]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST] /api/messagerie error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
