import { useState, useCallback } from "react";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, query, orderBy, where, Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/firebase";
import type { InvoiceData } from "@/hooks/invoice";
import { calculateTotals } from "@/hooks/invoice";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailTrackingEntry {
  id: string;
  trackingId: string;
  sentAt: string;
  recipientEmail: string;
  subject: string;
  openedAt: string | null;
  openedCount: number;
  status: string;
  userAgent?: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

export interface StoredInvoice {
  id: string;
  _id?: string;
  invoice_number: string;
  invoice_type: string;
  invoice_date: string;
  status: InvoiceStatus;
  buyer_name: string | null;
  buyer_email: string | null;
  total_amount: number;
  currency: string;
  data: InvoiceData;
  created_at: string;
  updated_at: string;
  // Computed/compatibility fields
  name: string;
  totals: { grandTotal: number; totalTax: number; subtotal: number };
  paymentStatus: PaymentStatus;
  paidAmount: number;
  templateId?: string;
  buyer?: { companyName: string; email?: string };
  header?: { invoiceType: string; invoiceNumber: string; invoiceDate?: string };
  seller?: { companyName: string };
  bank?: { bankName?: string; accountNumber?: string; ifscCode?: string };
}

export interface MonthlyBreakdown {
  month: string;
  invoices: number;
  amount: number;
  paid: number;
}

export interface TopClient {
  name: string;
  total: number;
  count: number;
}

export interface AnalyticsData {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  statusCounts: Record<string, number>;
  monthlyBreakdown: MonthlyBreakdown[];
  topClients: TopClient[];
  invoicesByType: { tax: number; proforma: number };
}

export interface EmailPayload {
  clientEmail: string;
  clientName: string;
  sellerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotal: number;
  currency: string;
  paymentDueDate?: string;
  bankDetails?: {
    bankName?: string;
    branchName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    swiftCode?: string;
    upiId?: string;
  };
  customSubject?: string;
  customMessage?: string;
}

export interface InvoiceTotals {
  grandTotal: number;
  totalTax: number;
  subtotal: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_TRACKING = "email_tracking";

const getInvoicesCol = (uid: string) =>
  collection(db, "founders", uid, "invoices");

const getInvoiceDoc = (uid: string, invoiceId: string) =>
  doc(db, "founders", uid, "invoices", invoiceId);

const toISO = (val: unknown): string => {
  if (!val) return "";
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return String(val);
};

const toMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const getCurrentUid = (): string => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.uid;
};

// ─── Transform ────────────────────────────────────────────────────────────────

function transformInvoice(id: string, raw: any): StoredInvoice {
  const data = raw.data as InvoiceData;
  const computed = data
    ? calculateTotals(data.lineItems || [], data.otherCharges || 0, data.roundingAdjustment || 0)
    : { grandTotal: 0, totalTax: 0, subtotal: 0 };

  const grandTotal = Number(raw.total_amount) || computed.grandTotal;

  return {
    ...raw,
    id,
    _id: id,
    created_at: toISO(raw.created_at),
    updated_at: toISO(raw.updated_at),
    name: `Invoice ${raw.invoice_number}`,
    totals: { grandTotal, totalTax: computed.totalTax, subtotal: computed.subtotal },
    paymentStatus: raw.status === "paid" ? "paid" : raw.status === "overdue" ? "overdue" : "pending",
    paidAmount: raw.status === "paid" ? grandTotal : 0,
    templateId: data?.templateId,
    buyer: data?.buyer ? { companyName: data.buyer.companyName, email: data.buyer.email } : undefined,
    header: data?.header ? {
      invoiceType: data.header.invoiceType,
      invoiceNumber: data.header.invoiceNumber,
      invoiceDate: data.header.invoiceDate,
    } : undefined,
    seller: data?.seller ? { companyName: data.seller.companyName } : undefined,
    bank: data?.bank,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInvoiceAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(
    fn: () => Promise<T>,
    fallback: T,
    errorMsg: string
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(toMessage(err, errorMsg));
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * Fetch all invoices for the current user.
   * Path: founders/{uid}/invoices  — ordered by created_at desc.
   * No composite index required (single-field ordering on a subcollection).
   */
  const fetchInvoices = useCallback((): Promise<StoredInvoice[]> =>
    run(async () => {
      const uid = getCurrentUid();
      const q = query(
        getInvoicesCol(uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => transformInvoice(d.id, d.data()));
    }, [], "Failed to fetch invoices"),
  [run]);

  /**
   * Fetch a single invoice by ID.
   * Path: founders/{uid}/invoices/{id}
   */
  const fetchInvoice = useCallback((id: string): Promise<StoredInvoice | null> =>
    run(async () => {
      const uid = getCurrentUid();
      const snap = await getDoc(getInvoiceDoc(uid, id));
      return snap.exists() ? transformInvoice(snap.id, snap.data()) : null;
    }, null, "Failed to fetch invoice"),
  [run]);

  /**
   * Create a new invoice under founders/{uid}/invoices.
   * The user_id field is still stored for any server-side reads or Cloud Functions.
   */
  const createInvoice = useCallback((
    invoiceData: InvoiceData,
    totals: InvoiceTotals
  ): Promise<StoredInvoice | null> =>
    run(async () => {
      const uid = getCurrentUid();
      const now = Timestamp.now();
      const payload = {
        user_id: uid,
        invoice_number: invoiceData.header.invoiceNumber,
        invoice_type: invoiceData.header.invoiceType,
        invoice_date: invoiceData.header.invoiceDate,
        status: "draft",
        buyer_name: invoiceData.buyer.companyName || null,
        buyer_email: invoiceData.buyer.email || null,
        total_amount: totals.grandTotal,
        currency: invoiceData.currency,
        data: JSON.parse(JSON.stringify(invoiceData)),
        created_at: now,
        updated_at: now,
      };
      const ref = await addDoc(getInvoicesCol(uid), payload);
      return transformInvoice(ref.id, payload);
    }, null, "Failed to create invoice"),
  [run]);

  /**
   * Update an existing invoice.
   * Path: founders/{uid}/invoices/{id}
   */
  const updateInvoice = useCallback((
    id: string,
    invoiceData: InvoiceData,
    totals: InvoiceTotals
  ): Promise<StoredInvoice | null> =>
    run(async () => {
      const uid = getCurrentUid();
      const ref = getInvoiceDoc(uid, id);
      const updates = {
        invoice_number: invoiceData.header.invoiceNumber,
        invoice_type: invoiceData.header.invoiceType,
        invoice_date: invoiceData.header.invoiceDate,
        buyer_name: invoiceData.buyer.companyName || null,
        buyer_email: invoiceData.buyer.email || null,
        total_amount: totals.grandTotal,
        currency: invoiceData.currency,
        data: JSON.parse(JSON.stringify(invoiceData)),
        updated_at: Timestamp.now(),
      };
      await updateDoc(ref, updates);
      const snap = await getDoc(ref);
      return snap.exists() ? transformInvoice(snap.id, snap.data()) : null;
    }, null, "Failed to update invoice"),
  [run]);

  /**
   * Delete an invoice.
   * Path: founders/{uid}/invoices/{id}
   */
  const deleteInvoice = useCallback((id: string): Promise<boolean> =>
    run(async () => {
      const uid = getCurrentUid();
      await deleteDoc(getInvoiceDoc(uid, id));
      return true;
    }, false, "Failed to delete invoice"),
  [run]);

  /**
   * Update only the status field of an invoice.
   * Path: founders/{uid}/invoices/{id}
   */
  const updatePaymentStatus = useCallback((
    id: string,
    status: string,
    _paidAmount: number
  ): Promise<boolean> =>
    run(async () => {
      const uid = getCurrentUid();
      await updateDoc(getInvoiceDoc(uid, id), {
        status,
        updated_at: Timestamp.now(),
      });
      return true;
    }, false, "Failed to update payment status"),
  [run]);

  // ─── Analytics ─────────────────────────────────────────────────────────────

  /**
   * Fetch aggregated analytics for the current user's invoices.
   * Reads from founders/{uid}/invoices — no cross-user query, no composite index needed.
   */
  const fetchAnalytics = useCallback((
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData | null> =>
    run(async () => {
      const uid = getCurrentUid();
      let q = query(
        getInvoicesCol(uid),
        orderBy("invoice_date", "asc")
      );
      if (startDate) q = query(q, where("invoice_date", ">=", startDate));
      if (endDate)   q = query(q, where("invoice_date", "<=", endDate));

      const snap = await getDocs(q);
      const invoices = snap.docs.map((d) => transformInvoice(d.id, d.data()));

      const totalAmount = invoices.reduce((s, i) => s + i.totals.grandTotal, 0);
      const paidAmount  = invoices
        .filter((i) => i.status === "paid")
        .reduce((s, i) => s + i.totals.grandTotal, 0);

      // Status counts
      const statusCounts = invoices.reduce<Record<string, number>>((acc, i) => {
        const s = i.status || "draft";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

      // Monthly breakdown
      const monthlyMap = new Map<string, MonthlyBreakdown>();
      invoices.forEach((i) => {
        const d = new Date(i.invoice_date || i.created_at);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthlyMap.get(month) ?? { month, invoices: 0, amount: 0, paid: 0 };
        entry.invoices += 1;
        entry.amount   += i.totals.grandTotal;
        if (i.status === "paid") entry.paid += i.totals.grandTotal;
        monthlyMap.set(month, entry);
      });
      const monthlyBreakdown = [...monthlyMap.values()].sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      // Top clients
      const clientMap = new Map<string, { total: number; count: number }>();
      invoices.forEach((i) => {
        const name  = i.buyer_name || i.buyer?.companyName || "Unknown";
        const entry = clientMap.get(name) ?? { total: 0, count: 0 };
        entry.total += i.totals.grandTotal;
        entry.count += 1;
        clientMap.set(name, entry);
      });
      const topClients = [...clientMap.entries()]
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      return {
        totalInvoices: invoices.length,
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount,
        statusCounts,
        monthlyBreakdown,
        topClients,
        invoicesByType: {
          tax:      invoices.filter((i) => i.invoice_type === "tax").length,
          proforma: invoices.filter((i) => i.invoice_type === "proforma").length,
        },
      };
    }, null, "Failed to fetch analytics"),
  [run]);

  // ─── Email ─────────────────────────────────────────────────────────────────

  const sendInvoiceEmail = useCallback(
    (
      invoiceId: string | undefined,
      payload: EmailPayload
    ): Promise<{ success: boolean; trackingId?: string }> =>
      run<{ success: boolean; trackingId?: string }>(
        async () => {
          const sendEmail = httpsCallable(getFunctions(), "sendInvoiceEmail");
          const result = await sendEmail({ invoiceId, ...payload });
          const data = result.data as any;

          if (!data?.success)
            throw new Error(data?.error || "Failed to send email");

          return { success: true, trackingId: data?.trackingId };
        },
        { success: false },
        "Failed to send email"
      ),
    [run]
  );

  const fetchEmailTracking = useCallback((invoiceId: string): Promise<EmailTrackingEntry[]> =>
    run(async () => {
      const q = query(
        collection(db, EMAIL_TRACKING),
        where("invoice_id", "==", invoiceId),
        orderBy("sent_at", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d): EmailTrackingEntry => {
        const e = d.data();
        return {
          id: d.id,
          trackingId: d.id,
          sentAt: toISO(e.sent_at),
          recipientEmail: e.recipient_email,
          subject: "Invoice",
          openedAt: e.opened_at ? toISO(e.opened_at) : null,
          openedCount: e.opened_count || 0,
          status: e.status || "sent",
        };
      });
    }, [], "Failed to fetch tracking data"),
  [run]);

  const sendReminder = useCallback((invoice: StoredInvoice): Promise<boolean> =>
    run(async () => {
      const result = await sendInvoiceEmail(invoice.id || invoice._id, {
        clientEmail: invoice.buyer?.email || invoice.data?.buyer?.email || "",
        clientName: invoice.buyer?.companyName || invoice.data?.buyer?.companyName || "Customer",
        sellerName: invoice.seller?.companyName || invoice.data?.seller?.companyName || "Seller",
        invoiceNumber: invoice.header?.invoiceNumber || invoice.data?.header?.invoiceNumber || "N/A",
        invoiceDate: invoice.header?.invoiceDate || invoice.data?.header?.invoiceDate || "",
        grandTotal: invoice.totals.grandTotal,
        currency: invoice.data?.currency || "INR",
        paymentDueDate: invoice.data?.paymentDueDate,
        bankDetails: invoice.bank || invoice.data?.bank,
      });
      if (!result.success) throw new Error("Reminder failed");
      return true;
    }, false, "Failed to send reminder"),
  [run, sendInvoiceEmail]);

  return {
    loading,
    error,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updatePaymentStatus,
    fetchAnalytics,
    sendInvoiceEmail,
    fetchEmailTracking,
    sendReminder,
  };
}