"use client";

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import {
    TrendingUp, Users, Briefcase, Filter, Clock,
    MapPin, ChevronRight, Calendar, Globe, Target, Award, TrendingDown, Eye, Heart, CheckCircle,
    DollarSign
} from 'lucide-react';

// ============ DATA ============
const STATS = [
    {
        label: 'Portfolio Value',
        value: '₹3.2Cr',
        change: '+12.5%',
        positive: true,
        subtext: 'vs last quarter',
        color: 'from-pink-500 to-pink-600'
    },
    {
        label: 'Active Investments',
        value: '18',
        icon: Briefcase,
        change: '+3',
        positive: true,
        subtext: 'this month',
        color: 'from-purple-500 to-purple-600'
    },
    {
        label: 'Deal Pipeline',
        value: '24',
        icon: Target,
        change: '+8',
        positive: true,
        subtext: 'new matches',
        color: 'from-blue-500 to-blue-600'
    },
    {
        label: 'Average IRR',
        value: '32%',
        icon: TrendingUp,
        change: '+4.2%',
        positive: true,
        subtext: 'annualized',
        color: 'from-green-500 to-green-600'
    }
];

const DEALS = [
    {
        id: 1,
        name: 'EcoWear Fashion',
        founder: 'Priya Sharma',
        founderImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        sector: 'Sustainable Fashion',
        stage: 'Series A',
        seeking: '₹5Cr',
        valuation: '₹25Cr',
        location: 'Mumbai, India',
        employees: '45-50',
        description: 'Sustainable fashion brand revolutionizing textile industry with recycled materials',
        match: 95,
        traction: '10K+ customers, ₹2Cr ARR',
        founded: '2021',
        website: 'ecowear.in',
        new: true,
        featured: true,
        saved: false,
        views: 245,
        investors: 12
    },
    {
        id: 2,
        name: 'HealthFirst Tech',
        founder: 'Dr. Meera Patel',
        founderImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
        sector: 'HealthTech',
        stage: 'Seed',
        seeking: '₹2.5Cr',
        valuation: '₹12Cr',
        location: 'Bangalore, India',
        employees: '20-25',
        description: 'AI-powered diagnostic platform bringing quality healthcare to rural India',
        match: 92,
        traction: '50K+ users, 500+ doctors',
        founded: '2022',
        website: 'healthfirst.co.in',
        new: true,
        featured: false,
        saved: true,
        views: 189,
        investors: 8
    },
    {
        id: 3,
        name: 'AgroRoots Connect',
        founder: 'Kavya Reddy',
        founderImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya',
        sector: 'AgriTech',
        stage: 'Pre-Series A',
        seeking: '₹4Cr',
        valuation: '₹18Cr',
        location: 'Hyderabad, India',
        employees: '35-40',
        description: 'B2B marketplace connecting rural farmers directly to urban retailers',
        match: 88,
        traction: '5K+ farmers, ₹1.5Cr GMV',
        founded: '2020',
        website: 'agroroots.in',
        new: false,
        featured: true,
        saved: false,
        views: 312,
        investors: 15
    }
];

const PORTFOLIO = [
    { name: 'TechHer Solutions', invested: '₹50L', currentValue: '₹85L', return: '+70%' },
    { name: 'WomenCraft', invested: '₹30L', currentValue: '₹45L', return: '+50%' },
    { name: 'StyleHub', invested: '₹40L', currentValue: '₹120L', return: '+200%' }
];

const MEETINGS = [
    { company: 'EcoWear Fashion', type: 'Pitch Deck Review', time: 'Today, 3:00 PM', duration: '45 min' },
    { company: 'HealthFirst Tech', type: 'Due Diligence Call', time: 'Tomorrow, 11:00 AM', duration: '60 min' },
    { company: 'AgroRoots Connect', type: 'Investment Discussion', time: 'Thu, 2:00 PM', duration: '30 min' }
];

const ACTIVITIES = [
    { action: 'Saved deal', company: 'HealthFirst Tech', time: '2 hours ago', icon: Heart },
    { action: 'Viewed pitch deck', company: 'EcoWear Fashion', time: '5 hours ago', icon: Eye },
    { action: 'Investment completed', company: 'TechHer Solutions', time: '1 day ago', icon: CheckCircle },
    { action: 'Scheduled meeting', company: 'AgroRoots Connect', time: '2 days ago', icon: Calendar }
];

const TABS = ['All Deals', 'New Matches', 'Featured', 'Saved'];
const MONTH_STATS = [
    { label: 'Deals Reviewed', value: '24' },
    { label: 'Meetings Held', value: '8' },
    { label: 'New Investments', value: '2' }
];

// ============ COMPONENTS ============
const StatCard = ({ stat }: { stat: typeof STATS[0] }) => {
    const Icon = stat.icon;
    const TrendIcon = stat.positive ? TrendingUp : TrendingDown;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
            <p className="text-xs text-gray-500">{stat.subtext}</p>
        </div>
    );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'blue' | 'green' | 'orange' | 'pink' }) => {
    const variants = {
        default: 'bg-purple-50 text-purple-700',
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        orange: 'bg-orange-50 text-orange-700',
        pink: 'bg-pink-100 text-pink-600'
    };

    return <span className={`px-2 py-1 rounded font-medium text-xs ${variants[variant]}`}>{children}</span>;
};

