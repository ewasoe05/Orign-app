"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { STRENGTH_TARGETS } from "@/lib/seed";
import type { StrengthChartPoint } from "@/lib/fitness-metrics";

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{view === "strength" ? "Strength Progress" : "Run Progress"}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={view === "strength" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("strength")}
            >
              Lifts
            </Button>
            <Button
              variant={view === "run" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("run")}
            >
              Runs
            </Button>
          </div>
        </div>
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

        <div className="h-56 w-full lg:h-72">
          {view === "strength" ? (
            data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#34d399"
                    name="Top set (lbs)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="e1rm"
                    stroke="#60a5fa"
                    name="e1RM (Epley)"
                    dot={false}
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="prWeight"
                    stroke="#fbbf24"
                    name="True PR"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-zinc-500">
                Log {selectedExercise} workouts or set a manual max to see progress
              </p>
            )
          ) : runData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
                <Line type="monotone" dataKey="distance" stroke="#60a5fa" name="Distance (mi)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-zinc-500">
              Log runs to see progress
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
