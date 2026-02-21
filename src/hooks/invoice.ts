export type InvoiceType = "tax" | "proforma";

export type TaxType = "igst" | "cgst_sgst";

export type PaymentTerms = "advance" | "net7" | "net15" | "net30" | "net45" | "net60" | "custom";

export interface SellerDetails {
  companyName: string;
  tradeName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  cin: string;
  logo: string;
}

export interface BuyerDetails {
  companyName: string;
  tradeName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  placeOfSupply: string;
}

export interface ShippingDetails {
  enabled: boolean;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  deliveryDate: string;
  transportMode: string;
  shippingMethod: string;
  freightCharges: number;
  transporterName: string;
  transporterId: string;
  vehicleNumber: string;
  lrNumber: string;
}

export interface LineItem {
  id: string;
  itemName: string;
  description: string;
  hsnSacCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discountType: "flat" | "percent";
  discountValue: number;
  taxableValue: number;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
  totalAmount: number;
}

export interface BankDetails {
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode: string;
  upiId: string;
}

export interface AuthorizationDetails {
  signatoryName: string;
  designation: string;
  signature: string;
  companyStamp: string;
  dateOfAuthorization: string;
  placeOfIssue: string;
  declaration: string;
}

export interface InvoiceHeader {
  invoiceType: InvoiceType;
  invoiceNumber: string;
  invoiceDate: string;
  validityDate: string;
  quotationNumber: string;
  poNumber: string;
  challanNumber: string;
  challanDate: string;
  reverseCharge: boolean;
}

export interface InvoiceData {
  // Header
  header: InvoiceHeader;
  
  // Parties
  seller: SellerDetails;
  buyer: BuyerDetails;
  
  // Shipping
  shipping: ShippingDetails;
  
  // Items
  lineItems: LineItem[];
  
  // Tax Settings
  taxType: TaxType;
  
  // Amounts
  otherCharges: number;
  roundingAdjustment: number;
  
  // Payment
  paymentTerms: PaymentTerms;
  paymentDueDate: string;
  paymentMode: string;
  bank: BankDetails;
  
  // Notes
  notes: string;
  termsAndConditions: string;
  taxDisclaimer: string;
  cancellationPolicy: string;
  
  // Authorization
  authorization: AuthorizationDetails;
  
  // Settings
  currency: "INR" | "USD";
  colorPalette: string;
  customColor: string;
  useCustomColor: boolean;
  templateId: string;
}

export const UNITS = [
  { value: "pcs", label: "Pieces (PCS)" },
  { value: "kg", label: "Kilograms (KG)" },
  { value: "gm", label: "Grams (GM)" },
  { value: "ltr", label: "Liters (LTR)" },
  { value: "ml", label: "Milliliters (ML)" },
  { value: "mtr", label: "Meters (MTR)" },
  { value: "sqft", label: "Square Feet (SQFT)" },
  { value: "sqm", label: "Square Meters (SQM)" },
  { value: "box", label: "Boxes (BOX)" },
  { value: "dozen", label: "Dozens (DOZ)" },
  { value: "hours", label: "Hours (HRS)" },
  { value: "days", label: "Days" },
  { value: "nos", label: "Numbers (NOS)" },
];

export const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
];

export const PAYMENT_TERMS_OPTIONS = [
  { value: "advance", label: "Advance Payment" },
  { value: "net7", label: "Net 7 Days" },
  { value: "net15", label: "Net 15 Days" },
  { value: "net30", label: "Net 30 Days" },
  { value: "net45", label: "Net 45 Days" },
  { value: "net60", label: "Net 60 Days" },
  { value: "custom", label: "Custom" },
];

export const TRANSPORT_MODES = [
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
  { value: "air", label: "Air" },
  { value: "ship", label: "Ship/Sea" },
];

export const defaultSellerDetails: SellerDetails = {
  companyName: "",
  tradeName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  stateCode: "",
  pincode: "",
  country: "India",
  phone: "",
  email: "",
  website: "",
  gstin: "",
  pan: "",
  cin: "",
  logo: "",
};

export const defaultBuyerDetails: BuyerDetails = {
  companyName: "",
  tradeName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  stateCode: "",
  pincode: "",
  country: "India",
  contactPerson: "",
  phone: "",
  email: "",
  gstin: "",
  placeOfSupply: "",
};

