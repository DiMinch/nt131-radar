#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <Servo.h>
#include <ArduinoJson.h>

#define TRIG_PIN D6
#define ECHO_PIN D5
#define SERVO_PIN D4

ESP8266WebServer server(80);
const char* ssid = "FamilyMart";
const char* password = "ministop";

String node2_host = "192.168.204.86";

Servo servo;
int angle = 0;
float distance = 0;
bool increasing = true;
unsigned long lastMoveTime = 0;
unsigned long lastFetchNode2 = 0;

void handleRoot() {
  String html = R"rawliteral(
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>ESP8266 Dual Radar</title>
    <style>
      body {
        background: #0f2027;
        color: #00ffcc;
        font-family: 'Courier New', monospace;
        text-align: center;
      }
      .radar-container {
        display: flex;
        justify-content: center;
        gap: 20px;
      }
      canvas {
        background: #001f1f;
        border: 2px solid #00ffcc;
      }
    </style>
  </head>
  <body>
    <h1>🌐 ESP8266 Dual Radar</h1>
    <div class="radar-container">
      <div>
        <h2>Node 1</h2>
        <canvas id="radar1" width="300" height="300"></canvas>
        <p>Góc: <span id="angle1">0</span>°, Khoảng cách: <span id="dist1">0</span> cm</p>
      </div>
      <div>
        <h2>Node 2</h2>
        <canvas id="radar2" width="300" height="300"></canvas>
        <p>Góc: <span id="angle2">0</span>°, Khoảng cách: <span id="dist2">0</span> cm</p>
      </div>
    </div>

    <script>
      const radars = [
        { canvas: 'radar1', angleId: 'angle1', distId: 'dist1', endpoint: '/data', ctx: null, dot: { angle: 0, dist: 0 } },
        { canvas: 'radar2', angleId: 'angle2', distId: 'dist2', endpoint: '/slave', ctx: null, dot: { angle: 0, dist: 0 } }
      ];

      function drawRadar(ctx, sweepAngle, dotAngle, distance) {
        const r = 150;
        ctx.clearRect(0, 0, 300, 300);
        ctx.strokeStyle = '#00ffcc';
        ctx.beginPath(); ctx.arc(r, r, r - 1, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(r, r, r / 2, 0, 2 * Math.PI); ctx.stroke();
        const sweepRad = sweepAngle * Math.PI / 180;
        const x = r + (r - 10) * Math.cos(sweepRad);
        const y = r - (r - 10) * Math.sin(sweepRad);
        ctx.beginPath(); ctx.moveTo(r, r); ctx.lineTo(x, y); ctx.stroke();
        if (distance > 0 && distance < 300) {
          const dotRad = dotAngle * Math.PI / 180;
          const px = r + distance * Math.cos(dotRad);
          const py = r - distance * Math.sin(dotRad);
          ctx.fillStyle = 'red';
          ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * Math.PI); ctx.fill();
        }
      }

      function fetchData(radar) {
        radar.ctx.canvas.style.opacity = '0.5';
        fetch(radar.endpoint)
          .then(res => res.ok ? res.json() : Promise.reject(res.status))
          .then(data => {
            document.getElementById(radar.angleId).textContent = data.angle;
            document.getElementById(radar.distId).textContent = data.distance.toFixed(2);
            radar.dot.angle = data.angle;
            radar.dot.dist = data.distance;
          })
          .catch(err => {
            console.error('Lỗi:', err);
            radar.dot.dist = -1;
          })
          .finally(() => radar.ctx.canvas.style.opacity = '1');
      }

      function animate() {
        radars.forEach(radar => {
          if (!radar.ctx) return;
          radar.sweep = (radar.sweep || 0) + 3;
          if (radar.sweep > 360) radar.sweep = 0;
          drawRadar(radar.ctx, radar.sweep, radar.dot.angle, radar.dot.dist);
        });
        requestAnimationFrame(animate);
      }

      window.onload = () => {
        radars[0].ctx = document.getElementById('radar1').getContext('2d');
        radars[1].ctx = document.getElementById('radar2').getContext('2d');
        setInterval(() => {
          fetchData(radars[0]);
          fetchData(radars[1]);
        }, 150);
        animate();
      }
    </script>
  </body>
  </html>
  )rawliteral";
  server.send(200, "text/html", html);
}

float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 20000);
  return duration > 0 ? (duration * 0.034 / 2) : -1;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  servo.attach(SERVO_PIN);

  Serial.println("\n🔌 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (millis() - startTime > 10000) {
      Serial.println("\n⚠️ Timeout WiFi!");
      break;
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
  }

  server.on("/", handleRoot);

  server.on("/data", []() {
    DynamicJsonDocument doc(128);
    doc["angle"] = angle;
    doc["distance"] = distance;
    String res;
    serializeJson(doc, res);
    server.send(200, "application/json", res);
  });

  server.on("/slave", []() {
    HTTPClient http;
    WiFiClient client;
    String url = "http://" + node2_host + "/data";
    http.begin(client, url);
    int httpCode = http.GET();
    if (httpCode == 200) {
      String payload = http.getString();
      server.send(200, "application/json", payload);
    } else {
      server.send(500, "text/plain", "Failed to contact node2");
    }
    http.end();
  });

  server.on("/setNode2IP", HTTP_POST, []() {
    if (server.hasArg("plain")) {
      String body = server.arg("plain");
      DynamicJsonDocument doc(128);
      DeserializationError error = deserializeJson(doc, body);
      if (!error && doc.containsKey("ip")) {
        node2_host = doc["ip"].as<String>();
        Serial.print("✅ Updated Node2 IP: ");
        Serial.println(node2_host);
        server.send(200, "application/json", "{\"status\":\"ok\"}");
      } else {
        server.send(400, "application/json", "{\"error\":\"invalid json\"}");
      }
    } else {
      server.send(400, "application/json", "{\"error\":\"no body\"}");
    }
  });

  server.begin();
}

void loop() {
  server.handleClient();

  unsigned long now = millis();
  if (now - lastMoveTime >= 200) {
    lastMoveTime = now;
    angle = increasing ? angle + 10 : angle - 10;
    if (angle >= 180) increasing = false;
    if (angle <= 0) increasing = true;

    servo.write(angle);
    distance = getDistance();

    Serial.printf("Angle: %d | Distance: %.2f cm\n", angle, distance);
    Serial.print("IP Node Master: ");
    Serial.println(WiFi.localIP());
  }
}
