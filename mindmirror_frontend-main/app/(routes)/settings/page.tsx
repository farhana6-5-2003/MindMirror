"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    const fetchProfile = async () => {
      const res = await fetch(`http://localhost:8000/profile/${userId}`);
      const data = await res.json();
      setName(data.name);
    };

    fetchProfile();

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleUpdate = async () => {
    const userId = localStorage.getItem("user_id");

    setLoading(true);

    await fetch(`http://localhost:8000/update-profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);
    alert("Profile updated!");
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    localStorage.setItem("theme", newMode ? "dark" : "light");

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 min-h-screen p-4">

      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="card p-6 space-y-4">

        {/* Name */}
        <div>
          <label className="text-sm text-gray-500">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-500">Change Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="text-sm">Dark Mode</span>

          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition ${
              darkMode ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transform transition ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Save */}
        <Button onClick={handleUpdate}>
          {loading ? "Updating..." : "Save Changes"}
        </Button>

      </Card>

    </div>
  );
}