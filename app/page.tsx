"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, PhoneOff, Clock, Mic, MoreVertical } from "lucide-react";

interface CallHistoryItem {
  target: string;
  status: string;
  duration: number;
  date: string;
}

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState("");

  const [callStatus, setCallStatus] = useState<"idle" | "dialing" | "in-progress">("idle");
  const [callSid, setCallSid] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const [history, setHistory] = useState<CallHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("dialPilotHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = useCallback(
    (item: CallHistoryItem) => {
      const newHistory = [item, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("dialPilotHistory", JSON.stringify(newHistory));
    },
    [history]
  );

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

  const endCall = useCallback(
    (status: string) => {
      setCallStatus("idle");
      setCallSid(null);
      if (duration > 0 || status === "Completed") {
        saveHistory({
          target: phoneNumber,
          status: status,
          duration: duration,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        });
      }
    },
    [duration, phoneNumber, saveHistory]
  );

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "in-progress") {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

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
            } else if (
              ["completed", "failed", "busy", "no-answer", "canceled"].includes(data.status)
            ) {
              endCall(data.status === "completed" ? "Completed" : "Failed");
            }
          }
        } catch (error) {
          // Ignore network errors during polling
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [callStatus, callSid, endCall]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <main
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "80px 20px 100px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: "0 0 8px",
            }}
          >
            Dial Pilot
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Configure your voice agent and start a call.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "14px",
            padding: "32px",
            marginBottom: "20px",
          }}
        >
          <form onSubmit={handleStartCall}>
            {/* Phone Number */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="phone-input"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                Phone number
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Phone size={14} strokeWidth={2} />
                </div>
                <input
                  id="phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    background: "var(--bg-page)",
                    border: "1px solid var(--border-input)",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--text-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.04)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-input)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Prompt */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label
                  htmlFor="prompt-input"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Agent instructions
                </label>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {prompt.length}/500
                </span>
              </div>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                placeholder="Describe what you want the AI to do on the call..."
                required
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  background: "var(--bg-page)",
                  border: "1px solid var(--border-input)",
                  borderRadius: "8px",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.6,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.04)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-input)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit */}
            <button
              id="start-call-btn"
              type="submit"
              disabled={callStatus !== "idle"}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background: callStatus !== "idle" ? "#999" : "var(--accent-black)",
                border: "none",
                borderRadius: "8px",
                cursor: callStatus !== "idle" ? "not-allowed" : "pointer",
                transition: "background 0.15s, transform 0.1s",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                if (callStatus === "idle") {
                  e.currentTarget.style.background = "#1a1a1a";
                }
              }}
              onMouseLeave={(e) => {
                if (callStatus === "idle") {
                  e.currentTarget.style.background = "var(--accent-black)";
                }
              }}
            >
              <Phone size={15} strokeWidth={2.5} />
              {callStatus === "idle" ? "Start Call" : "Calling..."}
            </button>
          </form>
        </div>

        {/* Active Call */}
        <div
          style={{
            maxHeight: callStatus !== "idle" ? "160px" : "0",
            opacity: callStatus !== "idle" ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s ease, opacity 0.25s ease, margin 0.35s ease",
            marginBottom: callStatus !== "idle" ? "20px" : "0",
          }}
        >
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  position: "relative",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="pulse-ring"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(239, 68, 68, 0.15)",
                  }}
                />
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Mic size={16} color="#ef4444" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#b91c1c",
                    margin: "0 0 1px",
                  }}
                >
                  {callStatus === "dialing" ? "Dialing..." : "Live"}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#dc2626",
                    margin: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {callStatus === "dialing" ? "Connecting" : formatDuration(duration)}
                </p>
              </div>
            </div>
            <button
              id="end-call-btn"
              onClick={handleHangUp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#dc2626",
                background: "#fff",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background 0.1s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              <PhoneOff size={13} strokeWidth={2.5} />
              End
            </button>
          </div>
        </div>

        {/* History */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              History
            </h2>
            {history.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                }}
              >
                {history.length}
              </span>
            )}
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {history.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "var(--bg-page)",
                    border: "1px solid var(--border-subtle)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Clock size={18} color="var(--text-tertiary)" strokeWidth={1.5} />
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    margin: "0 0 4px",
                  }}
                >
                  No calls yet
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                  Your call history will appear here
                </p>
              </div>
            ) : (
              <>
                {/* Desktop header */}
                <div
                  className="history-header"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 0.8fr 1.2fr 40px",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "var(--bg-page)",
                  }}
                >
                  {["Number", "Status", "Duration", "Date", ""].map((col) => (
                    <span
                      key={col}
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>

                {history.map((call, idx) => (
                  <div key={idx}>
                    {/* Desktop */}
                    <div
                      className="history-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr 0.8fr 1.2fr 40px",
                        padding: "12px 16px",
                        alignItems: "center",
                        borderBottom:
                          idx < history.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-page)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {call.target}
                      </span>
                      <span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: call.status === "Completed" ? "#16a34a" : "#dc2626",
                            background: call.status === "Completed" ? "#f0fdf4" : "#fef2f2",
                            padding: "3px 8px",
                            borderRadius: "100px",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: call.status === "Completed" ? "#22c55e" : "#ef4444",
                            }}
                          />
                          {call.status}
                        </span>
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {call.duration > 0 ? formatDuration(call.duration) : "0m 00s"}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {call.date}
                      </span>
                      <span style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            padding: "4px",
                            cursor: "pointer",
                            color: "var(--text-tertiary)",
                            display: "flex",
                            alignItems: "center",
                            transition: "color 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-tertiary)";
                          }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </span>
                    </div>

                    {/* Mobile */}
                    <div
                      className="history-row-mobile"
                      style={{
                        display: "none",
                        padding: "14px 16px",
                        borderBottom:
                          idx < history.length - 1 ? "1px solid var(--border-subtle)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {call.target}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: call.status === "Completed" ? "#16a34a" : "#dc2626",
                            background: call.status === "Completed" ? "#f0fdf4" : "#fef2f2",
                            padding: "2px 7px",
                            borderRadius: "100px",
                          }}
                        >
                          <span
                            style={{
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background: call.status === "Completed" ? "#22c55e" : "#ef4444",
                            }}
                          />
                          {call.status}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "11px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>
                          {call.duration > 0 ? formatDuration(call.duration) : "0m 00s"}
                        </span>
                        <span>{call.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 640px) {
          .history-header {
            display: none !important;
          }
          .history-row {
            display: none !important;
          }
          .history-row-mobile {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}