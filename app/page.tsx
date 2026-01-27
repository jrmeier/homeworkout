'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getWorkouts, getStats } from '@/lib/store';
import type { WorkoutStats, WorkoutWithBlocks } from '@/lib/types';
import { 
  Flame, Trophy, Clock, Calendar, TrendingUp, 
  Play, ChevronRight, Dumbbell, Target
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutWithBlocks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage store
    const allWorkouts = getWorkouts();
    setWorkouts(allWorkouts.slice(0, 3));
    setStats(getStats());
    setLoading(false);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background px-4 pt-8 pb-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/20">
              <Flame className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Iron Flow</h1>
              <p className="text-sm text-muted-foreground">Ready to crush it?</p>
            </div>
          </div>

          {/* Quick Stats */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="p-3 text-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="p-3 text-center">
                  <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{stats.workoutsThisWeek}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{formatTime(stats.totalMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Weekly Progress */}
        {stats && stats.totalWorkoutsCompleted > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {stats.workoutsThisWeek} of 5 workouts
                </span>
                <span className="text-sm font-medium">
                  {Math.min(100, Math.round((stats.workoutsThisWeek / 5) * 100))}%
                </span>
              </div>
              <Progress value={Math.min(100, (stats.workoutsThisWeek / 5) * 100)} />
            </CardContent>
          </Card>
        )}

        {/* Quick Start */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Quick Start</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workouts">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : workouts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-3">No workouts available</p>
                <Button asChild>
                  <Link href="/workouts">View Workouts</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <Card key={workout.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{workout.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {workout.estimatedMinutes && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {workout.estimatedMinutes} min
                            </Badge>
                          )}
                          {workout.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {workout.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button size="icon" className="h-12 w-12 rounded-full" asChild>
                        <Link href={`/active/${workout.id}`}>
                          <Play className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {stats && stats.totalWorkoutsCompleted > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Workouts</span>
                <span className="font-semibold">{stats.totalWorkoutsCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Exercises in Library</span>
                <span className="font-semibold">{stats.totalExercises}</span>
              </div>
              {stats.topExercises.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Top Exercise</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-medium">{stats.topExercises[0].name}</span>
                    <Badge variant="secondary">{stats.topExercises[0].count}x</Badge>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/history">
                  View Full History
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state for new users */}
        {stats && stats.totalWorkoutsCompleted === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Flame className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Welcome to Iron Flow!</h3>
              <p className="text-muted-foreground mb-4">
                Get started by exploring our preset workouts or create your own.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" asChild>
                  <Link href="/workouts">Browse Workouts</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/exercises">View Exercises</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
