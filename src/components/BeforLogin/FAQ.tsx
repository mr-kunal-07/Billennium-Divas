"use client";
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
    const [open, setOpen] = useState(0);

    const faqs = [
        {
            q: "What is Billennium Divas?",
            a: "Billennium Divas is an early-stage micro-equity fund investing in the exponential power of exceptionally talented women entrepreneurs. We're a sector-agnostic fund, for and by women, dedicated to changing the narrative that women-led enterprises receive less funding despite generating better returns. We provide capital, mentorship, and a powerful network to help women founders succeed."
        },
        {
            q: "Why should women entrepreneurs join Billennium Divas?",
            a: "Women founders face unique challenges in raising capital. We understand these challenges and provide not just funding, but comprehensive support including mentorship from experienced entrepreneurs, access to a network of 165+ mentors and 20+ investors, practical skills training, and ongoing support through programs like WEFORME and PROJECT HOPE. We've engaged with 50+ startups and 510+ women participants."
        },
        {
            q: "Who is Billennium Divas for?",
            a: "We support all women entrepreneurs at the early stage—from ex-corporate urban women transitioning to entrepreneurship through our WEFORME initiative, to rural women starting their journey through PROJECT HOPE. Whether you're a first-time founder or an experienced entrepreneur, if you're a woman with a vision and determination, we're here for you."
        },
        {
            q: "What services does Billennium Divas provide?",
            a: "We offer micro-equity funding for early-stage startups, mentorship programs with 165+ experienced mentors, skills training workshops (45+ conducted), networking opportunities through events like Women Power Summit and W-S.I.S, access to 20+ investors, and specialized initiatives like WEFORME (for urban women) and PROJECT HOPE (for rural women with seed funding)."
        },
        {
            q: "How do I apply for funding or join the program?",
            a: "You can apply through our Member Login portal or contact us directly. We evaluate applications on a rolling basis, looking at your vision, business potential, and commitment. Our team reviews each application carefully and connects suitable candidates with our mentorship and funding programs."
        },
        {
            q: "Is Billennium Divas only for tech startups?",
            a: "No, we are sector-agnostic! We invest in women-led enterprises across all industries—from agriculture and healthcare to technology and sustainable fashion. What matters to us is your vision, your potential, and your commitment to building something meaningful."
        },
        {
            q: "What is WEFORME and PROJECT HOPE?",
            a: "WEFORME is our initiative for ex-corporate urban married women, equipping them with skills, confidence, and support to launch their own businesses. PROJECT HOPE is designed for rural women entrepreneurs, providing seed funding and inspiration to engage in entrepreneurship. Both programs offer comprehensive support beyond just capital."
        },
        {
            q: "What events does Billennium Divas organize?",
            a: "We conduct signature events like Women Power (annual summit), Women Startup Investors Summit (W-S.I.S), and Diva Entrepreneurs Bootcamp (DEBOOT). These events bring together founders, investors, mentors, and the entire women entrepreneurship ecosystem for networking, learning, and deal-making."
        }
    ];

    return (
        <section className="py-20 bg-pink-50">
            <div className="max-w-4xl mx-auto px-6">

                <h2 className="text-4xl font-semibold text-center mb-12 text-gray-900">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setOpen(open === i ? -1 : i)}
                                className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${open === i ? 'bg-pink-600 text-white' : 'text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-medium text-lg pr-4">{faq.q}</span>
                                {open === i ? (
                                    <Minus className="w-6 h-6 shrink-0" />
                                ) : (
                                    <Plus className="w-6 h-6 shrink-0 text-pink-600" />
                                )}
                            </button>

                            {open === i && (
                                <div className="px-6 py-5 bg-white border-t border-gray-100">
                                    <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">Still have questions?</p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                    >
                        Contact Us
                    </a>
                </div>

            </div>
        </section>
    );
};

export default FAQ;