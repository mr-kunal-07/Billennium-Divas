"use client";

import React, { useEffect, useState } from "react";
import { TbInvoice } from "react-icons/tb";
import { CiCalculator2 } from "react-icons/ci";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    User,
    FileText,
    HelpCircle,
    Star,
    Calendar,
    ChevronLeft,
    ChevronRight,
    BarChart3,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

/* ---------------- Types ---------------- */
interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

/* ---------------- Component ---------------- */
export default function Sidebar() {
    const pathname = usePathname();
    const { isSidebarOpen, closeSidebar } = useSidebar();

    /* Collapse state (persistent) */
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) {
            setIsCollapsed(saved === "true");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }, [isCollapsed]);

    /* Prevent body scroll on mobile */
    useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isSidebarOpen]);

    /* Navigation config */
    const navSections: NavSection[] = [
        {
            title: "NAVIGATION",
            items: [
                {
                    id: "dashboard",
                    label: "Dashboard",
                    icon: <Home size={18} />,
                    href: "/dashboard",
                },
                {
                    id: "profile",
                    label: "My Profile",
                    icon: <User size={18} />,
                    href: "/profile",
                },
            ],
        },
        {
            title: "TOOLS",
            items: [
                {
                    id: "valuation",
                    label: "Valuation Calculator",
                    icon: <FileText size={18} />,
                    href: "/resources/valuation-calculator",
                },
                {
                    id: "captable",
                    label: "CapTable Calculator",
                    icon: <BarChart3 size={18} />,
                    href: "/resources/captable-calculator",
                },
                {
                    id: "funding",
                    label: "Funding Matrix Calculator",
                    icon: <CiCalculator2 size={18} />,
                    href: "/resources/funding-matrix-calculator",
                },
                {
                    id: 'invoice',
                    label: "Manage Invoices",
                    icon: <TbInvoice size={18} />,
                    href: "/resources/invoice",
                },
                {
                    id: 'pitchdeck',
                    label: "Pitch Deck",
                    icon: <TbInvoice size={18} />,
                    href: "/resources/pitchdeck",
                }
            ],
        },
        {
            title: "GENERAL",
            items: [
                {
                    id: "support",
                    label: "Support Center",
                    icon: <HelpCircle size={18} />,
                    href: "/support",
                },
                {
                    id: "review",
                    label: "Give Feedback",
                    icon: <Star size={18} />,
                    href: "/review",
                },
                {
                    id: "meeting",
                    label: "Book a Meeting",
                    icon: <Calendar size={18} />,
                    href: "/meeting",
                },
            ],
        },
    ];

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0 w-64 shadow-xl" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:shadow-none
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
                aria-label="Sidebar"
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        {!isCollapsed ? (
                            <div className="text-2xl font-semibold">
                                Billennium<span className="text-pink-500">Divas</span>
                            </div>
                        ) : (
                            <div className="mx-auto text-xl font-bold text-pink-500">BD</div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        {navSections.map((section, i) => (
                            <div key={i} className="mb-6">
                                {section.title && !isCollapsed && (
                                    <h2 className="px-6 mb-2 text-[11px] font-semibold tracking-wider text-pink-500">
                                        {section.title}
                                    </h2>
                                )}

                                <ul className="space-y-1 px-3">
                                    {section.items.map((item) => {
                                        const active = isActive(item.href);

                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.href}
                                                    onClick={closeSidebar}
                                                    className={`
                            relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                            transition-colors duration-200
                            ${active
                                                            ? "bg-pink-50 text-pink-700 font-semibold"
                                                            : "text-gray-700 hover:bg-gray-100"}
                            ${isCollapsed ? "justify-center" : ""}
                          `}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    {active && (
                                                        <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-pink-600" />
                                                    )}

                                                    <span
                                                        className={`${active ? "text-pink-600" : "text-gray-500"
                                                            }`}
                                                    >
                                                        {item.icon}
                                                    </span>

                                                    {!isCollapsed && (
                                                        <>
                                                            <span className="flex-1 truncate">
                                                                {item.label}
                                                            </span>
                                                            {item.badge && (
                                                                <span className="ml-auto rounded bg-pink-100 px-2 text-xs font-semibold text-pink-600">
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Collapse Button (Desktop) */}
                    <div className="hidden lg:flex border-t border-gray-200 p-3">
                        <button
                            onClick={() => setIsCollapsed((prev) => !prev)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                            {isCollapsed ? (
                                <ChevronRight size={18} />
                            ) : (
                                <>
                                    <ChevronLeft size={18} />
                                    <span>Collapse</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
