"use client";

import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";


import { useEffect } from "react";
import { useRouter } from "next/navigation";



const emotionEmoji: any = {
  joy: "😊",
  sadness: "😢",
  anger: "😡",
  fear: "😨",
  surprise: "😲"
};

const emotionColor = {
  joy: "text-yellow-500",
  sadness: "text-blue-500",
  anger: "text-red-500",
  fear: "text-purple-500",
  surprise: "text-orange-500",
};


// const entries = [
//     {
//         id: 1,
//         title: "Morning Reflection",
//         date: "Feb 17, 2026",
//         emoji: "😊",
//         preview: "Today I woke up feeling surprisingly refreshed. The sun was shining...",
//         mood: "calm",
//     },

// ];

export default function EntriesPage() {

    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [openId, setOpenId] = useState<number | null>(null);

    const [search, setSearch] = useState("");

   const filteredEntries = entries.filter((entry: any) =>
    entry.text?.toLowerCase().includes(search.toLowerCase())
);




    useEffect(() => {
    const fetchEntries = async () => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8000/entries/user/${userId}`
            );

            const data = await response.json();

            if (response.ok) {
                setEntries(data);
            }
        } catch (error) {
            console.error("Failed to fetch entries");
        }

        setLoading(false);
    };

    fetchEntries();
}, []);


    return (
        <div className="space-y-6 pb-24 lg:pb-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">Your Entries</h1>
                <p className="text-gray-500">Reflect on your past thoughts</p>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search entries..."
                        className="pl-10 rounded-2xl border-gray-200"
                    />
                </div>
                <Button variant="outline" size="icon" className="rounded-2xl border-gray-200 shrink-0">
                    <Filter size={18} className="text-gray-500" />
                </Button>
            </div>
            
            
            {loading && (
            <p className="text-gray-400">Loading entries...</p>
        )}

        {!loading && filteredEntries.length === 0 && (
            <p className="text-gray-400">No entries found.</p>
        )}

            {/* Entries List */}
            <div className="grid gap-4">
                {filteredEntries.map((entry) => (
                   
       <Card
        key={entry.id}
        onClick={() => setOpenId(openId === entry.id ? null : entry.id)}
        className="p-4 hover:shadow-md transition-shadow cursor-pointer flex gap-4 border-none shadow-sm">

    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
        📝
    </div>


    <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
           <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
  {emotionEmoji[entry.dominant_emotion] || "😶"}
  {entry.dominant_emotion.charAt(0).toUpperCase() + entry.dominant_emotion.slice(1)}
</span>

            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0 bg-gray-50 px-2 py-1 rounded-full">
                <Calendar size={10} />
                {new Date(entry.date).toLocaleDateString()}
            </span>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
        {openId === entry.id
            ? entry.text
            : entry.text.slice(0, 100) + "..."}
        </p>
    <p className="text-xs text-blue-500 mt-1">
    {openId === entry.id ? "Show less" : "Read more"}
    </p>
    </div>
</Card>

                ))}
            </div>
        </div>
    );
}
