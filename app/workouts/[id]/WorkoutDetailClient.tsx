'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getWorkoutById } from '@/lib/store';
import type { WorkoutWithBlocks } from '@/lib/types';
import { ArrowLeft, Clock, Flame, Play, Repeat, Timer } from 'lucide-react';
import Link from 'next/link';

const blockTypeIcons: Record<string, React.ReactNode> = {
  warmup: <Timer className="h-4 w-4" />,
  rounds: <Repeat className="h-4 w-4" />,
  emom: <Clock className="h-4 w-4" />,
  amrap: <Flame className="h-4 w-4" />,
  cooldown: <Timer className="h-4 w-4" />,
};

const blockTypeColors: Record<string, string> = {
  warmup: 'border-yellow-500/50 bg-yellow-500/10',
  rounds: 'border-red-500/50 bg-red-500/10',
  emom: 'border-blue-500/50 bg-blue-500/10',
  amrap: 'border-purple-500/50 bg-purple-500/10',
  cooldown: 'border-green-500/50 bg-green-500/10',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface WorkoutDetailClientProps {
  workoutId: string;
}

export default function WorkoutDetailClient({ workoutId }: WorkoutDetailClientProps) {
  const [workout, setWorkout] = useState<WorkoutWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load workout from the store
    const workoutData = getWorkoutById(parseInt(workoutId));
    setWorkout(workoutData);
    setLoading(false);
  }, [workoutId]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen pb-20">
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Workout not found</p>
          <Button asChild>
            <Link href="/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workouts">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{workout.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {workout.estimatedMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {workout.estimatedMinutes} min
                  </span>
                )}
                {workout.difficulty && (
                  <Badge variant="outline" className="text-xs">
                    {workout.difficulty}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {workout.description && (
          <p className="text-muted-foreground">{workout.description}</p>
        )}

        <Button className="w-full" size="lg" asChild>
          <Link href={`/active/${workout.id}`}>
            <Play className="h-5 w-5 mr-2" />
            Start Workout
          </Link>
        </Button>

        <Separator />

        <div className="space-y-4">
          {workout.blocks.map((block) => (
            <Card 
              key={block.id} 
              className={`${blockTypeColors[block.type] || ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {blockTypeIcons[block.type]}
                  {block.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {block.type.toUpperCase()}
                  </Badge>
                  {block.rounds && (
                    <span>{block.rounds} rounds</span>
                  )}
                  {block.durationSeconds && (
                    <span>{formatDuration(block.durationSeconds)}</span>
                  )}
                  {block.restSeconds && block.restSeconds > 0 && (
                    <span>{block.restSeconds}s rest</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {block.exercises.map((blockExercise) => (
                    <li 
                      key={blockExercise.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium">
                        {blockExercise.exercise.name}
                      </span>
                      <span className="text-muted-foreground">
                        {blockExercise.reps && `${blockExercise.reps} reps`}
                        {blockExercise.durationSeconds && formatDuration(blockExercise.durationSeconds)}
                        {blockExercise.notes && ` (${blockExercise.notes})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
