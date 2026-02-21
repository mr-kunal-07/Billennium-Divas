import { cn } from "@/lib/utils";

interface OverallScoreProps {
  score: number;
}

const getScoreGradient = (score: number): string => {
  if (score >= 8) return "from-score-excellent to-score-good";
  if (score >= 6) return "from-score-good to-primary";
  if (score >= 4) return "from-score-average to-score-good";
  return "from-score-poor to-score-average";
};

const getScoreLabel = (score: number): string => {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Average";
  return "Needs Work";
};

export const OverallScore = ({ score }: OverallScoreProps) => {
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 10) * circumference;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Overall Rating</h3>
      
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-4xl font-bold font-display bg-gradient-to-r bg-clip-text text-transparent",
            getScoreGradient(score)
          )}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
      </div>

      <p className={cn(
        "text-center mt-4 text-sm font-medium",
        score >= 6 ? "text-score-good" : score >= 4 ? "text-score-average" : "text-score-poor"
      )}>
        {getScoreLabel(score)}
      </p>
    </div>
  );
};
