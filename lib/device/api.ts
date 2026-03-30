import envConfig from "@/config/env";
import { DEVICE_CACHE_KEY } from "@/constants/AsyncStorageKeys";
import * as API_PATH from "@/constants/DeviceAPIPath";
import { authClient } from "@/lib/auth/auth-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
async function bindDevice(
  deviceSN: string,
  deviceName: string = "unnamed",
): Promise<boolean> {
  const { data, error } = await authClient.$fetch(API_PATH.bindDevicePath, {
    baseURL: envConfig.API_BASE_URL,
    method: "POST",
    body: {
      deviceSN: deviceSN,
      deviceName: deviceName,
    },
  });

  if (error) {
    console.error("Failed to bind device:", error);
    return false;
  } else {
    console.log("Device bound successfully:", data);
    return true;
  }
}

export type Device = {
  deviceSN: string;
  deviceName: string;
  boundAt: Date;
};

type DeviceApiItem = {
  serialNumber: string | number;
  name: string | null;
  createdAt: string | number | Date;
};

const isDeviceApiItem = (value: unknown): value is DeviceApiItem => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    (typeof candidate.serialNumber === "string" ||
      typeof candidate.serialNumber === "number") &&
    (typeof candidate.name === "string" || candidate.name === null) &&
    (typeof candidate.createdAt === "string" ||
      typeof candidate.createdAt === "number" ||
      candidate.createdAt instanceof Date)
  );
};

async function getDevices() {
  const { data, error } = await authClient.$fetch(API_PATH.getDevicesPath, {
    baseURL: envConfig.API_BASE_URL,
    method: "GET",
  });

  if (error) {
    console.log("Failed to fetch devices:", error);
  } else {
    const mappedDevices = Array.isArray(data)
      ? data.filter(isDeviceApiItem).map<Device>((device) => ({
          deviceSN: String(device.serialNumber),
          deviceName: device.name ?? "",
          boundAt: new Date(device.createdAt),
        }))
      : [];
    console.log("Fetched devices:", data);
    // console.log("Mapped devices:", mappedDevices);
    return mappedDevices;
  }
  return [];
}

async function unbindDevice(deviceSN: string): Promise<boolean> {
  const { data, error } = await authClient.$fetch(API_PATH.unbindDevicePath, {
    baseURL: envConfig.API_BASE_URL,
    method: "POST",
    body: {
      deviceSN: deviceSN,
    },
  });

  if (error) {
    console.error("Failed to unbind device:", error);
    return false;
  } else {
    console.log("Device unbound successfully:", data);
    return true;
  }
}

async function renameDevice(
  deviceSN: string,
  newName: string,
): Promise<boolean> {
  const { data, error } = await authClient.$fetch(API_PATH.renameDevicePath, {
    baseURL: envConfig.API_BASE_URL,
    method: "POST",
    body: {
      deviceSN: deviceSN,
      newName: newName,
    },
  });

  if (error) {
    console.error("Failed to rename device:", error);
    return false;
  } else {
    console.log("Device renamed successfully:", data);
    return true;
  }
}

async function saveDevicesToCache(devices: Device[]) {
  try {
    await AsyncStorage.setItem(DEVICE_CACHE_KEY, JSON.stringify(devices));
    console.log("Devices cached:", devices);
  } catch (error) {
    console.error("Failed to cache devices:", error);
  }
}

async function loadCachedDevices(): Promise<Device[]> {
  try {
    const cached = await AsyncStorage.getItem(DEVICE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const devices = (Array.isArray(parsed) ? parsed : []).map(
        (device: any) => ({
          ...device,
          boundAt: new Date(device.boundAt),
        }),
      ) as Device[];
      // console.log("Loaded cached devices:", devices);
      return devices;
    }
  } catch (error) {
    console.error("Failed to load cached devices:", error);
  }
  return [];
}

async function clearCachedDevices() {
  try {
    await AsyncStorage.removeItem(DEVICE_CACHE_KEY);
    console.log("Cleared cached devices");
  } catch (error) {
    console.error("Failed to clear cached devices:", error);
  }
}

async function cacheDevices(devices: Device[]) {
  try {
    await AsyncStorage.setItem(DEVICE_CACHE_KEY, JSON.stringify(devices));
    console.log("Devices cached:", devices);
  } catch (error) {
    console.error("Failed to cache devices:", error);
  }
}

async function clearAndCacheDevices(devices: Device[]) {
  await clearCachedDevices();
  await cacheDevices(devices);
}

export {
  bindDevice,
  cacheDevices,
  clearAndCacheDevices,
  clearCachedDevices,
  getDevices,
  loadCachedDevices,
  renameDevice,
  saveDevicesToCache,
  unbindDevice
};

