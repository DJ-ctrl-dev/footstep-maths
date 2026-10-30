# How to add a new Footstep lesson

This project separates **lesson content** from the reusable player. To add Lesson 2, create a lesson definition and register it; do not copy the lesson player.

## 1. Create the content file

Create `app/lessons/lesson-002-fractions.ts` and export a `LessonDefinition`:

```ts
import type { LessonDefinition } from "./types";

export const lesson002Fractions: LessonDefinition = {
  id: "lesson-002-fractions",
  level: 2,
  title: "Fractions",
  subject: "GCSE Maths",
  xpReward: 20,
  passingScore: 80,
  estimatedMinutes: 5,
  steps: [
    {
      kind: "intro",
      id: "fractions-intro",
      title: "What is a fraction?",
      body: "A fraction describes equal parts of a whole.",
      bullets: ["The numerator is the top number.", "The denominator is the bottom number."],
    },
    {
      kind: "multiple-choice",
      id: "fractions-equivalent",
      prompt: "Which fraction is equivalent to 1/2?",
      helper: "Multiply the numerator and denominator by the same number.",
      options: [
        { id: "two-fourths", label: "2/4" },
        { id: "two-thirds", label: "2/3" },
        { id: "three-fourths", label: "3/4" },
      ],
      correctOptionId: "two-fourths",
      explanation: "Multiplying 1 and 2 by 2 gives 2/4.",
      skill: "equivalent fractions",
    },
  ],
};
```

Available step types are:

- `intro` for short teaching text and bullet points.
- `worked` for a worked explanation with notation lines.
- `multiple-choice` for selectable answers.
- `venn` for an interactive diagram question. Reuse its shape only when the lesson really needs a Venn interaction.

For multiple-choice questions, give every option a unique `id`, set `correctOptionId`, and write an explanation that teaches the reason.

## 2. Register the lesson

Open `app/lessons/registry.ts` and add two lines:

```ts
import { lesson002Fractions } from "./lesson-002-fractions";

export const lessonRegistry = {
  [lesson001Sets.id]: lesson001Sets,
  [lesson002Fractions.id]: lesson002Fractions,
};
```

The `LessonPlayer` loads any registered definition automatically. It calculates the score from the scored steps and applies the lesson's `passingScore` and `xpReward` metadata.

## 3. Add a path node

In the `Dashboard` path in `app/page.tsx`, add a node that calls:

```tsx
onStartLesson("lesson-002-fractions")
```

Use the existing `lesson-node` styles so the new node matches the current learning path. Decide whether it is active using the profile's unlock state.

## 4. Add server completion rules

For production-backed progress, add the lesson ID and reward to the allow-list in `app/api/lesson-complete/route.ts`. The server must remain the authority for the reward and unlock. Do not send an XP amount from the browser.

## 5. Test the lesson

Run:

```bash
pnpm typecheck
pnpm build
```

Then use Preview to check: intro, worked example, every answer state, keyboard controls, the final score, replay behavior, and refresh persistence.

## Where the main code lives

- `app/lessons/types.ts` — content format.
- `app/lessons/engine.ts` — grading and score calculation.
- `app/components/lesson/LessonPlayer.tsx` — reusable lesson UI and flow.
- `app/components/lesson/VennDiagram.tsx` — accessible SVG interaction.
- `app/components/lesson/LessonResults.tsx` — pass/fail result screen.
- `app/lib/progress-storage.ts` — local development persistence and idempotent XP guard.
