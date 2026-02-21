import { useState, useEffect } from "react";
import { ArrowLeft, Download, Printer, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/hooks/invoice";
import { formatCurrency } from "@/lib/currency";
import { getPaletteById, hexToHSL } from "@/lib/colorPalettes";

import SendInvoiceDialog from "./invoice/SendInvoiceDialog";
import { toast } from "sonner";

interface InvoicePreviewProps {
  data: InvoiceData;
  totals: {
    totalQuantity: number;
    subtotal: number;
    totalDiscount: number;
    totalCGST: number;
    totalSGST: number;
    totalIGST: number;
    totalTax: number;
    grandTotal: number;
  };
  amountInWords: string;
  onBack: () => void;
}

export default function InvoicePreview({ data, totals, amountInWords, onBack }: InvoicePreviewProps) {

  const [isSending, setIsSending] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  useEffect(() => {
    let primaryHSL: string;
    if (data.useCustomColor) {
      primaryHSL = hexToHSL(data.customColor);
    } else {
      const palette = getPaletteById(data.colorPalette);
      primaryHSL = palette.primary;
    }
    document.documentElement.style.setProperty("--primary", primaryHSL);
    document.documentElement.style.setProperty("--ring", primaryHSL);
  }, [data.colorPalette, data.customColor, data.useCustomColor]);

  const handlePrint = () => window.print();

  const handleSendClick = () => {
    const clientEmail = data.buyer.email;
    if (!clientEmail) {
      toast("No email address", {
        description: "Please add buyer's email address before sending",
      })
      return;
    }
    setSendDialogOpen(true);
  };

  const handleSend = async (subject: string, message: string): Promise<boolean> => {
    const clientEmail = data.buyer.email;
    if (!clientEmail) return false;

    // Build mailto link
    const mailtoUrl = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, '_blank');

    toast("Email client opened", {
      description: "Complete sending in your email app.",
    });
  };


  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const getPrimaryColor = () => {
    if (data.useCustomColor) return hexToHSL(data.customColor);
    return getPaletteById(data.colorPalette).primary;
  };

  const primaryColor = getPrimaryColor();
  const invoiceTitle = data.header.invoiceType === "proforma" ? "PROFORMA INVOICE" : "TAX INVOICE";
  const { seller, buyer, shipping, bank, authorization } = data;
  const hasClientEmail = !!data.buyer.email;

  return (
    <div className="min-h-screen bg-muted py-8 px-4 print:bg-white print:py-0">
      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />Back to Editor
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSendClick}
            disabled={!hasClientEmail}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {!hasClientEmail ? "No Email" : "Send"}
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />Print
          </Button>
          <Button variant='outline' onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" />Download PDF
          </Button>
        </div>
      </div>

      {/* Send Invoice Dialog */}
      <SendInvoiceDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onSend={handleSend}
        isSending={isSending}
        clientEmail={data.buyer.email}
        clientName={data.buyer.companyName || "Customer"}
        sellerName={data.seller.companyName || "Seller"}
        invoiceNumber={data.header.invoiceNumber}
        invoiceDate={data.header.invoiceDate}
        dueDate={data.paymentDueDate}
        amount={totals.grandTotal}
        currency={data.currency}
      />

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-card  rounded-lg print:shadow-none print:rounded-none border">
        <div className="p-6 md:p-8">
          {/* Header with Logo and Title */}
          <div className="border-b-2 pb-4 mb-4" style={{ borderColor: `hsl(${primaryColor})` }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {seller.logo && <img src={seller.logo} alt="Logo" className="w-20 h-20 object-contain" />}
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: `hsl(${primaryColor})` }}>
                    {seller.companyName || "Company Name"}
                  </h1>
                  {seller.tradeName && <p className="text-sm text-muted-foreground">{seller.tradeName}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold mb-1" style={{ color: `hsl(${primaryColor})` }}>{invoiceTitle}</h2>
                <p className="text-sm font-medium">#{data.header.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Company & Invoice Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6 text-sm">
            {/* Left: Seller Address */}
            <div className="space-y-1">
              <p>{seller.addressLine1}{seller.addressLine2 && `, ${seller.addressLine2}`}</p>
              <p>{seller.city}, {seller.state} - {seller.pincode}</p>
              {seller.phone && <p><strong>Tel:</strong> {seller.phone}</p>}
              {seller.email && <p><strong>Email:</strong> {seller.email}</p>}
              {seller.website && <p><strong>Web:</strong> {seller.website}</p>}
            </div>
            {/* Right: Invoice Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Date:</strong></p><p>{formatDate(data.header.invoiceDate)}</p>
              {data.header.validityDate && <><p><strong>Valid Till:</strong></p><p>{formatDate(data.header.validityDate)}</p></>}
              {data.header.poNumber && <><p><strong>PO No:</strong></p><p>{data.header.poNumber}</p></>}
              {data.header.challanNumber && <><p><strong>Challan:</strong></p><p>{data.header.challanNumber}</p></>}
              <p><strong>Reverse Charge:</strong></p><p>{data.header.reverseCharge ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* GSTIN Row */}
          <div className="grid md:grid-cols-2 gap-4 p-3 rounded mb-6" style={{ backgroundColor: `hsl(${primaryColor} / 0.05)` }}>
            <p className="text-sm"><strong>GSTIN:</strong> {seller.gstin || "N/A"}</p>
            {seller.pan && <p className="text-sm"><strong>PAN:</strong> {seller.pan}</p>}
          </div>

          {/* Buyer & Shipping */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Bill To</h3>
              <p className="font-medium">{buyer.companyName}</p>
              <p className="text-sm">{buyer.addressLine1}{buyer.addressLine2 && `, ${buyer.addressLine2}`}</p>
              <p className="text-sm">{buyer.city}, {buyer.state} - {buyer.pincode}</p>
              {buyer.gstin && <p className="text-sm mt-1"><strong>GSTIN:</strong> {buyer.gstin}</p>}
              {buyer.placeOfSupply && <p className="text-sm"><strong>Place of Supply:</strong> {buyer.placeOfSupply}</p>}
            </div>
            {shipping.enabled && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Ship To</h3>
                <p className="font-medium">{shipping.name}</p>
                <p className="text-sm">{shipping.addressLine1}{shipping.addressLine2 && `, ${shipping.addressLine2}`}</p>
                <p className="text-sm">{shipping.city}, {shipping.state} - {shipping.pincode}</p>
                {shipping.transporterName && <p className="text-sm mt-1"><strong>Transport:</strong> {shipping.transporterName}</p>}
                {shipping.vehicleNumber && <p className="text-sm"><strong>Vehicle:</strong> {shipping.vehicleNumber}</p>}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: `hsl(${primaryColor})`, color: "white" }}>
                  <th className="p-2 text-left border">Sr.</th>
                  <th className="p-2 text-left border">Item</th>
                  <th className="p-2 text-center border">HSN/SAC</th>
                  <th className="p-2 text-center border">Qty</th>
                  <th className="p-2 text-right border">Rate</th>
                  <th className="p-2 text-right border">Taxable</th>
                  {data.taxType === "cgst_sgst" ? (
                    <>
                      <th className="p-2 text-center border">CGST</th>
                      <th className="p-2 text-center border">SGST</th>
                    </>
                  ) : (
                    <th className="p-2 text-center border">IGST</th>
                  )}
                  <th className="p-2 text-right border">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">
                      <p className="font-medium">{item.itemName}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </td>
                    <td className="p-2 text-center border">{item.hsnSacCode || "-"}</td>
                    <td className="p-2 text-center border">{item.quantity} {item.unit.toUpperCase()}</td>
                    <td className="p-2 text-right border">{formatCurrency(item.rate, data.currency)}</td>
                    <td className="p-2 text-right border">{formatCurrency(item.taxableValue, data.currency)}</td>
                    {data.taxType === "cgst_sgst" ? (
                      <>
                        <td className="p-2 text-center border text-xs">{item.cgstPercent}%<br />{formatCurrency(item.cgstAmount, data.currency)}</td>
                        <td className="p-2 text-center border text-xs">{item.sgstPercent}%<br />{formatCurrency(item.sgstAmount, data.currency)}</td>
                      </>
                    ) : (
                      <td className="p-2 text-center border text-xs">{item.igstPercent}%<br />{formatCurrency(item.igstAmount, data.currency)}</td>
                    )}
                    <td className="p-2 text-right border font-medium">{formatCurrency(item.totalAmount, data.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold" style={{ backgroundColor: `hsl(${primaryColor} / 0.1)` }}>
                  <td colSpan={3} className="p-2 border text-right">Total</td>
                  <td className="p-2 text-center border">{totals.totalQuantity}</td>
                  <td className="p-2 border"></td>
                  <td className="p-2 text-right border">{formatCurrency(totals.subtotal, data.currency)}</td>
                  {data.taxType === "cgst_sgst" ? (
                    <>
                      <td className="p-2 text-center border">{formatCurrency(totals.totalCGST, data.currency)}</td>
                      <td className="p-2 text-center border">{formatCurrency(totals.totalSGST, data.currency)}</td>
                    </>
                  ) : (
                    <td className="p-2 text-center border">{formatCurrency(totals.totalIGST, data.currency)}</td>
                  )}
                  <td className="p-2 text-right border">{formatCurrency(totals.grandTotal, data.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words & Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="p-3 rounded mb-4" style={{ backgroundColor: `hsl(${primaryColor} / 0.05)` }}>
                <p className="text-sm italic">{amountInWords}</p>
              </div>
              {/* Bank Details */}
              {bank.bankName && (
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Bank Details</h3>
                  <p className="text-sm"><strong>Bank:</strong> {bank.bankName}</p>
                  {bank.branchName && <p className="text-sm"><strong>Branch:</strong> {bank.branchName}</p>}
                  <p className="text-sm"><strong>A/C No:</strong> {bank.accountNumber}</p>
                  <p className="text-sm"><strong>IFSC:</strong> {bank.ifscCode}</p>
                  {bank.upiId && <p className="text-sm"><strong>UPI:</strong> {bank.upiId}</p>}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Taxable Amount:</span><span>{formatCurrency(totals.subtotal, data.currency)}</span></div>
              {data.taxType === "cgst_sgst" ? (
                <>
                  <div className="flex justify-between"><span>Add: CGST</span><span>{formatCurrency(totals.totalCGST, data.currency)}</span></div>
                  <div className="flex justify-between"><span>Add: SGST</span><span>{formatCurrency(totals.totalSGST, data.currency)}</span></div>
                </>
              ) : (
                <div className="flex justify-between"><span>Add: IGST</span><span>{formatCurrency(totals.totalIGST, data.currency)}</span></div>
              )}
              <div className="flex justify-between"><span>Total Tax:</span><span>{formatCurrency(totals.totalTax, data.currency)}</span></div>
              {data.otherCharges > 0 && <div className="flex justify-between"><span>Other Charges:</span><span>{formatCurrency(data.otherCharges, data.currency)}</span></div>}
              {data.roundingAdjustment !== 0 && <div className="flex justify-between"><span>Rounding:</span><span>{formatCurrency(data.roundingAdjustment, data.currency)}</span></div>}
              <div className="flex justify-between pt-2 border-t-2 text-lg font-bold" style={{ borderColor: `hsl(${primaryColor})` }}>
                <span>Total Amount:</span>
                <span style={{ color: `hsl(${primaryColor})` }}>{formatCurrency(totals.grandTotal, data.currency)}</span>
              </div>
              <p className="text-xs text-muted-foreground">(E & O.E.)</p>
            </div>
          </div>

          {/* Terms */}
          {data.termsAndConditions && (
            <div className="mb-6 border-t pt-4">
              <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Terms & Conditions</h3>
              <p className="text-sm whitespace-pre-line">{data.termsAndConditions}</p>
            </div>
          )}

          {/* Authorization */}
          <div className="flex justify-between items-end border-t pt-6">
            <div className="text-sm">
              {authorization.declaration && <p className="text-muted-foreground italic mb-2">{authorization.declaration}</p>}
            </div>
            {authorization.signature || authorization.companyStamp ? (
              <div className="text-center">
                <p className="text-sm font-medium mb-2">For {seller.companyName}</p>
                <div className="flex items-center gap-4 justify-center mb-2">
                  {authorization.signature && <img src={authorization.signature} alt="Signature" className="h-12 object-contain" />}
                  {authorization.companyStamp && <img src={authorization.companyStamp} alt="Stamp" className="h-12 object-contain" />}
                </div>
                <p className="text-sm font-medium">{authorization.signatoryName || "Authorized Signatory"}</p>
                {authorization.designation && <p className="text-xs text-muted-foreground">{authorization.designation}</p>}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground italic">This is a computer generated invoice</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
