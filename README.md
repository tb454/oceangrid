## Running the Project with Docker

This project provides Docker support for both the backend ingest service and the dashboard UI. The setup uses multi-stage Dockerfiles and a Docker Compose file to orchestrate the services.

### Project-Specific Docker Requirements

- **Node.js Version:** Both services require Node.js version `22.13.1` (as specified by `ARG NODE_VERSION=22.13.1` in the Dockerfiles).
- **Non-root User:** Both containers run as a non-root user for improved security.
- **Memory Limit:** `NODE_OPTIONS="--max-old-space-size=4096"` is set for both services.

### Environment Variables

- The backend ingest service supports environment variables via a `.env` file (`./backend/ingest/.env`). Uncomment the `env_file` line in the Compose file if you need to pass environment variables.
- No other required environment variables are specified in the Dockerfiles or Compose file.

### Build and Run Instructions

1. **Build and Start All Services:**
   ```sh
   docker compose up --build
   ```
   This will build and start both the backend ingest and dashboard UI services.

2. **Environment Variables:**
   - If you need to provide environment variables to the ingest service, create a `.env` file in `./backend/ingest/` and uncomment the `env_file` line in the Compose file.

### Service Details and Ports

- **js-ingest (Backend Ingest Service):**
  - Build context: `./backend/ingest`
  - Runs as a non-root user
  - No ports exposed by default (add ports if needed for your use case)

- **js-ui (Dashboard UI):**
  - Build context: `./dashboard/ui`
  - Runs as a non-root user
  - Exposes port **3000** (React app available at [http://localhost:3000](http://localhost:3000))

### Special Configuration

- Both services are attached to a custom Docker network called `backend`.
- The UI service uses the `serve` package to serve the built React app.
- The backend ingest service uses `npm ci --production` for deterministic dependency installation.

---

_If you update the Dockerfiles or Compose file, please ensure this section stays up to date._
