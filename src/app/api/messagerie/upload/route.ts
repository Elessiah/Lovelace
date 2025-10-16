import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const UPLOAD_DIR = path.join(process.cwd(), "UPLOADED_FILES");

// 🟢 Crée le dossier si besoin
async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * ✅ POST → Upload fichier
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const id_user = decoded.id_user;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const id_chat = formData.get("id_chat") as string;

    if (!file || !id_chat)
      return NextResponse.json({ success: false, message: "Paramètres manquants" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ success: false, message: "Type non autorisé" }, { status: 400 });

    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ success: false, message: "Fichier trop volumineux (10 Mo max)" }, { status: 400 });

    await ensureUploadDir();

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}_${safeName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    // 🔹 Ajoute le message dans le chat 
    const [rows]: any = await db.execute(`SELECT * FROM Chat WHERE id_chat = ?`, [id_chat]);
    if (!rows.length) return NextResponse.json({ success: false, message: "Chat introuvable" }, { status: 404 });

    const chat = rows[0];
    const msgs = chat.encrypted_msg ? JSON.parse(chat.encrypted_msg) : [];
    msgs.push({
      auteur: id_user,
      msg: `FICHIER:${fileName}`,
      iv: null,
      timestamp: Date.now(),
    });

    await db.execute(`UPDATE Chat SET encrypted_msg = ? WHERE id_chat = ?`, [JSON.stringify(msgs), id_chat]);

    return NextResponse.json({ success: true, message: "Fichier envoyé", fileName });
  } catch (err) {
    console.error("[UPLOAD] erreur:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * ✅ GET → Lire un fichier (protégé par token)
 * Exemple : /api/messagerie/upload?file=nom_du_fichier.png
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET!);

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");
    if (!fileName)
      return NextResponse.json({ success: false, message: "Nom de fichier manquant" }, { status: 400 });

    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = path.join(UPLOAD_DIR, safeName);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();

      let contentType = "application/octet-stream";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".pdf") contentType = "application/pdf";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${safeName}"`,
        },
      });
    } catch {
      return NextResponse.json({ success: false, message: "Fichier introuvable" }, { status: 404 });
    }
  } catch (err) {
    console.error("[GET upload] erreur:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
