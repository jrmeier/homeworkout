'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, Calendar, Clock, Dumbbell, HeartPulse, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDashboardStats, getProgramSessions } from '@/lib/store';
import type { DashboardStats, ProgramSession } from '@/lib/types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function durationMinutes(session: ProgramSession) {
  if (!session.completedAt) return null;
  return Math.max(1, Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000));
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tab, setTab] = useState('activity');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessions(getProgramSessions());
      setStats(getDashboardStats());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    return sessions.reduce(
      (acc, session) => {
        if (session.completedAt) acc.completed += 1;
        acc.sets += session.strengthSets.length;
        acc.cardio += session.cardioLogs.reduce((sum, log) => sum + log.minutes, 0);
        acc.posture += session.postureLogs.reduce((sum, log) => sum + log.minutes, 0);
        return acc;
      },
      { completed: 0, sets: 0, cardio: 0, posture: 0 }
    );
  }, [sessions]);

  const topStrength = useMemo(() => {
    const map = new Map<string, { name: string; count: number; bestWeight: number }>();
    sessions.forEach((session) => {
      session.strengthSets.forEach((set) => {
        const existing = map.get(set.exerciseId) || { name: set.exerciseName, count: 0, bestWeight: 0 };
        existing.count += 1;
        existing.bestWeight = Math.max(existing.bestWeight, set.weight || 0);
        map.set(set.exerciseId, existing);
      });
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [sessions]);

  return (
    <main className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="mb-4 text-2xl font-bold">Progress</h1>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {tab === 'activity' && (
          <>
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="space-y-4 p-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">No Silverthorne sessions yet</p>
                    <p className="text-sm text-muted-foreground">Start today’s workout to build your history.</p>
                  </div>
                  <Button asChild><Link href="/">Go to Today</Link></Button>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => {
                const minutes = durationMinutes(session);
                return (
                  <Card key={session.id}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{session.workoutName}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(session.startedAt)}</p>
                        </div>
                        <Badge variant={session.completedAt ? 'default' : 'outline'}>
                          {session.completedAt ? 'Complete' : 'Open'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div className="rounded-md border border-border p-2">
                          <p className="font-semibold">{minutes ? `${minutes}` : '-'}</p>
                          <p className="text-xs text-muted-foreground">min</p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <p className="font-semibold">{session.strengthSets.length}</p>
                          <p className="text-xs text-muted-foreground">sets</p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <p className="font-semibold">{session.cardioLogs.reduce((sum, log) => sum + log.minutes, 0)}</p>
                          <p className="text-xs text-muted-foreground">cardio</p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <p className="font-semibold">{session.postureLogs.length}</p>
                          <p className="text-xs text-muted-foreground">posture</p>
                        </div>
                      </div>
                      {session.notes && <p className="text-sm text-muted-foreground">{session.notes}</p>}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}

        {tab === 'stats' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Dumbbell className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-3xl font-bold">{totals.sets}</p>
                  <p className="text-sm text-muted-foreground">Strength Sets</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-3xl font-bold">{totals.cardio}</p>
                  <p className="text-sm text-muted-foreground">Cardio Minutes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <HeartPulse className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-3xl font-bold">{stats?.postureStreak || 0}</p>
                  <p className="text-sm text-muted-foreground">Posture Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-3xl font-bold">{totals.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Strength Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topStrength.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Log strength sets to see your top movements.</p>
                ) : topStrength.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.count} logged sets</p>
                    </div>
                    <Badge variant="secondary">{item.bestWeight ? `${item.bestWeight} lb best` : 'bodyweight'}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
