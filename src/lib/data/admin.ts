import { cache } from "react";
import { cookies } from "next/headers";
import { hostApi, orUndefined } from "@/lib/api/client";
import type {
  AdminGameStatusQuery,
  AdminGameSummaryDto,
  AdminReservationDto,
  CursorListDto,
  GameDetailDto,
  GameReservationDto,
  LeagueDashboardDto,
  LeagueDto,
  LeagueReservationStatusQuery,
  ListDto,
} from "@/lib/api/dto";
import { ApiError } from "@/lib/api/errors";
import {
  toAdminReservation,
  toGame,
  toGameReservation,
  toGameSummary,
  toLeague,
  toReservationSummary,
} from "@/lib/api/mappers";
import type { AdminGameReservation, AdminReservation, Game, GameSummary, League, ReservationSummary } from "@/lib/types";

/**
 * 로그인 응답의 `leagueId`를 FE가 심어 두는 쿠키 (명세 §1 — 어드민은 로그인 직후부터 "내 리그"를 알아야 합니다).
 * 없으면 `GET /leagues/mine`의 첫 리그로 떨어집니다.
 */
export const ADMIN_LEAGUE_COOKIE = "admin_league";

/** 요청당 1회 — layout과 page가 같은 요청에서 각각 불러도 한 번만 조회합니다. */
export const getAdminLeagueId = cache(async (): Promise<string> => {
  const fromCookie = (await cookies()).get(ADMIN_LEAGUE_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  const { items } = await hostApi.get<ListDto<LeagueDto>>("/leagues/mine");
  if (!items[0]) throw new ApiError({ code: "NOT_FOUND", statusCode: 404, message: "운영 중인 리그가 없어요" });
  return items[0].id;
});

/** `GET /leagues/:id` */
export const getLeague = cache(async (): Promise<League> => {
  const id = await getAdminLeagueId();
  return toLeague(await hostApi.get<LeagueDto>(`/leagues/${id}`));
});

export type Dashboard = {
  pendingPayments: number;
  openGames: number;
  /** 48시간 이내 시작 — 화면 라벨은 「오늘·내일 경기」 */
  imminentGames: number;
  upcoming: GameSummary[];
  pendingPreview: ReservationSummary[];
};

/** `GET /leagues/:id/dashboard` — 셸 배지도 여기서 나오므로 사실상 매 화면 호출됩니다 (명세 §4). */
export const getDashboard = cache(async (): Promise<Dashboard> => {
  const id = await getAdminLeagueId();
  const dto = await hostApi.get<LeagueDashboardDto>(`/leagues/${id}/dashboard`);
  return {
    pendingPayments: dto.pendingPayments,
    openGames: dto.openGames,
    imminentGames: dto.imminentGames,
    upcoming: dto.upcoming.map(toGameSummary),
    pendingPreview: dto.pendingPreview.map(toReservationSummary),
  };
});

/** layout이 쓰는 요약 — 리그명 + 입금 미처리 건수 (routing.md §3-2) */
export async function getLeagueSummary() {
  const [league, dashboard] = await Promise.all([getLeague(), getDashboard()]);
  return { name: league.name, pendingPayments: dashboard.pendingPayments };
}

export type AdminGameTab = AdminGameStatusQuery;

/** `GET /leagues/:leagueId/games?status=` — 항목마다 `pendingPayments`가 붙습니다 (§A-3). */
export const listAdminGames = cache(async (tab: AdminGameTab): Promise<GameSummary[]> => {
  const id = await getAdminLeagueId();
  const { items } = await hostApi.get<ListDto<AdminGameSummaryDto>>(`/leagues/${id}/games`, { status: tab });
  return items.map(toGameSummary);
});

/** 아직 시작하지 않은 경기(모집중 + 예정)의 경기별 입금 미처리 건수 — A-2 「다가오는 경기」 배지 */
export async function pendingByGame(): Promise<Map<string, number>> {
  const [open, upcoming] = await Promise.all([listAdminGames("open"), listAdminGames("upcoming")]);
  return new Map([...open, ...upcoming].map((g) => [g.id, g.pendingPayments ?? 0]));
}

/** `GET /games/:id` — 어드민 세션으로 불러 용병 쿠키의 `isMine`이 섞이지 않게 합니다. */
export const getAdminGame = cache(async (id: string): Promise<Game | undefined> => {
  const dto = await orUndefined(hostApi.get<GameDetailDto>(`/games/${encodeURIComponent(id)}`));
  return dto && toGame(dto);
});

export type AdminReservationTab = "pending" | "approved" | "rejected";

/** `GET /games/:gameId/reservations?status=` (A-5) — 탭 값은 BE와 아직 맞추지 않았습니다. */
export async function listGameReservations(gameId: string, tab: AdminReservationTab): Promise<AdminGameReservation[]> {
  const { items } = await hostApi.get<ListDto<GameReservationDto>>(`/games/${encodeURIComponent(gameId)}/reservations`, {
    status: tab,
  });
  return items.map(toGameReservation);
}

export type PaymentTab = LeagueReservationStatusQuery;

/** `GET /leagues/:leagueId/reservations` — 기본은 리그 전체 경기 합산, 신청 시각 오름차순 (§A-6) */
export async function listPayments(opts: {
  tab: PaymentTab;
  gameId?: string;
  q?: string;
  cursor?: string;
}): Promise<{ items: AdminReservation[]; nextCursor: string | null }> {
  const id = await getAdminLeagueId();
  const { items, nextCursor } = await hostApi.get<CursorListDto<AdminReservationDto>>(`/leagues/${id}/reservations`, {
    status: opts.tab,
    gameId: opts.gameId,
    q: opts.q?.trim(),
    cursor: opts.cursor,
  });
  return { items: items.map(toAdminReservation), nextCursor };
}

/**
 * A-6 필터 칩 — 입금 미처리 건이 있는 경기. 시작한 뒤에도 입금 확인이 남는 경우가 흔해 종료 경기까지 봅니다.
 * 전용 API가 없어 경기 목록 3종에서 파생합니다 (A-3와 같은 요청이라 `cache`로 묶입니다).
 */
export async function listPaymentGames(): Promise<GameSummary[]> {
  const lists = await Promise.all([listAdminGames("open"), listAdminGames("upcoming"), listAdminGames("ended")]);
  return lists
    .flat()
    .filter((g) => (g.pendingPayments ?? 0) > 0)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * A-4 등록 화면의 보조 값 — 「직전 경기와 동일하게」의 원본과 최근 구장 3개.
 * 전용 API가 없어 경기 목록에서 파생합니다: 원본은 시작 시각이 가장 늦은 경기입니다.
 */
export async function getGameFormContext(): Promise<{ lastGame?: Game; recentVenues: string[] }> {
  const [open, upcoming, ended] = await Promise.all([
    listAdminGames("open"),
    listAdminGames("upcoming"),
    listAdminGames("ended"),
  ]);
  const all = [...open, ...upcoming, ...ended].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const recentVenues = [...new Set(all.map((g) => g.venue))].slice(0, 3);
  const lastGame = all[0] ? await getAdminGame(all[0].id) : undefined;
  return { lastGame, recentVenues };
}
