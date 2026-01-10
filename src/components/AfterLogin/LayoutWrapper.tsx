"use client";

import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    return (
        <div className="flex h-screen min-w-7xl mx-auto overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* App Header */}
                <AppHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
