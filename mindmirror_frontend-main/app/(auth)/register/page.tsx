"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push("/login");
            } else {
                alert(data.detail || data.error || "Registration failed");
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
                <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                <p className="text-sm text-gray-500">Start your journey with MindMirror</p>
            </div>

            <Card className="w-full p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <Button className="w-full rounded-2xl" size="lg" type="submit">
                        {loading ? "Creating..." : "Create Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-[var(--primary-green)] hover:underline">
                        Sign in
                    </Link>
                </div>
            </Card>
        </div>
    );
}






// "use client";

// import Link from "next/link";
// import { Brain } from "lucide-react";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Card } from "@/components/ui/Card";

// export default function RegisterPage() {
//     return (
//         <div className="flex flex-col items-center space-y-6">
//             <div className="flex flex-col items-center space-y-2 text-center">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)]">
//                     <Brain size={28} />
//                 </div>
//                 <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
//                 <p className="text-sm text-gray-500">Start your journey with MindMirror</p>
//             </div>

//             <Card className="w-full p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
//                 <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
//                     <div className="space-y-2">
//                         <label htmlFor="name" className="text-sm font-medium leading-none">
//                             Full Name
//                         </label>
//                         <Input id="name" placeholder="Alex Doe" required />
//                     </div>
//                     <div className="space-y-2">
//                         <label htmlFor="email" className="text-sm font-medium leading-none">
//                             Email
//                         </label>
//                         <Input id="email" placeholder="m@example.com" type="email" required />
//                     </div>
                  
//                     <div className="space-y-2">
//                         <label htmlFor="password" className="text-sm font-medium leading-none">
//                             Password
//                         </label>
//                         <Input id="password" type="password" required />
//                     </div>
//                     <Button className="w-full rounded-2xl" size="lg">
//                         Create Account
//                     </Button>
//                 </form>

//                 <div className="mt-6 text-center text-sm text-gray-500">
//                     Already have an account?{" "}
//                     <Link href="/login" className="font-semibold text-[var(--primary-green)] hover:underline">
//                         Sign in
//                     </Link>
//                 </div>
//             </Card>
//         </div>
//     );
// }
