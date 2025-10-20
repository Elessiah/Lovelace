import mysql, { Pool } from "mysql2/promise";

export const db: Pool = mysql.createPool({
  host: process.env.MYSQL_HOST!,
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🔹 Fonction pour créer les tables si elles n'existent pas
async function initTables() {
  try {
    // Users
    await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id_user                       INT         AUTO_INCREMENT        PRIMARY KEY,
        role                          TEXT        NOT NULL,
        last_name                     TEXT        NOT NULL,
        first_name                    TEXT        NOT NULL,
        email                         TEXT        NOT NULL,
        hash                          TEXT        NOT NULL,
        status                        TEXT        NOT NULL,
        pp_path                       TEXT        NOT NULL
      )
    `);

    // JWT Tokens
    await db.query(`
      CREATE TABLE IF NOT EXISTS JWT_Tokens (
        token                         TEXT        NOT NULL,
        creation_date                 DATE        NOT NULL,
        id_user                       INT         NOT NULL,
        object                        TEXT        NOT NULL,
        FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
      )
    `);

    // Ambassador Info
    await db.query(`
      CREATE TABLE IF NOT EXISTS Ambassador_Info (
        id_ambassador                 INT         AUTO_INCREMENT        PRIMARY KEY,
        id_user                       INT         NOT NULL,
        biographie                    TEXT        NOT NULL,
        parcours                      TEXT        NOT NULL,
        domaine                       TEXT        NOT NULL,
        metier                        TEXT        NOT NULL,
        entreprise                    TEXT        NOT NULL,
        pitch                         TEXT        NOT NULL,
        FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
      )
    `);

    // Projets
    await db.query(`
      CREATE TABLE IF NOT EXISTS Projets (
        id_ambassador                 INT         NOT NULL,
        projet_titre                  TEXT        NOT NULL,
        projet                        TEXT        NOT NULL,
        projet_photo_path             TEXT        NOT NULL,
        FOREIGN KEY (id_ambassador) REFERENCES Ambassador_Info(id_ambassador) ON DELETE CASCADE
      )
    `);

    // Chat
    await db.query(`
      CREATE TABLE IF NOT EXISTS Chat (
        id_chat                       INT         AUTO_INCREMENT        PRIMARY KEY,
        id_auteur                     INT         NOT NULL,
        id_destinataire               INT         NOT NULL,
        chat_key                      TEXT        NOT NULL,
        encrypted_msg                 TEXT        NOT NULL,
        FOREIGN KEY (id_auteur) REFERENCES Users(id_user) ON DELETE CASCADE,
        FOREIGN KEY (id_destinataire) REFERENCES Users(id_user) ON DELETE CASCADE
      )
    `);

    console.log("✅ Tables initialisées avec succès");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation des tables :", err);
  }
}

// 🔹 Initialisation immédiate au moment de l'import
initTables();
