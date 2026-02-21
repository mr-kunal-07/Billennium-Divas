import { useState, useEffect, useCallback } from "react";
import { ReviewRecord } from "@/app/(root)/resources/pitchdeck/_components/analysis";

const STORAGE_KEY = "pitch-deck-reviews";

export const useReviews = () => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored reviews:", e);
      }
    }
  }, []);

  const saveReview = useCallback((review: ReviewRecord) => {
    setReviews((prev) => {
      const updated = [review, ...prev.filter((r) => r.id !== review.id)].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { reviews, saveReview, deleteReview };
};
