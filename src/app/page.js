"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("https://cumeal.vercel.app/api/menu/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminId, password }), // Changed from adminid to adminId
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-extrabold">Cumeal - Admin</h1>
      <form className="flex flex-col items-center justify-center gap-3 mt-12 w-full sm:w-1/2 md:w-1/4" onSubmit={handleLogin}>
        <Input 
          type="text" 
          placeholder="Admin ID" 
          value={adminId} 
          onChange={(e) => setAdminId(e.target.value)}
          disabled={loading}
        />
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}