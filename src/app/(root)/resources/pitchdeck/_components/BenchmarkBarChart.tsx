import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Scores } from "./analysis";
import { IndustryBenchmark, getDimensionLabel, getScoreDelta } from "./industryBenchmarks";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BenchmarkBarChartProps {
  userScores: Scores;
  benchmark: IndustryBenchmark;
  industry: string;
}

export const BenchmarkBarChart = ({
  userScores,
  benchmark,
  industry,
}: BenchmarkBarChartProps) => {
  const dimensions = [
    { key: "teamExperience", label: "Team" },
    { key: "marketPotential", label: "Market" },
    { key: "flowAndClarity", label: "Flow" },
    { key: "problemSolution", label: "Problem" },
    { key: "businessModel", label: "Business" },
  ] as const;

  const data = dimensions.map((dim) => ({
    name: dim.label,
    fullName: getDimensionLabel(dim.key),
    user: userScores[dim.key],
    benchmark: benchmark[dim.key],
    delta: getScoreDelta(userScores[dim.key], benchmark[dim.key]),
  }));

  return (
    <div className="space-y-4">
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickCount={6}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-foreground mb-2">{data.fullName}</p>
                      <p className="text-sm text-primary">
                        Your Score: <span className="font-semibold">{data.user}/10</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {industry} Avg: <span className="font-semibold">{data.benchmark}/10</span>
                      </p>
                      <div className={`text-sm mt-1 flex items-center gap-1 ${
                        data.delta > 0 ? "text-green-500" : data.delta < 0 ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {data.delta > 0 ? <TrendingUp className="w-3 h-3" /> : data.delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        <span>{data.delta > 0 ? "+" : ""}{data.delta} vs benchmark</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
            <Bar dataKey="benchmark" name={`${industry} Average`} fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="user" name="Your Deck" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.delta >= 0.5
                      ? "hsl(142, 71%, 45%)"
                      : entry.delta <= -0.5
                      ? "hsl(0, 84%, 60%)"
                      : "hsl(var(--primary))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delta indicators */}
      <div className="grid grid-cols-5 gap-2">
        {data.map((item) => (
          <div
            key={item.name}
            className={`text-center p-2 rounded-lg ${
              item.delta >= 0.5
                ? "bg-green-500/10 text-green-600"
                : item.delta <= -0.5
                ? "bg-red-500/10 text-red-600"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <div className="text-xs font-medium">{item.name}</div>
            <div className="text-sm font-bold flex items-center justify-center gap-0.5">
              {item.delta > 0 ? <TrendingUp className="w-3 h-3" /> : item.delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
              {item.delta > 0 ? "+" : ""}{item.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
