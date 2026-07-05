'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Clock, Dumbbell, HeartPulse, Pause, Play, Plus, ShieldAlert, TimerReset, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useTimer } from '@/lib/hooks/useTimer';
import { useWakeLock } from '@/lib/hooks/useWakeLock';
import {
  addCardioLog,
  addStrengthSet,
  canLogPosture,
  completePostureRoutine,
  completeProgramSession,
  getScheduledWorkout,
  saveSafetyAnswers,
  startProgramSession,
} from '@/lib/store';
import type { ExercisePrescription, ProgramBlock, ProgramSession, SafetyAnswers } from '@/lib/types';

interface ActiveWorkoutClientProps {
  workoutId: string;
}

const redFlagFields: Array<{ key: keyof Omit<SafetyAnswers, 'checkedAt' | 'acknowledged'>; label: string }> = [
  { key: 'numbnessOrTingling', label: 'Numbness or tingling' },
  { key: 'radiatingPain', label: 'Pain radiating into an arm' },
  { key: 'dizziness', label: 'Dizziness or balance symptoms' },
  { key: 'severeHeadache', label: 'Severe headache' },
  { key: 'recentTrauma', label: 'Recent trauma or fall' },
  { key: 'weakness', label: 'New weakness' },
  { key: 'worseningPain', label: 'Worsening or sharp neck pain' },
];

function blockIcon(type: ProgramBlock['type']) {
  if (type === 'strength') return <Dumbbell className="h-4 w-4" />;
  if (type === 'cardio') return <Clock className="h-4 w-4" />;
  if (type === 'posture') return <HeartPulse className="h-4 w-4" />;
  return <TimerReset className="h-4 w-4" />;
}

