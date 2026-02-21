"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, FileText, DollarSign, TrendingUp, Clock,
  RefreshCw, AlertCircle, CheckCircle2, Calendar, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { useInvoiceAPI, type StoredInvoice, type AnalyticsData } from "@/hooks/useInvoiceAPI";
import { format, subDays } from "date-fns";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import InvoiceStatusChart from "@/components/dashboard/InvoiceStatusChart";
import TopClientsChart from "@/components/dashboard/TopClientsChart";
import DateRangeFilter, { type DateRange } from "@/components/dashboard/DateRangeFilter";
import InvoiceTable from "@/components/dashboard/InvoiceTable";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabValue = "all" | "pending" | "paid" | "overdue";
type Currency = "INR" | "USD";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (i: StoredInvoice) => i.paymentStatus || i.status || "draft";
const getId = (i: StoredInvoice) => i.id || i._id;

const countByStatus = (invoices: StoredInvoice[], status: TabValue) => {
  if (status === "pending")
    return invoices.filter((i) => ["pending", "sent", "draft"].includes(getStatus(i))).length;
  return invoices.filter((i) => getStatus(i) === status).length;
};

// ─── Quick Metric Card ────────────────────────────────────────────────────────

const MetricCard = ({
  icon: Icon, value, label, color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: "green" | "amber" | "red" | "blue";
}) => {
  const styles = {
    green: { card: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800", icon: "text-green-600", value: "text-green-700 dark:text-green-400", label: "text-green-600 dark:text-green-500" },
    amber: { card: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800", icon: "text-amber-600", value: "text-amber-700 dark:text-amber-400", label: "text-amber-600 dark:text-amber-500" },
    red: { card: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800", icon: "text-red-600", value: "text-red-700 dark:text-red-400", label: "text-red-600 dark:text-red-500" },
    blue: { card: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800", icon: "text-blue-600", value: "text-blue-700 dark:text-blue-400", label: "text-blue-600 dark:text-blue-500" },
  }[color];

  return (
    <Card className={styles.card}>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`w-8 h-8 ${styles.icon}`} />
        <div>
          <p className={`text-2xl font-bold ${styles.value}`}>{value}</p>
          <p className={`text-xs ${styles.label}`}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const { loading, error, fetchInvoices, fetchAnalytics, deleteInvoice, updatePaymentStatus, sendReminder } = useInvoiceAPI();

  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: subDays(new Date(), 30), to: new Date() });
  const [currency] = useState<Currency>("INR");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadData = useCallback(async () => {
    const [invoicesData, analyticsData] = await Promise.all([
      fetchInvoices(),
      fetchAnalytics(
        dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined
      ),
    ]);
    setInvoices(invoicesData);
    if (analyticsData) setAnalytics(analyticsData);
    setIsInitialLoad(false);
  }, [dateRange, fetchInvoices, fetchAnalytics]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    const success = await deleteInvoice(id);
    toast(success ? "Invoice deleted" : "Failed to delete", {
      ...(success ? {} : { style: { background: "red", color: "white" } }),
    });
    if (success) loadData();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const invoice = invoices.find((i) => getId(i) === id);
    const paidAmount = status === "paid" ? invoice?.totals?.grandTotal || 0 : 0;
    const success = await updatePaymentStatus(id, status, paidAmount);
    toast(success ? `Invoice marked as ${status}` : "Failed to update status", {
      ...(success ? {} : { style: { background: "red", color: "white" } }),
    });
    if (success) loadData();
  };

  const handleSendReminder = async (invoice: StoredInvoice) => {
    const success = await sendReminder(invoice);
    toast(success ? "Reminder sent successfully" : "Failed to send reminder", {
      ...(success ? {} : { style: { background: "red", color: "white" } }),
    });
    return success;
  };

  const handleView = (invoice: StoredInvoice) => router.push(`/invoice/${getId(invoice)}?mode=view`);
  const handleEdit = (invoice: StoredInvoice) => router.push(`/invoice/${getId(invoice)}?mode=edit`);

  // ─── Derived Values ──────────────────────────────────────────────────────────

  const filteredInvoices = useMemo(() => {
    if (activeTab === "all") return invoices;
    if (activeTab === "pending") return invoices.filter((i) => ["pending", "sent", "draft"].includes(getStatus(i)));
    return invoices.filter((i) => getStatus(i) === activeTab);
  }, [invoices, activeTab]);

  const avgInvoiceValue = analytics?.totalInvoices ? analytics.totalAmount / analytics.totalInvoices : 0;
  const collectionRate = analytics?.totalAmount ? (analytics.paidAmount / analytics.totalAmount) * 100 : 0;
  const uniqueClients = analytics?.topClients?.length || 0;

  const pendingCount =
    (analytics?.statusCounts?.pending || 0) +
    (analytics?.statusCounts?.sent || 0) +
    (analytics?.statusCounts?.draft || 0);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-start mb-8">
          <div className="flex items-center justify-between gap-3 ">
            <div>
              <h1 className="text-5xl font-semibold mb-2">Manage <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-pink-900">Invoice</span></h1>
              <p className="text-muted-foreground">
                Manage and track all your invoices
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/resources/invoice/new")}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>
        </div>
        {/* Error */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="py-4 text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </CardContent>
          </Card>
        )}


        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isInitialLoad
            ? Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
            : (
              <>
                <StatsCard title="Total Invoices" value={analytics?.totalInvoices || 0} icon={FileText} variant="default" />
                <StatsCard title="Total Amount" value={formatCurrency(analytics?.totalAmount || 0, currency)} icon={DollarSign} variant="default" />
                <StatsCard title="Amount Received" value={formatCurrency(analytics?.paidAmount || 0, currency)} icon={TrendingUp} variant="success" />
                <StatsCard title="Pending Amount" value={formatCurrency(analytics?.pendingAmount || 0, currency)} icon={Clock} variant="warning" />
                <StatsCard title="Avg. Invoice" value={formatCurrency(avgInvoiceValue, currency)} icon={Calendar} variant="default" />
                <StatsCard title="Clients" value={uniqueClients} icon={Users} variant="default" />
              </>
            )}
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard icon={CheckCircle2} value={analytics?.statusCounts?.paid || 0} label="Paid Invoices" color="green" />
          <MetricCard icon={Clock} value={pendingCount} label="Pending" color="amber" />
          <MetricCard icon={AlertCircle} value={analytics?.statusCounts?.overdue || 0} label="Overdue" color="red" />
          <MetricCard icon={TrendingUp} value={`${collectionRate.toFixed(1)}%`} label="Collection Rate" color="blue" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RevenueChart data={analytics?.monthlyBreakdown || []} currency={currency} />
          <InvoiceStatusChart statusCounts={analytics?.statusCounts || {}} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopClientsChart clients={analytics?.topClients || []} currency={currency} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Tax Invoices", value: analytics?.invoicesByType?.tax || 0 },
                { label: "Proforma Invoices", value: analytics?.invoicesByType?.proforma || 0 },
                { label: "Average Value", value: formatCurrency(avgInvoiceValue, currency) },
                { label: "Total Clients", value: uniqueClients },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Collection Rate</span>
                <span className={`font-semibold ${collectionRate >= 80 ? "text-green-600" : collectionRate >= 50 ? "text-amber-600" : "text-red-600"
                  }`}>
                  {collectionRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold">All Invoices</CardTitle>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-auto">
                <TabsList className="h-8">
                  {(["all", "pending", "paid", "overdue"] as TabValue[]).map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="text-xs px-3 capitalize">
                      {tab} ({tab === "all" ? invoices.length : countByStatus(invoices, tab)})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isInitialLoad ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <InvoiceTable
                invoices={filteredInvoices}
                currency={currency}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
                onSendReminder={handleSendReminder}
                pageSize={10}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}