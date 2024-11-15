const WebSocket = require("ws");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const outputDir = path.join(__dirname, "videos");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
let outputFile;

let recording = false;
let ffmpegProcess;
let activeClients = 0;
let frameBuffer = []; // Buffer to hold frames during the delay period
let frameCount = 0; // Count of frames received during the 5-second delay

// Create a single HTTP server
const server = http.createServer((req, res) => {
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
    if (req.url === "/start") {
      console.log("Starting recording");
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
      outputFile = path.join(outputDir, `output-${timestamp}.mp4`);

      startRecordingWithDelay(); // Start the delayed recording process
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Recording will start in 5 seconds\n");
    } else if (req.url === "/stop") {
      console.log("Stopping recording");
      stopRecording();
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Recording stopped\n");
    } else if (req.url === "/listrecordings") {
      console.log("Listing recordings");
      fs.readdir(outputDir, (err, files) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Unable to retrieve files" }));
        } else {
          const videoFiles = files.filter((file) => file.endsWith(".mp4"));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(videoFiles));
        }
      });
    }

    // Endpoint to download a specific video file
    else if (req.url.startsWith("/download")) {
      const fileName = decodeURIComponent(req.url.split("/download/")[1]);
      const filePath = path.join(outputDir, fileName);

      if (fs.existsSync(filePath)) {
        res.writeHead(200, {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
      }
    } else if (req.url === "/") {
      const filePath = path.join(__dirname, "html-serve", "index.html");
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    }
  }
});

// Attach WebSocket server to the same HTTP server
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("Client connected");
  activeClients++;

  socket.on("message", (message) => {
    if (message instanceof Buffer) {
      // Broadcast the frame to all connected clients
      wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      // Write frame to ffmpeg if recording
      if (recording && ffmpegProcess) {
        console.log(`Received frame of size: ${message.length}`);
        ffmpegProcess.stdin.write(message);
      } else {
        // Buffer frames during the delay period
        frameBuffer.push(message);
        frameCount++;
      }
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    activeClients--;

    if (activeClients === 0 && recording) {
      stopRecording(); // Stop recording if no clients are left
    }
  });
});

// Start recording after a 5-second delay and calculate FPS
function startRecordingWithDelay() {
  if (recording) return;
  recording = true;

  frameBuffer = [];
  frameCount = 0;

  console.log("Buffering frames for 5 seconds to calculate FPS...");
  setTimeout(() => {
    const fps = frameCount / 5; // Calculate FPS
    console.log(`Calculated FPS: ${fps}`);

    startRecording(fps); // Start recording with the calculated FPS

    // Write buffered frames to ffmpeg
    frameBuffer.forEach((frame) => {
      ffmpegProcess.stdin.write(frame);
    });

    // Clear the buffer
    frameBuffer = [];
  }, 5000); // Delay of 5 seconds
}

// Start the recording process with the calculated FPS
function startRecording(fps) {
  ffmpegProcess = spawn("ffmpeg", [
    "-f",
    "image2pipe", // Read frames from stdin
    "-framerate",
    fps.toString(), // Use calculated FPS
    "-i",
    "-", // Input from stdin
    "-c:v",
    "libx264", // Encode video as H.264
    "-pix_fmt",
    "yuv420p",
    outputFile, // Output file
  ]);

  ffmpegProcess.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("exit", () => {
    console.log("FFmpeg process exited");
    ffmpegProcess = null; // Clean up after process ends
  });
}

function stopRecording() {
  if (!recording) return;
  recording = false;

  ffmpegProcess.stdin.end(); // Signal ffmpeg to finish
  console.log("Recording stopped and saved as output.mp4");
}

// Start the server on port 8080
server.listen(8080, () => {
  console.log(
    "Server is listening on http://localhost:8080 (both WebSocket and HTTP)"
  );
});
