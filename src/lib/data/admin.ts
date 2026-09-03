import { ADMIN_RESERVATIONS, GAMES, LEAGUE } from "@/mocks/data";
import type { Game, League } from "@/lib/types";
import type { ReservationStatus } from "@/lib/reservation-status";

export async function getLeague(): Promise<League> {
  return LEAGUE;
}

/** layout이 쓰는 요약 — 리그명 + 입금 미처리 건수 (routing.md §3-2) */
export async function getLeagueSummary() {
  const pending = ADMIN_RESERVATIONS.filter((r) => isPending(r.status)).length;
  return { name: LEAGUE.name, pendingPayments: pending };
}

export type AdminGameTab = "open" | "upcoming" | "ended";

function isEnded(g: Game, now: number) {
  return new Date(g.startsAt).getTime() + g.durationHours * 60 * 60 * 1000 <= now;
}

/** `GET /admin/games?status=` — 모집중·예정 오름차순, 종료 내림차순 (§A-3) */
export async function listAdminGames(tab: AdminGameTab): Promise<Game[]> {
  const now = Date.now();
  const games = GAMES.filter((g) => {
    const ended = isEnded(g, now);
    if (tab === "ended") return ended;
    if (ended) return false;
    return tab === "open" ? g.status === "OPEN" : g.status !== "OPEN";
  });
  return games.sort((a, b) =>
    tab === "ended" ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt),
  );
}

export async function getAdminGame(id: string): Promise<Game | undefined> {
  return GAMES.find((g) => g.id === id);
}

export function isPending(status: ReservationStatus) {
  return status === "PAYMENT_SUBMITTED" || status === "RESERVED";
}

export async function countPendingByGame(gameId: string) {
  return ADMIN_RESERVATIONS.filter((r) => r.gameId === gameId && isPending(r.status)).length;
}

export type AdminReservationTab = "pending" | "approved" | "rejected";

const TAB_STATUSES: Record<AdminReservationTab, ReservationStatus[]> = {
  pending: ["PAYMENT_SUBMITTED", "RESERVED"],
  approved: ["APPROVED", "ATTENDED", "NO_SHOW"],
  rejected: ["REJECTED", "CANCELLED", "EXPIRED"],
};

/** `GET /admin/games/:id/reservations?status=` */
export async function listGameReservations(gameId: string, tab: AdminReservationTab) {
  return ADMIN_RESERVATIONS.filter((r) => r.gameId === gameId && TAB_STATUSES[tab].includes(r.status)).sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt),
  );
}

export type PaymentTab = "pending" | "done";

/** `GET /admin/payments?status=&gameId=&q=` — 기본은 전체 경기 합산, 신청 시각 오름차순 (§A-6) */
export async function listPayments(opts: { tab: PaymentTab; gameId?: string; q?: string }) {
  return ADMIN_RESERVATIONS.filter((r) => {
    if (opts.tab === "pending" ? !isPending(r.status) : isPending(r.status)) return false;
    if (opts.gameId && r.gameId !== opts.gameId) return false;
    if (opts.q && !r.depositorName.includes(opts.q.trim())) return false;
    return true;
  }).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** A-6 필터 칩용 — 미처리 건이 있는 경기 목록 */
export async function listPaymentGames(): Promise<Game[]> {
  const ids = new Set(ADMIN_RESERVATIONS.map((r) => r.gameId));
  return GAMES.filter((g) => ids.has(g.id)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** `GET /admin/dashboard` */
export async function getDashboard() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const upcoming = GAMES.filter((g) => !isEnded(g, now)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const todayTomorrow = upcoming.filter((g) => new Date(g.startsAt).getTime() < now + 2 * dayMs).length;
  const pending = ADMIN_RESERVATIONS.filter((r) => isPending(r.status));
  return {
    pendingPayments: pending.length,
    todayTomorrow,
    openGames: upcoming.filter((g) => g.status === "OPEN").length,
    upcoming: upcoming.slice(0, 3),
    pendingPreview: pending.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, 3),
    totalGames: GAMES.length,
  };
}

export async function getAdminReservation(id: string) {
  return ADMIN_RESERVATIONS.find((r) => r.id === id);
}
