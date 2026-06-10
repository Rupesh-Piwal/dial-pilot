"use client";

import { useState, useEffect } from "react";

interface CallHistoryItem {
  target: string;
  status: string;
  duration: number;
  date: string;
}

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState("");

  // Call State
  const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "in-progress">("idle");
  const [callSid, setCallSid] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // History State
  const [history, setHistory] = useState<CallHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("dialPilotHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (item: CallHistoryItem) => {
    const newHistory = [item, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem("dialPilotHistory", JSON.stringify(newHistory));
  };

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

  const endCall = (status: string) => {
    setCallStatus("idle");
    setCallSid(null);
    if (duration > 0 || status === "Completed") {
      saveHistory({
        target: phoneNumber,
        status: status,
        duration: duration,
        date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
      });
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
      endCall("Completed");
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
              endCall(data.status === "completed" ? "Completed" : "Failed");
            }
          }
        } catch (error) {
          // Ignore network errors during polling
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [callStatus, callSid, duration, phoneNumber]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 pb-20">

      {/* Brand Header */}
      <div className="flex items-center justify-center pt-10 pb-6 gap-2 font-bold text-2xl tracking-tight">
        <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        Dial Pilot
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8">

        {/* Configure Agent Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold">Configure Agent</h2>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <form onSubmit={handleStartCall}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

              {/* Left Column */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Target Phone Number</label>
                <div className="flex">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                    className="w-full border border-gray-300 rounded-r-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Instructions (System Prompt)</label>
                  <span className="text-xs text-gray-400">{prompt.length}/500</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                  placeholder="You are Dial Pilot, an intelligent assistant. Your goal is to..."
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-black outline-none resize-none"
                />
              </div>
            </div>

            {/* Form CTA */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={callStatus !== "idle"}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {callStatus === "idle" ? "Start AI Call ⌘K" : "Call in Progress..."}
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Call Controller (Only shows when active) */}
        <div className={`transition-all duration-500 overflow-hidden ${callStatus !== "idle" ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-white border border-red-200 shadow-lg ring-1 ring-red-50 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Active Connection</p>
                <h3 className="text-lg font-bold text-red-600">{callStatus === "dialing" ? "Dialing..." : "Live Call"}</h3>
                <p className="text-xs font-mono text-red-500 font-medium mt-1">{callStatus === "dialing" ? "Connecting to destination" : formatDuration(duration)}</p>
              </div>
            </div>

            <button onClick={handleHangUp} className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-6 py-3 rounded-lg border border-red-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              End Call Now
            </button>
          </div>
        </div>

        {/* Recent Dispatches Table */}
        <div className="pt-6">
          <h2 className="text-xl font-bold mb-6">Recent Dispatches</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Target Number</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No recent calls found. Start a call to see it here!
                    </td>
                  </tr>
                ) : (
                  history.map((call, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{call.target}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${call.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${call.status === 'Completed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{call.duration > 0 ? formatDuration(call.duration) : "0m 0s"}</td>
                      <td className="px-6 py-4 text-gray-600">{call.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-black">
                          <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}