export default function ActiveWorkoutClient({ workoutId }: ActiveWorkoutClientProps) {
  const router = useRouter();
  const workout = useMemo(() => getScheduledWorkout(workoutId), [workoutId]);
  const [session, setSession] = useState<ProgramSession | null>(null);
  const [blockIndex, setBlockIndex] = useState(0);
  const [exerciseInputs, setExerciseInputs] = useState<Record<string, { reps: string; weight: string; rpe: string }>>({});
  const [notes, setNotes] = useState('');
  const [energy, setEnergy] = useState('7');
  const [body, setBody] = useState('');
  const [safetyDraft, setSafetyDraft] = useState<Record<string, boolean>>({});
  const [soundOn, setSoundOn] = useState(true);
  const [complete, setComplete] = useState(false);
  const wakeLock = useWakeLock();
  const totalTimer = useTimer({ initialSeconds: 0, countDown: false });

  useEffect(() => {
    if (!workout) return;
    const created = startProgramSession(workout.id);
    setSession(created);
    wakeLock.request();
    totalTimer.start();
    return () => {
      wakeLock.release();
      totalTimer.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout?.id]);

  if (!workout) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="space-y-4 p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
            <p className="font-semibold">Workout not found</p>
            <Button onClick={() => router.push('/program')}>Back to Program</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const currentBlock = workout.blocks[blockIndex];
  const progress = Math.round((blockIndex / workout.blocks.length) * 100);

  const playTone = () => {
    if (!soundOn) return;
    try {
      const audio = new AudioContext();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.frequency.value = 740;
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(audio.currentTime + 0.12);
    } catch {
      // Audio can be unavailable in some PWA contexts.
    }
  };

  const nextBlock = () => {
    playTone();
    if (blockIndex >= workout.blocks.length - 1) {
      finishSession();
      return;
    }
    setBlockIndex((value) => value + 1);
  };

  const logStrengthSet = (exercise: ExercisePrescription) => {
    if (!session) return;
    const key = exercise.id;
    const draft = exerciseInputs[key] || { reps: '', weight: '', rpe: '' };
    const setCount = session.strengthSets.filter((set) => set.exerciseId === exercise.id).length + 1;
    const updated = addStrengthSet(session.id, {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setNumber: setCount,
      reps: draft.reps ? Number(draft.reps) : null,
      weight: draft.weight ? Number(draft.weight) : null,
      rpe: draft.rpe ? Number(draft.rpe) : null,
    });
    if (updated) setSession({ ...updated });
  };

  const logCardio = (block: ProgramBlock) => {
    if (!session || !block.cardio) return;
    const updated = addCardioLog(session.id, {
      blockId: block.id,
      equipment: block.cardio.equipment,
      minutes: block.cardio.durationMinutes,
      intensity: block.cardio.intensity,
    });
    if (updated) setSession({ ...updated });
  };

  const submitSafety = () => {
    if (!session) return;
    const updated = saveSafetyAnswers(session.id, {
      numbnessOrTingling: Boolean(safetyDraft.numbnessOrTingling),
      radiatingPain: Boolean(safetyDraft.radiatingPain),
      dizziness: Boolean(safetyDraft.dizziness),
      severeHeadache: Boolean(safetyDraft.severeHeadache),
      recentTrauma: Boolean(safetyDraft.recentTrauma),
      weakness: Boolean(safetyDraft.weakness),
      worseningPain: Boolean(safetyDraft.worseningPain),
      acknowledged: true,
    });
    if (updated) setSession({ ...updated });
  };

  const logPosture = (block: ProgramBlock) => {
    if (!session || !block.posture) return;
    const updated = completePostureRoutine(session.id, block.posture.id, block.posture.durationMinutes);
    if (updated) setSession({ ...updated });
  };

  const finishSession = () => {
    if (!session) return;
    const updated = completeProgramSession(session.id, {
      notes,
      energy: energy ? Number(energy) : null,
      body,
    });
    if (updated) setSession({ ...updated });
    totalTimer.pause();
    wakeLock.release();
    setComplete(true);
  };

  if (complete) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-5 p-6 text-center">
            <Check className="mx-auto h-12 w-12 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold">Session Complete</h1>
              <p className="text-muted-foreground">{workout.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-md border border-border p-2">
                <p className="font-semibold">{totalTimer.formatTime()}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="rounded-md border border-border p-2">
                <p className="font-semibold">{session?.strengthSets.length || 0}</p>
                <p className="text-xs text-muted-foreground">Sets</p>
              </div>
              <div className="rounded-md border border-border p-2">
                <p className="font-semibold">{session?.postureLogs.length || 0}</p>
                <p className="text-xs text-muted-foreground">Posture</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => router.push('/history')}>View History</Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>Back Today</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-6">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/program')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{totalTimer.formatTime()}</p>
              <h1 className="text-base font-semibold">{workout.name}</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSoundOn((value) => !value)}>
              {soundOn ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
          <Progress value={progress} />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Block {blockIndex + 1} of {workout.blocks.length}</span>
            <span>{currentBlock.durationMinutes} min</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                {blockIcon(currentBlock.type)}
                {currentBlock.name}
              </CardTitle>
              <Badge variant="outline">{currentBlock.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBlock.notes && <p className="text-sm text-muted-foreground">{currentBlock.notes}</p>}

            {currentBlock.type === 'strength' && currentBlock.exercises?.map((exercise) => {
              const logged = session?.strengthSets.filter((set) => set.exerciseId === exercise.id).length || 0;
              const draft = exerciseInputs[exercise.id] || { reps: '', weight: '', rpe: '' };
              return (
                <div key={exercise.id} className="space-y-3 rounded-md border border-border p-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">{exercise.target} · {exercise.equipment}</p>
                      </div>
                      <Badge variant="secondary">{logged}/{exercise.sets || 1}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{exercise.notes}</p>
                    {exercise.alternatives && <p className="mt-1 text-xs text-muted-foreground">Alt: {exercise.alternatives.join(', ')}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input inputMode="numeric" placeholder="Reps" value={draft.reps} onChange={(event) => setExerciseInputs((prev) => ({ ...prev, [exercise.id]: { ...draft, reps: event.target.value } }))} />
                    <Input inputMode="decimal" placeholder="Weight" value={draft.weight} onChange={(event) => setExerciseInputs((prev) => ({ ...prev, [exercise.id]: { ...draft, weight: event.target.value } }))} />
                    <Input inputMode="numeric" placeholder="RPE" value={draft.rpe} onChange={(event) => setExerciseInputs((prev) => ({ ...prev, [exercise.id]: { ...draft, rpe: event.target.value } }))} />
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => logStrengthSet(exercise)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Set
                  </Button>
                </div>
              );
            })}

            {currentBlock.type === 'cardio' && currentBlock.cardio && (
              <div className="space-y-3">
                <p className="text-lg font-semibold">{currentBlock.cardio.name}</p>
                <p className="text-sm text-muted-foreground">{currentBlock.cardio.instructions}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-muted-foreground">Equipment</p>
                    <p className="font-medium">{currentBlock.cardio.equipment}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-muted-foreground">Intensity</p>
                    <p className="font-medium">{currentBlock.cardio.intensity}</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => logCardio(currentBlock)}>
                  <Check className="mr-2 h-4 w-4" />
                  Log {currentBlock.cardio.durationMinutes} Cardio Minutes
                </Button>
              </div>
            )}

            {currentBlock.type === 'posture' && currentBlock.posture && (
              <div className="space-y-4">
                {!session?.safetyAnswers ? (
                  <div className="space-y-3">
                    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
                      <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Neck Safety Check</p>
                      <p className="mt-1 text-sm text-muted-foreground">Select any symptoms you have today. If any are present, posture work is blocked for this session.</p>
                    </div>
                    {redFlagFields.map((field) => (
                      <label key={field.key} className="flex items-center justify-between rounded-md border border-border px-3 py-3 text-sm">
                        <span>{field.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(safetyDraft[field.key])}
                          onChange={(event) => setSafetyDraft((prev) => ({ ...prev, [field.key]: event.target.checked }))}
                          className="h-5 w-5"
                        />
                      </label>
                    ))}
                    <Button className="w-full" onClick={submitSafety}>Save Safety Check</Button>
                  </div>
                ) : !canLogPosture(session) ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
                    <p className="font-semibold">Posture work blocked today</p>
                    <p className="mt-2 text-sm text-muted-foreground">Because a red-flag symptom was selected, skip neck/posture drills and consider medical or physical therapy guidance before progressing.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{currentBlock.posture.safetyNote}</p>
                    {currentBlock.posture.items.map((item) => (
                      <div key={item.id} className="rounded-md border border-border p-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.target}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>
                      </div>
                    ))}
                    <Button className="w-full" onClick={() => logPosture(currentBlock)}>
                      <HeartPulse className="mr-2 h-4 w-4" />
                      Complete Posture Routine
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {blockIndex >= workout.blocks.length - 1 && (
          <Card>
            <CardContent className="space-y-3 p-4">
              <div>
                <Label htmlFor="energy">Energy 1-10</Label>
                <Input id="energy" inputMode="numeric" value={energy} onChange={(event) => setEnergy(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="body">Body notes</Label>
                <Input id="body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Neck, back, knees, recovery..." />
              </div>
              <div>
                <Label htmlFor="notes">Session notes</Label>
                <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What improved? What should change next time?" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/program')}>
            <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
          <Button className="flex-1" onClick={nextBlock}>
            {blockIndex >= workout.blocks.length - 1 ? 'Finish' : 'Next Block'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
