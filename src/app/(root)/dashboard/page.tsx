

"use client"
import React, { useState } from 'react';
import { Calculator, PieChart, TrendingUp, Users, ChevronRight, Sparkles, BarChart3, Target, Clock, Zap, CheckCircle, ArrowRight, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';


// ==================== TYPES ====================
type ToolType = 'dashboard' | 'valuation' | 'captable';

interface Tool {
    id: string;
    name: string;
    shortName: string;
    description: string;
    icon: any;
    gradient: string;
    borderColor: string;
    textColor: string;
    features: string[];
    badge?: string;
    comingSoon?: boolean;
    popular?: boolean;
}

// ==================== TOOLS CONFIGURATION ====================
const tools: Tool[] = [
    {
        id: 'valuation-calculator',
        name: 'Startup Valuation Calculator',
        shortName: 'Valuation',
        description: 'Calculate your startup value using 10 industry-standard methods including VC, DCF, and Scorecard approaches.',
        icon: Calculator,
        gradient: 'from-pink-500 via-rose-500 to-pink-600',
        borderColor: 'border-pink-200',
        textColor: 'text-pink-600',
        badge: '10 Methods',
        popular: true,
        features: [
            'VC Method & Pre/Post Money',
            'DCF Analysis',
            'Comparable Company',
            'Revenue & EBITDA Multiples',
            'Scorecard & Berkus',
            'Multi-currency Support'
        ]
    },
    {
        id: 'captable-calculator',
        name: 'Cap Table Calculator',
        shortName: 'Cap Table',
        description: 'Manage equity ownership, simulate funding rounds, track dilution, and calculate exit scenarios with precision.',
        icon: PieChart,
        gradient: 'from-purple-500 via-violet-500 to-purple-600',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-600',
        badge: 'Full Suite',
        popular: true,
        features: [
            'Ownership Tracking',
            'Funding Round Modeling',
            'Dilution Analysis',
            'Exit Waterfall',
            'Option Pool Management',
            'SAFE Conversion'
        ]
    },
    {
        id: 'financial',
        name: 'Financial Projections',
        shortName: 'Financials',
        description: 'Build comprehensive 3-5 year financial models with revenue, expenses, and detailed cash flow projections.',
        icon: TrendingUp,
        gradient: 'from-blue-500 via-cyan-500 to-blue-600',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600',
        features: [
            'Revenue Forecasting',
            'Expense Planning',
            'Cash Flow Analysis',
            'Break-even Calculator',
            'Burn Rate & Runway',
            'P&L Statements'
        ],
        comingSoon: true
    },
    {
        id: 'fundraising',
        name: 'Fundraising Tracker',
        shortName: 'Fundraising',
        description: 'Organize your fundraising pipeline, track investor conversations, and manage term sheet negotiations.',
        icon: Target,
        gradient: 'from-emerald-500 via-green-500 to-emerald-600',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-600',
        features: [
            'Investor Pipeline CRM',
            'Meeting Notes',
            'Term Sheet Comparison',
            'Due Diligence Tracker',
            'Document Management',
            'Timeline & Milestones'
        ],
        comingSoon: true
    },
    {
        id: 'metrics',
        name: 'Startup Metrics Dashboard',
        shortName: 'Metrics',
        description: 'Monitor critical KPIs and metrics that investors care about for tracking growth and performance.',
        icon: BarChart3,
        gradient: 'from-orange-500 via-amber-500 to-orange-600',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-600',
        features: [
            'MRR/ARR Tracking',
            'CAC & LTV Analysis',
            'Churn Rate Monitor',
            'Growth Metrics',
            'Unit Economics',
            'Cohort Analysis'
        ],
        comingSoon: true
    },
    {
        id: 'equity',
        name: 'Employee Equity Calculator',
        shortName: 'Equity Comp',
        description: 'Calculate fair equity compensation packages with vesting schedules and option valuations for your team.',
        icon: Users,
        gradient: 'from-indigo-500 via-blue-500 to-indigo-600',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-600',
        features: [
            'Role-based Equity Ranges',
            'Vesting Schedules',
            'Strike Price Calculator',
            '409A Integration',
            'Tax Implications',
            'Offer Letter Templates'
        ],
        comingSoon: true
    }
];

// ==================== TOOL CARD COMPONENT ====================
const ToolCard = ({ tool, onClick }: { tool: Tool; onClick: () => void }) => {
    const Icon = tool.icon;

    const router = useRouter();

    return (
        <div
            className={`group relative bg-white rounded-xl transition-all duration-300 ${tool.comingSoon
                ? 'hover:shadow-md cursor-default'
                : 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
                } border-2 ${tool.comingSoon ? 'border-gray-200' : `${tool.borderColor} hover:border-opacity-50`} overflow-hidden`}
            onClick={!tool.comingSoon ? onClick : undefined}
        >
            {/* Popular Badge */}
            {tool.popular && !tool.comingSoon && (
                <div className="absolute top-3 right-3 z-10">
                    <div className={`flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r ${tool.gradient} rounded-full shadow-lg`}>
                        <Sparkles size={12} className="text-white" />
                        <span className="text-xs font-bold text-white">Popular</span>
                    </div>
                </div>
            )}

            {/* Coming Soon Badge */}
            {tool.comingSoon && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full shadow-md">
                        <Clock size={12} className="text-white" />
                        <span className="text-xs font-bold text-white">Coming Soon</span>
                    </div>
                </div>
            )}

            <div className="p-6 sm:p-8">
                {/* Icon Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg ${!tool.comingSoon && 'group-hover:scale-110'
                        } transition-transform duration-300`}>
                        <Icon size={28} className="text-white" />
                        {!tool.comingSoon && (
                            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        )}
                    </div>

                    {tool.badge && (
                        <div className={`px-2.5 py-1 bg-gray-100 ${tool.comingSoon ? 'opacity-50' : ''} rounded-md`}>
                            <span className="text-xs font-semibold text-gray-600">{tool.badge}</span>
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div className="mb-4">
                    <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-2 ${!tool.comingSoon && 'group-hover:' + tool.textColor} transition-colors`}>
                        {tool.name}
                    </h3>
                    <p className={`text-sm text-gray-600 leading-relaxed ${tool.comingSoon && 'opacity-60'}`}>
                        {tool.description}
                    </p>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                    {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <CheckCircle
                                size={16}
                                className={`mt-0.5 flex-shrink-0 ${tool.comingSoon ? 'text-gray-300' : tool.textColor}`}
                            />
                            <span className={`text-xs sm:text-sm ${tool.comingSoon ? 'text-gray-400' : 'text-gray-700'}`}>
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={() => router.push(`/resources/${tool.id}`)}
                    disabled={tool.comingSoon}
                    className={`w-full py-3 sm:py-3.5 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${tool.comingSoon
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${tool.gradient} text-white shadow-md hover:shadow-xl active:scale-95`
                        }`}
                >
                    {tool.comingSoon ? (
                        <>
                            <Clock size={18} />
                            <span className="text-sm">Notify When Ready</span>
                        </>
                    ) : (
                        <>
                            <span className="text-sm sm:text-base">Open {tool.shortName}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// ==================== FEATURE CARD COMPONENT ====================
const FeatureCard = ({ icon: Icon, title, description, gradient }: any) => (
    <div className="text-center p-6 sm:p-8">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Icon size={28} className="text-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
);

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ label, value, icon: Icon, gradient }: any) => (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md flex flex-col items-center gap-3  border-2 border-gray-100 hover:shadow-lg transition-shadow">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
            <Icon size={20} className="text-white" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-xs sm:text-sm text-gray-600">{label}</div>
    </div>
);

// ==================== MAIN DASHBOARD COMPONENT ====================
export default function StartupToolsDashboard() {
    const [selectedTool, setSelectedTool] = useState<ToolType>('dashboard');

    const activeTools = tools.filter(t => !t.comingSoon);
    const comingSoonTools = tools.filter(t => t.comingSoon);

    const handleToolClick = (toolId: string) => {
        if (toolId === 'valuation' || toolId === 'captable') {
            setSelectedTool(toolId as ToolType);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBackToDashboard = () => {
        setSelectedTool('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Main Dashboard View
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Navigation Bar */}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

                {/* Hero Section */}
                <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-full mb-6 sm:mb-8">
                        <Sparkles className="text-pink-600" size={18} />
                        <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                            Essential Startup Toolkit
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-8xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
                        Build, Value & Grow
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600">
                            Your Startup
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
                        Professional-grade calculators and tools trusted by founders, investors, and advisors.
                        Make data-driven decisions with confidence.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-3xl mx-auto">
                        <StatCard
                            label="Active Tools"
                            value={activeTools.length}
                            icon={Zap}
                            gradient="from-pink-500 to-rose-500"
                        />
                        <StatCard
                            label="Coming Soon"
                            value={comingSoonTools.length}
                            icon={Clock}
                            gradient="from-purple-500 to-violet-500"
                        />
                        <StatCard
                            label="Total Features"
                            value="36+"
                            icon={Sparkles}
                            gradient="from-blue-500 to-cyan-500"
                        />
                    </div>
                </div>

                {/* Active Tools Section */}
                <div className="mb-12 sm:mb-16 lg:mb-20">
                    <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Available Now</h2>
                            <p className="text-sm sm:text-base text-gray-600">Start using these tools immediately</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {activeTools.map((tool) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                onClick={() => handleToolClick(tool.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Coming Soon Tools Section */}
                <div className="mb-12 sm:mb-16 lg:mb-20">
                    <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                            <p className="text-sm sm:text-base text-gray-600">More powerful tools on the way</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {comingSoonTools.map((tool) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                onClick={() => { }}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    </div>
                    <div className="relative text-center">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                            Ready to Get Started?
                        </h3>
                        <p className="text-pink-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                            Join thousands of founders making better decisions with our professional toolkit.
                            Choose a tool above and start building your startup's future today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-all shadow-lg text-sm sm:text-base">
                                Explore All Tools
                            </button>
                            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-xl font-bold hover:bg-white/10 transition-all border-2 border-white text-sm sm:text-base">
                                Get Updates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}