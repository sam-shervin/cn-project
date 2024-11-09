const http = require("http");
const WebSocket = require("ws");

// Create an HTTP server to attach the WebSocket server with CORS policy
const server = http.createServer((req, res) => {
  console.log(`HTTP request received: ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/stream") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WebSocket video stream server is active.");
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket, req) => {
  console.log("WebSocket Client Connected for video streaming");

  // Send a welcome message to the client
  socket.send("Welcome to the WebSocket video stream!");

  // Listen for messages from the client
  socket.on("message", (message) => {
    if (message instanceof Buffer) {
      // Broadcast the binary frame data to all connected clients except the sender
      wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else {
      console.log(`Received non-binary message: ${message}`);
    }
  });

  // Log WebSocket disconnection
  socket.on("close", () => {
    console.log("WebSocket Client Disconnected");
  });
});

// Start the HTTP server on port 8080
server.listen(8080, () => {
  console.log("WebSocket server is running on ws://localhost:8080");
});
