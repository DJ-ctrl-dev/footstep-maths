export type StoredProfile = {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  level: number;
  completedLevel0: boolean;
  completedLevel1: boolean;
  unlockedLevel2: boolean;
  completedLessonIds: string[];
};

export const starterProfile: StoredProfile = {
  id: "",
  name: "",
  email: "",
  xp: 0,
  streak: 0,
  level: 0,
  completedLevel0: false,
  completedLevel1: false,
  unlockedLevel2: false,
  completedLessonIds: [],
};

const PROFILE_KEY = "footstep-profile";

export function normalizeProfile(value: unknown): StoredProfile {
  const source = value && typeof value === "object" ? value as Partial<StoredProfile> : {};
  return {
    ...starterProfile,
    ...source,
    id: typeof source.id === "string" ? source.id : "",
    name: typeof source.name === "string" ? source.name : "",
    email: typeof source.email === "string" ? source.email : "",
    xp: Number.isFinite(source.xp) ? Math.max(0, Number(source.xp)) : 0,
    streak: Number.isFinite(source.streak) ? Math.max(0, Number(source.streak)) : 0,
    level: Number.isFinite(source.level) ? Math.max(0, Number(source.level)) : 0,
    completedLevel0: Boolean(source.completedLevel0),
    completedLevel1: Boolean(source.completedLevel1),
    unlockedLevel2: Boolean(source.unlockedLevel2),
    completedLessonIds: Array.isArray(source.completedLessonIds) ? source.completedLessonIds.filter((id): id is string => typeof id === "string") : [],
  };
}

export function readStoredProfile() {
  if (typeof window === "undefined") return starterProfile;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? normalizeProfile(JSON.parse(raw)) : starterProfile;
  } catch {
    window.localStorage.removeItem(PROFILE_KEY);
    return starterProfile;
  }
}

export function saveStoredProfile(profile: StoredProfile) {
  if (typeof window !== "undefined") window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function applyLocalLessonCompletion(profile: StoredProfile, lessonId: string, xpReward: number, level: number) {
  const alreadyCompleted = profile.completedLessonIds.includes(lessonId);
  if (alreadyCompleted) return { profile, awarded: false, xpAwarded: 0 };
  const next: StoredProfile = {
    ...profile,
    xp: profile.xp + xpReward,
    level: Math.max(profile.level, level),
    completedLevel1: lessonId === "lesson-001-sets" ? true : profile.completedLevel1,
    unlockedLevel2: lessonId === "lesson-001-sets" ? true : profile.unlockedLevel2,
    completedLessonIds: [...profile.completedLessonIds, lessonId],
  };
  saveStoredProfile(next);
  return { profile: next, awarded: true, xpAwarded: xpReward };
}
