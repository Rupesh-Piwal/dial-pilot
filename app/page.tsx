"use client";

import { useState } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, prompt }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Backend replied: ${data.message}`);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      alert("Error connecting to backend");
    }
  };

  return (
    <main style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Dial Pilot (Dev Mode)</h1>
      
      <form onSubmit={handleStartCall} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', marginTop: '20px' }}>
        
        <label>
          Phone Number:
          <input 
            type="tel" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder="+1234567890"
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>

        <label>
          AI Prompt:
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Act as a helpful assistant..."
            required 
            rows={4}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>

        <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>
          Start Call
        </button>

      </form>
    </main>
  );
}
