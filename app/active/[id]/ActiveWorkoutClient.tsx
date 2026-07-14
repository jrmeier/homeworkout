'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/workout/ProgressRing';
import { Textarea } from '@/components/ui/textarea';
import { useTimer } from '@/lib/hooks/useTimer';
import { useWakeLock } from '@/lib/hooks/useWakeLock';
import { addSessionLog, getOrCreateActiveSession, getWorkoutById, updateSession } from '@/lib/store';
import type { WorkoutProgress, WorkoutWithBlocks } from '@/lib/types';
import { 
  Play, Pause, SkipForward, X, Check, 
  Flame, Volume2, VolumeX 
} from 'lucide-react';

type WorkoutPhase = 'ready' | 'active' | 'rest' | 'complete';

interface WorkoutState {
  phase: WorkoutPhase;
  currentBlockIndex: number;
  currentExerciseIndex: number;
  currentRound: number;
  amrapRounds: number;
  sessionId: number | null;
}

const blockTypeColors: Record<string, string> = {
  warmup: 'text-yellow-500',
  rounds: 'text-red-500',
  emom: 'text-blue-500',
  amrap: 'text-purple-500',
  cooldown: 'text-green-500',
};

interface ActiveWorkoutClientProps {
  workoutId: string;
}

export default function ActiveWorkoutClient({ workoutId }: ActiveWorkoutClientProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionNotes, setSessionNotes] = useState('');
  const recordedExerciseKeys = useRef(new Set<string>());
  
  const [state, setState] = useState<WorkoutState>({
    phase: 'ready',
    currentBlockIndex: 0,
    currentExerciseIndex: 0,
    currentRound: 1,
    amrapRounds: 0,
    sessionId: null,
  });

  const wakeLock = useWakeLock();

  // Main workout timer
  const timer = useTimer({
    initialSeconds: 0,
    countDown: false,
    autoStart: false,
  });

  // Block/exercise timer (for countdown-based exercises)
  const blockTimer = useTimer({
    initialSeconds: 0,
    countDown: true,
    autoStart: false,
    onComplete: () => handleTimerComplete(),
  });

  useEffect(() => {
    const loadWorkout = window.setTimeout(() => {
      setWorkout(getWorkoutById(parseInt(workoutId)));
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(loadWorkout);
  }, [workoutId]);

  const playSound = useCallback((type: 'beep' | 'complete' | 'rest') => {
    if (!soundEnabled) return;
    
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies: Record<string, number> = {
        beep: 800,
        complete: 1200,
        rest: 400,
      };
      
      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  const initializeBlockTimer = useCallback((progress?: WorkoutProgress | null) => {
    if (!workout) return;

    const blockIndex = progress?.currentBlockIndex ?? state.currentBlockIndex;
    const exerciseIndex = progress?.currentExerciseIndex ?? state.currentExerciseIndex;
    const block = workout.blocks[blockIndex];
    if (!block) return;

    if (progress?.blockSeconds && progress.blockSeconds > 0) {
      blockTimer.reset(progress.blockSeconds);
      blockTimer.start();
      return;
    }

    if (block.type === 'emom') {
      // EMOM: 60 second intervals
      blockTimer.reset(60);
      blockTimer.start();
    } else if (block.type === 'amrap') {
      // AMRAP: total duration countdown
      blockTimer.reset(block.durationSeconds || 600);
      blockTimer.start();
    } else if (block.type === 'warmup' || block.type === 'cooldown') {
      // Timed exercise
      const exercise = block.exercises[exerciseIndex];
      if (exercise?.durationSeconds) {
        blockTimer.reset(exercise.durationSeconds);
        blockTimer.start();
      }
    }
  }, [workout, state.currentBlockIndex, state.currentExerciseIndex, blockTimer]);

  const startWorkout = () => {
    const session = getOrCreateActiveSession(parseInt(workoutId));
    const progress = session.progress;

    setSessionNotes(session.notes || '');
    setState({
      phase: progress?.phase || 'active',
      currentBlockIndex: progress?.currentBlockIndex || 0,
      currentExerciseIndex: progress?.currentExerciseIndex || 0,
      currentRound: progress?.currentRound || 1,
      amrapRounds: progress?.amrapRounds || 0,
      sessionId: session.id,
    });
    wakeLock.request();
    timer.reset(progress?.elapsedSeconds || 0);
    timer.start();

    window.setTimeout(() => initializeBlockTimer(progress), 0);
  };

  const recordCurrentExercise = useCallback(() => {
    if (!workout || !state.sessionId) return;
    const block = workout.blocks[state.currentBlockIndex];
    const exercise = block?.exercises[state.currentExerciseIndex];
    if (!block || !exercise) return;

    const key = `${state.sessionId}:${block.id}:${exercise.exerciseId}:${state.currentRound}:${state.amrapRounds}`;
    if (recordedExerciseKeys.current.has(key)) return;

    recordedExerciseKeys.current.add(key);
    addSessionLog({
      sessionId: state.sessionId,
      exerciseId: exercise.exerciseId,
      blockId: block.id,
      reps: exercise.reps,
      weight: null,
      round: block.type === 'amrap' ? state.amrapRounds + 1 : state.currentRound,
    });
  }, [workout, state]);

  function handleTimerComplete() {
    playSound('beep');
    
    if (!workout) return;
    const block = workout.blocks[state.currentBlockIndex];
    if (!block) return;

    if (block.type === 'emom') {
      recordCurrentExercise();
      // Move to next exercise in EMOM cycle
      const nextExercise = (state.currentExerciseIndex + 1) % block.exercises.length;
      const nextRound = nextExercise === 0 ? state.currentRound + 1 : state.currentRound;
      
      // Check if EMOM is complete
      const totalMinutes = (block.durationSeconds || 720) / 60;
      const currentMinute = (state.currentRound - 1) * block.exercises.length + state.currentExerciseIndex + 1;
      
      if (currentMinute >= totalMinutes) {
        moveToNextBlock();
      } else {
        setState(prev => ({
          ...prev,
          currentExerciseIndex: nextExercise,
          currentRound: nextRound,
        }));
        blockTimer.reset(60);
        blockTimer.start();
      }
    } else if (block.type === 'amrap') {
      // AMRAP time's up
      playSound('complete');
      moveToNextBlock();
    } else if (block.type === 'warmup' || block.type === 'cooldown') {
      recordCurrentExercise();
      // Move to next exercise
      moveToNextExercise();
    }
  }

  function moveToNextExercise() {
    if (!workout) return;
    const block = workout.blocks[state.currentBlockIndex];
    if (!block) return;

    const nextExerciseIndex = state.currentExerciseIndex + 1;
    
    if (nextExerciseIndex >= block.exercises.length) {
      // End of exercises in this round
      if (block.type === 'rounds' && state.currentRound < (block.rounds || 1)) {
        // More rounds to go
        if (block.restSeconds && block.restSeconds > 0) {
          // Rest period
          setState(prev => ({ ...prev, phase: 'rest' }));
          blockTimer.reset(block.restSeconds);
          blockTimer.start();
        } else {
          // No rest, start next round
          setState(prev => ({
            ...prev,
            currentRound: prev.currentRound + 1,
            currentExerciseIndex: 0,
          }));
        }
      } else {
        // Block complete
        moveToNextBlock();
      }
    } else {
      setState(prev => ({ ...prev, currentExerciseIndex: nextExerciseIndex }));
      
      // Set up timer for timed exercises
      if (block.type === 'warmup' || block.type === 'cooldown') {
        const exercise = block.exercises[nextExerciseIndex];
        if (exercise?.durationSeconds) {
          blockTimer.reset(exercise.durationSeconds);
          blockTimer.start();
        }
      }
    }
  }

  function moveToNextBlock() {
    if (!workout) return;
    
    const nextBlockIndex = state.currentBlockIndex + 1;
    
    if (nextBlockIndex >= workout.blocks.length) {
      // Workout complete!
      completeWorkout();
    } else {
      playSound('complete');
      setState(prev => ({
        ...prev,
        currentBlockIndex: nextBlockIndex,
        currentExerciseIndex: 0,
        currentRound: 1,
        phase: 'active',
      }));
      
      // Initialize timer for new block
      setTimeout(() => {
        initializeBlockTimer();
      }, 100);
    }
  }

  const handleRestComplete = useCallback(() => {
    playSound('beep');
    setState(prev => ({
      ...prev,
      phase: 'active',
      currentRound: prev.currentRound + 1,
      currentExerciseIndex: 0,
    }));
  }, [playSound]);

  function completeWorkout() {
    timer.pause();
    blockTimer.pause();
    wakeLock.release();
    playSound('complete');
    
    setState(prev => ({ ...prev, phase: 'complete' }));
    
    // Update session in localStorage
    if (state.sessionId) {
      updateSession(state.sessionId, {
        completedAt: new Date().toISOString(),
        totalRounds: state.amrapRounds || null,
        notes: sessionNotes.trim() || null,
        progress: null,
      });
    }
  }

  const handleExerciseComplete = () => {
    if (!workout) return;
    const block = workout.blocks[state.currentBlockIndex];
    
    recordCurrentExercise();

    if (block.type === 'amrap') {
      // In AMRAP, completing all exercises = 1 round
      const nextExercise = (state.currentExerciseIndex + 1) % block.exercises.length;
      if (nextExercise === 0) {
        setState(prev => ({
          ...prev,
          amrapRounds: prev.amrapRounds + 1,
          currentExerciseIndex: 0,
        }));
      } else {
        setState(prev => ({ ...prev, currentExerciseIndex: nextExercise }));
      }
    } else {
      moveToNextExercise();
    }
  };

  const exitWorkout = () => {
    timer.pause();
    blockTimer.pause();
    wakeLock.release();
    router.push('/workouts');
  };

  // Effect to handle rest period completion
  useEffect(() => {
    if (state.phase === 'rest' && blockTimer.seconds === 0 && !blockTimer.isRunning) {
      const resumeAfterRest = window.setTimeout(handleRestComplete, 0);
      return () => window.clearTimeout(resumeAfterRest);
    }
  }, [state.phase, blockTimer.seconds, blockTimer.isRunning, handleRestComplete]);

  // Persist enough state to make refreshes and accidental navigation recoverable.
  useEffect(() => {
    if (!state.sessionId || (state.phase !== 'active' && state.phase !== 'rest')) return;
    updateSession(state.sessionId, {
      notes: sessionNotes.trim() || null,
      progress: {
        phase: state.phase,
        currentBlockIndex: state.currentBlockIndex,
        currentExerciseIndex: state.currentExerciseIndex,
        currentRound: state.currentRound,
        amrapRounds: state.amrapRounds,
        elapsedSeconds: timer.seconds,
        blockSeconds: blockTimer.seconds,
      },
    });
  }, [state, sessionNotes, timer.seconds, blockTimer.seconds]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading workout...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Workout not found</p>
        <Button onClick={() => router.push('/workouts')}>Back to Workouts</Button>
      </div>
    );
  }

  const currentBlock = workout.blocks[state.currentBlockIndex];
  const currentExercise = currentBlock?.exercises[state.currentExerciseIndex];
  const totalExercises = workout.blocks.reduce((acc, b) => acc + b.exercises.length, 0);
  const completedExercises = workout.blocks
    .slice(0, state.currentBlockIndex)
    .reduce((acc, b) => acc + b.exercises.length, 0) + state.currentExerciseIndex;
  const overallProgress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  // Ready state
  if (state.phase === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-6 max-w-md">
          <Flame className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">{workout.name}</h1>
          <p className="text-muted-foreground">{workout.description}</p>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline">{workout.blocks.length} blocks</Badge>
            <Badge variant="outline">{totalExercises} exercises</Badge>
            {workout.estimatedMinutes && (
              <Badge variant="outline">~{workout.estimatedMinutes} min</Badge>
            )}
          </div>
          
          <Button size="lg" className="w-full text-lg h-14" onClick={startWorkout}>
            <Play className="h-6 w-6 mr-2" />
            Start Workout
          </Button>
          
          <Button variant="ghost" onClick={() => router.push('/workouts')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Complete state
  if (state.phase === 'complete') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-primary/10">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold">Workout Complete!</h1>
          <p className="text-xl text-muted-foreground">{workout.name}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{timer.formatTime()}</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </CardContent>
            </Card>
            {state.amrapRounds > 0 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{state.amrapRounds}</p>
                  <p className="text-sm text-muted-foreground">AMRAP Rounds</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Button size="lg" className="w-full" onClick={() => router.push('/history')}>
            View History
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/workouts')}>
            Back to Workouts
          </Button>
        </div>
      </div>
    );
  }

  // Active/Rest state
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={exitWorkout}>
          <X className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Time</p>
          <p className="text-lg font-mono font-bold">{timer.formatTime()}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <Progress value={overallProgress * 100} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Block {state.currentBlockIndex + 1} of {workout.blocks.length}</span>
          <span>{Math.round(overallProgress * 100)}%</span>
        </div>
      </div>

      {/* Rest Overlay */}
      {state.phase === 'rest' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-blue-500/10">
          <h2 className="text-2xl font-bold mb-4">Rest</h2>
          <ProgressRing 
            progress={1 - (blockTimer.seconds / (currentBlock?.restSeconds || 30))}
            size={200}
          >
            <div className="text-center">
              <p className="text-5xl font-mono font-bold">{blockTimer.formatTime()}</p>
              <p className="text-sm text-muted-foreground">until round {state.currentRound + 1}</p>
            </div>
          </ProgressRing>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={handleRestComplete}
          >
            Skip Rest
          </Button>
        </div>
      )}

      {/* Active Workout View */}
      {state.phase === 'active' && currentBlock && currentExercise && (
        <div className="flex-1 flex flex-col">
          {/* Block Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <Badge 
                  variant="outline" 
                  className={blockTypeColors[currentBlock.type]}
                >
                  {currentBlock.type.toUpperCase()}
                </Badge>
                <h2 className="text-lg font-bold mt-1">{currentBlock.name}</h2>
              </div>
              <div className="text-right">
                {currentBlock.type === 'rounds' && (
                  <p className="text-sm text-muted-foreground">
                    Round {state.currentRound} of {currentBlock.rounds}
                  </p>
                )}
                {currentBlock.type === 'emom' && (
                  <p className="text-sm text-muted-foreground">
                    Minute {(state.currentRound - 1) * currentBlock.exercises.length + state.currentExerciseIndex + 1}
                  </p>
                )}
                {currentBlock.type === 'amrap' && (
                  <p className="text-sm text-muted-foreground">
                    Rounds: {state.amrapRounds}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Exercise */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {/* Timer for countdown blocks */}
            {(currentBlock.type === 'emom' || currentBlock.type === 'amrap' || 
              currentBlock.type === 'warmup' || currentBlock.type === 'cooldown') && (
              <ProgressRing 
                progress={
                  currentBlock.type === 'amrap' 
                    ? 1 - (blockTimer.seconds / (currentBlock.durationSeconds || 600))
                    : currentBlock.type === 'emom'
                    ? 1 - (blockTimer.seconds / 60)
                    : 1 - (blockTimer.seconds / (currentExercise.durationSeconds || 30))
                }
                size={180}
                className="mb-6"
              >
                <div className="text-center">
                  <p className="text-4xl font-mono font-bold">{blockTimer.formatTime()}</p>
                </div>
              </ProgressRing>
            )}

            {/* Exercise Name */}
            <h1 className="text-3xl font-bold text-center mb-4">
              {currentExercise.exercise.name}
            </h1>

            {/* Reps/Duration */}
            <div className="text-center mb-6">
              {currentExercise.reps && (
                <p className="text-5xl font-bold text-primary">
                  {currentExercise.reps}
                  <span className="text-xl text-muted-foreground ml-2">reps</span>
                </p>
              )}
              {currentExercise.durationSeconds && !currentExercise.reps && (
                <p className="text-xl text-muted-foreground">
                  {Math.floor(currentExercise.durationSeconds / 60)}:
                  {(currentExercise.durationSeconds % 60).toString().padStart(2, '0')}
                </p>
              )}
              {currentExercise.notes && (
                <p className="text-muted-foreground mt-2">{currentExercise.notes}</p>
              )}
            </div>

            {/* Next Exercise Preview */}
            {state.currentExerciseIndex < currentBlock.exercises.length - 1 && (
              <div className="text-center text-sm text-muted-foreground">
                <span>Next: </span>
                <span className="font-medium">
                  {currentBlock.exercises[state.currentExerciseIndex + 1].exercise.name}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2 border-t border-border">
            <Textarea
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
              placeholder="Add a note about this workout (optional)"
              aria-label="Workout notes"
              className="min-h-16 resize-none"
            />
            <Button 
              size="lg" 
              className="w-full h-16 text-lg"
              onClick={handleExerciseComplete}
            >
              <Check className="h-6 w-6 mr-2" />
              Done
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  if (timer.isRunning) {
                    timer.pause();
                    blockTimer.pause();
                  } else {
                    timer.start();
                    if (blockTimer.seconds > 0) blockTimer.start();
                  }
                }}
              >
                {timer.isRunning ? (
                  <><Pause className="h-4 w-4 mr-2" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Resume</>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={moveToNextBlock}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip Block
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
