import { randomUUID } from "expo-crypto";

import { getApiBaseUrl } from "./base-url";

export type ProblemBody = {
  type?: string;
  title?: string;
  code?: string;
  status?: number;
  details?: unknown;
  request_id?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemBody;

  constructor(status: number, problem: ProblemBody) {
    super(problem.title ?? "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export type FetchApiInit = RequestInit & {
  /** When set, sends `Authorization: Bearer …` */
  accessToken?: string | null;
};

/**
 * JSON API helper: sets `Content-Type`, `X-Request-Id`, and `Idempotency-Key` on mutating requests.
 */
export async function fetchApi(path: string, init: FetchApiInit = {}): Promise<Response> {
  const url = buildUrl(path);
  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();

  if (init.body !== undefined && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("X-Request-Id", randomUUID());

  if (method !== "GET" && method !== "HEAD") {
    headers.set("Idempotency-Key", randomUUID());
  }

  if (init.accessToken) {
    headers.set("Authorization", `Bearer ${init.accessToken}`);
  }

  const { accessToken: _a, ...rest } = init;
  return fetch(url, { ...rest, headers });
}

export async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();

  if (!res.ok) {
    let problem: ProblemBody = { title: text || res.statusText, status: res.status };
    if (text) {
      try {
        problem = JSON.parse(text) as ProblemBody;
      } catch {
        /* keep plain text title */
      }
    }
    throw new ApiError(res.status, problem);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
