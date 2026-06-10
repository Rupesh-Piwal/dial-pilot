"use client";

import { useState } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          prompt,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-slate-600 shadow-sm">
            Dev Mode
          </span>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            Dial Pilot
          </h1>

          <p className="mt-3 text-lg text-slate-500">
            Launch AI-powered voice calls instantly.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <form onSubmit={handleStartCall} className="space-y-6">

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Prompt */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                AI Prompt
              </label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="Act as a helpful assistant and guide the customer through..."
                required
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Starting Call...
                </>
              ) : (
                <>
                  Start AI Call
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Powered by Twilio • Vapi • OpenAI
        </p>
      </div>
    </main>
  );
}