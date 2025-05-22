const mqtt = require('mqtt');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const DEVICE_ID = process.env.DEVICE_ID || 'simulator-node';
const TOPIC = `application/1/device/${DEVICE_ID}/event/up`;

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  console.log('Simulator connected to', MQTT_URL);
  publishReading();
  setInterval(publishReading, 60000);
});

function publishReading() {
  const temp = (20 + Math.random() * 5).toFixed(2);
  const sal = (30 + Math.random() * 2).toFixed(2);
  const pres = (1013 + Math.random() * 5).toFixed(1);
  const lat = 37.7749 + (Math.random() - 0.5) * 0.01;
  const lon = -122.4194 + (Math.random() - 0.5) * 0.01;

  const csv = `${temp},${sal},${pres},${lat.toFixed(6)},${lon.toFixed(6)}`;
  const payload = Buffer.from(csv).toString('base64');
  const data = { dev_eui: DEVICE_ID, payload_raw: payload };

  client.publish(TOPIC, JSON.stringify(data));
  console.log('Sent', csv);
}
