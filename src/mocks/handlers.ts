/**
 * 목 모드 라우터 — `API_MOCK=1`일 때 `src/lib/api/client.ts`가 네트워크 대신 여기로 옵니다.
 * 응답은 API 명세서 v6.1의 `data` 모양 그대로입니다.
 *
 * **BE가 엔드포인트를 내면 여기서 그 줄을 지웁니다.** 핸들러가 없는 경로는 실제 API로 나갑니다.
 */
import type {
  AdminGameSummaryDto,
  AdminReservationDto,
  ApiTeam,
  CursorListDto,
  GameDetailDto,
  GameReservationDto,
  GameSummaryDto,
  LeagueDashboardDto,
  ListDto,
  NotificationListDto,
  ParticipantsDto,
  ReservationDetailDto,
  ReservationGameDto,
  ReservationSummaryDto,
  UserRole,
} from "@/lib/api/dto";
import { ApiError } from "@/lib/api/errors";
import { isSameDay } from "@/lib/format";
import type { ReservationStatus } from "@/lib/reservation-status";
import {
  findGame,
  GAMES,
  LEAGUE,
  LEAGUE_RESERVATIONS,
  ME,
  MY_RESERVATIONS,
  NOTIFICATIONS,
} from "./fixtures";

type Method = "GET" | "POST" | "PATCH" | "DELETE";
type Ctx = { params: Record<string, string>; query: URLSearchParams; body: unknown; session: UserRole };
type Handler = (ctx: Ctx) => unknown;

const notFound = () => new ApiError({ code: "NOT_FOUND", statusCode: 404, message: "리소스 없음" });

/* ─── 파생 헬퍼 ─── */

function startsAt(g: Pick<GameDetailDto, "gameDate" | "gameTime">) {
  return new Date(`${g.gameDate}T${g.gameTime}:00+09:00`).getTime();
}

function isEnded(g: GameDetailDto, now = Date.now()) {
  return startsAt(g) + g.durationMin * 60 * 1000 <= now;
}

function summarize(detail: GameDetailDto, region: string): GameSummaryDto {
  const count = (t: ApiTeam) => {
    const ps = detail.positions.filter((p) => p.team === t);
    return {
      occupied: ps.reduce((n, p) => n + p.occupiedCount, 0),
      capacity: ps.reduce((n, p) => n + p.capacity, 0),
    };
  };
  return {
    id: detail.id,
    gameDate: detail.gameDate,
    gameTime: detail.gameTime,
    durationMin: detail.durationMin,
    stadiumName: detail.stadiumName,
    leagueName: detail.league.name,
    region,
    recommendedLevel: detail.recommendedLevel,
    status: detail.status,
    feeRange: detail.feeRange,
    teams: { HOME: count("HOME"), AWAY: count("AWAY") },
    // 명세 §5 — 카드에 칩 2개 + `+N`만 그리므로 상한 4개
    emptySlots: detail.positions
      .filter((p) => p.remaining > 0)
      .map((p) => ({ team: p.team, position: p.position }))
      .slice(0, 4),
  };
}

function summaryOf(id: string) {
  const g = findGame(id);
  if (!g) throw notFound();
  return summarize(g.detail, g.region);
}

function reservationGame(gameId: string): ReservationGameDto {
  const s = summaryOf(gameId);
  return {
    id: s.id,
    gameDate: s.gameDate,
    gameTime: s.gameTime,
    stadiumName: s.stadiumName,
    leagueName: s.leagueName,
    status: s.status,
  };
}

const total = (slots: { fee: number }[]) => slots.reduce((n, s) => n + s.fee, 0);
const isPending = (s: ReservationStatus) => s === "RESERVED" || s === "PAYMENT_SUBMITTED";
const byCreatedAsc = (a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt);
const byStartAsc = (a: GameSummaryDto, b: GameSummaryDto) =>
  `${a.gameDate}T${a.gameTime}`.localeCompare(`${b.gameDate}T${b.gameTime}`);

function myDetail(id: string): ReservationDetailDto {
  const r = MY_RESERVATIONS.find((x) => x.id === id);
  if (!r) throw notFound();
  const g = findGame(r.gameId)!;
  return {
    ...r,
    slotCount: r.slots.length,
    totalFee: total(r.slots),
    rejectReason: r.rejectReason ?? null,
    reviewed: r.reviewed ?? false,
    game: { ...summarize(g.detail, g.region), bank: g.detail.league.bank, notice: g.detail.notice },
  };
}

