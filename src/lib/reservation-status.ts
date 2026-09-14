/** 예약 상태 8종. 서버 `ReservationStatus` enum과 1:1입니다. */
export const RESERVATION_STATUSES = [
  "RESERVED",
  "PAYMENT_SUBMITTED",
  "APPROVED",
  "ATTENDED",
  "EXPIRED",
  "CANCELLED",
  "REJECTED",
  "NO_SHOW",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

/** 배지 문구. 화면설계서 §P-8 상태 테이블과 동일합니다. */
export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  RESERVED: "입금 대기",
  PAYMENT_SUBMITTED: "승인 대기",
  APPROVED: "승인 완료",
  ATTENDED: "참가 완료",
  EXPIRED: "기간 만료",
  CANCELLED: "취소함",
  REJECTED: "거절됨",
  NO_SHOW: "노쇼 처리",
};

/** 주최자가 처리해야 할 상태 — 입금 확인 대기 (A-6 `pending` · 셸 배지). 사용자가 「입금했어요」를 누르지 않아도 대기입니다. */
export function isPending(status: ReservationStatus) {
  return status === "RESERVED" || status === "PAYMENT_SUBMITTED";
}
