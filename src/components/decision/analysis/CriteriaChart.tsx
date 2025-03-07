
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Criterion } from '@/integrations/supabase/client';

interface CriteriaChartProps {
  criteria: Criterion[];
  criteriaChartData: {
    name: string;
    score: number;
  }[];
  selectedCriterion: string | null;
  setSelectedCriterion: (criterionId: string) => void;
}

export function CriteriaChart({ 
  criteria, 
  criteriaChartData, 
  selectedCriterion, 
  setSelectedCriterion 
}: CriteriaChartProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col mb-4">
        <h3 className="text-lg font-medium mb-2">Score par critère</h3>
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-2 min-w-min">
            {criteria.map((criterion) => (
              <Button
                key={criterion.id}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs whitespace-nowrap",
                  selectedCriterion === criterion.id && "bg-primary/10 border-primary"
                )}
                onClick={() => setSelectedCriterion(criterion.id)}
              >
                {criterion.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={criteriaChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
