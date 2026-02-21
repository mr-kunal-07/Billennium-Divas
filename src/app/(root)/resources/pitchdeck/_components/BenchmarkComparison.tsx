import { useState } from "react";
import { Scores } from "./analysis";
import { industryBenchmarks, getComparisonInsight } from "./industryBenchmarks";
import { BenchmarkRadarChart } from "./BenchmarkRadarChart";
import { BenchmarkBarChart } from "./BenchmarkBarChart";
import { INDUSTRIES } from "./analysis";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Target, Lightbulb } from "lucide-react";

interface BenchmarkComparisonProps {
  userScores: Scores & { overallScore: number };
  industry: string;
}

export const BenchmarkComparison = ({
  userScores,
  industry: initialIndustry,
}: BenchmarkComparisonProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry);
  const benchmark = industryBenchmarks[selectedIndustry] || industryBenchmarks["Other"];
  
  const insights = getComparisonInsight(
    { ...userScores, overallScore: userScores.overallScore },
    benchmark,
    selectedIndustry
  );

  const overallDelta = (userScores.overallScore - benchmark.overallScore).toFixed(1);
  const isAboveBenchmark = Number(overallDelta) >= 0;

  return (
    <div className="space-y-6">
      {/* Header with industry selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold font-display text-lg">Industry Benchmarks</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Compare to:</span>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall comparison card */}
      <div className={`p-4 rounded-xl border ${
        isAboveBenchmark 
          ? "bg-green-500/5 border-green-500/20" 
          : "bg-amber-500/5 border-amber-500/20"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Overall Score vs {selectedIndustry} Average</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground">{userScores.overallScore}</span>
              <span className="text-muted-foreground">/10</span>
              <span className={`text-sm font-medium flex items-center gap-1 ${
                isAboveBenchmark ? "text-green-600" : "text-amber-600"
              }`}>
                <TrendingUp className={`w-4 h-4 ${!isAboveBenchmark ? "rotate-180" : ""}`} />
                {Number(overallDelta) > 0 ? "+" : ""}{overallDelta} vs benchmark
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{selectedIndustry} Average</p>
            <p className="text-2xl font-semibold text-muted-foreground">{benchmark.overallScore}/10</p>
            <p className="text-xs text-muted-foreground">Based on {benchmark.sampleSize.toLocaleString()} decks</p>
          </div>
        </div>
      </div>

      {/* Chart tabs */}
      <Tabs defaultValue="radar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="radar" className="gap-2">
            <Target className="w-4 h-4" />
            Radar View
          </TabsTrigger>
          <TabsTrigger value="bar" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Bar View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="radar" className="mt-4">
          <BenchmarkRadarChart
            userScores={userScores}
            benchmark={benchmark}
            industry={selectedIndustry}
          />
        </TabsContent>
        <TabsContent value="bar" className="mt-4">
          <BenchmarkBarChart
            userScores={userScores}
            benchmark={benchmark}
            industry={selectedIndustry}
          />
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-4 h-4" />
          <h4 className="font-medium text-sm">Key Insights</h4>
        </div>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
