"use client";

import { useState } from "react";
import { answerLabel, calculateLessonResult, gradeStep, lessonProgress, type LessonAnswers, type LessonResult } from "../../lessons/engine";
import type { LessonDefinition, LessonStep, VennRegion } from "../../lessons/types";
import { VennDiagram } from "./VennDiagram";

type LessonPlayerProps = {
  lesson: LessonDefinition;
  currentXp: number;
  onBack: () => void;
  onComplete: (result: LessonResult) => Promise<void>;
};

function StepIntro({ step }: { step: Extract<LessonStep, { kind: "intro" }> }) {
  return <div className="lesson-card lesson-card--reading"><p className="lesson-card-kicker">Start here</p><h1>{step.title}</h1><p>{step.body}</p><ul>{step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>;
}

function WorkedExample({ step }: { step: Extract<LessonStep, { kind: "worked" }> }) {
  return <div className="lesson-card lesson-card--reading"><p className="lesson-card-kicker">Worked example</p><h1>{step.title}</h1><p>{step.body}</p><div className="notation-stack">{step.notation.map((line) => <div key={line} className="notation-line" role="img" aria-label={line}>{line}</div>)}</div><p className="lesson-takeaway"><strong>Remember:</strong> {step.takeaway}</p></div>;
}

function Feedback({ step, selected }: { step: Extract<LessonStep, { kind: "multiple-choice" | "venn" }>; selected: string }) {
  const correct = gradeStep(step, selected);
  return <div className={`answer-feedback ${correct ? "answer-feedback--correct" : "answer-feedback--wrong"}`} role="status"><span className="feedback-icon">{correct ? "✓" : "↺"}</span><div><b>{correct ? "That’s it — nice work." : "Not quite. Take another look."}</b><small>{correct ? step.explanation : `The correct answer is ${answerLabel(step, step.kind === "multiple-choice" ? step.correctOptionId : step.correctRegion)}. ${step.explanation}`}</small></div></div>;
}

function ChoiceStep({ step, selected, onSelect }: { step: Extract<LessonStep, { kind: "multiple-choice" }>; selected: string | null; onSelect: (value: string) => void }) {
  return <><h1>{step.prompt}</h1><p className="lesson-helper">{step.helper}</p><div className="answer-grid" role="group" aria-label="Answer options">{step.options.map((option) => <button key={option.id} type="button" className={`answer-card ${selected === option.id ? (option.id === step.correctOptionId ? "answer-card--correct" : "answer-card--wrong") : ""} ${selected && option.id === step.correctOptionId ? "answer-card--reveal" : ""}`} aria-pressed={selected === option.id} onClick={() => onSelect(option.id)}><span>{option.label}</span>{selected === option.id && <small>{option.id === step.correctOptionId ? "Correct" : "Not quite"}</small>}</button>)}</div>{selected && <Feedback step={step} selected={selected} />}</>;
}

function VennStepView({ step, selected, onSelect }: { step: Extract<LessonStep, { kind: "venn" }>; selected: VennRegion | null; onSelect: (value: VennRegion) => void }) {
  return <><h1>{step.prompt}</h1><p className="lesson-helper">{step.helper}</p><VennDiagram sets={step.sets} selected={selected} onSelect={onSelect} regionLabels={step.regionLabels} />{selected && <Feedback step={step} selected={selected} />}</>;
}

export function LessonPlayer({ lesson, currentXp, onBack, onComplete }: LessonPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<LessonAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const step = lesson.steps[stepIndex];
  const isScored = step.kind === "multiple-choice" || step.kind === "venn";
  const progress = lessonProgress(lesson, stepIndex, Boolean(selected));

  function choose(value: string) {
    if (!submitting && !selected) setSelected(value);
  }

  async function continueStep() {
    if (isScored && !selected) return;
    const nextAnswers = isScored && selected ? { ...answers, [step.id]: selected } : answers;
    if (stepIndex === lesson.steps.length - 1) {
      setSubmitting(true);
      await onComplete(calculateLessonResult(lesson, nextAnswers));
      return;
    }
    setAnswers(nextAnswers);
    setStepIndex((value) => value + 1);
    setSelected(null);
  }

  return <main className="lesson-shell"><header className="lesson-header"><button className="lesson-back" onClick={onBack}>← <span>Exit lesson</span></button><div className="lesson-title"><span className="level-dot">{lesson.level}</span><div><span>LEVEL {lesson.level}</span><b>{lesson.title}</b></div></div><div className="lesson-xp"><span aria-hidden="true">⚡</span> {currentXp} XP</div></header><div className="lesson-progress"><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><span>{stepIndex + 1} / {lesson.steps.length}</span></div><section className="lesson-content lesson-content--engine"><div className="lesson-kicker"><span className="kicker-line" /> Step {String(stepIndex + 1).padStart(2, "0")} <span className="kicker-line" /></div>{step.kind === "intro" && <StepIntro step={step} />}{step.kind === "worked" && <WorkedExample step={step} />}{step.kind === "multiple-choice" && <ChoiceStep step={step} selected={selected} onSelect={choose} />}{step.kind === "venn" && <VennStepView step={step} selected={selected as VennRegion | null} onSelect={choose} />}<div className="lesson-footer"><span><span aria-hidden="true">✦</span> {isScored ? "Choose an answer to continue" : "A small step builds confidence"}</span><button className="button button--dark" disabled={submitting || (isScored && !selected)} onClick={continueStep}>{submitting ? "Saving…" : stepIndex === lesson.steps.length - 1 ? "Finish lesson" : "Continue"} <span aria-hidden="true">→</span></button></div></section></main>;
}
