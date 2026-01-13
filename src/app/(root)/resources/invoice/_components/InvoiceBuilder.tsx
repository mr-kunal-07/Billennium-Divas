"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, Save, FolderOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import InvoicePreview from "./InvoicePreview";
import { useInvoiceStorage, SavedInvoice } from "@/hooks/useInvoiceStorage";
import { CurrencyCode, CURRENCIES, formatCurrency } from "@/lib/currency";
import { COLOR_PALETTES, getPaletteById } from "@/lib/colorPalettes";
import { toast } from "sonner";

export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
}

export interface InvoiceData {
    // Company Info
    companyLogo: string;
    companyName: string;
    companyEmail: string;
    companyAddress: string;
    companyPhone: string;

    // Client Info
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    clientPhone: string;

    // Invoice Details
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;

    // Items
    lineItems: LineItem[];

    // Additional
    taxRate: number;
    notes: string;

    // Settings
    currency: CurrencyCode;
    colorPalette: string;
}

const initialInvoiceData: InvoiceData = {
    companyLogo: "",
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyPhone: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientPhone: "",
    invoiceNumber: "INV-001",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    lineItems: [{ id: "1", description: "", quantity: 1, rate: 0 }],
    taxRate: 0,
    notes: "",
    currency: "USD",
    colorPalette: "blue",
};

