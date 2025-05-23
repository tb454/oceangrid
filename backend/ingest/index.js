// backend/ingest/index.js
require('dotenv').config();
const mqtt    = require('mqtt');
const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client');

// ─── Config (via .env) ────────────────────────────────────────────────────────
const {
  MQTT_URL        = 'mqtt://localhost:1883',
  MQTT_TOPIC      = 'application/+/device/+/event/up',
  INFLUX_URL      = 'http://localhost:8086',
  INFLUX_TOKEN,
  INFLUX_ORG,
  INFLUX_BUCKET
} = process.env;

if (!INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
  console.error('❌ Missing InfluxDB env vars. Check .env');
  process.exit(1);
}

// ─── InfluxDB Client ─────────────────────────────────────────────────────────
const influx    = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi  = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ms');
writeApi.useDefaultTags({ source: 'OceanGrid' });

// ─── MQTT Client ─────────────────────────────────────────────────────────────
const client = mqtt.connect(MQTT_URL, {
  reconnectPeriod: 2000,
  connectTimeout: 30_000
});

client.on('connect', () => {
  console.log(`✅ MQTT connected to ${MQTT_URL}`);
  client.subscribe(MQTT_TOPIC, { qos: 1 }, err => {
    if (err) console.error('❌ Subscribe error:', err);
    else        console.log(`📨 Subscribed to ${MQTT_TOPIC}`);
  });
});
client.on('reconnect', () => console.log('🔄 MQTT reconnecting...'));
client.on('error', err => console.error('❌ MQTT error:', err));
client.on('close', () => console.log('❌ MQTT connection closed'));

// ─── Message Handler ─────────────────────────────────────────────────────────
client.on('message', async (topic, msg) => {
  let data;
  try { data = JSON.parse(msg.toString()); }
  catch (e) { return console.error('⚠️ Invalid JSON:', e.message); }

  if (!data.payload_raw) {
    return console.warn('⚠️ Missing payload_raw in uplink');
  }

  const csv = Buffer.from(data.payload_raw, 'base64').toString();
  const parts = csv.split(',').map(Number);
  if (parts.length < 5 || parts.some(isNaN)) {
    return console.error('⚠️ Malformed CSV:', csv);
  }
  const [temperature, humidity, pressure, latitude, longitude] = parts;
  const device = data.dev_eui || 'unknown';

  const pt = new Point('buoy')
    .tag('device', device)
    .floatField('temperature', temperature)
    .floatField('humidity', humidity)
    .floatField('pressure', pressure)
    .floatField('latitude', latitude)
    .floatField('longitude', longitude)
    .timestamp(new Date());

  try {
    writeApi.writePoint(pt);
    await writeApi.flush();
    console.log(`✅ [${device}] ${csv}`);
  } catch (err) {
    if (err instanceof HttpError) {
      console.error(`❌ Influx HTTP ${err.statusCode}: ${err.statusMessage}`);
    } else {
      console.error('❌ Influx write error:', err.message);
    }
  }
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
['SIGINT','SIGTERM'].forEach(sig => {
  process.on(sig, async () => {
    console.log(`🛑 Caught ${sig}, flushing Influx and exiting…`);
    await writeApi.close().catch(e => console.error(e));
    client.end();
    process.exit(0);
  });
});
