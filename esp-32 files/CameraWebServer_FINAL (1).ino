#include "esp_camera.h"
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#define CAMERA_MODEL_AI_THINKER
#include <stdio.h>
#include "camera_pins.h"

const char* ssid = "Sameer";
const char* password = "sammyboi";
const char* websockets_server = "ws://myapp.shervin.live/"; //server adress and port


using namespace websockets;
WebsocketsClient client;

unsigned long lastReconnectAttempt = 0;

void onEventsCallback(WebsocketsEvent event, String data) {
    if (event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connection Closed - Attempting Reconnect");
        reconnectWebSocket();
    }
}

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Received: ");
    Serial.println(message.data());
}

void reconnectWebSocket() {
    while (true){
        if (millis() - lastReconnectAttempt > 5000) {
            lastReconnectAttempt = millis();
            Serial.println("Reconnecting to WebSocket...");
            if (client.connect(websockets_server)) {
                Serial.println("Reconnected to WebSocket!");
                break;
            }
        }
    }
}

void setup() {
    Serial.begin(115200);

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    
    config.xclk_freq_hz = 10000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) { 
        Serial.println("Camera init failed");
        return; 
    }
    
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) { 
        delay(500); 
        Serial.print("."); 
    }
    Serial.println("WiFi connected!");

    client.onMessage(onMessageCallback);
    client.onEvent(onEventsCallback);

    Serial.println("Trying to connect to WebSocket...");
    reconnectWebSocket();
}

void loop() {
    client.poll();

    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Failed to capture image");
        return;
    }

    if (fb->format == PIXFORMAT_JPEG) { 
        client.sendBinary((const char*) fb->buf, fb->len);
    }
    
    esp_camera_fb_return(fb);

}
