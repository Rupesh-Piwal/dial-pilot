import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Successfully connected to local WebSocket server!");
  ws.close();
});

ws.on("error", (err) => {
  console.error("Failed to connect:", err);
});
