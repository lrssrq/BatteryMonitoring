# BatteryMonitoring

[English](README.md) | [中文](README.zh-CN.md)

BatteryMonitoring is a mobile application for battery monitoring based on Expo + React Native, targeting scenarios such as battery data collection, device management, alerting, and analysis.

The project uses Expo Router for page routing, integrates MQTT for real-time data reception, and reserves the capability to collaborate with backend APIs for data persistence and historical queries.

## Key Features

- Real-time MQTT data connection and status management
- Battery data display and analysis pages
- Alert page and alert method configuration (local/remote)
- Device management page
- Data history page
- Camera page (QR scanning and camera capabilities)
- Login and registration pages
- Multi-language support (Chinese, English, French, Japanese, German, Spanish)

## Tech Stack

- Expo 55
- React 19
- React Native 0.83
- TypeScript
- Expo Router
- MQTT (`mqtt` + custom connection wrapper)
- Mobile UI components such as React Native Paper, Reanimated, Gesture Handler, etc.

## Routes and Pages

The `app/` directory uses Expo Router file-based routing:

- `app/(drawer)/(tabs)/index.tsx`: Home
- `app/(drawer)/(tabs)/analysis.tsx`: Analysis
- `app/(drawer)/(tabs)/alert.tsx`: Alerts
- `app/(drawer)/(tabs)/me.tsx`: Profile
- `app/(otherscreens)/deviceManagement.tsx`: Device Management
- `app/(otherscreens)/dataHistory.tsx`: Data History
- `app/(otherscreens)/camera.tsx`: Camera
- `app/(otherscreens)/login.tsx`: Login
- `app/(otherscreens)/register.tsx`: Register

## Project Structure (Core)

```text
BatteryMonitoring/
  app/                  # Routes and pages
  assets/               # Images, fonts, and models
  components/           # Shared components
  constants/            # Constants (languages, API paths, etc.)
  contexts/             # Global contexts (auth, MQTT, device, settings, etc.)
  hooks/                # Custom hooks (e.g., MQTT connection)
  lib/                  # Business logic (auth/device/battery/background, etc.)
  services/             # Service layer (e.g., mqttService)
  docs/                 # Architecture, testing guides, etc.
  patches/              # patch-package patches
```

## Environment & Setup

### 1) Install Dependencies

```bash
npm install
```

After installation, the project will automatically run:

```bash
npm run postinstall
```

to apply the `patch-package` patches.

### 2) Key Configurations

- Environment variables: `env.ts`
- Device-related API Paths: `constants/DeviceAPIPath.ts`

## Run Locally

```bash
npm run start
```

Or run by platform:

```bash
npm run android
npm run ios
npm run web
```

## Backend Collaboration Notes

The frontend communicates with the backend via REST API, and receives real-time data via MQTT. Existing documents provide several improvement directions, including:

- Data persistence to the backend
- Pre-inference check for 20 data points
- MQTT topic isolation when switching devices
- Offline caching and background task synchronization

## Troubleshooting

### 1) Cannot connect to backend after startup

- Check `API_BASE_URL` in `constants/env.ts`
- Confirm that the mobile device and backend are on the same network
- Confirm that the backend service port is accessible

### 2) No MQTT data

- Check the broker address and port
- Check the username and password
- Check if the subscription topic is consistent with the sender

### 3) Dependency issues during build/run

- Delete `node_modules` and lock files, then reinstall
- Confirm Node.js version is compatible with Expo 55

## License

This project is licensed under the [MIT License](LICENSE).
