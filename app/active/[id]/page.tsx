import { WORKOUTS } from '@/lib/data/workouts';
import ActiveWorkoutClient from './ActiveWorkoutClient';

// Generate static paths for all workouts at build time
export function generateStaticParams() {
  return WORKOUTS.map((workout) => ({
    id: workout.id.toString(),
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActiveWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  return <ActiveWorkoutClient workoutId={id} />;
}
