import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthorizationDetails } from "./invoice";

interface AuthorizationSectionProps {
  auth: AuthorizationDetails;
  onUpdate: (field: keyof AuthorizationDetails, value: string) => void;
  onSignatureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStampUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AuthorizationSection({ 
  auth, 
  onUpdate, 
  onSignatureUpload,
  onStampUpload,
}: AuthorizationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Authorization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Signatory Name</Label>
            <Input
              value={auth.signatoryName}
              onChange={(e) => onUpdate("signatoryName", e.target.value)}
              placeholder="Authorized Person Name"
            />
          </div>
          <div>
            <Label>Designation</Label>
            <Input
              value={auth.designation}
              onChange={(e) => onUpdate("designation", e.target.value)}
              placeholder="Director / Manager"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Place of Issue</Label>
            <Input
              value={auth.placeOfIssue}
              onChange={(e) => onUpdate("placeOfIssue", e.target.value)}
              placeholder="City, State"
            />
          </div>
          <div>
            <Label>Date of Authorization</Label>
            <Input
              type="date"
              value={auth.dateOfAuthorization}
              onChange={(e) => onUpdate("dateOfAuthorization", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Declaration</Label>
          <Textarea
            value={auth.declaration}
            onChange={(e) => onUpdate("declaration", e.target.value)}
            placeholder="Certification statement..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signature */}
          <div className="space-y-2">
            <Label>Authorized Signature</Label>
            <div className="flex items-center gap-4">
              {auth.signature ? (
                <img
                  src={auth.signature}
                  alt="Signature"
                  className="h-16 object-contain border rounded-lg bg-white p-2"
                />
              ) : (
                <div className="h-16 w-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                  Signature
                </div>
              )}
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={onSignatureUpload} className="max-w-[180px]" />
              </div>
            </div>
            {auth.signature && (
              <Button variant="outline" size="sm" onClick={() => onUpdate("signature", "")}>
                Remove
              </Button>
            )}
          </div>

          {/* Company Stamp */}
          <div className="space-y-2">
            <Label>Company Stamp</Label>
            <div className="flex items-center gap-4">
              {auth.companyStamp ? (
                <img
                  src={auth.companyStamp}
                  alt="Stamp"
                  className="h-16 object-contain border rounded-lg bg-white p-2"
                />
              ) : (
                <div className="h-16 w-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                  Stamp
                </div>
              )}
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={onStampUpload} className="max-w-[180px]" />
              </div>
            </div>
            {auth.companyStamp && (
              <Button variant="outline" size="sm" onClick={() => onUpdate("companyStamp", "")}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
