"use client";
import React, { useState, useCallback, useMemo } from 'react';
import {
    Users, TrendingUp, DollarSign, PieChart, GitBranch, Calculator,
    Download, Plus, Trash2, AlertCircle, X, RotateCcw, Edit2, Check
} from 'lucide-react';
import {
    type Currency, type ViewType, type Stakeholder, type FundingRound,
    type SAFE, type ExitProceeds, type StakeholderType,
    currencyConfig, shareClasses, stakeholderTypes,
    parseNum, formatNum, safe, generateId,
    validateStakeholder, validateFundingRound, validateSAFE, validateExitValuation,
    calculateOwnershipPercentage, calculateFullyDilutedShares, getCapTableWarnings,
    generateCSVContent
} from './capTableTypes';

// View Configuration
const views = [
    { id: 'current', name: 'Current Cap Table', icon: PieChart, desc: 'View ownership breakdown' },
    { id: 'addRound', name: 'Add Funding Round', icon: TrendingUp, desc: 'Simulate new investment' },
    { id: 'dilution', name: 'Dilution Analysis', icon: GitBranch, desc: 'Track ownership changes' },
    { id: 'exit', name: 'Exit Waterfall', icon: DollarSign, desc: 'Calculate exit proceeds' },
    { id: 'options', name: 'Option Pool', icon: Users, desc: 'Manage employee equity' },
    { id: 'safes', name: 'SAFEs / Convertibles', icon: Calculator, desc: 'Convert to equity' }
];

