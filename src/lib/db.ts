import mysql, { Pool } from "mysql2/promise";

let db: Pool | null = null;

export async function getDBInstance(): Promise<Pool> {
  if (!db) {
    db = mysql.createPool({
      host: process.env.MYSQL_HOST!,
      user: process.env.MYSQL_USER!,
      password: process.env.MYSQL_PASSWORD!,
      database: process.env.MYSQL_DATABASE!,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    await initTables(db)
  }
  return db;
}

// Fonction pour créer les tables si elles n'existent pas
async function initTables(db: Pool) {
  try {
    // Users
    await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id                       INT         AUTO_INCREMENT        PRIMARY KEY,
        role                          TEXT        NOT NULL,
        last_name                     TEXT        NOT NULL,
        first_name                    TEXT        NOT NULL,
        email                         TEXT        NOT NULL,
        hash                          TEXT        NOT NULL,
        status                        TEXT        NOT NULL,
        pp_path                       TEXT        NOT NULL              DEFAULT '/IMG_DATA/pp_0.png'
      )
    `);

    // JWT Tokens
    await db.query(`
      CREATE TABLE IF NOT EXISTS JWT_Tokens (
        token                         TEXT        NOT NULL,
        creation_date                 DATE        NOT NULL,
        user_id                       INT         NOT NULL,
        object                        TEXT        NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);

    // Ambassador Info
    await db.query(`
      CREATE TABLE IF NOT EXISTS Ambassador_Info (
        ambassador_id                 INT         AUTO_INCREMENT        PRIMARY KEY,
        user_id                       INT         NOT NULL,
        biography                     TEXT        NOT NULL,
        background                    TEXT        NOT NULL,
        field_id                      INT         NOT NULL,
        job                           TEXT        NOT NULL,
        company                       TEXT        NOT NULL,
        pitch                         TEXT        NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);

    // Projects
    await db.query(`
      CREATE TABLE IF NOT EXISTS Projects (
        project_id                    INT         AUTO_INCREMENT        PRIMARY KEY,
        ambassador_id                 INT         NOT NULL,
        project_title                 TEXT        NOT NULL,
        project_description           TEXT        NOT NULL,
        project_photo_path            TEXT        NOT NULL,
        FOREIGN KEY (ambassador_id) REFERENCES Ambassador_Info(ambassador_id) ON DELETE CASCADE
      )
    `);

    // Chats
    await db.query(`
      CREATE TABLE IF NOT EXISTS Chats (
        chat_id                       INT         AUTO_INCREMENT        PRIMARY KEY,
        author_id                     INT         NOT NULL,
        receiver_id                   INT         NOT NULL,
        chat_key                      TEXT        NOT NULL,
        encrypted_msg                 TEXT        NOT NULL,
        FOREIGN KEY (author_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);

    // Fields of work
    await db.query(`
      CREATE TABLE IF NOT EXISTS Fields (
        field_id                       INT         AUTO_INCREMENT        PRIMARY KEY,
        display_name                   INT         NOT NULL,
      )
    `);

    console.log("✅ Tables initialisées avec succès");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation des tables :", err);
  }
}
