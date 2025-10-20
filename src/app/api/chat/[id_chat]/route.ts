import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const db = await getDBInstance();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const id_user = decoded.id_user;

    // Récupère id_chat depuis l'URL
    const id_chat_str = req.nextUrl.pathname.split("/").pop();
    const id_chat = parseInt(id_chat_str || "");
    if (isNaN(id_chat)) return NextResponse.json({ success: false, message: "Chat invalide" }, { status: 400 });

    const [rows]: any = await db.execute(
      `SELECT * FROM Chats WHERE chat_id = ? AND (author_id = ? OR receiver_id = ?)`,
      [id_chat, id_user, id_user]
    );
    if (rows.length === 0) return NextResponse.json({ success: false, message: "Chat non trouvé" }, { status: 404 });

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("[GET] /api/chat/[id_chat] error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const id_user = decoded.id_user;

    const id_chat_str = req.nextUrl.pathname.split("/").pop();
    const id_chat = parseInt(id_chat_str || "");
    if (isNaN(id_chat)) return NextResponse.json({ success: false, message: "Chat invalide" }, { status: 400 });

    const body = await req.json();
    const message = body.message;
    if (!message) return NextResponse.json({ success: false, message: "Message vide" }, { status: 400 });

    const db = await getDBInstance();
    const [rows]: any = await db.execute(
      `SELECT * FROM Chats WHERE chat_id = ? AND (author_id = ? OR receiver_id = ?)`,
      [id_chat, id_user, id_user]
    );
    if (rows.length === 0) return NextResponse.json({ success: false, message: "Chat non trouvé" }, { status: 404 });

    const chat = rows[0];
    if (!chat.chat_key) return NextResponse.json({ success: false, message: "Clé de chat manquante" }, { status: 500 });

    const key = Buffer.from(chat.chat_key, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    const newMsg = { auteur: id_user, msg: encrypted, iv: iv.toString("hex"), timestamp: Date.now() };
    const msgs = chat.encrypted_msg ? JSON.parse(chat.encrypted_msg) : [];
    msgs.push(newMsg);

    await db.execute(`UPDATE Chats SET encrypted_msg = ? WHERE chat_id = ?`, [JSON.stringify(msgs), id_chat]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST] /api/chat/[id_chat] error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
