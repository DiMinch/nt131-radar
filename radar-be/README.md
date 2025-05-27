# Radar System Backend

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `.env`
3. Set up Firebase credentials in `serviceAccountKey.json`
4. Start server: `npm start`

## API Endpoints
- POST /api/radar/scan - Submit radar reading
- GET /api/radar/history - Get historical data
- GET /api/radar/intrusions - Get intrusion logs
- GET /api/radar/live - Get real-time data
- GET /api/radar/stats - Get system statistics

## WebSocket
- Connect to `ws://localhost:8080` for real-time updates

## Firebase Collections
- radar_scans: All radar readings
- intrusion_logs: Security breach events