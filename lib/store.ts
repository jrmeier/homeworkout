'use client';

// Client-side localStorage operations for session tracking
// Static workout/exercise data is in lib/data/workouts.ts

import { EXERCISES, WORKOUTS } from '@/lib/data/workouts';
import { SILVERTHORNE_PROGRAM, SILVERTHORNE_WORKOUTS, getScheduledWorkout } from '@/lib/data/program';
import type {
  CardioLog,
  DashboardStats,
  Exercise,
  Program,
  ProgramSession,
  ProgramState,
  SafetyAnswers,
  ScheduledWorkout,
  StrengthSetLog,
  WorkoutWithBlocks,
  WorkoutStats,
  SessionWithWorkout,
} from '@/lib/types';

// Re-export static data for convenience
export { EXERCISES, WORKOUTS };
export { SILVERTHORNE_PROGRAM, SILVERTHORNE_WORKOUTS, getScheduledWorkout };

// =============================================================================
// LOCALSTORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  SESSIONS: 'workout_sessions',
  SESSION_LOGS: 'session_logs',
  PROGRAM_STATE: 'silverthorne_program_state_v1',
} as const;

const PROGRAM_STATE_VERSION = 1 as const;

// =============================================================================
// SESSION STORAGE TYPES
// =============================================================================

interface StoredSession {
  id: number;
  workoutId: number;
  startedAt: string;
  completedAt: string | null;
  totalRounds: number | null;
  notes: string | null;
}

interface StoredSessionLog {
  id: number;
  sessionId: number;
  exerciseId: number;
  blockId: number | null;
  reps: number | null;
  weight: number | null;
  round: number | null;
  timestamp: string;
}

// =============================================================================
// INTERNAL STORAGE FUNCTIONS
// =============================================================================

function getSessions(): StoredSession[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return data ? JSON.parse(data) : [];
}

function saveSessions(sessions: StoredSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

function getSessionLogs(): StoredSessionLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.SESSION_LOGS);
  return data ? JSON.parse(data) : [];
}

function saveSessionLogs(logs: StoredSessionLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(logs));
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function hasSafetyRedFlag(answers: SafetyAnswers | null): boolean {
  if (!answers || !answers.acknowledged) return true;
  return answers.numbnessOrTingling || answers.radiatingPain || answers.dizziness ||
    answers.severeHeadache || answers.recentTrauma || answers.weakness || answers.worseningPain;
}

function createEmptyProgramState(): ProgramState {
  return {
    version: PROGRAM_STATE_VERSION,
    activeProgramId: SILVERTHORNE_PROGRAM.id,
    migratedAt: new Date().toISOString(),
    sessions: [],
  };
}

function getProgramStateInternal(): ProgramState {
  if (typeof window === 'undefined') return createEmptyProgramState();
  const parsed = safeParse<Partial<ProgramState> | null>(localStorage.getItem(STORAGE_KEYS.PROGRAM_STATE), null);

  if (!parsed || parsed.version !== PROGRAM_STATE_VERSION || !Array.isArray(parsed.sessions)) {
    const fresh = createEmptyProgramState();
    localStorage.setItem(STORAGE_KEYS.PROGRAM_STATE, JSON.stringify(fresh));
    return fresh;
  }

  return {
    version: PROGRAM_STATE_VERSION,
    activeProgramId: parsed.activeProgramId || SILVERTHORNE_PROGRAM.id,
    migratedAt: parsed.migratedAt || new Date().toISOString(),
    sessions: parsed.sessions,
  };
}

function saveProgramState(state: ProgramState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROGRAM_STATE, JSON.stringify(state));
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfLocalWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  return start;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sessionCompletedOn(session: ProgramSession, date: Date): boolean {
  if (!session.completedAt) return false;
  return localDateString(new Date(session.completedAt)) === localDateString(date);
}

function isThisWeek(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate);
  const start = startOfLocalWeek(now);
  const end = addDays(start, 7);
  return date >= start && date < end;
}

// =============================================================================
// PUBLIC API
// =============================================================================

// Get all workouts
export function getWorkouts(): WorkoutWithBlocks[] {
  return WORKOUTS;
}

// Get a single workout by ID
export function getWorkoutById(id: number): WorkoutWithBlocks | null {
  return WORKOUTS.find(w => w.id === id) || null;
}

// Get all exercises
export function getExercises(): Exercise[] {
  return EXERCISES;
}

// Get exercise by ID
export function getExerciseById(id: number): Exercise | null {
  return EXERCISES.find(e => e.id === id) || null;
}

