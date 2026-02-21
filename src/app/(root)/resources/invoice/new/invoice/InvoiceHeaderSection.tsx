import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceHeader, InvoiceType, TaxType, PAYMENT_TERMS_OPTIONS, PaymentTerms } from "@/hooks/invoice";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";
import { COLOR_PALETTES, getPaletteById, hslToHex } from "@/lib/colorPalettes";
import { INVOICE_TEMPLATES } from "@/lib/invoiceTemplates";
import { FileText } from "lucide-react";

interface InvoiceHeaderSectionProps {
  header: InvoiceHeader;
  currency: CurrencyCode;
  taxType: TaxType;
  paymentTerms: PaymentTerms;
  paymentDueDate: string;
  paymentMode: string;
  colorPalette: string;
  customColor: string;
  useCustomColor: boolean;
  templateId: string;
  onUpdateHeader: (field: keyof InvoiceHeader, value: string | boolean) => void;
  onUpdateSettings: (updates: Record<string, any>) => void;
}

export default function InvoiceHeaderSection({
  header,
  currency,
  taxType,
  paymentTerms,
  paymentDueDate,
  paymentMode,
  colorPalette,
  customColor,
  useCustomColor,
  templateId,
  onUpdateHeader,
  onUpdateSettings,
}: InvoiceHeaderSectionProps) {
  const currentPalette = getPaletteById(colorPalette);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invoice Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Type, Currency, Tax Type, Template */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>Invoice Type</Label>
            <Select
              value={header.invoiceType}
              onValueChange={(value: InvoiceType) => onUpdateHeader("invoiceType", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tax">Tax Invoice</SelectItem>
                <SelectItem value="proforma">Proforma Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Currency</Label>
            <Select
              value={currency}
              onValueChange={(value: CurrencyCode) => onUpdateSettings({ currency: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CURRENCIES).map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tax Type</Label>
            <Select
              value={taxType}
              onValueChange={(value: TaxType) => onUpdateSettings({ taxType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="igst">IGST (Inter-State)</SelectItem>
                <SelectItem value="cgst_sgst">CGST + SGST (Intra-State)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Template</Label>
            <Select
              value={templateId}
              onValueChange={(value) => onUpdateSettings({ templateId: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label>Invoice Number *</Label>
            <Input
              value={header.invoiceNumber}
              onChange={(e) => onUpdateHeader("invoiceNumber", e.target.value)}
              placeholder="PI-001"
              className="mt-1"
            />
          </div>
        </div>

        {/* Row 2: Invoice Number, Date, Validity */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         
          <div>
            <Label>Invoice Date *</Label>
            <Input
              type="date"
              value={header.invoiceDate}
              onChange={(e) => onUpdateHeader("invoiceDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Validity Date</Label>
            <Input
              type="date"
              value={header.validityDate}
              onChange={(e) => onUpdateHeader("validityDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label>Reverse Charge</Label>
              <div className="mt-2 flex items-center gap-2">
                <Switch
                  checked={header.reverseCharge}
                  onCheckedChange={(checked) => onUpdateHeader("reverseCharge", checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {header.reverseCharge ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
           <div>
            <Label>Quotation / Ref No.</Label>
            <Input
              value={header.quotationNumber}
              onChange={(e) => onUpdateHeader("quotationNumber", e.target.value)}
              placeholder="Q-001"
              className="mt-1"
            />
          </div>
          <div>
            <Label>PO Number</Label>
            <Input
              value={header.poNumber}
              onChange={(e) => onUpdateHeader("poNumber", e.target.value)}
              placeholder="PO-001"
              className="mt-1"
            />
          </div>
        </div>

        {/* Row 3: Reference Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>Challan No.</Label>
            <Input
              value={header.challanNumber}
              onChange={(e) => onUpdateHeader("challanNumber", e.target.value)}
              placeholder="CH-001"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Challan Date</Label>
            <Input
              type="date"
              value={header.challanDate}
              onChange={(e) => onUpdateHeader("challanDate", e.target.value)}
              className="mt-1"
            />
          </div>
            <div>
            <Label>Payment Terms</Label>
            <Select
              value={paymentTerms}
              onValueChange={(value: PaymentTerms) => onUpdateSettings({ paymentTerms: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS_OPTIONS.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Due Date</Label>
            <Input
              type="date"
              value={paymentDueDate}
              onChange={(e) => onUpdateSettings({ paymentDueDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Payment Mode</Label>
            <Input
              value={paymentMode}
              onChange={(e) => onUpdateSettings({ paymentMode: e.target.value })}
              placeholder="Bank Transfer / Cheque"
              className="mt-1"
            />
          </div>
        </div>

        {/* Row 4: Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        </div>

        {/* Color Palette */}
        <div>
          <Label>Invoice Color Theme</Label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.id}
                onClick={() => {
                  onUpdateSettings({ colorPalette: palette.id, useCustomColor: false });
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  !useCustomColor && colorPalette === palette.id
                    ? "border-foreground scale-110 "
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: `hsl(${palette.primary})` }}
                title={palette.name}
              />
            ))}
            <div className="flex items-center gap-2 ml-4">
              <Label className="text-sm text-muted-foreground">Custom:</Label>
              <input
                type="color"
                value={useCustomColor ? customColor : hslToHex(currentPalette.primary)}
                onChange={(e) => {
                  onUpdateSettings({ customColor: e.target.value, useCustomColor: true });
                }}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
