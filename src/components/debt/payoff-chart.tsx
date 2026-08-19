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
import { ChartContainer } from "@/components/ui/chart-container";
import { CHART_AXIS, CHART_GRID, chartTooltipProps } from "@/lib/chart-theme";

export function PayoffChart({
  data,
}: {
  data: { month: string; projected: number; actual: number | null }[];
}) {
  const axisTick = { fill: CHART_AXIS.stroke, fontSize: CHART_AXIS.fontSize };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payoff Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer size="md">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray={CHART_GRID.strokeDasharray} stroke={CHART_GRID.stroke} />
              <XAxis
                dataKey="month"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                {...chartTooltipProps((value) => `$${value.toLocaleString()}`)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#71717a"
                strokeDasharray="5 5"
                name="Plan"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#34d399"
                name="Actual"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
