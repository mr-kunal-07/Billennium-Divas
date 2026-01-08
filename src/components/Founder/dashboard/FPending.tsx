import React from 'react'
import { Clock, Mail, CheckCircle2, FileText, Video, Calendar, Shield } from 'lucide-react'

const FPending = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">Pending Approval</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-6 shadow-lg">
                        <Clock className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Your Application is Under Review
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Thank you for signing up! Our team is carefully reviewing your profile and company information.
                        We'll notify you once your account is approved.
                    </p>
                </div>

                {/* Timeline Steps */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Approval Process</h3>
                    <div className="space-y-6">
                        {/* Step 1 - Completed */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="w-0.5 h-16 bg-green-200 mt-2"></div>
                            </div>
                            <div className="flex-1 pt-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Application Submitted</h4>
                                <p className="text-sm text-gray-600">Your profile and company details have been received</p>
                                <span className="inline-block mt-2 text-xs text-green-600 font-medium">Completed</span>
                            </div>
                        </div>

                        {/* Step 2 - In Progress */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                            </div>
                            <div className="flex-1 pt-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Verification in Progress</h4>
                                <p className="text-sm text-gray-600">Our team is reviewing your information and verifying details</p>
                                <span className="inline-block mt-2 text-xs text-amber-600 font-medium">In Progress (1-3 business days)</span>
                            </div>
                        </div>

                        {/* Step 3 - Pending */}
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 pt-1">
                                <h4 className="font-semibold text-gray-400 mb-1">Approval & Notification</h4>
                                <p className="text-sm text-gray-500">You'll receive an email when your account is approved</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-pink-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
                        <p className="text-sm text-gray-600">
                            We'll send you an email notification as soon as your account is approved. Make sure to check your spam folder.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Prepare Your Pitch</h3>
                        <p className="text-sm text-gray-600">
                            While waiting, refine your pitch deck and prepare to connect with potential investors.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Average Wait Time</h3>
                        <p className="text-sm text-gray-600">
                            Most applications are reviewed within 1-3 business days. We appreciate your patience!
                        </p>
                    </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">What Happens After Approval?</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Full Dashboard Access</h4>
                                <p className="text-sm text-pink-100">Access all features including investor matching and analytics</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Video className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Connect with Investors</h4>
                                <p className="text-sm text-pink-100">Start scheduling meetings with interested investors</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Share Your Pitch</h4>
                                <p className="text-sm text-pink-100">Upload and share your pitch deck with potential investors</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Direct Communication</h4>
                                <p className="text-sm text-pink-100">Message investors directly through our platform</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                        Have questions about your application status?
                    </p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all border border-pink-200 hover:border-pink-300">
                        <Mail className="w-5 h-5" />
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FPending