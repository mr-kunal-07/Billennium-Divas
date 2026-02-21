export interface SlideAnalysis {
  slideNumber: number;
  slideTitle: string;
  feedback: string;
  suggestion: string;
  score: number;
}

export interface Scores {
  teamExperience: number;
  marketPotential: number;
  flowAndClarity: number;
  problemSolution: number;
  businessModel: number;
}

export interface PitchDeckAnalysis {
  overallScore: number;
  scores: Scores;
  slides: SlideAnalysis[];
  promisingAspects: string;
  areasForImprovement: string[];
  stageSpecificAdvice: string;
  nextSteps: string[];
}

export interface ReviewRecord {
  id: string;
  fileName: string;
  companyStage: string;
  industry: string;
  overallScore: number;
  analyzedAt: string;
  analysis: PitchDeckAnalysis;
}

export type CompanyStage = 
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c"
  | "growth";

export const COMPANY_STAGES: { value: CompanyStage; label: string }[] = [
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "series-c", label: "Series C+" },
  { value: "growth", label: "Growth Stage" },
];

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Fintech",
  "E-commerce",
  "SaaS",
  "AI/ML",
  "Consumer",
  "Enterprise",
  "Education",
  "Real Estate",
  "Gaming",
  "Sustainability",
  "Other",
];
