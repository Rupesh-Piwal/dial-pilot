# Dial Pilot 

A low latency, real-time Voice AI agent built with Next.js, Twilio Media Streams, and the Google Gemini Multimodal Live API. 

Dial Pilot allows users to instantly configure a custom AI persona and place an outbound phone call. The AI "listens" and "speaks" natively over the phone network in real-time, handling interruptions and conversational dynamics flawlessly.

---

## ✨ Features

- **Native Multimodal Audio:** Bypasses traditional STT/TTS pipelines. Audio goes straight into Gemini and natively comes out, bringing latency down to milliseconds.
- **Dynamic Prompting:** Inject custom personalities or instructions into the AI right before the call starts.
- **Real-Time Interruption Handling:** The AI stops talking immediately if the user interrupts it mid-sentence.
- **Live Call Dashboard:** Track the live duration of the call and view your historical call logs in a sleek UI.

---

## 🏗️ Architecture Under the Hood

The magic of Dial Pilot happens by bridging the analog telephone network (Twilio) with Google's latest multimodal models using bi-directional WebSockets.

1. **Frontend (Next.js):** Collects the target phone number and the AI instructions.
2. **REST API (`/api/call`):** Triggers a Twilio outbound call using TwiML and passes the custom prompt as a stream parameter.
3. **WebSocket Server (`server.ts`):** 
   - Acts as the central orchestrator. 
   - Uses a custom byte-level transcoder (`audio-utils.ts`) to continuously translate Twilio's 8kHz mu-law audio into Gemini's 16kHz/24kHz PCM16 audio format.
   - Maintains continuous, open pipes to both Twilio and Google to ensure zero-lag conversations.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- A [Twilio](https://www.twilio.com/) account with a registered phone number.
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey).
- [Ngrok](https://ngrok.com/) installed to tunnel your local WebSocket server to the public web.

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Twilio Credentials
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Your Public WebSocket URL (e.g., from Ngrok or Render)
WEBSOCKET_SERVER_URL=wss://your-ngrok-url.ngrok-free.app
```

### 3. Run the Servers
Because this app relies on both a Next.js frontend and a dedicated Express WebSocket server, you need to run both locally.

**Terminal 1: Start Ngrok**
```bash
# Expose port 8080 (where server.ts runs)
ngrok http 8080
```
*(Remember to update `WEBSOCKET_SERVER_URL` with your new `wss://...` ngrok link!)*

**Terminal 2: Start the Next.js Frontend**
```bash
npm install
npm run dev
```

**Terminal 3: Start the WebSocket Server**
```bash
npx tsx server.ts
```

Open [http://localhost:3000](http://localhost:3000) in your browser, enter a phone number, give the AI a prompt, and hit "Start Call"!

---

## 🌍 Production Deployment

To run this in production, you must split the services:
1. **Frontend:** Deploy the Next.js app to **Vercel**.
2. **Backend:** Deploy the `server.ts` file to a persistent service like **Render** or **Railway**. 
   - *Important:* Ensure the Start Command on Render is set to `npx tsx server.ts` (do not use `next start` for the backend).
3. **Link Them:** Update the `WEBSOCKET_SERVER_URL` in your Vercel environment variables to point to the `wss://` version of your Render URL.
