'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStats, getSessionsWithWorkout } from '@/lib/store';
import type { WorkoutStats, SessionWithWorkout } from '@/lib/types';
import { 
  Clock, Calendar, Trophy, Flame, TrendingUp, 
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [sessions, setSessions] = useState<SessionWithWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    // Load from localStorage store
    setStats(getStats());
    setSessions(getSessionsWithWorkout());
    setLoading(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return diffMins;
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'In progress';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = formatDate(session.startedAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, SessionWithWorkout[]>);

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">History</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="history" className="flex-1">Activity</TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">Statistics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {activeTab === 'history' && (
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No workout history yet</p>
                <Button asChild>
                  <Link href="/workouts">Start Your First Workout</Link>
                </Button>
              </div>
            ) : (
              Object.entries(groupedSessions).map(([date, daySessions]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {daySessions.map((session) => {
                      const duration = calculateDuration(session.startedAt, session.completedAt);
                      return (
                        <Card key={session.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{session.workout.name}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span>{formatTime(session.startedAt)}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(duration)}
                                  </span>
                                  {session.totalRounds && (
                                    <Badge variant="secondary" className="text-xs">
                                      {session.totalRounds} rounds
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {session.completedAt ? (
                                <Badge variant="default" className="bg-green-500/20 text-green-500">
                                  Complete
                                </Badge>
                              ) : (
                                <Badge variant="outline">In Progress</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{stats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Flame className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{stats.totalWorkoutsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Total Workouts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold">
                    {stats.totalMinutes >= 60 
                      ? `${Math.floor(stats.totalMinutes / 60)}h` 
                      : `${stats.totalMinutes}m`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{stats.workoutsThisWeek}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Exercises */}
            {stats.topExercises.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Most Performed Exercises
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.topExercises.map((exercise, index) => (
                    <div key={exercise.exerciseId} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="flex-1 font-medium">{exercise.name}</span>
                      <Badge variant="secondary">{exercise.count}x</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Library Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Exercises</span>
                  <span className="font-semibold">{stats.totalExercises}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
