"use client";

import { User, Mail, Calendar, Settings, LogOut, ChevronRight, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    

    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem("user_id");

            const response = await fetch(
                `http://localhost:8000/profile/${userId}`
            );

            const data = await response.json();
            setProfile(data);
        };

    fetchProfile();
    }, []);
    return (
        <div className="space-y-8 max-w-lg mx-auto pb-24 lg:pb-0">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-500">Manage your account</p>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 ring-4 ring-white shadow-lg overflow-hidden">
                    {/* Placeholder for avatar image */}
                    <div className="w-full h-full bg-[var(--primary-green)]/20 flex items-center justify-center text-[var(--primary-green)]">
                        <User size={40} />
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
                {/* <Button variant="outline" className="rounded-full px-6 text-xs h-9">
                    Edit Profile
                </Button> */}
            </div>

            {/* Details Card */}
         {/* Details Card */}
<Card className="p-0 overflow-hidden border-none shadow-sm">
  <div className="divide-y divide-gray-100"> {/* Changed to gray-100 for better visibility */}
    
    {/* Full Name Row */}
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 text-gray-600">
        <User size={18} />
        <span className="text-sm font-medium">Full Name</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">{profile?.name}</div>
    </div>

    {/* Email Row */}
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 text-gray-600">
        <Mail size={18} />
        <span className="text-sm font-medium">Email</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">{profile?.email}</div>
    </div>

    {/* Entries Row */}
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 text-gray-600">
        <ListOrdered size={18} />
        <span className="text-sm font-medium">Entries</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">
        {profile?.entries ?? 0}
      </div>
    </div>

    {/* Joined Row */}
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 text-gray-600">
        <Calendar size={18} />
        <span className="text-sm font-medium">Joined</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">
        {profile?.created_at ? new Date(profile.created_at).toDateString() : ""}
      </div>
    </div>

  </div>
</Card>
                
            
        

        {/* Settings & Logout */}
        <div className="space-y-4">
                
        <Link href="/settings" className="block">
                <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 shadow-sm text-gray-700 px-5">
            <div className="flex items-center gap-3">
                <Settings size={20} className="text-gray-400" />
                <span>Settings</span>
            </div>
                <ChevronRight size={18} className="text-gray-300" />
            </Button>
        </Link>

        <Link href="/login" className="block">
            <Button variant="ghost" className="w-full justify-center h-12 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut size={18} className="mr-2" />
                    Sign Out
            </Button>
        </Link>
            </div>
        </div>
    );
}
