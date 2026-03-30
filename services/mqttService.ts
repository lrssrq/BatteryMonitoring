import type { MqttError, MqttStatus } from "@/hooks/useMqttConnection";
import mqtt from "mqtt";

type CreateMqttClientOptions = {
  host: string;
  port: number;
  path?: string;
  ssl?: boolean;
  protocolVersion?: 4 | 5;
  username?: string;
  password?: string;
  setMqttStatus: (status: MqttStatus) => void;
  setMqttError: (error: MqttError | null) => void;
  uniqueId: string;
  onMessage: (topic: string, message: Buffer<ArrayBufferLike>) => void;
};

function createMqttClient({
  host,
  port,
  path = "/mqtt",
  ssl = false,
  protocolVersion = 5,
  username = "",
  password = "",
  setMqttStatus,
  setMqttError,
  uniqueId,
  onMessage,
}: CreateMqttClientOptions): mqtt.MqttClient {
  let protocol: "ws" | "wss" = "ws";

  if (ssl) {
    port = port;
    protocol = "wss";
  }

  const client = mqtt
    .connect({
      protocol,
      host,
      port,
      path,
      protocolVersion,
      clientId: uniqueId,
      username: username,
      password: password,
      reconnectPeriod: 5000,
      queueQoSZero: true,
      resubscribe: true,
      clean: true,
      keepalive: 60, // Increase to 60 seconds to avoid timeout
      connectTimeout: 10000, // Connection timeout
      properties:
        protocolVersion === 5
          ? {
              sessionExpiryInterval: 600,
            }
          : undefined,
    })
    .on("connect", () => {
      setMqttError(null);
      setMqttStatus("Connected");
    })
    .on("error", (error) => {
      setMqttStatus("Error");
      setMqttError({
        type: "mqtt_error",
        msg: error instanceof Error ? error.message : String(error),
      });
      console.error("MqttGeneral", error);
    })
    .on("disconnect", () => {
      setMqttStatus("Disconnected");
    })
    .on("offline", () => {
      setMqttStatus("Offline");
    })
    .on("reconnect", () => {
      setMqttStatus("Reconnecting");
    })
    .on("close", () => {
      setMqttStatus("Disconnected");
    })
    .on("message", (topic, message) => {
      onMessage(topic, message);
    });

  return client;
}

export { createMqttClient };

