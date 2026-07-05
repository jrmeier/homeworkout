'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Exercise } from '@/lib/types';
import { Dumbbell } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  selected?: boolean;
}

export function ExerciseCard({ exercise, onClick, selected }: ExerciseCardProps) {
  const muscleGroups = exercise.muscleGroups 
    ? JSON.parse(exercise.muscleGroups) as string[]
    : [];

  return (
    <Card 
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        selected ? 'border-primary ring-2 ring-primary/20' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Dumbbell className="h-4 w-4 text-primary" />
          {exercise.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {exercise.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {exercise.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {exercise.equipment && (
            <Badge variant="secondary" className="text-xs">
              {exercise.equipment}
            </Badge>
          )}
          {muscleGroups.slice(0, 3).map((muscle) => (
            <Badge key={muscle} variant="outline" className="text-xs">
              {muscle}
            </Badge>
          ))}
          {muscleGroups.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{muscleGroups.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
