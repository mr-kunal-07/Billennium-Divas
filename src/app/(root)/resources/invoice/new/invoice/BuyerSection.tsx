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
import { BuyerDetails, INDIAN_STATES } from "@/hooks/invoice";

interface BuyerSectionProps {
  buyer: BuyerDetails;
  onUpdate: (field: keyof BuyerDetails, value: string) => void;
}

export default function BuyerSection({ buyer, onUpdate }: BuyerSectionProps) {
  const handleStateChange = (stateName: string) => {
    const state = INDIAN_STATES.find(s => s.name === stateName);
    onUpdate("state", stateName);
    if (state) {
      onUpdate("stateCode", state.code);
    }
  };

  const handlePlaceOfSupplyChange = (stateName: string) => {
    const state = INDIAN_STATES.find(s => s.name === stateName);
    onUpdate("placeOfSupply", state ? `${stateName} (${state.code})` : stateName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Buyer / Customer Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Company Name *</Label>
            <Input
              value={buyer.companyName}
              onChange={(e) => onUpdate("companyName", e.target.value)}
              placeholder="Client Company Name"
            />
          </div>
          <div>
            <Label>Trade Name</Label>
            <Input
              value={buyer.tradeName}
              onChange={(e) => onUpdate("tradeName", e.target.value)}
              placeholder="Trade/Brand Name"
            />
          </div>
        </div>

        <div>
          <Label>Address Line 1 *</Label>
          <Input
            value={buyer.addressLine1}
            onChange={(e) => onUpdate("addressLine1", e.target.value)}
            placeholder="Building, Street"
          />
        </div>

        <div>
          <Label>Address Line 2</Label>
          <Input
            value={buyer.addressLine2}
            onChange={(e) => onUpdate("addressLine2", e.target.value)}
            placeholder="Area, Landmark"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>City *</Label>
            <Input
              value={buyer.city}
              onChange={(e) => onUpdate("city", e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <Label>State *</Label>
            <Select value={buyer.state} onValueChange={handleStateChange}>
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
            <Label>Pincode *</Label>
            <Input
              value={buyer.pincode}
              onChange={(e) => onUpdate("pincode", e.target.value)}
              placeholder="Pincode"
              maxLength={6}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={buyer.country}
              onChange={(e) => onUpdate("country", e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Contact Person</Label>
            <Input
              value={buyer.contactPerson}
              onChange={(e) => onUpdate("contactPerson", e.target.value)}
              placeholder="Contact Person Name"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={buyer.phone}
              onChange={(e) => onUpdate("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={buyer.email}
              onChange={(e) => onUpdate("email", e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input
              value={buyer.gstin}
              onChange={(e) => onUpdate("gstin", e.target.value.toUpperCase())}
              placeholder="Client GST Number"
              maxLength={15}
            />
          </div>
        </div>

        <div>
          <Label>Place of Supply *</Label>
          <Select 
            value={buyer.placeOfSupply?.split(" (")[0] || ""} 
            onValueChange={handlePlaceOfSupplyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state.code} value={state.name}>
                  {state.name} ({state.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
