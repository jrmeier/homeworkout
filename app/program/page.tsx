'use client';

import Link from 'next/link';
import { Calendar, CheckCircle2, Clock, Dumbbell, HeartPulse, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProgram, getWorkoutDate } from '@/lib/store';
import type { ProgramBlock } from '@/lib/types';

function blockDetail(block: ProgramBlock): string {
  if (block.notes) return block.notes;
  if (block.cardio) return `${block.cardio.instructions} ${block.cardio.intensity}.`;
  if (block.posture) {
    const moves = block.posture.items.map((item) => item.name).join(', ');
    return `${block.posture.name}: ${moves}.`;
  }
  if (block.exercises?.length) {
    return block.exercises
      .map((exercise) => `${exercise.name} (${exercise.target})`)
      .join('; ');
  }
  return '';
}

export default function ProgramPage() {
  const program = getProgram();
  const workouts = program.weeks[0].workouts;

  return (
    <main className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{program.summary}</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <Card>
          <CardContent className="grid grid-cols-3 gap-3 p-4 text-center">
            <div>
              <Dumbbell className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
            <div>
              <RotateCcw className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-bold">1</p>
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
            <div>
              <HeartPulse className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
              <p className="text-xl font-bold">Daily</p>
              <p className="text-xs text-muted-foreground">Posture</p>
            </div>
          </CardContent>
        </Card>

        {workouts.map((workout) => {
          const scheduled = getWorkoutDate(workout).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
          return (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {workout.dayLabel} · {scheduled}
                    </p>
                  </div>
                  <Badge variant={workout.required ? 'default' : 'outline'}>
                    {workout.required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{workout.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />{workout.estimatedMinutes} min</Badge>
                  {workout.blocks.map((block) => (
                    <Badge key={block.id} variant="outline">{block.type}</Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  {workout.blocks.map((block) => (
                    <div key={block.id} className="rounded-md border border-border px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{block.name}</span>
                        <span className="shrink-0 text-muted-foreground">{block.durationMinutes}m</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {blockDetail(block)}
                      </p>
                    </div>
                  ))}
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/active/${workout.id}`}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Start This Workout
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
