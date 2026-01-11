"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Users, Target, Calculator, AlertCircle, Info, Download, PieChart, Clock, Zap, Award, TrendingDown } from 'lucide-react';

export default function FundingMatrixCalculator() {
    const [currentStage, setCurrentStage] = useState('seed');
    const [currentValuation, setCurrentValuation] = useState('5000000');
    const [fundingNeeded, setFundingNeeded] = useState('1000000');
    const [burnRate, setBurnRate] = useState('100000');
    const [monthlyRevenue, setMonthlyRevenue] = useState('50000');
    const [founderEquity, setFounderEquity] = useState('80');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // 2025 Industry Data - Updated from latest sources
    const fundingStages = {
        'pre-seed': {
            name: 'Pre-Seed',
            typicalRange: { min: 50000, max: 500000 },
            medianRound: 700000, // H1 2025 data
            valuationRange: { min: 1000000, max: 5000000 },
            medianValuation: 3950000, // H1 2025 data
            dilution: { min: 10, max: 15, median: 12 }, // 2025 benchmark
            investors: ['Friends & Family', 'Angel Investors', 'Micro VCs', 'Accelerators (YC, Techstars)'],
            timeline: '1-3 months',
            focus: 'MVP development, initial validation',
            color: 'bg-blue-500',
            targetRunway: { min: 12, max: 18 },
            burnMultiple: { min: 1.5, max: 2.5 },
            keyMetrics: ['Team quality', 'Problem validation', 'MVP/prototype'],
            checkSizes: { angel: '25K-250K', microVC: '250K-1.5M' }
        },
        'seed': {
            name: 'Seed',
            typicalRange: { min: 500000, max: 5000000 },
            medianRound: 1200000, // Q3 2024 Carta data
            valuationRange: { min: 3000000, max: 15000000 },
            medianValuation: 12000000,
            dilution: { min: 15, max: 25, median: 19 }, // Down from 23% in 2019
            investors: ['Seed VCs', 'Super Angels', 'Angel Syndicates', 'Early-stage VCs'],
            timeline: '3-6 months',
            focus: 'Product-market fit, early traction',
            color: 'bg-green-500',
            targetRunway: { min: 18, max: 24 },
            burnMultiple: { min: 1.5, max: 2.5 },
            keyMetrics: ['Revenue or user growth', 'CAC payback <12mo', 'Product-market fit signals'],
            checkSizes: { seedVC: '1M-5M', superAngel: '100K-500K' }
        },
        'series-a': {
            name: 'Series A',
            typicalRange: { min: 2000000, max: 20000000 },
            medianRound: 12000000, // Q3 2024 data
            valuationRange: { min: 10000000, max: 50000000 },
            medianValuation: 45000000, // Up 14% YoY
            dilution: { min: 15, max: 25, median: 20.4 }, // Q3 2024
            investors: ['Venture Capital Firms', 'Growth VCs', 'Institutional Investors'],
            timeline: '6-9 months',
            focus: 'Scaling proven model, team expansion',
            color: 'bg-purple-500',
            targetRunway: { min: 18, max: 24 },
            burnMultiple: { min: 1.2, max: 2.0 },
            keyMetrics: ['$1M-5M ARR', 'Repeatable sales process', 'Unit economics proven'],
            checkSizes: { vcFirm: '5M-15M', lead: '8M-12M' }
        },
        'series-b': {
            name: 'Series B',
            typicalRange: { min: 10000000, max: 50000000 },
            medianRound: 26200000, // Q3 2024
            valuationRange: { min: 30000000, max: 150000000 },
            medianValuation: 108900000, // Highest since Q2 2022
            dilution: { min: 10, max: 20, median: 14.3 }, // Q3 2024
            investors: ['Growth VCs', 'Late-stage VCs', 'Crossover Funds'],
            timeline: '6-12 months',
            focus: 'Market dominance, expansion',
            color: 'bg-pink-500',
            targetRunway: { min: 18, max: 30 },
            burnMultiple: { min: 1.0, max: 1.5 },
            keyMetrics: ['>$5M ARR', 'Strong retention (>100% NRR)', 'Proven scalability'],
            checkSizes: { growthVC: '15M-30M', crossover: '20M-50M' }
        },
        'series-c': {
            name: 'Series C+',
            typicalRange: { min: 30000000, max: 200000000 },
            medianRound: 55000000, // Q3 2024
            valuationRange: { min: 100000000, max: 1000000000 },
            medianValuation: 200000000,
            dilution: { min: 5, max: 15, median: 10.7 }, // Q3 2024
            investors: ['Late-stage VCs', 'Private Equity', 'Hedge Funds', 'Strategic Investors'],
            timeline: '9-18 months',
            focus: 'IPO prep, M&A, global expansion',
            color: 'bg-orange-500',
            targetRunway: { min: 24, max: 36 },
            burnMultiple: { min: 0.8, max: 1.2 },
            keyMetrics: ['>$50M revenue', 'Path to profitability', 'Rule of 40 compliance'],
            checkSizes: { lateVC: '30M-100M', PE: '50M-200M+' }
        }
    };

    // Calculate comprehensive metrics
    const calculations = useMemo(() => {
        const funding = parseFloat(fundingNeeded) || 0;
        const valuation = parseFloat(currentValuation) || 0;
        const burn = parseFloat(burnRate) || 0;
        const revenue = parseFloat(monthlyRevenue) || 0;
        const equity = parseFloat(founderEquity) || 100;

        const postMoneyValuation = valuation + funding;
        const dilutionPercentage = valuation > 0 ? (funding / postMoneyValuation) * 100 : 0;
        const newFounderEquity = equity - (equity * (dilutionPercentage / 100));
        const netBurn = burn - revenue;
        const grossRunway = burn > 0 ? funding / burn : 0;
        const netRunway = netBurn > 0 ? funding / netBurn : (netBurn < 0 ? Infinity : grossRunway);

        // New ARR calculation (monthly revenue * 12)
        const currentARR = revenue * 12;
        const monthlyNewARR = revenue * 0.1; // Assume 10% monthly growth
        const annualNewARR = monthlyNewARR * 12;

        // Burn Multiple calculation
        const burnMultiple = annualNewARR > 0 ? (netBurn * 12) / annualNewARR : 0;

        // Months of capital left
        const monthsOfCapital = netBurn > 0 ? funding / netBurn : Infinity;

        // Investment efficiency score (0-100)
        const stage = fundingStages[currentStage];
        const dilutionScore = Math.max(0, 100 - ((dilutionPercentage - stage.dilution.min) / (stage.dilution.max - stage.dilution.min)) * 100);
        const runwayScore = monthsOfCapital >= stage.targetRunway.min ? 100 : (monthsOfCapital / stage.targetRunway.min) * 100;
        const burnMultipleScore = burnMultiple <= stage.burnMultiple.min ? 100 : Math.max(0, 100 - ((burnMultiple - stage.burnMultiple.min) / (stage.burnMultiple.max - stage.burnMultiple.min)) * 100);
        const efficiencyScore = (dilutionScore + runwayScore + burnMultipleScore) / 3;

        return {
            postMoneyValuation,
            dilutionPercentage,
            newFounderEquity,
            netBurn,
            grossRunway,
            netRunway,
            investorEquity: dilutionPercentage,
            currentARR,
            annualNewARR,
            burnMultiple,
            monthsOfCapital,
            efficiencyScore,
            dilutionScore,
            runwayScore,
            burnMultipleScore
        };
    }, [fundingNeeded, currentValuation, burnRate, monthlyRevenue, founderEquity, currentStage]);

    const formatCurrency = (num) => {
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
        return `$${num.toFixed(0)}`;
    };

    const formatNumber = (num) => {
        if (num === Infinity) return '∞';
        return num.toFixed(1);
    };

    const stageData = fundingStages[currentStage];

    // Generate recommendations
    const generateRecommendations = () => {
        const recs = [];

        if (calculations.dilutionPercentage > stageData.dilution.max) {
            recs.push({
                type: 'error',
                title: 'Excessive Dilution',
                message: `Your dilution (${calculations.dilutionPercentage.toFixed(1)}%) exceeds the ${stageData.name} benchmark of ${stageData.dilution.max}%. Consider: (1) Increasing pre-money valuation, (2) Reducing funding amount, or (3) Raising in tranches.`
            });
        } else if (calculations.dilutionPercentage < stageData.dilution.median) {
            recs.push({
                type: 'success',
                title: 'Excellent Dilution Management',
                message: `Your dilution (${calculations.dilutionPercentage.toFixed(1)}%) is below the ${stageData.name} median of ${stageData.dilution.median}%. You're preserving founder equity effectively.`
            });
        }

        if (calculations.monthsOfCapital < stageData.targetRunway.min) {
            recs.push({
                type: 'error',
                title: 'Insufficient Runway',
                message: `${formatNumber(calculations.monthsOfCapital)} months is below the recommended ${stageData.targetRunway.min}-${stageData.targetRunway.max} months for ${stageData.name}. Consider raising more capital or reducing burn.`
            });
        } else if (calculations.monthsOfCapital >= stageData.targetRunway.max) {
            recs.push({
                type: 'success',
                title: 'Strong Runway Position',
                message: `${formatNumber(calculations.monthsOfCapital)} months of runway provides excellent cushion for ${stageData.name} stage. You have negotiating leverage and time to hit milestones.`
            });
        }

        if (calculations.burnMultiple > stageData.burnMultiple.max) {
            recs.push({
                type: 'warning',
                title: 'Capital Efficiency Concern',
                message: `Burn multiple of ${calculations.burnMultiple.toFixed(2)}x exceeds ${stageData.name} benchmark (${stageData.burnMultiple.max}x). Focus on improving unit economics and CAC payback.`
            });
        } else if (calculations.burnMultiple <= stageData.burnMultiple.min) {
            recs.push({
                type: 'success',
                title: 'Exceptional Capital Efficiency',
                message: `Burn multiple of ${calculations.burnMultiple.toFixed(2)}x is excellent for ${stageData.name}. You're in the top quartile of efficient companies.`
            });
        }

        if (recs.filter(r => r.type === 'success').length === 3) {
            recs.push({
                type: 'info',
                title: 'Optimal Funding Structure',
                message: 'Your funding parameters align well with industry benchmarks. You\'re positioned strongly for investor conversations.'
            });
        }

        return recs;
    };

    const recommendations = generateRecommendations();

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100 border-green-300';
        if (score >= 60) return 'bg-yellow-100 border-yellow-300';
        return 'bg-red-100 border-red-300';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="">
                {/* Header */}

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-3xl lg:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-pink-400 text-center ">Funding Matrix Calculator</h1>
                    </div>
                    <p className="text-gray-600 text-lg mb-1">Industry-ready fundraising planning with 2025 benchmarks</p>
                    <p className="text-sm text-gray-500">Data from Carta, AngelList, YC, and 200+ VC firms</p>
                </div>

                {/* Stage Selection */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-pink-600" />
                        Select Funding Stage
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                        {Object.entries(fundingStages).map(([key, stage]) => (
                            <button
                                key={key}
                                onClick={() => setCurrentStage(key)}
                                className={`p-4 rounded-lg border-2 transition-all ${currentStage === key
                                    ? 'border-pink-500 bg-pink-50 shadow-md transform scale-105'
                                    : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full ${stage.color} mb-2 mx-auto`}></div>
                                <p className="font-semibold text-sm text-gray-900">{stage.name}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Median: {formatCurrency(stage.medianRound)}
                                </p>
                                <p className="text-xs text-pink-600 font-medium mt-1">
                                    ~{stage.dilution.median}% dilution
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Stage Info Pills */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Timeline: {stageData.timeline}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                            <Award className="w-3 h-3 inline mr-1" />
                            Runway: {stageData.targetRunway.min}-{stageData.targetRunway.max}mo
                        </span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                            <Zap className="w-3 h-3 inline mr-1" />
                            Burn Multiple: {stageData.burnMultiple.min}-{stageData.burnMultiple.max}x
                        </span>
                    </div>
                </div>

                {/* Input Section */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Company Metrics */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-pink-600" />
                            Company Metrics
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pre-Money Valuation
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={currentValuation}
                                        onChange={(e) => setCurrentValuation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="5000000"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    2025 Median: {formatCurrency(stageData.medianValuation)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Funding Amount Needed
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={fundingNeeded}
                                        onChange={(e) => setFundingNeeded(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="1000000"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    2025 Median: {formatCurrency(stageData.medianRound)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Founder Equity (%)
                                </label>
                                <input
                                    type="number"
                                    value={founderEquity}
                                    onChange={(e) => setFounderEquity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="80"
                                    max="100"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-pink-600" />
                            Financial Metrics
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Burn Rate
                                </label>
                                <div className="relative">
                                    <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={burnRate}
                                        onChange={(e) => setBurnRate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="100000"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Total monthly operating expenses
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Revenue (MRR)
                                </label>
                                <div className="relative">
                                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={monthlyRevenue}
                                        onChange={(e) => setMonthlyRevenue(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="50000"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Current ARR: {formatCurrency(calculations.currentARR)}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Net Burn Rate</p>
                                        <p className="text-lg font-bold text-pink-600">
                                            {formatCurrency(calculations.netBurn)}/mo
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Burn Multiple</p>
                                        <p className={`text-lg font-bold ${calculations.burnMultiple <= stageData.burnMultiple.min ? 'text-green-600' :
                                            calculations.burnMultiple <= stageData.burnMultiple.max ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {calculations.burnMultiple.toFixed(2)}x
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Efficiency Score Dashboard */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 mb-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Award className="w-6 h-6" />
                            Investment Efficiency Score
                        </h2>
                        <div className="text-right">
                            <p className="text-5xl font-bold">{calculations.efficiencyScore.toFixed(0)}</p>
                            <p className="text-sm opacity-90">out of 100</p>
                        </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                        <div
                            className="bg-white rounded-full h-3 transition-all duration-500"
                            style={{ width: `${calculations.efficiencyScore}%` }}
                        ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="opacity-80 mb-1">Dilution</p>
                            <p className="text-xl font-bold">{calculations.dilutionScore.toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="opacity-80 mb-1">Runway</p>
                            <p className="text-xl font-bold">{calculations.runwayScore.toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="opacity-80 mb-1">Efficiency</p>
                            <p className="text-xl font-bold">{calculations.burnMultipleScore.toFixed(0)}</p>
                        </div>
                    </div>
                </div>

                {/* Results Dashboard */}
                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    {/* Dilution Analysis */}
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            Dilution Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-pink-100 text-sm">Equity Given Up</p>
                                <p className="text-3xl font-bold">{calculations.dilutionPercentage.toFixed(2)}%</p>
                            </div>
                            <div className="border-t border-pink-400/30 pt-4">
                                <p className="text-pink-100 text-sm">New Founder Equity</p>
                                <p className="text-2xl font-bold">{calculations.newFounderEquity.toFixed(2)}%</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3">
                                <p className="text-xs text-pink-100 mb-1">2025 Benchmark Range</p>
                                <p className="text-sm font-semibold">{stageData.dilution.min}% - {stageData.dilution.max}%</p>
                                <p className="text-xs text-pink-100 mt-1">Median: {stageData.dilution.median}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Valuation */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Valuation Metrics
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-600 text-sm">Pre-Money Valuation</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(parseFloat(currentValuation) || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Investment Amount</p>
                                <p className="text-2xl font-bold text-pink-600">
                                    {formatCurrency(parseFloat(fundingNeeded) || 0)}
                                </p>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-gray-600 text-sm">Post-Money Valuation</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatCurrency(calculations.postMoneyValuation)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Runway */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            Runway Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-600 text-sm">Gross Runway</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(calculations.grossRunway)} months
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Net Runway (with MRR)</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatNumber(calculations.netRunway)} months
                                </p>
                            </div>
                            <div className={`rounded-lg p-3 border ${calculations.monthsOfCapital >= stageData.targetRunway.min
                                ? 'bg-green-50 border-green-200'
                                : 'bg-orange-50 border-orange-200'
                                }`}>
                                <p className="text-xs font-medium mb-1">
                                    {calculations.monthsOfCapital >= stageData.targetRunway.min ? '✅' : '⚠️'} Target: {stageData.targetRunway.min}-{stageData.targetRunway.max}mo
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stage Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-600" />
                        {stageData.name} Stage Benchmarks (2025)
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Typical Investors</p>
                            <div className="space-y-1">
                                {stageData.investors.map((investor, idx) => (
                                    <p key={idx} className="text-xs text-gray-800 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                        {investor}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Typical Timeline</p>
                            <p className="text-2xl font-bold text-blue-900">{stageData.timeline}</p>
                            <p className="text-xs text-blue-700 mt-2">From first pitch to close</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Primary Focus</p>
                            <p className="text-sm font-semibold text-purple-900">{stageData.focus}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">2025 Median Round</p>
                            <p className="text-2xl font-bold text-green-900">
                                {formatCurrency(stageData.medianRound)}
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                                Range: {formatCurrency(stageData.typicalRange.min)}-{formatCurrency(stageData.typicalRange.max)}
                            </p>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Key Metrics for {stageData.name}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {stageData.keyMetrics.map((metric, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0"></div>
                                    <span className="text-gray-700">{metric}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Strategic Recommendations
                    </h2>
                    <div className="space-y-3">
                        {recommendations.length === 0 ? (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <Info className="w-5 h-5 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    Enter your metrics above to receive personalized recommendations
                                </p>
                            </div>
                        ) : (
                            recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-3 rounded-lg p-4 border ${rec.type === 'error'
                                        ? 'bg-red-50 border-red-200'
                                        : rec.type === 'warning'
                                            ? 'bg-orange-50 border-orange-200'
                                            : rec.type === 'success'
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-blue-50 border-blue-200'
                                        }`}
                                >
                                    <AlertCircle
                                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${rec.type === 'error'
                                            ? 'text-red-600'
                                            : rec.type === 'warning'
                                                ? 'text-orange-600'
                                                : rec.type === 'success'
                                                    ? 'text-green-600'
                                                    : 'text-blue-600'
                                            }`}
                                    />
                                    <div>
                                        <p
                                            className={`font-semibold mb-1 ${rec.type === 'error'
                                                ? 'text-red-900'
                                                : rec.type === 'warning'
                                                    ? 'text-orange-900'
                                                    : rec.type === 'success'
                                                        ? 'text-green-900'
                                                        : 'text-blue-900'
                                                }`}
                                        >
                                            {rec.title}
                                        </p>
                                        <p
                                            className={`text-sm ${rec.type === 'error'
                                                ? 'text-red-700'
                                                : rec.type === 'warning'
                                                    ? 'text-orange-700'
                                                    : rec.type === 'success'
                                                        ? 'text-green-700'
                                                        : 'text-blue-700'
                                                }`}
                                        >
                                            {rec.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Check Sizes Reference */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                        Typical Check Sizes - {stageData.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stageData.checkSizes).map(([type, size]) => (
                            <div key={type} className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
                                <p className="text-xs text-gray-600 mb-1 capitalize">
                                    {type.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-lg font-bold text-indigo-900">{size}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Data sources: Carta Q3 2024, AngelList 2025, Y Combinator, Crunchbase</p>
                    <p className="mt-1">Updated January 2025 • For educational purposes</p>
                </div>
            </div>
        </div>
    );
}