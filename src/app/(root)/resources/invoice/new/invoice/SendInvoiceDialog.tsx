import { useState, useEffect } from "react";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMAIL_TEMPLATES, getTemplateById, replacePlaceholders } from "@/lib/emailTemplates";
import { formatCurrency } from "@/lib/currency";

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (subject: string, message: string) => Promise<boolean>;
  isSending: boolean;
  clientEmail: string;
  clientName: string;
  sellerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: "INR" | "USD";
}

export default function SendInvoiceDialog({
  open,
  onOpenChange,
  onSend,
  isSending,
  clientEmail,
  clientName,
  sellerName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  amount,
  currency,
}: SendInvoiceDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const placeholderData = {
    invoiceNumber: invoiceNumber || "N/A",
    clientName: clientName || "Customer",
    sellerName: sellerName || "Seller",
    amount: formatCurrency(amount, currency),
    invoiceDate: formatDate(invoiceDate),
    dueDate: formatDate(dueDate),
  };

  useEffect(() => {
    const template = getTemplateById(selectedTemplate);
    if (template.id !== "custom") {
      setSubject(replacePlaceholders(template.subject, placeholderData));
      setMessage(replacePlaceholders(template.message, placeholderData));
    }
  }, [selectedTemplate, invoiceNumber, clientName, sellerName, amount, invoiceDate, dueDate]);

  const handleSend = async () => {
    const success = await onSend(subject.trim(), message.trim());
    if (success) {
      onOpenChange(false);
    }
  };

  const isValid = subject.trim().length > 0 && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Invoice
          </DialogTitle>
          <DialogDescription>
            Opens your email client to send to <strong>{clientEmail}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selector */}
          <div>
            <Label>Email Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="mt-1"
              maxLength={200}
            />
          </div>

          {/* Message */}
          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="mt-1 min-h-[200px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/2000 characters
            </p>
          </div>

          {/* Placeholders Help */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Available placeholders:</p>
            <p className="font-mono">
              {"{clientName}"}, {"{sellerName}"}, {"{invoiceNumber}"}, {"{amount}"}, {"{invoiceDate}"}, {"{dueDate}"}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button variant='outline' onClick={handleSend} disabled={isSending || !isValid}>
            <Send className="w-4 h-4 mr-2" />
            Open Email Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
