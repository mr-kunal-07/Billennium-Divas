// capTableTypes.ts - Types, Constants, and Utilities

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type ViewType = 'current' | 'addRound' | 'dilution' | 'exit' | 'options' | 'safes';
export type StakeholderType = 'founder' | 'investor' | 'employee' | 'option-pool';

export interface Stakeholder {
    id: string;
    name: string;
    type: StakeholderType;
    shares: number;
    shareClass: string;
    invested?: number;
    liquidationPref?: number;
    isParticipating?: boolean;
    vestingSchedule?: VestingSchedule;
}

export interface VestingSchedule {
    totalShares: number;
    vestedShares: number;
    cliffMonths: number;
    vestingMonths: number;
    startDate: string;
}

export interface FundingRound {
    id: string;
    name: string;
    investorName: string;
    investment: number;
    preMoneyValuation: number;
    postMoneyValuation: number;
    sharePrice: number;
    sharesIssued: number;
    ownership: number;
    date: string;
    liquidationPref: number;
    isParticipating: boolean;
}

export interface SAFE {
    id: string;
    investorName: string;
    amount: number;
    valuationCap: number;
    discount: number;
    conversionPrice?: number;
}

export interface DilutionSnapshot {
    roundName: string;
    stakeholder: string;
    sharesBefore: number;
    sharesAfter: number;
    ownershipBefore: number;
    ownershipAfter: number;
    dilutionPercent: number;
}

export interface ExitProceeds {
    name: string;
    amount: number;
    type: string;
    percentage: number;
}

export interface CurrencyConfig {
    symbol: string;
    locale: string;
    name: string;
}

export interface ValidationError {
    field: string;
    message: string;
}

// Constants
export const currencyConfig: Record<Currency, CurrencyConfig> = {
    INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
    EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
    GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' }
};

export const shareClasses = [
    'Common',
    'Preferred Series A',
    'Preferred Series B',
    'Preferred Series C',
    'Preferred Series D'
];

export const stakeholderTypes = [
    { value: 'founder' as const, label: 'Founder' },
    { value: 'investor' as const, label: 'Investor' },
    { value: 'employee' as const, label: 'Employee' },
    { value: 'option-pool' as const, label: 'Option Pool' }
];

