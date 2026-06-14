import { Clock, MoreVertical } from "lucide-react";
import { CallHistoryItem } from "../hooks/useDialer";

interface CallHistoryProps {
  history: CallHistoryItem[];
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

export function CallHistory({ history }: CallHistoryProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
          History
        </h2>
        {history.length > 0 && (
          <span className="text-xs text-[var(--text-tertiary)]">
            {history.length}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        {history.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-page)]">
              <Clock size={18} className="text-[var(--text-tertiary)]" strokeWidth={1.5} />
            </div>
            <p className="m-0 mb-1 text-[13px] font-medium text-[var(--text-secondary)]">
              No calls yet
            </p>
            <p className="m-0 text-xs text-[var(--text-tertiary)]">
              Your call history will appear here
            </p>
          </div>
        ) : (
          <>
           
            <div className="hidden sm:grid grid-cols-[1.4fr_1fr_0.8fr_1.2fr_40px] border-b border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-2.5">
              {["Number", "Status", "Duration", "Date", ""].map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]"
                >
                  {col}
                </span>
              ))}
            </div>

            {history.map((call, idx) => (
              <div key={idx}>
                
                <div
                  className={`hidden sm:grid grid-cols-[1.4fr_1fr_0.8fr_1.2fr_40px] items-center px-4 py-3 transition-colors hover:bg-[var(--bg-page)] ${
                    idx < history.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                  }`}
                >
                  <span className="tabular-nums text-[13px] font-medium text-[var(--text-primary)]">
                    {call.target}
                  </span>
                  <span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        call.status === "Completed"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          call.status === "Completed" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {call.status}
                    </span>
                  </span>
                  <span className="tabular-nums text-xs text-[var(--text-secondary)]">
                    {call.duration > 0 ? formatDuration(call.duration) : "0m 00s"}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {call.date}
                  </span>
                  <span className="flex justify-end">
                    <button className="flex cursor-pointer items-center border-none bg-transparent p-1 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]">
                      <MoreVertical size={14} />
                    </button>
                  </span>
                </div>

                {/* Mobile */}
                <div
                  className={`block sm:hidden px-4 py-3.5 ${
                    idx < history.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="tabular-nums text-[13px] font-semibold text-[var(--text-primary)]">
                      {call.target}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                        call.status === "Completed"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          call.status === "Completed" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {call.status}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[11px] text-[var(--text-tertiary)]">
                    <span className="tabular-nums">
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
  );
}
