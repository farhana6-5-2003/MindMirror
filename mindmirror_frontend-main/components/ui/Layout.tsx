"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { BottomNav } from "@/components/ui/BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar />
            <main className="lg:pl-64 min-h-screen pb-24 lg:pb-0">
                <div className="container mx-auto max-w-5xl p-4 lg:p-8">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
