export type LessonOption = {
  id: string;
  label: string;
};

export type VennRegion = "a-only" | "intersection" | "b-only" | "outside";

export type IntroStep = {
  kind: "intro";
  id: string;
  title: string;
  body: string;
  bullets: string[];
};

export type WorkedExampleStep = {
  kind: "worked";
  id: string;
  title: string;
  body: string;
  notation: string[];
  takeaway: string;
};

export type MultipleChoiceStep = {
  kind: "multiple-choice";
  id: string;
  prompt: string;
  helper: string;
  options: LessonOption[];
  correctOptionId: string;
  explanation: string;
  skill: string;
};

export type VennStep = {
  kind: "venn";
  id: string;
  prompt: string;
  helper: string;
  sets: { a: string[]; b: string[] };
  regionLabels: Record<VennRegion, string>;
  correctRegion: VennRegion;
  explanation: string;
  skill: string;
};

export type LessonStep = IntroStep | WorkedExampleStep | MultipleChoiceStep | VennStep;

export type LessonDefinition = {
  id: string;
  level: number;
  title: string;
  subject: string;
  xpReward: number;
  passingScore: number;
  estimatedMinutes: number;
  steps: LessonStep[];
};
