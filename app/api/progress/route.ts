import { NextResponse } from "next/server";
import { ensureSchema, getPool } from "../_lib/schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id.slice(0, 64) : "";
  const xp = Number.isFinite(body.xp) ? Math.max(0, Math.min(999999, Math.round(body.xp))) : 0;
  const streak = Number.isFinite(body.streak) ? Math.max(0, Math.min(9999, Math.round(body.streak))) : 0;
  const level = Number.isFinite(body.level) ? Math.max(0, Math.min(99, Math.round(body.level))) : 0;
  const completedLevel0 = Boolean(body.completedLevel0);

  if (!id) return NextResponse.json({ error: "Student id is required." }, { status: 400 });
  const database = getPool();
  if (!database) return NextResponse.json({ persisted: false, reason: "database_unavailable" });

  try {
    await ensureSchema();
    const [result] = await database.query(
      `UPDATE footstep_students
       SET xp = GREATEST(xp, ?), streak = GREATEST(streak, ?), level = GREATEST(level, ?),
           completed_level0 = (completed_level0 OR ?), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [xp, streak, level, completedLevel0 ? 1 : 0, id],
    );
    const affectedRows = typeof result === "object" && result !== null && "affectedRows" in result ? Number(result.affectedRows) : 0;
    if (!affectedRows) return NextResponse.json({ persisted: false, reason: "student_not_found" }, { status: 404 });
    return NextResponse.json({ persisted: true, affectedRows });
  } catch (error) {
    console.error("progress persistence failed", error);
    return NextResponse.json({ persisted: false, reason: "database_error" });
  }
}
