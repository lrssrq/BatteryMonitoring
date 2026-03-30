import Share from "react-native-share";
import type { ShareResult } from "./share";

export const shareMessage = async (message: string): Promise<ShareResult> => {
  try {
    await Share.open({ message });
    return { success: true };
  } catch (error) {
    console.log("Share error:", error);
    return { success: false, error };
  }
};
