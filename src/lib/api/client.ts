/**
 * 서버 전용 API 클라이언트 — 서버 컴포넌트와 서버 액션에서만 부릅니다(`next/headers`를 쓰므로 클라이언트 번들에 못 들어갑니다).
 *
 * - 봉투(`{ success, data }`)를 벗겨 `data`만 돌려주고, 실패는 `ApiError`로 던집니다 (API 명세서 §0.1).
 * - 세션을 **명시**합니다. 같은 브라우저에 용병·어드민 쿠키가 공존하고, 서버는 역할 지정이 없는 라우트에서
 *   용병 쿠키를 먼저 집기 때문입니다. 고른 세션의 access 쿠키를 `Authorization` 헤더로 실어 모호함을 없앱니다.
 * - `API_MOCK=1`이면 `src/mocks/handlers.ts`에 핸들러가 있는 경로만 목으로 응답하고, 나머지는 실제 API로 나갑니다.
 */
import { cookies } from "next/headers";
import type { ApiEnvelope, UserRole } from "./dto";
import { ApiError, isApiError } from "./errors";

/** 세션 쿠키 이름 — 서버가 심습니다 (API 명세서 §1.1). */
export const SESSION_COOKIES: Record<UserRole, { access: string; refresh: string }> = {
  PLAYER: { access: "player_session", refresh: "player_refresh" },
  HOST: { access: "admin_session", refresh: "admin_refresh" },
};

const API_BASE = `${process.env.API_ORIGIN ?? "http://localhost:4000"}/api/v1`;
const MOCK = process.env.API_MOCK === "1";

type Method = "GET" | "POST" | "PATCH" | "DELETE";
export type Query = Record<string, string | number | boolean | null | undefined>;

function withQuery(path: string, query?: Query) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(session: UserRole, method: Method, path: string, query?: Query, body?: unknown): Promise<T> {
  const url = withQuery(path, query);
  // 목 모드에서도 먼저 읽습니다 — 쿠키를 읽어야 Next가 이 화면을 요청마다 렌더링합니다(사용자별 데이터가 빌드 시점에 굳지 않게)
  const token = (await cookies()).get(SESSION_COOKIES[session].access)?.value;

  if (MOCK) {
    const { mockRequest } = await import("@/mocks/handlers");
    const mocked = await mockRequest(method, url, body, session);
    if (mocked) return mocked.data as T;
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError({ code: "NETWORK_ERROR", statusCode: 0, message: `${method} ${url} — 연결 실패` });
  }

  if (res.status === 204) return undefined as T;

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!envelope) {
    throw new ApiError({ code: "INTERNAL_ERROR", statusCode: res.status, message: `${method} ${url} → ${res.status}` });
  }
  if (!envelope.success) throw new ApiError(envelope);
  return envelope.data;
}

function client(session: UserRole) {
  return {
    get: <T>(path: string, query?: Query) => request<T>(session, "GET", path, query),
    post: <T>(path: string, body?: unknown) => request<T>(session, "POST", path, undefined, body),
    patch: <T>(path: string, body?: unknown) => request<T>(session, "PATCH", path, undefined, body),
    delete: <T>(path: string) => request<T>(session, "DELETE", path),
  };
}

/** 용병 세션. 공개 API(`GET /games`)도 여기로 부릅니다 — 로그인돼 있으면 `isMine`이 채워집니다. */
export const playerApi = client("PLAYER");

/** 어드민(HOST) 세션. */
export const hostApi = client("HOST");

/** 404면 `undefined` — 페이지가 `notFound()`로 이어받습니다. 다른 실패는 그대로 던져 `error.tsx`로 갑니다. */
export async function orUndefined<T>(p: Promise<T>): Promise<T | undefined> {
  try {
    return await p;
  } catch (e) {
    if (isApiError(e) && e.statusCode === 404) return undefined;
    throw e;
  }
}