// Utility Functions
export const parseNum = (value: string): string => {
    if (!value) return '';
    const cleaned = value.toString().replace(/[^\d.-]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
};

export const formatNum = (value: number, currency: Currency): string => {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return value.toLocaleString(currencyConfig[currency].locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const safe = (value: string | number): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    const parsed = parseFloat(parseNum(value));
    return isNaN(parsed) ? 0 : parsed;
};

export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

// Validation Functions
export const validateStakeholder = (data: {
    name: string;
    shares: string | number;
    invested?: string | number;
}): ValidationError | null => {
    if (!data.name || data.name.trim().length === 0) {
        return { field: 'name', message: 'Name is required' };
    }

    const shares = safe(data.shares);
    if (shares <= 0) {
        return { field: 'shares', message: 'Shares must be greater than 0' };
    }

    if (shares > 1e12) {
        return { field: 'shares', message: 'Shares value too large' };
    }

    if (data.invested !== undefined && data.invested !== '') {
        const invested = safe(data.invested);
        if (invested < 0) {
            return { field: 'invested', message: 'Investment cannot be negative' };
        }
    }

    return null;
};

export const validateFundingRound = (data: {
    name: string;
    investorName: string;
    investment: string | number;
    preMoneyValuation: string | number;
    liquidationPref: string | number;
}): ValidationError | null => {
    if (!data.name || data.name.trim().length === 0) {
        return { field: 'name', message: 'Round name is required' };
    }

    if (!data.investorName || data.investorName.trim().length === 0) {
        return { field: 'investorName', message: 'Investor name is required' };
    }

    const investment = safe(data.investment);
    if (investment <= 0) {
        return { field: 'investment', message: 'Investment must be greater than 0' };
    }

    const preMoney = safe(data.preMoneyValuation);
    if (preMoney <= 0) {
        return { field: 'preMoneyValuation', message: 'Pre-money valuation must be greater than 0' };
    }

    if (investment >= preMoney) {
        return { field: 'investment', message: 'Investment should be less than pre-money valuation' };
    }

    const liquidationPref = safe(data.liquidationPref);
    if (liquidationPref < 1) {
        return { field: 'liquidationPref', message: 'Liquidation preference must be at least 1x' };
    }

    if (liquidationPref > 10) {
        return { field: 'liquidationPref', message: 'Liquidation preference seems too high (max 10x)' };
    }

    return null;
};

export const validateSAFE = (data: {
    investorName: string;
    amount: string | number;
    valuationCap: string | number;
    discount: string | number;
}): ValidationError | null => {
    if (!data.investorName || data.investorName.trim().length === 0) {
        return { field: 'investorName', message: 'Investor name is required' };
    }

    const amount = safe(data.amount);
    if (amount <= 0) {
        return { field: 'amount', message: 'SAFE amount must be greater than 0' };
    }

    const valuationCap = safe(data.valuationCap);
    if (valuationCap <= 0) {
        return { field: 'valuationCap', message: 'Valuation cap must be greater than 0' };
    }

    if (amount >= valuationCap) {
        return { field: 'amount', message: 'SAFE amount should be less than valuation cap' };
    }

    const discount = safe(data.discount);
    if (discount < 0 || discount > 50) {
        return { field: 'discount', message: 'Discount must be between 0% and 50%' };
    }

    return null;
};

export const validateExitValuation = (
    exitVal: string | number,
    totalInvested: number
): ValidationError | null => {
    const exitValue = safe(exitVal);

    if (exitValue <= 0) {
        return { field: 'exitValuation', message: 'Exit valuation must be greater than 0' };
    }

    if (exitValue < totalInvested * 0.1) {
        return {
            field: 'exitValuation',
            message: `Exit value seems low compared to total invested (${formatNum(totalInvested, 'USD')})`
        };
    }

    return null;
};

// Calculation Helpers
export const calculateOwnershipPercentage = (
    shares: number,
    totalShares: number
): number => {
    if (totalShares === 0) return 0;
    return (shares / totalShares) * 100;
};

export const calculateFullyDilutedShares = (
    stakeholders: Stakeholder[]
): number => {
    return stakeholders.reduce((sum, sh) => sum + sh.shares, 0);
};

// Warning System
export const getCapTableWarnings = (
    stakeholders: Stakeholder[],
    fundingRounds: FundingRound[]
): string[] => {
    const warnings: string[] = [];
    const totalShares = calculateFullyDilutedShares(stakeholders);

    // Check option pool size
    const optionPoolShares = stakeholders
        .filter(s => s.type === 'option-pool')
        .reduce((sum, s) => sum + s.shares, 0);
    const optionPoolPercent = calculateOwnershipPercentage(optionPoolShares, totalShares);

    if (optionPoolPercent < 10 && fundingRounds.length > 0) {
        warnings.push('⚠️ Option pool below 10% - may need to increase for future hires');
    }

    if (optionPoolPercent > 25) {
        warnings.push('⚠️ Option pool above 25% - unusually high, may cause excessive dilution');
    }

    // Check founder ownership
    const founderShares = stakeholders
        .filter(s => s.type === 'founder')
        .reduce((sum, s) => sum + s.shares, 0);
    const founderPercent = calculateOwnershipPercentage(founderShares, totalShares);

    if (founderPercent < 20 && fundingRounds.length > 1) {
        warnings.push('⚠️ Founder ownership below 20% - significant dilution occurred');
    }

    if (founderPercent < 10 && fundingRounds.length > 0) {
        warnings.push('🚨 Founder ownership critically low (<10%) - loss of control risk');
    }

    // Check investor concentration
    const investorShares = stakeholders
        .filter(s => s.type === 'investor')
        .reduce((sum, s) => sum + s.shares, 0);
    const investorPercent = calculateOwnershipPercentage(investorShares, totalShares);

    if (investorPercent > 70) {
        warnings.push('⚠️ Investors own >70% - founders may have limited control');
    }

    // Check liquidation preference stack
    const totalLiqPref = stakeholders
        .filter(s => s.invested && s.liquidationPref)
        .reduce((sum, s) => sum + (s.invested! * s.liquidationPref!), 0);

    if (totalLiqPref > 0 && fundingRounds.length > 0) {
        const lastRoundValuation = fundingRounds[fundingRounds.length - 1].postMoneyValuation;
        if (totalLiqPref > lastRoundValuation * 0.8) {
            warnings.push('⚠️ High liquidation preference stack - may limit common shareholder proceeds');
        }
    }

    return warnings;
};

// Export utilities for CSV
export const generateCSVContent = (
    stakeholders: Stakeholder[],
    fundingRounds: FundingRound[],
    currency: Currency,
    totalShares: number
): string => {
    const symbol = currencyConfig[currency].symbol;
    let csv = `Cap Table Export\nGenerated: ${new Date().toLocaleString()}\nCurrency: ${currency}\n\n`;

    csv += `SUMMARY\n`;
    csv += `Total Shares Outstanding,${totalShares.toLocaleString()}\n`;
    csv += `Total Stakeholders,${stakeholders.length}\n`;
    csv += `Funding Rounds,${fundingRounds.length}\n\n`;

    csv += `STAKEHOLDERS\n`;
    csv += `Name,Type,Shares,Ownership %,Share Class,Invested,Liquidation Pref\n`;

    stakeholders.forEach(sh => {
        const ownership = calculateOwnershipPercentage(sh.shares, totalShares);
        csv += `${sh.name},${sh.type},${sh.shares},${ownership.toFixed(2)}%,${sh.shareClass},`;
        csv += `${sh.invested ? symbol + formatNum(sh.invested, currency) : 'N/A'},`;
        csv += `${sh.liquidationPref ? sh.liquidationPref + 'x' : 'N/A'}\n`;
    });

    if (fundingRounds.length > 0) {
        csv += `\nFUNDING ROUNDS\n`;
        csv += `Round,Investor,Date,Investment,Pre-Money,Post-Money,Shares Issued,Ownership\n`;

        fundingRounds.forEach(round => {
            csv += `${round.name},${round.investorName},${round.date},`;
            csv += `${symbol}${formatNum(round.investment, currency)},`;
            csv += `${symbol}${formatNum(round.preMoneyValuation, currency)},`;
            csv += `${symbol}${formatNum(round.postMoneyValuation, currency)},`;
            csv += `${Math.round(round.sharesIssued).toLocaleString()},${round.ownership.toFixed(2)}%\n`;
        });
    }

    return csv;
};