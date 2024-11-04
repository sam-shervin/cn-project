// Import required modules
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running.');
});

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('ESP32-CAM connected.');

  // Handle messages from ESP32-CAM
  ws.on('message', (data) => {
    console.log('Received data of size:', data.length);
    
    // Optionally save the data to a file (e.g., for testing purposes)
    // fs.appendFile('video_stream.bin', data, (err) => {
    //   if (err) {
    //     console.error('Error writing data to file:', err);
    //   }
    // });

    // Forward data to any connected clients if needed
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('ESP32-CAM disconnected.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the HTTP server and WebSocket server on port 8080
server.listen(8080, () => {
  console.log('WebSocket server is listening on ws://<domain1.com>:8080');
});
