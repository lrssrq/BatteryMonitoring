import envConfig from "@/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_DATA_KEY_PREFIX = "batteryData_";

interface BatteryDataPayload {
  deviceSN: string;
  batteryLevel: number;
}

export interface BatteryDataRecord {
  batteryLevel: number;
  recordedAt: string;
}

interface RecentDataResponse {
  success: boolean;
  count: number;
  data: Array<{
    batteryLevel: number;
    recordedAt: string;
  }>;
  canInfer: boolean;
}

// save to local storage
export async function saveBatteryData(
  payload: BatteryDataPayload,
): Promise<boolean> {
  try {
    const batteryData = await AsyncStorage.getItem(
      DEVICE_DATA_KEY_PREFIX + payload.deviceSN,
    );
    let parsedData: BatteryDataRecord[] = [];
    if (batteryData) {
      parsedData = JSON.parse(batteryData);
      // console.log("Existing battery data loaded:", parsedData);
      if (parsedData.length < 200) {
        parsedData.push({
          batteryLevel: payload.batteryLevel,
          recordedAt: new Date().toISOString(),
        });
      } else {
        parsedData.shift();
        parsedData.push({
          batteryLevel: payload.batteryLevel,
          recordedAt: new Date().toISOString(),
        });
      }
    }
    await AsyncStorage.setItem(
      DEVICE_DATA_KEY_PREFIX + payload.deviceSN,
      JSON.stringify(parsedData),
    );
    // console.log("Battery data saved:", parsedData);

    return true;
  } catch (error) {
    console.error("Failed to save battery data:", error);
    return false;
  }
}

// save to local storage
export async function loadBatteryData(
  deviceSN: string,
): Promise<BatteryDataRecord[]> {
  try {
    const batteryData = await AsyncStorage.getItem(
      DEVICE_DATA_KEY_PREFIX + deviceSN,
    );
    let parsedData: BatteryDataRecord[] = [];
    if (batteryData) {
      parsedData = JSON.parse(batteryData);
      return parsedData;
    }
    return [];
  } catch (error) {
    console.error("Failed to load battery data:", error);
    return [];
  }
}

/**
 * Issue 2: Get recent battery data (for inference or display)
 */
export async function getRecentBatteryData(
  deviceSN: string,
  limit: number = 20,
): Promise<RecentDataResponse> {
  try {
    const response = await axios.get(
      `${envConfig.API_BASE_URL}/battery-data/${deviceSN}/recent`,
      {
        params: { limit },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get recent battery data:", error);
    throw error;
  }
}

/**
 * Issue 2: Query historical data (supports pagination and date range)
 */
export async function getBatteryHistory(
  deviceSN: string,
  options?: {
    page?: number;
    pageSize?: number;
    startDate?: Date;
    endDate?: Date;
  },
) {
  try {
    const params: any = {
      page: options?.page || 1,
      pageSize: options?.pageSize || 50,
    };

    if (options?.startDate) {
      params.startDate = options.startDate.toISOString();
    }
    if (options?.endDate) {
      params.endDate = options.endDate.toISOString();
    }

    const response = await axios.get(
      `${envConfig.API_BASE_URL}/battery-data/${deviceSN}/history`,
      {
        params,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get battery history:", error);
    throw error;
  }
}
