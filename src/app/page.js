"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  // ... existing state and logic remains the same ...
  const router = useRouter();
  const [username, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("https://cumeal.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to login");
      }
      
      const userData = await res.json();
      
      // Store the user data or just the ID as a token
      localStorage.setItem("adminToken", userData._id || JSON.stringify(userData));
      router.push("/Dashboard");
    } catch (error) {
      setError(`Login failed: ${error.message}`);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:scale-[1.01]">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100">
            Cumeal Admin
          </h1>
          <p className="text-purple-100/80">Secure Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-50/90">
                Admin ID
              </label>
              <div className="relative">
                <Input
                  id="adminId"
                  type="text"
                  value={username}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter admin ID"
                  disabled={loading}
                  required
                  className="pl-10 bg-white/20 border-white/30 text-purple-50 placeholder-purple-100/50 focus:ring-2 focus:ring-purple-200 focus:border-white/50"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-100/80"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-50/90">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                  required
                  className="pl-10 bg-white/20 border-white/30 text-purple-50 placeholder-purple-100/50 focus:ring-2 focus:ring-purple-200 focus:border-white/50"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-100/80"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-100 bg-red-500/30 rounded-lg border border-red-500/50">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white/20 hover:bg-white/30 border border-white/40 hover:border-white/50 text-purple-50 rounded-xl py-6 text-base font-semibold transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-purple-50 border-t-transparent rounded-full animate-spin" />
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-purple-100/80">
          © 2024 Cumeal. All rights reserved.
        </p>
      </div>
    </div>
  );
}