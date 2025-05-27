const axios = require('axios');

const testData = {
  radarId: "master",
  angle: 55,
  distance: 25,
  timestamp: new Date().toISOString()
};

axios.post('http://localhost:8080/api/radar/scan', testData)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));