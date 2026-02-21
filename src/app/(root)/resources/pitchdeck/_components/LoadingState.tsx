import { Loader2 } from "lucide-react";

const steps = [
  "Reading your pitch deck...",
  "Analyzing slide content...",
  "Evaluating market potential...",
  "Assessing team presentation...",
  "Generating recommendations...",
];

interface LoadingStateProps {
  step?: number;
}

export const LoadingState = ({ step = 0 }: LoadingStateProps) => {
  const currentStep = Math.min(step, steps.length - 1);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center animate-pulse">
          <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-ping" />
      </div>
      
      <p className="mt-8 text-lg font-medium text-foreground">
        {steps[currentStep]}
      </p>
      
      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= currentStep ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
