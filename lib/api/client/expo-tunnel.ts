import Constants from "expo-constants";

/**
 * True when the JS bundle is loaded via an Expo dev URL that looks like tunnel mode
 * (same pattern as hostUri for `npx expo start --tunnel`).
 */
export function isExpoTunnel(): boolean {
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  return hostUri.includes("exp") || hostUri.includes("direct");
}
