# Radar System Frontend

## Setup
1. Cài đặt dependencies: `npm install`
2. Tạo file `.env` với nội dung:
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080
3. Chạy FE: `npm start`

## Chức năng
- Dashboard hiển thị trạng thái radar, cảnh báo xâm nhập, heatmap, thống kê.
- ConfigPanel cho phép cấu hình IP node, ngưỡng cảnh báo, email nhận cảnh báo.
- Realtime update qua WebSocket.

## Lưu ý
- FE cần backend (`radar-be`) chạy trước.
- Đảm bảo cấu hình IP node đúng với thực tế.
