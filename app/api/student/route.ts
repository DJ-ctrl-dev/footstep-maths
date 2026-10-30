import { NextResponse } from "next/server";
import { ensureSchema, getPool } from "../_lib/schema";
import { studentIdFor } from "../../lib/student-id";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 255) : "";

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Please provide a name and valid email." }, { status: 400 });
  }

  const database = getPool();
  if (!database) return NextResponse.json({ persisted: false, reason: "database_unavailable" });

  try {
    await ensureSchema();
    const id = studentIdFor(email);
    await database.query(
      `INSERT INTO footstep_students (id, name, email) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = CURRENT_TIMESTAMP`,
      [id, name, email],
    );
    const [rows] = await database.query("SELECT * FROM footstep_students WHERE id = ? LIMIT 1", [id]);
    return NextResponse.json({ persisted: true, student: Array.isArray(rows) ? rows[0] : null });
  } catch (error) {
    console.error("student persistence failed", error);
    return NextResponse.json({ persisted: false, reason: "database_error" });
  }
}
