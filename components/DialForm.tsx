import { Phone } from "lucide-react";
import { CallStatus } from "../hooks/useDialer";

interface DialFormProps {
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  callStatus: CallStatus;
  startCall: (e: React.FormEvent) => void;
}

export function DialForm({
  phoneNumber,
  setPhoneNumber,
  prompt,
  setPrompt,
  callStatus,
  startCall,
}: DialFormProps) {
  return (
    <div className="mb-5 rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
      <form onSubmit={startCall}>
  
        <div className="mb-5">
          <label
            htmlFor="phone-input"
            className="mb-1.5 block text-[13px] font-semibold text-[var(--text-primary)]"
          >
            Phone number
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-[var(--text-tertiary)]">
              <Phone size={14} strokeWidth={2} />
            </div>
            <input
              id="phone-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-page)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--text-primary)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
            />
          </div>
        </div>

    
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="prompt-input"
              className="text-[13px] font-semibold text-[var(--text-primary)]"
            >
              Agent instructions
            </label>
            <span className="tabular-nums text-[11px] text-[var(--text-tertiary)]">
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
            className="w-full resize-none rounded-lg border border-[var(--border-input)] bg-[var(--bg-page)] p-3 text-sm leading-relaxed text-[var(--text-primary)] outline-none transition-all focus:border-[var(--text-primary)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
          />
        </div>

        <button
          id="start-call-btn"
          type="submit"
          disabled={callStatus !== "idle"}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[var(--accent-black)] p-3 text-sm font-semibold tracking-[-0.01em] text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:bg-[#999]"
        >
          <Phone size={15} strokeWidth={2.5} />
          {callStatus === "idle" ? "Start Call" : "Calling..."}
        </button>
      </form>
    </div>
  );
}
