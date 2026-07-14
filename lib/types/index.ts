// Base types (no longer dependent on Drizzle)

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  equipment: string | null;
  muscleGroups: string | null; // JSON array as string
  videoUrl?: string | null;
}

export interface Workout {
  id: number;
  name: string;
  description: string | null;
  estimatedMinutes: number | null;
  difficulty: string | null;
  isPreset: boolean;
}

export interface WorkoutBlock {
  id: number;
  workoutId: number;
  name: string;
  type: BlockType;
  rounds: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  order: number;
}

export interface BlockExercise {
  id: number;
  blockId: number;
  exerciseId: number;
  reps: number | null;
  durationSeconds: number | null;
  notes: string | null;
  order: number;
}

export interface WorkoutSession {
  id: number;
  workoutId: number;
  startedAt: Date;
  completedAt: Date | null;
  totalRounds: number | null;
  notes: string | null;
  progress?: WorkoutProgress | null;
}

export interface WorkoutProgress {
  phase: 'active' | 'rest';
  currentBlockIndex: number;
  currentExerciseIndex: number;
  currentRound: number;
  amrapRounds: number;
  elapsedSeconds: number;
  blockSeconds: number;
}

export interface SessionLog {
  id: number;
  sessionId: number;
  exerciseId: number;
  blockId: number | null;
  reps: number | null;
  weight: number | null;
  round: number | null;
  timestamp: Date;
}

// Extended types with relations
export interface BlockExerciseWithExercise extends BlockExercise {
  exercise: Exercise;
}

export interface WorkoutBlockWithExercises extends WorkoutBlock {
  exercises: BlockExerciseWithExercise[];
}

export interface WorkoutWithBlocks extends Workout {
  blocks: WorkoutBlockWithExercises[];
}

export interface SessionLogWithExercise extends SessionLog {
  exercise: Exercise;
}

export interface WorkoutSessionWithRelations extends WorkoutSession {
  workout: Workout;
  logs: SessionLogWithExercise[];
}

export interface WorkoutSessionWithWorkout extends WorkoutSession {
  workout: WorkoutWithBlocks;
  logs: SessionLogWithExercise[];
}

// Block type enum
export type BlockType = 'warmup' | 'rounds' | 'emom' | 'amrap' | 'cooldown';

// Stats type
export interface WorkoutStats {
  totalWorkoutsCompleted: number;
  totalExercises: number;
  workoutsThisWeek: number;
  currentStreak: number;
  totalMinutes: number;
  topExercises: Array<{
    exerciseId: number;
    name: string;
    count: number;
  }>;
  recentHistory: Array<{
    id: number;
    startedAt: Date;
    completedAt: Date | null;
    workout: Workout;
  }>;
}

// Form types for creating workouts
export interface BlockExerciseInput {
  exerciseId: number;
  reps?: number;
  durationSeconds?: number;
  notes?: string;
}

export interface WorkoutBlockInput {
  name: string;
  type: BlockType;
  rounds?: number;
  durationSeconds?: number;
  restSeconds?: number;
  exercises: BlockExerciseInput[];
}

export interface WorkoutInput {
  name: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: string;
  blocks: WorkoutBlockInput[];
}

// Session with workout for history display
export interface SessionWithWorkout {
  id: number;
  workoutId: number;
  startedAt: string;
  completedAt: string | null;
  totalRounds: number | null;
  notes: string | null;
  progress?: WorkoutProgress | null;
  workout: {
    id: number;
    name: string;
    estimatedMinutes: number | null;
  };
}
