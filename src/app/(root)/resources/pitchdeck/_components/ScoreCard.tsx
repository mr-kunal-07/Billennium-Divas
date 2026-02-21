import { cn } from "@/lib/utils";

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
  icon?: React.ReactNode;
  size?: "sm" | "lg";
}

const getScoreColor = (score: number, maxScore: number = 10): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "text-score-excellent";
  if (percentage >= 60) return "text-score-good";
  if (percentage >= 40) return "text-score-average";
  return "text-score-poor";
};

const getScoreBg = (score: number, maxScore: number = 10): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "bg-score-excellent/10";
  if (percentage >= 60) return "bg-score-good/10";
  if (percentage >= 40) return "bg-score-average/10";
  return "bg-score-poor/10";
};

export const ScoreCard = ({ label, score, maxScore = 10, icon, size = "sm" }: ScoreCardProps) => {
  const isLarge = size === "lg";

  return (
    <div className={cn(
      "flex items-center justify-between rounded-xl transition-all",
      isLarge 
        ? "bg-card p-6 shadow-card border border-border" 
        : "p-3 hover:bg-muted/50"
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "rounded-lg flex items-center justify-center",
            getScoreBg(score, maxScore),
            isLarge ? "w-10 h-10" : "w-8 h-8"
          )}>
            <span className={getScoreColor(score, maxScore)}>{icon}</span>
          </div>
        )}
        <span className={cn(
          "font-medium",
          isLarge ? "text-base" : "text-sm"
        )}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "font-bold font-display",
          getScoreColor(score, maxScore),
          isLarge ? "text-2xl" : "text-lg"
        )}>
          {score}
        </span>
        <span className="text-muted-foreground text-sm">/{maxScore}</span>
      </div>
    </div>
  );
};
