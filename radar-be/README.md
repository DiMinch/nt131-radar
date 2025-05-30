# Radar System Backend

## Setup
1. Cài đặt dependencies: `npm install`
2. Cấu hình Firebase
- Tạo file `serviceAccountKey.json` ở thư mục gốc backend (radar-be).
- Lấy file này từ Firebase Console > Project Settings > Service Accounts.
3. Cấu hình hệ thống
- Tạo file `config.json` ở thư mục gốc với nội dung mẫu:
```json
{
  "DANGER_THRESHOLD": 15,
  "MASTER_NODE_URL": "http://192.168.204.10",
  "SLAVE_NODE_URL": "http://192.168.204.203",
  "ALERT_EMAIL": "your_email@gmail.com"
}
```
- `DANGER_THRESHOLD`: Ngưỡng cảnh báo xâm nhập (cm)
- `MASTER_NODE_URL`: Địa chỉ node master (ví dụ: http://192.168.204.10)
- `SLAVE_NODE_URL`: Địa chỉ node slave (ví dụ: http://192.168.204.203)
- `ALERT_EMAIL`: Email nhận cảnh báo
4. Tạo file `.env` với nội dung:
```
PORT=8080
ALERT_EMAIL=your_email@gmail.com
ALERT_PASS=your_app_password
DANGER_THRESHOLD=50
```
5. Chạy BE: `npm start`
Server sẽ chạy tại `http://localhost:8080`


## Các API chính

- **POST /api/radar/scan**  
  Gửi dữ liệu quét radar (dùng cho test hoặc node gửi trực tiếp).

- **GET /api/radar/history?limit=100&radarId=master**  
  Lấy lịch sử quét radar (có thể lọc theo node).

- **GET /api/radar/intrusions?radarId=slave**  
  Lấy log các lần phát hiện xâm nhập.

- **GET /api/radar/live**  
  Lấy dữ liệu realtime từ node master (bao gồm cả master và slave).

- **GET /api/radar/stats**  
  Lấy thống kê tổng số lần quét và số lần xâm nhập.

- **GET /api/radar/config**  
  Lấy cấu hình hệ thống.

- **POST /api/radar/config**  
  Lưu cấu hình hệ thống (IP node, ngưỡng cảnh báo, email).

---

## WebSocket

- Kết nối tới `ws://localhost:8080` để nhận dữ liệu realtime (master & slave).

---

## Cấu trúc dữ liệu Firebase

- **radar_scans**: Lưu tất cả dữ liệu quét radar.
- **intrusion_logs**: Lưu các lần phát hiện xâm nhập.

---

## Một số lưu ý

- Khi đổi IP node master/slave trên web, backend sẽ tự động cập nhật IP node slave cho node master qua API `/setNode2IP`.
- Nếu node master/slave đổi IP (do reset hoặc router cấp IP mới), cần cập nhật lại trong config.
- Đảm bảo file `serviceAccountKey.json` đúng và có quyền truy cập Firestore.
- Nếu bị lỗi quota Firebase, hãy giảm tần suất đọc/ghi hoặc nâng cấp gói Firebase.
