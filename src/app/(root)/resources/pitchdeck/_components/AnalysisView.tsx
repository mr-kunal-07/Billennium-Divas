"use client";

import { useState } from "react";
import { PitchDeckAnalysis } from "./analysis";
import { ChatContext } from "./chat";
import { SlideList } from "./SlideList";
import { SlideDetail } from "./SlideDetail";
import { AnalysisSummary } from "./AnalysisSummary";
import { BenchmarkComparison } from "./BenchmarkComparison";
import { ChatPanel } from "./ChatPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Share2, MessageSquare, X } from "lucide-react";

interface AnalysisViewProps {
  analysis: PitchDeckAnalysis;
  fileName: string;
  pdfFile?: File | null;
  companyStage?: string;
  industry?: string;
  onBack: () => void;
}

export const AnalysisView = ({
  analysis,
  fileName,
  pdfFile,
  companyStage = "seed",
  industry = "Technology",
  onBack,
}: AnalysisViewProps) => {
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Safe guards
  const slides = Array.isArray(analysis?.slides) ? analysis.slides : [];
  const overallScore =
    typeof analysis?.overallScore === "number"
      ? analysis.overallScore
      : 0;

  const chatContext: ChatContext = {
    analysis: {
      overallScore,
      scores: analysis?.scores ?? {},
      slides,
      promisingAspects: analysis?.promisingAspects ?? [],
      areasForImprovement: analysis?.areasForImprovement ?? [],
      stageSpecificAdvice: analysis?.stageSpecificAdvice ?? "",
      nextSteps: analysis?.nextSteps ?? [],
    },
    companyStage,
    industry,
    selectedSlide,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Start New Review
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={isChatOpen ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                {isChatOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                {isChatOpen ? "Close Chat" : "Ask AI"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <main
          className={`flex-1 container mx-auto px-4 py-6 transition-all ${
            isChatOpen ? "mr-96" : ""
          }`}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-display">{fileName}</h1>
            <p className="text-muted-foreground">
              {slides.length} slides analyzed • {industry} • {companyStage}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Slides sidebar */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <SlideList
                slides={slides}
                pdfFile={pdfFile}
                selectedSlide={selectedSlide}
                onSelectSlide={setSelectedSlide}
              />
            </div>

            {/* Main content */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              {slides[selectedSlide] && (
                <SlideDetail
                  slide={slides[selectedSlide]}
                  pdfFile={pdfFile}
                />
              )}

              {analysis?.stageSpecificAdvice && (
                <div className="bg-linear-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6">
                  <h3 className="font-semibold font-display mb-3">
                    Stage-Specific Advice
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.stageSpecificAdvice}
                  </p>
                </div>
              )}
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-3 order-3 space-y-6">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-4">
                  <AnalysisSummary analysis={{ ...analysis, slides }} />
                </TabsContent>
                <TabsContent value="benchmarks" className="mt-4">
                  <BenchmarkComparison
                    userScores={{
                      ...(analysis?.scores ?? {}),
                      overallScore,
                    }}
                    industry={industry}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* Chat panel */}
        {isChatOpen && (
          <div className="fixed right-0 top-0 h-screen w-96 z-20">
            <ChatPanel
              context={chatContext}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};