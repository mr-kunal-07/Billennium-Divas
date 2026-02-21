"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import { SidebarContext } from "@/context/SidebarContext";

interface LayoutWrapperProps {
    children: React.ReactNode;
}


export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const sidebarContextValue = {
        isSidebarOpen,
        openSidebar: () => setIsSidebarOpen(true),
        closeSidebar: () => setIsSidebarOpen(false),
        toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
    };

    return (
        <SidebarContext.Provider value={sidebarContextValue}>
            <div className="flex h-screen overflow-hidden bg-white">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}