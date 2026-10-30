export type Question = {
  prompt: string;
  helper: string;
  options: string[];
  answer: string;
  skill: string;
};

export const levelZeroQuestions: Question[] = [
  { prompt: "2 + 3 = ?", helper: "Count the steps forward.", options: ["4", "5", "6", "7"], answer: "5", skill: "Addition" },
  { prompt: "10 − 4 = ?", helper: "Take four away from ten.", options: ["5", "6", "7", "8"], answer: "6", skill: "Subtraction" },
  { prompt: "3 × 2 = ?", helper: "Two groups of three.", options: ["5", "6", "8", "9"], answer: "6", skill: "Multiplication" },
  { prompt: "Which number is even?", helper: "Even numbers split into pairs.", options: ["7", "9", "12", "15"], answer: "12", skill: "Number sense" },
  { prompt: "Half of 8 is…", helper: "Share eight equally between two.", options: ["2", "3", "4", "6"], answer: "4", skill: "Fractions" },
];