const DealCard = ({ deal }: { deal: typeof DEALS[0] }) => (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-pink-200">
        <div className="flex items-start gap-4">
            <img src={deal.founderImage} alt={deal.founder} className="w-14 h-14 rounded-full border-2 border-gray-200" />

            <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{deal.name}</h3>
                            {deal.featured && <Award className="w-4 h-4 text-yellow-500" />}
                            {deal.new && <Badge variant="pink">NEW</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Founded by {deal.founder} • {deal.founded}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{deal.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />{deal.employees} employees
                            </span>
                            <a href={`https://${deal.website}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-pink-600 hover:underline">
                                <Globe className="w-3 h-3" />{deal.website}
                            </a>
                        </div>
                    </div>

                    <div className="text-right ml-4">
                        <div className="text-xs text-gray-500 mb-1">Match</div>
                        <div className="text-2xl font-bold text-pink-600">{deal.match}%</div>
                    </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{deal.description}</p>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge>{deal.sector}</Badge>
                    <Badge variant="blue">{deal.stage}</Badge>
                    <Badge variant="green">₹{deal.seeking}</Badge>
                    <Badge variant="orange">Val: {deal.valuation}</Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{deal.views}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{deal.investors}</span>
                        <span className="font-medium text-gray-700">{deal.traction}</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                            <Heart className={`w-5 h-5 ${deal.saved ? 'fill-pink-600 text-pink-600' : ''}`} />
                        </button>
                        <button className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold text-sm hover:bg-pink-700 flex items-center gap-1 transition-colors">
                            View
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PortfolioItem = ({ company }: { company: typeof PORTFOLIO[0] }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
        <div>
            <h4 className="font-semibold text-gray-900">{company.name}</h4>
            <p className="text-sm text-gray-600">Invested: {company.invested}</p>
        </div>
        <div className="text-right">
            <div className="font-bold text-gray-900">{company.currentValue}</div>
            <div className="text-sm font-semibold text-green-600">{company.return}</div>
        </div>
    </div>
);

const MeetingCard = ({ meeting }: { meeting: typeof MEETINGS[0] }) => (
    <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100 hover:border-pink-200 transition-colors cursor-pointer">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{meeting.company}</h4>
        <p className="text-xs text-gray-600 mb-2">{meeting.type}</p>
        <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-700">
                <Clock className="w-3 h-3" />{meeting.time}
            </span>
            <span className="text-gray-600">{meeting.duration}</span>
        </div>
    </div>
);

const ActivityItem = ({ activity }: { activity: typeof ACTIVITIES[0] }) => {
    const Icon = activity.icon;
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-pink-600" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.company}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
        </div>
    );
};

// ============ MAIN COMPONENT ============
const InvestorDashboard = () => {
    const { profile } = useUserRole();
    const [activeTab, setActiveTab] = useState('all-deals');

    const userName = (profile as { name?: string } | null)?.name || 'Investor';
    const firstName = userName.split(' ')[0] || 'Investor';

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                {/* Welcome */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back, {firstName} 👋</h2>
                    <p className="text-gray-600 mt-1">Here's what's happening with your investments today</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {STATS.map(stat => <StatCard key={stat.label} stat={stat} />)}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Deals */}
                        <div className="bg-white rounded-xl shadow-sm ">
                            <div className="p-6 border-b border-gray-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Deal Flow</h2>
                                        <p className="text-sm text-gray-600 mt-1">Curated opportunities matching your criteria</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                                            <Filter className="w-4 h-4" />Filters
                                        </button>
                                        <button className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700">
                                            Browse All
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 text-sm flex-wrap">
                                    {TABS.map(tab => {
                                        const tabId = tab.toLowerCase().replace(' ', '-');
                                        return (
                                            <button key={tab} onClick={() => setActiveTab(tabId)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors
                                                        ${activeTab === tabId ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                                {tab}
                                                {tab === 'New Matches' && <span className="ml-1.5 px-1.5 py-0.5 bg-pink-600 text-white text-xs rounded-full">2</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {DEALS.map(deal => <DealCard key={deal.id} deal={deal} />)}
                            </div>
                        </div>

                        {/* Portfolio */}
                        <div className="bg-white rounded-xl shadow-sm  p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Portfolio Performance</h3>
                                <button className="text-sm text-pink-600 font-semibold hover:text-pink-700">View All</button>
                            </div>
                            <div className="space-y-3">
                                {PORTFOLIO.map((company, i) => <PortfolioItem key={i} company={company} />)}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Meetings */}
                        <div className="bg-white rounded-xl shadow-sm  p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-pink-600" />Upcoming Meetings
                            </h3>
                            <div className="space-y-3 mb-4">
                                {MEETINGS.map((m, i) => <MeetingCard key={i} meeting={m} />)}
                            </div>
                            <button className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm hover:border-pink-300">
                                View Calendar
                            </button>
                        </div>

                        {/* Activity */}
                        <div className="bg-white rounded-xl shadow-sm  p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {ACTIVITIES.map((a, i) => <ActivityItem key={i} activity={a} />)}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
                            <h3 className="font-bold mb-4">This Month</h3>
                            <div className="space-y-3 mb-4">
                                {MONTH_STATS.map(s => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <span className="text-sm text-pink-100">{s.label}</span>
                                        <span className="font-bold text-xl">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full px-4 py-2 bg-white text-pink-600 rounded-lg font-semibold text-sm hover:bg-pink-50">
                                View Analytics
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default InvestorDashboard;