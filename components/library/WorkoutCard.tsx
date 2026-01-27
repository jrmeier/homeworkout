'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkoutWithBlocks } from '@/lib/types';
import { Clock, Flame, Play, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface WorkoutCardProps {
  workout: WorkoutWithBlocks;
}

const blockTypeColors: Record<string, string> = {
  warmup: 'bg-yellow-500/20 text-yellow-500',
  rounds: 'bg-red-500/20 text-red-500',
  emom: 'bg-blue-500/20 text-blue-500',
  amrap: 'bg-purple-500/20 text-purple-500',
  cooldown: 'bg-green-500/20 text-green-500',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-500',
  intermediate: 'bg-yellow-500/20 text-yellow-500',
  advanced: 'bg-red-500/20 text-red-500',
};

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const totalExercises = workout.blocks.reduce(
    (acc, block) => acc + block.exercises.length,
    0
  );

  const blockTypes = [...new Set(workout.blocks.map(b => b.type))];

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-primary" />
              {workout.name}
            </CardTitle>
            {workout.isPreset && (
              <Badge variant="secondary" className="text-xs">
                Preset
              </Badge>
            )}
          </div>
          {workout.difficulty && (
            <Badge className={difficultyColors[workout.difficulty] || ''}>
              {workout.difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workout.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workout.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {workout.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {workout.estimatedMinutes} min
            </span>
          )}
          <span>{workout.blocks.length} blocks</span>
          <span>{totalExercises} exercises</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {blockTypes.map((type) => (
            <Badge
              key={type}
              variant="outline"
              className={`text-xs ${blockTypeColors[type] || ''}`}
            >
              {type.toUpperCase()}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/active/${workout.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/workouts/${workout.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
