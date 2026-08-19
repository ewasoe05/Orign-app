export const CHART_TOOLTIP_STYLE = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#fafafa",
} as const;

export const CHART_AXIS = {
  stroke: "#71717a",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const CHART_GRID = {
  stroke: "#27272a",
  strokeDasharray: "3 3",
} as const;

export const CHART_HEIGHT = {
  sm: "h-56 w-full lg:h-64",
  md: "h-64 w-full lg:h-72",
} as const;

export function chartTooltipProps(formatter?: (value: number) => string) {
  return {
    contentStyle: CHART_TOOLTIP_STYLE,
    ...(formatter
      ? {
          formatter: (value: unknown) => {
            const num = Number(value);
            return [formatter(Number.isFinite(num) ? num : 0), ""] as [string, string];
          },
        }
      : {}),
  };
}