// Create a new workout session
export function createSession(workoutId: number): StoredSession {
  const sessions = getSessions();
  const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
  
  const newSession: StoredSession = {
    id: newId,
    workoutId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalRounds: null,
    notes: null,
  };
  
  sessions.push(newSession);
  saveSessions(sessions);
  
  return newSession;
}

// Update a session (e.g., mark as complete)
export function updateSession(sessionId: number, updates: Partial<Pick<StoredSession, 'completedAt' | 'totalRounds' | 'notes'>>): StoredSession | null {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  
  if (index === -1) return null;
  
  sessions[index] = { ...sessions[index], ...updates };
  saveSessions(sessions);
  
  return sessions[index];
}

// Get all sessions with workout info
export function getSessionsWithWorkout(): SessionWithWorkout[] {
  const sessions = getSessions();
  
  return sessions
    .map(session => {
      const workout = WORKOUTS.find(w => w.id === session.workoutId);
      if (!workout) return null;
      
      return {
        id: session.id,
        workoutId: session.workoutId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        totalRounds: session.totalRounds,
        notes: session.notes,
        workout: {
          id: workout.id,
          name: workout.name,
          estimatedMinutes: workout.estimatedMinutes,
        },
      };
    })
    .filter((s): s is SessionWithWorkout => s !== null)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

// Add a session log
export function addSessionLog(log: Omit<StoredSessionLog, 'id' | 'timestamp'>): StoredSessionLog {
  const logs = getSessionLogs();
  const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
  
  const newLog: StoredSessionLog = {
    ...log,
    id: newId,
    timestamp: new Date().toISOString(),
  };
  
  logs.push(newLog);
  saveSessionLogs(logs);
  
  return newLog;
}

// Get stats
export function getStats(): WorkoutStats {
  const sessions = getSessions();
  const logs = getSessionLogs();
  
  // Completed sessions
  const completedSessions = sessions.filter(s => s.completedAt !== null);
  
  // Sessions this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const sessionsThisWeek = sessions.filter(
    s => new Date(s.startedAt) >= oneWeekAgo
  );
  
  // Calculate streak
  const uniqueDates = [...new Set(
    completedSessions
      .map(s => new Date(s.completedAt!).toISOString().split('T')[0])
  )].sort().reverse();
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const sessionDate = new Date(uniqueDates[i]);
    sessionDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (sessionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (i === 0) {
      // Check yesterday
      expectedDate.setDate(expectedDate.getDate() - 1);
      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  // Top exercises from logs
  const exerciseCounts = logs.reduce((acc, log) => {
    acc[log.exerciseId] = (acc[log.exerciseId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const topExercises = Object.entries(exerciseCounts)
    .map(([exerciseId, count]) => {
      const exercise = getExerciseById(parseInt(exerciseId));
      return {
        exerciseId: parseInt(exerciseId),
        name: exercise?.name || 'Unknown',
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Total minutes
  const totalMinutes = completedSessions.reduce((acc, session) => {
    if (session.startedAt && session.completedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.completedAt).getTime();
      return acc + (end - start) / (1000 * 60);
    }
    return acc;
  }, 0);
  
  // Recent history
  const recentHistory = completedSessions
    .slice(0, 10)
    .map(session => {
      const workout = WORKOUTS.find(w => w.id === session.workoutId);
      return {
        id: session.id,
        startedAt: new Date(session.startedAt),
        completedAt: session.completedAt ? new Date(session.completedAt) : null,
        workout: workout || { id: session.workoutId, name: 'Unknown', description: null, estimatedMinutes: null, difficulty: null, isPreset: false },
      };
    });
  
  return {
    totalWorkoutsCompleted: completedSessions.length,
    totalExercises: EXERCISES.length,
    workoutsThisWeek: sessionsThisWeek.length,
    currentStreak: streak,
    totalMinutes: Math.round(totalMinutes),
    topExercises,
    recentHistory,
  };
}

// =============================================================================
// SILVERTHORNE PROGRAM API
// =============================================================================

export function getProgram(): Program {
  return SILVERTHORNE_PROGRAM;
}

export function getProgramState(): ProgramState {
  return getProgramStateInternal();
}

export function getProgramSessions(): ProgramSession[] {
  return getProgramStateInternal().sessions
    .slice()
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function getWorkoutDate(workout: ScheduledWorkout, now = new Date()): Date {
  const programStart = new Date(`${SILVERTHORNE_PROGRAM.startDate}T00:00:00`);
  const weekStart = now < programStart ? programStart : startOfLocalWeek(now);
  return addDays(weekStart, workout.dayOffset);
}

export function getNextScheduledWorkout(now = new Date()): ScheduledWorkout {
  const sessions = getProgramStateInternal().sessions;
  const required = SILVERTHORNE_WORKOUTS.filter((workout) => workout.required);

  const incompleteRequired = required.find((workout) => {
    const scheduledDate = getWorkoutDate(workout, now);
    return !sessions.some((session) =>
      session.workoutId === workout.id && session.completedAt && sessionCompletedOn(session, scheduledDate)
    );
  });

  if (incompleteRequired) return incompleteRequired;
  return SILVERTHORNE_WORKOUTS.find((workout) => !workout.required) || required[0];
}

export function startProgramSession(workoutId: string): ProgramSession {
  const workout = getScheduledWorkout(workoutId);
  if (!workout) {
    throw new Error(`Scheduled workout ${workoutId} not found`);
  }

  const state = getProgramStateInternal();
  const existing = state.sessions.find((session) => session.workoutId === workoutId && !session.completedAt);
  if (existing) return existing;

  const session: ProgramSession = {
    id: `session-${Date.now()}`,
    workoutId,
    workoutName: workout.name,
    required: workout.required,
    startedAt: new Date().toISOString(),
    completedAt: null,
    notes: '',
    energy: null,
    body: '',
    safetyAnswers: null,
    strengthSets: [],
    cardioLogs: [],
    postureLogs: [],
  };

  state.sessions.push(session);
  saveProgramState(state);
  return session;
}

export function saveSafetyAnswers(sessionId: string, answers: Omit<SafetyAnswers, 'checkedAt'>): ProgramSession | null {
  const state = getProgramStateInternal();
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) return null;
  session.safetyAnswers = {
    ...answers,
    checkedAt: new Date().toISOString(),
  };
  saveProgramState(state);
  return session;
}

export function addStrengthSet(sessionId: string, set: Omit<StrengthSetLog, 'completedAt'>): ProgramSession | null {
  const state = getProgramStateInternal();
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) return null;
  session.strengthSets.push({
    ...set,
    completedAt: new Date().toISOString(),
  });
  saveProgramState(state);
  return session;
}

export function addCardioLog(sessionId: string, log: Omit<CardioLog, 'completedAt'>): ProgramSession | null {
  const state = getProgramStateInternal();
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) return null;
  session.cardioLogs.push({
    ...log,
    completedAt: new Date().toISOString(),
  });
  saveProgramState(state);
  return session;
}

export function completePostureRoutine(sessionId: string, routineId: string, minutes: number): ProgramSession | null {
  const state = getProgramStateInternal();
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session || hasSafetyRedFlag(session.safetyAnswers)) return null;

  session.postureLogs.push({
    routineId,
    minutes,
    completedAt: new Date().toISOString(),
  });
  saveProgramState(state);
  return session;
}

export function completeProgramSession(
  sessionId: string,
  updates: { notes?: string; energy?: number | null; body?: string } = {}
): ProgramSession | null {
  const state = getProgramStateInternal();
  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) return null;
  session.completedAt = new Date().toISOString();
  session.notes = updates.notes ?? session.notes;
  session.energy = updates.energy ?? session.energy;
  session.body = updates.body ?? session.body;
  saveProgramState(state);
  return session;
}

export function canLogPosture(session: ProgramSession | null): boolean {
  return !hasSafetyRedFlag(session?.safetyAnswers ?? null);
}

export function getDashboardStats(now = new Date()): DashboardStats {
  const sessions = getProgramStateInternal().sessions;
  const completed = sessions.filter((session) => session.completedAt);
  const completedThisWeek = completed.filter((session) => session.completedAt && isThisWeek(session.completedAt, now));
  const requiredCompletedThisWeek = completedThisWeek.filter((session) => session.required).length;
  const optionalCompletedThisWeek = completedThisWeek.filter((session) => !session.required).length;
  const cardioMinutesThisWeek = completedThisWeek.reduce(
    (total, session) => total + session.cardioLogs.reduce((sum, log) => sum + log.minutes, 0),
    0
  );

  const postureDates = [...new Set(
    completed
      .flatMap((session) => session.postureLogs.map((log) => localDateString(new Date(log.completedAt))))
  )].sort().reverse();

  let postureStreak = 0;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < postureDates.length; i++) {
    const expected = addDays(today, -i);
    if (postureDates.includes(localDateString(expected))) {
      postureStreak += 1;
    } else if (i === 0 && postureDates.includes(localDateString(addDays(today, -1)))) {
      postureStreak += 1;
    } else {
      break;
    }
  }

  return {
    requiredCompletedThisWeek,
    requiredTotalThisWeek: SILVERTHORNE_WORKOUTS.filter((workout) => workout.required).length,
    optionalCompletedThisWeek,
    postureStreak,
    cardioMinutesThisWeek,
    totalProgramSessions: completed.length,
    lastPerformance: completed
      .slice()
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0] || null,
  };
}
