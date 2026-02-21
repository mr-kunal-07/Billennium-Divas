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
import { SellerDetails, INDIAN_STATES } from "@/hooks/invoice";

interface SellerSectionProps {
  seller: SellerDetails;
  onUpdate: (field: keyof SellerDetails, value: string) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SellerSection({ seller, onUpdate, onLogoUpload }: SellerSectionProps) {
  const handleStateChange = (stateName: string) => {
    const state = INDIAN_STATES.find(s => s.name === stateName);
    onUpdate("state", stateName);
    if (state) {
      onUpdate("stateCode", state.code);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seller / Company Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo */}
        <div>
          <Label>Company Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            {seller.logo ? (
              <img src={seller.logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                Logo
              </div>
            )}
            <Input type="file" accept="image/*" onChange={onLogoUpload} className="max-w-[200px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Company Name *</Label>
            <Input
              value={seller.companyName}
              onChange={(e) => onUpdate("companyName", e.target.value)}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label>Trade Name</Label>
            <Input
              value={seller.tradeName}
              onChange={(e) => onUpdate("tradeName", e.target.value)}
              placeholder="Trade/Brand Name"
            />
          </div>
        </div>

        <div>
          <Label>Address Line 1 *</Label>
          <Input
            value={seller.addressLine1}
            onChange={(e) => onUpdate("addressLine1", e.target.value)}
            placeholder="Building, Street"
          />
        </div>

        <div>
          <Label>Address Line 2</Label>
          <Input
            value={seller.addressLine2}
            onChange={(e) => onUpdate("addressLine2", e.target.value)}
            placeholder="Area, Landmark"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>City *</Label>
            <Input
              value={seller.city}
              onChange={(e) => onUpdate("city", e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <Label>State *</Label>
            <Select value={seller.state} onValueChange={handleStateChange}>
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
              value={seller.pincode}
              onChange={(e) => onUpdate("pincode", e.target.value)}
              placeholder="Pincode"
              maxLength={6}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={seller.country}
              onChange={(e) => onUpdate("country", e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Phone *</Label>
            <Input
              value={seller.phone}
              onChange={(e) => onUpdate("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={seller.email}
              onChange={(e) => onUpdate("email", e.target.value)}
              placeholder="company@example.com"
            />
          </div>
        </div>

        <div>
          <Label>Website</Label>
          <Input
            value={seller.website}
            onChange={(e) => onUpdate("website", e.target.value)}
            placeholder="www.example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>GSTIN *</Label>
            <Input
              value={seller.gstin}
              onChange={(e) => onUpdate("gstin", e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>
          <div>
            <Label>PAN</Label>
            <Input
              value={seller.pan}
              onChange={(e) => onUpdate("pan", e.target.value.toUpperCase())}
              placeholder="AAAAA0000A"
              maxLength={10}
            />
          </div>
          <div>
            <Label>CIN</Label>
            <Input
              value={seller.cin}
              onChange={(e) => onUpdate("cin", e.target.value.toUpperCase())}
              placeholder="Company CIN"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
