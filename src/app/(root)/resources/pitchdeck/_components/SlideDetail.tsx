import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { SlideAnalysis } from "./analysis";
import { MessageSquare, Lightbulb, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SlideDetailProps {
  slide: SlideAnalysis;
  pdfFile?: File | null;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return "text-score-excellent";
  if (score >= 6) return "text-score-good";
  if (score >= 4) return "text-score-average";
  return "text-score-poor";
};

const getScoreBg = (score: number): string => {
  if (score >= 8) return "bg-score-excellent/10 border-score-excellent/30";
  if (score >= 6) return "bg-score-good/10 border-score-good/30";
  if (score >= 4) return "bg-score-average/10 border-score-average/30";
  return "bg-score-poor/10 border-score-poor/30";
};

export const SlideDetail = ({ slide, pdfFile }: SlideDetailProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfFile]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Slide Preview */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="aspect-[16/9] bg-white flex items-center justify-center">
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <Page
                pageNumber={slide.slideNumber}
                width={600}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                }
              />
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <span className="text-6xl font-bold mb-2">{slide.slideNumber}</span>
              <span className="text-lg">{slide.slideTitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm text-muted-foreground">Slide {slide.slideNumber}</span>
            <h3 className="text-lg font-semibold font-display mt-1">{slide.slideTitle}</h3>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border",
            getScoreBg(slide.score)
          )}>
            <span className="text-sm text-muted-foreground">Score</span>
            <span className={cn("text-xl font-bold font-display", getScoreColor(slide.score))}>
              {slide.score}/10
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="w-4 h-4 text-primary" />
              Feedback
            </div>
            <p className="text-muted-foreground leading-relaxed pl-6">
              {slide.feedback}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="w-4 h-4 text-accent" />
              Suggestion
            </div>
            <div className="pl-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-foreground leading-relaxed">
                {slide.suggestion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Was this helpful?</span>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ThumbsUp className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ThumbsDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
