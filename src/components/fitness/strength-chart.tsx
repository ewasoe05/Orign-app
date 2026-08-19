"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { ChartContainer } from "@/components/ui/chart-container";
import { Button } from "@/components/ui/button";
import { CHART_AXIS, CHART_GRID, chartTooltipProps } from "@/lib/chart-theme";
import { STRENGTH_TARGETS } from "@/lib/seed";
import type { StrengthChartPoint } from "@/lib/fitness-metrics";
import { useState } from "react";

export function StrengthChart({
  strengthData,
  runData,
}: {
  strengthData: Record<string, StrengthChartPoint[]>;
  runData: { date: string; distance: number; duration: number | null }[];
}) {
  const [selectedExercise, setSelectedExercise] = useState<string>(STRENGTH_TARGETS[0].exercise);
  const [view, setView] = useState<"strength" | "run">("strength");

  const data = strengthData[selectedExercise] ?? [];
  const axisTick = { fill: CHART_AXIS.stroke, fontSize: CHART_AXIS.fontSize };

  return (
    <Card>
      <CardHeader>
        <CardHeaderRow
          action={
            <div className="flex gap-1 rounded-sm border border-border-subtle p-0.5">
              <Button
                variant={view === "strength" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("strength")}
              >
                Lifts
              </Button>
              <Button
                variant={view === "run" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("run")}
              >
                Runs
              </Button>
            </div>
          }
        >
          <CardTitle>{view === "strength" ? "Strength Progress" : "Run Progress"}</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        {view === "strength" && (
          <div className="mb-3 flex flex-wrap gap-1">
            {STRENGTH_TARGETS.map((target) => (
              <Button
                key={target.exercise}
                variant={selectedExercise === target.exercise ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedExercise(target.exercise)}
              >
                {target.exercise}
              </Button>
            ))}
          </div>
        )}

        <ChartContainer size="sm">
          {view === "strength" ? (
            data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray={CHART_GRID.strokeDasharray} stroke={CHART_GRID.stroke} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                  <Tooltip {...chartTooltipProps()} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="weight" stroke="#34d399" name="Top set (lbs)" dot={false} />
                  <Line
                    type="monotone"
                    dataKey="e1rm"
                    stroke="#60a5fa"
                    name="e1RM (Epley)"
                    dot={false}
                    strokeDasharray="4 4"
                  />
                  <Line type="monotone" dataKey="prWeight" stroke="#fbbf24" name="True PR" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-caption text-text-secondary">
                Log {selectedExercise} workouts or set a manual max to see progress
              </p>
            )
          ) : runData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runData}>
                <CartesianGrid strokeDasharray={CHART_GRID.strokeDasharray} stroke={CHART_GRID.stroke} />
                <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltipProps()} />
                <Line type="monotone" dataKey="distance" stroke="#60a5fa" name="Distance (mi)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-caption text-text-secondary">
              Log runs to see progress
            </p>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
