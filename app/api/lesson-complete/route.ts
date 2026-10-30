import { NextResponse } from "next/server";
import { ensureSchema, getPool } from "../_lib/schema";

const lessonRules = {
  "lesson-001-sets": { passingScore: 80, xpReward: 20, unlocksLevel: 2 },
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const studentId = typeof body.studentId === "string" ? body.studentId.slice(0, 64) : "";
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
  const score = Number.isFinite(body.score) ? Math.max(0, Math.min(100, Math.round(body.score))) : -1;
  const rule = lessonRules[lessonId as keyof typeof lessonRules];

  if (!studentId || !rule || score < 0) return NextResponse.json({ error: "Invalid lesson completion." }, { status: 400 });
  const passed = score >= rule.passingScore;
  const database = getPool();
  if (!database) return NextResponse.json({ persisted: false, passed, awarded: false, xpAwarded: 0, reason: "database_unavailable" });

  try {
    await ensureSchema();
    const connection = await database.getConnection();
    try {
      await connection.beginTransaction();
      const [studentRows] = await connection.query("SELECT id, xp, level FROM footstep_students WHERE id = ? LIMIT 1 FOR UPDATE", [studentId]);
      const student = Array.isArray(studentRows) ? studentRows[0] as { id: string; xp: number; level: number } | undefined : undefined;
      if (!student) {
        await connection.rollback();
        return NextResponse.json({ persisted: false, passed, awarded: false, xpAwarded: 0, reason: "student_not_found" }, { status: 404 });
      }
      if (!passed) {
        await connection.commit();
        return NextResponse.json({ persisted: true, passed: false, awarded: false, xpAwarded: 0, level: student.level });
      }

      const [insertResult] = await connection.query(
        "INSERT IGNORE INTO footstep_lesson_completions (student_id, lesson_id, score, xp_awarded) VALUES (?, ?, ?, ?)",
        [studentId, lessonId, score, rule.xpReward],
      );
      const inserted = typeof insertResult === "object" && insertResult !== null && "affectedRows" in insertResult && Number(insertResult.affectedRows) === 1;
      if (!inserted) {
        await connection.commit();
        return NextResponse.json({ persisted: true, passed: true, awarded: false, alreadyCompleted: true, xpAwarded: 0, level: Math.max(student.level, rule.unlocksLevel) });
      }

      await connection.query(
        `UPDATE footstep_students
         SET xp = xp + ?, level = GREATEST(level, ?), completed_level1 = IF(? = 'lesson-001-sets', TRUE, completed_level1), unlocked_level2 = IF(? = 'lesson-001-sets', TRUE, unlocked_level2), updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [rule.xpReward, rule.unlocksLevel, lessonId, lessonId, studentId],
      );
      await connection.commit();
      return NextResponse.json({ persisted: true, passed: true, awarded: true, alreadyCompleted: false, xpAwarded: rule.xpReward, level: rule.unlocksLevel });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("lesson completion persistence failed", error);
    return NextResponse.json({ persisted: false, passed, awarded: false, xpAwarded: 0, reason: "database_error" });
  }
}
