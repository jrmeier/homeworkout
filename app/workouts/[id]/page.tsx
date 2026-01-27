import { WORKOUTS } from '@/lib/data/workouts';
import WorkoutDetailClient from './WorkoutDetailClient';

// Generate static paths for all workouts at build time
export function generateStaticParams() {
  return WORKOUTS.map((workout) => ({
    id: workout.id.toString(),
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <WorkoutDetailClient workoutId={id} />;
}
