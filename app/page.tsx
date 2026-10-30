"use client";

import { useEffect, useMemo, useState } from "react";
import { levelZeroQuestions, type Question } from "./lesson-data";
import { LessonPlayer } from "./components/lesson/LessonPlayer";
import { LessonResults } from "./components/lesson/LessonResults";
import { lesson001Sets } from "./lessons/lesson-001-sets";
import type { LessonResult } from "./lessons/engine";
import { applyLocalLessonCompletion, normalizeProfile, readStoredProfile, saveStoredProfile, starterProfile, type StoredProfile } from "./lib/progress-storage";
import { studentIdFor } from "./lib/student-id";

type Profile = StoredProfile;

type Screen = "landing" | "dashboard" | "lesson" | "complete" | "lesson1" | "lesson1-complete";


function FootstepLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true"><i /><i /></span>
      {!compact && <span className="brand-name">footstep</span>}
    </div>
  );
}

function Icon({ name }: { name: "home" | "learn" | "chart" | "profile" | "lock" | "arrow" | "check" | "spark" | "flame" | "bolt" | "menu" }) {
  const paths: Record<string, string> = {
    home: "⌂",
    learn: "◒",
    chart: "↗",
    profile: "○",
    lock: "●",
    arrow: "→",
    check: "✓",
    spark: "✦",
    flame: "♨",
    bolt: "⚡",
    menu: "☰",
  };
  return <span className={`icon icon--${name}`} aria-hidden="true">{paths[name]}</span>;
}

