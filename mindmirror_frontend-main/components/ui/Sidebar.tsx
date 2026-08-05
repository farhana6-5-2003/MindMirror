"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, MessageSquare, Heart, BookOpen, List, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const navItems = [
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Emotion", href: "/emotion", icon: Heart },
    { name: "Diary", href: "/write", icon: BookOpen },
    { name: "Entries", href: "/entries", icon: List },
    { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
    const pathname = usePathname();

    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
    const fetchUser = async () => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/users/${userId}`
            );

            const data = await response.json();

            if (response.ok) {
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user");
        }
    };

    fetchUser();
}, []);

    return (
        <div className="hidden lg:flex h-screen w-64 flex-col bg-[#F9FAFB] border-r border-gray-100 p-6 fixed left-0 top-0">
            {/* Logo Area */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)]">
                    <Brain size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-900 tracking-tight">MindMirror</h1>
                    <p className="text-xs text-gray-500 font-medium">Reflection Companion</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-[var(--primary-green)]/10 text-[var(--primary-green)] shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 min-w-0">
                        {/* <p className="text-sm font-semibold text-gray-900 truncate">Alex Doe</p>
                        <p className="text-xs text-gray-500 truncate">alex@example.com</p> */}
                        <p className="text-sm font-semibold text-gray-900 truncate">{user ? user.name : "Loading..."}</p>
                        <p className="text-xs text-gray-500 truncate">{user ? user.email : ""}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                    localStorage.removeItem("user_id");
                    router.push("/login");
                    }}
                className="flex items-center gap-2 px-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors w-full">
                <LogOut size={18} />Sign Out</button>
            </div>
        </div>
    );
}
