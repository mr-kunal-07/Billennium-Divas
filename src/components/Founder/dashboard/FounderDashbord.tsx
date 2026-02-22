"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import {
  FileText,
  Video,
  Calendar,
  DollarSign,
  ChevronRight,
  Target,
  Building2,
  Eye,
  Heart,
  CheckCircle2,
  BarChart3,
  Calculator,
  Handshake,
} from "lucide-react";

// ─── Mock data (replace with Firestore later) ───────────────────────────────────

const FOUNDER_STATS = [
  {
    label: "Profile Views",
    value: "24",
    icon: Eye,
    change: "+12",
    positive: true,
    subtext: "this week",
    color: "from-pink-500 to-pink-600",
  },
  {
    label: "Investor Interest",
    value: "8",
    icon: Heart,
    change: "+3",
    positive: true,
    subtext: "interested",
    color: "from-purple-500 to-purple-600",
  },
  {
    label: "Meetings Scheduled",
    value: "4",
    icon: Calendar,
    change: "+2",
    positive: true,
    subtext: "this month",
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Pitch Deck Score",
    value: "85%",
    icon: Target,
    change: "+5%",
    positive: true,
    subtext: "AI analysis",
    color: "from-green-500 to-green-600",
  },
];

const INVESTOR_MATCHES = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    type: "Angel Investor",
    sector: "HealthTech, FinTech",
    ticketSize: "₹25L - ₹1Cr",
    match: 94,
    status: "Interested",
  },
  {
    id: 2,
    name: "Raj Kapoor",
    type: "VC Partner",
    sector: "Women-led Startups",
    ticketSize: "₹50L - ₹2Cr",
    match: 88,
    status: "Viewed Profile",
  },
  {
    id: 3,
    name: "Anita Mehta",
    type: "Angel Investor",
    sector: "Sustainable Fashion",
    ticketSize: "₹10L - ₹50L",
    match: 82,
    status: "Saved",
  },
];

const UPCOMING_MEETINGS = [
  {
    company: "Pitch Deck Review",
    investor: "Dr. Priya Sharma",
    time: "Today, 3:00 PM",
    duration: "30 min",
  },
  {
    company: "Investment Discussion",
    investor: "Raj Kapoor",
    time: "Tomorrow, 11:00 AM",
    duration: "45 min",
  },
  {
    company: "Follow-up Call",
    investor: "Anita Mehta",
    time: "Thu, 2:00 PM",
    duration: "20 min",
  },
];

const RECENT_ACTIVITY = [
  {
    action: "Profile viewed",
    detail: "Raj Kapoor",
    time: "2 hours ago",
    icon: Eye,
  },
  {
    action: "Pitch deck downloaded",
    detail: "Dr. Priya Sharma",
    time: "5 hours ago",
    icon: FileText,
  },
  {
    action: "Meeting confirmed",
    detail: "Investment Discussion",
    time: "1 day ago",
    icon: CheckCircle2,
  },
  {
    action: "Invoice paid",
    detail: "₹2,50,000",
    time: "2 days ago",
    icon: DollarSign,
  },
];

const QUICK_LINKS = [
  {
    label: "Valuation Calculator",
    href: "/resources/valuation-calculator",
    icon: Calculator,
  },
  {
    label: "Cap Table",
    href: "/resources/captable-calculator",
    icon: BarChart3,
  },
  {
    label: "Funding Matrix",
    href: "/resources/funding-matrix-calculator",
    icon: Target,
  },
  {
    label: "Manage Invoices",
    href: "/resources/invoice",
    icon: Handshake,
  },
  {
    label: "Pitch Deck",
    href: "/resources/pitchdeck",
    icon: FileText,
  },
];

// ─── Components ────────────────────────────────────────────────────────────────

const StatCard = ({
  stat,
}: {
  stat: (typeof FOUNDER_STATS)[0];
}) => {
  const Icon = stat.icon;
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            stat.positive ? "text-green-600" : "text-red-600"
          }`}
        >
          {stat.change}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
      <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
      <p className="text-xs text-gray-500">{stat.subtext}</p>
    </div>
  );
};

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "blue" | "green" | "orange" | "pink";
}) => {
  const variants = {
    default: "bg-purple-50 text-purple-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    pink: "bg-pink-100 text-pink-600",
  };
  return (
    <span
      className={`px-2 py-1 rounded font-medium text-xs ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

