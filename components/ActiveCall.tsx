import { Mic, PhoneOff } from "lucide-react";
import { CallStatus } from "../hooks/useDialer";

interface ActiveCallProps {
  callStatus: CallStatus;
  duration: number;
  hangUp: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

export function ActiveCall({ callStatus, duration, hangUp }: ActiveCallProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-[350ms] ease-in-out ${
        callStatus !== "idle" ? "mb-5 max-h-[160px] opacity-100" : "mb-0 max-h-0 opacity-0"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-red-200 bg-red-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="pulse-ring absolute inset-0 rounded-full bg-red-500/15" />
            <div className="relative z-1 flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <Mic size={16} className="text-red-500" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="m-0 mb-[1px] text-[13px] font-bold text-red-700">
              {callStatus === "dialing" ? "Dialing..." : "Live"}
            </p>
            <p className="m-0 tabular-nums text-xs font-medium text-red-600">
              {callStatus === "dialing" ? "Connecting" : formatDuration(duration)}
            </p>
          </div>
        </div>
        <button
          id="end-call-btn"
          onClick={hangUp}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-red-200 bg-white px-4 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <PhoneOff size={13} strokeWidth={2.5} />
          End
        </button>
      </div>
    </div>
  );
}
