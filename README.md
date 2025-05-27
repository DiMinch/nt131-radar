
# 🛰️ NT131 - Hệ thống Radar Kép Phát Hiện Xâm Nhập

Đồ án môn học **NT131** - Hệ thống radar kép sử dụng **ESP8266 + HC-SR04 + Servo**, hiển thị giao diện radar trên web UI, phát hiện xâm nhập theo thời gian thực, lưu dữ liệu lên Firebase và gửi thông báo qua email khi có vật thể xuất hiện.

---

## Tính năng chính
- Quét khoảng cách vật thể theo góc quay bằng radar kép (2 ESP8266).
- Giao diện radar trực quan trên Web UI (Frontend).
- Backend Express.js xử lý và lưu dữ liệu từ ESP lên Firebase.
- Phát hiện xâm nhập (vật thể nằm trong khoảng cách nguy hiểm).
- Gửi email cảnh báo và hiển thị cảnh báo đỏ trên màn hình.
- Biểu đồ phân tích tần suất xâm nhập, khoảng cách vật cản,...
- Cho phép người dùng nhập IP 2 node radar (không hardcode).

---

## Cấu trúc dự án

```
nt131-radar/
│
├── radar-fe/         # Frontend - Giao diện web hiển thị radar, biểu đồ
├── radar-be/         # Backend - Express.js xử lý và lưu dữ liệu
├── ArduinoIDE/       # Code Arduino cho 2 node radar (master + slave)
└── README.md
```

---

## Công nghệ sử dụng

- Vi điều khiển: ESP8266 + HC-SR04 + Servo
- Frontend: HTML, CSS, JavaScript, Chart.js
- Backend: Express.js, Node.js, Nodemailer
- CSDL: Firebase Firestore

---

## Cài đặt & Chạy thử

### Cài đặt backend

```
cd radar-be
npm install
npm start
```

### Chạy frontend

Mở `radar-fe/index.html` trên trình duyệt hoặc dùng live server extension.

> Đảm bảo `backend` đang chạy trên `http://localhost:8080`

### Lập trình cho ESP8266

* Mở Arduino IDE và nạp code trong thư mục `ArduinoIDE/`
* Có 2 node: `master` (giao diện chính) và `slave` (cung cấp dữ liệu phụ)

---

## Firebase Firestore

Dự án sử dụng 2 collection:

* `radar_scans`: lưu toàn bộ dữ liệu quét
* `intrusion_logs`: lưu các sự kiện xâm nhập

---

## Tác giả

* Phan Duy Minh
* Lưu Minh Khôi

---

