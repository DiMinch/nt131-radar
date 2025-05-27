#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <Servo.h>
#include <ArduinoJson.h>

#define TRIG_PIN 4
#define ECHO_PIN 14
#define SERVO_PIN 5

ESP8266WebServer server(80);
const char* ssid = "FamilyMart";
const char* password = "ministop";

Servo servo;
int angle = 0;
float distance = 0;
bool increasing = true;
unsigned long lastMoveTime = 0;

void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Node Radar</title>
  <style>
    body {
      background: black;
      color: white;
      font-family: 'Courier New', monospace;
      text-align: center;
    }
    canvas {
      border: 1px solid #00ffcc;
      background: radial-gradient(circle, #001f1f, black);
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h2>Node Radar</h2>
  <p>Angle: <span id="angle">0</span>°</p>
  <p>Distance: <span id="dist">0.00</span> cm</p>
  <canvas id="radarCanvas" width="300" height="300"></canvas>

  <script>
    let angle = 0;
    let distance = 0;
    let sweep = 0;
    const canvas = document.getElementById('radarCanvas');
    const ctx = canvas.getContext('2d');
    const r = 150;

    function drawRadar() {
      ctx.clearRect(0, 0, 300, 300);

      // Draw circles
      ctx.strokeStyle = '#00ffcc';
      ctx.beginPath(); ctx.arc(r, r, r - 1, 0, 2 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(r, r, r / 2, 0, 2 * Math.PI); ctx.stroke();

      // Draw sweep line
      const sweepRad = sweep * Math.PI / 180;
      const x = r + (r - 10) * Math.cos(sweepRad);
      const y = r - (r - 10) * Math.sin(sweepRad);
      ctx.beginPath(); ctx.moveTo(r, r); ctx.lineTo(x, y); ctx.stroke();

      // Draw detected dot
      if (distance > 0 && distance < 300) {
        const dotRad = angle * Math.PI / 180;
        const px = r + distance * Math.cos(dotRad);
        const py = r - distance * Math.sin(dotRad);
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * Math.PI); ctx.fill();
      }
    }

    function fetchData() {
      fetch('/data')
        .then(res => res.json())
        .then(data => {
          angle = data.angle;
          distance = data.distance;
          document.getElementById('angle').textContent = angle;
          document.getElementById('dist').textContent = distance.toFixed(2);
        });
    }

    function animate() {
      sweep = (sweep + 3) % 360;
      drawRadar();
      requestAnimationFrame(animate);
    }

    setInterval(fetchData, 500);
    animate();
  </script>
</body>
</html>
  )rawliteral";
  server.send(200, "text/html", html);
}


float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 20000); // timeout tránh treo
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
    String json = "{";
    json += "\"radarId\":\"slave\",";
    json += "\"angle\":" + String(angle) + ",";
    json += "\"distance\":" + String(distance) + ",";
    json += "\"timestamp\":\"" + String(millis()) + "\"";
    json += "}";
    server.send(200, "application/json", json);
});
  server.begin();
}

void loop() {
  server.handleClient();

  unsigned long now = millis();
  if (now - lastMoveTime > 200) {  // Di chuyển mỗi 200ms
    lastMoveTime = now;

    if (increasing) {
      angle += 10;
      if (angle >= 180) increasing = false;
    } else {
      angle -= 10;
      if (angle <= 0) increasing = true;
    }

    servo.write(angle);
    delay(100); // Cho servo ổn định tí
    distance = getDistance();

    Serial.printf("Angle: %d | Distance: %.2f\n", angle, distance);
    Serial.print("IP Node Slave: ");
    Serial.println(WiFi.localIP());
  }
}