function mySummary(id: string): ReservationSummaryDto {
  const d = myDetail(id);
  return {
    id: d.id,
    status: d.status,
    createdAt: d.createdAt,
    expiresAt: d.expiresAt,
    depositorName: d.depositorName,
    slotCount: d.slotCount,
    totalFee: d.totalFee,
    slots: d.slots.map(({ team, position, participantName }) => ({ team, position, participantName })),
    game: reservationGame(d.game.id),
    reviewed: d.reviewed,
  };
}

function leagueReservation(r: (typeof LEAGUE_RESERVATIONS)[number]): GameReservationDto {
  return {
    ...r,
    slotCount: r.slots.length,
    totalFee: total(r.slots),
    game: reservationGame(r.gameId),
    reviewed: false,
  };
}

function withoutFees(r: GameReservationDto): AdminReservationDto {
  return { ...r, slots: r.slots.map(({ team, position, participantName }) => ({ team, position, participantName })) };
}

function requireLeague(id: string) {
  if (id !== LEAGUE.id) throw new ApiError({ code: "FORBIDDEN", statusCode: 403, message: "리그 소유자가 아님" });
}

/* ─── 라우트 표 ─── */

const MY_TAB: Record<string, ReservationStatus[]> = {
  ongoing: ["RESERVED", "PAYMENT_SUBMITTED", "APPROVED"],
  done: ["ATTENDED"],
  closed: ["EXPIRED", "CANCELLED", "REJECTED", "NO_SHOW"],
};

const GAME_RESERVATION_TAB: Record<string, ReservationStatus[]> = {
  pending: ["RESERVED", "PAYMENT_SUBMITTED"],
  approved: ["APPROVED", "ATTENDED", "NO_SHOW"],
  rejected: ["REJECTED", "CANCELLED", "EXPIRED"],
};

