"use client";
import { useEffect } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "./InvoiceBuilder";
import { formatCurrency } from "@/lib/currency";
import { getPaletteById } from "@/lib/colorPalettes";

interface InvoicePreviewProps {
    data: InvoiceData;
    subtotal: number;
    taxAmount: number;
    total: number;
    onBack: () => void;
}

export default function InvoicePreview({
    data,
    subtotal,
    taxAmount,
    total,
    onBack,
}: InvoicePreviewProps) {
    // Apply color palette
    useEffect(() => {
        const palette = getPaletteById(data.colorPalette);
        document.documentElement.style.setProperty("--primary", palette.primary);
        document.documentElement.style.setProperty("--ring", palette.primary);
    }, [data.colorPalette]);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const locale = data.currency === "INR" ? "en-IN" : "en-US";
        return new Date(dateString).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const palette = getPaletteById(data.colorPalette);

    return (
        <div className="min-h-screen bg-muted py-8 px-4 print:bg-white print:py-0">
            {/* Controls - Hidden when printing */}
            <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="max-w-3xl mx-auto bg-card shadow-invoice rounded-lg print:shadow-none print:rounded-none">
                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-4">
                            {data.companyLogo ? (
                                <img
                                    src={data.companyLogo}
                                    alt="Company Logo"
                                    className="w-16 h-16 object-contain"
                                />
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `hsl(${palette.primary} / 0.1)` }}
                                >
                                    <span
                                        className="text-2xl font-bold"
                                        style={{ color: `hsl(${palette.primary})` }}
                                    >
                                        {data.companyName?.charAt(0) || "C"}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    {data.companyName || "Your Company"}
                                </h1>
                                {data.companyEmail && (
                                    <p className="text-sm text-muted-foreground">{data.companyEmail}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <h2
                                className="text-3xl font-bold mb-2"
                                style={{ color: `hsl(${palette.primary})` }}
                            >
                                INVOICE
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                #{data.invoiceNumber || "INV-001"}
                            </p>
                        </div>
                    </div>

                    {/* Addresses & Dates */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                From
                            </h3>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{data.companyName || "Your Company"}</p>
                                {data.companyEmail && <p className="text-muted-foreground">{data.companyEmail}</p>}
                                {data.companyPhone && <p className="text-muted-foreground">{data.companyPhone}</p>}
                                {data.companyAddress && (
                                    <p className="text-muted-foreground whitespace-pre-line">{data.companyAddress}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Bill To
                            </h3>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{data.clientName || "Client Name"}</p>
                                {data.clientEmail && <p className="text-muted-foreground">{data.clientEmail}</p>}
                                {data.clientPhone && <p className="text-muted-foreground">{data.clientPhone}</p>}
                                {data.clientAddress && (
                                    <p className="text-muted-foreground whitespace-pre-line">{data.clientAddress}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right md:text-left">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        Invoice Date
                                    </h3>
                                    <p className="text-sm">{formatDate(data.invoiceDate)}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        Due Date
                                    </h3>
                                    <p
                                        className="text-sm font-medium"
                                        style={{ color: `hsl(${palette.primary})` }}
                                    >
                                        {formatDate(data.dueDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-border">
                                    <th className="text-left py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="text-center py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                                        Qty
                                    </th>
                                    <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                                        Rate
                                    </th>
                                    <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lineItems.map((item, index) => (
                                    <tr key={item.id} className={index < data.lineItems.length - 1 ? "border-b border-border" : ""}>
                                        <td className="py-4 text-sm">{item.description || "—"}</td>
                                        <td className="py-4 text-sm text-center">{item.quantity}</td>
                                        <td className="py-4 text-sm text-right">
                                            {formatCurrency(item.rate, data.currency)}
                                        </td>
                                        <td className="py-4 text-sm text-right font-medium">
                                            {formatCurrency(item.quantity * item.rate, data.currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(subtotal, data.currency)}</span>
                            </div>
                            {data.taxRate > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                                    <span>{formatCurrency(taxAmount, data.currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t-2 border-border">
                                <span className="text-lg font-semibold">Total</span>
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: `hsl(${palette.primary})` }}
                                >
                                    {formatCurrency(total, data.currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {data.notes && (
                        <div className="border-t border-border pt-8">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Notes / Terms
                            </h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{data.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            Thank you for your business!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
