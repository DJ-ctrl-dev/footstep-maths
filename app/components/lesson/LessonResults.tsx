"use client";

import type { LessonDefinition } from "../../lessons/types";
import type { LessonResult } from "../../lessons/engine";

type LessonResultsProps = {
  lesson: LessonDefinition;
  result: LessonResult;
  xpAwarded: number;
  alreadyCompleted: boolean;
  synced: boolean;
  onContinue: () => void;
};

export function LessonResults({ lesson, result, xpAwarded, alreadyCompleted, synced, onContinue }: LessonResultsProps) {
  return (
    <main className="completion-shell lesson-results-shell">
      <div className="completion-confetti confetti-a" />
      <div className="completion-confetti confetti-b" />
      <section className="completion-card lesson-results-card" aria-live="polite">
        <div className={`completion-mark ${result.passed ? "" : "completion-mark--retry"}`}><span>{result.passed ? "✓" : "↺"}</span></div>
        <p className="eyebrow">{result.passed ? `Level ${lesson.level} complete` : "Keep practising"}</p>
        <h1>{result.passed ? <>You&apos;ve got<br /><em>momentum.</em></> : <>Almost<br /><em>there.</em></>}</h1>
        <p className="completion-copy">You scored {result.score}% with {result.correct} of {result.total} questions correct. {result.passed ? "The next level is ready when you are." : `You need ${lesson.passingScore}% to unlock Level ${lesson.level + 1}.`}</p>
        <div className="reward-row">
          <div><span className="reward-icon reward-icon--yellow">⚡</span><b>{result.score}%</b><small>Score</small></div>
          <div><span className="reward-icon reward-icon--orange">✦</span><b>+{xpAwarded} XP</b><small>{alreadyCompleted ? "Already claimed" : "Earned now"}</small></div>
          <div><span className="reward-icon reward-icon--green">{result.passed ? "✓" : "○"}</span><b>Level {lesson.level + 1}</b><small>{result.passed ? "Unlocked" : "Locked"}</small></div>
        </div>
        <button className="button button--primary button--full" onClick={onContinue}>{result.passed ? "See my learning path" : "Try the lesson again"} <span aria-hidden="true">→</span></button>
        {!synced && result.passed && <p className="sync-copy" role="status">Saved on this device for now. Connect the database to sync progress across devices.</p>}
        {synced && <p className="sync-copy sync-copy--ok" role="status">Progress saved. Your XP and unlock are protected from duplicate claims.</p>}
      </section>
    </main>
  );
}
