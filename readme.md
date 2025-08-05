# Remote Video Streaming over Cloud Tunnel | Computer Networks Project

A computer networks project demonstrating real-time video streaming from an ESP32-CAM over the internet using a custom DNS-enabled cloud tunnel. The system streams the feed to a locally hosted server, which is exposed globally via a `cloudflared` tunnel. Remote users can view, record, and download the live stream through a browser-based interface.

## Project Overview

This project implements a lightweight, low-cost IP camera system using the AI-Thinker ESP32-CAM module. The module connects to a local network, streams video to a FastAPI-based server, and supports remote access through a secure tunnel mapped to a custom subdomain. The entire architecture showcases practical applications of socket programming, tunneling, and real-time communication over the internet.

The camera was deployed on a hand-gesture-controlled rover for demonstration, but the primary focus is the networked streaming architecture and real-time access pipeline.

## Key Features

- **Embedded Camera Streaming (ESP32-CAM)**  
  The ESP32-CAM connects to Wi-Fi and sends the camera stream to a remote endpoint over HTTP/WebSocket.

- **Globally Accessible via DNS Tunnel**  
  The server running on a laptop is exposed using `cloudflared`, mapped to a DNS-based custom subdomain, eliminating the need for direct cloud hosting.

- **Real-Time Streaming**  
  End-to-end low-latency streaming from the ESP32-CAM to any web browser.

- **Web-Based Recording and Downloading**  
  Users can trigger server-side recording and download previously captured footage via the web interface.

## System Architecture

```
\[ESP32-CAM (AI-Thinker)]
↳ Connects to Wi-Fi
↳ Sends stream to server URL (custom subdomain)
```
     ↓
```
\[Local Server (nodejs + WebSocket)]
↳ Runs on laptop/host machine
↳ Processes incoming video feed
↳ Handles recording and file management
```
     ↓
```
\[Cloudflared Tunnel]
↳ Exposes local server to internet
↳ Maps to: [https://stream.yourdomain.com](https://stream.yourdomain.com)
```
     ↓
```

\[Remote Web Interface]
↳ View live stream
↳ Start/stop recordings
↳ Download saved videos

```

## Technology Stack

- **Hardware**: ESP32-CAM (AI-Thinker)
- **Backend**: Nodejs, WebSocket
- **Frontend**: HTML, JavaScript (client-side stream and controls)
- **Tunneling**: Cloudflared (with custom subdomain)
- **Protocol**: HTTP and WebSocket communication between ESP32 and server, TCP, UDP(rover controls)

## ESP32-CAM Behavior

- On boot, connects to configured Wi-Fi
- Starts MJPEG streaming server on its local IP
- Sends video feed requests to the server exposed at a remote subdomain
- Operates independently without needing continuous USB connection

Available actions:

* View live stream
* Start/stop recording
* Download saved footage

## Applications

* Demonstration of real-time communication protocols and tunneling in IoT systems
* Low-cost IP camera solution for remote surveillance
* Academic projects in networking, embedded systems, and edge-cloud integration
* Practical implementation of client-server architectures in constrained environments

## Learning Outcomes

* Programmed an ESP32-CAM for autonomous network-based streaming
* Designed and tunneled a local server using `cloudflared` with DNS binding
* Implemented real-time, bidirectional communication using WebSockets
* Gained hands-on experience in computer networks, embedded communication, and remote media delivery

