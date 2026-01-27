// Static workout data - can be used on both server and client
// Add new workouts here!

import type {
  Exercise,
  WorkoutWithBlocks,
  WorkoutBlockWithExercises,
  BlockExerciseWithExercise,
} from '@/lib/types';

// =============================================================================
// EXERCISES - Add more exercises here as needed
// =============================================================================

export const EXERCISES: Exercise[] = [
  // Kettlebell exercises
  { id: 1, name: 'KB Swings', description: 'Explosive hip hinge movement with kettlebell', equipment: 'kettlebell', muscleGroups: JSON.stringify(['glutes', 'hamstrings', 'core', 'shoulders']) },
  { id: 2, name: 'Goblet Squats', description: 'Squat holding kettlebell at chest', equipment: 'kettlebell', muscleGroups: JSON.stringify(['quads', 'glutes', 'core']) },
  { id: 3, name: 'KB Clean & Press', description: 'Clean kettlebell to rack position then press overhead', equipment: 'kettlebell', muscleGroups: JSON.stringify(['shoulders', 'triceps', 'core', 'legs']) },
  { id: 4, name: 'KB Bent-Over Rows', description: 'Rowing motion with kettlebell while hinged', equipment: 'kettlebell', muscleGroups: JSON.stringify(['back', 'biceps', 'core']) },
  { id: 5, name: 'KB Deadlifts', description: 'Hip hinge movement lifting kettlebell from ground', equipment: 'kettlebell', muscleGroups: JSON.stringify(['hamstrings', 'glutes', 'back', 'core']) },
  { id: 6, name: 'KB Front Rack Reverse Lunges', description: 'Reverse lunge with kettlebell in front rack position', equipment: 'kettlebell', muscleGroups: JSON.stringify(['quads', 'glutes', 'core']) },
  { id: 7, name: 'KB Push Press', description: 'Press kettlebell overhead using leg drive', equipment: 'kettlebell', muscleGroups: JSON.stringify(['shoulders', 'triceps', 'legs', 'core']) },
  { id: 8, name: 'KB Halos', description: 'Circle kettlebell around head for mobility', equipment: 'kettlebell', muscleGroups: JSON.stringify(['shoulders', 'core']) },
  { id: 9, name: 'Russian Twists', description: 'Seated rotation with or without weight', equipment: 'kettlebell', muscleGroups: JSON.stringify(['obliques', 'core']) },
  
  // Bodyweight exercises
  { id: 10, name: 'Push-ups', description: 'Classic chest and tricep exercise', equipment: 'bodyweight', muscleGroups: JSON.stringify(['chest', 'triceps', 'shoulders', 'core']) },
  { id: 11, name: 'Bodyweight Squats', description: 'Air squat without weight', equipment: 'bodyweight', muscleGroups: JSON.stringify(['quads', 'glutes']) },
  { id: 12, name: 'Hip Hinges', description: 'Practice hip hinge movement pattern', equipment: 'bodyweight', muscleGroups: JSON.stringify(['hamstrings', 'glutes', 'back']) },
  { id: 13, name: 'Jumping Jacks', description: 'Classic cardio warm-up movement', equipment: 'bodyweight', muscleGroups: JSON.stringify(['full body']) },
  { id: 14, name: 'High Knees', description: 'Running in place bringing knees high', equipment: 'bodyweight', muscleGroups: JSON.stringify(['core', 'hip flexors', 'cardio']) },
  { id: 15, name: 'Mountain Climbers', description: 'Alternating knee drives in plank position', equipment: 'bodyweight', muscleGroups: JSON.stringify(['core', 'shoulders', 'cardio']) },
  { id: 16, name: 'Plank', description: 'Isometric core hold', equipment: 'bodyweight', muscleGroups: JSON.stringify(['core', 'shoulders']) },
  { id: 17, name: 'Burpees', description: 'Full body explosive movement', equipment: 'bodyweight', muscleGroups: JSON.stringify(['full body', 'cardio']) },
  
  // Stretches
  { id: 18, name: 'Couch Stretch', description: 'Hip flexor and quad stretch', equipment: 'none', muscleGroups: JSON.stringify(['hip flexors', 'quads']) },
  { id: 19, name: 'Hamstring Stretch', description: 'Stretch for posterior chain', equipment: 'none', muscleGroups: JSON.stringify(['hamstrings']) },
  { id: 20, name: "Child's Pose", description: 'Restorative yoga pose', equipment: 'none', muscleGroups: JSON.stringify(['back', 'hips', 'shoulders']) },
  { id: 21, name: 'Deep Breathing', description: 'Nasal breathing for recovery', equipment: 'none', muscleGroups: JSON.stringify(['recovery']) },
];

