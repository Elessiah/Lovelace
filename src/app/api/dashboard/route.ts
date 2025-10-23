import { NextRequest, NextResponse } from "next/server";
import { getDBInstance } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

// Helper pour sauvegarder un fichier
async function saveFile(file: File, filename: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const destPath = path.join(process.cwd(), "public", "IMG_DATA", filename);
  fs.writeFileSync(destPath, buffer);
  return `/IMG_DATA/${filename}`;
}

// GET /api/dashboard
export async function GET(req: NextRequest) {
  try {
    const db = await getDBInstance();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const [rows]: any = await db.execute(
      `SELECT user_id, email, first_name, last_name, age, role, status, pp_path FROM Users WHERE user_id = ?`,
      [decoded.user_id]
    );
    if (!rows.length) return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 });
    const user: UserDashboard = rows[0];
    if (user.status !== "active") return NextResponse.json({ success: false, message: "Compte non actif", status: 403 });

    let ambassadorInfo: AmbassadorInfo | null = null;
    if (user.role === "Model") {
      const [ambaRows]: any = await db.execute(
        `SELECT * FROM Ambassador_Info WHERE user_id = ?`,
        [user.user_id]
      );
      ambassadorInfo = ambaRows[0] || null;
      if (ambassadorInfo) {
        const [projects]: any = await db.execute(
            `SELECT *
             FROM Projects
             WHERE ambassador_id = ?`,
            [ambaRows[0]?.ambassador_id || 0]
        );
        ambassadorInfo.projects = projects || [];
      }
    }

    return NextResponse.json({ success: true, data: { ...user, ambassadorInfo } });
  } catch (err) {
    console.error("[GET] Erreur serveur :", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/dashboard?deleteProject=ID
export async function DELETE(req: NextRequest) {
  try {
    const db = await getDBInstance();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const projectId = req.nextUrl.searchParams.get("deleteProject");
    if (!projectId) return NextResponse.json({ success: false, message: "ID projet manquant" }, { status: 400 });

    // Supprimer fichier
    const [projRows]: any = await db.execute(`SELECT project_photo_path FROM Projects WHERE project_id = ?`, [projectId]);
    if (projRows[0]?.projet_photo_path) {
      const filePath = path.join(process.cwd(), "public", projRows[0].projet_photo_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.execute(`DELETE FROM Projects WHERE project_id = ?`, [projectId]);
    return NextResponse.json({ success: true, message: "Projet supprimé" });
  } catch (err) {
    console.error("[DELETE] Erreur serveur :", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/dashboard
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const formData = await req.formData();

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const first_name = formData.get("first_name")?.toString();
    const last_name = formData.get("last_name")?.toString();
    const role = formData.get("role")?.toString();
    const bio = formData.get("bio")?.toString();
    const parcours = formData.get("parcours")?.toString();
    const domaine = formData.get("domaine")?.toString();
    const metier = formData.get("metier")?.toString();
    const pitch = formData.get("pitch")?.toString();
    const entreprise = formData.get("entreprise")?.toString();

    // Photo profil
    let pp_path;
    const ppFile = formData.get("pp_path") as File | null;
    if (ppFile) {
      const ext = ppFile.name.split(".").pop();
      const fileName = `pp_${decoded.user_id}.${ext}`;
      pp_path = await saveFile(ppFile, fileName);
    }

    // Update Users
    const updates: string[] = [];
    const values: any[] = [];

    if (email) { updates.push("email = ?"); values.push(email); }
    if (first_name) { updates.push("first_name = ?"); values.push(first_name); }
    if (last_name) { updates.push("last_name = ?"); values.push(last_name); }
    if (pp_path) { updates.push("pp_path = ?"); values.push(pp_path); }

    // 🔒 Vérification du mot de passe
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;
      if (!passwordRegex.test(password)) {
        return NextResponse.json({
          success: false,
          message: "Le mot de passe doit contenir au moins 12 caractères, 1 majuscule, 1 minuscule et 1 chiffre"
        }, { status: 400 });
      }

      const hash = await bcrypt.hash(password, 10);
      updates.push("hash = ?");
      values.push(hash);
    }

    const db = await getDBInstance();
    if (updates.length) {
      values.push(decoded.user_id);
      await db.execute(`UPDATE Users SET ${updates.join(", ")} WHERE user_id = ?`, values);
    }

    // Update Ambassadrice
    if (role === "Model") {
      const [ambaRows]: any = await db.execute(`SELECT ambassador_id FROM Ambassador_Info WHERE user_id = ?`, [decoded.user_id]);
      const ambassador_id = ambaRows[0]?.ambassador_id;
      if (!ambassador_id) return NextResponse.json({ success: false, message: "Ambassadrice non trouvée" }, { status: 404 });

      const ambaUpdates: string[] = [];
      const ambaValues: any[] = [];
      if (bio) { ambaUpdates.push("biographie = ?"); ambaValues.push(bio); }
      if (parcours) { ambaUpdates.push("parcours = ?"); ambaValues.push(parcours); }
      if (domaine) { ambaUpdates.push("domaine = ?"); ambaValues.push(domaine); }
      if (metier) { ambaUpdates.push("metier = ?"); ambaValues.push(metier); }
      if (pitch) { ambaUpdates.push("pitch = ?"); ambaValues.push(pitch); }
      if (entreprise) { ambaUpdates.push("entreprise = ?"); ambaValues.push(entreprise); }

      if (ambaUpdates.length) {
        ambaValues.push(ambassador_id);
        await db.execute(`UPDATE Ambassador_Info SET ${ambaUpdates.join(", ")} WHERE ambassador_id = ?`, ambaValues);
      }

      // Projets
      const projectsFiles = formData.getAll("projets") as File[];
      for (const file of projectsFiles) {
        const i = projectsFiles.indexOf(file);
        const titre = formData.get(`projet_titre_${i}`)?.toString() || "";
        const description = formData.get(`projet_description_${i}`)?.toString() || "";
        const ext = file.name.split(".").pop();
        const fileName = `projet_${Date.now()}_${ambassador_id}.${ext}`;
        const photo_path = await saveFile(file, fileName);

        db.execute(
          `INSERT INTO Projects (ambassador_id, project_title, project_description, project_photo_path) VALUES (?, ?, ?, ?)`,
          [ambassador_id, titre, description, photo_path]
        );
      }
    }

    return NextResponse.json({ success: true, message: "Infos mises à jour" });
  } catch (err) {
    console.error("[POST] Erreur serveur :", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
