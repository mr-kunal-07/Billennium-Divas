"use client";
import React, { useState, useCallback } from 'react';
import { Users, TrendingUp, DollarSign, PieChart, GitBranch, Calculator, Download, Plus, Trash2, AlertCircle, X, RotateCcw } from 'lucide-react';

// ==================== TYPES ====================
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
type ViewType = 'current' | 'addRound' | 'dilution' | 'exit' | 'options' | 'safes';

interface Stakeholder {
    id: string;
    name: string;
    type: 'founder' | 'investor' | 'employee' | 'option-pool';
    shares: number;
    shareClass: string;
    invested?: number;
    liquidationPref?: number;
}

interface FundingRound {
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
}

interface SAFE {
    id: string;
    investorName: string;
    amount: number;
    valuationCap: number;
    discount: number;
}

// ==================== CONSTANTS ====================
const currencyConfig = {
    INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
    EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
    GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' }
};

const views = [
    { id: 'current', name: 'Current Cap Table', icon: PieChart, desc: 'View ownership breakdown' },
    { id: 'addRound', name: 'Add Funding Round', icon: TrendingUp, desc: 'Simulate new investment' },
    { id: 'dilution', name: 'Dilution Analysis', icon: GitBranch, desc: 'Track ownership changes' },
    { id: 'exit', name: 'Exit Waterfall', icon: DollarSign, desc: 'Calculate exit proceeds' },
    { id: 'options', name: 'Option Pool', icon: Users, desc: 'Manage employee equity' },
    { id: 'safes', name: 'SAFEs/Convertibles', icon: Calculator, desc: 'Convert to equity' }
];

const shareClasses = ['Common', 'Preferred Series A', 'Preferred Series B', 'Preferred Series C'];
const stakeholderTypes = [
    { value: 'founder', label: 'Founder' },
    { value: 'investor', label: 'Investor' },
    { value: 'employee', label: 'Employee' },
    { value: 'option-pool', label: 'Option Pool' }
];

// ==================== UTILITIES ====================
const parseNum = (value: string): string => {
    if (!value) return '';
    const cleaned = value.toString().replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
};

