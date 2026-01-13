export type CurrencyCode = "USD" | "INR";

export interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    locale: string;
    name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    USD: {
        code: "USD",
        symbol: "$",
        locale: "en-US",
        name: "US Dollar",
    },
    INR: {
        code: "INR",
        symbol: "₹",
        locale: "en-IN",
        name: "Indian Rupee",
    },
};

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
    const config = CURRENCIES[currencyCode];
    return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
