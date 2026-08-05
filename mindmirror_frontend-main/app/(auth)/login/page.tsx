"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.user_id) {
                localStorage.setItem("user_id", data.user_id);
                router.push("/chat");
            } else {
                alert(data.detail || data.error || "Invalid credentials");
            }
        } catch (error) {
            alert("Unable to connect to server.");
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)]">
                    <Brain size={28} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">MindMirror</h1>
                <p className="text-sm text-gray-500">Welcome back</p>
            </div>

            <Card className="w-full p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <Button className="w-full rounded-2xl" size="lg" type="submit">
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-[var(--primary-green)] hover:underline">
                        Create account
                    </Link>
                </div>
            </Card>
        </div>
    );
}










// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Brain } from "lucide-react";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Card } from "@/components/ui/Card";

// export default function LoginPage() {
//     const router = useRouter();
//     return (
//         <div className="flex flex-col items-center space-y-6">
//             <div className="flex flex-col items-center space-y-2 text-center">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)]">
//                     <Brain size={28} />
//                 </div>
//                 <h1 className="text-2xl font-bold tracking-tight">MindMirror</h1>
//                 <p className="text-sm text-gray-500">Welcome back to your reflection space</p>
//             </div>

//             <Card className="w-full p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
//                 <form className="space-y-4" onSubmit={(e) => {
//                     e.preventDefault();
//                     router.push("/write");
//                 }}>
//                     <div className="space-y-2">
//                         <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                             Email
//                         </label>
//                         <Input id="email" placeholder="m@example.com" type="email" required />
//                     </div>
//                     <div className="space-y-2">
//                         <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                             Password
//                         </label>
//                         <Input id="password" type="password" required />
//                     </div>
//                     <Button className="w-full rounded-2xl" size="lg" type="submit">
//                         Sign In
//                     </Button>
//                 </form>

//                 <div className="mt-6 text-center text-sm text-gray-500">
//                     Don&apos;t have an account?{" "}
//                     <Link href="/register" className="font-semibold text-[var(--primary-green)] hover:underline">
//                         Create account
//                     </Link>
//                 </div>
//             </Card>
//         </div>
//     );
// }