const ROUTES: [Method, string, Handler][] = [
  /* §2 Users */
  ["GET", "/users/me", () => ME],

  /* §4 Leagues — `/leagues/mine`이 `/leagues/:id`보다 먼저 */
  ["GET", "/leagues/mine", (): ListDto<typeof LEAGUE> => ({ items: [LEAGUE] })],
  [
    "GET",
    "/leagues/:id/dashboard",
    ({ params }): LeagueDashboardDto => {
      requireLeague(params.id);
      const now = Date.now();
      const live = GAMES.filter((g) => !isEnded(g.detail, now));
      const pending = LEAGUE_RESERVATIONS.filter((r) => isPending(r.status)).map(leagueReservation).sort(byCreatedAsc);
      return {
        pendingPayments: pending.length,
        openGames: live.filter((g) => g.detail.status === "OPEN").length,
        imminentGames: live.filter((g) => startsAt(g.detail) < now + 48 * 60 * 60 * 1000).length,
        upcoming: live.map((g) => summarize(g.detail, g.region)).sort(byStartAsc).slice(0, 3),
        pendingPreview: pending.slice(0, 3).map(withoutFees),
      };
    },
  ],
  [
    "GET",
    "/leagues/:leagueId/games",
    ({ params, query }): ListDto<AdminGameSummaryDto> => {
      requireLeague(params.leagueId);
      const status = query.get("status") ?? "open";
      const now = Date.now();
      const items = GAMES.filter(({ detail }) => {
        const ended = isEnded(detail, now);
        if (status === "ended") return ended;
        if (ended) return false;
        return status === "open" ? detail.status === "OPEN" : detail.status !== "OPEN";
      })
        .map((g) => ({
          ...summarize(g.detail, g.region),
          pendingPayments: LEAGUE_RESERVATIONS.filter((r) => r.gameId === g.detail.id && isPending(r.status)).length,
        }))
        .sort(byStartAsc);
      return { items: status === "ended" ? items.reverse() : items };
    },
  ],
  [
    "GET",
    "/leagues/:leagueId/reservations",
    ({ params, query }): CursorListDto<AdminReservationDto> => {
      requireLeague(params.leagueId);
      const tab = query.get("status") ?? "pending";
      const gameId = query.get("gameId");
      const q = query.get("q")?.trim();
      const items = LEAGUE_RESERVATIONS.filter((r) => {
        if (tab === "pending" ? !isPending(r.status) : isPending(r.status)) return false;
        if (gameId && r.gameId !== gameId) return false;
        if (q && !r.depositorName.includes(q)) return false;
        return true;
      })
        .map(leagueReservation)
        .sort(byCreatedAsc)
        .map(withoutFees);
      return { items, nextCursor: null };
    },
  ],
  [
    "GET",
    "/leagues/:id",
    ({ params }) => {
      if (params.id !== LEAGUE.id) throw notFound();
      return LEAGUE;
    },
  ],

  /* §5 Games */
  [
    "GET",
    "/games",
    ({ query }): ListDto<GameSummaryDto> => {
      const date = query.get("date");
      const region = query.get("region");
      const level = query.get("level");
      const hideClosed = query.get("hideClosed") === "true";
      const now = Date.now();
      // 공개 목록은 종료된 경기를 노출하지 않습니다 (명세 §5)
      const items = GAMES.filter(({ detail, region: r }) => {
        if (isEnded(detail, now)) return false;
        if (date && !isSameDay(new Date(startsAt(detail)).toISOString(), date)) return false;
        if (region && r !== region) return false;
        if (level && detail.recommendedLevel !== level) return false;
        if (hideClosed && detail.status !== "OPEN") return false;
        return true;
      })
        .map((g) => summarize(g.detail, g.region))
        .sort(byStartAsc);
      return { items };
    },
  ],
  [
    "GET",
    "/games/:gameId/reservations",
    ({ params, query }): ListDto<GameReservationDto> => {
      const statuses = GAME_RESERVATION_TAB[query.get("status") ?? "pending"] ?? GAME_RESERVATION_TAB.pending;
      const items = LEAGUE_RESERVATIONS.filter((r) => r.gameId === params.gameId && statuses.includes(r.status))
        .map(leagueReservation)
        .sort(byCreatedAsc);
      return { items };
    },
  ],
  [
    "GET",
    "/games/:gameId/participants",
    ({ params }): ParticipantsDto => {
      const g = findGame(params.gameId);
      if (!g) throw notFound();
      // 각 예약의 첫 자리(계정 있는 본인)만, 요청자 제외 (명세 §7)
      const items = g.detail.positions.flatMap((p) =>
        p.slots
          .filter((s) => s.participantName && !s.isMine && !s.isProxy)
          .map((s) => ({
            userId: `${p.team}-${p.position}-${s.slotNo}`,
            nickname: s.participantName!,
            team: p.team,
            position: p.position,
            reviewedByMe: false,
          })),
      );
      return { items, bestPlayerVotesLeft: 2 };
    },
  ],
  [
    "GET",
    "/games/:id",
    ({ params }) => {
      const g = findGame(params.id);
      if (!g) throw notFound();
      return g.detail;
    },
  ],

  /* §6 Reservations */
  [
    "GET",
    "/reservations/me",
    ({ query }): ListDto<ReservationSummaryDto> => {
      const tab = query.get("status") ?? "ongoing";
      const statuses = MY_TAB[tab] ?? MY_TAB.ongoing;
      const items = MY_RESERVATIONS.filter((r) => statuses.includes(r.status))
        .map((r) => mySummary(r.id))
        .sort((a, b) => (tab === "ongoing" ? byCreatedAsc(a, b) : byCreatedAsc(b, a)));
      return { items };
    },
  ],
  ["GET", "/reservations/:id", ({ params }) => myDetail(params.id)],

  /* §8 Notifications */
  [
    "GET",
    "/notifications/me",
    ({ query }): NotificationListDto => {
      const unreadOnly = query.get("unreadOnly") === "true";
      const items = NOTIFICATIONS.filter((n) => !unreadOnly || !n.isRead).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      return { items, unreadCount: NOTIFICATIONS.filter((n) => !n.isRead).length };
    },
  ],
];

function match(pattern: string, pathname: string): Record<string, string> | null {
  const p = pattern.split("/");
  const s = pathname.split("/");
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

/** 맞는 핸들러가 있으면 `{ data }`, 없으면 `undefined` — 그때 클라이언트는 실제 API로 요청합니다. */
export async function mockRequest(
  method: Method,
  url: string,
  body: unknown,
  session: UserRole,
): Promise<{ data: unknown } | undefined> {
  const [pathname, qs = ""] = url.split("?");
  for (const [m, pattern, handler] of ROUTES) {
    if (m !== method) continue;
    const params = match(pattern, pathname);
    if (params) return { data: await handler({ params, query: new URLSearchParams(qs), body, session }) };
  }
  return undefined;
}
