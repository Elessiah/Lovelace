import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const db = await getDBInstance();
    const id_chat = Number(req.nextUrl.searchParams.get("id_chat"));
    console.log("[GET /api/chat] id_chat =", id_chat);

    if (!id_chat) {
      console.warn("[GET /api/chat] id_chat manquant");
      return NextResponse.json({ success: false, message: "id_chat manquant" }, { status: 400 });
    }

    const [rows] = await db.execute(`SELECT * FROM Chats WHERE chat_id = ?`, [id_chat]) as any[];
    console.log("[GET /api/chat] DB rows:", rows);

    if (rows.length === 0) {
      console.warn("[GET /api/chat] Chat non trouvé");
      return NextResponse.json({ success: false, message: "Chat non trouvé" }, { status: 404 });
    }

    const chat = rows[0];
    if (!chat.encrypted_msg) chat.encrypted_msg = JSON.stringify([]);
    return NextResponse.json({ success: true, data: chat });
  } catch (err) {
    console.error("[GET /api/chat] Erreur serveur:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDBInstance();
    const { id_chat, message, userId } = await req.json();
    console.log("[POST /api/chat] body =", { id_chat, message, userId });

    if (!id_chat || !message || !userId) {
      console.warn("[POST /api/chat] Paramètres manquants");
      return NextResponse.json({ success: false, message: "Paramètres manquants" }, { status: 400 });
    }

    const [rows] = await db.execute(`SELECT * FROM Chats WHERE chat_id = ?`, [id_chat]) as any[];
    console.log("[POST /api/chat] DB rows:", rows);

    if (rows.length === 0) {
      console.warn("[POST /api/chat] Chat non trouvé");
      return NextResponse.json({ success: false, message: "Chat non trouvé" }, { status: 404 });
    }

    const chat = rows[0];
    if (!chat.chat_key) {
      console.error("[POST /api/chat] Clé de chat manquante");
      return NextResponse.json({ success: false, message: "Clé de chat manquante" }, { status: 500 });
    }

    const key = Buffer.from(chat.chat_key, "hex");
    const iv = crypto.randomBytes(16);
    console.log("[POST /api/chat] key et iv générés");

    // Chiffrement AES-256-CBC
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");
    console.log("[POST /api/chat] message chiffré =", encrypted);

    const newMsg = {
      auteur: userId,
      msg: encrypted,
      iv: iv.toString("hex"),
      timestamp: Date.now(),
    };
    console.log("[POST /api/chat] newMsg =", newMsg);

    // Parser messages existants ou tableau vide
    let msgs: any[] = [];
    try {
      msgs = chat.encrypted_msg ? JSON.parse(chat.encrypted_msg) : [];
    } catch {
      console.warn("[POST /api/chat] encrypted_msg mal formé, reset à []");
      msgs = [];
    }

    msgs.push(newMsg);
    console.log("[POST /api/chat] msgs updated =", msgs);

    await db.execute(`UPDATE Chats SET encrypted_msg = ? WHERE chat_id = ?`, [JSON.stringify(msgs), id_chat]);
    console.log("[POST /api/chat] DB updated avec nouveau message");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/chat] Erreur serveur:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
