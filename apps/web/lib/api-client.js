// 모든 도메인이 함께 쓰는 API 호출 공통 부분. 도메인별 함수는 lib/{도메인}/api.js에 둔다 (예: lib/auth/api.js)

// API 서버 주소. .env.local의 NEXT_PUBLIC_API_URL로 바꿀 수 있다 (기본: 로컬 Express 서버)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// API가 실패 응답을 주면 이 에러를 던진다. code는 명세서의 ErrorCode (예: EMAIL_ALREADY_EXISTS)
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// 공통 fetch: JSON으로 보내고 받는다. 쿠키(httpOnly 토큰)를 함께 보내기 위해 credentials: "include"
export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json", ...headers } : headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
  }

  if (response.status === 204) return null;

  // 성공은 { data }, 실패는 { code, message } (docs/conventions.md §3)
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.code ?? "UNKNOWN_ERROR",
      json?.message ?? "요청에 실패했어요.",
    );
  }
  return json?.data;
}
