"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Save, FolderOpen, FileText, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import InvoicePreview from "./InvoicePreview";
import { useInvoiceAPI, StoredInvoice } from "@/hooks/useInvoiceAPI";
import { getPaletteById, hexToHSL } from "@/lib/colorPalettes";
import { numberToWordsINR, numberToWordsUSD } from "@/lib/numberToWords";
import {
  InvoiceData,
  initialInvoiceData,
  defaultLineItem,
  calculateLineItem,
  calculateTotals,
  SellerDetails,
  BuyerDetails,
  ShippingDetails,
  BankDetails,
  AuthorizationDetails,
  InvoiceHeader,
} from "@/hooks/invoice";

import InvoiceHeaderSection from "./invoice/InvoiceHeaderSection";
import SellerSection from "./invoice/SellerSection";
import BuyerSection from "./invoice/BuyerSection";
import ShippingSection from "./invoice/ShippingSection";
import LineItemsSection from "./invoice/LineItemsSection";
import BankSection from "./invoice/BankSection";
import AuthorizationSection from "./invoice/AuthorizationSection";
import TotalsSummary from "./invoice/TotalsSummary";
import NotesSection from "./invoice/NotesSection";

export type { InvoiceData } from "@/hooks/invoice";

interface InvoiceBuilderProps {
  mode?: "new" | "edit" | "view";
  invoiceId?: string;
}

