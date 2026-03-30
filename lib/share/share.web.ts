import type { ShareResult } from "./share";

export const shareMessage = async (message: string): Promise<ShareResult> => {
  if (navigator.share) {
    try {
      await navigator.share({ text: message });
      return { success: true };
    } catch (error) {
      console.log("Share cancelled or error:", error);
      return { success: false, error };
    }
  } else {
    console.log("Web share not supported");
    return { success: false, error: "Not supported" };
  }
};
