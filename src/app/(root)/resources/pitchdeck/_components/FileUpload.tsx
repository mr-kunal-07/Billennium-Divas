import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, selectedFile, onClear, isLoading }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div className="relative bg-card rounded-xl border border-border p-6 shadow-card animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {!isLoading && (
            <button
              onClick={onClear}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 cursor-pointer",
        "bg-card rounded-xl border-2 border-dashed transition-all duration-300",
        "hover:border-primary/50 hover:bg-primary/5",
        isDragging 
          ? "border-primary bg-primary/10 scale-[1.02]" 
          : "border-border"
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
          isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        )}>
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">
            Drop your pitch deck here
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse • PDF format
          </p>
        </div>
      </div>
    </label>
  );
};