export default function InvoiceBuilder({ mode = "new", invoiceId }: InvoiceBuilderProps) {
  const router = useRouter();

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
  const [showPreview, setShowPreview] = useState(mode === "view");
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(invoiceId ?? null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [invoiceName, setInvoiceName] = useState("");
  const [savedInvoices, setSavedInvoices] = useState<StoredInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    fetchInvoice,
    fetchInvoices,
    createInvoice,
    updateInvoice: updateInvoiceAPI,
    deleteInvoice: deleteInvoiceAPI,
    loading,
  } = useInvoiceAPI();

  const loadInvoice = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const invoice = await fetchInvoice(id);
      if (invoice) {
        setInvoiceData(invoice.data);
        setCurrentInvoiceId(invoice.id ?? invoice._id ?? null);
        setInvoiceName(invoice.name ?? "");
        if (mode === "view") setShowPreview(true);
      } else {
        toast.error("Invoice not found");
        router.push("/resources/invoice");
      }
    } catch {
      toast.error("Failed to load invoice");
      router.push("/resources/invoice");
    } finally {
      setIsLoading(false);
    }
  }, [mode, fetchInvoice, router]);

  useEffect(() => {
    if (invoiceId && (mode === "edit" || mode === "view")) {
      loadInvoice(invoiceId);
    }
  }, [invoiceId, mode, loadInvoice]);

  // ─── Load saved invoices for load dialog ─────────────────────────────────

  const loadSavedInvoices = async () => {
    const invoices = await fetchInvoices();
    setSavedInvoices(invoices);
  };

  // ─── Apply color palette to CSS variables ────────────────────────────────

  useEffect(() => {
    const primaryHSL = invoiceData.useCustomColor
      ? hexToHSL(invoiceData.customColor)
      : getPaletteById(invoiceData.colorPalette).primary;

    document.documentElement.style.setProperty("--primary", primaryHSL);
    document.documentElement.style.setProperty("--ring", primaryHSL);

    return () => {
      document.documentElement.style.setProperty("--primary", "217 91% 50%");
      document.documentElement.style.setProperty("--ring", "217 91% 50%");
    };
  }, [invoiceData.colorPalette, invoiceData.customColor, invoiceData.useCustomColor]);

  // ─── Recalculate line items when tax type changes ─────────────────────────

  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => calculateLineItem(item, prev.taxType)),
    }));
  }, [invoiceData.taxType]);

  // ─── Field updaters ───────────────────────────────────────────────────────

  const updateSeller = (field: keyof SellerDetails, value: string) =>
    setInvoiceData(prev => ({ ...prev, seller: { ...prev.seller, [field]: value } }));

  const updateBuyer = (field: keyof BuyerDetails, value: string) =>
    setInvoiceData(prev => ({ ...prev, buyer: { ...prev.buyer, [field]: value } }));

  const updateShipping = (field: keyof ShippingDetails, value: string | number | boolean) =>
    setInvoiceData(prev => ({ ...prev, shipping: { ...prev.shipping, [field]: value } }));

  const updateBank = (field: keyof BankDetails, value: string) =>
    setInvoiceData(prev => ({ ...prev, bank: { ...prev.bank, [field]: value } }));

  const updateAuth = (field: keyof AuthorizationDetails, value: string) =>
    setInvoiceData(prev => ({ ...prev, authorization: { ...prev.authorization, [field]: value } }));

  const updateHeader = (field: keyof InvoiceHeader, value: string | boolean) =>
    setInvoiceData(prev => ({ ...prev, header: { ...prev.header, [field]: value } }));

  const updateSettings = (updates: Record<string, any>) =>
    setInvoiceData(prev => ({ ...prev, ...updates }));

  // ─── File uploads ─────────────────────────────────────────────────────────

  const makeFileUploader =
    (onResult: (dataUrl: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => onResult(reader.result as string);
      reader.readAsDataURL(file);
    };

  const handleLogoUpload      = makeFileUploader(v => updateSeller("logo", v));
  const handleSignatureUpload = makeFileUploader(v => updateAuth("signature", v));
  const handleStampUpload     = makeFileUploader(v => updateAuth("companyStamp", v));

  // ─── Line items ───────────────────────────────────────────────────────────

  const addLineItem = () =>
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { ...defaultLineItem, id: Date.now().toString() }],
    }));

  const removeLineItem = (id: string) =>
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.length > 1
        ? prev.lineItems.filter(item => item.id !== id)
        : prev.lineItems,
    }));

  const updateLineItem = (id: string, updates: Partial<typeof defaultLineItem>) =>
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => item.id === id ? { ...item, ...updates } : item),
    }));

  const updateCharges = (field: "otherCharges" | "roundingAdjustment", value: number) =>
    setInvoiceData(prev => ({ ...prev, [field]: value }));

  const updateNotes = (field: string, value: string) =>
    setInvoiceData(prev => ({ ...prev, [field]: value }));

  // ─── Totals & amount in words ─────────────────────────────────────────────

  const totals = calculateTotals(
    invoiceData.lineItems,
    invoiceData.otherCharges,
    invoiceData.roundingAdjustment,
  );

  const amountInWords =
    invoiceData.currency === "INR"
      ? numberToWordsINR(totals.grandTotal)
      : numberToWordsUSD(totals.grandTotal);

  // ─── Save / Update ────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!invoiceName.trim()) {
      toast.error("Invoice name is required");
      return;
    }

    setIsSaving(true);
    try {
      const invoiceTotals = {
        grandTotal: totals.grandTotal,
        totalTax: totals.totalTax,
        subtotal: totals.subtotal,
      };

      if (currentInvoiceId) {
        const result = await updateInvoiceAPI(currentInvoiceId, invoiceData, invoiceTotals);
        if (result) {
          toast.success("Invoice updated successfully");
          router.push("/resources/invoice");
        } else {
          toast.error("Failed to update invoice");
        }
      } else {
        const result = await createInvoice(invoiceData, invoiceTotals);
        if (result) {
          setCurrentInvoiceId(result.id ?? result._id ?? null);
          toast.success("Invoice saved successfully");
          router.push("/resources/invoice");
        } else {
          toast.error("Failed to save invoice");
        }
      }
    } catch {
      toast.error("Error saving invoice");
    } finally {
      setIsSaving(false);
      setSaveDialogOpen(false);
    }
  };

  // ─── Load / Delete ────────────────────────────────────────────────────────

  const handleLoad = (invoice: StoredInvoice) => {
    setInvoiceData(invoice.data);
    setCurrentInvoiceId(invoice.id ?? invoice._id ?? null);
    setInvoiceName(invoice.name ?? "");
    setLoadDialogOpen(false);
    toast.success("Invoice loaded");
  };

  const handleDelete = async (id: string, name: string) => {
    const success = await deleteInvoiceAPI(id);
    if (success) {
      setSavedInvoices(prev => prev.filter(inv => (inv.id ?? inv._id) !== id));
      if (currentInvoiceId === id) {
        setCurrentInvoiceId(null);
        setInvoiceName("");
      }
      toast.success(`"${name}" deleted`);
    } else {
      toast.error("Failed to delete invoice");
    }
  };

  const handleNewInvoice = () => {
    setInvoiceData(initialInvoiceData);
    setCurrentInvoiceId(null);
    setInvoiceName("");
    toast.success("New invoice started");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <InvoicePreview
        data={invoiceData}
        totals={totals}
        amountInWords={amountInWords}
        onBack={() => {
          if (mode === "view") {
            router.push("/dashboard");
          } else {
            setShowPreview(false);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/resources/invoice")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
               Back
                </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* New */}
            <Button variant="outline" onClick={handleNewInvoice} size="sm">
              <FileText className="w-4 h-4 mr-2" />New
            </Button>

            {/* Save / Update dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInvoiceName(prev => prev || `Invoice ${invoiceData.header.invoiceNumber}`)
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {currentInvoiceId ? "Update" : "Save"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentInvoiceId ? "Update" : "Save"} Invoice</DialogTitle>
                  <DialogDescription>Give your invoice a name.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>Invoice Name</Label>
                  <Input
                    value={invoiceName}
                    onChange={e => setInvoiceName(e.target.value)}
                    placeholder="e.g., Client ABC – March 2025"
                    className="mt-2"
                    onKeyDown={e => e.key === "Enter" && handleSave()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {currentInvoiceId ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Load dialog */}
            <Dialog
              open={loadDialogOpen}
              onOpenChange={open => {
                setLoadDialogOpen(open);
                if (open) loadSavedInvoices();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="w-4 h-4 mr-2" />Load
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Load Invoice</DialogTitle>
                  <DialogDescription>Select a saved invoice to load.</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[300px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : savedInvoices.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No saved invoices.</p>
                  ) : (
                    <div className="space-y-2">
                      {savedInvoices.map(invoice => {
                        const id = invoice.id ?? invoice._id ?? "";
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                          >
                            <button
                              onClick={() => handleLoad(invoice)}
                              className="flex-1 text-left"
                            >
                              <p className="font-medium">{invoice.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Saved {new Date(invoice.created_at).toLocaleDateString()}
                              </p>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(id, invoice.name ?? "")}
                              className="text-muted-foreground hover:text-destructive ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Form sections ── */}
        <div className="grid gap-6">
          <InvoiceHeaderSection
            header={invoiceData.header}
            currency={invoiceData.currency}
            taxType={invoiceData.taxType}
            paymentTerms={invoiceData.paymentTerms}
            paymentDueDate={invoiceData.paymentDueDate}
            paymentMode={invoiceData.paymentMode}
            colorPalette={invoiceData.colorPalette}
            customColor={invoiceData.customColor}
            useCustomColor={invoiceData.useCustomColor}
            templateId={invoiceData.templateId}
            onUpdateHeader={updateHeader}
            onUpdateSettings={updateSettings}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <SellerSection
              seller={invoiceData.seller}
              onUpdate={updateSeller}
              onLogoUpload={handleLogoUpload}
            />
            <BuyerSection buyer={invoiceData.buyer} onUpdate={updateBuyer} />
          </div>

          <ShippingSection shipping={invoiceData.shipping} onUpdate={updateShipping} />

          <LineItemsSection
            items={invoiceData.lineItems}
            taxType={invoiceData.taxType}
            currency={invoiceData.currency}
            onAddItem={addLineItem}
            onRemoveItem={removeLineItem}
            onUpdateItem={updateLineItem}
          />

          <TotalsSummary
            totals={totals}
            taxType={invoiceData.taxType}
            currency={invoiceData.currency}
            otherCharges={invoiceData.otherCharges}
            roundingAdjustment={invoiceData.roundingAdjustment}
            onUpdateCharges={updateCharges}
            amountInWords={amountInWords}
          />

          <BankSection bank={invoiceData.bank} onUpdate={updateBank} />

          <NotesSection
            notes={invoiceData.notes}
            termsAndConditions={invoiceData.termsAndConditions}
            taxDisclaimer={invoiceData.taxDisclaimer}
            cancellationPolicy={invoiceData.cancellationPolicy}
            onUpdate={updateNotes}
          />

          <AuthorizationSection
            auth={invoiceData.authorization}
            onUpdate={updateAuth}
            onSignatureUpload={handleSignatureUpload}
            onStampUpload={handleStampUpload}
          />

          {/* Preview button */}
          <Button variant="outline"  onClick={() => setShowPreview(true)} size="lg" className="w-fit mx-auto mt-4 bg-black text-white cursor-pointer">
            <Eye className="w-5 h-5 mr-2" />
            Preview Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}