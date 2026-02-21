import { useState, useEffect } from "react";
import { Mail, Eye, Clock, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useInvoiceAPI, type EmailTrackingEntry } from "@/hooks/useInvoiceAPI";

interface EmailTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
}

export default function EmailTrackingDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
}: EmailTrackingDialogProps) {
  const { fetchEmailTracking, loading } = useInvoiceAPI();
  const [tracking, setTracking] = useState<EmailTrackingEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTracking = async () => {
    setRefreshing(true);
    const data = await fetchEmailTracking(invoiceId);
    setTracking(data);
    setRefreshing(false);
  };

  useEffect(() => {
    if (open && invoiceId) {
      loadTracking();
    }
  }, [open, invoiceId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Tracking
          </DialogTitle>
          <DialogDescription>
            Track delivery and opens for Invoice #{invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTracking}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {tracking.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No emails sent yet</p>
            <p className="text-sm">Send an invoice to see tracking data</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {tracking.map((entry, index) => (
              <div
                key={entry.trackingId || index}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate flex-1">
                    {entry.recipientEmail}
                  </span>
                  {entry.openedAt ? (
                    <Badge variant="default" className="bg-green-600">
                      <Eye className="w-3 h-3 mr-1" />
                      Opened
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Sent
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-1">
                  {entry.subject}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    Sent: {formatDate(entry.sentAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.openedAt ? (
                      <>
                        <Eye className="w-3 h-3 text-blue-500" />
                        Opened: {formatDate(entry.openedAt)}
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-gray-400" />
                        Not opened yet
                      </>
                    )}
                  </div>
                </div>

{(entry.openedCount ?? 0) > 0 && (
  <p className="text-xs text-muted-foreground">
    Opened {entry.openedCount ?? 0} time
    {(entry.openedCount ?? 0) > 1 ? "s" : ""}
  </p>
)}

                {entry.userAgent && (
                  <p className="text-xs text-muted-foreground truncate">
                    Client: {entry.userAgent.substring(0, 50)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
