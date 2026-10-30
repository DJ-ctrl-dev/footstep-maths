import mysql, { type Pool } from "mysql2/promise";

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  pool ??= mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 4 });
  return pool;
}

async function addMissingStudentColumns(database: Pool) {
  const [rows] = await database.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'footstep_students'");
  const columns = new Set(Array.isArray(rows) ? rows.map((row) => String((row as { COLUMN_NAME?: string }).COLUMN_NAME ?? "")) : []);
  if (!columns.has("completed_level1")) await database.query("ALTER TABLE footstep_students ADD COLUMN completed_level1 BOOLEAN NOT NULL DEFAULT FALSE");
  if (!columns.has("unlocked_level2")) await database.query("ALTER TABLE footstep_students ADD COLUMN unlocked_level2 BOOLEAN NOT NULL DEFAULT FALSE");
}

async function initializeSchema(database: Pool) {
  await database.query(`
    CREATE TABLE IF NOT EXISTS footstep_students (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      xp INT NOT NULL DEFAULT 0,
      streak INT NOT NULL DEFAULT 0,
      level INT NOT NULL DEFAULT 0,
      completed_level0 BOOLEAN NOT NULL DEFAULT FALSE,
      completed_level1 BOOLEAN NOT NULL DEFAULT FALSE,
      unlocked_level2 BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await addMissingStudentColumns(database);
  await database.query(`
    CREATE TABLE IF NOT EXISTS footstep_lesson_completions (
      student_id VARCHAR(64) NOT NULL,
      lesson_id VARCHAR(100) NOT NULL,
      score INT NOT NULL,
      xp_awarded INT NOT NULL,
      completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, lesson_id)
    )
  `);
}

export async function ensureSchema() {
  const database = getPool();
  if (!database) return false;
  schemaReady ??= initializeSchema(database);
  await schemaReady;
  return true;
}
