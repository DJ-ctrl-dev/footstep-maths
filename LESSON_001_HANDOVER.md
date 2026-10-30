# Lesson 1 technical handover

## What was built

The existing Footstep landing page was preserved. The learning dashboard now contains an available **Level 1 — Set notation & Venn diagrams** node, a locked Level 2 Fractions placeholder, and a locked Level 3 placeholder. Level 1 is a seven-step, approximately five-minute GCSE Maths lesson with an introduction, worked example, four multiple-choice questions, and one interactive Venn diagram question. A score of 80% or higher unlocks Level 2.

The lesson uses the existing Footstep green, mint, cream, ink, Space Grotesk headline, and DM Sans utility styles. No new dependency was introduced for maths rendering; the required notation is represented with Unicode symbols such as `∈`, `∉`, `∩`, `∪`, and `∅`, with accessible text labels.

## File change report

| File path | Status | Area | Purpose and important code |
|---|---|---|---|
| `app/page.tsx` | Modified | Frontend orchestration | Keeps the existing landing page and Level 0 flow; adds Level 1 screen state, dashboard nodes, server completion handling, local fallback, and result routing. Key functions: `finishLevel1`, `signup`, `Dashboard`, and the final screen switch. |
| `app/globals.css` | Modified | Styling | Adds lesson reading cards, notation blocks, Venn SVG/control styling, pass/fail result styling, and responsive mobile rules using existing tokens. |
| `app/lessons/types.ts` | Created | Lesson content | Defines `LessonDefinition`, `LessonStep`, multiple-choice options, and Venn region types. |
| `app/lessons/engine.ts` | Created | Lesson engine | Defines `LessonAnswers`, `LessonResult`, `isScoredStep`, `gradeStep`, `calculateLessonResult`, `lessonProgress`, and `answerLabel`. |
| `app/lessons/lesson-001-sets.ts` | Created | Lesson content | Contains the complete Level 1 definition, including title, XP reward, passing score, questions, explanations, and Venn set data. |
| `app/lessons/registry.ts` | Created | Lesson catalog | Registers lessons by ID so future lessons can be added without changing the player. |
| `app/components/lesson/LessonPlayer.tsx` | Created | Frontend engine/UI | Reusable step-by-step player. Handles one-step-at-a-time display, selected answers, feedback, progress, keyboard-compatible buttons, and final score calculation. |
| `app/components/lesson/VennDiagram.tsx` | Created | Frontend component | Renders a data-driven SVG Venn diagram plus equivalent labelled region buttons for accessible/mobile selection. |
| `app/components/lesson/LessonResults.tsx` | Created | Frontend component | Shows score, XP, pass/fail state, unlock state, persistence status, and return/retry actions. |
| `app/lib/progress-storage.ts` | Created | Client persistence | Normalizes older profiles, stores browser progress for local development, and prevents duplicate local XP using `completedLessonIds`. |
| `app/lib/student-id.ts` | Created | Shared utility | Keeps browser and server student IDs deterministic and aligned. |
| `app/api/_lib/schema.ts` | Created | Backend/database | Shares the MySQL pool and creates/migrates the student and lesson-completion tables. Adds `completed_level1` and `unlocked_level2` to existing student tables when needed. |
| `app/api/lesson-complete/route.ts` | Created | Backend/database | Validates the allow-listed lesson and score, calculates the 20 XP reward on the server, unlocks Level 2, and uses a unique `(student_id, lesson_id)` record to make XP idempotent. |
| `app/api/student/route.ts` | Modified | Backend/database | Uses shared schema initialization and the shared student ID helper. |
| `app/api/progress/route.ts` | Modified | Backend/database | Retains the existing Level 0 progress behavior while using the shared schema helper. |
| `plan.md` | Modified | Documentation | Documents the updated lesson architecture and project structure. |
| `HOW_TO_ADD_A_NEW_LESSON.md` | Created | Documentation | Step-by-step Lesson 2 Fractions tutorial for adding content without copying the engine. |
| `LESSON_001_HANDOVER.md` | Created | Documentation | This technical handover. |

## Exact Lesson 1 source

The lesson is defined in `app/lessons/lesson-001-sets.ts`.

- **Identity and metadata:** lines 3–10.
- **Introduction:** lines 12–18.
- **Worked notation example:** lines 19–26.
- **Membership question and answer:** lines 27–41; correct answer is `two-in`.
- **Intersection question and answer:** lines 42–56; correct answer is `shared`.
- **Union question and answer:** lines 57–71; correct answer is `combined`.
- **Venn data and answer:** lines 72–87; full sets are `A = {1, 2, 3, 4}` and `B = {3, 4, 5, 6}`, with `intersection` as the correct region.
- **Final challenge:** lines 88–102; correct answer is `three-shared`.

The key metadata is:

