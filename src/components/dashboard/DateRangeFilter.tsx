import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

type PresetKey = "7d" | "30d" | "90d" | "thisMonth" | "lastMonth" | "thisYear" | "all" | "custom";

const PRESETS: { value: PresetKey; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisYear", label: "This year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

export default function DateRangeFilter({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetKey>("30d");
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (value: PresetKey) => {
    setPreset(value);
    const today = new Date();

    switch (value) {
      case "7d":
        onDateRangeChange({ from: subDays(today, 7), to: today });
        setShowCustom(false);
        break;
      case "30d":
        onDateRangeChange({ from: subDays(today, 30), to: today });
        setShowCustom(false);
        break;
      case "90d":
        onDateRangeChange({ from: subDays(today, 90), to: today });
        setShowCustom(false);
        break;
      case "thisMonth":
        onDateRangeChange({ from: startOfMonth(today), to: today });
        setShowCustom(false);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        onDateRangeChange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        });
        setShowCustom(false);
        break;
      case "thisYear":
        onDateRangeChange({ from: startOfYear(today), to: today });
        setShowCustom(false);
        break;
      case "all":
        onDateRangeChange({ from: undefined, to: undefined });
        setShowCustom(false);
        break;
      case "custom":
        setShowCustom(true);
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetKey)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) =>
                  onDateRangeChange({ ...dateRange, from: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) =>
                  onDateRangeChange({ ...dateRange, to: date })
                }
                disabled={(date) =>
                  dateRange.from ? date < dateRange.from : false
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
