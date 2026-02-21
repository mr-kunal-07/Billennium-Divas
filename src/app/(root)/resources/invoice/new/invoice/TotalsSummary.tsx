import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxType } from "@/types/invoice";
import { formatCurrency } from "@/lib/currency";

interface TotalsSummaryProps {
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
  taxType: TaxType;
  currency: "INR" | "USD";
  otherCharges: number;
  roundingAdjustment: number;
  onUpdateCharges: (field: "otherCharges" | "roundingAdjustment", value: number) => void;
  amountInWords: string;
}

export default function TotalsSummary({
  totals,
  taxType,
  currency,
  otherCharges,
  roundingAdjustment,
  onUpdateCharges,
  amountInWords,
}: TotalsSummaryProps) {
  const finalTotal = totals.grandTotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Additional Charges */}
          <div className="space-y-4">
            <div>
              <Label>Other Charges</Label>
              <Input
                type="number"
                min="0"
                value={otherCharges || ""}
                onChange={(e) => onUpdateCharges("otherCharges", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Rounding Adjustment</Label>
              <Input
                type="number"
                step="0.01"
                value={roundingAdjustment || ""}
                onChange={(e) => onUpdateCharges("roundingAdjustment", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          {/* Right: Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxable Amount</span>
              <span className="font-medium">{formatCurrency(totals.subtotal, currency)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Total Discount</span>
                <span>-{formatCurrency(totals.totalDiscount, currency)}</span>
              </div>
            )}
            {taxType === "cgst_sgst" ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total CGST</span>
                  <span>{formatCurrency(totals.totalCGST, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total SGST</span>
                  <span>{formatCurrency(totals.totalSGST, currency)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total IGST</span>
                <span>{formatCurrency(totals.totalIGST, currency)}</span>
              </div>
            )}
            {otherCharges > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other Charges</span>
                <span>{formatCurrency(otherCharges, currency)}</span>
              </div>
            )}
            {roundingAdjustment !== 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rounding</span>
                <span>{formatCurrency(roundingAdjustment, currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t-2 border-border">
              <span className="text-lg font-semibold">Grand Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(finalTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm italic">{amountInWords}</p>
        </div>
      </CardContent>
    </Card>
  );
}
