import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { twilioToGemini, geminiToTwilio } from "./audio-utils";

dotenv.config({ path: ".env.local" });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Twilio Media Stream WebSocket Server is running.");
});

wss.on("connection", (twilioWs: WebSocket) => {
  console.log("New Twilio WebSocket connection established.");

  let streamSid: string | null = null;
  let geminiWs: WebSocket | null = null;
  let audioBuffer: string[] = [];

  const initializeGemini = (prompt: string) => {
    const geminiWsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;
    geminiWs = new WebSocket(geminiWsUrl);

    geminiWs.on("open", () => {
      console.log("Connected to Gemini Multimodal Live API.");

      const systemInstructionText = prompt || "You are a helpful AI voice assistant named Dial Pilot. You are having a phone conversation with a user. Keep your answers extremely concise and conversational. Do not use markdown.";

      const setupMessage = {
        setup: {
          model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
          systemInstruction: {
            parts: [{ text: systemInstructionText }]
          },
          generationConfig: {
            responseModalities: ["AUDIO"]
          }
        }
      };
      geminiWs?.send(JSON.stringify(setupMessage));

      // Flush audio buffer
      if (audioBuffer.length > 0) {
        console.log(`[AudioBuffer] Gemini connected! Flushing ${audioBuffer.length} buffered packet(s) to Gemini.`);
        for (const payload of audioBuffer) {
          const pcmData = twilioToGemini(payload);
          const mediaMessage = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: "audio/pcm;rate=16000",
                data: pcmData
              }]
            }
          };
          geminiWs?.send(JSON.stringify(mediaMessage));
        }
        audioBuffer = [];
      }
    });

    geminiWs.on("message", (data: WebSocket.Data) => {
      try {
        const response = JSON.parse(data.toString());

        if (response.setupComplete) console.log("Gemini Setup Complete!");
        if (response.error) console.error("Gemini Error:", response.error);

        if (response.serverContent && response.serverContent.modelTurn) {
          const parts = response.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith("audio/pcm")) {
              if (streamSid) {
                const mulawData = geminiToTwilio(part.inlineData.data);
                twilioWs.send(JSON.stringify({
                  event: "media",
                  streamSid: streamSid,
                  media: { payload: mulawData }
                }));
              }
            }
          }
        }

        if (response.serverContent && response.serverContent.interrupted) {
          console.log("Gemini interrupted by user.");
          if (streamSid) {
            twilioWs.send(JSON.stringify({
              event: "clear",
              streamSid: streamSid
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing Gemini message:", error);
      }
    });

    geminiWs.on("error", (error) => {
      console.error("Gemini WebSocket error:", error);
    });

    geminiWs.on("close", (code, reason) => {
      console.log(`Gemini WebSocket closed with code ${code} and reason: ${reason.toString()}`);
    });
  };

  twilioWs.on("message", (message: string) => {
    try {
      const msg = JSON.parse(message);

      switch (msg.event) {
        case "connected":
          console.log("Twilio Media Stream Connected");
          break;
        case "start":
          streamSid = msg.start.streamSid;
          const customPrompt = msg.start.customParameters?.prompt || "";
          console.log(`Media Stream Started: ${streamSid}`);
          console.log(`Custom AI Prompt: ${customPrompt || "(None, using default)"}`);
          initializeGemini(customPrompt);
          break;
        case "media":
          if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
            const pcmData = twilioToGemini(msg.media.payload);
            const mediaMessage = {
              realtimeInput: {
                mediaChunks: [{
                  mimeType: "audio/pcm;rate=16000",
                  data: pcmData
                }]
              }
            };
            geminiWs.send(JSON.stringify(mediaMessage));
          } else {
            // Buffer the audio payload if Gemini is not ready yet
            console.log(`[AudioBuffer] Gemini socket not ready. Buffering incoming Twilio audio packet #${audioBuffer.length + 1}`);
            audioBuffer.push(msg.media.payload);
          }
          break;
        case "stop":
          console.log("Twilio Media Stream Stopped");
          if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
            geminiWs.close();
          }
          break;
      }
    } catch (error) {
      console.error("Error parsing Twilio message:", error);
    }
  });

  twilioWs.on("close", () => {
    console.log("Twilio WebSocket connection closed.");
    if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.close();
    }
  });

  twilioWs.on("error", (error) => {
    console.error("Twilio WebSocket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket Server listening on port ${PORT}`);
});
