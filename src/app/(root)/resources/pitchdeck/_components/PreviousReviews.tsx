import { ReviewRecord } from "./analysis";
import { Clock, FileText, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface PreviousReviewsProps {
  reviews: ReviewRecord[];
  onSelect: (review: ReviewRecord) => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return "text-score-excellent";
  if (score >= 6) return "text-score-good";
  if (score >= 4) return "text-score-average";
  return "text-score-poor";
};

export const PreviousReviews = ({ reviews, onSelect }: PreviousReviewsProps) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center">
        <Clock className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">No previous reviews yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Your analyzed pitch decks will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold font-display flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Previous Reviews
        </h3>
      </div>
      <div className="divide-y divide-border">
        {reviews.slice(0, 5).map((review) => (
          <button
            key={review.id}
            onClick={() => onSelect(review)}
            className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{review.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.analyzedAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* <span className={cn("text-lg font-bold font-display", getScoreColor(review.overallScore))}>
                {review.overallScore.toFixed(1)}
              </span> */}
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
