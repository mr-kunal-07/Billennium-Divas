export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    subject: "Invoice #{invoiceNumber} from {sellerName}",
    message: `Dear {clientName},

Please find attached Invoice #{invoiceNumber} for {amount}.

Payment is due by {dueDate}. Kindly process the payment at your earliest convenience.

Thank you for your business.

Best regards,
{sellerName}`,
  },
  {
    id: "friendly",
    name: "Friendly",
    subject: "Your Invoice #{invoiceNumber} is Ready!",
    message: `Hi {clientName}!

Hope you're doing well! 🙂

I've prepared Invoice #{invoiceNumber} for {amount}. You can find all the details attached.

Payment due: {dueDate}

Let me know if you have any questions!

Cheers,
{sellerName}`,
  },
  {
    id: "formal",
    name: "Formal",
    subject: "Invoice #{invoiceNumber} - Payment Request",
    message: `Dear Sir/Madam,

We are writing to submit Invoice #{invoiceNumber} dated {invoiceDate} for the amount of {amount}.

The payment is due on {dueDate}. We request you to kindly arrange the payment within the stipulated time.

For any queries regarding this invoice, please do not hesitate to contact us.

Yours faithfully,
{sellerName}`,
  },
  {
    id: "reminder",
    name: "Payment Reminder",
    subject: "Reminder: Invoice #{invoiceNumber} Payment Due",
    message: `Dear {clientName},

This is a friendly reminder regarding Invoice #{invoiceNumber} for {amount}, which is pending payment.

Payment was due on {dueDate}. We kindly request you to process this payment at your earliest convenience.

If you have already made the payment, please ignore this message.

Thank you,
{sellerName}`,
  },
  {
    id: "custom",
    name: "Custom",
    subject: "Invoice #{invoiceNumber}",
    message: "",
  },
];

export function getTemplateById(id: string): EmailTemplate {
  return EMAIL_TEMPLATES.find((t) => t.id === id) || EMAIL_TEMPLATES[0];
}

export function replacePlaceholders(
  text: string,
  data: {
    invoiceNumber: string;
    clientName: string;
    sellerName: string;
    amount: string;
    invoiceDate: string;
    dueDate: string;
  }
): string {
  return text
    .replace(/{invoiceNumber}/g, data.invoiceNumber)
    .replace(/{clientName}/g, data.clientName)
    .replace(/{sellerName}/g, data.sellerName)
    .replace(/{amount}/g, data.amount)
    .replace(/{invoiceDate}/g, data.invoiceDate)
    .replace(/{dueDate}/g, data.dueDate);
}
