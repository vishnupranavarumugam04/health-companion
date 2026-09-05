# Health Companion

Health Companion is a Next.js dashboard for monitoring health telemetry through MQTT. The repository is organized as a small local monorepo:

```text
.
├── frontend/       # Next.js application
├── backend/        # Mosquitto MQTT broker configuration
├── docker-compose.yml
├── run_app.bat
└── start.bat
```

## Requirements

- Node.js 18 or later
- npm
- Docker Desktop, when running the MQTT broker with Docker Compose

## Local Setup

Install the frontend dependencies from the `frontend` directory:

```powershell
cd frontend
npm install
```

The example environment file configures the browser MQTT client for the local Mosquitto WebSocket listener:

```powershell
Copy-Item .env.example .env.local
```

The default values are:

```text
NEXT_PUBLIC_MQTT_BROKER_URL=ws://localhost
NEXT_PUBLIC_MQTT_BROKER_PORT=9001
```

## Run Locally

Start the MQTT broker and its WebSocket listener from the repository root:

```powershell
docker compose up -d mosquitto
```

Start the Next.js development server in a second terminal:

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in a browser.

The root launchers provide the same workflow on Windows:

```text
start.bat       Starts the application launcher
run_app.bat     Opens the local URL and starts Next.js
```

To run both services through Docker Compose:

```powershell
docker compose up --build
```

Stop the services with:

```powershell
docker compose down
```

## Frontend Commands

Run these commands from `frontend`:

```powershell
npm run dev      # Start the development server on port 5000
npm run build    # Create a production build
npm start        # Start the production server
npm run lint     # Run ESLint
```

## MQTT Configuration

Mosquitto is configured in [backend/mosquitto.conf](backend/mosquitto.conf). Local MQTT uses port `1883`, and browser clients connect through the WebSocket listener on port `9001`.

The frontend telemetry API is located at [src/app/api/telemetry/route.ts](frontend/src/app/api/telemetry/route.ts).

## Generated Files

The Next.js build output and dependencies belong inside `frontend`. If the repository was previously run from the root, remove the old root caches before starting again:

```powershell
Remove-Item -Recurse -Force .next, node_modules
```

Then reinstall dependencies from `frontend` with `npm install`.