function ProgressBar({ value, tone = "green" }: { value: number; tone?: "green" | "blue" | "orange" }) {
  return <div className={`progress-track progress-track--${tone}`}><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function AuthModal({ onClose, onComplete }: { onClose: () => void; onComplete: (name: string, email: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Add your first name so we can cheer you on.");
    if (!email.includes("@")) return setError("Enter a valid email to save your progress.");
    onComplete(name.trim(), email.trim().toLowerCase());
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close" onClick={onClose} aria-label="Close sign-up">×</button>
        <div className="auth-badge"><Icon name="spark" /></div>
        <p className="eyebrow">Your next step starts here</p>
        <h2 id="auth-title">Make maths feel more like momentum.</h2>
        <p className="modal-copy">Create your free Footstep profile and we’ll save your XP, streak, and unlocked levels as you learn.</p>
        <form onSubmit={submit} className="auth-form">
          <label>First name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex" /></label>
          <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button--primary button--full" type="submit">Start learning <Icon name="arrow" /></button>
        </form>
        <p className="fine-print">No pressure, no payment details. Just one small step.</p>
      </div>
    </div>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav page-container">
        <FootstepLogo />
        <div className="nav-links"><a href="#why">Why Footstep</a><a href="#method">How it works</a><button className="nav-login" onClick={onStart}>Sign in <Icon name="arrow" /></button></div>
        <button className="mobile-menu" aria-label="Open menu"><Icon name="menu" /></button>
      </nav>

      <section className="hero page-container">
        <div className="hero-copy">
          <h1>Small steps.<br /><em>Stronger maths.</em></h1>
          <div className="hero-actions"><button className="button button--primary button--large" onClick={onStart}>Start learning free <Icon name="arrow" /></button><span className="hero-note"><span>✦</span> No card needed</span></div>
          <div className="social-proof"><div className="avatar-stack"><span>J</span><span>A</span><span>M</span><span>+</span></div><div><strong>Loved by 12,000+ learners</strong><small>Taking one step at a time</small></div></div>
        </div>
        <div className="hero-visual" aria-label="A preview of the Footstep learning journey">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="lesson-preview-card card-shadow">
            <div className="preview-top"><span className="preview-label">TODAY&apos;S STEP</span><span className="preview-dots">•••</span></div>
            <div className="preview-illustration"><div className="sun-shape" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="path-line" /><span className="path-step step-a">✦</span><span className="path-step step-b">✓</span><span className="path-step step-c">→</span><span className="tiny-plant plant-a" /><span className="tiny-plant plant-b" /></div>
            <div className="preview-content"><h3>Make friends with numbers</h3><p>A 5-minute warm-up for your brain.</p><ProgressBar value={42} /><div className="preview-footer"><span>2 of 5 steps</span><button onClick={onStart}>Continue <Icon name="arrow" /></button></div></div>
          </div>
          <div className="floating-pill pill-xp"><span className="pill-icon pill-icon--yellow"><Icon name="bolt" /></span><span><b>+25 XP</b><small>Nice work!</small></span></div>
          <div className="floating-pill pill-streak"><span className="pill-icon pill-icon--orange"><Icon name="flame" /></span><span><b>3 day streak</b><small>Keep it going</small></span></div>
          <div className="visual-label visual-label--top">LEARNING THAT<br /><b>STICKS</b></div>
        </div>
      </section>

      <section className="why-section page-container" id="why"><div className="section-heading"><h2>Less pressure.<br /><em>More progress.</em></h2></div><div className="benefit-grid"><article className="benefit-card benefit-card--green"><div className="benefit-icon">✦</div><p className="eyebrow">01 / Keep moving</p><h3>Progress you can see.</h3><p>Every lesson leaves a mark. Watch your path fill in as practice becomes a habit.</p><div className="mini-path"><span className="mini-path-line" /><b>1</b><b>2</b><b>3</b><b>4</b></div></article><article className="benefit-card benefit-card--cream"><div className="benefit-icon">⌁</div><p className="eyebrow">02 / Learn kindly</p><h3>Feedback that helps.</h3><p>Missed a question? Good. Friendly explanations turn the wobble into your next win.</p><div className="feedback-sample"><span className="feedback-check">✓</span><span><b>Almost there!</b><small>Try grouping the numbers.</small></span></div></article><article className="benefit-card benefit-card--blue"><div className="benefit-icon">◒</div><p className="eyebrow">03 / Make it yours</p><h3>A rhythm that fits.</h3><p>Five minutes, ten minutes, whenever you have a moment. Your learning, your pace.</p><div className="week-dots"><span className="filled" /><span className="filled" /><span className="filled" /><span /><span /><span /><span /></div></article></div></section>

      <section className="method-section page-container" id="method"><div className="method-art"><div className="method-card card-shadow"><span className="method-number">03</span><span className="method-rule" /><span className="method-word">CONFIDENCE</span><div className="method-stamp">one<br />step<br />at a<br />time</div></div></div><div className="method-copy"><p className="eyebrow">How Footstep works</p><h2>Practice that<br /><em>meets you there.</em></h2><div className="method-list"><div><span>01</span><p><b>Pick up your next step</b><small>Lessons are short, focused, and ready when you are.</small></p></div><div><span>02</span><p><b>Get unstuck, quickly</b><small>Helpful feedback shows the why, not just the answer.</small></p></div><div><span>03</span><p><b>Stack your small wins</b><small>XP, streaks, and new levels make progress feel real.</small></p></div></div><button className="text-button" onClick={onStart}>See your first lesson <Icon name="arrow" /></button></div></section>

      <section className="cta-section page-container"><div className="cta-inner"><div><p className="eyebrow">Your future self says thanks</p><h2>Ready to take<br /><em>the next step?</em></h2></div><button className="button button--light button--large" onClick={onStart}>Start learning free <Icon name="arrow" /></button><span className="cta-scribble">✦</span></div></section>
      <footer className="marketing-footer page-container"><FootstepLogo /><span>© 2026 Footstep Maths</span><span>Made for small wins.</span></footer>
    </main>
  );
}

function Dashboard({ profile, onStartLesson, onStartLesson1, onLogOut }: { profile: Profile; onStartLesson: () => void; onStartLesson1: () => void; onLogOut: () => void }) {
  const completed = profile.completedLevel0;
  const completedSets = profile.completedLevel1;
  const pathProgress = profile.unlockedLevel2 ? 66 : completedSets ? 50 : completed ? 25 : 12;
  return (
    <main className="app-shell">
      <aside className="app-sidebar"><div className="sidebar-top"><FootstepLogo /><button className="sidebar-collapse" aria-label="Collapse navigation">←</button></div><div className="sidebar-profile"><span className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</span><span><b>{profile.name}</b><small>Level {profile.level}</small></span><span className="profile-chevron">⌄</span></div><nav className="app-nav"><button className="app-nav-item app-nav-item--active"><Icon name="home" /><span>Home</span></button><button className="app-nav-item" onClick={onStartLesson1}><Icon name="learn" /><span>Learn</span><b className="nav-count">1</b></button><button className="app-nav-item"><Icon name="chart" /><span>Progress</span></button></nav><div className="sidebar-bottom"><div className="sidebar-tip"><span>✦</span><p><b>Small tip</b><small>A little practice every day beats a lot once a week.</small></p></div><button className="sidebar-logout" onClick={onLogOut}>Log out</button></div></aside>
      <section className="app-main"><header className="app-header"><button className="mobile-menu app-mobile-menu" aria-label="Open navigation"><Icon name="menu" /></button><div><p className="eyebrow">Sunday, 11 October 2026</p><h1>Good morning, {profile.name} <span>✦</span></h1></div><div className="header-actions"><div className="header-stat"><span className="header-stat-icon header-stat-icon--orange"><Icon name="flame" /></span><b>{profile.streak}</b><small>day streak</small></div><div className="header-stat"><span className="header-stat-icon header-stat-icon--yellow"><Icon name="bolt" /></span><b>{profile.xp}</b><small>total XP</small></div><button className="header-avatar">{profile.name.charAt(0).toUpperCase()}</button></div></header><div className="dashboard-content"><section className="dashboard-hero"><div><p className="eyebrow">Your learning path</p><h2>Keep your<br /><em>momentum.</em></h2><p>One focused step today keeps tomorrow feeling lighter.</p><button className="button button--dark" onClick={onStartLesson1}>{completedSets ? "Review Level 1" : "Start Level 1"} <Icon name="arrow" /></button></div><div className="dashboard-orbit"><div className="orbit-ring" /><span className="orbit-star">✦</span><div className="level-bubble"><small>LEVEL</small><strong>{profile.level}</strong><span>{completedSets ? "Complete" : "In progress"}</span></div><div className="orbit-caption"><b>{completedSets ? "Level 2 unlocked" : "Your next win is close"}</b><span>{completedSets ? "Set notation complete." : "Five minutes to your next level."}</span></div></div></section><div className="dashboard-grid"><section className="path-card"><div className="section-card-heading"><div><p className="eyebrow">Your path</p><h3>Build your maths confidence</h3></div><span className="path-progress-label">{pathProgress}%</span></div><ProgressBar value={pathProgress} /><div className="lesson-map"><button type="button" className="lesson-node lesson-node--active" onClick={onStartLesson}><div className="node-circle"><span>{completed ? <Icon name="check" /> : "0"}</span></div><div><span className="node-kicker">LEVEL 0</span><h4>Number sense</h4><p>{completed ? "Complete · 5 min" : "Start here · 5 min"}</p></div><Icon name="arrow" /></button><div className="node-connector" /><button type="button" className="lesson-node lesson-node--active" onClick={onStartLesson1}><div className="node-circle"><span>{completedSets ? <Icon name="check" /> : "1"}</span></div><div><span className="node-kicker">LEVEL 1</span><h4>Set notation &amp; Venn diagrams</h4><p>{completedSets ? "Complete · 5 min" : "Available · 5 min"}</p></div><Icon name="arrow" /></button><div className="node-connector" /><button type="button" className={`lesson-node ${profile.unlockedLevel2 ? "lesson-node--active" : "lesson-node--locked"}`} disabled={!profile.unlockedLevel2}><div className="node-circle"><span>{profile.unlockedLevel2 ? "2" : <Icon name="lock" />}</span></div><div><span className="node-kicker">LEVEL 2</span><h4>Fractions</h4><p>{profile.unlockedLevel2 ? "Placeholder · coming soon" : "Pass Level 1 with 80% to unlock"}</p></div>{profile.unlockedLevel2 ? <Icon name="arrow" /> : <Icon name="lock" />}</button><div className="node-connector" /><button type="button" className="lesson-node lesson-node--locked" disabled><div className="node-circle"><span><Icon name="lock" /></span></div><div><span className="node-kicker">LEVEL 3</span><h4>Algebraic thinking</h4><p>Locked for now</p></div><Icon name="lock" /></button></div></section><aside className="stats-card"><div className="section-card-heading"><div><p className="eyebrow">Your rhythm</p><h3>This week</h3></div><span className="stats-more">•••</span></div><div className="week-chart"><div className="chart-line" /><div className="chart-bars"><span style={{ height: "42%" }} /><span style={{ height: "66%" }} /><span style={{ height: "54%" }} /><span style={{ height: "84%" }} /><span className="today" style={{ height: completedSets ? "92%" : "32%" }} /><span style={{ height: "22%" }} /><span style={{ height: "12%" }} /></div><div className="chart-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div><div className="stats-footer"><span><b>{profile.xp}</b><small>XP earned</small></span><span><b>{profile.streak}</b><small>day streak</small></span><span><b>{profile.completedLevel0 || completedSets ? "2" : "0"}</b><small>lessons done</small></span></div></aside></div><section className="dashboard-tip"><span>✦</span><div><b>Today&apos;s tiny tip</b><p>When a question feels tricky, say what you know out loud. Your brain loves a starting point.</p></div><button className="tip-close">×</button></section></div></section><nav className="mobile-bottom-nav"><button className="app-nav-item app-nav-item--active"><Icon name="home" /><span>Home</span></button><button className="app-nav-item" onClick={onStartLesson1}><Icon name="learn" /><span>Learn</span></button><button className="app-nav-item"><Icon name="chart" /><span>Progress</span></button></nav></main>
  );
}

function Lesson({ profile, onFinish, onBack }: { profile: Profile; onFinish: (score: number) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const question: Question = levelZeroQuestions[step];
  const progress = ((step + (selected ? 1 : 0)) / levelZeroQuestions.length) * 100;
  const isCorrect = selected === question.answer;

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) setCorrect((value) => value + 1);
  }

  function next() {
    if (!selected) return;
    if (step === levelZeroQuestions.length - 1) {
      onFinish((correct + (isCorrect ? 1 : 0)) * 10 + 10);
    } else {
      setStep((value) => value + 1);
      setSelected(null);
    }
  }

  return (
    <main className="lesson-shell"><header className="lesson-header"><button className="lesson-back" onClick={onBack}>← <span>Exit lesson</span></button><div className="lesson-title"><span className="level-dot">0</span><div><span>LEVEL 0</span><b>Number sense</b></div></div><div className="lesson-xp"><Icon name="bolt" /> {profile.xp} XP</div></header><div className="lesson-progress"><ProgressBar value={progress} /><span>{step + 1} / {levelZeroQuestions.length}</span></div><section className="lesson-content"><div className="lesson-kicker"><span className="kicker-line" /> Step {String(step + 1).padStart(2, "0")} <span className="kicker-line" /></div><h1>{question.prompt}</h1><p className="lesson-helper">{question.helper}</p><div className="answer-grid">{question.options.map((option) => <button key={option} className={`answer-card ${selected === option ? (option === question.answer ? "answer-card--correct" : "answer-card--wrong") : ""} ${selected && option === question.answer ? "answer-card--reveal" : ""}`} onClick={() => choose(option)}><span>{option}</span>{selected === option && <small>{option === question.answer ? "Correct" : "Not quite"}</small>}</button>)}</div>{selected && <div className={`answer-feedback ${isCorrect ? "answer-feedback--correct" : "answer-feedback--wrong"}`}><span className="feedback-icon">{isCorrect ? "✓" : "↺"}</span><div><b>{isCorrect ? "That’s it — nice work." : `Keep going. The answer is ${question.answer}.`}</b><small>{isCorrect ? `You just practised ${question.skill.toLowerCase()}.` : "A miss is just information for your next step."}</small></div></div>}<div className="lesson-footer"><span><Icon name="spark" /> You earn XP for every answer</span><button className="button button--dark" disabled={!selected} onClick={next}>{step === levelZeroQuestions.length - 1 ? "Finish lesson" : "Next question"} <Icon name="arrow" /></button></div></section></main>
  );
}

function Completion({ profile, onContinue }: { profile: Profile; onContinue: () => void }) {
  return <main className="completion-shell"><div className="completion-confetti confetti-a" /><div className="completion-confetti confetti-b" /><div className="completion-card"><div className="completion-mark"><span>✓</span></div><p className="eyebrow">Level 0 complete</p><h1>You&apos;re on<br /><em>a roll.</em></h1><p className="completion-copy">Five questions, one brand-new level unlocked, and proof that you can do hard things one step at a time.</p><div className="reward-row"><div><span className="reward-icon reward-icon--yellow"><Icon name="bolt" /></span><b>+{profile.xp} XP</b><small>Total XP</small></div><div><span className="reward-icon reward-icon--orange"><Icon name="flame" /></span><b>{profile.streak} day</b><small>Streak started</small></div><div><span className="reward-icon reward-icon--green"><Icon name="spark" /></span><b>Level 1</b><small>Unlocked</small></div></div><button className="button button--primary button--full" onClick={onContinue}>See my learning path <Icon name="arrow" /></button><p className="fine-print">Next up: Patterns &amp; place value</p></div></main>;
}

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [profile, setProfile] = useState<Profile>(starterProfile);
  const [showAuth, setShowAuth] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");
  const [lesson1Result, setLesson1Result] = useState<(LessonResult & { xpAwarded: number; alreadyCompleted: boolean; synced: boolean }) | null>(null);

  useEffect(() => {
    const next = readStoredProfile();
    if (next.id) { setProfile(next); setScreen("dashboard"); }
  }, []);

  const lessonStatus = useMemo(() => profile.completedLevel0 ? "complete" : "ready", [profile.completedLevel0]);

  function start() {
    if (profile.id) setScreen("dashboard");
    else setShowAuth(true);
  }

  async function signup(name: string, email: string) {
    const id = studentIdFor(email);
    const next = { ...starterProfile, id, name, email, streak: 1 };
    setProfile(next);
    saveStoredProfile(next);
    setShowAuth(false);
    setScreen("dashboard");
    const response = await fetch("/api/student", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok || result.persisted === false) {
      setSyncNotice("Your profile is saved on this device while database sync is unavailable.");
      window.setTimeout(() => setSyncNotice(""), 5000);
    }
  }

  async function finishLesson(score: number) {
    const next = { ...profile, xp: profile.xp + score, level: 1, completedLevel0: true, streak: Math.max(1, profile.streak) };
    setProfile(next);
    saveStoredProfile(next);
    setScreen("complete");
    const response = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...next, completedLevel0: true }) }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};
    if (!response?.ok || result.persisted === false) {
      setSyncNotice("Level 1 is unlocked here. Connect the database to sync progress across devices.");
      window.setTimeout(() => setSyncNotice(""), 5000);
    }
  }

  async function finishLevel1(result: LessonResult) {
    if (!result.passed) {
      setLesson1Result({ ...result, xpAwarded: 0, alreadyCompleted: false, synced: true });
      setScreen("lesson1-complete");
      return;
    }

    const response = await fetch("/api/lesson-complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: profile.id, lessonId: result.lessonId, score: result.score }) }).catch(() => null);
    const serverResult = response ? await response.json().catch(() => ({})) : {};
    let nextProfile = profile;
    let xpAwarded = 0;
    let alreadyCompleted = false;
    let synced = false;

    if (response?.ok && serverResult.persisted) {
      synced = true;
      xpAwarded = Number(serverResult.xpAwarded) || 0;
      alreadyCompleted = Boolean(serverResult.alreadyCompleted);
      nextProfile = { ...profile, level: Math.max(profile.level, Number(serverResult.level) || 2), completedLevel1: true, unlockedLevel2: true, completedLessonIds: profile.completedLessonIds.includes(result.lessonId) ? profile.completedLessonIds : [...profile.completedLessonIds, result.lessonId] };
      if (xpAwarded) nextProfile.xp += xpAwarded;
    } else {
      const local = applyLocalLessonCompletion(profile, result.lessonId, lesson001Sets.xpReward, 2);
      nextProfile = local.profile;
      xpAwarded = local.xpAwarded;
      alreadyCompleted = !local.awarded;
    }

    setProfile(nextProfile);
    saveStoredProfile(nextProfile);
    setLesson1Result({ ...result, xpAwarded, alreadyCompleted, synced });
    setScreen("lesson1-complete");
  }

  function logOut() {
    window.localStorage.removeItem("footstep-profile");
    setProfile(starterProfile);
    setScreen("landing");
  }

  return <>{screen === "landing" && <Landing onStart={start} />}{screen === "dashboard" && <Dashboard profile={profile} onStartLesson={() => setScreen("lesson")} onStartLesson1={() => { setLesson1Result(null); setScreen("lesson1"); }} onLogOut={logOut} />}{screen === "lesson" && <Lesson profile={profile} onFinish={finishLesson} onBack={() => setScreen("dashboard")} />}{screen === "complete" && <Completion profile={profile} onContinue={() => setScreen("dashboard")} />}{screen === "lesson1" && <LessonPlayer lesson={lesson001Sets} currentXp={profile.xp} onComplete={finishLevel1} onBack={() => setScreen("dashboard")} />}{screen === "lesson1-complete" && lesson1Result && <LessonResults lesson={lesson001Sets} result={lesson1Result} xpAwarded={lesson1Result.xpAwarded} alreadyCompleted={lesson1Result.alreadyCompleted} synced={lesson1Result.synced} onContinue={() => { setLesson1Result(null); setScreen(lesson1Result.passed ? "dashboard" : "lesson1"); }} />}{showAuth && <AuthModal onClose={() => setShowAuth(false)} onComplete={signup} />}{syncNotice && <div className="sync-notice" role="status">{syncNotice}</div>}<span className="sr-only">Lesson status: {lessonStatus}</span></>;
}
