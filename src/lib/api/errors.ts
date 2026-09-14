/**
 * API 실패 — 봉투의 `code`로 분기합니다 (API 명세서 §0.2). 같은 409라도 화면 처리가 다르기 때문입니다.
 * 서버 컴포넌트·서버 액션 양쪽에서 쓰므로 서버 전용 import가 없습니다.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly detail?: Record<string, unknown>;

  constructor(init: { code: string; statusCode: number; message: string; detail?: Record<string, unknown> }) {
    super(init.message);
    this.name = "ApiError";
    this.code = init.code;
    this.statusCode = init.statusCode;
    this.detail = init.detail;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** 서버 `message`는 개발자용 문구일 수 있어 화면에는 이 표를 씁니다. 없는 코드는 서버 문구로 떨어집니다. */
export const ERROR_MESSAGE: Record<string, string> = {
  // §0 공통
  UNAUTHORIZED: "로그인이 필요해요",
  FORBIDDEN: "권한이 없어요",
  NOT_FOUND: "찾을 수 없어요",
  CONFLICT: "지금은 처리할 수 없는 상태예요",
  VALIDATION_FAILED: "입력값을 확인해주세요",
  INTERNAL_ERROR: "잠시 후 다시 시도해주세요",
  NETWORK_ERROR: "서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요",
  // §1 Auth
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 맞지 않아요",
  USER_SUSPENDED: "노쇼 누적으로 이용이 제한된 계정이에요",
  INVALID_REFRESH_TOKEN: "로그인이 만료됐어요. 다시 로그인해주세요",
  SESSION_AMBIGUOUS: "로그인 세션을 확인하지 못했어요. 다시 로그인해주세요",
  // §3 Banks · §4 Leagues
  BANK_IN_USE: "리그에서 쓰고 있는 계좌라 삭제할 수 없어요",
  BANK_NOT_FOUND: "계좌 정보를 찾을 수 없어요",
  // §5 Games
  GAME_NOT_OPEN: "모집이 마감된 경기예요",
  GAME_ALREADY_CLOSED: "이미 마감된 경기예요",
  CAPACITY_BELOW_OCCUPIED: "이미 신청자가 있는 자리는 줄일 수 없어요",
  FEE_LOCKED: "신청자가 있어 참가비를 바꿀 수 없어요",
  LEAGUE_BANK_REQUIRED: "입금 계좌를 먼저 등록해주세요",
  // §6 Reservations
  TIME_SLOT_CONFLICT: "같은 시간대에 다른 예약이 있어요",
  DUPLICATE_RESERVATION: "이미 신청한 경기예요",
  POSITION_NOT_OFFERED: "모집하지 않는 자리가 포함돼 있어요",
  POSITION_FULL: "일부 자리가 방금 마감됐어요",
  NOT_RESERVED: "입금 대기 상태가 아니에요",
  RESERVATION_EXPIRED: "입금 기한이 지나 예약이 만료됐어요",
  NOT_PENDING_PAYMENT: "이미 처리된 예약이에요",
  ALREADY_TERMINAL: "이미 종료된 예약이에요",
  NOT_APPROVED: "확정되지 않은 예약이 포함돼 있어요",
  GAME_NOT_ENDED: "경기가 끝난 뒤에 처리할 수 있어요",
  // §7 Evaluations
  NOT_ATTENDED: "참가한 경기만 평가할 수 있어요",
  SELF_EVALUATION: "자기 자신은 평가할 수 없어요",
  DUPLICATE_EVALUATION: "이미 평가한 참가자예요",
  BEST_PLAYER_LIMIT_REACHED: "베스트 플레이어는 2명까지 고를 수 있어요",
};

export function errorMessage(e: unknown) {
  if (isApiError(e)) return ERROR_MESSAGE[e.code] ?? e.message;
  return ERROR_MESSAGE.INTERNAL_ERROR;
}
