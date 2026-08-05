"use client";

import { useState,useEffect } from "react";
import { Mic, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";


const moods = [
    { emoji: "😔", label: "Sad" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😊", label: "Good" },
    { emoji: "😁", label: "Great" },
    { emoji: "😎", label: "Amazing" },
];

export default function WritePage() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [entry, setEntry] = useState("");

    // words
    const wordCount = entry.trim()
    ? entry.trim().split(/\s+/).length
    : 0;

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    useEffect(() => {
    const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input not supported in this browser");
        return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

   recog.onresult = (event: any) => {
    const lastResult = event.results[event.results.length - 1];

    if (lastResult.isFinal) {
        const text = lastResult[0].transcript;
        setEntry((prev) => prev + " " + text.trim());
    }
};

    setRecognition(recog);
}, []);

        const handleSave = async () => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            alert("Please login first.");
            router.push("/login");
            return;
        }

        if (!entry.trim()) {
            alert("Please write something before saving.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/entries/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    entry_text: entry,
                    entry_type: "text",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Entry saved successfully!");
                setEntry("");
                setSelectedMood(null);
                // EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
                router.push("/write");
            } else {
                alert(data.detail || data.error || "Something went wrong");
            }
        } catch (error) {
            alert("Unable to connect to server.");
        }

        setLoading(false);
    };
    const handleMic = () => {
    if (!recognition) return;

    if (isListening) {
        recognition.stop();
        setIsListening(false);
    } else {
        recognition.start();
        setIsListening(true);
    }
};
        // const handleMic = () => {
        // if (!recognition) return;

        // if (isListening) {
        //     recognition.stop();
        // } else {
        //     try {
        //     recognition.start();
        //     } catch (err) {
        //     console.log("Mic already running");
        //     }
        // }
        // };
    

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-24 lg:pb-0">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Write Today</h1>
                <p className="text-[var(--primary-green)] font-medium">{currentDate}</p>
            </div>

            {/* Mood Selector */}
            <div className="flex justify-center gap-4 py-4">
                {moods.map((mood) => (
                    <motion.button
                        key={mood.label}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMood(mood.label)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedMood === mood.label
                                ? "bg-[var(--primary-green)]/10 ring-2 ring-[var(--primary-green)]"
                                : "hover:bg-gray-100"
                            }`}
                    >
                        <span className="text-3xl">{mood.emoji}</span>
                    </motion.button>
                ))}
            </div>

            {/* Reflection Prompt */}
            <Card className="bg-[var(--lavender)]/20 border-none p-5 flex gap-3 text-gray-700">
                <Info className="shrink-0 text-[var(--lavender)] mt-1" />
                <div>
                    <h3 className="font-semibold mb-1">Daily Reflection</h3>
                    <p className="text-sm leading-relaxed">
                        What is one small thing that brought you joy today, and why did it stand out?
                    </p>
                </div>
            </Card>

            {/* Text Area */}
            <div className="relative">
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Start writing here..."
                    className="w-full h-64 p-6 rounded-3xl border border-gray-200 bg-white shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] text-lg leading-relaxed placeholder:text-gray-400"
                />
                
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    {/* {entry.length} words */}
                    {wordCount} words
                    
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Button
                onClick={handleMic}
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                    isListening
                        ? "text-red-500 animate-pulse"
                        : "text-gray-500 hover:bg-gray-100"
                }`}
            >
             <Mic size={24} />
                </Button>
                {/* <Button className="rounded-full px-8 gap-2 shadow-lg hover:shadow-xl transition-all" size="lg">
                    <Save size={18} />
                    Save Entry
                </Button> */}
                <Button
                onClick={handleSave}
                className="rounded-full px-8 gap-2 shadow-lg hover:shadow-xl transition-all" size="lg">
                <Save size={18} />
                {loading ? "Saving..." : "Save Entry"}
                </Button>


            </div>
        </div>
    );
}
