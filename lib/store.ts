'use client';

// Client-side localStorage operations for session tracking
// Static workout/exercise data is in lib/data/workouts.ts

import { EXERCISES, WORKOUTS } from '@/lib/data/workouts';
import type {
  Exercise,
  WorkoutWithBlocks,
  WorkoutStats,
  SessionWithWorkout,
  WorkoutProgress,
} from '@/lib/types';

// Re-export static data for convenience
export { EXERCISES, WORKOUTS };

// =============================================================================
// LOCALSTORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  SESSIONS: 'workout_sessions',
  SESSION_LOGS: 'session_logs',
} as const;

// =============================================================================
// SESSION STORAGE TYPES
// =============================================================================

export interface StoredSession {
  id: number;
  workoutId: number;
  startedAt: string;
  completedAt: string | null;
  totalRounds: number | null;
  notes: string | null;
  progress?: WorkoutProgress | null;
}

export interface StoredSessionLog {
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

function readStoredArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed: unknown = JSON.parse(data);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function getSessions(): StoredSession[] {
  return readStoredArray<StoredSession>(STORAGE_KEYS.SESSIONS).filter((session): session is StoredSession =>
    typeof session?.id === 'number' &&
    typeof session.workoutId === 'number' &&
    typeof session.startedAt === 'string' &&
    (typeof session.completedAt === 'string' || session.completedAt === null)
  );
}

function saveSessions(sessions: StoredSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

function getSessionLogs(): StoredSessionLog[] {
  return readStoredArray<StoredSessionLog>(STORAGE_KEYS.SESSION_LOGS).filter((log): log is StoredSessionLog =>
    typeof log?.id === 'number' &&
    typeof log.sessionId === 'number' &&
    typeof log.exerciseId === 'number' &&
    typeof log.timestamp === 'string'
  );
}

function saveSessionLogs(logs: StoredSessionLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(logs));
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

// Reuse the latest unfinished session so an accidental refresh or revisit does not
// create duplicate "in progress" entries for the same workout.
export function getOrCreateActiveSession(workoutId: number): StoredSession {
  const activeSession = getSessions()
    .filter(session => session.workoutId === workoutId && session.completedAt === null)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];

  return activeSession || createSession(workoutId);
}

// Update a session (e.g., mark as complete)
export function updateSession(sessionId: number, updates: Partial<Pick<StoredSession, 'completedAt' | 'totalRounds' | 'notes' | 'progress'>>): StoredSession | null {
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

  const sessionsWithWorkout: SessionWithWorkout[] = [];
  for (const session of sessions) {
    const workout = WORKOUTS.find(w => w.id === session.workoutId);
    if (workout) {
      sessionsWithWorkout.push({
        id: session.id,
        workoutId: session.workoutId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        totalRounds: session.totalRounds,
        notes: session.notes,
        progress: session.progress || null,
        workout: {
          id: workout.id,
          name: workout.name,
          estimatedMinutes: workout.estimatedMinutes,
        },
      });
    }
  }

  return sessionsWithWorkout.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
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

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
  const sessionsThisWeek = completedSessions.filter(
    s => new Date(s.completedAt!) >= oneWeekAgo
  );
  
  // Calculate streak
  const uniqueDates = [...new Set(
    completedSessions
      .map(s => toLocalDateKey(new Date(s.completedAt!)))
  )].sort().reverse();
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const sessionDate = new Date(`${uniqueDates[i]}T00:00:00`);
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
      return acc + Math.max(0, (end - start) / (1000 * 60));
    }
    return acc;
  }, 0);
  
  // Recent history
  const recentHistory = [...completedSessions]
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
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
