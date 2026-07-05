import { WORKOUTS } from '@/lib/data/workouts';
import { SILVERTHORNE_WORKOUTS } from '@/lib/data/program';
import ActiveWorkoutClient from './ActiveWorkoutClient';

// Generate static paths for all workouts at build time
export function generateStaticParams() {
  return [
    ...WORKOUTS.map((workout) => ({
    id: workout.id.toString(),
    })),
    ...SILVERTHORNE_WORKOUTS.map((workout) => ({
      id: workout.id,
    })),
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActiveWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  return <ActiveWorkoutClient workoutId={id} />;
}
