"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
    const [active, setActive] = useState(0);

    const data = [
        {
            name: "Priya Sharma",
            role: "Founder, EcoWear",
            text: "Billennium Divas believed in my sustainable fashion brand when no one else did. The mentorship helped me navigate challenges I didn't see coming. Today, EcoWear is thriving.",
            img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
        },
        {
            name: "Ananya Desai",
            role: "TechHer Solutions",
            text: "Finding investors who understand women in tech is rare. They connected me with mentors who've been there. Their advice has been invaluable.",
            img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
        },
        {
            name: "Meera Patel",
            role: "Founder, HealthFirst",
            text: "WEFORME gave me practical skills and real support. My healthcare startup now helps thousands. I couldn't have done it without them.",
            img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera"
        },
        {
            name: "Kavya Reddy",
            role: "Founder, AgroRoots",
            text: "PROJECT HOPE gave me permission to dream bigger. My agri-tech venture now empowers rural women across three states.",
            img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya"
        }
    ];

    const t = data[active];

    return (
        <section className="py-10 ">
            <div className="max-w-5xl mx-auto px-6">

                <div className="text-center mb-12">
                    <p className="text-pink-600 font-medium mb-2">TESTIMONIALS</p>
                    <h2 className="text-4xl font-semibold mb-2">Loved by Founders</h2>
                    <p className="text-gray-600 text-md">
                        Real stories from women entrepreneurs
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-10 shadow-lg">
                    <p className="text-xl text-gray-700 mb-8 italic">
                        "{t.text}"
                    </p>

                    <div className="flex items-center gap-4 mb-8">
                        <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full" />
                        <div>
                            <h4 className="font-bold text-gray-900">{t.name}</h4>
                            <p className="text-pink-600">{t.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setActive((active - 1 + data.length) % data.length)}
                            className="p-2 rounded-full border-2 border-gray-300 hover:border-pink-500"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-2">
                            {data.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    className={`h-2 rounded-full ${i === active ? 'w-8 bg-pink-600' : 'w-2 bg-gray-300'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setActive((active + 1) % data.length)}
                            className="p-2 rounded-full border-2 border-gray-300 hover:border-pink-500"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Testimonials;