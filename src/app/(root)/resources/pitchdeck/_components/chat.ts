export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  analysis: {
    overallScore: number;
    scores: {
      teamExperience: number;
      marketPotential: number;
      flowAndClarity: number;
      problemSolution: number;
      businessModel: number;
    };
    slides: Array<{
      slideNumber: number;
      slideTitle: string;
      feedback: string;
      suggestion: string;
      score: number;
    }>;
    promisingAspects: string;
    areasForImprovement: string[];
    stageSpecificAdvice: string;
    nextSteps: string[];
  };
  companyStage: string;
  industry: string;
  selectedSlide?: number;
}
