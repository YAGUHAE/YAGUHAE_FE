/**
 * 동적 경로 빌더 (routing.md §3-8).
 * 정적 경로는 `src/components/navigation/nav-items.ts`를 그대로 씁니다 — 여기에 다시 적지 않습니다.
 */
export const routes = {
  game: (id: string) => `/games/${id}`,
  gameReserve: (id: string, slot?: string) =>
    slot ? `/games/${id}/reserve?slot=${encodeURIComponent(slot)}` : `/games/${id}/reserve`,
  reservation: (id: string) => `/reservations/${id}`,
  reservationPayment: (id: string) => `/reservations/${id}/payment`,
  reservationReview: (id: string) => `/reservations/${id}/review`,
  adminGame: (id: string) => `/admin/games/${id}`,
  adminGameEdit: (id: string) => `/admin/games/${id}/edit`,
  adminGameAttendance: (id: string) => `/admin/games/${id}/attendance`,
} as const;