export default function InvoiceBuilder() {
    const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceData);
    const [showPreview, setShowPreview] = useState(false);
    const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [invoiceName, setInvoiceName] = useState("");

    const { savedInvoices, saveInvoice, updateInvoice, deleteInvoice, loadInvoice } = useInvoiceStorage();

    // Apply color palette as CSS variables
    useEffect(() => {
        const palette = getPaletteById(invoiceData.colorPalette);
        document.documentElement.style.setProperty("--primary", palette.primary);
        document.documentElement.style.setProperty("--ring", palette.primary);

        return () => {
            // Reset to default on unmount
            document.documentElement.style.setProperty("--primary", "217 91% 50%");
            document.documentElement.style.setProperty("--ring", "217 91% 50%");
        };
    }, [invoiceData.colorPalette]);

    const updateField = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
        setInvoiceData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateField("companyLogo", reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            description: "",
            quantity: 1,
            rate: 0,
        };
        updateField("lineItems", [...invoiceData.lineItems, newItem]);
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        const updatedItems = invoiceData.lineItems.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateField("lineItems", updatedItems);
    };

    const removeLineItem = (id: string) => {
        if (invoiceData.lineItems.length > 1) {
            updateField("lineItems", invoiceData.lineItems.filter((item) => item.id !== id));
        }
    };

    const handleSave = () => {
        if (!invoiceName.trim()) {
            toast.warning("Name required", {
                description: "Please enter a name for this invoice.",
            });
            return;
        }

        if (currentInvoiceId) {
            updateInvoice(currentInvoiceId, invoiceName, invoiceData);
            toast.warning("Invoice updated", {
                description: `"${invoiceName}" has been updated.`
            })
        } else {
            const id = saveInvoice(invoiceName, invoiceData);
            setCurrentInvoiceId(id);
            toast.success("Invoice saved", {
                description: `"${invoiceName}" has been saved.`
            })
        }
        setSaveDialogOpen(false);
    };

    const handleLoad = (invoice: SavedInvoice) => {
        setInvoiceData(invoice.data);
        setCurrentInvoiceId(invoice.id);
        setInvoiceName(invoice.name);
        setLoadDialogOpen(false);
        toast.warning("Invoice loaded", {
            description: `"${invoice.name}" has been loaded.`
        })
    };

    const handleDelete = (id: string, name: string) => {
        deleteInvoice(id);
        if (currentInvoiceId === id) {
            setCurrentInvoiceId(null);
            setInvoiceName("");
        }
        toast.warning("Invoice deleted", {
            description: `"${name}" has been removed.`
        })
    };

    const handleNewInvoice = () => {
        setInvoiceData(initialInvoiceData);
        setCurrentInvoiceId(null);
        setInvoiceName("");
        toast("New invoice", {
            description: "Started a fresh invoice.",
        });
    };

    const subtotal = invoiceData.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0
    );
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + taxAmount;

    const currentPalette = getPaletteById(invoiceData.colorPalette);

    if (showPreview) {
        return (
            <InvoicePreview
                data={invoiceData}
                subtotal={subtotal}
                taxAmount={taxAmount}
                total={total}
                onBack={() => setShowPreview(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background py-5 px-2">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-5xl font-semibold ">Invoice <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-pink-900">Builder</span></h1>
                        <p className="text-muted-foreground">
                            {currentInvoiceId ? `Editing: ${invoiceName}` : "Create professional invoices in minutes"}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleNewInvoice} size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            New
                        </Button>

                        {/* Save Dialog */}
                        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setInvoiceName(invoiceName || `Invoice ${invoiceData.invoiceNumber}`)}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{currentInvoiceId ? "Update Invoice" : "Save Invoice"}</DialogTitle>
                                    <DialogDescription>
                                        Give your invoice a name to save it for later.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="invoice-name">Invoice Name</Label>
                                    <Input
                                        id="invoice-name"
                                        value={invoiceName}
                                        onChange={(e) => setInvoiceName(e.target.value)}
                                        placeholder="e.g., Client ABC - January 2024"
                                        className="mt-2"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="outline" onClick={handleSave}>
                                        {currentInvoiceId ? "Update" : "Save"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Load Dialog */}
                        <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                    Load
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Load Invoice</DialogTitle>
                                    <DialogDescription>
                                        Select a saved invoice to continue editing.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 max-h-[300px] overflow-y-auto">
                                    {savedInvoices.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            No saved invoices yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {savedInvoices.map((invoice) => (
                                                <div
                                                    key={invoice.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                                >
                                                    <button
                                                        onClick={() => handleLoad(invoice)}
                                                        className="flex-1 text-left"
                                                    >
                                                        <p className="font-medium">{invoice.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Saved {new Date(invoice.savedAt).toLocaleDateString()}
                                                        </p>
                                                    </button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(invoice.id, invoice.name)}
                                                        className="text-muted-foreground hover:text-destructive ml-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" onClick={() => setShowPreview(true)} size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Settings Row - Currency & Color */}
                    <Card className="invoice-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Invoice Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Currency Selection */}
                                <div>
                                    <Label>Currency</Label>
                                    <Select
                                        value={invoiceData.currency}
                                        onValueChange={(value: CurrencyCode) => updateField("currency", value)}
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(CURRENCIES).map((currency) => (
                                                <SelectItem key={currency.code} value={currency.code}>
                                                    {currency.symbol} {currency.name} ({currency.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Color Palette Selection */}
                                <div>
                                    <Label>Invoice Color Theme</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {COLOR_PALETTES.map((palette) => (
                                            <button
                                                key={palette.id}
                                                onClick={() => updateField("colorPalette", palette.id)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${invoiceData.colorPalette === palette.id
                                                    ? "border-foreground scale-110 shadow-md"
                                                    : "border-transparent hover:scale-105"
                                                    }`}
                                                style={{ backgroundColor: `hsl(${palette.primary})` }}
                                                title={palette.name}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Selected: {currentPalette.name}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company & Client Info Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Company Info */}
                        <Card className="invoice-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Your Company</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="logo">Company Logo</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {invoiceData.companyLogo ? (
                                            <img
                                                src={invoiceData.companyLogo}
                                                alt="Company Logo"
                                                className="w-16 h-16 object-contain rounded-lg border border-border"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                                                Logo
                                            </div>
                                        )}
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="max-w-[200px]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={invoiceData.companyName}
                                        onChange={(e) => updateField("companyName", e.target.value)}
                                        placeholder="Your Company Name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyEmail">Email</Label>
                                    <Input
                                        id="companyEmail"
                                        type="email"
                                        value={invoiceData.companyEmail}
                                        onChange={(e) => updateField("companyEmail", e.target.value)}
                                        placeholder="company@example.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyPhone">Phone</Label>
                                    <Input
                                        id="companyPhone"
                                        value={invoiceData.companyPhone}
                                        onChange={(e) => updateField("companyPhone", e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyAddress">Address</Label>
                                    <Textarea
                                        id="companyAddress"
                                        value={invoiceData.companyAddress}
                                        onChange={(e) => updateField("companyAddress", e.target.value)}
                                        placeholder="123 Business St, City, State 12345"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Client Info */}
                        <Card className="invoice-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Bill To</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="clientName">Client Name</Label>
                                    <Input
                                        id="clientName"
                                        value={invoiceData.clientName}
                                        onChange={(e) => updateField("clientName", e.target.value)}
                                        placeholder="Client Company Name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="clientEmail">Email</Label>
                                    <Input
                                        id="clientEmail"
                                        type="email"
                                        value={invoiceData.clientEmail}
                                        onChange={(e) => updateField("clientEmail", e.target.value)}
                                        placeholder="client@example.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="clientPhone">Phone</Label>
                                    <Input
                                        id="clientPhone"
                                        value={invoiceData.clientPhone}
                                        onChange={(e) => updateField("clientPhone", e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="clientAddress">Address</Label>
                                    <Textarea
                                        id="clientAddress"
                                        value={invoiceData.clientAddress}
                                        onChange={(e) => updateField("clientAddress", e.target.value)}
                                        placeholder="456 Client Ave, City, State 67890"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Invoice Details */}
                    <Card className="invoice-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                    <Input
                                        id="invoiceNumber"
                                        value={invoiceData.invoiceNumber}
                                        onChange={(e) => updateField("invoiceNumber", e.target.value)}
                                        placeholder="INV-001"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                                    <Input
                                        id="invoiceDate"
                                        type="date"
                                        value={invoiceData.invoiceDate}
                                        onChange={(e) => updateField("invoiceDate", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={invoiceData.dueDate}
                                        onChange={(e) => updateField("dueDate", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card className="invoice-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Items</CardTitle>
                            <Button onClick={addLineItem} variant="outline" size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-3 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
                                    <div className="col-span-5">Description</div>
                                    <div className="col-span-2">Quantity</div>
                                    <div className="col-span-2">Rate</div>
                                    <div className="col-span-2 text-right">Amount</div>
                                    <div className="col-span-1"></div>
                                </div>

                                {/* Items */}
                                {invoiceData.lineItems.map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-5">
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                                placeholder="Item description"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.rate}
                                                onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="col-span-2 text-right font-medium">
                                            {formatCurrency(item.quantity * item.rate, invoiceData.currency)}
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLineItem(item.id)}
                                                disabled={invoiceData.lineItems.length === 1}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Totals */}
                                <div className="pt-4 border-t border-border space-y-2">
                                    <div className="flex justify-end gap-8">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium w-28 text-right">
                                            {formatCurrency(subtotal, invoiceData.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-end items-center gap-4">
                                        <span className="text-muted-foreground">Tax</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={invoiceData.taxRate}
                                            onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                                            className="w-20 text-right"
                                        />
                                        <span className="text-muted-foreground">%</span>
                                        <span className="font-medium w-28 text-right">
                                            {formatCurrency(taxAmount, invoiceData.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-end gap-8 pt-2 border-t border-border">
                                        <span className="text-lg font-semibold">Total</span>
                                        <span className="text-lg font-bold text-primary w-28 text-right">
                                            {formatCurrency(total, invoiceData.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="invoice-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Notes / Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={invoiceData.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Payment terms, thank you message, or additional notes..."
                                rows={3}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
