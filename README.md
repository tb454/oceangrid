# OceanGrid

OceanGrid is a marine sensor and telemetry platform developed under Atlas IP Holdings LLC. It combines physical sensor nodes with custom firmware and backend services to create a decentralized ocean monitoring grid. Each node is capable of collecting its own environmental and positional data and relaying data for third-party sensors.

## Features
* Collect temperature, salinity, pressure, motion and GPS data
* Transmit via LoRa, Starlink or LTE uplinks
* Gateway mesh platform allowing external devices to piggyback on the network
* Edge compute nodes for processing and relaying modular payloads
* Scalable APIs for integration with NOAA, Azure, AWS IoT and research networks
* Piggyback relay and data federation logic so one node can speak for many

## Repository Layout
* `firmware/` – Arduino firmware for sensor nodes
* `backend/ingest/` – Node.js service that subscribes to MQTT topics and stores measurements in InfluxDB
* `backend/simulator/` – Sample Node.js simulator that generates synthetic data and publishes to MQTT

## Getting Started
1. Install Node.js and run `npm install` inside the desired backend folders.
2. Start the ingestion service with `node index.js` from `backend/ingest`.
3. Launch the simulator with `node index.js` from `backend/simulator` to publish mock buoy data.
4. Collected data is written to InfluxDB and can be visualized or exported to external services.

These examples provide a basic framework for an OceanGrid deployment. Actual sensor nodes can use the firmware in `firmware/` and communicate through a LoRa gateway or other uplink.
