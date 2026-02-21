import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotesSectionProps {
  notes: string;
  termsAndConditions: string;
  taxDisclaimer: string;
  cancellationPolicy: string;
  onUpdate: (field: string, value: string) => void;
}

export default function NotesSection({
  notes,
  termsAndConditions,
  taxDisclaimer,
  cancellationPolicy,
  onUpdate,
}: NotesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notes & Terms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Special Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => onUpdate("notes", e.target.value)}
            placeholder="Additional notes for the customer..."
            rows={2}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Terms & Conditions</Label>
          <Textarea
            value={termsAndConditions}
            onChange={(e) => onUpdate("termsAndConditions", e.target.value)}
            placeholder="Enter terms and conditions..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Tax Disclaimer</Label>
            <Textarea
              value={taxDisclaimer}
              onChange={(e) => onUpdate("taxDisclaimer", e.target.value)}
              placeholder="Tax related notes..."
              rows={2}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Cancellation Policy</Label>
            <Textarea
              value={cancellationPolicy}
              onChange={(e) => onUpdate("cancellationPolicy", e.target.value)}
              placeholder="Cancellation terms..."
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
