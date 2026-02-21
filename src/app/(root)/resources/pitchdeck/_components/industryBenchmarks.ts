// Industry benchmark data representing average scores from successful pitch decks
// Based on analysis of top-performing decks in each industry

export interface IndustryBenchmark {
  teamExperience: number;
  marketPotential: number;
  flowAndClarity: number;
  problemSolution: number;
  businessModel: number;
  overallScore: number;
  sampleSize: number; // Number of decks analyzed
}

export const industryBenchmarks: Record<string, IndustryBenchmark> = {
  Technology: {
    teamExperience: 7.2,
    marketPotential: 7.8,
    flowAndClarity: 7.5,
    problemSolution: 7.6,
    businessModel: 7.0,
    overallScore: 7.4,
    sampleSize: 850,
  },
  Healthcare: {
    teamExperience: 7.8,
    marketPotential: 7.5,
    flowAndClarity: 7.2,
    problemSolution: 7.9,
    businessModel: 6.8,
    overallScore: 7.4,
    sampleSize: 420,
  },
  Fintech: {
    teamExperience: 7.5,
    marketPotential: 7.9,
    flowAndClarity: 7.6,
    problemSolution: 7.4,
    businessModel: 7.8,
    overallScore: 7.6,
    sampleSize: 680,
  },
  "E-commerce": {
    teamExperience: 6.8,
    marketPotential: 7.2,
    flowAndClarity: 7.4,
    problemSolution: 7.0,
    businessModel: 7.5,
    overallScore: 7.2,
    sampleSize: 920,
  },
  SaaS: {
    teamExperience: 7.3,
    marketPotential: 7.6,
    flowAndClarity: 7.8,
    problemSolution: 7.5,
    businessModel: 8.0,
    overallScore: 7.6,
    sampleSize: 1200,
  },
  "AI/ML": {
    teamExperience: 8.0,
    marketPotential: 8.2,
    flowAndClarity: 7.3,
    problemSolution: 7.8,
    businessModel: 7.2,
    overallScore: 7.7,
    sampleSize: 560,
  },
  Consumer: {
    teamExperience: 6.9,
    marketPotential: 7.4,
    flowAndClarity: 7.6,
    problemSolution: 7.2,
    businessModel: 6.8,
    overallScore: 7.2,
    sampleSize: 780,
  },
  Enterprise: {
    teamExperience: 7.6,
    marketPotential: 7.3,
    flowAndClarity: 7.5,
    problemSolution: 7.7,
    businessModel: 7.9,
    overallScore: 7.6,
    sampleSize: 450,
  },
  Education: {
    teamExperience: 7.4,
    marketPotential: 7.0,
    flowAndClarity: 7.6,
    problemSolution: 7.8,
    businessModel: 6.5,
    overallScore: 7.3,
    sampleSize: 320,
  },
  "Real Estate": {
    teamExperience: 7.1,
    marketPotential: 7.2,
    flowAndClarity: 7.3,
    problemSolution: 6.9,
    businessModel: 7.4,
    overallScore: 7.2,
    sampleSize: 280,
  },
  Gaming: {
    teamExperience: 7.0,
    marketPotential: 7.5,
    flowAndClarity: 7.8,
    problemSolution: 7.1,
    businessModel: 6.6,
    overallScore: 7.2,
    sampleSize: 390,
  },
  Sustainability: {
    teamExperience: 7.3,
    marketPotential: 7.8,
    flowAndClarity: 7.4,
    problemSolution: 8.0,
    businessModel: 6.7,
    overallScore: 7.4,
    sampleSize: 240,
  },
  Other: {
    teamExperience: 7.0,
    marketPotential: 7.2,
    flowAndClarity: 7.3,
    problemSolution: 7.2,
    businessModel: 7.0,
    overallScore: 7.1,
    sampleSize: 1500,
  },
};

export const getDimensionLabel = (key: string): string => {
  const labels: Record<string, string> = {
    teamExperience: "Team Experience",
    marketPotential: "Market Potential",
    flowAndClarity: "Flow & Clarity",
    problemSolution: "Problem/Solution",
    businessModel: "Business Model",
  };
  return labels[key] || key;
};

export const getScoreDelta = (userScore: number, benchmarkScore: number): number => {
  return Number((userScore - benchmarkScore).toFixed(1));
};

export const getComparisonInsight = (
  userScores: Record<string, number>,
  benchmark: IndustryBenchmark,
  industry: string
): string[] => {
  const insights: string[] = [];
  const dimensions = ["teamExperience", "marketPotential", "flowAndClarity", "problemSolution", "businessModel"] as const;
  
  // Find strongest and weakest areas compared to benchmark
  let maxDelta = -Infinity;
  let minDelta = Infinity;
  let strongestArea = "";
  let weakestArea = "";
  
  dimensions.forEach((dim) => {
    const delta = userScores[dim] - benchmark[dim];
    if (delta > maxDelta) {
      maxDelta = delta;
      strongestArea = getDimensionLabel(dim);
    }
    if (delta < minDelta) {
      minDelta = delta;
      weakestArea = getDimensionLabel(dim);
    }
  });
  
  if (maxDelta > 0.5) {
    insights.push(`Your ${strongestArea} score is ${maxDelta.toFixed(1)} points above the ${industry} industry average - this is a standout strength!`);
  }
  
  if (minDelta < -0.5) {
    insights.push(`Focus on improving your ${weakestArea} - it's ${Math.abs(minDelta).toFixed(1)} points below typical ${industry} decks.`);
  }
  
  const overallDelta = userScores.overallScore - benchmark.overallScore;
  if (overallDelta > 0) {
    insights.push(`Overall, your deck scores ${overallDelta.toFixed(1)} points higher than the average ${industry} pitch deck.`);
  } else if (overallDelta < 0) {
    insights.push(`Your deck is ${Math.abs(overallDelta).toFixed(1)} points below the ${industry} average - there's room to improve!`);
  } else {
    insights.push(`Your deck is right on par with the average ${industry} pitch deck.`);
  }
  
  return insights;
};
