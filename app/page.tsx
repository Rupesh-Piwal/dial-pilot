"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState("");
  
  // Call State
  const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "in-progress">("idle");
  const [callSid, setCallSid] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallStatus("dialing");
    setDuration(0);

    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, prompt }),
      });

      const data = await response.json();

      if (data.success && data.callSid) {
        setCallSid(data.callSid);
      } else {
        alert(data.error);
        setCallStatus("idle");
      }
    } catch (error) {
      alert("Error connecting to backend");
      setCallStatus("idle");
    }
  };

  const handleHangUp = async () => {
    if (!callSid) {
      setCallStatus("idle");
      return;
    }
    
    try {
      await fetch("/api/hangup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callSid }),
      });
      // The polling will naturally detect the end, but we optimistically end it here:
      setCallStatus("idle");
      setCallSid(null);
    } catch (error) {
      console.error("Failed to hang up");
    }
  };

  // Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "in-progress") {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Polling Status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus !== "idle" && callSid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/status?callSid=${callSid}`);
          const data = await res.json();
          if (data.success) {
            if (data.status === "in-progress" && callStatus === "dialing") {
              setCallStatus("in-progress");
            } else if (["completed", "failed", "busy", "no-answer", "canceled"].includes(data.status)) {
              setCallStatus("idle");
              setCallSid(null);
            }
          }
        } catch (error) {
          // Ignore network errors during polling
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [callStatus, callSid]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-slate-600 shadow-sm">
            Live Audio Agent
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">Dial Pilot</h1>
          <p className="mt-3 text-lg text-slate-500">Launch AI-powered voice calls instantly.</p>
        </div>

        {callStatus === "idle" ? (
          // --- IDLE STATE (FORM) ---
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <form onSubmit={handleStartCall} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">AI Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="You are an angry Italian chef. Complain about how I cooked my pasta..."
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition-all hover:bg-slate-800"
              >
                Start AI Call
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </form>
          </div>
        ) : (
          // --- ACTIVE CALL STATE ---
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl shadow-blue-900/10 text-center flex flex-col items-center justify-center">
            
            {/* Pulsing Avatar */}
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
              {callStatus === "in-progress" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-2 rounded-full bg-blue-500 opacity-30 animate-pulse"></div>
                </>
              )}
              {callStatus === "dialing" && (
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
              )}
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>

            {/* Status & Timer */}
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {callStatus === "dialing" ? "Dialing..." : "Call Connected"}
            </h2>
            <p className="text-lg text-slate-500 mb-8 font-mono bg-slate-100 px-4 py-1 rounded-full">
              {callStatus === "dialing" ? "Waiting for pickup" : formatDuration(duration)}
            </p>

            {/* Hang Up Button */}
            <button
              onClick={handleHangUp}
              className="group relative flex w-64 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-4 font-bold text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hang Up
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Powered by Twilio • Google Gemini
        </p>
      </div>
    </main>
  );
}