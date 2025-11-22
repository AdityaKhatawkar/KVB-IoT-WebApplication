const axios = require("axios");

setInterval(async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/devices/iotdata", {
      device_name: "KVB2",
      temperature: 25,
      humidity: 30,
      set_temperature: 26,
      set_humidity: 70,
      ac_fan_status: 1,
      dc_fan_status: 0,
      circular_fan_speed: 180,
      operation_mode: "WiFi",
      device_status: 1,
    });

    console.log("Data sent:", res.status);
  } catch (err) {
    console.error("Error:", err.message);
  }
}, 10000); // send every 10 sec
