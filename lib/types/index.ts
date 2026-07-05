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
  workout: {
    id: number;
    name: string;
    estimatedMinutes: number | null;
  };
}

export type ProgramBlockType = 'warmup' | 'strength' | 'cardio' | 'posture' | 'cooldown';
export type ProgramWorkoutFocus = 'upper-pull' | 'lower-core' | 'upper-hypertrophy' | 'conditioning' | 'recovery';

export interface ExercisePrescription {
  id: string;
  name: string;
  target: string;
  sets?: number;
  reps?: string;
  durationMinutes?: number;
  restSeconds?: number;
  equipment: string;
  muscleGroups: string[];
  notes: string;
  alternatives?: string[];
}

export interface CardioPrescription {
  id: string;
  name: string;
  equipment: string;
  durationMinutes: number;
  intensity: string;
  instructions: string;
}

export interface PostureRoutine {
  id: string;
  name: string;
  durationMinutes: number;
  items: ExercisePrescription[];
  safetyNote: string;
}

export interface ProgramBlock {
  id: string;
  type: ProgramBlockType;
  name: string;
  durationMinutes: number;
  exercises?: ExercisePrescription[];
  cardio?: CardioPrescription;
  posture?: PostureRoutine;
  notes?: string;
}

export interface ScheduledWorkout {
  id: string;
  dayOffset: number;
  dayLabel: string;
  required: boolean;
  name: string;
  focus: ProgramWorkoutFocus;
  estimatedMinutes: number;
  summary: string;
  blocks: ProgramBlock[];
}

export interface ProgramWeek {
  weekNumber: number;
  workouts: ScheduledWorkout[];
}

export interface ProgressionRule {
  id: string;
  description: string;
}

export interface Program {
  id: string;
  name: string;
  startDate: string;
  facility: string;
  summary: string;
  weeks: ProgramWeek[];
  progressionRules: ProgressionRule[];
}

export interface SafetyAnswers {
  checkedAt: string;
  numbnessOrTingling: boolean;
  radiatingPain: boolean;
  dizziness: boolean;
  severeHeadache: boolean;
  recentTrauma: boolean;
  weakness: boolean;
  worseningPain: boolean;
  acknowledged: boolean;
}

export interface StrengthSetLog {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  completedAt: string;
}

export interface CardioLog {
  blockId: string;
  equipment: string;
  minutes: number;
  intensity: string;
  completedAt: string;
}

export interface PostureLog {
  routineId: string;
  minutes: number;
  completedAt: string;
}

export interface ProgramSession {
  id: string;
  workoutId: string;
  workoutName: string;
  required: boolean;
  startedAt: string;
  completedAt: string | null;
  notes: string;
  energy: number | null;
  body: string;
  safetyAnswers: SafetyAnswers | null;
  strengthSets: StrengthSetLog[];
  cardioLogs: CardioLog[];
  postureLogs: PostureLog[];
}

export interface ProgramState {
  version: 1;
  activeProgramId: string;
  migratedAt: string;
  sessions: ProgramSession[];
}

export interface DashboardStats {
  requiredCompletedThisWeek: number;
  requiredTotalThisWeek: number;
  optionalCompletedThisWeek: number;
  postureStreak: number;
  cardioMinutesThisWeek: number;
  totalProgramSessions: number;
  lastPerformance: ProgramSession | null;
}
