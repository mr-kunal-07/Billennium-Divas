"use client";

import { useState, ChangeEvent, useCallback, useEffect, useRef } from "react";
import { Search, ChevronDown, LogOut, Bell, Menu, User } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";


/* ---------------- Context for Sidebar State ---------------- */
interface User {
    name: string;
    phone: string;
    initials: string;
}

function AppHeader() {
    const { toggleSidebar } = useSidebar();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user: User = {
        name: "Kunal Jadhav",
        phone: "+91 9920655685",
        initials: "KJ",
    };

    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }, []);

    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen((prev) => !prev);
    }, []);

    const closeDropdown = useCallback(() => {
        setIsDropdownOpen(false);
    }, []);

    const handleLogout = useCallback(() => {
        console.log("Logout clicked");
        closeDropdown();
    }, [closeDropdown]);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isDropdownOpen) {
                closeDropdown();
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isDropdownOpen, closeDropdown]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                closeDropdown();
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, closeDropdown]);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 py-1">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="Search campaigns..."
                        aria-label="Search campaigns"
                        className="w-full pl-10 pr-3 sm:pr-14 py-2 text-sm rounded-md border border-pink-400 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-shadow"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Support Button */}
                    <button
                        type="button"
                        aria-label="Support"
                        className="p-2 sm:px-4 rounded-lg transition-colors hover:bg-pink-100 bg-pink-50 border border-pink-100 cursor-pointer hover:text-pink-600 flex items-center gap-2"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                        </svg>
                        <span className="hidden sm:inline text-sm font-medium">Support</span>
                    </button>

                    {/* Notifications */}
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="hidden lg:flex relative p-2 rounded-lg transition-colors hover:bg-pink-50 hover:text-pink-600"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                    </button>

                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={toggleDropdown}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                            className="flex items-center gap-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {user.initials}
                            </div>

                            {/* User Info */}
                            <div className="hidden lg:block text-left min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`hidden sm:block transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                                    }`}
                                aria-hidden="true"
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 z-50 overflow-hidden"
                            >
                                {/* Mobile: Show user info */}
                                <div className="lg:hidden px-4 py-3 border-b border-gray-200 bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                                </div>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default AppHeader