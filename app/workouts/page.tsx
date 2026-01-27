'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WorkoutCard } from '@/components/library/WorkoutCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getWorkouts } from '@/lib/store';
import type { WorkoutWithBlocks } from '@/lib/types';
import { Search } from 'lucide-react';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutWithBlocks[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Load workouts from the store (static data)
    const allWorkouts = getWorkouts();
    setWorkouts(allWorkouts);
    setLoading(false);
  }, []);

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'preset') return matchesSearch && workout.isPreset;
    if (activeTab === 'custom') return matchesSearch && !workout.isPreset;
    return matchesSearch;
  });

  const presetCount = workouts.filter(w => w.isPreset).length;
  const customCount = workouts.filter(w => !w.isPreset).length;

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Workouts</h1>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All ({workouts.length})
              </TabsTrigger>
              <TabsTrigger value="preset" className="flex-1">
                Preset ({presetCount})
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex-1">
                Custom ({customCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No workouts found</p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
