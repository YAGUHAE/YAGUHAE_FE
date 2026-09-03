import { GAMES } from "@/mocks/data";
import type { Game, Slot, Team } from "@/lib/types";
import { isSameDay } from "@/lib/format";

export type GameFilters = { region?: string; date?: string; level?: string; hideClosed?: boolean };

/** `GET /games` — 필터는 전부 단일 선택 (§P-3). */
export async function listGames(filters: GameFilters = {}): Promise<Game[]> {
  return GAMES.filter((g) => {
    if (filters.date && !isSameDay(g.startsAt, filters.date)) return false;
    if (filters.region && g.region !== filters.region) return false;
    if (filters.level && g.recommendedLevel !== filters.level) return false;
    if (filters.hideClosed && g.status !== "OPEN") return false;
    return true;
  }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** `GET /games/:gameId` */
export async function getGame(id: string): Promise<Game | undefined> {
  return GAMES.find((g) => g.id === id);
}

export function teamSlots(game: Game, team: Team): Slot[] {
  return game.slots.filter((s) => s.team === team);
}

export function filledCount(game: Game, team: Team) {
  const slots = teamSlots(game, team);
  return { filled: slots.filter((s) => s.participantName).length, total: slots.length };
}

/** `선공 4/11 · 후공 6/11` */
export function capacityLabel(game: Game) {
  const f = filledCount(game, "FIRST");
  const s = filledCount(game, "SECOND");
  return `선공 ${f.filled}/${f.total} · 후공 ${s.filled}/${s.total}`;
}

export function emptySlots(game: Game): Slot[] {
  return game.slots.filter((s) => !s.participantName);
}

/** 빈 포지션 칩 — 슬롯 순번이 빠른 순 최대 2개, 3개 이상이면 마지막은 `+N` (§P-3) */
export function emptyChips(game: Game): string[] {
  const empties = [...emptySlots(game)].sort((a, b) => a.index - b.index);
  const seen: string[] = [];
  for (const s of empties) {
    if (!seen.includes(s.position)) seen.push(s.position);
  }
  if (seen.length <= 2) return seen.map((p) => `${p} 모집`);
  return [`${seen[0]} 모집`, `${seen[1]} 모집`, `+${seen.length - 2}`];
}

/** 최저 참가비 — `13,000원부터` 표기용. 0원(포수)은 「부터」의 기준에서 뺍니다. */
export function minFee(game: Game) {
  const fees = Object.values(game.fees).filter((f) => f > 0);
  return fees.length ? Math.min(...fees) : 0;
}

export function hasMyReservation(game: Game) {
  return game.slots.some((s) => s.isMine);
}

/** 경기 시작 시각 이후 — A-5 `출석 체크` 노출 조건 */
export function isAttendanceOpen(game: Game, now = Date.now()) {
  return new Date(game.startsAt).getTime() <= now;
}
