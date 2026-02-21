import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankDetails } from "@/types/invoice";

interface BankSectionProps {
  bank: BankDetails;
  onUpdate: (field: keyof BankDetails, value: string) => void;
}

export default function BankSection({ bank, onUpdate }: BankSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bank Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Bank Name</Label>
            <Input
              value={bank.bankName}
              onChange={(e) => onUpdate("bankName", e.target.value)}
              placeholder="State Bank of India"
            />
          </div>
          <div>
            <Label>Branch Name</Label>
            <Input
              value={bank.branchName}
              onChange={(e) => onUpdate("branchName", e.target.value)}
              placeholder="Main Branch"
            />
          </div>
        </div>

        <div>
          <Label>Account Holder Name</Label>
          <Input
            value={bank.accountHolderName}
            onChange={(e) => onUpdate("accountHolderName", e.target.value)}
            placeholder="Account Holder Name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Account Number</Label>
            <Input
              value={bank.accountNumber}
              onChange={(e) => onUpdate("accountNumber", e.target.value)}
              placeholder="Account Number"
            />
          </div>
          <div>
            <Label>IFSC Code</Label>
            <Input
              value={bank.ifscCode}
              onChange={(e) => onUpdate("ifscCode", e.target.value.toUpperCase())}
              placeholder="SBIN0000123"
              maxLength={11}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>SWIFT Code (International)</Label>
            <Input
              value={bank.swiftCode}
              onChange={(e) => onUpdate("swiftCode", e.target.value.toUpperCase())}
              placeholder="SBININBB"
            />
          </div>
          <div>
            <Label>UPI ID</Label>
            <Input
              value={bank.upiId}
              onChange={(e) => onUpdate("upiId", e.target.value)}
              placeholder="company@upi"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