// Reusable Input Components
const CurrencyInput = ({ label, value, onChange, placeholder, symbol, error }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">{symbol}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(parseNum(e.target.value))}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all ${error ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                    }`}
                placeholder={placeholder}
            />
        </div>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

const TextInput = ({ label, value, onChange, placeholder, error }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all ${error ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            placeholder={placeholder}
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

const NumberInput = ({ label, value, onChange, placeholder, min = 0, max, error }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all ${error ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
            placeholder={placeholder}
            min={min}
            max={max}
            step="0.01"
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

const SelectInput = ({ label, value, onChange, options, error }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-pink-500 transition-all bg-white ${error ? 'border-red-500' : 'border-gray-300 focus:border-pink-500'
                }`}
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

const CheckboxInput = ({ label, checked, onChange }: any) => (
    <div className="flex items-center gap-2">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
        />
        <label className="text-sm font-semibold text-gray-700">{label}</label>
    </div>
);

// Main Component
export default function CapTableCalculator() {
    const [activeView, setActiveView] = useState<ViewType>('current');
    const [currency, setCurrency] = useState<Currency>('USD');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // State
    const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
        { id: '1', name: 'Founder 1', type: 'founder', shares: 4000000, shareClass: 'Common' },
        { id: '2', name: 'Founder 2', type: 'founder', shares: 3000000, shareClass: 'Common' },
        { id: '3', name: 'Option Pool', type: 'option-pool', shares: 1000000, shareClass: 'Common' }
    ]);

    const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
    const [safes, setSafes] = useState<SAFE[]>([]);

    // Form States
    const [newStakeholder, setNewStakeholder] = useState({
        name: '', type: 'founder' as StakeholderType, shares: '',
        shareClass: 'Common', invested: ''
    });

    const [newRound, setNewRound] = useState({
        name: '', investorName: '', investment: '', preMoneyValuation: '',
        liquidationPref: '1', isParticipating: false
    });

    const [exitValuation, setExitValuation] = useState('');

    const [newSafe, setNewSafe] = useState({
        investorName: '', amount: '', valuationCap: '', discount: '20'
    });

    const symbol = currencyConfig[currency].symbol;
    const totalShares = useMemo(() => calculateFullyDilutedShares(stakeholders), [stakeholders]);
    const warnings = useMemo(() => getCapTableWarnings(stakeholders, fundingRounds), [stakeholders, fundingRounds]);

    // Stakeholder Management
    const addStakeholder = useCallback(() => {
        const validation = validateStakeholder(newStakeholder);
        if (validation) {
            setFieldErrors({ [validation.field]: validation.message });
            setError(validation.message);
            return;
        }

        const stakeholder: Stakeholder = {
            id: generateId(),
            name: newStakeholder.name.trim(),
            type: newStakeholder.type,
            shares: safe(newStakeholder.shares),
            shareClass: newStakeholder.shareClass,
            invested: safe(newStakeholder.invested) || undefined
        };

        setStakeholders([...stakeholders, stakeholder]);
        setNewStakeholder({ name: '', type: 'founder', shares: '', shareClass: 'Common', invested: '' });
        setError('');
        setFieldErrors({});
    }, [newStakeholder, stakeholders]);

    const removeStakeholder = useCallback((id: string) => {
        if (window.confirm('Are you sure you want to remove this stakeholder?')) {
            setStakeholders(stakeholders.filter(s => s.id !== id));
        }
    }, [stakeholders]);

    const updateStakeholder = useCallback((id: string, updates: Partial<Stakeholder>) => {
        setStakeholders(stakeholders.map(s => s.id === id ? { ...s, ...updates } : s));
        setEditingId(null);
    }, [stakeholders]);

    // Funding Round Management
    const addFundingRound = useCallback(() => {
        const validation = validateFundingRound(newRound);
        if (validation) {
            setFieldErrors({ [validation.field]: validation.message });
            setError(validation.message);
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
            name: newRound.name.trim(),
            investorName: newRound.investorName.trim(),
            investment,
            preMoneyValuation: preMoney,
            postMoneyValuation: postMoney,
            sharePrice,
            sharesIssued,
            ownership,
            date: new Date().toISOString().split('T')[0],
            liquidationPref: safe(newRound.liquidationPref),
            isParticipating: newRound.isParticipating
        };

        const investor: Stakeholder = {
            id: generateId(),
            name: newRound.investorName.trim(),
            type: 'investor',
            shares: sharesIssued,
            shareClass: newRound.name,
            invested: investment,
            liquidationPref: safe(newRound.liquidationPref),
            isParticipating: newRound.isParticipating
        };

        setFundingRounds([...fundingRounds, round]);
        setStakeholders([...stakeholders, investor]);
        setNewRound({
            name: '', investorName: '', investment: '', preMoneyValuation: '',
            liquidationPref: '1', isParticipating: false
        });
        setError('');
        setFieldErrors({});
    }, [newRound, stakeholders, fundingRounds, totalShares]);

    const removeFundingRound = useCallback((id: string) => {
        if (window.confirm('Remove this funding round and associated investor?')) {
            const round = fundingRounds.find(r => r.id === id);
            if (round) {
                setFundingRounds(fundingRounds.filter(r => r.id !== id));
                setStakeholders(stakeholders.filter(s => s.name !== round.investorName || s.type !== 'investor'));
            }
        }
    }, [fundingRounds, stakeholders]);

    // Exit Waterfall Calculation
    const calculateExitWaterfall = useCallback((): ExitProceeds[] | null => {
        const exitVal = safe(exitValuation);
        if (exitVal <= 0) return null;

        let remaining = exitVal;
        const proceeds: ExitProceeds[] = [];

        // Step 1: Non-participating preferred get their preference
        const nonParticipating = stakeholders.filter(
            s => s.type === 'investor' && s.liquidationPref && !s.isParticipating
        );

        nonParticipating.forEach(inv => {
            const prefAmount = (inv.invested || 0) * (inv.liquidationPref || 1);
            const proRataAmount = (inv.shares / totalShares) * exitVal;
            const payout = Math.min(Math.max(prefAmount, proRataAmount), remaining);

            remaining -= payout;
            proceeds.push({
                name: inv.name,
                amount: payout,
                type: prefAmount > proRataAmount ? 'Liquidation Preference' : 'Pro-Rata (Better)',
                percentage: (payout / exitVal) * 100
            });
        });

        // Step 2: Participating preferred get their preference first
        const participating = stakeholders.filter(
            s => s.type === 'investor' && s.liquidationPref && s.isParticipating
        );

        participating.forEach(inv => {
            const prefAmount = (inv.invested || 0) * (inv.liquidationPref || 1);
            const payout = Math.min(prefAmount, remaining);

            remaining -= payout;
            const existing = proceeds.find(p => p.name === inv.name);
            if (existing) {
                existing.amount += payout;
                existing.type = 'Liquidation Pref (Participating)';
            } else {
                proceeds.push({
                    name: inv.name,
                    amount: payout,
                    type: 'Liquidation Pref (Participating)',
                    percentage: (payout / exitVal) * 100
                });
            }
        });

        // Step 3: Distribute remaining pro-rata to all
        if (remaining > 0) {
            stakeholders.forEach(sh => {
                const ownership = sh.shares / totalShares;
                const payout = remaining * ownership;

                const existing = proceeds.find(p => p.name === sh.name);
                if (existing) {
                    existing.amount += payout;
                    existing.type = existing.type.includes('Participating')
                        ? 'Liquidation Pref + Pro-Rata'
                        : 'Combined Payout';
                    existing.percentage = (existing.amount / exitVal) * 100;
                } else {
                    proceeds.push({
                        name: sh.name,
                        amount: payout,
                        type: 'Pro-Rata',
                        percentage: (payout / exitVal) * 100
                    });
                }
            });
        }

        return proceeds.sort((a, b) => b.amount - a.amount);
    }, [exitValuation, stakeholders, totalShares]);

    // SAFE Management with Proper Conversion
    const addSafe = useCallback(() => {
        const validation = validateSAFE(newSafe);
        if (validation) {
            setFieldErrors({ [validation.field]: validation.message });
            setError(validation.message);
            return;
        }

        const safeNote: SAFE = {
            id: generateId(),
            investorName: newSafe.investorName.trim(),
            amount: safe(newSafe.amount),
            valuationCap: safe(newSafe.valuationCap),
            discount: safe(newSafe.discount)
        };

        setSafes([...safes, safeNote]);
        setNewSafe({ investorName: '', amount: '', valuationCap: '', discount: '20' });
        setError('');
        setFieldErrors({});
    }, [newSafe, safes]);

    const convertSafe = useCallback((safeId: string, pricedRoundValuation?: number) => {
        const safeNote = safes.find(s => s.id === safeId);
        if (!safeNote) return;

        let conversionPrice: number;

        if (pricedRoundValuation && pricedRoundValuation > 0) {
            // Use the lower of: valuation cap price or discounted price
            const capPrice = safeNote.valuationCap / totalShares;
            const roundPrice = pricedRoundValuation / totalShares;
            const discountedPrice = roundPrice * (1 - safeNote.discount / 100);
            conversionPrice = Math.min(capPrice, discountedPrice);
        } else {
            // No priced round - use valuation cap
            conversionPrice = safeNote.valuationCap / totalShares;
        }

        const sharesIssued = safeNote.amount / conversionPrice;

        const investor: Stakeholder = {
            id: generateId(),
            name: `${safeNote.investorName} (SAFE)`,
            type: 'investor',
            shares: sharesIssued,
            shareClass: 'Common',
            invested: safeNote.amount
        };

        setStakeholders([...stakeholders, investor]);
        setSafes(safes.filter(s => s.id !== safeId));
    }, [safes, stakeholders, totalShares]);

    // Export Functionality
    const exportCapTable = useCallback(() => {
        const csvContent = generateCSVContent(stakeholders, fundingRounds, currency, totalShares);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cap-table-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [stakeholders, fundingRounds, currency, totalShares]);

    const resetAll = useCallback(() => {
        if (window.confirm('Reset all data? This cannot be undone.')) {
            setStakeholders([
                { id: '1', name: 'Founder 1', type: 'founder', shares: 4000000, shareClass: 'Common' },
                { id: '2', name: 'Founder 2', type: 'founder', shares: 3000000, shareClass: 'Common' },
                { id: '3', name: 'Option Pool', type: 'option-pool', shares: 1000000, shareClass: 'Common' }
            ]);
            setFundingRounds([]);
            setSafes([]);
            setError('');
            setFieldErrors({});
        }
    }, []);

    // Render Functions
    const renderCurrentCapTable = () => (
        <div className="space-y-6">
            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Cap Table Warnings</h4>
                    <ul className="space-y-1">
                        {warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Add Stakeholder Form */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Plus size={18} /> Add New Stakeholder
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <TextInput
                        label="Name"
                        value={newStakeholder.name}
                        onChange={(v: string) => setNewStakeholder({ ...newStakeholder, name: v })}
                        placeholder="John Doe"
                        error={fieldErrors.name}
                    />
                    <SelectInput
                        label="Type"
                        value={newStakeholder.type}
                        onChange={(v: StakeholderType) => setNewStakeholder({ ...newStakeholder, type: v })}
                        options={stakeholderTypes}
                    />
                    <NumberInput
                        label="Shares"
                        value={newStakeholder.shares}
                        onChange={(v: string) => setNewStakeholder({ ...newStakeholder, shares: v })}
                        placeholder="1000000"
                        error={fieldErrors.shares}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <SelectInput
                        label="Share Class"
                        value={newStakeholder.shareClass}
                        onChange={(v: string) => setNewStakeholder({ ...newStakeholder, shareClass: v })}
                        options={shareClasses.map(c => ({ value: c, label: c }))}
                    />
                    <CurrencyInput
                        label="Amount Invested (Optional)"
                        value={newStakeholder.invested}
                        onChange={(v: string) => setNewStakeholder({ ...newStakeholder, invested: v })}
                        placeholder="0"
                        symbol={symbol}
                        error={fieldErrors.invested}
                    />
                </div>
                <button
                    onClick={addStakeholder}
                    className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-semibold"
                >
                    Add Stakeholder
                </button>
            </div>

            {/* Cap Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-right">Shares</th>
                            <th className="px-4 py-3 text-right">Ownership %</th>
                            <th className="px-4 py-3 text-left">Share Class</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stakeholders.map((sh, idx) => (
                            <tr key={sh.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-pink-50 transition-colors`}>
                                <td className="px-4 py-3 font-semibold">{sh.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${sh.type === 'founder' ? 'bg-purple-100 text-purple-800' :
                                        sh.type === 'investor' ? 'bg-green-100 text-green-800' :
                                            sh.type === 'employee' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {sh.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{sh.shares.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-pink-700">
                                    {calculateOwnershipPercentage(sh.shares, totalShares).toFixed(2)}%
                                </td>
                                <td className="px-4 py-3">{sh.shareClass}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => removeStakeholder(sh.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="Remove"
                                    >
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

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Ownership by Type</h4>
                    {stakeholderTypes.map(type => {
                        const typeShares = stakeholders.filter(s => s.type === type.value).reduce((sum, s) => sum + s.shares, 0);
                        const percentage = calculateOwnershipPercentage(typeShares, totalShares);
                        return typeShares > 0 ? (
                            <div key={type.value} className="mb-2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">{type.label}s</span>
                                    <span className="text-sm font-bold text-pink-700">{percentage.toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
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
                    <TextInput
                        label="Round Name"
                        value={newRound.name}
                        onChange={(v: string) => setNewRound({ ...newRound, name: v })}
                        placeholder="Series A"
                        error={fieldErrors.name}
                    />
                    <TextInput
                        label="Investor Name"
                        value={newRound.investorName}
                        onChange={(v: string) => setNewRound({ ...newRound, investorName: v })}
                        placeholder="XYZ Ventures"
                        error={fieldErrors.investorName}
                    />
                    <CurrencyInput
                        label="Investment Amount"
                        value={newRound.investment}
                        onChange={(v: string) => setNewRound({ ...newRound, investment: v })}
                        placeholder="5000000"
                        symbol={symbol}
                        error={fieldErrors.investment}
                    />
                    <CurrencyInput
                        label="Pre-Money Valuation"
                        value={newRound.preMoneyValuation}
                        onChange={(v: string) => setNewRound({ ...newRound, preMoneyValuation: v })}
                        placeholder="20000000"
                        symbol={symbol}
                        error={fieldErrors.preMoneyValuation}
                    />
                    <NumberInput
                        label="Liquidation Preference (x)"
                        value={newRound.liquidationPref}
                        onChange={(v: string) => setNewRound({ ...newRound, liquidationPref: v })}
                        placeholder="1"
                        min={1}
                        error={fieldErrors.liquidationPref}
                    />
                    <div className="flex items-end pb-3">
                        <CheckboxInput
                            label="Participating Preferred"
                            checked={newRound.isParticipating}
                            onChange={(v: boolean) => setNewRound({ ...newRound, isParticipating: v })}
                        />
                    </div>
                </div>

                {newRound.investment && newRound.preMoneyValuation && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                        <h5 className="font-semibold text-gray-800 mb-2">📊 Round Preview:</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600">Post-Money:</span>
                                <span className="ml-2 font-bold">
                                    {symbol}{formatNum(safe(newRound.preMoneyValuation) + safe(newRound.investment), currency)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Share Price:</span>
                                <span className="ml-2 font-bold">
                                    {symbol}{formatNum(safe(newRound.preMoneyValuation) / totalShares, currency)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Shares Issued:</span>
                                <span className="ml-2 font-bold">
                                    {Math.round(safe(newRound.investment) / (safe(newRound.preMoneyValuation) / totalShares)).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Investor Ownership:</span>
                                <span className="ml-2 font-bold text-pink-700">
                                    {((safe(newRound.investment) / (safe(newRound.preMoneyValuation) / totalShares)) /
                                        (totalShares + (safe(newRound.investment) / (safe(newRound.preMoneyValuation) / totalShares))) * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={addFundingRound}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all font-bold shadow-lg"
                >
                    Add Funding Round
                </button>
            </div>

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
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                            {round.ownership.toFixed(2)}% Ownership
                                        </span>
                                        <button
                                            onClick={() => removeFundingRound(round.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
                                        <span className="text-gray-600">Shares:</span>
                                        <p className="font-bold">{Math.round(round.sharesIssued).toLocaleString()}</p>
                                    </div>
                                </div>
                                {round.liquidationPref > 1 && (
                                    <p className="text-xs text-amber-700 mt-2">
                                        💰 {round.liquidationPref}x Liquidation Preference
                                        {round.isParticipating && ' (Participating)'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderDilution = () => {
        if (fundingRounds.length === 0) {
            return (
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-600 text-center py-8">Add funding rounds to see dilution analysis</p>
                </div>
            );
        }

        const founders = stakeholders.filter(s => s.type === 'founder' || s.type === 'employee');

        return (
            <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <GitBranch size={20} /> Dilution Analysis
                    </h4>
                    <div className="space-y-4">
                        {founders.map(sh => {
                            const currentOwnership = calculateOwnershipPercentage(sh.shares, totalShares);

                            return (
                                <div key={sh.id} className="p-4 bg-white rounded-lg border border-yellow-300">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-bold text-gray-800">{sh.name}</h5>
                                        <span className="text-sm font-semibold text-pink-700">
                                            {currentOwnership.toFixed(2)}% Current
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>Shares: {sh.shares.toLocaleString()} (unchanged)</p>
                                        <p className="mt-1">
                                            Fully Diluted Ownership after {fundingRounds.length} funding round(s)
                                        </p>
                                    </div>
                                    <div className="mt-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                                                style={{ width: `${currentOwnership}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Dilution Summary</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-left">Stakeholder</th>
                                    <th className="px-3 py-2 text-right">Shares</th>
                                    <th className="px-3 py-2 text-right">Current %</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {founders.map((sh, idx) => (
                                    <tr key={sh.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-3 py-2 font-semibold">{sh.name}</td>
                                        <td className="px-3 py-2 text-right font-mono">{sh.shares.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-right font-bold">
                                            {calculateOwnershipPercentage(sh.shares, totalShares).toFixed(2)}%
                                        </td>
                                        <td className="px-3 py-2">
                                            {calculateOwnershipPercentage(sh.shares, totalShares) > 20 ? (
                                                <span className="text-green-600">✓ Strong Position</span>
                                            ) : calculateOwnershipPercentage(sh.shares, totalShares) > 10 ? (
                                                <span className="text-yellow-600">⚠ Moderate</span>
                                            ) : (
                                                <span className="text-red-600">⚠ Heavily Diluted</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderExitWaterfall = () => {
        const waterfall = calculateExitWaterfall();
        const totalInvested = stakeholders
            .filter(s => s.invested)
            .reduce((sum, s) => sum + (s.invested || 0), 0);

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
                            error={fieldErrors.exitValuation}
                        />
                    </div>
                    {totalInvested > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                            Total capital invested: {symbol}{formatNum(totalInvested, currency)}
                        </p>
                    )}
                </div>

                {waterfall && (
                    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-4">💰 Exit Proceeds Distribution</h4>
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold">Total Exit Value:</span>
                                <span className="text-xl font-bold text-green-700">
                                    {symbol}{formatNum(safe(exitValuation), currency)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {waterfall.map((proc, idx) => (
                                <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{proc.name}</p>
                                            <p className="text-xs text-gray-600">{proc.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-700">
                                                {symbol}{formatNum(proc.amount, currency)}
                                            </p>
                                            <p className="text-xs text-gray-600">{proc.percentage.toFixed(2)}% of exit</p>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                                style={{ width: `${proc.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderOptions = () => {
        const optionPools = stakeholders.filter(s => s.type === 'option-pool');
        const totalOptionShares = optionPools.reduce((sum, p) => sum + p.shares, 0);
        const optionPercent = calculateOwnershipPercentage(totalOptionShares, totalShares);

        return (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users size={20} /> Employee Option Pool Management
                </h4>
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-blue-300">
                        <h5 className="font-semibold text-gray-800 mb-3">Current Option Pool</h5>
                        {optionPools.map(pool => (
                            <div key={pool.id} className="mb-3">
                                <p className="text-sm text-gray-600">
                                    Pool: <span className="font-bold">{pool.name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Reserved Shares: <span className="font-bold font-mono">{pool.shares.toLocaleString()}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Percentage: <span className="font-bold text-pink-700">
                                        {calculateOwnershipPercentage(pool.shares, totalShares).toFixed(2)}%
                                    </span>
                                </p>
                            </div>
                        ))}
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                            <p className="text-sm font-semibold text-blue-900">
                                Total Option Pool: {optionPercent.toFixed(2)}%
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                    style={{ width: `${optionPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-blue-300">
                        <h5 className="font-semibold text-gray-800 mb-2">💡 Best Practices</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Early-stage: 10-20% option pool</li>
                            <li>• Pre-Series A: 15-20% recommended</li>
                            <li>• Post-Series A: 10-15% typical</li>
                            <li>• Refresh pool before major funding rounds</li>
                        </ul>
                    </div>

                    {optionPercent < 10 && fundingRounds.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Option pool below 10% - consider increasing for future hires
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSafes = () => (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calculator size={20} /> Add SAFE / Convertible Note
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label="Investor Name"
                        value={newSafe.investorName}
                        onChange={(v: string) => setNewSafe({ ...newSafe, investorName: v })}
                        placeholder="Angel Investor"
                        error={fieldErrors.investorName}
                    />
                    <CurrencyInput
                        label="Investment Amount"
                        value={newSafe.amount}
                        onChange={(v: string) => setNewSafe({ ...newSafe, amount: v })}
                        placeholder="500000"
                        symbol={symbol}
                        error={fieldErrors.amount}
                    />
                    <CurrencyInput
                        label="Valuation Cap"
                        value={newSafe.valuationCap}
                        onChange={(v: string) => setNewSafe({ ...newSafe, valuationCap: v })}
                        placeholder="10000000"
                        symbol={symbol}
                        error={fieldErrors.valuationCap}
                    />
                    <NumberInput
                        label="Discount %"
                        value={newSafe.discount}
                        onChange={(v: string) => setNewSafe({ ...newSafe, discount: v })}
                        placeholder="20"
                        min={0}
                        max={50}
                        error={fieldErrors.discount}
                    />
                </div>
                <button
                    onClick={addSafe}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all font-bold shadow-lg"
                >
                    Add SAFE
                </button>
            </div>

            {safes.length > 0 && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">📋 Pending SAFEs</h4>
                    <div className="space-y-3">
                        {safes.map(safeNote => (
                            <div key={safeNote.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-800">{safeNote.investorName}</h5>
                                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                                            <p>Amount: <span className="font-semibold">{symbol}{formatNum(safeNote.amount, currency)}</span></p>
                                            <p>Valuation Cap: <span className="font-semibold">{symbol}{formatNum(safeNote.valuationCap, currency)}</span></p>
                                            <p>Discount: <span className="font-semibold">{safeNote.discount}%</span></p>
                                            <p className="text-xs text-purple-700 mt-2">
                                                💡 Converts at lower of: valuation cap price or {safeNote.discount}% discounted price
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => convertSafe(safeNote.id)}
                                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all text-sm font-semibold ml-4"
                                        title="Convert to equity using valuation cap"
                                    >
                                        Convert to Equity
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-800">
                            💡 <strong>Tip:</strong> SAFEs convert when you raise a priced round. The conversion price will be the lower of the valuation cap price or the discounted round price.
                        </p>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="">
                <div className="">

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
                            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="flex-1 text-sm text-red-800 font-medium">{error}</span>
                            <button onClick={() => { setError(''); setFieldErrors({}); }} className="text-red-600 hover:text-red-800">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* Currency Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">💱 Select Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                            className="w-full md:w-64 px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 bg-white font-medium"
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
                                        onClick={() => { setActiveView(view.id as ViewType); setError(''); setFieldErrors({}); }}
                                        className={`p-4 rounded-md border-2 transition-all text-left hover:scale-105 ${isActive ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg' :
                                            'border-gray-200 hover:border-pink-300 bg-white'
                                            }`}
                                    >
                                        <Icon size={24} className={`mb-2 ${isActive ? 'text-pink-600' : 'text-gray-500'}`} />
                                        <p className={`text-xs font-bold mb-1 ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>
                                            {view.name}
                                        </p>
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
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:from-pink-600 hover:to-rose-600 font-bold shadow-lg transition-all"
                        >
                            <Download size={20} /> Export Cap Table (CSV)
                        </button>
                        <button
                            onClick={resetAll}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-bold shadow-md transition-all"
                        >
                            <RotateCcw size={20} /> Reset All
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            💡 <strong>Pro Tip:</strong> Regularly update your cap table after each funding event to maintain accuracy.
                            Use the dilution analysis to track founder ownership over time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}