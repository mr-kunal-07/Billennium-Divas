import { PitchDeckAnalysis } from "./analysis";
import { ScoreCard } from "./ScoreCard";
import { OverallScore } from "./OverallScore";
import { 
  Users, 
  TrendingUp, 
  Sparkles, 
  Lightbulb, 
  Target,
  Heart,
  AlertCircle,
  Rocket
} from "lucide-react";

interface AnalysisSummaryProps {
  analysis: PitchDeckAnalysis;
}

export const AnalysisSummary = ({ analysis }: AnalysisSummaryProps) => {
  const scores = analysis?.scores ?? {};

  return (
    <div className="space-y-6">
      <OverallScore score={analysis?.overallScore ?? 0} />

      <div className="bg-card rounded-2xl border border-border shadow-card p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 px-2">
          Score Breakdown
        </h4>

        <div className="space-y-1">
          <ScoreCard
            label="Team Experience"
            score={scores?.teamExperience ?? 0}
            icon={<Users className="w-4 h-4" />}
          />

          <ScoreCard
            label="Market Potential"
            score={scores?.marketPotential ?? 0}
            icon={<TrendingUp className="w-4 h-4" />}
          />

          <ScoreCard
            label="Flow & Clarity"
            score={scores?.flowAndClarity ?? 0}
            icon={<Sparkles className="w-4 h-4" />}
          />

          <ScoreCard
            label="Problem/Solution"
            score={scores?.problemSolution ?? 0}
            icon={<Lightbulb className="w-4 h-4" />}
          />

          <ScoreCard
            label="Business Model"
            score={scores?.businessModel ?? 0}
            icon={<Target className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Promising Aspects */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-score-excellent" />
          <h4 className="text-sm font-medium">Most Promising Aspects</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analysis?.promisingAspects ?? "No data available."}
        </p>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-score-average" />
          <h4 className="text-sm font-medium">Areas for Improvement</h4>
        </div>

        <ul className="space-y-2">
          {(analysis?.areasForImprovement ?? []).map((area, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-score-average mt-2 shrink-0" />
              {area}
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium">Recommended Next Steps</h4>
        </div>

        <ul className="space-y-2">
          {(analysis?.nextSteps ?? []).map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
