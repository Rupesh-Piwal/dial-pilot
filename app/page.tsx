"use client";

import { useDialer } from "../hooks/useDialer";
import { DialForm } from "../components/DialForm";
import { ActiveCall } from "../components/ActiveCall";
import { CallHistory } from "../components/CallHistory";

export default function Home() {
  const {
    phoneNumber,
    setPhoneNumber,
    prompt,
    setPrompt,
    callStatus,
    duration,
    history,
    startCall,
    hangUp,
  } = useDialer();

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <main className="mx-auto max-w-[600px] px-5 pt-20 pb-[100px]">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-[32px] font-extrabold leading-[1.2] tracking-[-0.03em] text-[var(--text-primary)]">
            Dial Pilot
          </h1>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Configure your voice agent and start a call.
          </p>
        </div>

        <DialForm
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          prompt={prompt}
          setPrompt={setPrompt}
          callStatus={callStatus}
          startCall={startCall}
        />

        <ActiveCall 
          callStatus={callStatus} 
          duration={duration} 
          hangUp={hangUp} 
        />

        <CallHistory history={history} />
      </main>
    </div>
  );
}