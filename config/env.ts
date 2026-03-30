import Constants from "expo-constants";

type EnvConfig = {
  API_BASE_URL: string;
  MQTT_HOST: string;
  MQTT_PORT: number;
  MQTT_SSL: boolean;
  MQTT_USERNAME?: string;
  MQTT_PASSWORD?: string;
};

const parseIntOrDefault = (
  value: string | undefined,
  fallback: number,
): number => {
  if (typeof value !== "string") return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const envConfig: EnvConfig = {
  API_BASE_URL:
    Constants.expoConfig?.extra?.api_base_url ?? "http://localhost:3000",
  MQTT_HOST: Constants.expoConfig?.extra?.mqtt_host ?? "",
  MQTT_SSL: Constants.expoConfig?.extra?.mqtt_ssl === "true",
  MQTT_PORT: parseIntOrDefault(Constants.expoConfig?.extra?.mqtt_port, 0),
  MQTT_USERNAME: Constants.expoConfig?.extra?.mqtt_username || undefined,
  MQTT_PASSWORD: Constants.expoConfig?.extra?.mqtt_password || undefined,
};

console.log(envConfig);
export default envConfig;