```ts
id: "lesson-001-sets",
level: 1,
title: "Set notation and Venn diagrams",
subject: "GCSE Maths",
xpReward: 20,
passingScore: 80,
estimatedMinutes: 5,
```

## How the engine works

1. **Starting a lesson:** the Level 1 dashboard node calls `setScreen("lesson1")` in `app/page.tsx`.
2. **Loading content:** the page passes the registered `lesson001Sets` definition to `LessonPlayer`.
3. **Displaying steps:** `LessonPlayer.tsx` reads `lesson.steps[stepIndex]` and renders an intro card, worked example, multiple-choice card, or Venn view.
4. **Selecting answers:** multiple-choice buttons and Venn region controls update the player’s `selected` state. A selection cannot be changed after submission on that step.
5. **Checking feedback:** `gradeStep` in `app/lessons/engine.ts` compares the selected option/region with the typed correct answer. `Feedback` in `LessonPlayer.tsx` shows a concise explanation immediately.
6. **Calculating scores:** `calculateLessonResult` counts only scored steps, calculates a percentage, and compares it with the lesson’s `passingScore`.
7. **Awarding XP:** `finishLevel1` sends only `studentId`, `lessonId`, and `score` to `/api/lesson-complete`. The server reads the reward from its allow-list rather than trusting browser-supplied XP.
8. **Saving progress:** the server writes `footstep_lesson_completions` and updates the student row. If the database is unavailable, `applyLocalLessonCompletion` stores a clearly local-development fallback in browser storage.
9. **Unlocking Level 2:** a passed Level 1 completion updates `completed_level1`, `unlocked_level2`, and the student level to at least 2. The dashboard then renders Level 2 as an available placeholder.
10. **Preventing duplicate XP:** the server’s primary key `(student_id, lesson_id)` makes a replay return `alreadyCompleted: true` and `xpAwarded: 0`. The browser fallback uses `completedLessonIds` for the same guard.
11. **Returning to the path:** `LessonResults` calls the parent callback; passing returns to the dashboard, while failing routes back to the Level 1 player for a retry.

## Progress storage boundary

The browser-facing profile is normalized by `app/lib/progress-storage.ts`. This lets older Footstep profiles that do not yet contain `completedLevel1`, `unlockedLevel2`, or `completedLessonIds` continue to load safely.

The production-capable path is `/api/lesson-complete`. It validates the lesson ID and score, performs the XP calculation on the server, and writes an idempotent completion record. The browser fallback is intentionally labelled in the results UI as “Saved on this device for now” and should not be treated as a production backend.

## Adding Lesson 2

See [`HOW_TO_ADD_A_NEW_LESSON.md`](./HOW_TO_ADD_A_NEW_LESSON.md). In short: create a typed definition under `app/lessons/`, register it in `app/lessons/registry.ts`, add a dashboard node that calls `onStartLesson("lesson-002-fractions")`, and add its reward/passing rule to the server allow-list. The core player and grading engine do not need to be copied or edited.

## Tests performed

| Test | Result |
|---|---|
| `pnpm typecheck` | Passed. |
| `pnpm build` | Passed. Next.js generated the page and all API routes. Existing autoprefixer warning for `align-items: end` remains non-blocking. |
| Landing page preservation | Passed. Existing landing HTML and visual structure remain in place. |
| Level 1 dashboard node | Passed in Preview. Level 1 is available; Level 2 and Level 3 display locked/placeholder states before completion. |
| Intro and worked example | Passed in Preview. Both render with set notation and explanatory copy. |
| Incorrect-answer feedback | Passed in Preview. The UI identifies “Not quite”, reveals the correct answer, and explains why. |
| Intersection and union questions | Passed in Preview with correct feedback. |
| Interactive Venn diagram | Passed in Preview. SVG renders and the accessible labelled overlap control selects `A ∩ B: {3, 4}` with correct feedback. |
| Full passing lesson | Passed in Preview. A 4/5 score produced 80%, +20 XP, and Level 2 unlocked. |
| Dashboard after completion | Passed in Preview. Level 1 shows Complete, Level 2 shows Placeholder, and the profile shows Level 2 / 20 XP. |
| Refresh persistence | Passed in Preview. Reload preserved the profile, 20 XP, Level 1 completion, and Level 2 unlock. |
| Failed server completion | Passed through the live API. A 60 score returned `passed:false`, `awarded:false`, and `xpAwarded:0`. |
| Duplicate XP guard | Passed through the live API. The first 80 score returned `xpAwarded:20`; a replay returned `alreadyCompleted:true` and `xpAwarded:0`. |
| Mobile CSS | The Venn controls use a responsive two-column control grid and the diagram scales to its container. Full interaction was verified in Preview; a dedicated mobile browser viewport was not available in the current browser tool session. |