const formatNum = (value: number, currency: Currency): string => {
    if (!value || value === 0) return '0.00';
    return value.toLocaleString(currencyConfig[currency].locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const safe = (value: string): number => {
    const parsed = parseFloat(parseNum(value));
    return isNaN(parsed) ? 0 : parsed;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ==================== REUSABLE COMPONENTS ====================
const CurrencyInput = ({ label, value, onChange, placeholder, symbol }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">{symbol}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(parseNum(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                placeholder={placeholder}
            />
        </div>
    </div>
);

const TextInput = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            placeholder={placeholder}
        />
    </div>
);

const NumberInput = ({ label, value, onChange, placeholder, min = 0 }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            placeholder={placeholder}
            min={min}
            step="0.01"
        />
    </div>
);

const SelectInput = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

// ==================== MAIN COMPONENT ====================
export default function CapTableCalculator() {
    const [activeView, setActiveView] = useState<ViewType>('current');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [error, setError] = useState('');

    // Cap Table State
    const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
        { id: '1', name: 'Founder 1', type: 'founder', shares: 4000000, shareClass: 'Common' },
        { id: '2', name: 'Founder 2', type: 'founder', shares: 3000000, shareClass: 'Common' },
        { id: '3', name: 'Option Pool', type: 'option-pool', shares: 1000000, shareClass: 'Common' }
    ]);

    const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
    const [safes, setSafes] = useState<SAFE[]>([]);

    // Form States
    const [newStakeholder, setNewStakeholder] = useState({
        name: '',
        type: 'founder' as const,
        shares: '',
        shareClass: 'Common',
        invested: ''
    });

    const [newRound, setNewRound] = useState({
        name: '',
        investorName: '',
        investment: '',
        preMoneyValuation: '',
        liquidationPref: '1'
    });

    const [exitValuation, setExitValuation] = useState('');

    const [newSafe, setNewSafe] = useState({
        investorName: '',
        amount: '',
        valuationCap: '',
        discount: '20'
    });

    const symbol = currencyConfig[currency].symbol;
    const totalShares = stakeholders.reduce((sum, s) => sum + s.shares, 0);

    // ==================== CALCULATIONS ====================
    const calculateOwnership = (shares: number): string => {
        if (totalShares === 0) return '0.00';
        return ((shares / totalShares) * 100).toFixed(2);
    };

    const calculateValuation = (shares: number, sharePrice: number): number => {
        return shares * sharePrice;
    };

    const addStakeholder = () => {
        if (!newStakeholder.name || !newStakeholder.shares) {
            setError('Please provide name and shares');
            return;
        }

        const stakeholder: Stakeholder = {
            id: generateId(),
            name: newStakeholder.name,
            type: newStakeholder.type,
            shares: safe(newStakeholder.shares),
            shareClass: newStakeholder.shareClass,
            invested: safe(newStakeholder.invested) || 0
        };

        setStakeholders([...stakeholders, stakeholder]);
        setNewStakeholder({ name: '', type: 'founder', shares: '', shareClass: 'Common', invested: '' });
        setError('');
    };

    const removeStakeholder = (id: string) => {
        setStakeholders(stakeholders.filter(s => s.id !== id));
    };

    const addFundingRound = () => {
        if (!newRound.name || !newRound.investorName || !newRound.investment || !newRound.preMoneyValuation) {
            setError('Please fill all funding round fields');
            return;
        }

        const investment = safe(newRound.investment);
        const preMoney = safe(newRound.preMoneyValuation);
        const postMoney = preMoney + investment;
        const sharePrice = preMoney / totalShares;
        const sharesIssued = investment / sharePrice;
        const newTotalShares = totalShares + sharesIssued;
        const ownership = (sharesIssued / newTotalShares) * 100;

        const round: FundingRound = {
            id: generateId(),
            name: newRound.name,
            investorName: newRound.investorName,
            investment,
            preMoneyValuation: preMoney,
            postMoneyValuation: postMoney,
            sharePrice,
            sharesIssued,
            ownership,
            date: new Date().toISOString().split('T')[0]
        };

        // Add investor to stakeholders
        const investor: Stakeholder = {
            id: generateId(),
            name: newRound.investorName,
            type: 'investor',
            shares: sharesIssued,
            shareClass: newRound.name,
            invested: investment,
            liquidationPref: parseFloat(newRound.liquidationPref)
        };

        setFundingRounds([...fundingRounds, round]);
        setStakeholders([...stakeholders, investor]);
        setNewRound({ name: '', investorName: '', investment: '', preMoneyValuation: '', liquidationPref: '1' });
        setError('');
    };

    const calculateExitWaterfall = () => {
        const exitVal = safe(exitValuation);
        if (exitVal <= 0) return null;

        let remaining = exitVal;
        const proceeds: any[] = [];

        // Sort by liquidation preference
        const investors = stakeholders.filter(s => s.type === 'investor' && s.liquidationPref);
        const others = stakeholders.filter(s => s.type !== 'investor' || !s.liquidationPref);

        // Pay liquidation preferences first
        investors.forEach(inv => {
            const pref = (inv.invested || 0) * (inv.liquidationPref || 1);
            const payout = Math.min(pref, remaining);
            remaining -= payout;
            proceeds.push({ name: inv.name, amount: payout, type: 'Liquidation Preference' });
        });

        // Distribute remaining pro-rata
        if (remaining > 0) {
            stakeholders.forEach(sh => {
                const ownership = sh.shares / totalShares;
                const payout = remaining * ownership;
                const existing = proceeds.find(p => p.name === sh.name);
                if (existing) {
                    existing.amount += payout;
                    existing.type = 'Liquidation Pref + Pro-Rata';
                } else {
                    proceeds.push({ name: sh.name, amount: payout, type: 'Pro-Rata' });
                }
            });
        }

        return proceeds.sort((a, b) => b.amount - a.amount);
    };

    const addSafe = () => {
        if (!newSafe.investorName || !newSafe.amount || !newSafe.valuationCap) {
            setError('Please fill all SAFE fields');
            return;
        }

        const safe: SAFE = {
            id: generateId(),
            investorName: newSafe.investorName,
            amount: parseFloat(newSafe.amount),
            valuationCap: parseFloat(newSafe.valuationCap),
            discount: parseFloat(newSafe.discount)
        };

        setSafes([...safes, safe]);
        setNewSafe({ investorName: '', amount: '', valuationCap: '', discount: '20' });
        setError('');
    };

    const convertSafe = (safeId: string) => {
        const safe = safes.find(s => s.id === safeId);
        if (!safe) return;

        // Simple conversion: use valuation cap for share price
        const sharePrice = safe.valuationCap / totalShares;
        const sharesIssued = safe.amount / sharePrice;

        const investor: Stakeholder = {
            id: generateId(),
            name: safe.investorName + ' (SAFE)',
            type: 'investor',
            shares: sharesIssued,
            shareClass: 'Common',
            invested: safe.amount
        };

        setStakeholders([...stakeholders, investor]);
        setSafes(safes.filter(s => s.id !== safeId));
        setError('');
    };

    const exportCapTable = () => {
        let text = `Cap Table Export\nDate: ${new Date().toLocaleString()}\nCurrency: ${currency}\n\n`;
        text += `Total Shares Outstanding: ${totalShares.toLocaleString()}\n\n`;
        text += `=== STAKEHOLDERS ===\n`;
        text += `Name\tType\tShares\tOwnership %\tShare Class\n`;

        stakeholders.forEach(sh => {
            text += `${sh.name}\t${sh.type}\t${sh.shares.toLocaleString()}\t${calculateOwnership(sh.shares)}%\t${sh.shareClass}\n`;
        });

        if (fundingRounds.length > 0) {
            text += `\n=== FUNDING ROUNDS ===\n`;
            fundingRounds.forEach(round => {
                text += `\n${round.name}\n`;
                text += `Investor: ${round.investorName}\n`;
                text += `Investment: ${symbol}${formatNum(round.investment, currency)}\n`;
                text += `Pre-Money: ${symbol}${formatNum(round.preMoneyValuation, currency)}\n`;
                text += `Post-Money: ${symbol}${formatNum(round.postMoneyValuation, currency)}\n`;
                text += `Ownership: ${round.ownership.toFixed(2)}%\n`;
            });
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cap-table-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetAll = () => {
        setStakeholders([
            { id: '1', name: 'Founder 1', type: 'founder', shares: 4000000, shareClass: 'Common' },
            { id: '2', name: 'Founder 2', type: 'founder', shares: 3000000, shareClass: 'Common' },
            { id: '3', name: 'Option Pool', type: 'option-pool', shares: 1000000, shareClass: 'Common' }
        ]);
        setFundingRounds([]);
        setSafes([]);
        setError('');
    };

    // ==================== RENDER VIEWS ====================
    const renderCurrentCapTable = () => (
        <div className="space-y-6">
            {/* Add Stakeholder Form */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Plus size={18} /> Add New Stakeholder
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <TextInput label="Name" value={newStakeholder.name} onChange={(v: string) => setNewStakeholder({ ...newStakeholder, name: v })} placeholder="John Doe" />
                    <SelectInput label="Type" value={newStakeholder.type} onChange={(v: string) => setNewStakeholder({ ...newStakeholder, type: v as any })} options={stakeholderTypes} />
                    <NumberInput label="Shares" value={newStakeholder.shares} onChange={(v: string) => setNewStakeholder({ ...newStakeholder, shares: v })} placeholder="1000000" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <SelectInput label="Share Class" value={newStakeholder.shareClass} onChange={(v: string) => setNewStakeholder({ ...newStakeholder, shareClass: v })} options={shareClasses.map(c => ({ value: c, label: c }))} />
                    <CurrencyInput label="Amount Invested (Optional)" value={newStakeholder.invested} onChange={(v: string) => setNewStakeholder({ ...newStakeholder, invested: v })} placeholder="0" symbol={symbol} />
                </div>
                <button onClick={addStakeholder} className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-semibold">
                    Add Stakeholder
                </button>
            </div>

            {/* Cap Table Display */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-right">Shares</th>
                            <th className="px-4 py-3 text-right">Ownership %</th>
                            <th className="px-4 py-3 text-left">Share Class</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stakeholders.map((sh, idx) => (
                            <tr key={sh.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-pink-50 transition-colors`}>
                                <td className="px-4 py-3 font-semibold">{sh.name}</td>
                                <td className="px-4 py-3 capitalize">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${sh.type === 'founder' ? 'bg-purple-100 text-purple-800' :
                                        sh.type === 'investor' ? 'bg-green-100 text-green-800' :
                                            sh.type === 'employee' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {sh.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{sh.shares.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-pink-700">{calculateOwnership(sh.shares)}%</td>
                                <td className="px-4 py-3">{sh.shareClass}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => removeStakeholder(sh.id)} className="text-red-600 hover:text-red-800 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-bold">
                            <td className="px-4 py-3" colSpan={2}>TOTAL</td>
                            <td className="px-4 py-3 text-right font-mono">{totalShares.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-pink-700">100.00%</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Visual Pie Chart Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Ownership by Type</h4>
                    {stakeholderTypes.map(type => {
                        const typeShares = stakeholders.filter(s => s.type === type.value).reduce((sum, s) => sum + s.shares, 0);
                        const percentage = ((typeShares / totalShares) * 100).toFixed(2);
                        return typeShares > 0 ? (
                            <div key={type.value} className="mb-2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium capitalize">{type.label}s</span>
                                    <span className="text-sm font-bold text-pink-700">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        ) : null;
                    })}
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-3">💰 Key Metrics</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm">Total Shares:</span>
                            <span className="font-bold font-mono">{totalShares.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Stakeholders:</span>
                            <span className="font-bold">{stakeholders.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Funding Rounds:</span>
                            <span className="font-bold">{fundingRounds.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Pending SAFEs:</span>
                            <span className="font-bold">{safes.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAddRound = () => (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} /> Add New Funding Round
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput label="Round Name" value={newRound.name} onChange={(v: string) => setNewRound({ ...newRound, name: v })} placeholder="Series A" />
                    <TextInput label="Investor Name" value={newRound.investorName} onChange={(v: string) => setNewRound({ ...newRound, investorName: v })} placeholder="XYZ Ventures" />
                    <CurrencyInput label="Investment Amount" value={newRound.investment} onChange={(v: string) => setNewRound({ ...newRound, investment: v })} placeholder="5000000" symbol={symbol} />
                    <CurrencyInput label="Pre-Money Valuation" value={newRound.preMoneyValuation} onChange={(v: string) => setNewRound({ ...newRound, preMoneyValuation: v })} placeholder="20000000" symbol={symbol} />
                    <NumberInput label="Liquidation Preference (x)" value={newRound.liquidationPref} onChange={(v: string) => setNewRound({ ...newRound, liquidationPref: v })} placeholder="1" min={1} />
                </div>

                {newRound.investment && newRound.preMoneyValuation && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                        <h5 className="font-semibold text-gray-800 mb-2">📊 Round Preview:</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600">Post-Money:</span>
                                <span className="ml-2 font-bold">{symbol}{formatNum(safe(newRound.preMoneyValuation) + safe(newRound.investment), currency)}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Share Price:</span>
                                <span className="ml-2 font-bold">{symbol}{formatNum(safe(newRound.preMoneyValuation) / totalShares, currency)}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Shares Issued:</span>
                                <span className="ml-2 font-bold">{Math.round(safe(newRound.investment) / (safe(newRound.preMoneyValuation) / totalShares)).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Investor Ownership:</span>
                                <span className="ml-2 font-bold text-pink-700">
                                    {((safe(newRound.investment) / (safe(newRound.preMoneyValuation) / totalShares)) / (totalShares + (safe(newRound.investment) / (safe(newRound.preMoneyValuation) / totalShares))) * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={addFundingRound} className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all font-bold shadow-lg">
                    Add Funding Round
                </button>
            </div>

            {/* Funding History */}
            {fundingRounds.length > 0 && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">📜 Funding History</h4>
                    <div className="space-y-3">
                        {fundingRounds.map(round => (
                            <div key={round.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-bold text-gray-800">{round.name}</h5>
                                        <p className="text-sm text-gray-600">{round.investorName} • {round.date}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                        {round.ownership.toFixed(2)}% Ownership
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Investment:</span>
                                        <p className="font-bold">{symbol}{formatNum(round.investment, currency)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Pre-Money:</span>
                                        <p className="font-bold">{symbol}{formatNum(round.preMoneyValuation, currency)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Post-Money:</span>
                                        <p className="font-bold">{symbol}{formatNum(round.postMoneyValuation, currency)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Shares Issued:</span>
                                        <p className="font-bold">{Math.round(round.sharesIssued).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderDilution = () => (
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GitBranch size={20} /> Dilution Analysis
            </h4>

            {fundingRounds.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Add funding rounds to see dilution analysis</p>
            ) : (
                <div className="space-y-4">
                    {stakeholders.filter(s => s.type !== 'investor').map(sh => {
                        const initialShares = sh.shares;
                        const currentOwnership = calculateOwnership(sh.shares);

                        return (
                            <div key={sh.id} className="p-4 bg-white rounded-lg border border-yellow-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-bold text-gray-800">{sh.name}</h5>
                                    <span className="text-sm font-semibold text-pink-700">{currentOwnership}% Current</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>Shares: {initialShares.toLocaleString()} (unchanged)</p>
                                    <p className="mt-1">
                                        Dilution: Original equity diluted by funding rounds
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderExitWaterfall = () => {
        const waterfall = calculateExitWaterfall();

        return (
            <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign size={20} /> Exit Scenario Calculator
                    </h4>
                    <div className="max-w-md">
                        <CurrencyInput
                            label="Exit Valuation"
                            value={exitValuation}
                            onChange={(v: string) => setExitValuation(v)}
                            placeholder="100000000"
                            symbol={symbol}
                        />
                    </div>
                </div>

                {waterfall && (
                    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-4">💰 Exit Proceeds Distribution</h4>
                        <div className="space-y-3">
                            {waterfall.map((proc, idx) => (
                                <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{proc.name}</p>
                                            <p className="text-xs text-gray-600">{proc.type}</p>
                                        </div>
                                        <p className="text-xl font-bold text-green-700">{symbol}{formatNum(proc.amount, currency)}</p>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                                style={{ width: `${(proc.amount / safe(exitValuation)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {((proc.amount / safe(exitValuation)) * 100).toFixed(2)}% of exit value
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderOptions = () => (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} /> Employee Option Pool Management
            </h4>
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-blue-300">
                    <h5 className="font-semibold text-gray-800 mb-2">Current Option Pool</h5>
                    {stakeholders.filter(s => s.type === 'option-pool').map(pool => (
                        <div key={pool.id}>
                            <p className="text-sm text-gray-600">Reserved Shares: <span className="font-bold">{pool.shares.toLocaleString()}</span></p>
                            <p className="text-sm text-gray-600">Percentage: <span className="font-bold text-pink-700">{calculateOwnership(pool.shares)}%</span></p>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-600 italic">
                    💡 Option pools typically range from 10-20% of total shares for early-stage startups
                </p>
            </div>
        </div>
    );

    const renderSafes = () => (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calculator size={20} /> Add SAFE / Convertible Note
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput label="Investor Name" value={newSafe.investorName} onChange={(v: string) => setNewSafe({ ...newSafe, investorName: v })} placeholder="Angel Investor" />
                    <CurrencyInput label="Investment Amount" value={newSafe.amount} onChange={(v: string) => setNewSafe({ ...newSafe, amount: v })} placeholder="500000" symbol={symbol} />
                    <CurrencyInput label="Valuation Cap" value={newSafe.valuationCap} onChange={(v: string) => setNewSafe({ ...newSafe, valuationCap: v })} placeholder="10000000" symbol={symbol} />
                    <NumberInput label="Discount %" value={newSafe.discount} onChange={(v: string) => setNewSafe({ ...newSafe, discount: v })} placeholder="20" min={0} />
                </div>
                <button onClick={addSafe} className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all font-bold shadow-lg">
                    Add SAFE
                </button>
            </div>

            {safes.length > 0 && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">📋 Pending SAFEs</h4>
                    <div className="space-y-3">
                        {safes.map(safe => (
                            <div key={safe.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-bold text-gray-800">{safe.investorName}</h5>
                                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                                            <p>Amount: <span className="font-semibold">{symbol}{formatNum(safe.amount, currency)}</span></p>
                                            <p>Valuation Cap: <span className="font-semibold">{symbol}{formatNum(safe.valuationCap, currency)}</span></p>
                                            <p>Discount: <span className="font-semibold">{safe.discount}%</span></p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => convertSafe(safe.id)}
                                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all text-sm font-semibold"
                                    >
                                        Convert to Equity
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderView = () => {
        switch (activeView) {
            case 'current': return renderCurrentCapTable();
            case 'addRound': return renderAddRound();
            case 'dilution': return renderDilution();
            case 'exit': return renderExitWaterfall();
            case 'options': return renderOptions();
            case 'safes': return renderSafes();
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-200">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-pink-400 text-center mb-2">
                            Cap Table Calculator
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 text-center max-w-2xl mx-auto">
                            Professional cap table management for startups. Track ownership, model funding rounds, and analyze exit scenarios.
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 mt-0.5" />
                            <span className="flex-1 text-sm text-red-800 font-medium">{error}</span>
                            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800"><X size={18} /></button>
                        </div>
                    )}

                    {/* Currency Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">💱 Select Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                            className="w-full md:w-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white font-medium"
                        >
                            {Object.entries(currencyConfig).map(([code, config]) => (
                                <option key={code} value={code}>{config.symbol} {code} - {config.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Selection Tabs */}
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">🔍 Select View</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {views.map((view) => {
                                const Icon = view.icon;
                                const isActive = activeView === view.id;
                                return (
                                    <button
                                        key={view.id}
                                        onClick={() => { setActiveView(view.id as ViewType); setError(''); }}
                                        className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${isActive ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg' : 'border-gray-200 hover:border-pink-300 bg-white'
                                            }`}
                                    >
                                        <Icon size={24} className={`mb-2 ${isActive ? 'text-pink-600' : 'text-gray-500'}`} />
                                        <p className={`text-xs font-bold mb-1 ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>{view.name}</p>
                                        <p className="text-[10px] text-gray-500">{view.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="mb-8">
                        {renderView()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <button
                            onClick={exportCapTable}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 font-bold shadow-lg"
                        >
                            <Download size={20} /> Export Cap Table
                        </button>
                        <button
                            onClick={resetAll}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold shadow-md"
                        >
                            <RotateCcw size={20} /> Reset All
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            💡 <strong>Pro Tip:</strong> Regularly update your cap table after each funding event to maintain accuracy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}