const InvestorMatchCard = ({
  match,
}: {
  match: (typeof INVESTOR_MATCHES)[0];
}) => (
  <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-pink-200">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-bold text-gray-900">{match.name}</h3>
        <p className="text-sm text-gray-600">{match.type}</p>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500 mb-1">Match</div>
        <div className="text-xl font-bold text-pink-600">{match.match}%</div>
      </div>
    </div>
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <Badge>{match.sector}</Badge>
      <Badge variant="blue">{match.ticketSize}</Badge>
    </div>
    <div className="flex items-center justify-between pt-3 border-t">
      <span className="text-xs font-medium text-green-600">{match.status}</span>
      <button className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold text-sm hover:bg-pink-700 flex items-center gap-1 transition-colors">
        Connect
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const MeetingCard = ({
  meeting,
}: {
  meeting: (typeof UPCOMING_MEETINGS)[0];
}) => (
  <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100 hover:border-pink-200 transition-colors cursor-pointer">
    <h4 className="font-semibold text-gray-900 text-sm mb-1">{meeting.company}</h4>
    <p className="text-xs text-gray-600 mb-2">{meeting.investor}</p>
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1 text-gray-700">
        <Calendar className="w-3 h-3" />
        {meeting.time}
      </span>
      <span className="text-gray-600">{meeting.duration}</span>
    </div>
  </div>
);

const ActivityItem = ({
  activity,
}: {
  activity: (typeof RECENT_ACTIVITY)[0];
}) => {
  const Icon = activity.icon;
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-pink-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
        <p className="text-sm text-gray-600">{activity.detail}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function FounderDashbord() {
  const { profile } = useUserRole();
  const founderProfile = profile as {
    name?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    companyStage?: string;
    roundSize?: number;
    pitchDeck?: string;
    pitchVideo?: string;
  } | null;

  const displayName =
    founderProfile?.name ||
    [founderProfile?.firstName, founderProfile?.lastName].filter(Boolean).join(" ") ||
    "Founder";
  const firstName = displayName.split(" ")[0] || "Founder";
  const companyName = founderProfile?.companyName || "Your Company";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with {companyName}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {FOUNDER_STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pink-600" />
                Company Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="font-semibold text-gray-900">{companyName}</p>
                </div>
                {founderProfile?.companyStage && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Stage</p>
                    <p className="font-semibold text-gray-900">
                      {founderProfile.companyStage}
                    </p>
                  </div>
                )}
                {founderProfile?.roundSize && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Raising</p>
                    <p className="font-semibold text-gray-900">
                      ₹{(founderProfile.roundSize / 100000).toFixed(1)}L
                    </p>
                  </div>
                )}
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 mt-4 text-pink-600 font-semibold text-sm hover:text-pink-700"
              >
                Edit Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Investor Matches */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  Investor Matches
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Investors interested in your sector and stage
                </p>
              </div>
              <div className="p-6 space-y-4">
                {INVESTOR_MATCHES.map((match) => (
                  <InvestorMatchCard key={match.id} match={match} />
                ))}
              </div>
              <div className="px-6 pb-6">
                <Link
                  href="/meeting"
                  className="text-sm text-pink-600 font-semibold hover:text-pink-700"
                >
                  View all matches →
                </Link>
              </div>
            </div>

            {/* Pitch Deck Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-600" />
                Pitch Materials
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[180px]">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pitch Deck</p>
                    <p className="text-xs text-green-600">Uploaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[180px]">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pitch Video</p>
                    <p className="text-xs text-green-600">Linked</p>
                  </div>
                </div>
              </div>
              <Link
                href="/resources/pitchdeck"
                className="inline-flex items-center gap-1 mt-4 text-pink-600 font-semibold text-sm hover:text-pink-700"
              >
                Manage pitch materials
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                Upcoming Meetings
              </h3>
              <div className="space-y-3 mb-4">
                {UPCOMING_MEETINGS.map((m, i) => (
                  <MeetingCard key={i} meeting={m} />
                ))}
              </div>
              <Link
                href="/meeting"
                className="block w-full py-2 text-center border-2 border-gray-200 rounded-lg font-semibold text-sm hover:border-pink-300 text-gray-700"
              >
                View Calendar
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((a, i) => (
                  <ActivityItem key={i} activity={a} />
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-4">Quick Tools</h3>
              <div className="space-y-2">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{link.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
