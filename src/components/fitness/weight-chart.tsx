"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { ChartContainer } from "@/components/ui/chart-container";
import { Badge } from "@/components/ui/badge";
import { Metric } from "@/components/ui/metric";
import { Panel } from "@/components/ui/panel";
import { CHART_AXIS, CHART_GRID, chartTooltipProps } from "@/lib/chart-theme";
import { STARTING_WEIGHT_LBS, TARGET_WEIGHT_LBS } from "@/lib/seed";
import type { BodyLog } from "@/lib/types";

interface WeightChartProps {
  logs: BodyLog[];
}

export function WeightChart({ logs }: WeightChartProps) {
  const weightLogs = logs
    .filter((l) => l.weight_lbs != null)
    .map((l) => ({
      date: l.log_date,
      weight: l.weight_lbs!,
    }))
    .reverse();

  const latest = weightLogs.at(-1);
  const previous = weightLogs.at(-2);
  const delta = latest && previous ? latest.weight - previous.weight : null;
  const totalChange = latest ? latest.weight - STARTING_WEIGHT_LBS : null;
  const toTarget = latest ? latest.weight - TARGET_WEIGHT_LBS : null;

  const axisTick = { fill: CHART_AXIS.stroke, fontSize: CHART_AXIS.fontSize };

  if (weightLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body text-text-secondary">
            Log your weight to see trends. Target: {TARGET_WEIGHT_LBS} lbs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardHeaderRow
          action={
            toTarget != null ? (
              <Badge variant={toTarget <= 0 ? "success" : "default"}>
                {toTarget <= 0 ? "At target" : `${toTarget.toFixed(1)} lbs to go`}
              </Badge>
            ) : undefined
          }
        >
          <CardTitle>Weight</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-baseline gap-4">
          <Metric variant="display">{latest!.weight}</Metric>
          <span className="text-body text-text-secondary">lbs</span>
          {delta != null && delta !== 0 && (
            <span
              className={`text-caption font-medium ${
                delta < 0 ? "text-accent-muted" : "text-warning"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} since last
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Panel>
            <p className="text-caption text-text-secondary">Start</p>
            <p className="text-body font-medium">{STARTING_WEIGHT_LBS} lbs</p>
          </Panel>
          <Panel>
            <p className="text-caption text-text-secondary">Target</p>
            <p className="text-body font-medium">{TARGET_WEIGHT_LBS} lbs</p>
          </Panel>
          <Panel>
            <p className="text-caption text-text-secondary">Change</p>
            <p className="text-body font-medium">
              {totalChange != null
                ? `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)} lbs`
                : "—"}
            </p>
          </Panel>
        </div>

        {weightLogs.length >= 2 && (
          <ChartContainer size="sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightLogs}>
                <CartesianGrid
                  strokeDasharray={CHART_GRID.strokeDasharray}
                  stroke={CHART_GRID.stroke}
                />
                <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <Tooltip {...chartTooltipProps((v) => `${v.toFixed(1)} lbs`)} />
                <ReferenceLine
                  y={TARGET_WEIGHT_LBS}
                  stroke="#34d399"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target ${TARGET_WEIGHT_LBS}`,
                    fill: "#34d399",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#fafafa"
                  strokeWidth={2}
                  name="Weight (lbs)"
                  dot={{ fill: "#fafafa", r: 3 }}
                  activeDot={{ fill: "#34d399", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
