"use client"

import { ArrowRight, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

type NavLinkType = {
    href: string
    label: string
}

type NavLinkProps = {
    href: string
    label: string
    mobile?: boolean
}

type AuthButtonProps = {
    variant?: "primary" | "secondary"
    label: string
    path: string
    mobile?: boolean
}

const Header: React.FC = () => {
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState<boolean>(false)

    const navLinks: NavLinkType[] = [
        { href: "/investors", label: "For Investors" },
        { href: "/founders", label: "For Founders" },
        { href: "/blog", label: "Blog" },
    ]

    const handleNavigation = (path: string) => {
        router.push(path)
        setMenuOpen(false)
    }

    const NavLink: React.FC<NavLinkProps> = ({ href, label, mobile = false }) => (
        <Link
            href={href}
            onClick={() => mobile && setMenuOpen(false)}
            className={`${mobile ? "text-gray-800 text-base py-2" : "text-gray-700 text-sm"
                } hover:text-pink-900 transition-colors font-medium`}
        >
            {label}
        </Link>
    )

    const AuthButton: React.FC<AuthButtonProps> = ({
        variant = "primary",
        label,
        path,
        mobile = false,
    }) => (
        <button
            onClick={() => handleNavigation(path)}
            className={`
        ${variant === "primary"
                    ? "bg-pink-900 text-white hover:bg-pink-800"
                    : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                }
        ${mobile ? "w-full py-3" : "px-5 py-2.5"}
        rounded-lg transition-all font-medium flex items-center justify-center gap-2 text-sm
      `}
        >
            {label}
            {variant === "primary" && <ArrowRight size={16} />}
        </button>
    )

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-2">
                <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="hover:opacity-80 transition-opacity shrink-0"
                        >
                            <img src="/logo.png" alt="Logo" className="h-8 sm:h-16 -my-3  w-auto" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex gap-8 items-center">
                            {navLinks.map((link) => (
                                <NavLink key={link.label} {...link} />
                            ))}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden lg:flex gap-3 items-center ">
                            <AuthButton variant="secondary" label="Log In" path="/login" />
                            <AuthButton variant="primary" label="Join For Free" path="/register" />
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-gray-700 hover:text-pink-900 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`
        lg:hidden fixed top-20 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl 
        transition-all duration-300 ease-out
        ${menuOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                    }
      `}
            >
                <div className="p-6">
                    <nav className="flex flex-col gap-1 mb-6">
                        {navLinks.map((link) => (
                            <NavLink key={link.label} {...link} mobile />
                        ))}
                    </nav>

                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 cursor-pointer">
                        <AuthButton variant="secondary" label="Log In" path="/login" mobile />
                        <AuthButton variant="primary" label="Join For Free" path="/register" mobile />
                    </div>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-20 sm:h-24" />
        </>
    )
}

export default Header
