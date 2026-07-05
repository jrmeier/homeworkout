'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, CalendarDays, ChevronRight, Clock, Dumbbell, HeartPulse, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDashboardStats, getNextScheduledWorkout, getProgram, getWorkoutDate } from '@/lib/store';
import type { DashboardStats, ScheduledWorkout } from '@/lib/types';

export default function HomePage() {
  const [nextWorkout, setNextWorkout] = useState<ScheduledWorkout | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = getNextScheduledWorkout();
      setNextWorkout(next);
      setStats(getDashboardStats());
      setScheduledDate(getWorkoutDate(next).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const program = getProgram();
  const weeklyPercent = stats
    ? Math.round((stats.requiredCompletedThisWeek / stats.requiredTotalThisWeek) * 100)
    : 0;

  return (
    <main className="min-h-screen pb-24">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-lg px-4 pb-5 pt-7">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {program.facility}
              </p>
              <h1 className="text-3xl font-bold tracking-normal">Today</h1>
              <p className="mt-1 text-sm text-muted-foreground">Strength, cardio, and posture work for muscle tone and consistency.</p>
            </div>
            <Badge variant="secondary" className="shrink-0">Starts Jul 6</Badge>
          </div>

          {nextWorkout && (
            <Card className="border-primary/30 bg-background">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{nextWorkout.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{scheduledDate}</p>
                  </div>
                  <Badge variant={nextWorkout.required ? 'default' : 'outline'}>
                    {nextWorkout.required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{nextWorkout.summary}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-border p-2">
                    <Clock className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{nextWorkout.estimatedMinutes}m</p>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <Dumbbell className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{nextWorkout.blocks.length} blocks</p>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Safety</p>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link href={`/active/${nextWorkout.id}`}>
                    Start Session
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {stats && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Weekly Required Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stats.requiredCompletedThisWeek} of {stats.requiredTotalThisWeek}</span>
                  <span className="font-medium">{weeklyPercent}%</span>
                </div>
                <Progress value={weeklyPercent} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <HeartPulse className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
                  <p className="text-2xl font-bold">{stats.postureStreak}</p>
                  <p className="text-xs text-muted-foreground">Posture streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Activity className="mx-auto mb-1 h-5 w-5 text-sky-400" />
                  <p className="text-2xl font-bold">{stats.cardioMinutesThisWeek}</p>
                  <p className="text-xs text-muted-foreground">Cardio min</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CalendarDays className="mx-auto mb-1 h-5 w-5 text-amber-400" />
                  <p className="text-2xl font-bold">{stats.optionalCompletedThisWeek}</p>
                  <p className="text-xs text-muted-foreground">Optional</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Last Performance</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{stats.lastPerformance?.workoutName || 'No completed sessions yet'}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.lastPerformance
                      ? `${stats.lastPerformance.strengthSets.length} sets, ${stats.lastPerformance.cardioLogs.reduce((sum, log) => sum + log.minutes, 0)} cardio minutes`
                      : 'Start the next workout to begin tracking.'}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/history">History</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Button variant="outline" className="w-full" asChild>
          <Link href="/program">
            View Full Program
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
