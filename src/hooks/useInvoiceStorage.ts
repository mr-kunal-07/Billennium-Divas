import { useState, useEffect, useCallback } from "react";

export interface SavedInvoice {
  id: string;
  name: string;
  data: any;
  savedAt: string;
}

const STORAGE_KEY = "invoice-builder-invoices";

export function useInvoiceStorage() {
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);

  // Load invoices from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedInvoices(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved invoices", e);
      }
    }
  }, []);

  const saveInvoice = useCallback((name: string, data: any): string => {
    const id = Date.now().toString();
    const newInvoice: SavedInvoice = {
      id,
      name,
      data,
      savedAt: new Date().toISOString(),
    };
    
    setSavedInvoices((prev) => {
      const updated = [...prev, newInvoice];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    return id;
  }, []);

  const updateInvoice = useCallback((id: string, name: string, data: any) => {
    setSavedInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id
          ? { ...inv, name, data, savedAt: new Date().toISOString() }
          : inv
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setSavedInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadInvoice = useCallback((id: string): SavedInvoice | undefined => {
    return savedInvoices.find((inv) => inv.id === id);
  }, [savedInvoices]);

  return {
    savedInvoices,
    saveInvoice,
    updateInvoice,
    deleteInvoice,
    loadInvoice,
  };
}
