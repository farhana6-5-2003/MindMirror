"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Heart, PenLine, List, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Emotion", href: "/emotion", icon: Heart },
    { name: "Write", href: "/write", icon: PenLine, isFloating: true },
    { name: "Entries", href: "/entries", icon: List },
    { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-lg rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex items-center justify-between px-6 z-50">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (item.isFloating) {
                    return (
                        <div key={item.href} className="relative -top-6">
                            <Link href={item.href}>
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 rounded-full bg-[var(--lavender)] text-white shadow-lg flex items-center justify-center border-4 border-[#F5F6F8]"
                                >
                                    <Icon size={24} strokeWidth={2.5} />
                                </motion.div>
                            </Link>
                        </div>
                    );
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors",
                            isActive ? "text-[var(--primary-green)]" : "text-gray-400"
                        )}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </Link>
                );
            })}
        </div>
    );
}
