export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  layout: "classic" | "modern" | "compact" | "detailed";
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Professional standard layout with clear sections",
    layout: "classic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean minimalist design with bold accents",
    layout: "modern",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout for shorter invoices",
    layout: "compact",
  },
  {
    id: "detailed",
    name: "Detailed",
    description: "Extra space for item descriptions",
    layout: "detailed",
  },
];

export function getTemplateById(id: string): InvoiceTemplate {
  return INVOICE_TEMPLATES.find((t) => t.id === id) || INVOICE_TEMPLATES[0];
}
