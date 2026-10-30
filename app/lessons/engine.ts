import type { LessonDefinition, LessonStep } from "./types";
import type { VennRegion } from "./types";

export type LessonAnswers = Record<string, string>;

export type LessonResult = {
  lessonId: string;
  correct: number;
  total: number;
  score: number;
  passed: boolean;
};

export function isScoredStep(step: LessonStep): step is Extract<LessonStep, { kind: "multiple-choice" | "venn" }> {
  return step.kind === "multiple-choice" || step.kind === "venn";
}

export function gradeStep(step: LessonStep, answerId: string | undefined) {
  if (step.kind === "multiple-choice") return answerId === step.correctOptionId;
  if (step.kind === "venn") return answerId === step.correctRegion;
  return false;
}

export function getScoredSteps(lesson: LessonDefinition) {
  return lesson.steps.filter(isScoredStep);
}

export function calculateLessonResult(lesson: LessonDefinition, answers: LessonAnswers): LessonResult {
  const scoredSteps = getScoredSteps(lesson);
  const correct = scoredSteps.reduce((total, step) => total + (gradeStep(step, answers[step.id]) ? 1 : 0), 0);
  const score = scoredSteps.length ? Math.round((correct / scoredSteps.length) * 100) : 0;
  return { lessonId: lesson.id, correct, total: scoredSteps.length, score, passed: score >= lesson.passingScore };
}

export function lessonProgress(lesson: LessonDefinition, stepIndex: number, answered: boolean) {
  return Math.round(((stepIndex + (answered ? 1 : 0)) / lesson.steps.length) * 100);
}

export function answerLabel(step: LessonStep, answerId: string) {
  if (step.kind === "multiple-choice") return step.options.find((option) => option.id === answerId)?.label ?? answerId;
  if (step.kind === "venn") return step.regionLabels[answerId as VennRegion] ?? answerId;
  return answerId;
}
