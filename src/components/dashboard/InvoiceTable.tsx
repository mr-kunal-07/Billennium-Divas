import { useState } from "react";
import { Eye, Trash2, Edit, MoreHorizontal, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, Mail, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/currency";
import type { StoredInvoice } from "@/hooks/useInvoiceAPI";

interface InvoiceTableProps {
  invoices: StoredInvoice[];
  currency: "INR" | "USD";
  onView: (invoice: StoredInvoice) => void;
  onEdit: (invoice: StoredInvoice) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onSendReminder: (invoice: StoredInvoice) => Promise<boolean>;
  pageSize?: number;
}

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  sent: { variant: "outline", label: "Sent" },
  pending: { variant: "outline", label: "Pending", className: "border-amber-500 text-amber-600" },
  partial: { variant: "default", label: "Partial", className: "bg-blue-500" },
  paid: { variant: "default", label: "Paid", className: "bg-green-500" },
  overdue: { variant: "destructive", label: "Overdue" },
  cancelled: { variant: "secondary", label: "Cancelled" },
};

export default function InvoiceTable({
  invoices,
  currency,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  onSendReminder,
  pageSize = 10,
}: InvoiceTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const totalPages = Math.ceil(invoices.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInvoices = invoices.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_BADGES[status] || STATUS_BADGES.draft;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleSendReminder = async (invoice: StoredInvoice) => {
    const clientEmail = invoice.buyer?.email || invoice.data?.buyer?.email;
    if (!clientEmail) {
      return;
    }
    
    setSendingReminderId(invoice.id || invoice._id || null);
    try {
      await onSendReminder(invoice);
    } finally {
      setSendingReminderId(null);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasClientEmail = (invoice: StoredInvoice) => {
    return !!(invoice.buyer?.email || invoice.data?.buyer?.email);
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No invoices found. Create your first invoice to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((invoice) => (
              <TableRow key={invoice.id || invoice._id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {invoice.header?.invoiceNumber || invoice.name}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{invoice.buyer?.companyName || "—"}</p>
                    <p className="text-xs text-muted-foreground">{invoice.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {invoice.header?.invoiceType || "tax"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invoice.created_at)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.totals?.grandTotal || 0, currency)}
                </TableCell>
                <TableCell>{getStatusBadge(invoice.paymentStatus || invoice.status || "draft")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(invoice)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(invoice)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleSendReminder(invoice)}
                        disabled={!hasClientEmail(invoice) || sendingReminderId === (invoice.id || invoice._id)}
                      >
                        {sendingReminderId === (invoice.id || invoice._id) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4 text-blue-500" />
                        )}
                        {!hasClientEmail(invoice) ? "No Email" : "Send Reminder"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id || invoice._id || "", "paid")}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id || invoice._id || "", "pending")}>
                        <Clock className="mr-2 h-4 w-4 text-amber-500" /> Mark Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus(invoice.id || invoice._id || "", "overdue")}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Mark Overdue
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(invoice.id || invoice._id || "")}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, invoices.length)} of {invoices.length} invoices
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
