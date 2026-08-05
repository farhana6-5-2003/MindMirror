
"use client";

import { Card } from "@/components/ui/Card"; // Note: changed to lowercase 'card' per your new design
import { Smile, Flame, Target, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import MindTree from "@/components/MindTree";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";


const emotionEmoji: any = {
  joy: "😊",
  sadness: "😢",
  anger: "😡",
  fear: "😨",
  surprise: "😲"
};
type EmotionConfig = {
  emoji: string;
  color: string;
};

// Use Record to tell TS that keys are strings and values follow our type
const EMOTION_DATA: Record<string, EmotionConfig> = {
  joy: { emoji: "😊", color: "bg-yellow-500/20" },
  sadness: { emoji: "😢", color: "bg-blue-500/20" },
  fear: { emoji: "😨", color: "bg-purple-500/20" },
  anger: { emoji: "😡", color: "bg-red-500/20" },
  surprise: { emoji: "😲", color: "bg-orange-500/20" },
  Default: { emoji: "😶‍🌫️", color: "bg-muted" }
};



export default function EmotionPage() {
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [mindTree, setMindTree] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [stability, setStability] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [calendarData, setCalendarData] = useState<any[]>([]);
    const [trend, setTrend] = useState<any[]>([]);

    const [currentDate, setCurrentDate] = useState(new Date());

const monthYear = currentDate.toLocaleString("default", {
  month: "long",
  year: "numeric",
});

const todayDate = new Date().getDate(); 


const daysInMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
).getDate();

const firstDayOfMonth = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
).getDay();

const calendarDays = [
  ...Array(firstDayOfMonth).fill(null),
  ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
];
    
    // Backend fetching logic preserved
    const generateReport = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8000/generate-weekly-report/?user_id=${userId}`,
                { method: "POST" }
            );
            const data = await response.json();
            if (response.ok && !data.error) {
                setReport(data);
            } else {
                alert(data.error || "No entries in past week.");
            }
        } catch (error) {
            alert("Unable to connect to server.");
        }
        setLoading(false);
    };

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        const fetchLatestReport = async () => {
            try {
                const response = await fetch(`http://localhost:8000/weekly-report/${userId}`);
                const data = await response.json();
                if (response.ok) setReport(data);
            } catch {
                console.log("No report found");
            }
        };

        const fetchMindTree = async () => {
            try {
                const response = await fetch(`http://localhost:8000/mind-tree/${userId}`);
                const data = await response.json();
                if (response.ok) setMindTree(data);
            } catch {
                console.log("No mind tree data");
            }
        };

        const fetchStability = async () => {
  const response = await fetch(
    `http://localhost:8000/emotion-stability/${userId}`
  );
  const data = await response.json();
  setStability(data);
};
const fetchStats = async () => {
  const response = await fetch(`http://localhost:8000/stats/${userId}`);
  const data = await response.json();
  setStats(data);
};

const fetchCalendar = async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  const response = await fetch(
    `http://localhost:8000/emotion-calendar/${userId}`
  );

  const data = await response.json();
  setCalendarData(data);
};
const fetchTrend = async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  const response = await fetch(
    `http://localhost:8000/emotion-trend/${userId}`
  );

  const data = await response.json();
  setTrend(data);
};
fetchTrend();
fetchCalendar();

fetchStats();

