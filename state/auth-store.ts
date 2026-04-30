import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";

import { fetchApi, parseJsonOrThrow, ApiError } from "@/lib/api/client/fetch-api";
import { loginResponseSchema, meUserSchema, type MeUser } from "@/lib/api/schemas/auth";

const KEYS = {
  access: "overnight/access_token",
  refresh: "overnight/refresh_token",
  device: "overnight/device_id",
} as const;

const ASYNC_FALLBACK_PREFIX = "@overnight/secure/";

/** Prefer SecureStore; fall back to AsyncStorage when unavailable (some Expo Go / OEM cases). */
async function storageGet(key: string): Promise<string | null> {
  try {
    if (await SecureStore.isAvailableAsync()) {
      const v = await SecureStore.getItemAsync(key);
      if (v != null) return v;
    }
  } catch {
    /* use fallback */
  }
  return AsyncStorage.getItem(ASYNC_FALLBACK_PREFIX + key);
}

async function storageSet(key: string, value: string): Promise<void> {
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.removeItem(ASYNC_FALLBACK_PREFIX + key);
      return;
    }
  } catch {
    /* use fallback */
  }
  await AsyncStorage.setItem(ASYNC_FALLBACK_PREFIX + key, value);
}

async function storageDelete(key: string): Promise<void> {
  try {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    /* still clear fallback */
  }
  await AsyncStorage.removeItem(ASYNC_FALLBACK_PREFIX + key);
}

/** Read stable device id, or create and persist one. */
async function loadOrCreateDeviceId(): Promise<string> {
  let id = await storageGet(KEYS.device);
  if (!id) {
    id = randomUUID();
    await storageSet(KEYS.device, id);
  }
  return id;
}

type AuthState = {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  user: MeUser | null;
  error: string | null;
  hydrate: () => Promise<void>;
  clearError: () => void;
  signIn: (employeeId: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  deviceId: null,
  user: null,
  error: null,

  clearError: () => set({ error: null }),

  hydrate: async () => {
    let deviceId: string | null = null;
    try {
      deviceId = await loadOrCreateDeviceId();
    } catch {
      deviceId = null;
    }

    try {
      const [access, refresh] = await Promise.all([
        storageGet(KEYS.access),
        storageGet(KEYS.refresh),
      ]);

      set({
        deviceId,
        accessToken: access,
        refreshToken: refresh,
        hydrated: true,
      });

      if (!access || !deviceId) {
        return;
      }

      try {
        const meRes = await fetchApi("/auth/me", { method: "GET", accessToken: access });
        const meJson = await parseJsonOrThrow<unknown>(meRes);
        const user = meUserSchema.parse(meJson);
        set({ user });
      } catch {
        const rt = refresh;
        if (!rt) {
          await storageDelete(KEYS.access);
          set({ accessToken: null, user: null });
          return;
        }
        try {
          const refRes = await fetchApi("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refresh_token: rt, device_id: deviceId }),
          });
          const refJson = await parseJsonOrThrow<unknown>(refRes);
          const data = loginResponseSchema.parse(refJson);
          await storageSet(KEYS.access, data.access_token);
          await storageSet(KEYS.refresh, data.refresh_token);
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user,
          });
        } catch {
          await storageDelete(KEYS.access);
          await storageDelete(KEYS.refresh);
          set({ accessToken: null, refreshToken: null, user: null });
        }
      }
    } catch {
      set({ hydrated: true, deviceId });
    }
  },

  signIn: async (employeeId: string, pin: string) => {
    set({ error: null });
    let deviceId = get().deviceId;
    if (!deviceId) {
      try {
        deviceId = await loadOrCreateDeviceId();
        set({ deviceId });
      } catch {
        set({
          error: "Could not create a device id on this device. Try restarting the app.",
        });
        return;
      }
    }

    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          employee_id: employeeId.trim(),
          pin: pin.trim(),
          device_id: deviceId,
        }),
      });
      const json = await parseJsonOrThrow<unknown>(res);
      const data = loginResponseSchema.parse(json);
      await storageSet(KEYS.access, data.access_token);
      await storageSet(KEYS.refresh, data.refresh_token);
      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.problem.details as { message?: string }[] | undefined)?.[0]?.message ??
            e.problem.title ??
            e.message
          : e instanceof Error
            ? e.message
            : "Sign in failed";
      set({ error: String(msg) });
    }
  },

  signOut: async () => {
    const { accessToken } = get();
    if (accessToken) {
      try {
        const res = await fetchApi("/auth/logout", { method: "POST", accessToken });
        await parseJsonOrThrow(res);
      } catch {
        /* still clear local session */
      }
    }
    await storageDelete(KEYS.access);
    await storageDelete(KEYS.refresh);
    set({ accessToken: null, refreshToken: null, user: null, error: null });
  },
}));
