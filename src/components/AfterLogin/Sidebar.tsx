"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    FileText,
    HelpCircle,
    Star,
    Calendar,
    Menu,
    X,
    User,
    ChevronLeft,
    ChevronRight,
    ChartNoAxesCombined
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    href: string;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navSections: NavSection[] = [
        {
            title: 'NAVIGATION',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} />, href: '/dashboard' },
                {
                    id: 'profile',
                    label: 'My Profile',
                    icon: <User size={18} />,
                    href: '#'
                },
            ],
        },
        {
            title: 'TOOLS',
            items: [
                {
                    id: 'valuation-calculator',
                    label: 'Valuation Calculator',
                    icon: <FileText size={18} />,
                    href: '/resources/valuation-calculator'
                },
                {
                    id: 'capTable-calculator',
                    label: 'CapTable Calculator',
                    icon: <ChartNoAxesCombined size={18} />,
                    href: '/resources/captable-calculator'
                },
            ],
        },
        {
            title: 'GENERAL',
            items: [
                {
                    id: 'support',
                    label: 'Support Center',
                    icon: <HelpCircle size={18} />,
                    href: '#'
                },
                {
                    id: 'review',
                    label: 'Write A Review',
                    icon: <Star size={18} />,
                    href: '#'
                },
                {
                    id: 'meeting',
                    label: 'Book a Meeting',
                    icon: <Calendar size={18} />,
                    href: '#'
                },
            ],
        },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            {/* Logo */}
            <div className="px-6 py-3 border-b border-gray-200 shrink-0">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex text-2xl font-semibold items-center gap-2">
                            Billennium<span className="text-pink-500">Divas</span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="text-2xl font-bold text-pink-500 mx-auto">BD</div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {navSections.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="mb-6 last:mb-0">
                        {section.title && !isCollapsed && (
                            <h2 className="px-6 mb-2 text-[11px] font-semibold text-pink-500 tracking-wider">
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
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg 
                                                transition-all duration-200 group relative
                                                ${active
                                                    ? 'bg-pink-50 text-pink-700 font-semibold'
                                                    : 'text-gray-700 hover:bg-gray-100 font-medium'
                                                }
                                                ${isCollapsed ? 'justify-center' : ''}
                                            `}
                                            title={isCollapsed ? item.label : ''}
                                        >
                                            {active && (
                                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-pink-600 rounded-r" />
                                            )}
                                            <span
                                                className={`
                                                    flex-shrink-0 transition-colors
                                                    ${active
                                                        ? 'text-pink-600'
                                                        : 'text-gray-500 group-hover:text-gray-700'
                                                    }
                                                `}
                                            >
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                    {item.badge && item.badge > 0 && (
                                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-pink-600 bg-pink-100 rounded flex-shrink-0">
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

            {/* Collapse Button (Desktop Only) */}
            <div className="hidden lg:flex border-t border-gray-200 p-3">
                <button
                    onClick={toggleCollapse}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!isCollapsed && <span>Collapse</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Open sidebar"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200
                    transition-all duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-0
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
                `}
                aria-label="Sidebar navigation"
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;