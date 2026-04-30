import Constants from "expo-constants";

const DEFAULT_LOCAL = "http://localhost:3000/api/v1";

/** Set from root layout when `isExpoTunnel()` + tunnel env (e.g. ngrok). `null` = use normal resolution. */
let runtimeApiBaseUrlOverride: string | null = null;

export function setApiBaseUrlOverride(url: string | null): void {
  runtimeApiBaseUrlOverride = url?.replace(/\/$/, "") ?? null;
}
const API_PORT = 3000;

function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** True when the dev server hostname looks reachable for a local API (not a JS tunnel endpoint). */
function isLikelyDevMachineHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") return true;
  if (h.endsWith(".local")) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  return false;
}

function isTunnelOrPublicDevHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h.includes("exp.direct") ||
    h.endsWith(".ngrok.io") ||
    h.endsWith(".ngrok-free.app") ||
    h.includes(".trycloudflare.com") ||
    h.includes("loca.lt")
  );
}

/**
 * In Expo dev, `expoConfig.hostUri` is the packager host (`192.168.x.x:8081`, etc.).
 * Use that IP/hostname for the API so a physical device can reach your machine.
 * Does not apply when using `--tunnel` (host is usually not your API).
 */
function inferDevApiBaseFromPackagerHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri || !isDev()) return null;

  const host = hostUri.split(":")[0]?.trim();
  if (!host) return null;

  if (isTunnelOrPublicDevHost(host)) {
    console.warn(
      "[overnight] Expo tunnel is for Metro only; your API is still on your PC (port %s). " +
        "Set EXPO_PUBLIC_API_BASE_URL to http://<your-PC-LAN-IP>:%s/api/v1 (same Wi‑Fi), " +
        "or expose the API (e.g. ngrok) and point this env var there. " +
        "Alternatively run Expo without --tunnel if LAN works.",
      API_PORT,
      API_PORT,
    );
    return null;
  }

  if (!isLikelyDevMachineHost(host)) return null;

  return `http://${host}:${API_PORT}/api/v1`;
}

/**
 * API base including `/api/v1`.
 * Set `EXPO_PUBLIC_API_BASE_URL` in `.env` (Expo loads `EXPO_PUBLIC_*`).
 * When using `expo start --tunnel`, set `EXPO_PUBLIC_API_BASE_URL_TUNNEL` (e.g. ngrok); root layout applies it at runtime.
 * Android emulator: `http://10.0.2.2:3000/api/v1`
 */
export function getApiBaseUrl(): string {
  if (runtimeApiBaseUrlOverride) return runtimeApiBaseUrlOverride;
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  if (extra?.apiBaseUrl) return String(extra.apiBaseUrl).replace(/\/$/, "");
  const inferred = inferDevApiBaseFromPackagerHost();
  if (inferred) return inferred;
  return DEFAULT_LOCAL;
}
