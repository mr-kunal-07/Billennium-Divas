export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD';

export interface CurrencyConfig {
    symbol: string;
    locale: string;
    name: string;
}

export const currencyConfig: Record<Currency, CurrencyConfig> = {
    INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
    EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
    GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
    JPY: { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
    AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
    SGD: { symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' }
};

export function parseNumber(value: string): string {
    if (!value) return '';
    return value.toString().replace(/[^\d.]/g, '');
}

export function formatNumber(value: string | number, currency: Currency): string {
    if (!value || value === '0' || value === 0) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || !isFinite(numValue)) return '';

    const locale = currencyConfig[currency]?.locale || 'en-IN';
    return numValue.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ========== METHOD 1: VC METHOD ==========
export interface VCMethodInputs {
    investment: number;
    equityPercent: number;
    exitValue: number;
    yearsToExit: number;
    targetReturn: number;
}

export function calculateVCMethod(inputs: VCMethodInputs, currency: Currency) {
    const { investment, equityPercent, exitValue, yearsToExit, targetReturn } = inputs;

    if (investment <= 0 || equityPercent <= 0 || exitValue <= 0 || yearsToExit <= 0 || targetReturn <= 0) {
        return { error: 'All values must be positive' };
    }

    const futureValue = investment * Math.pow(1 + targetReturn / 100, yearsToExit);
    const postMoneyValuation = exitValue / Math.pow(1 + targetReturn / 100, yearsToExit);
    const preMoneyValuation = postMoneyValuation - investment;
    const requiredOwnership = (futureValue / exitValue) * 100;

    return {
        postMoneyValuation: formatNumber(postMoneyValuation, currency),
        preMoneyValuation: formatNumber(preMoneyValuation, currency),
        requiredOwnership: requiredOwnership.toFixed(2),
        futureValue: formatNumber(futureValue, currency)
    };
}

// ========== METHOD 2: PRE-MONEY & POST-MONEY ==========
export function calculatePrePostMoney(investment: number, equity: number, preVal: number, postVal: number, currency: Currency) {
    const filledCount = [investment, equity, preVal, postVal].filter(v => v > 0).length;
    if (filledCount < 2) return {};

    if (investment > 0 && equity > 0 && !preVal && !postVal) {
        if (equity >= 100) return { error: 'Equity must be less than 100%' };
        const post = investment / (equity / 100);
        const pre = post - investment;
        return {
            postMoneyValuation: formatNumber(post, currency),
            preMoneyValuation: formatNumber(pre, currency)
        };
    }

    if (investment > 0 && preVal > 0 && !equity && !postVal) {
        const post = investment + preVal;
        const equityPercent = (investment / post) * 100;
        return {
            postMoneyValuation: formatNumber(post, currency),
            equity: equityPercent.toFixed(2)
        };
    }

    if (investment > 0 && postVal > 0 && !equity && !preVal) {
        if (postVal < investment) return { error: 'Post-money must be greater than investment' };
        const pre = postVal - investment;
        const equityPercent = (investment / postVal) * 100;
        return {
            preMoneyValuation: formatNumber(pre, currency),
            equity: equityPercent.toFixed(2)
        };
    }

    if (equity > 0 && preVal > 0 && !investment && !postVal) {
        if (equity >= 100) return { error: 'Equity must be less than 100%' };
        const post = preVal / (1 - equity / 100);
        const investmentAmt = post - preVal;
        return {
            postMoneyValuation: formatNumber(post, currency),
            investment: formatNumber(investmentAmt, currency)
        };
    }

    if (equity > 0 && postVal > 0 && !investment && !preVal) {
        const investmentAmt = postVal * (equity / 100);
        const pre = postVal - investmentAmt;
        return {
            investment: formatNumber(investmentAmt, currency),
            preMoneyValuation: formatNumber(pre, currency)
        };
    }

    return {};
}

// ========== METHOD 3: DCF METHOD ==========
export interface DCFInputs {
    cashFlows: number[];
    terminalGrowthRate: number;
    discountRate: number;
}

export function calculateDCF(inputs: DCFInputs, currency: Currency) {
    const { cashFlows, terminalGrowthRate, discountRate } = inputs;

    if (cashFlows.length === 0) return { error: 'Add at least one cash flow projection' };
    if (discountRate <= 0) return { error: 'Discount rate must be positive' };
    if (terminalGrowthRate >= discountRate) return { error: 'Terminal growth must be less than discount rate' };

    let presentValue = 0;
    cashFlows.forEach((cf, i) => {
        presentValue += cf / Math.pow(1 + discountRate / 100, i + 1);
    });

    const terminalValue = (cashFlows[cashFlows.length - 1] * (1 + terminalGrowthRate / 100)) /
        (discountRate / 100 - terminalGrowthRate / 100);
    const terminalPV = terminalValue / Math.pow(1 + discountRate / 100, cashFlows.length);

    const totalValue = presentValue + terminalPV;

    return {
        presentValueCashFlows: formatNumber(presentValue, currency),
        terminalValue: formatNumber(terminalPV, currency),
        totalValuation: formatNumber(totalValue, currency)
    };
}

// ========== METHOD 4: COMPARABLE COMPANY ANALYSIS ==========
export interface CCAInputs {
    metric: number;
    comparableMultiples: number[];
}

export function calculateCCA(inputs: CCAInputs, currency: Currency) {
    const { metric, comparableMultiples } = inputs;

    if (metric <= 0) return { error: 'Metric must be positive' };
    if (comparableMultiples.length === 0) return { error: 'Add at least one comparable multiple' };

    const avgMultiple = comparableMultiples.reduce((a, b) => a + b, 0) / comparableMultiples.length;
    const valuation = metric * avgMultiple;

    const sortedMultiples = [...comparableMultiples].sort((a, b) => a - b);
    const medianMultiple = sortedMultiples.length % 2 === 0
        ? (sortedMultiples[sortedMultiples.length / 2 - 1] + sortedMultiples[sortedMultiples.length / 2]) / 2
        : sortedMultiples[Math.floor(sortedMultiples.length / 2)];

    const medianValuation = metric * medianMultiple;

    return {
        averageMultiple: avgMultiple.toFixed(2),
        medianMultiple: medianMultiple.toFixed(2),
        valuationAvg: formatNumber(valuation, currency),
        valuationMedian: formatNumber(medianValuation, currency)
    };
}

// ========== METHOD 5: REVENUE MULTIPLE ==========
export function calculateRevenueMultiple(revenue: number, multiple: number, currency: Currency) {
    if (revenue <= 0 || multiple <= 0) {
        return { error: 'Revenue and multiple must be positive' };
    }

    const valuation = revenue * multiple;
    return {
        valuation: formatNumber(valuation, currency),
        multiple: multiple.toFixed(2)
    };
}

// ========== METHOD 6: EBITDA MULTIPLE ==========
export function calculateEBITDAMultiple(ebitda: number, multiple: number, currency: Currency) {
    if (ebitda <= 0 || multiple <= 0) {
        return { error: 'EBITDA and multiple must be positive' };
    }

    const valuation = ebitda * multiple;
    return {
        valuation: formatNumber(valuation, currency),
        multiple: multiple.toFixed(2)
    };
}

// ========== METHOD 7: ASSET-BASED VALUATION ==========
export function calculateAssetBased(totalAssets: number, totalLiabilities: number, currency: Currency) {
    if (totalAssets <= 0) return { error: 'Total assets must be positive' };
    if (totalLiabilities < 0) return { error: 'Liabilities cannot be negative' };

    const netAssetValue = totalAssets - totalLiabilities;

    return {
        netAssetValue: formatNumber(netAssetValue, currency),
        totalAssets: formatNumber(totalAssets, currency),
        totalLiabilities: formatNumber(totalLiabilities, currency)
    };
}

// ========== METHOD 8: PRECEDENT TRANSACTION ==========
export interface PrecedentInputs {
    metric: number;
    transactionMultiples: number[];
}

export function calculatePrecedentTransaction(inputs: PrecedentInputs, currency: Currency) {
    const { metric, transactionMultiples } = inputs;

    if (metric <= 0) return { error: 'Metric must be positive' };
    if (transactionMultiples.length === 0) return { error: 'Add at least one transaction multiple' };

    const avgMultiple = transactionMultiples.reduce((a, b) => a + b, 0) / transactionMultiples.length;
    const valuation = metric * avgMultiple;

    return {
        averageMultiple: avgMultiple.toFixed(2),
        impliedValuation: formatNumber(valuation, currency)
    };
}

// ========== METHOD 9: SCORECARD METHOD ==========
export interface ScorecardFactor {
    name: string;
    weight: number;
    rating: number;
}

export function calculateScorecard(baselineValuation: number, factors: ScorecardFactor[], currency: Currency) {
    if (baselineValuation <= 0) return { error: 'Baseline valuation must be positive' };
    if (factors.length === 0) return { error: 'Add at least one factor' };

    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) return { error: 'Weights must sum to 100%' };

    let adjustmentFactor = 0;
    factors.forEach(f => {
        adjustmentFactor += (f.weight / 100) * (f.rating / 100);
    });

    const adjustedValuation = baselineValuation * adjustmentFactor;

    return {
        adjustmentFactor: (adjustmentFactor * 100).toFixed(2),
        adjustedValuation: formatNumber(adjustedValuation, currency)
    };
}

// ========== METHOD 10: BERKUS METHOD ==========
export interface BerkusFactors {
    soundIdea: number;
    prototypeProduct: number;
    qualityManagement: number;
    strategicRelationships: number;
    productRollout: number;
}

export function calculateBerkus(factors: BerkusFactors, maxPerFactor: number, currency: Currency) {
    if (maxPerFactor <= 0) return { error: 'Max value per factor must be positive' };

    const total = factors.soundIdea + factors.prototypeProduct + factors.qualityManagement +
        factors.strategicRelationships + factors.productRollout;

    Object.values(factors).forEach(val => {
        if (val < 0 || val > maxPerFactor) {
            return { error: `Each factor must be between 0 and ${maxPerFactor}` };
        }
    });

    return {
        totalValuation: formatNumber(total, currency),
        breakdown: {
            soundIdea: formatNumber(factors.soundIdea, currency),
            prototypeProduct: formatNumber(factors.prototypeProduct, currency),
            qualityManagement: formatNumber(factors.qualityManagement, currency),
            strategicRelationships: formatNumber(factors.strategicRelationships, currency),
            productRollout: formatNumber(factors.productRollout, currency)
        }
    };
}