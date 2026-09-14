import { cache } from "react";
import { orUndefined, playerApi } from "@/lib/api/client";
import type { GameDetailDto, GameSummaryDto, ListDto } from "@/lib/api/dto";
import { toGame, toGameSummary } from "@/lib/api/mappers";
import type { Game, GameSummary, Level, Slot, Team } from "@/lib/types";

export type GameFilters = { region?: string; date?: string; level?: Level; hideClosed?: boolean };

/** `GET /games` — 필터는 전부 단일 선택 (§P-3). 정렬과 종료 경기 제외는 서버가 합니다. */
export async function listGames(filters: GameFilters = {}): Promise<GameSummary[]> {
  const { items } = await playerApi.get<ListDto<GameSummaryDto>>("/games", {
    ...filters,
    hideClosed: filters.hideClosed || undefined,
  });
  return items.map(toGameSummary);
}

/** `GET /games/:gameId` — 공개 API지만 용병 세션을 실어야 `isMine`이 채워집니다. 요청당 1회로 묶습니다. */
export const getGame = cache(async (id: string): Promise<Game | undefined> => {
  const dto = await orUndefined(playerApi.get<GameDetailDto>(`/games/${encodeURIComponent(id)}`));
  return dto && toGame(dto);
});

export function teamSlots(game: Game, team: Team): Slot[] {
  return game.slots.filter((s) => s.team === team);
}

/** `선공 4/11 · 후공 6/11` */
export function capacityLabel(game: Pick<GameSummary, "capacity">) {
  const { FIRST: f, SECOND: s } = game.capacity;
  return `선공 ${f.filled}/${f.total} · 후공 ${s.filled}/${s.total}`;
}

export function emptySlots(game: Game): Slot[] {
  return game.slots.filter((s) => !s.participantName);
}

/**
 * 빈 포지션 칩 — 서로 다른 포지션 최대 2개, 3개 이상이면 마지막은 `+N` (§P-3).
 * 목록 DTO의 `emptySlots`는 서버가 4개로 자르므로 `+N`은 그 안에서 센 값입니다.
 */
export function emptyChips(game: Pick<GameSummary, "emptyPositions">): string[] {
  const seen: string[] = [];
  for (const s of game.emptyPositions) {
    if (!seen.includes(s.position)) seen.push(s.position);
  }
  if (seen.length <= 2) return seen.map((p) => `${p} 모집`);
  return [`${seen[0]} 모집`, `${seen[1]} 모집`, `+${seen.length - 2}`];
}

export function hasMyReservation(game: Game) {
  return game.slots.some((s) => s.isMine);
}

/** 경기 시작 시각 이후 — A-5 `출석 체크` 노출 조건 */
export function isAttendanceOpen(game: Pick<GameSummary, "startsAt">, now = Date.now()) {
  return new Date(game.startsAt).getTime() <= now;
}
