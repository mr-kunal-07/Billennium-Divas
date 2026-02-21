"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import { FileUpload } from "./_components/FileUpload";
import { CompanyDetails } from "./_components/CompanyDetails";
import { PreviousReviews } from "./_components/PreviousReviews";
import { LoadingState } from "./_components/LoadingState";
import { useReviews } from "@/hooks/useReviews";
import { extractPdfContent } from "@/lib/pdfParser";
import { PitchDeckAnalysis, CompanyStage, ReviewRecord } from "./_components/analysis";

// ─────────────────────────────────────────────────────────────
// AnalysisView — SSR disabled (pdf.js needs browser DOMMatrix)
// ─────────────────────────────────────────────────────────────

const AnalysisView = dynamic(
  () => import("./_components/AnalysisView").then((m) => m.AnalysisView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Sparkles className="w-6 h-6 animate-pulse text-black" />
      </div>
    ),
  }
);

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzedFile, setAnalyzedFile] = useState<File | null>(null);
  const [companyStage, setCompanyStage] = useState<CompanyStage | "">("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis] = useState<PitchDeckAnalysis | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");

  const { reviews, saveReview } = useReviews();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Please upload a pitch deck first");
      return;
    }
    if (isAnalyzing) return; // guard against double-submit

    setIsAnalyzing(true);
    setLoadingStep(0);

    try {
      const { text: deckContent, slideCount } = await extractPdfContent(selectedFile);

      if (!deckContent.trim()) {
        throw new Error(
          "Could not extract text from this PDF. Make sure it's not image-only or scanned."
        );
      }

      // Call our secure server-side API route — key never reaches the browser.
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckContent,
          companyStage: companyStage || "not specified",
          industry: industry || "not specified",
          slideCount,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(error ?? `Server error ${res.status}`);
      }

      const analysisResult: PitchDeckAnalysis = await res.json();

      setAnalysis(analysisResult);
      setAnalyzedFile(selectedFile);
      setCurrentFileName(selectedFile.name);

      const review: ReviewRecord = {
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        companyStage: companyStage || "not specified",
        industry: industry || "not specified",
        overallScore: analysisResult.overallScore,
        analyzedAt: new Date().toISOString(),
        analysis: analysisResult,
      };
      saveReview(review);

      toast.success(
        `Done! ${analysisResult?.slides?.length ?? 0} slides reviewed.`
      );
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep(0);
    }
  }, [selectedFile, companyStage, industry, isAnalyzing, saveReview]);

  const handleSelectPreviousReview = useCallback((review: ReviewRecord) => {
    setAnalysis(review.analysis);
    setCurrentFileName(review.fileName);
    setAnalyzedFile(null);
    setCompanyStage((review.companyStage as CompanyStage) || "");
    setIndustry(review.industry || "");
  }, []);

  const handleReset = useCallback(() => {
    setAnalysis(null);
    setSelectedFile(null);
    setAnalyzedFile(null);
    setCompanyStage("");
    setIndustry("");
    setCurrentFileName("");
  }, []);

  if (analysis) {
    return (
      <AnalysisView
        analysis={analysis}
        fileName={currentFileName}
        pdfFile={analyzedFile}
        companyStage={companyStage || "seed"}
        industry={industry || "Technology"}
        onBack={handleReset}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 bg-white min-h-screen w-full">
      <div className="text-start mb-8">
        <div className="flex items-center justify-between gap-3 ">
          <div>
            <h1 className="text-5xl font-semibold mb-2">Get Your Pitch Deck  <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-pink-900">Scored &amp; Improved</span></h1>
            <p className="text-muted-foreground">
              Upload your pitch deck and get instant AI-powered feedback
              tailored to your funding stage.
            </p>
          </div>
          <div className="flex items-center gap-3">

          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-10">
        {isAnalyzing ? (
          <div className="max-w-xl mx-auto">
            <LoadingState step={loadingStep} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Feature pills */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Zap className="w-4 h-4" />, label: "Instant Analysis" },
                  { icon: <Shield className="w-4 h-4" />, label: "Secure & Private" },
                  { icon: <TrendingUp className="w-4 h-4" />, label: "Stage Specific" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl gap-2"
                  >
                    <div className="text-black">{icon}</div>
                    <span className="text-xs font-medium text-gray-700">{label}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <FileUpload
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  onClear={() => setSelectedFile(null)}
                  isLoading={isAnalyzing}
                />

                <CompanyDetails
                  stage={companyStage}
                  industry={industry}
                  onStageChange={setCompanyStage}
                  onIndustryChange={setIndustry}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full h-12 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Pitch Deck
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-black mb-3">Previous Reviews</h3>
                <PreviousReviews reviews={reviews} onSelect={handleSelectPreviousReview} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;