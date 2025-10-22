import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// 📁 Dossier d’upload sécurisé
const UPLOAD_DIR = path.join(process.cwd(), "UPLOADED_FILES");

// Assure-toi que le dossier existe
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// =====================================================
// 🟦 GET — liste les chats OU sert un fichier
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("file");

    // 🧩 Si on veut récupérer un fichier
    if (fileName) {
      const filePath = path.join(UPLOAD_DIR, path.basename(fileName)); // empêche les traversals
      if (!fs.existsSync(filePath))
        return NextResponse.json({ success: false, message: "Fichier introuvable" }, { status: 404 });

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      const mimeTypes: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".zip": "application/zip",
      };
      const mimeType = mimeTypes[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
        },
      });
    }

    // 🧩 Sinon, liste des chats
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user_id = decoded.user_id;

    const db = await getDBInstance();
    const [chats]: any = await db.execute(
      `
      SELECT 
        c.*, 
        ua.first_name AS auteur_first_name,
        ua.last_name AS auteur_last_name,
        ua.pp_path AS auteur_pp,
        ud.first_name AS dest_first_name,
        ud.last_name AS dest_last_name,
        ud.pp_path AS dest_pp
      FROM Chats c
      JOIN Users ua ON c.author_id = ua.user_id
      JOIN Users ud ON c.receiver_id = ud.user_id
      WHERE c.author_id = ? OR c.receiver_id = ?
      `,
      [user_id, user_id]
    );

    return NextResponse.json({ success: true, data: chats });
  } catch (err) {
    console.error("[GET] /api/messagerie error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// =====================================================
// 🟩 POST — envoyer message ou fichier
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user_id = decoded.user_id;
    const contentType = req.headers.get("content-type") || "";

    // 🧩 1. Envoi de fichier (multipart/form-data)
    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const id_chat = formData.get("id_chat");

      if (!file || !id_chat)
        return NextResponse.json({ success: false, message: "Fichier ou chat manquant" }, { status: 400 });

      const fileName = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}_${file.name.replace(/[^\w.]/g, "_")}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Ajoute le message "FICHIER:nom"
      await appendMessageToChat(Number(id_chat), user_id, `FICHIER:${fileName}`);

      return NextResponse.json({ success: true, file: fileName });
    }

    // 🧩 2. Envoi de message texte (JSON)
    const { id_chat, message } = await req.json();
    if (!id_chat || !message)
      return NextResponse.json({ success: false, message: "Paramètres manquants" }, { status: 400 });

    await appendMessageToChat(Number(id_chat), user_id, message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST] /api/messagerie error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// =====================================================
// 🔐 Fonction utilitaire pour ajouter un message
// =====================================================
async function appendMessageToChat(id_chat: number, user_id: number, message: string) {
  const db = await getDBInstance();
  const [rows]: any = await db.execute(`SELECT * FROM Chats WHERE chat_id = ?`, [id_chat]);
  if (rows.length === 0) throw new Error("Chat non trouvé");

  const chat = rows[0];
  if (!chat.chat_key) throw new Error("Clé de chat manquante");

  let newMsg;

  // Si c’est un fichier, on ne chiffre pas
  if (message.startsWith("FICHIER:")) {
    newMsg = {
      auteur: user_id,
      msg: message,
      iv: null,
      timestamp: Date.now(),
    };
  } else {
    // Chiffrement AES
    const key = Buffer.from(chat.chat_key, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    newMsg = {
      auteur: user_id,
      msg: encrypted,
      iv: iv.toString("hex"),
      timestamp: Date.now(),
    };
  }

  const msgs = chat.encrypted_msg ? JSON.parse(chat.encrypted_msg) : [];
  msgs.push(newMsg);

  await db.execute(`UPDATE Chats SET encrypted_msg = ? WHERE chat_id = ?`, [JSON.stringify(msgs), id_chat]);
}
