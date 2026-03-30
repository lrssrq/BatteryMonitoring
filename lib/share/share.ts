// This file provides type definitions for TypeScript
// Actual implementations are in share.native.ts and share.web.ts

export interface ShareResult {
  success: boolean;
  error?: any;
}

export const shareMessage = async (message: string): Promise<ShareResult> => {
  // This default implementation will never be called
  // Metro will choose .native.ts or .web.ts depending on the platform
  throw new Error("Platform-specific implementation not found");
};
