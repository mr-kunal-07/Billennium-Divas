import React from 'react';
import { Clock, Mail, CheckCircle2, TrendingUp, Users, Target, Shield, Bell } from 'lucide-react';

const IPending = () => {
    const steps = [
        {
            icon: CheckCircle2,
            title: "Registration Complete",
            desc: "Your investor profile has been successfully submitted",
            status: "Completed",
            color: "green"
        },
        {
            icon: Shield,
            title: "Credential Verification",
            desc: "Our team is reviewing your investment history and credentials",
            status: "In Progress (2-5 business days)",
            color: "pink"
        },
        {
            icon: Bell,
            title: "Account Activation",
            desc: "You'll receive access to the full investor dashboard once approved",
            status: null,
            color: "gray"
        }
    ];

    const infoCards = [
        {
            icon: Mail,
            title: "Email Notification",
            desc: "We'll email you immediately once your investor account is verified and activated.",
            bgColor: "bg-pink-100",
            iconColor: "text-pink-600"
        },
        {
            icon: Target,
            title: "Define Your Criteria",
            desc: "Think about your investment preferences, sectors of interest, and ticket sizes.",
            bgColor: "bg-pink-100",
            iconColor: "text-pink-600"
        },
        {
            icon: Shield,
            title: "Secure Process",
            desc: "Verification typically takes 2-5 business days to ensure platform quality and security.",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        }
    ];

    const whyVerify = [
        {
            icon: Shield,
            title: "Quality Assurance",
            desc: "We maintain high standards to protect both founders and investors, ensuring serious and qualified participants.",
            bgColor: "bg-pink-100",
            iconColor: "text-pink-600"
        },
        {
            icon: Users,
            title: "Trust & Safety",
            desc: "Verification builds trust in our community, creating a safe environment for investment discussions.",
            bgColor: "bg-pink-100",
            iconColor: "text-pink-600"
        },
        {
            icon: Target,
            title: "Better Matches",
            desc: "Understanding your background helps us connect you with founders that align with your investment thesis.",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            icon: TrendingUp,
            title: "Regulatory Compliance",
            desc: "Investor verification helps us comply with financial regulations and maintain platform integrity.",
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        }
    ];

    const benefits = [
        { icon: Target, title: "Curated Deal Flow", desc: "Access pre-vetted startups matching your investment criteria" },
        { icon: Users, title: "Direct Founder Access", desc: "Connect directly with founders and schedule pitch meetings" },
        { icon: TrendingUp, title: "Investment Analytics", desc: "Track opportunities, manage pipeline, and analyze trends" },
        { icon: Bell, title: "Smart Notifications", desc: "Get alerts when new deals match your investment preferences" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">

            {/* Header */}
            <div className="bg-white border-b/5 border-gray-400">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-pink-600">Investor Portal</h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-full">
                        <Clock className="w-4 h-4 text-pink-600" />
                        <span className="text-sm font-medium text-pink-600">Verification in Progress</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full mb-6 shadow-xl">
                        <Shield className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                        Account Verification in Progress
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Thank you for joining our investor network! We're verifying your credentials to ensure
                        the highest quality of connections for both investors and founders.
                    </p>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Verification Process</h3>
                    <div className="space-y-6">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            const isLast = i === steps.length - 1;
                            return (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md
                      ${step.color === 'green' ? 'bg-green-500' : step.color === 'pink' ? 'bg-pink-500 animate-pulse' : 'bg-gray-300'}`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        {!isLast && <div className={`w-0.5 h-16 mt-2 ${step.color === 'green' ? 'bg-green-200' : 'bg-gray-200'}`} />}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h4 className={`font-semibold mb-1 ${step.color === 'gray' ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {step.title}
                                        </h4>
                                        <p className={`text-sm ${step.color === 'gray' ? 'text-gray-500' : 'text-gray-600'}`}>
                                            {step.desc}
                                        </p>
                                        {step.status && (
                                            <span className={`inline-block mt-2 text-xs font-medium
                        ${step.color === 'green' ? 'text-green-600' : 'text-pink-600'}`}>
                                                {step.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {infoCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-sm text-gray-600">{card.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Why Verify */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Why Do We Verify Investors?</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {whyVerify.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="flex gap-4">
                                    <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white mb-8">
                    <h3 className="text-2xl font-bold mb-4">What You'll Get After Approval</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {benefits.map((benefit, i) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">{benefit.title}</h4>
                                        <p className="text-sm text-pink-100">{benefit.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Support */}
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Questions about the verification process?</p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all border border-pink-200">
                        <Mail className="w-5 h-5" />
                        Contact Our Team
                    </button>
                </div>

            </div>
        </div>
    );
};

export default IPending;