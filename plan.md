# Footstep Maths — implementation plan

## Product scope

Footstep is a friendly, game-like GCSE Maths learning product. The original landing page and visual system remain unchanged. This milestone adds the first reusable lesson node: **Level 1 — Set Notation and Venn Diagrams**, with Level 2 as a locked/placeholder path node until Level 1 is passed at 80% or higher.

## Design direction

- **Design movement:** playful editorial learning UI — bright, optimistic, and tactile without copying any existing brand.
- **Core principles:** progress should feel visible; every interaction should feel encouraging; information should be scannable at a glance; rounded surfaces should make learning feel safe rather than childish.
- **Color philosophy:** a deep ink base grounds the experience, while Footstep green signals momentum and mastery. Warm cream and soft mint surfaces keep the app approachable and readable.
- **Layout paradigm:** an asymmetric two-column landing hero flows into an app-shell dashboard with a persistent left rail on desktop and bottom navigation on mobile. Lessons use a focused single-column reading and question stage.
- **Signature elements:** the circular Footstep mark, compact progress tracks, and “streak / XP / level” status signals that turn practice into a visible journey.
- **Interaction philosophy:** actions have a clear next step; answers reveal supportive feedback in place; completed work visibly changes the dashboard rather than resetting the learner to an empty state.
- **Animation:** use small lift and color transitions on hover, a celebratory pop for correct answers, and no motion that delays comprehension. Respect reduced-motion preferences.
- **Typography system:** clean sans-serif UI text with oversized tight headlines and restrained uppercase metadata labels.
- **Brand essence:** “Small steps. Stronger maths.” for students who want confidence, not intimidation. Personality: **encouraging, clever, energetic**.
- **Brand voice:** direct, warm, and momentum-oriented. Example lines: “Turn ‘I don’t get it’ into ‘I’ve got this.’” and “One tiny step today. A whole new level tomorrow.”
- **Wordmark & logo:** the Footstep mark is a rounded square with two offset circular “steps” cut into it, paired with a lowercase wordmark.
- **Signature brand color:** Footstep green `#58cc02`, used as a reward signal rather than a full-page wash.

## Implementation approach

- Next.js App Router with the existing client-rendered experience and server route handlers for student/progress persistence.
- Lesson content is defined as typed data in `app/lessons/`, while `app/lessons/engine.ts` owns scoring and answer grading.
- `LessonPlayer` renders intro, worked-example, multiple-choice, and Venn steps one at a time. `VennDiagram` is an accessible SVG plus equivalent region buttons, and `LessonResults` handles pass/fail outcomes.
- Level 1 completion is server-authoritative when `DATABASE_URL` is available. `/api/lesson-complete` validates the lesson ID and score, calculates the reward, writes the unlock, and uses a unique `(student_id, lesson_id)` completion record to prevent duplicate XP.
- When a database is unavailable, `app/lib/progress-storage.ts` provides a clearly labelled local-development fallback with a browser-side completed-lesson guard. This is not presented as a production backend.
- The existing Level 0 flow remains intact. The dashboard now exposes Level 1 as an available node, Level 2 as a placeholder unlocked at 80%, and Level 3 as locked.

## Project structure

- `app/page.tsx` — existing landing page, onboarding, dashboard path integration, legacy Level 0 flow, and orchestration for Level 1 completion.
- `app/components/lesson/LessonPlayer.tsx` — reusable lesson state machine and question UI.
- `app/components/lesson/VennDiagram.tsx` — data-driven, keyboard-accessible SVG diagram and equivalent answer controls.
- `app/components/lesson/LessonResults.tsx` — score, XP, pass/fail, and unlock result screen.
- `app/lessons/types.ts` — typed lesson content format.
- `app/lessons/engine.ts` — step classification, grading, progress, and score calculation.
- `app/lessons/lesson-001-sets.ts` — complete Set Notation and Venn Diagrams lesson definition.
- `app/lessons/registry.ts` — lesson catalog for future content additions.
- `app/lib/progress-storage.ts` — normalized browser progress and idempotent local XP fallback.
- `app/lib/student-id.ts` — shared deterministic student ID helper.
- `app/api/_lib/schema.ts` — shared MySQL pool and additive schema setup.
- `app/api/lesson-complete/route.ts` — server validation, reward calculation, and duplicate-safe completion writes.
- `app/api/student/route.ts` — student creation using the shared schema and ID helper.
- `app/api/progress/route.ts` — existing Level 0 progress persistence using the shared schema.
- `app/globals.css` — existing design system plus reusable lesson, diagram, and results styling.
- `HOW_TO_ADD_A_NEW_LESSON.md` — manual Lesson 2/Fractions tutorial.
- `plan.md` / `TODO.md` — scope and acceptance criteria.
