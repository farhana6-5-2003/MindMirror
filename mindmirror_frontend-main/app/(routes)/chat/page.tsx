"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Brain } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useRouter } from "next/navigation";




interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

export default function ChatPage() {



const router = useRouter();

useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        router.push("/login");
    }
}, []);




    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: "Hello! I'm MindMirror, your reflection companion. How are you feeling today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input not supported");
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
            setInput((prev) => prev + " " + text.trim());
        }
    };

    setRecognition(recog);
    }, []);


    
const handleSend = async () => {
    if (!input.trim()) return;

    const userId = localStorage.getItem("user_id");

    if (!userId) {
        alert("Please login first.");
        return;
    }

    const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
        const response = await fetch(
            `http://localhost:8000/chat/?question=${encodeURIComponent(input)}&user_id=${userId}`,
            {
                method: "POST",
            }
        );

        const data = await response.json();

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: data.answer || "Something went wrong.",
        };

        setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "Unable to connect to server.",
        };

        setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
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


    return (
        <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)]">
                    <Brain size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-gray-900">MindMirror AI</h2>
                    <p className="text-xs text-gray-500">Your reflection companion</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex w-full mb-2",
                            message.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                                message.role === "user"
                                    ? "bg-[var(--primary-green)] text-white rounded-br-none"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                            )}
                        >
                            {message.content}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start w-full mb-2"
                    >
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-4 mt-auto">
                <div className="relative flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Share your thoughts..."
                        className="rounded-full pl-5 pr-12 py-6 border-transparent bg-white shadow-md focus-visible:ring-[var(--primary-green)]"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                        <Button
                        onClick={handleMic}
                        size="icon"
                        variant="ghost"
                        className={`rounded-full ${
                            isListening
                                ? "text-red-500 animate-pulse"
                                : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <Mic size={20} />
                    </Button>
                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="rounded-full w-10 h-10 bg-[var(--primary-green)] text-white shadow hover:opacity-90 transition-transform active:scale-95"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
