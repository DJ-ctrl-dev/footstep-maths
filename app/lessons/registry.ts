import type { LessonDefinition } from "./types";
import { lesson001Sets } from "./lesson-001-sets";

export const lessonRegistry: Record<string, LessonDefinition> = {
  [lesson001Sets.id]: lesson001Sets,
};

export const availableLessons = Object.values(lessonRegistry);

export function getLesson(id: string) {
  return lessonRegistry[id];
}
