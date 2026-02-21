import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItem, UNITS, TaxType, calculateLineItem } from "@/hooks/invoice";
import { formatCurrency } from "@/lib/currency";

interface LineItemsSectionProps {
  items: LineItem[];
  taxType: TaxType;
  currency: "INR" | "USD";
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<LineItem>) => void;
}

export default function LineItemsSection({
  items,
  taxType,
  currency,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: LineItemsSectionProps) {
  const handleFieldChange = (id: string, field: keyof LineItem, value: string | number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updatedItem = { ...item, [field]: value };
    const calculated = calculateLineItem(updatedItem, taxType);
    onUpdateItem(id, calculated);
  };

  const handleTaxRateChange = (id: string, rate: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    let updatedItem: LineItem;
    if (taxType === "cgst_sgst") {
      const halfRate = rate / 2;
      updatedItem = { ...item, cgstPercent: halfRate, sgstPercent: halfRate, igstPercent: 0 };
    } else {
      updatedItem = { ...item, igstPercent: rate, cgstPercent: 0, sgstPercent: 0 };
    }
    const calculated = calculateLineItem(updatedItem, taxType);
    onUpdateItem(id, calculated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Items / Services</CardTitle>
        <Button onClick={onAddItem} variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={items.length === 1}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={item.itemName}
                    onChange={(e) => handleFieldChange(item.id, "itemName", e.target.value)}
                    placeholder="Product/Service Name"
                  />
                </div>
                <div>
                  <Label>HSN/SAC Code</Label>
                  <Input
                    value={item.hsnSacCode}
                    onChange={(e) => handleFieldChange(item.id, "hsnSacCode", e.target.value)}
                    placeholder="8 digit code"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => handleFieldChange(item.id, "description", e.target.value)}
                  placeholder="Additional details..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label>Qty *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleFieldChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={item.unit} onValueChange={(v) => handleFieldChange(item.id, "unit", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rate *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleFieldChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discountValue}
                    onChange={(e) => handleFieldChange(item.id, "discountValue", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>GST Rate (%)</Label>
                  <Select 
                    value={String(taxType === "cgst_sgst" ? item.cgstPercent * 2 : item.igstPercent)} 
                    onValueChange={(v) => handleTaxRateChange(item.id, parseFloat(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border text-sm">
                <div>
                  <span className="text-muted-foreground">Taxable Value:</span>
                  <p className="font-medium">{formatCurrency(item.taxableValue, currency)}</p>
                </div>
                {taxType === "cgst_sgst" ? (
                  <>
                    <div>
                      <span className="text-muted-foreground">CGST ({item.cgstPercent}%):</span>
                      <p className="font-medium">{formatCurrency(item.cgstAmount, currency)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SGST ({item.sgstPercent}%):</span>
                      <p className="font-medium">{formatCurrency(item.sgstAmount, currency)}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-muted-foreground">IGST ({item.igstPercent}%):</span>
                    <p className="font-medium">{formatCurrency(item.igstAmount, currency)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-semibold text-primary">{formatCurrency(item.totalAmount, currency)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