export const defaultShippingDetails: ShippingDetails = {
  enabled: false,
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  deliveryDate: "",
  transportMode: "",
  shippingMethod: "",
  freightCharges: 0,
  transporterName: "",
  transporterId: "",
  vehicleNumber: "",
  lrNumber: "",
};

export const defaultBankDetails: BankDetails = {
  bankName: "",
  branchName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  swiftCode: "",
  upiId: "",
};

export const defaultAuthorizationDetails: AuthorizationDetails = {
  signatoryName: "",
  designation: "",
  signature: "",
  companyStamp: "",
  dateOfAuthorization: new Date().toISOString().split("T")[0],
  placeOfIssue: "",
  declaration: "Certified that the particulars given above are true and correct.",
};

export const defaultLineItem: LineItem = {
  id: "",
  itemName: "",
  description: "",
  hsnSacCode: "",
  quantity: 1,
  unit: "pcs",
  rate: 0,
  discountType: "percent",
  discountValue: 0,
  taxableValue: 0,
  cgstPercent: 0,
  cgstAmount: 0,
  sgstPercent: 0,
  sgstAmount: 0,
  igstPercent: 0,
  igstAmount: 0,
  totalAmount: 0,
};

export const defaultTermsAndConditions = `1. Subject to our home Jurisdiction.
2. Our Responsibility Ceases as soon as goods leaves our Premises.
3. Goods once sold will not be taken back.
4. Delivery Ex-Premises.
5. Payment is due within the specified due date.
6. Please include the invoice number in your payment reference.`;

export const defaultInvoiceHeader: InvoiceHeader = {
  invoiceType: "proforma",
  invoiceNumber: "PI-001",
  invoiceDate: new Date().toISOString().split("T")[0],
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  quotationNumber: "",
  poNumber: "",
  challanNumber: "",
  challanDate: "",
  reverseCharge: false,
};

export const initialInvoiceData: InvoiceData = {
  header: defaultInvoiceHeader,
  seller: defaultSellerDetails,
  buyer: defaultBuyerDetails,
  shipping: defaultShippingDetails,
  lineItems: [{ ...defaultLineItem, id: "1" }],
  taxType: "igst",
  otherCharges: 0,
  roundingAdjustment: 0,
  paymentTerms: "net30",
  paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  paymentMode: "",
  bank: defaultBankDetails,
  notes: "",
  termsAndConditions: defaultTermsAndConditions,
  taxDisclaimer: "",
  cancellationPolicy: "",
  authorization: defaultAuthorizationDetails,
  currency: "INR",
  colorPalette: "blue",
  customColor: "#3b82f6",
  useCustomColor: false,
  templateId: "classic",
};

// Calculate line item values
export function calculateLineItem(item: LineItem, taxType: TaxType): LineItem {
  const baseAmount = item.quantity * item.rate;
  const discount = item.discountType === "percent" 
    ? baseAmount * (item.discountValue / 100)
    : item.discountValue;
  const taxableValue = baseAmount - discount;
  
  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
  
  if (taxType === "cgst_sgst") {
    const halfRate = item.cgstPercent || item.igstPercent / 2;
    cgstAmount = taxableValue * (halfRate / 100);
    sgstAmount = taxableValue * (halfRate / 100);
  } else {
    igstAmount = taxableValue * (item.igstPercent / 100);
  }
  
  const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount;
  
  return {
    ...item,
    taxableValue,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
  };
}

// Calculate totals
export function calculateTotals(lineItems: LineItem[], otherCharges: number, roundingAdjustment: number) {
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = lineItems.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalDiscount = lineItems.reduce((sum, item) => {
    const base = item.quantity * item.rate;
    const taxable = item.taxableValue;
    return sum + (base - taxable);
  }, 0);
  const totalCGST = lineItems.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSGST = lineItems.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIGST = lineItems.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;
  const grandTotal = subtotal + totalTax + otherCharges + roundingAdjustment;
  
  return {
    totalQuantity,
    subtotal,
    totalDiscount,
    totalCGST,
    totalSGST,
    totalIGST,
    totalTax,
    grandTotal,
  };
}
