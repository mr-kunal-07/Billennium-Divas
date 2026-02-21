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
import { ShippingDetails, TRANSPORT_MODES, INDIAN_STATES } from "@/hooks/invoice";

interface ShippingSectionProps {
  shipping: ShippingDetails;
  onUpdate: (field: keyof ShippingDetails, value: string | number | boolean) => void;
}

export default function ShippingSection({ shipping, onUpdate }: ShippingSectionProps) {
  if (!shipping.enabled) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Shipping / Transport Details</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="shipping-toggle" className="text-sm text-muted-foreground">
              {shipping.enabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id="shipping-toggle"
              checked={shipping.enabled}
              onCheckedChange={(checked) => onUpdate("enabled", checked)}
            />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Shipping / Transport Details</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="shipping-toggle" className="text-sm text-muted-foreground">
            {shipping.enabled ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id="shipping-toggle"
            checked={shipping.enabled}
            onCheckedChange={(checked) => onUpdate("enabled", checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Shipping Name</Label>
          <Input
            value={shipping.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            placeholder="Recipient Name"
          />
        </div>

        <div>
          <Label>Address Line 1</Label>
          <Input
            value={shipping.addressLine1}
            onChange={(e) => onUpdate("addressLine1", e.target.value)}
            placeholder="Building, Street"
          />
        </div>

        <div>
          <Label>Address Line 2</Label>
          <Input
            value={shipping.addressLine2}
            onChange={(e) => onUpdate("addressLine2", e.target.value)}
            placeholder="Area, Landmark"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>City</Label>
            <Input
              value={shipping.city}
              onChange={(e) => onUpdate("city", e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <Label>State</Label>
            <Select value={shipping.state} onValueChange={(v) => onUpdate("state", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state.code} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pincode</Label>
            <Input
              value={shipping.pincode}
              onChange={(e) => onUpdate("pincode", e.target.value)}
              placeholder="Pincode"
              maxLength={6}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={shipping.country}
              onChange={(e) => onUpdate("country", e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Expected Delivery Date</Label>
            <Input
              type="date"
              value={shipping.deliveryDate}
              onChange={(e) => onUpdate("deliveryDate", e.target.value)}
            />
          </div>
          <div>
            <Label>Transport Mode</Label>
            <Select value={shipping.transportMode} onValueChange={(v) => onUpdate("transportMode", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Freight Charges</Label>
            <Input
              type="number"
              min="0"
              value={shipping.freightCharges || ""}
              onChange={(e) => onUpdate("freightCharges", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Transporter Name</Label>
            <Input
              value={shipping.transporterName}
              onChange={(e) => onUpdate("transporterName", e.target.value)}
              placeholder="Transport Company Name"
            />
          </div>
          <div>
            <Label>Transporter ID</Label>
            <Input
              value={shipping.transporterId}
              onChange={(e) => onUpdate("transporterId", e.target.value)}
              placeholder="Transporter GSTIN"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Vehicle Number</Label>
            <Input
              value={shipping.vehicleNumber}
              onChange={(e) => onUpdate("vehicleNumber", e.target.value.toUpperCase())}
              placeholder="GJ01KH2320"
            />
          </div>
          <div>
            <Label>L.R. No. (Lorry Receipt)</Label>
            <Input
              value={shipping.lrNumber}
              onChange={(e) => onUpdate("lrNumber", e.target.value)}
              placeholder="LR Number"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
