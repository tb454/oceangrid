const mqtt    = require('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const MQTT_URL = 'mqtt://localhost:1883';
const INFLUX_URL   = 'http://localhost:8086';
const INFLUX_TOKEN = 'YOUR_INFLUX_TOKEN';
const ORG          = 'your-org';
const BUCKET       = 'oceangrid';

const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influx.getWriteApi(ORG, BUCKET);
const client   = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  client.subscribe('application/+/device/+/event/up', err => {
    if (err) console.error('Subscribe error:', err);
  });
});

client.on('message', (topic, msg) => {
  let data;
  try {
    data = JSON.parse(msg.toString());
  } catch (e) {
    return console.error('Invalid JSON', e);
  }

  const csv = Buffer.from(data.payload_raw, 'base64').toString();
  const [temp, hum, pres, lat, lon] = csv.split(',').map(Number);

  const pt = new Point('buoy')
    .floatField('temperature', temp)
    .floatField('humidity', hum)
    .floatField('pressure', pres)
    .floatField('latitude', lat)
    .floatField('longitude', lon)
    .tag('device', data.dev_eui);

  writeApi.writePoint(pt);
  writeApi
    .flush()
    .catch(err => console.error('Influx write error', err));
});
