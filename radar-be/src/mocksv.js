const express = require('express');
const app = express();
app.get('/data', (req, res) => {
  res.json({
    radarId: "mock",
    angle: Math.floor(Math.random() * 180),
    distance: Math.random() * 200,
    timestamp: new Date().toISOString()
  });
});
app.listen(3001, () => console.log('Mock node running on http://localhost:3001'));