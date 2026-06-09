import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Twilio Media Stream WebSocket Server is running.");
});

wss.on("connection", (ws: WebSocket) => {
  console.log("New WebSocket connection established.");

  ws.on("message", (message: string) => {
    try {
      const msg = JSON.parse(message);
      
      switch (msg.event) {
        case "connected":
          console.log("Twilio Media Stream Connected");
          break;
        case "start":
          console.log(`Media Stream Started: ${msg.start.streamSid}`);
          break;
        case "media":
          // msg.media.payload contains base64 encoded audio (mulaw, 8000Hz)
          // console.log("Received media payload...");
          break;
        case "stop":
          console.log("Media Stream Stopped");
          break;
        default:
          console.log("Received unknown event:", msg.event);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket Server listening on port ${PORT}`);
});
