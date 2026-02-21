"use client";
import React, { useState, useCallback } from 'react';
import { RotateCcw, X, AlertCircle, TrendingUp, Calculator, DollarSign, Building2, FileText, Award, Target, Briefcase, BarChart3, Rocket, Info, Download } from 'lucide-react';

// ==================== TYPES & CONSTANTS ====================
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD';
type MethodType = 'vc' | 'premoney' | 'dcf' | 'cca' | 'revenue' | 'ebitda' | 'asset' | 'precedent' | 'scorecard' | 'berkus';

const currencyConfig: Record<Currency, { symbol: string; locale: string; name: string }> = {
    INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
    EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
    GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
    JPY: { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
    AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
    SGD: { symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' }
};

const methods = [
    { id: 'vc', name: 'VC Method', icon: TrendingUp, desc: 'For startups with exit potential' },
    { id: 'premoney', name: 'Pre/Post Money', icon: Calculator, desc: 'Industry standard fundraising' },
    { id: 'dcf', name: 'DCF', icon: DollarSign, desc: 'Future cash flow analysis' },
    { id: 'cca', name: 'Comparable Co.', icon: Building2, desc: 'Market comparison' },
    { id: 'revenue', name: 'Revenue Multiple', icon: FileText, desc: 'SaaS & tech startups' },
    { id: 'ebitda', name: 'EBITDA Multiple', icon: Award, desc: 'Profitable businesses' },
    { id: 'asset', name: 'Asset-Based', icon: Target, desc: 'Asset-heavy companies' },
    { id: 'precedent', name: 'Precedent Trans.', icon: Briefcase, desc: 'M&A transactions' },
    { id: 'scorecard', name: 'Scorecard', icon: BarChart3, desc: 'Seed-stage startups' },
    { id: 'berkus', name: 'Berkus', icon: Rocket, desc: 'Pre-revenue startups' }
];

// ==================== UTILITY FUNCTIONS ====================
const parseNumber = (value: string): string => {
    if (!value) return '';
    const cleaned = value.toString().replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
};

const formatNumber = (value: string | number, currency: Currency): string => {
    if (!value || value === '0' || value === 0) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || !isFinite(numValue)) return '';
    return numValue.toLocaleString(currencyConfig[currency]?.locale || 'en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const safe = (value: string): number => {
    const parsed = parseFloat(parseNumber(value));
    return isNaN(parsed) ? 0 : parsed;
};

// ==================== CALCULATION FUNCTIONS ====================
const calculations = {
    vc: (data: any, currency: Currency) => {
        const { investment, equity, exitValue, years, targetReturn } = data;
        if (investment <= 0 || equity <= 0 || equity >= 100 || exitValue <= 0 || years <= 0 || targetReturn <= 0)
            return { error: 'All values must be positive and equity < 100%' };

        const futureValue = investment * Math.pow(1 + targetReturn / 100, years);
        const postMoney = exitValue / Math.pow(1 + targetReturn / 100, years);
        const preMoney = postMoney - investment;
        const requiredOwnership = (futureValue / exitValue) * 100;

        return {
            postMoneyValuation: formatNumber(postMoney, currency),
            preMoneyValuation: formatNumber(preMoney, currency),
            requiredOwnership: requiredOwnership.toFixed(2),
            futureValue: formatNumber(futureValue, currency)
        };
    },

    premoney: (data: any, currency: Currency) => {
        const { investment, equity, preMoney, postMoney } = data;
        const filled = [investment, equity, preMoney, postMoney].filter(v => v > 0).length;
        if (filled < 2) return { error: 'Provide at least 2 values' };

        if (investment > 0 && equity > 0 && !preMoney && !postMoney) {
            if (equity >= 100) return { error: 'Equity must be < 100%' };
            const post = investment / (equity / 100);
            return { postMoneyValuation: formatNumber(post, currency), preMoneyValuation: formatNumber(post - investment, currency) };
        }
        if (investment > 0 && preMoney > 0 && !equity && !postMoney) {
            const post = investment + preMoney;
            return { postMoneyValuation: formatNumber(post, currency), equity: ((investment / post) * 100).toFixed(2) };
        }
        if (investment > 0 && postMoney > 0 && !equity && !preMoney) {
            if (postMoney <= investment) return { error: 'Post-money must > investment' };
            return { preMoneyValuation: formatNumber(postMoney - investment, currency), equity: ((investment / postMoney) * 100).toFixed(2) };
        }
        if (equity > 0 && preMoney > 0 && !investment && !postMoney) {
            if (equity >= 100) return { error: 'Equity must be < 100%' };
            const post = preMoney / (1 - equity / 100);
            return { postMoneyValuation: formatNumber(post, currency), investment: formatNumber(post - preMoney, currency) };
        }
        if (equity > 0 && postMoney > 0 && !investment && !preMoney) {
            if (equity >= 100) return { error: 'Equity must be < 100%' };
            const inv = postMoney * (equity / 100);
            return { investment: formatNumber(inv, currency), preMoneyValuation: formatNumber(postMoney - inv, currency) };
        }
        return { error: 'Invalid combination' };
    },

    dcf: (data: any, currency: Currency) => {
        const { cashFlows, terminalGrowth, discountRate } = data;
        const validFlows = cashFlows.filter((cf: number) => cf > 0);
        if (validFlows.length === 0) return { error: 'Add at least one cash flow' };
        if (discountRate <= 0) return { error: 'Discount rate must be positive' };
        if (terminalGrowth >= discountRate) return { error: 'Terminal growth must < discount rate' };

        let pv = 0;
        cashFlows.forEach((cf: number, i: number) => {
            if (cf > 0) pv += cf / Math.pow(1 + discountRate / 100, i + 1);
        });

        const termVal = (cashFlows[cashFlows.length - 1] * (1 + terminalGrowth / 100)) / (discountRate / 100 - terminalGrowth / 100);
        const termPV = termVal / Math.pow(1 + discountRate / 100, cashFlows.length);

        return {
            presentValueCashFlows: formatNumber(pv, currency),
            terminalValue: formatNumber(termPV, currency),
            totalValuation: formatNumber(pv + termPV, currency)
        };
    },

    cca: (data: any, currency: Currency) => {
        const { metric, multiples } = data;
        const valid = multiples.filter((m: number) => m > 0);
        if (metric <= 0 || valid.length === 0) return { error: 'Provide positive metric and multiples' };

        const avg = valid.reduce((a: number, b: number) => a + b, 0) / valid.length;
        const sorted = [...valid].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];

        return {
            averageMultiple: avg.toFixed(2),
            medianMultiple: median.toFixed(2),
            valuationAvg: formatNumber(metric * avg, currency),
            valuationMedian: formatNumber(metric * median, currency)
        };
    },

    revenue: (data: any, currency: Currency) => {
        const { revenue, multiple } = data;
        if (revenue <= 0 || multiple <= 0) return { error: 'Values must be positive' };
        return { valuation: formatNumber(revenue * multiple, currency), multiple: multiple.toFixed(2) };
    },

    ebitda: (data: any, currency: Currency) => {
        const { ebitda, multiple } = data;
        if (ebitda <= 0 || multiple <= 0) return { error: 'Values must be positive' };
        return { valuation: formatNumber(ebitda * multiple, currency), multiple: multiple.toFixed(2) };
    },

    asset: (data: any, currency: Currency) => {
        const { assets, liabilities } = data;
        if (assets <= 0 || liabilities < 0 || liabilities > assets) return { error: 'Invalid asset/liability values' };
        return {
            netAssetValue: formatNumber(assets - liabilities, currency),
            totalAssets: formatNumber(assets, currency),
            totalLiabilities: formatNumber(liabilities, currency)
        };
    },

    precedent: (data: any, currency: Currency) => {
        const { metric, multiples } = data;
        const valid = multiples.filter((m: number) => m > 0);
        if (metric <= 0 || valid.length === 0) return { error: 'Provide positive values' };
        const avg = valid.reduce((a: number, b: number) => a + b, 0) / valid.length;
        return { averageMultiple: avg.toFixed(2), impliedValuation: formatNumber(metric * avg, currency) };
    },

    scorecard: (data: any, currency: Currency) => {
        const { baseline, factors } = data;
        if (baseline <= 0) return { error: 'Baseline must be positive' };
        const totalWeight = factors.reduce((sum: number, f: any) => sum + f.weight, 0);
        if (Math.abs(totalWeight - 100) > 0.01) return { error: `Weights must = 100% (now ${totalWeight.toFixed(1)}%)` };

        let adj = 0;
        factors.forEach((f: any) => adj += (f.weight / 100) * (f.rating / 100));

        return {
            adjustmentFactor: (adj * 100).toFixed(2),
            adjustedValuation: formatNumber(baseline * adj, currency)
        };
    },

    berkus: (data: any, currency: Currency) => {
        const { maxPerFactor, factors } = data;
        if (maxPerFactor <= 0) return { error: 'Max must be positive' };

        for (const val of Object.values(factors)) {
            if ((val as number) < 0 || (val as number) > maxPerFactor) return { error: `Each factor must be 0-${formatNumber(maxPerFactor, currency)}` };
        }

        const total = Object.values(factors).reduce((sum: number, v) => sum + (v as number), 0);
        return {
            totalValuation: formatNumber(total, currency),
            breakdown: Object.fromEntries(
                Object.entries(factors).map(([k, v]) => [k, formatNumber(v as number, currency)])
            )
        };
    }
};

// ==================== REUSABLE INPUT COMPONENTS ====================
const CurrencyInput = ({ id, label, value, onChange, placeholder, symbol }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">{symbol}</span>
            <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(parseNumber(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder={placeholder}
            />
        </div>
    </div>
);

const NumberInput = ({ id, label, value, onChange, placeholder, min = 0, max }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            id={id}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            placeholder={placeholder}
            min={min}
            max={max}
            step="0.1"
        />
    </div>
);

// ==================== MAIN COMPONENT ====================
export default function StartupValuationCalculator() {
    const [activeMethod, setActiveMethod] = useState<MethodType>('premoney');
    const [currency, setCurrency] = useState<Currency>('INR');
    const [error, setError] = useState('');
    const [result, setResult] = useState<any>(null);

    // Consolidated state - all inputs in one object
    const [inputs, setInputs] = useState<Record<string, any>>({
        vc: { investment: '', equity: '', exitValue: '', years: '', targetReturn: '' },
        premoney: { investment: '', equity: '', preMoney: '', postMoney: '' },
        dcf: { cashFlows: ['', '', '', '', ''], terminalGrowth: '', discountRate: '' },
        cca: { metric: '', multiples: ['', '', ''] },
        revenue: { revenue: '', multiple: '' },
        ebitda: { ebitda: '', multiple: '' },
        asset: { assets: '', liabilities: '' },
        precedent: { metric: '', multiples: ['', '', ''] },
        scorecard: {
            baseline: '',
            factors: [
                { name: 'Team Strength', weight: 30, rating: 100 },
                { name: 'Product/Tech', weight: 25, rating: 100 },
                { name: 'Market Size', weight: 20, rating: 100 },
                { name: 'Competition', weight: 15, rating: 100 },
                { name: 'Other Factors', weight: 10, rating: 100 }
            ]
        },
        berkus: {
            maxPerFactor: '500000',
            factors: { soundIdea: 0, prototypeProduct: 0, qualityManagement: 0, strategicRelationships: 0, productRollout: 0 }
        }
    });

    const symbol = currencyConfig[currency]?.symbol || currency;
    const current = inputs[activeMethod];

    const updateInput = (path: string, value: any) => {
        setInputs(prev => ({
            ...prev,
            [activeMethod]: {
                ...prev[activeMethod],
                [path]: value
            }
        }));
    };

    const handleCalculate = useCallback(() => {
        setError('');
        setResult(null);

        const data: any = { ...current };

        // Convert strings to numbers
        if (activeMethod === 'vc') {
            data.investment = safe(data.investment);
            data.equity = parseFloat(data.equity) || 0;
            data.exitValue = safe(data.exitValue);
            data.years = parseFloat(data.years) || 0;
            data.targetReturn = parseFloat(data.targetReturn) || 0;
        } else if (activeMethod === 'premoney') {
            data.investment = safe(data.investment);
            data.equity = parseFloat(data.equity) || 0;
            data.preMoney = safe(data.preMoney);
            data.postMoney = safe(data.postMoney);
        } else if (activeMethod === 'dcf') {
            data.cashFlows = data.cashFlows.map(safe);
            data.terminalGrowth = parseFloat(data.terminalGrowth) || 0;
            data.discountRate = parseFloat(data.discountRate) || 0;
        } else if (activeMethod === 'cca' || activeMethod === 'precedent') {
            data.metric = safe(data.metric);
            data.multiples = data.multiples.map((m: string) => parseFloat(m) || 0);
        } else if (activeMethod === 'revenue') {
            data.revenue = safe(data.revenue);
            data.multiple = parseFloat(data.multiple) || 0;
        } else if (activeMethod === 'ebitda') {
            data.ebitda = safe(data.ebitda);
            data.multiple = parseFloat(data.multiple) || 0;
        } else if (activeMethod === 'asset') {
            data.assets = safe(data.assets);
            data.liabilities = safe(data.liabilities);
        } else if (activeMethod === 'scorecard') {
            data.baseline = safe(data.baseline);
        } else if (activeMethod === 'berkus') {
            data.maxPerFactor = safe(data.maxPerFactor);
        }

        const calc = calculations[activeMethod];
        const res = calc(data, currency);

        if (res.error) setError(res.error);
        else setResult(res);
    }, [activeMethod, current, currency]);

    const clearAll = () => {
        setInputs({
            vc: { investment: '', equity: '', exitValue: '', years: '', targetReturn: '' },
            premoney: { investment: '', equity: '', preMoney: '', postMoney: '' },
            dcf: { cashFlows: ['', '', '', '', ''], terminalGrowth: '', discountRate: '' },
            cca: { metric: '', multiples: ['', '', ''] },
            revenue: { revenue: '', multiple: '' },
            ebitda: { ebitda: '', multiple: '' },
            asset: { assets: '', liabilities: '' },
            precedent: { metric: '', multiples: ['', '', ''] },
            scorecard: {
                baseline: '',
                factors: [
                    { name: 'Team Strength', weight: 30, rating: 100 },
                    { name: 'Product/Tech', weight: 25, rating: 100 },
                    { name: 'Market Size', weight: 20, rating: 100 },
                    { name: 'Competition', weight: 15, rating: 100 },
                    { name: 'Other Factors', weight: 10, rating: 100 }
                ]
            },
            berkus: {
                maxPerFactor: '500000',
                factors: { soundIdea: 0, prototypeProduct: 0, qualityManagement: 0, strategicRelationships: 0, productRollout: 0 }
            }
        });
        setError('');
        setResult(null);
    };

    const exportResults = () => {
        if (!result) return;
        const methodName = methods.find(m => m.id === activeMethod)?.name || activeMethod;
        let text = `Startup Valuation Calculator Results\nMethod: ${methodName}\nCurrency: ${currency}\nDate: ${new Date().toLocaleString()}\n\n--- Results ---\n`;

        Object.entries(result).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                text += `\n${key.replace(/([A-Z])/g, ' $1').trim()}:\n`;
                Object.entries(value).forEach(([k, v]) => text += `  ${k.replace(/([A-Z])/g, ' $1').trim()}: ${symbol}${v}\n`);
            } else {
                const val = key.includes('Multiple') || key.includes('Factor') || key.includes('Ownership')
                    ? `${value}${key.includes('Ownership') ? '%' : 'x'}`
                    : `${symbol}${value}`;
                text += `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}\n`;
            }
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `valuation-${activeMethod}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderInputs = () => {
        switch (activeMethod) {
            case 'vc':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CurrencyInput id="vc-inv" label="Investment Amount" value={current.investment} onChange={(v: string) => updateInput('investment', v)} placeholder="1000000" symbol={symbol} />
                        <NumberInput id="vc-eq" label="Equity %" value={current.equity} onChange={(v: string) => updateInput('equity', v)} placeholder="20" max={100} />
                        <CurrencyInput id="vc-exit" label="Expected Exit Value" value={current.exitValue} onChange={(v: string) => updateInput('exitValue', v)} placeholder="10000000" symbol={symbol} />
                        <NumberInput id="vc-years" label="Years to Exit" value={current.years} onChange={(v: string) => updateInput('years', v)} placeholder="5" />
                        <NumberInput id="vc-return" label="Target Return %" value={current.targetReturn} onChange={(v: string) => updateInput('targetReturn', v)} placeholder="30" />
                    </div>
                );

            case 'premoney':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CurrencyInput id="pm-inv" label="Investment Amount" value={current.investment} onChange={(v: string) => updateInput('investment', v)} placeholder="1000000" symbol={symbol} />
                        <NumberInput id="pm-eq" label="Investor's Equity %" value={current.equity} onChange={(v: string) => updateInput('equity', v)} placeholder="20" max={100} />
                        <CurrencyInput id="pm-pre" label="Pre-money Valuation" value={current.preMoney} onChange={(v: string) => updateInput('preMoney', v)} placeholder="Optional" symbol={symbol} />
                        <CurrencyInput id="pm-post" label="Post-money Valuation" value={current.postMoney} onChange={(v: string) => updateInput('postMoney', v)} placeholder="Optional" symbol={symbol} />
                        <p className="col-span-full text-xs text-gray-500 italic">💡 Enter any 2 values to calculate the other 2</p>
                    </div>
                );

            case 'dcf':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cash Flow Projections (Years 1-5)</label>
                            <div className="grid grid-cols-5 gap-2">
                                {current.cashFlows.map((cf: string, i: number) => (
                                    <input
                                        key={i}
                                        type="text"
                                        value={cf}
                                        onChange={(e) => {
                                            const newCF = [...current.cashFlows];
                                            newCF[i] = parseNumber(e.target.value);
                                            updateInput('cashFlows', newCF);
                                        }}
                                        className="px-2 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                        placeholder={`Yr ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <NumberInput id="dcf-disc" label="Discount Rate %" value={current.discountRate} onChange={(v: string) => updateInput('discountRate', v)} placeholder="10" />
                            <NumberInput id="dcf-term" label="Terminal Growth %" value={current.terminalGrowth} onChange={(v: string) => updateInput('terminalGrowth', v)} placeholder="3" />
                        </div>
                    </div>
                );

            case 'cca':
            case 'precedent':
                return (
                    <div className="space-y-4">
                        <CurrencyInput id="comp-metric" label="Your Company Metric (Revenue/EBITDA)" value={current.metric} onChange={(v: string) => updateInput('metric', v)} placeholder="5000000" symbol={symbol} />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {activeMethod === 'cca' ? 'Comparable Company Multiples' : 'Transaction Multiples (Past M&A)'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {current.multiples.map((m: string, i: number) => (
                                    <input
                                        key={i}
                                        type="number"
                                        value={m}
                                        onChange={(e) => {
                                            const newM = [...current.multiples];
                                            newM[i] = e.target.value;
                                            updateInput('multiples', newM);
                                        }}
                                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                        placeholder={`${activeMethod === 'cca' ? 'Co.' : 'Deal'} ${i + 1}`}
                                        step="0.1"
                                    />
                                ))}
                            </div>
                            <button onClick={() => updateInput('multiples', [...current.multiples, ''])} className="mt-2 text-sm text-pink-600 hover:text-pink-700 font-semibold">+ Add More</button>
                        </div>
                    </div>
                );

            case 'revenue':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CurrencyInput id="rev" label="Annual Revenue" value={current.revenue} onChange={(v: string) => updateInput('revenue', v)} placeholder="10000000" symbol={symbol} />
                        <NumberInput id="rev-mult" label="Industry Multiple (x)" value={current.multiple} onChange={(v: string) => updateInput('multiple', v)} placeholder="5" />
                    </div>
                );

            case 'ebitda':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CurrencyInput id="ebitda" label="Annual EBITDA" value={current.ebitda} onChange={(v: string) => updateInput('ebitda', v)} placeholder="2000000" symbol={symbol} />
                        <NumberInput id="ebitda-mult" label="EBITDA Multiple (x)" value={current.multiple} onChange={(v: string) => updateInput('multiple', v)} placeholder="8" />
                    </div>
                );

            case 'asset':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CurrencyInput id="assets" label="Total Assets" value={current.assets} onChange={(v: string) => updateInput('assets', v)} placeholder="50000000" symbol={symbol} />
                        <CurrencyInput id="liab" label="Total Liabilities" value={current.liabilities} onChange={(v: string) => updateInput('liabilities', v)} placeholder="20000000" symbol={symbol} />
                    </div>
                );

            case 'scorecard':
                return (
                    <div className="space-y-4">
                        <CurrencyInput id="baseline" label="Baseline Valuation (Market Average)" value={current.baseline} onChange={(v: string) => updateInput('baseline', v)} placeholder="2000000" symbol={symbol} />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Factors & Weights (must total 100%)</label>
                            <div className="space-y-2">
                                {current.factors.map((f: any, i: number) => (
                                    <div key={i} className="grid grid-cols-3 gap-2">
                                        <input type="text" value={f.name} onChange={(e) => {
                                            const newF = [...current.factors];
                                            newF[i].name = e.target.value;
                                            updateInput('factors', newF);
                                        }} className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="Factor" />
                                        <input type="number" value={f.weight} onChange={(e) => {
                                            const newF = [...current.factors];
                                            newF[i].weight = parseFloat(e.target.value) || 0;
                                            updateInput('factors', newF);
                                        }} className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="Weight %" />
                                        <input type="number" value={f.rating} onChange={(e) => {
                                            const newF = [...current.factors];
                                            newF[i].rating = parseFloat(e.target.value) || 0;
                                            updateInput('factors', newF);
                                        }} className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="Rating %" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Total: <span className={`font-bold ${Math.abs(current.factors.reduce((s: number, f: any) => s + f.weight, 0) - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                                    {current.factors.reduce((s: number, f: any) => s + f.weight, 0).toFixed(1)}%
                                </span>
                            </p>
                        </div>
                    </div>
                );

            case 'berkus':
                return (
                    <div className="space-y-4">
                        <CurrencyInput id="max" label="Max Value Per Factor" value={current.maxPerFactor} onChange={(v: string) => updateInput('maxPerFactor', v)} placeholder="500000" symbol={symbol} />
                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(current.factors).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">{symbol}</span>
                                        <input
                                            type="text"
                                            value={value as number}
                                            onChange={(e) => updateInput('factors', { ...current.factors, [key]: safe(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
         <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="">

                    {/* Header */}

                    <div className="text-start mb-8">
                        <div className="flex items-center justify-start gap-3 mb-4">
                            <div>
                                <h1 className="text-5xl font-semibold ">Startup Valuation <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-pink-900">Calculator</span></h1>
                                <p className="text-muted-foreground">
                                    Professional valuation tools used by VCs, investors, and founders worldwide
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 mt-0.5" />
                            <span className="flex-1 text-sm text-red-800 font-medium">{error}</span>
                            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800"><X size={18} /></button>
                        </div>
                    )}

                    {/* Currency */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">💱 Select Currency</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-full md:w-64 px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 bg-white font-medium">
                            {Object.entries(currencyConfig).map(([code, config]) => (
                                <option key={code} value={code}>{config.symbol} {code} - {config.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Methods */}
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">📈 Choose Valuation Method</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {methods.map((method) => {
                                const Icon = method.icon;
                                const isActive = activeMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => { setActiveMethod(method.id as MethodType); setError(''); setResult(null); }}
                                        className={`p-4 rounded-md border-2 transition-all text-left hover:scale-105 ${isActive ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg' : 'border-gray-200 hover:border-pink-300 bg-white'}`}
                                    >
                                        <Icon size={24} className={`mb-2 ${isActive ? 'text-pink-600' : 'text-gray-500'}`} />
                                        <p className={`text-xs font-bold mb-1 ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>{method.name}</p>
                                        <p className="text-[10px] text-gray-500">{method.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{methods.find(m => m.id === activeMethod)?.name} Inputs</h3>
                        {renderInputs()}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:from-pink-600 hover:to-rose-600 font-bold shadow-lg">
                            <Calculator size={20} /> Calculate Valuation
                        </button>
                        <button onClick={clearAll} className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-bold shadow-md">
                            <RotateCcw size={20} /> Clear All
                        </button>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-2xl">📊</span> Results
                                </h3>
                                <button onClick={exportResults} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                    <Download size={16} /> Export
                                </button>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(result).map(([key, value]) => {
                                    if (typeof value === 'object' && value !== null) {
                                        return (
                                            <div key={key} className="ml-2 p-3 bg-white rounded-lg border border-green-200">
                                                <p className="font-semibold text-gray-800 capitalize mb-2">{key.replace(/([A-Z])/g, ' $1')}:</p>
                                                {Object.entries(value).map(([k, v]) => (
                                                    <p key={k} className="ml-4 text-sm flex justify-between">
                                                        <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                                                        <span className="font-bold text-green-700">{symbol}{v}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return (
                                        <p key={key} className="flex justify-between p-2 hover:bg-white rounded">
                                            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="font-bold text-green-700">
                                                {key.includes('Multiple') || key.includes('Factor') || key.includes('Ownership') ? `${value}${key.includes('Ownership') ? '%' : 'x'}` : `${symbol}${value}`}
                                            </span>
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">💡 <strong>Pro Tip:</strong> Use multiple methods to cross-validate your valuation</p>
                    </div>
                </div>
            </div>
        </div>
    );
}