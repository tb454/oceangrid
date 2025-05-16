#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <Adafruit_BME280.h>
#include <TinyGPSPlus.h>

#define LORA_SCK   5
#define LORA_MISO 19
#define LORA_MOSI 27
#define LORA_SS   18
#define LORA_RST  14
#define LORA_DIO0 26

Adafruit_BME280 bme;
TinyGPSPlus    gps;

void setup() {
  Serial.begin(115200);

  // Init I²C sensor
  if (!bme.begin(0x76)) {
    Serial.println("BME280 init failed!");
    while (1) delay(10);
  }

  // Init SPI for LoRa
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(868E6)) {
    Serial.println("LoRa init failed!");
    while (1) delay(10);
  }
  LoRa.setTxPower(14);

  Serial.println("Node initialized");
}

void loop() {
  // Read sensors
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0F;

  // Try to get a GPS fix (2s timeout)
  unsigned long ts = millis();
  while (millis() - ts < 2000) {
    while (Serial1.available()) {
      gps.encode(Serial1.read());
    }
    if (gps.location.isValid()) break;
  }
  float lat = gps.location.isValid() ? gps.location.lat() : 0.0;
  float lon = gps.location.isValid() ? gps.location.lng() : 0.0;

  // Format packet
  char buf[128];
  snprintf(buf, sizeof(buf), "%.2f,%.2f,%.1f,%.6f,%.6f",
           t, h, p, lat, lon);

  // Send via LoRa
  LoRa.beginPacket();
  LoRa.print(buf);
  LoRa.endPacket();

  Serial.println(buf);
  delay(60000);
}
