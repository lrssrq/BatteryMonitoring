/**
 * Issue 4 Improvement: Background Tasks - Using Expo Background Tasks
 *
 * This example shows how to continue receiving and saving battery data in the background
 *
 * Install dependencies:
 * npx expo install expo-background-fetch expo-task-manager
 */

import { getRecentBatteryData, saveBatteryData } from "@/lib/battery/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

// Define background task names
const BATTERY_DATA_SYNC_TASK = "batteryDataSyncTask";
const BATTERY_DATA_FETCH_TASK = "batteryDataFetchTask";

/**
 * Task 1: Sync saved battery data in the background
 * Ensure offline data is synced when returning to online state
 */
TaskManager.defineTask(BATTERY_DATA_SYNC_TASK, async () => {
  try {
    console.log("🔄 Running battery data sync task...");

    // Get cached data from local storage
    const pendingData = await AsyncStorage.getItem("pendingBatteryData");
    if (!pendingData) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const dataArray = JSON.parse(pendingData);
    let successCount = 0;
    let failedData = [];

    // Attempt to upload all pending data
    for (const data of dataArray) {
      try {
        await saveBatteryData(data);
        successCount++;
        console.log(`✅ Synced battery data for device: ${data.deviceId}`);
      } catch (error) {
        console.error("❌ Failed to sync battery data:", error);
        failedData.push(data);
      }
    }

    // Update local storage, keeping failed data
    if (failedData.length > 0) {
      await AsyncStorage.setItem(
        "pendingBatteryData",
        JSON.stringify(failedData),
      );
    } else {
      await AsyncStorage.removeItem("pendingBatteryData");
    }

    console.log(
      `📊 Sync completed: ${successCount} succeeded, ${failedData.length} failed`,
    );

    return successCount > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Error in battery data sync task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Task 2: Fetch latest data periodically in the background
 * Ensure app receives latest battery data even when not in foreground
 */
TaskManager.defineTask(BATTERY_DATA_FETCH_TASK, async () => {
  try {
    console.log("📥 Running battery data fetch task...");

    // Get currently selected device ID
    const currentDeviceId = await AsyncStorage.getItem(
      "currentSelectedDeviceId",
    );
    if (!currentDeviceId) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get recent battery data
    const result = await getRecentBatteryData(currentDeviceId, 20);

    if (result.canInfer) {
      console.log("✅ Sufficient data for inference:", result.count, "records");

      // Save data locally for later processing
      await AsyncStorage.setItem(
        "latestBatteryData",
        JSON.stringify(result.data),
      );

      // Can trigger a local notification here
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log("⏳ Insufficient data:", result.count, "records");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (error) {
    console.error("Error in battery data fetch task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Initialize background tasks
 * Called when app starts
 */
export async function registerBackgroundTasks() {
  try {
    // Register data sync task - runs every 15 minutes
    await BackgroundFetch.registerTaskAsync(BATTERY_DATA_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (minimum interval)
      stopOnTerminate: false, // Continue running after app closes
      startOnBoot: true, // Run after device boot
    });
    console.log("✅ Battery data sync task registered");

    // Register data fetch task - runs every 30 minutes
    await BackgroundFetch.registerTaskAsync(BATTERY_DATA_FETCH_TASK, {
      minimumInterval: 30 * 60, // 30 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("✅ Battery data fetch task registered");
  } catch (error) {
    console.error("Failed to register background tasks:", error);
  }
}

/**
 * Cancel background tasks
 */
export async function unregisterBackgroundTasks() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BATTERY_DATA_SYNC_TASK);
    await BackgroundFetch.unregisterTaskAsync(BATTERY_DATA_FETCH_TASK);
    console.log("✅ Background tasks unregistered");
  } catch (error) {
    console.error("Failed to unregister background tasks:", error);
  }
}

/**
 * Cache data offline for later sync
 */
export async function cacheBatteryDataForSync(data: any) {
  try {
    const existing = await AsyncStorage.getItem("pendingBatteryData");
    const pendingArray = existing ? JSON.parse(existing) : [];
    pendingArray.push(data);

    await AsyncStorage.setItem(
      "pendingBatteryData",
      JSON.stringify(pendingArray),
    );
    console.log("📦 Battery data cached for later sync");
  } catch (error) {
    console.error("Failed to cache battery data:", error);
  }
}

/**
 * Check if a background task is registered
 */
export async function isBackgroundTaskRegistered(
  taskName: string,
): Promise<boolean> {
  try {
    const tasks = await TaskManager.getRegisteredTasksAsync();
    return tasks.some((task) => task.taskName === taskName);
  } catch (error) {
    console.error("Failed to check registered tasks:", error);
    return false;
  }
}

/**
 * Usage example when app starts
 */
export async function initializeBatteryDataService() {
  try {
    // Check background task permissions
    const status = await BackgroundFetch.getStatusAsync();
    console.log("Background Fetch Status:", status);

    if (status !== BackgroundFetch.BackgroundFetchStatus.Denied) {
      // Register background tasks dynamically
      if (!(await isBackgroundTaskRegistered(BATTERY_DATA_SYNC_TASK))) {
        await registerBackgroundTasks();
      }
    } else {
      console.warn("⚠️ Background Fetch is not available");
    }
  } catch (error) {
    console.error("Failed to initialize battery data service:", error);
  }
}
