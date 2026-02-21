import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { cn } from "@/lib/utils";
import { SlideAnalysis } from "./analysis";
import { Loader2 } from "lucide-react";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SlideListProps {
  slides: SlideAnalysis[];
  pdfFile?: File | null;
  selectedSlide: number;
  onSelectSlide: (index: number) => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 8) return "ring-score-excellent";
  if (score >= 6) return "ring-score-good";
  if (score >= 4) return "ring-score-average";
  return "ring-score-poor";
};

const getScoreTextColor = (score: number): string => {
  if (score >= 8) return "text-score-excellent bg-score-excellent/10";
  if (score >= 6) return "text-score-good bg-score-good/10";
  if (score >= 4) return "text-score-average bg-score-average/10";
  return "text-score-poor bg-score-poor/10";
};

export const SlideList = ({ slides, pdfFile, selectedSlide, onSelectSlide }: SlideListProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfFile]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold font-display">Slides</h3>
        <p className="text-xs text-muted-foreground mt-1">{slides.length} slides analyzed</p>
      </div>
      <div className="max-h-[600px] overflow-y-auto p-3 space-y-3">
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={null}
            className="hidden"
          >
            {/* Hidden document for loading */}
          </Document>
        )}
        
        {slides.map((slide, index) => (
          <button
            key={slide.slideNumber}
            onClick={() => onSelectSlide(index)}
            className={cn(
              "w-full text-left rounded-xl transition-all overflow-hidden",
              "hover:ring-2 hover:ring-primary/50",
              selectedSlide === index 
                ? "ring-2 ring-primary bg-primary/5" 
                : "bg-muted/30"
            )}
          >
            <div className="p-2">
              {/* PDF Thumbnail */}
              <div className={cn(
                "relative aspect-[16/9] rounded-lg overflow-hidden mb-2 ring-2 bg-white",
                getScoreColor(slide.score)
              )}>
                {pdfUrl ? (
                  <Document
                    file={pdfUrl}
                    loading={
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    }
                  >
                    <Page
                      pageNumber={slide.slideNumber}
                      width={160}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      }
                    />
                  </Document>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-2xl font-bold text-muted-foreground/50">
                      {slide.slideNumber}
                    </span>
                  </div>
                )}

                {/* Score badge */}
                <div className={cn(
                  "absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full backdrop-blur-sm border border-border",
                  getScoreTextColor(slide.score)
                )}>
                  <span className="text-xs font-bold">{slide.score}</span>
                </div>
              </div>
              
              {/* Title */}
              <p className="text-xs font-medium truncate px-1 text-foreground">
                {slide.slideNumber}. {slide.slideTitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