fetchStability();

        fetchLatestReport();
        fetchMindTree();
    }, []);

    return (
        <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto space-y-6 pb-20 lg:pb-6">
            {/* Header */}
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Emotion Insights</h1>
                <p className="text-sm text-muted-foreground">Track your emotional journey</p>
            </div>

            {/* Generate Button - Using shadcn Button UI */}
            <Button 
                onClick={generateReport} 
                className="w-full" 
                size="lg" 
                disabled={loading}
            >
                {loading ? "Generating..." : "Generate Weekly Report"}
            </Button>

        

                <Card className="p-5">
    <div className="flex items-start gap-4">
        {/* Helper to find the right emotion data */}
        {(() => {
            const emotionKey = Object.keys(EMOTION_DATA).find(key => 
                report?.dominant_emotion_week?.includes(key)
            ) || "Default";
            
            const { emoji, color } = EMOTION_DATA[emotionKey];

            return (
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-2xl shrink-0`}>
                    {emoji}
                </div>
            );
        })()}

        <div>
            <p className="font-semibold text-foreground">
                {report ? report.dominant_emotion_week : "No Data Yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
                {report ? report.mood_pattern : "Generate your weekly insight to see patterns."}
            </p>
        </div>
    </div>
</Card>


            {/* Weekly Summary - Dynamic Data */}
            {report && (
                <Card className="p-5">
                    <h3 className="font-semibold text-foreground mb-2">Weekly Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {report.summary}
                    </p>
                </Card>
            )}

            {/* Mind Tree - Using the new Component with dynamic data */}
            {mindTree && (
                <Card className="p-5">
                    <h3 className="font-semibold text-foreground mb-1">🌳 Weekly Emotional Overview</h3>
                    <p className="text-xs text-muted-foreground mb-2">Tap the tree to explore your emotions</p>
                    <MindTree mindTree={mindTree} />
                </Card>
              )}
              {stability && (
                <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-2">
                 Emotional Stability
                </h3>

                <p className="text-3xl font-bold text-primary">
                     {stability.stability_score}%
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                {stability.message}
                </p>
                </Card>
                )}

            {/* Stats Row */}
            {/* <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <Flame className="w-5 h-5 mx-auto text-destructive" />
                    <p className="text-xl font-bold text-foreground mt-1">{stats?.streak ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                </Card>
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <Calendar className="w-5 h-5 mx-auto text-primary" />
                    <p className="text-xl font-bold text-foreground mt-1">{stats?.entries ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Entries</p>
                </Card>
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <Target className="w-5 h-5 mx-auto text-purple-500" />
                    <p className="text-xl font-bold text-foreground mt-1">3/5</p>
                    <p className="text-xs text-muted-foreground">Goals</p>
                    <p className="text-xl font-bold text-foreground mt-1">Be Focused</p>
                    <p className="text-xs text-muted-foreground">🤩🙌🏻</p>
                </Card>
            </div> */}

            {/* Mood Calendar */}
            <Card className="p-5">
                <div className="flex justify-between items-center mb-2">
                <button
                    onClick={() =>
                    setCurrentDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                    )
                    } >
                    ⬅️
                </button>

                <h3>{monthYear}</h3>

                <button
                    onClick={() =>
                    setCurrentDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                    )
                    }
                >
                    ➡️
                </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                            {day}
                        </div>
                    ))}
                    {calendarDays.map((day, index) => {
                        if (!day) {
                        return <div key={index} className="aspect-square"></div>;
                        }
                        const today = new Date();

                        const isToday =
                        day === today.getDate() &&
                        currentDate.getMonth() === today.getMonth() &&
                        currentDate.getFullYear() === today.getFullYear();


                    const entry = calendarData.find((d:any) => {
                    const date = new Date(d.date);

                    return (
                        date.getDate() === day &&
                        date.getMonth() === currentDate.getMonth() &&
                        date.getFullYear() === currentDate.getFullYear()
                    );
                    });

                const emoji = entry ? emotionEmoji[entry.emotion] : null;

                return (
                    <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl hover:bg-gray-100
                ${isToday ? "bg-green-100 border border-green-400" : "bg-gray-50"}`}
                >
                    <span className="text-xs text-gray-400">{day}</span>

                    {emoji && (
                        <span className="text-lg">
                        {emoji}
                        </span>
                    )}
                    
                    </div>
                );
                })}

            </div>
            </Card>
            

            <Card className="p-5">
            <h3 className="font-semibold mb-8 flex items-center gap-2">
            📈 Weekly Emotion Trend
            </h3>
          

            <div className="flex gap-4 text-xs mb-3">
            <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span> Joy
            </span>

            <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span> Anger
            </span>

            <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-gray-500 rounded-full"></span> Sadness
            </span>

            <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span> Fear
            </span>

            <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Surprise
            </span>
            </div>
            {trend.length > 0 && (
            
            <LineChart width={600} height={280} data={trend}
            margin={{ top: 10, right: 30, left: 40, bottom: 20 }}>
            
            <YAxis />
            <Tooltip />

                    <XAxis 
        dataKey="date" 
        tickFormatter={(str) => {
            const date = new Date(str);
            if (isNaN(date.getTime())) return str; // Fallback if string is weird
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        }}
        interval="preserveStartEnd" // Only shows labels that fit
        height={50}
        tick={{ fontSize: 12 }}
        label={{ value: "Date", position: "insideBottom", offset: -10 }}/>

        
            <YAxis label={{ value: "Emotion Intensity", angle: -90, position: "insideLeft", dx: -10,style: { textAnchor: 'middle' } }} />   
            <Line type="monotone" dataKey="joy" stroke="#22c55e" strokeWidth={2} dot />
<Line type="monotone" dataKey="sadness" stroke="#64748b" strokeWidth={2} dot/>
<Line type="monotone" dataKey="anger" stroke="#ef4444" strokeWidth={2}dot />
<Line type="monotone" dataKey="fear" stroke="#a855f7" strokeWidth={2} dot />
<Line type="monotone" dataKey="surprise" stroke="#eab308" strokeWidth={2} dot />
            </LineChart>)}
            
            </Card>
          
        </div>
        );
        }

