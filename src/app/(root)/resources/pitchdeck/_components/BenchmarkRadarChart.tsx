import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Scores } from "./analysis";
import { IndustryBenchmark, getDimensionLabel } from "./industryBenchmarks";

interface BenchmarkRadarChartProps {
  userScores: Scores;
  benchmark: IndustryBenchmark;
  industry: string;
}

export const BenchmarkRadarChart = ({
  userScores,
  benchmark,
  industry,
}: BenchmarkRadarChartProps) => {
  const data = [
    {
      dimension: "Team",
      fullName: getDimensionLabel("teamExperience"),
      user: userScores.teamExperience,
      benchmark: benchmark.teamExperience,
    },
    {
      dimension: "Market",
      fullName: getDimensionLabel("marketPotential"),
      user: userScores.marketPotential,
      benchmark: benchmark.marketPotential,
    },
    {
      dimension: "Flow",
      fullName: getDimensionLabel("flowAndClarity"),
      user: userScores.flowAndClarity,
      benchmark: benchmark.flowAndClarity,
    },
    {
      dimension: "Problem",
      fullName: getDimensionLabel("problemSolution"),
      user: userScores.problemSolution,
      benchmark: benchmark.problemSolution,
    },
    {
      dimension: "Business",
      fullName: getDimensionLabel("businessModel"),
      user: userScores.businessModel,
      benchmark: benchmark.businessModel,
    },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name={`${industry} Average`}
            dataKey="benchmark"
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted))"
            fillOpacity={0.3}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Your Deck"
            dataKey="user"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
            strokeWidth={2}
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
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
