import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPANY_STAGES, INDUSTRIES, CompanyStage } from "./analysis";
import { Building2, Layers } from "lucide-react";

interface CompanyDetailsProps {
  stage: CompanyStage | "";
  industry: string;
  onStageChange: (stage: CompanyStage) => void;
  onIndustryChange: (industry: string) => void;
}

export const CompanyDetails = ({
  stage,
  industry,
  onStageChange,
  onIndustryChange,
}: CompanyDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="w-4 h-4 text-muted-foreground" />
          Company Stage
        </label>
        <Select value={stage} onValueChange={(v) => onStageChange(v as CompanyStage)}>
          <SelectTrigger className="bg-card border-border h-12">
            <SelectValue placeholder="Select your funding stage" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Industry
        </label>
        <Select value={industry} onValueChange={onIndustryChange}>
          <SelectTrigger className="bg-card border-border h-12">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind.toLowerCase()}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
