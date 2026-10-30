# Footstep Maths milestone

- [ ] A responsive marketing landing page presents Footstep as a friendly maths-learning product, includes professional copy, a clear primary call to action, and original rounded visual energy inspired by the supplied reference without copying its branding.
- [ ] Reusable UI patterns are established for the wordmark, buttons, cards, progress indicators, status chips, lesson questions, answer feedback, responsive layouts, and locked/unlocked states.
- [ ] A student can open onboarding from the landing page, provide a name and email, and enter the learning dashboard.
- [ ] The learning dashboard shows the student name, current level, XP total, streak, progress, available levels, and locked or unlocked lesson states.
- [ ] Level 0 contains a complete interactive sequence of maths questions with answer submission and immediate correct/incorrect feedback.
- [ ] Completing Level 0 awards XP, visibly updates the XP total, shows a completion state, and automatically unlocks Level 1.
- [ ] Student progress is sent to the managed database through `/api/student` and `/api/progress` when the database capability is available, with browser persistence as a resilient Preview fallback.
- [ ] The site is responsive across mobile, tablet, and desktop for both the landing page and the learning dashboard.
- [ ] Level 1 is delivered as reusable typed lesson content with intro, worked-example, multiple-choice, and interactive Venn-diagram step types; adding another lesson does not require copying the lesson player.
- [ ] A passed Level 1 lesson requires at least 80%, awards 20 XP once, shows score feedback, and unlocks the Level 2 placeholder automatically.
- [ ] Incorrect answers show immediate explanations, and the Venn diagram is data-driven, keyboard-selectable, and paired with equivalent accessible region controls.
- [ ] The completion API validates lesson IDs and scores server-side and prevents duplicate XP with a unique student/lesson completion record.
- [ ] A browser fallback preserves lesson completion locally when the database is unavailable and labels that state clearly to the learner.
