"use client"

import { ArrowRight, Menu, X, FileText, BookOpen, Video, Users, ChevronDown, Calculator } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"

const NAV_LINKS = [
    { href: "/investors", label: "For Investors" },
    { href: "/founders", label: "For Founders" },
    { href: "/blog", label: "Blog" },
    { href: "/resources", label: "Resources", hasDropdown: true },
]

const RESOURCES = [
    { icon: Calculator, label: "Valuation calculator", desc: "Comprehensive guides and tutorials", href: "/resources/valuation-calculator" },
    { icon: BookOpen, label: "Case Studies", desc: "Success stories from our clients", href: "/resources/case-studies" },
    { icon: Video, label: "Webinars", desc: "Learn from industry experts", href: "/resources/webinars" },
    { icon: Users, label: "Community", desc: "Connect with other users", href: "/resources/community" },
]

export default function Header() {
    const [isOpen, setIsOpen] = useState({ menu: false, dropdown: false, mobileDropdown: false })
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(prev => ({ ...prev, dropdown: false }))
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const toggle = (key: keyof typeof isOpen) => setIsOpen(prev => ({ ...prev, [key]: !prev[key] }))
    const close = () => setIsOpen({ menu: false, dropdown: false, mobileDropdown: false })

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 pb-2">
                <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-sm shadow-md rounded-md px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
                            <Image src="/logo1.png" alt="Logo" width={160} height={64} className="h-12 sm:h-16 -my-3 w-auto" priority />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex gap-8 items-center">
                            {NAV_LINKS.map(link => (
                                <div key={link.label} ref={link.hasDropdown ? dropdownRef : null} className="relative">
                                    {link.hasDropdown ? (
                                        <>
                                            <button onClick={() => toggle("dropdown")} className="text-gray-700 text-lg cursor-pointer font-medium hover:text-pink-900 transition-colors flex items-center gap-1">
                                                {link.label}
                                                <ChevronDown size={16} className={`transition-transform ${isOpen.dropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isOpen.dropdown && (
                                                <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                                                    {RESOURCES.map(({ icon: Icon, label, desc, href }) => (
                                                        <Link key={label} href={href} onClick={() => toggle("dropdown")} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                                            <Icon size={22} className="text-pink-900 mt-0.5" />
                                                            <div>
                                                                <div className="font-medium text-gray-900 text-md">{label}</div>
                                                                <div className="text-sm text-gray-500 mt-0.5">{desc}</div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link href={link.href} className="text-gray-700 text-lg font-medium hover:text-pink-900 transition-colors">
                                            {link.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Desktop Auth */}
                        <div className="hidden lg:flex gap-3">
                            <Link href="/login" className="px-5 py-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg transition-all font-medium text-md">
                                Log In
                            </Link>
                            <Link href="/register" className="px-5 py-2 bg-pink-900 text-white hover:bg-pink-800 rounded-lg transition-all font-medium text-md flex items-center gap-2">
                                Join For Free <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button onClick={() => toggle("menu")} className="lg:hidden p-2 text-gray-700 hover:text-pink-900 transition-colors" aria-label="Toggle menu" aria-expanded={isOpen.menu}>
                            {isOpen.menu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isOpen.menu && <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={close} />}

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed top-20 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl transition-all duration-300 ${isOpen.menu ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
                <div className="p-6">
                    <nav className="flex flex-col gap-1 mb-6">
                        {NAV_LINKS.map(link => (
                            <div key={link.label}>
                                {link.hasDropdown ? (
                                    <>
                                        <button onClick={() => toggle("mobileDropdown")} className="text-gray-800 text-[15px] font-medium py-2 hover:text-pink-900 transition-colors flex items-center justify-between w-full">
                                            {link.label}
                                            <ChevronDown size={16} className={`transition-transform ${isOpen.mobileDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isOpen.mobileDropdown && (
                                            <div className="ml-4 mt-2 space-y-1">
                                                {RESOURCES.map(({ icon: Icon, label, desc, href }) => (
                                                    <Link key={label} href={href} onClick={close} className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <Icon size={20} className="text-pink-900 mt-0.5" />
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-sm">{label}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link href={link.href} onClick={close} className="text-gray-800 text-[15px] font-medium py-2 hover:text-pink-900 transition-colors block">
                                        {link.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                        <Link href="/login" onClick={close} className="w-full py-3 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg transition-all font-medium text-sm flex items-center justify-center">
                            Log In
                        </Link>
                        <Link href="/register" onClick={close} className="w-full py-3 bg-pink-900 text-white hover:bg-pink-800 rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2">
                            Join For Free <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="h-20 sm:h-24" />
        </>
    )
}