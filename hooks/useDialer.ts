import { useState, useEffect, useCallback } from "react";

export interface CallHistoryItem {
  target: string;
  status: string;
  duration: number;
  date: string;
}

export type CallStatus = "idle" | "dialing" | "in-progress";

export function useDialer() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState("");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
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

  const startCall = async (e: React.FormEvent) => {
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

  const hangUp = async () => {
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
          const res = await fetch(`/api/status?callSid=${callSid}`, {
            cache: "no-store",
          });
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
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [callStatus, callSid, endCall]);

  return {
    phoneNumber,
    setPhoneNumber,
    prompt,
    setPrompt,
    callStatus,
    duration,
    history,
    startCall,
    hangUp,
  };
}