// Helper to get exercise by ID
const getExercise = (id: number): Exercise => {
  const exercise = EXERCISES.find(e => e.id === id);
  if (!exercise) throw new Error(`Exercise with id ${id} not found`);
  return exercise;
};

// =============================================================================
// WORKOUTS - Add more workouts here!
// =============================================================================

// Each workout is defined with its full data including blocks and exercises
// Just add a new entry to WORKOUT_DATA following the existing pattern

interface WorkoutBlockData {
  name: string;
  type: 'warmup' | 'rounds' | 'emom' | 'amrap' | 'cooldown';
  rounds: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  order: number;
  exercises: {
    exerciseId: number;
    reps: number | null;
    durationSeconds: number | null;
    notes: string | null;
    order: number;
  }[];
}

interface WorkoutData {
  id: number;
  name: string;
  description: string | null;
  estimatedMinutes: number | null;
  difficulty: string | null;
  isPreset: boolean;
  blocks: WorkoutBlockData[];
}

const WORKOUT_DATA: WorkoutData[] = [
  {
    id: 1,
    name: 'Cold Kitchen From Hell',
    description: 'Full-body strength + lungs on fire. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'hands on hips', order: 3, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: null, order: 4, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: 'or high knees', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Power & Lungs',
        type: 'rounds',
        rounds: 4,
        durationSeconds: null,
        restSeconds: 30,
        order: 2,
        exercises: [
          { exerciseId: 1, reps: 20, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 10, reps: 10, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 2: Grind & Strength',
        type: 'emom',
        rounds: null,
        durationSeconds: 720, // 12 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 3, reps: 8, durationSeconds: null, notes: 'Left arm - Minute 1', order: 1 },
          { exerciseId: 3, reps: 8, durationSeconds: null, notes: 'Right arm - Minute 2', order: 2 },
          { exerciseId: 4, reps: 12, durationSeconds: null, notes: 'Minute 3', order: 3 },
        ],
      },
      {
        name: 'Block 3: Core + Stability',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 5, reps: 12, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 6, reps: 10, durationSeconds: null, notes: 'each leg', order: 2 },
          { exerciseId: 16, reps: null, durationSeconds: 30, notes: null, order: 3 },
          { exerciseId: 9, reps: 20, durationSeconds: null, notes: null, order: 4 },
        ],
      },
      {
        name: 'Block 4: Finisher (Mental Warfare)',
        type: 'amrap',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 1, reps: 10, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 3 },
          { exerciseId: 15, reps: 10, durationSeconds: null, notes: 'each leg', order: 4 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 19, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 3 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: '2-3 min nasal breathing', order: 4 },
        ],
      },
    ],
  },
  {
    id: 2, // Kettlebell Engine Builder
    name: 'Kettlebell Engine Builder',
    description: 'Build your kettlebell engine with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'slow + controlled', order: 3, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 4, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: 'or high knees', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Density Rounds',
        type: 'rounds',
        rounds: 5,
        durationSeconds: null,
        restSeconds: 30,
        order: 2,
        exercises: [
          { exerciseId: 1, reps: 15, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 4, reps: 12, durationSeconds: null, notes: null, order: 3 },
          { exerciseId: 10, reps: 8, durationSeconds: null, notes: null, order: 4 },
        ],
      },
      {
        name: 'Block 2: EMOM Strength',
        type: 'emom',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 3, reps: 6, durationSeconds: null, notes: 'Left arm - Minute 1', order: 1 },
          { exerciseId: 3, reps: 6, durationSeconds: null, notes: 'Right arm - Minute 2', order: 2 },
          { exerciseId: 5, reps: 12, durationSeconds: null, notes: 'Minute 3', order: 3 },
        ],
      },
      {
        name: 'Block 3: Core + Legs',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 6, reps: 8, durationSeconds: null, notes: 'each leg', order: 1 },
          { exerciseId: 16, reps: null, durationSeconds: 40, notes: null, order: 2 },
          { exerciseId: 9, reps: 24, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 480, // 8 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 1, reps: 12, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 15, reps: 12, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 19, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 3 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: '2-3 min nasal breathing', order: 4 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 3
  // ------------------------------------------------------------
  {
    id: 3, // Swing Ladder Beatdown 
    name: 'Swing Ladder Beatdown',
    description: 'Build your swing ladder with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 12, durationSeconds: 40, notes: 'hands on hips', order: 1, reps: null },
          { exerciseId: 8, durationSeconds: 20, notes: 'each direction', order: 2, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 3, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 4, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: 'or high knees', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Swing Ladder (Rounds)',
        type: 'rounds',
        rounds: 6,
        durationSeconds: null,
        restSeconds: 20,
        order: 2,
        exercises: [
          { exerciseId: 1, reps: 10, durationSeconds: null, notes: 'add +2 reps each round', order: 1 },
          { exerciseId: 2, reps: 8, durationSeconds: null, notes: 'add +1 rep each round', order: 2 },
          { exerciseId: 10, reps: 6, durationSeconds: null, notes: 'add +1 rep each round', order: 3 },
        ],
      },
      {
        name: 'Block 2: EMOM (Press + Row)',
        type: 'emom',
        rounds: null,
        durationSeconds: 720, // 12 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 7, reps: 8, durationSeconds: null, notes: 'Minute 1', order: 1 },
          { exerciseId: 4, reps: 14, durationSeconds: null, notes: 'Minute 2', order: 2 },
          { exerciseId: 5, reps: 12, durationSeconds: null, notes: 'Minute 3', order: 3 },
        ],
      },
      {
        name: 'Block 3: Core + Stability',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 6, reps: 10, durationSeconds: null, notes: 'each leg', order: 1 },
          { exerciseId: 16, reps: null, durationSeconds: 45, notes: null, order: 2 },
          { exerciseId: 9, reps: 30, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 420, // 7 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 1, reps: 15, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 15, reps: 10, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: '2-3 min breathing', order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 4
  // ------------------------------------------------------------
  {
    id: 4, // Clean + Squat Pressure Cooker
    name: 'Clean + Squat Pressure Cooker',
    description: 'Build your clean + squat pressure cooker with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'slow hinges', order: 2, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 3, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 4, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: null, order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Rounds (Heavy-ish)',
        type: 'rounds',
        rounds: 4,
        durationSeconds: null,
        restSeconds: 45,
        order: 2,
        exercises: [
          { exerciseId: 3, reps: 6, durationSeconds: null, notes: 'each arm', order: 1 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 4, reps: 12, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 2: EMOM (Swings + Push-ups)',
        type: 'emom',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 1, reps: 20, durationSeconds: null, notes: 'Minute 1', order: 1 },
          { exerciseId: 10, reps: 12, durationSeconds: null, notes: 'Minute 2', order: 2 },
        ],
      },
      {
        name: 'Block 3: Core + Legs',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 6, reps: 12, durationSeconds: null, notes: 'each leg', order: 1 },
          { exerciseId: 16, reps: null, durationSeconds: 30, notes: null, order: 2 },
          { exerciseId: 9, reps: 20, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 540, // 9 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 15, reps: 12, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 19, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 5
  // ------------------------------------------------------------
  {
    id: 5, // Small Space Destroyer
    name: 'Small Space Destroyer',
    description: 'Destroy your small space with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 13, durationSeconds: 30, notes: 'or high knees', order: 1, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: null, order: 3, reps: null },
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 4, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Rounds (No Rest Core Tax)',
        type: 'rounds',
        rounds: 4,
        durationSeconds: null,
        restSeconds: 20,
        order: 2,
        exercises: [
          { exerciseId: 5, reps: 15, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 16, reps: null, durationSeconds: 30, notes: null, order: 3 },
          { exerciseId: 10, reps: 10, durationSeconds: null, notes: null, order: 4 },
        ],
      },
      {
        name: 'Block 2: EMOM (Press Focus)',
        type: 'emom',
        rounds: null,
        durationSeconds: 720, // 12 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 3, reps: 5, durationSeconds: null, notes: 'Left arm - Minute 1', order: 1 },
          { exerciseId: 3, reps: 5, durationSeconds: null, notes: 'Right arm - Minute 2', order: 2 },
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: 'Minute 3', order: 3 },
        ],
      },
      {
        name: 'Block 3: AMRAP (Legs + Lungs)',
        type: 'amrap',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 4,
        exercises: [
          { exerciseId: 1, reps: 12, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 6, reps: 8, durationSeconds: null, notes: 'each leg', order: 2 },
          { exerciseId: 15, reps: 10, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 6
  // ------------------------------------------------------------
  {
    id: 6, // Goblet Squat Gauntlet
    name: 'Goblet Squat Gauntlet',
    description: 'Build your golet squat gauntlet with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'slow', order: 3, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: null, order: 4, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Squat + Swing Rounds',
        type: 'rounds',
        rounds: 6,
        durationSeconds: null,
        restSeconds: 30,
        order: 2,
        exercises: [
          { exerciseId: 2, reps: 15, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 1, reps: 20, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 10, reps: 8, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 2: EMOM (Row + Deadlift)',
        type: 'emom',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 4, reps: 16, durationSeconds: null, notes: 'Minute 1', order: 1 },
          { exerciseId: 5, reps: 15, durationSeconds: null, notes: 'Minute 2', order: 2 },
        ],
      },
      {
        name: 'Block 3: Core + Stability',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 16, reps: null, durationSeconds: 45, notes: null, order: 1 },
          { exerciseId: 9, reps: 30, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 6, reps: 10, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 360, // 6 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 15, reps: 12, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 19, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 7
  // ------------------------------------------------------------
  {
    id: 7, // Press + Plank Punisher
    name: 'Press + Plank Punisher',
    description: 'Build your press + plank punisher with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'slow', order: 2, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 3, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 4, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: null, order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Strength Rounds',
        type: 'rounds',
        rounds: 5,
        durationSeconds: null,
        restSeconds: 45,
        order: 2,
        exercises: [
          { exerciseId: 3, reps: 6, durationSeconds: null, notes: 'each arm', order: 1 },
          { exerciseId: 4, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 16, reps: null, durationSeconds: 30, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 2: EMOM (Swings)',
        type: 'emom',
        rounds: null,
        durationSeconds: 480, // 8 minutes
        restSeconds: null,
        order: 3,
        exercises: [{ exerciseId: 1, reps: 20, durationSeconds: null, notes: 'every minute', order: 1 }],
      },
      {
        name: 'Block 3: AMRAP (Press + Push-ups)',
        type: 'amrap',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 4,
        exercises: [
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 10, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 8
  // ------------------------------------------------------------
  {
    id: 8, // Legs on Fire (Lunge + Swing)
    name: 'Legs on Fire (Lunge + Swing)',
    description: 'Build your legs on fire with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 1, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 3, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: 'or high knees', order: 4, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Lunge + Swing Rounds',
        type: 'rounds',
        rounds: 4,
        durationSeconds: null,
        restSeconds: 45,
        order: 2,
        exercises: [
          { exerciseId: 6, reps: 12, durationSeconds: null, notes: 'each leg', order: 1 },
          { exerciseId: 1, reps: 25, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 2: EMOM (Goblet + Push-ups)',
        type: 'emom',
        rounds: null,
        durationSeconds: 600, // 10 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: 'Minute 1', order: 1 },
          { exerciseId: 10, reps: 12, durationSeconds: null, notes: 'Minute 2', order: 2 },
        ],
      },
      {
        name: 'Block 3: Core',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 16, reps: null, durationSeconds: 40, notes: null, order: 1 },
          { exerciseId: 9, reps: 30, durationSeconds: null, notes: null, order: 2 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 420, // 7 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 1, reps: 15, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 15, reps: 15, durationSeconds: null, notes: 'each leg', order: 2 },
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 19, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 9
  // ------------------------------------------------------------
  {
    id: 9, // Upper Back + Grip Smoker
    name: 'Upper Back + Grip Smoker',
    description: 'Build your upper back + grip smoker with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'pause at bottom', order: 2, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 3, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: null, order: 4, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: 'easy pace', order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Pull + Hinge Rounds',
        type: 'rounds',
        rounds: 5,
        durationSeconds: null,
        restSeconds: 45,
        order: 2,
        exercises: [
          { exerciseId: 4, reps: 16, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 5, reps: 15, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 1, reps: 20, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 2: EMOM (Clean + Press)',
        type: 'emom',
        rounds: null,
        durationSeconds: 720, // 12 minutes
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 3, reps: 6, durationSeconds: null, notes: 'Left arm - Minute 1', order: 1 },
          { exerciseId: 3, reps: 6, durationSeconds: null, notes: 'Right arm - Minute 2', order: 2 },
          { exerciseId: 10, reps: 10, durationSeconds: null, notes: 'Minute 3', order: 3 },
        ],
      },
      {
        name: 'Block 3: Core',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 16, reps: null, durationSeconds: 45, notes: null, order: 1 },
          { exerciseId: 9, reps: 24, durationSeconds: null, notes: null, order: 2 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 360, // 6 minutes
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 4, reps: 12, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 15, reps: 10, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 10
  // ------------------------------------------------------------
  {
    id: 10, // 30-Minute Brutal Express
    name: '30-Minute Brutal Express',
    description: 'Build your 30-minute brutal express with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 1,
        durationSeconds: 240,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: null, order: 3, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: null, order: 4, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: null, order: 5, reps: null },
          { exerciseId: 15, durationSeconds: 30, notes: 'each leg', order: 6, reps: null },
          { exerciseId: 16, durationSeconds: 30, notes: null, order: 7, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'again, slower', order: 8, reps: null },
        ],
      },
      {
        name: 'Block 1: EMOM (10 min)',
        type: 'emom',
        rounds: null,
        durationSeconds: 600,
        restSeconds: null,
        order: 2,
        exercises: [
          { exerciseId: 1, reps: 18, durationSeconds: null, notes: 'Minute 1', order: 1 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: 'Minute 2', order: 2 },
        ],
      },
      {
        name: 'Block 2: AMRAP (12 min)',
        type: 'amrap',
        rounds: null,
        durationSeconds: 720,
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 7, reps: 10, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 4, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 10, reps: 10, durationSeconds: null, notes: null, order: 3 },
          { exerciseId: 15, reps: 10, durationSeconds: null, notes: 'each leg', order: 4 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 4,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 19, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: null, order: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // WORKOUT 11
  // ------------------------------------------------------------
  {
    id: 11, // Kitchen Floor War (Classic)
    name: 'Kitchen Floor War (Classic)',
    description: 'Build your kitchen floor war with this workout. 4 blocks, minimal rest. If you finish early, you rest, not the other way around 😈',
    estimatedMinutes: 40,
    difficulty: 'advanced',
    isPreset: true,
    blocks: [
      {
        name: 'Warm-up',
        type: 'warmup',
        rounds: 2,
        durationSeconds: 300,
        restSeconds: 0,
        order: 1,
        exercises: [
          { exerciseId: 8, durationSeconds: 30, notes: 'each direction', order: 1, reps: null },
          { exerciseId: 11, durationSeconds: 30, notes: null, order: 2, reps: null },
          { exerciseId: 12, durationSeconds: 30, notes: 'hands on hips', order: 3, reps: null },
          { exerciseId: 13, durationSeconds: 30, notes: 'or high knees', order: 4, reps: null },
          { exerciseId: 10, durationSeconds: 30, notes: null, order: 5, reps: null },
        ],
      },
      {
        name: 'Block 1: Full-Body Rounds',
        type: 'rounds',
        rounds: 4,
        durationSeconds: null,
        restSeconds: 30,
        order: 2,
        exercises: [
          { exerciseId: 1, reps: 20, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 12, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 7, reps: 12, durationSeconds: null, notes: null, order: 3 },
          { exerciseId: 10, reps: 10, durationSeconds: null, notes: null, order: 4 },
        ],
      },
      {
        name: 'Block 2: EMOM (Clean & Press)',
        type: 'emom',
        rounds: null,
        durationSeconds: 720,
        restSeconds: null,
        order: 3,
        exercises: [
          { exerciseId: 3, reps: 7, durationSeconds: null, notes: 'Left arm - Minute 1', order: 1 },
          { exerciseId: 3, reps: 7, durationSeconds: null, notes: 'Right arm - Minute 2', order: 2 },
          { exerciseId: 4, reps: 14, durationSeconds: null, notes: 'Minute 3', order: 3 },
        ],
      },
      {
        name: 'Block 3: Core + Legs',
        type: 'rounds',
        rounds: 3,
        durationSeconds: null,
        restSeconds: 0,
        order: 4,
        exercises: [
          { exerciseId: 6, reps: 10, durationSeconds: null, notes: 'each leg', order: 1 },
          { exerciseId: 16, reps: null, durationSeconds: 40, notes: null, order: 2 },
          { exerciseId: 9, reps: 24, durationSeconds: null, notes: null, order: 3 },
        ],
      },
      {
        name: 'Block 4: Finisher',
        type: 'amrap',
        rounds: null,
        durationSeconds: 600,
        restSeconds: null,
        order: 5,
        exercises: [
          { exerciseId: 1, reps: 12, durationSeconds: null, notes: null, order: 1 },
          { exerciseId: 2, reps: 10, durationSeconds: null, notes: null, order: 2 },
          { exerciseId: 15, reps: 12, durationSeconds: null, notes: 'each leg', order: 3 },
        ],
      },
      {
        name: 'Cool Down',
        type: 'cooldown',
        rounds: null,
        durationSeconds: null,
        restSeconds: null,
        order: 6,
        exercises: [
          { exerciseId: 18, reps: null, durationSeconds: 60, notes: null, order: 1 },
          { exerciseId: 20, reps: null, durationSeconds: 60, notes: null, order: 2 },
          { exerciseId: 21, reps: null, durationSeconds: 120, notes: '2-3 min nasal breathing', order: 3 },
        ],
      },
    ],
  },
];

// Build fully hydrated workouts with blocks and exercises
function buildWorkouts(): WorkoutWithBlocks[] {
  let blockIdCounter = 1;
  let blockExerciseIdCounter = 1;

  return WORKOUT_DATA.map(workoutData => {
    const blocks: WorkoutBlockWithExercises[] = workoutData.blocks.map(blockData => {
      const blockId = blockIdCounter++;
      const exercises: BlockExerciseWithExercise[] = blockData.exercises.map(exData => {
        const blockExercise: BlockExerciseWithExercise = {
          id: blockExerciseIdCounter++,
          blockId,
          exerciseId: exData.exerciseId,
          reps: exData.reps,
          durationSeconds: exData.durationSeconds,
          notes: exData.notes,
          order: exData.order,
          exercise: getExercise(exData.exerciseId),
        };
        return blockExercise;
      });

      return {
        id: blockId,
        workoutId: workoutData.id,
        name: blockData.name,
        type: blockData.type,
        rounds: blockData.rounds,
        durationSeconds: blockData.durationSeconds,
        restSeconds: blockData.restSeconds,
        order: blockData.order,
        exercises,
      };
    });

    return {
      id: workoutData.id,
      name: workoutData.name,
      description: workoutData.description,
      estimatedMinutes: workoutData.estimatedMinutes,
      difficulty: workoutData.difficulty,
      isPreset: workoutData.isPreset,
      blocks,
    };
  });
}

// Export the built workouts
export const WORKOUTS: WorkoutWithBlocks[] = buildWorkouts();
