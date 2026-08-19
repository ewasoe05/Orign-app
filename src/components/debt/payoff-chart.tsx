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

export function PayoffChart({
  data,
}: {
  data: { month: string; projected: number; actual: number | null }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payoff Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" tick={{ fill: "#a1a1aa", fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
              />
              <Legend />
              <Line type="monotone" dataKey="projected" stroke="#71717a" strokeDasharray="5 5" name="Plan" dot={false} />
              <Line type="monotone" dataKey="actual" stroke="#34d399" name="Actual" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
