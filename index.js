const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");

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

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WebSocket server is running.");
    return;
  }

  // Handle non-WebSocket HTTP requests if needed
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running.");
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Log when a client connects
wss.on("connection", (socket) => {
  console.log("Client connected");

  // Send a welcome message to the client
  socket.send("Welcome to the WebSocket server!");

  // Listen for messages from the client (both text and binary)
  socket.on("message", (message) => {
    if (message instanceof Buffer) {
      // Handle binary image data
      const filename = `image-${Date.now()}.png`;
      console.log(`Received image data: ${filename}`);
      fs.writeFileSync(filename, message);
    } else {
      // Handle text data
      console.log(`Received: ${message}`);
      socket.send(`Server received: ${message}`);
    }
  });

  // Log when the client disconnects
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

// Start the HTTP server on port 8080
server.listen(8080, () => {
  console.log("WebSocket server is running on ws://localhost:8080");
});
