/**
 * DTO → 뷰 모델. 서버 표현과 화면 표현의 차이는 전부 여기서 흡수합니다.
 * 서버가 필드를 바꾸면 이 파일만 고치고, 화면 컴포넌트는 `src/lib/types.ts`만 봅니다.
 */
import type {
  AdminReservationDto,
  ApiTeam,
  BankDto,
  GameDetailDto,
  GameReservationDto,
  GameSummaryDto,
  AdminGameSummaryDto,
  LeagueDto,
  NotificationDto,
  ParticipantsDto,
  PricedReservationSlotDto,
  ReservationDetailDto,
  ReservationGameDto,
  ReservationHistoryDto,
  ReservationSlotDto,
  ReservationSummaryDto,
  UserDetailDto,
} from "./dto";
import {
  LEVEL_LABEL,
  POSITION_FULL_LABEL,
  POSITION_LABEL,
  POSITION_PRESET,
  REJECT_REASON_LABEL,
  TEAMS,
  type AdminGameReservation,
  type AdminReservation,
  type BankAccount,
  type Game,
  type GameSummary,
  type League,
  type Notification,
  type PricedReservationSlot,
  type Profile,
  type RejectReason,
  type Reservation,
  type ReservationGame,
  type ReservationHistory,
  type ReservationSlot,
  type ReservationSummary,
  type ReviewTarget,
  type Slot,
  type Team,
  type TeamCapacity,
} from "@/lib/types";

/** 원정이 먼저 공격합니다 — 선공 = AWAY, 후공 = HOME (2026-09-11 확정). */
export const TEAM_FROM_API: Record<ApiTeam, Team> = { AWAY: "FIRST", HOME: "SECOND" };
export const TEAM_TO_API: Record<Team, ApiTeam> = { FIRST: "AWAY", SECOND: "HOME" };

const PRESET_ORDER = new Map(POSITION_PRESET.map((p, i) => [p.code, i]));

/** 서버는 날짜와 시각을 나눠 줍니다. 서울 시각으로 해석해 ISO로 합칩니다 — `gameTime`이 `HH:mm:ss`여도 됩니다. */
export function toStartsAt(gameDate: string, gameTime: string) {
  return new Date(`${gameDate}T${gameTime.slice(0, 5)}:00+09:00`).toISOString();
}

const hours = (min: number) => min / 60;

export function toBank(b: BankDto | null | undefined): BankAccount {
  return { bank: b?.bankName ?? "", accountNumber: b?.account ?? "", accountHolder: b?.holder ?? "" };
}

/* ─── 경기 ─── */

export function toGameSummary(dto: GameSummaryDto | AdminGameSummaryDto): GameSummary {
  const cap = (t: ApiTeam): TeamCapacity => ({ filled: dto.teams[t].occupied, total: dto.teams[t].capacity });
  return {
    id: dto.id,
    startsAt: toStartsAt(dto.gameDate, dto.gameTime),
    durationHours: hours(dto.durationMin),
    venue: dto.stadiumName,
    leagueName: dto.leagueName,
    region: dto.region,
    recommendedLevel: dto.recommendedLevel ? LEVEL_LABEL[dto.recommendedLevel] : undefined,
    status: dto.status,
    minFee: dto.feeRange.min,
    capacity: { FIRST: cap("AWAY"), SECOND: cap("HOME") },
    emptyPositions: dto.emptySlots.map((s) => ({ team: TEAM_FROM_API[s.team], position: POSITION_LABEL[s.position] })),
    pendingPayments: "pendingPayments" in dto ? dto.pendingPayments : undefined,
  };
}

export function toGame(dto: GameDetailDto): Game {
  const ordered = [...dto.positions].sort(
    (a, b) => (PRESET_ORDER.get(a.position) ?? 99) - (PRESET_ORDER.get(b.position) ?? 99),
  );
  const slots: Slot[] = TEAMS.flatMap((team) => {
    let index = 0;
    return ordered
      .filter((p) => TEAM_FROM_API[p.team] === team)
      .flatMap((p) =>
        [...p.slots]
          .sort((a, b) => a.slotNo - b.slotNo)
          .map((s) => ({
            id: `${team}-${p.position}-${s.slotNo}`,
            team,
            index: ++index,
            code: p.position,
            slotNo: s.slotNo,
            position: POSITION_LABEL[p.position],
            feeTier: p.feeTier,
            fee: p.participationFee,
            ...(s.participantName ? { participantName: s.participantName } : {}),
            ...(s.isMine ? { isMine: true } : {}),
            ...(s.isProxy ? { proxy: true } : {}),
          })),
      );
  });

  const capacity = (team: Team): TeamCapacity => {
    const own = slots.filter((s) => s.team === team);
    return { filled: own.filter((s) => s.participantName).length, total: own.length };
  };
  const paid = slots.map((s) => s.fee).filter((f) => f > 0);

  return {
    id: dto.id,
    leagueId: dto.leagueId,
    startsAt: toStartsAt(dto.gameDate, dto.gameTime),
    durationHours: hours(dto.durationMin),
    venue: dto.stadiumName,
    leagueName: dto.league.name,
    recommendedLevel: dto.recommendedLevel ? LEVEL_LABEL[dto.recommendedLevel] : undefined,
    status: dto.status,
    minFee: paid.length ? Math.min(...paid) : 0,
    capacity: { FIRST: capacity("FIRST"), SECOND: capacity("SECOND") },
    emptyPositions: slots.filter((s) => !s.participantName).map((s) => ({ team: s.team, position: s.position })),
    dugout: { FIRST: dto.dugout?.AWAY ?? "", SECOND: dto.dugout?.HOME ?? "" },
    notice: dto.notice ?? undefined,
    fees: dto.fees,
    slots,
    bank: toBank(dto.league.bank),
  };
}

/* ─── 예약 ─── */

function toReservationGame(dto: ReservationGameDto): ReservationGame {
  return {
    id: dto.id,
    startsAt: toStartsAt(dto.gameDate, dto.gameTime),
    venue: dto.stadiumName,
    leagueName: dto.leagueName,
    status: dto.status,
  };
}

/** 배열의 첫 자리가 신청자 본인입니다 (API 명세서 §6). */
function toReservationSlot(s: ReservationSlotDto, i: number): ReservationSlot {
  return {
    team: TEAM_FROM_API[s.team],
    code: s.position,
    position: POSITION_LABEL[s.position],
    participantName: s.participantName,
    isOwner: i === 0,
  };
}

function toPricedSlot(s: PricedReservationSlotDto, i: number): PricedReservationSlot {
  return { ...toReservationSlot(s, i), feeTier: s.feeTier, fee: s.fee };
}

export function toReservationSummary(dto: ReservationSummaryDto): ReservationSummary {
  return {
    id: dto.id,
    gameId: dto.game.id,
    status: dto.status,
    depositorName: dto.depositorName,
    createdAt: dto.createdAt,
    expiresAt: dto.expiresAt ?? undefined,
    slotCount: dto.slotCount,
    totalFee: dto.totalFee,
    slots: dto.slots.map(toReservationSlot),
    game: toReservationGame(dto.game),
    reviewed: dto.reviewed,
  };
}

export function toAdminReservation(dto: AdminReservationDto): AdminReservation {
  return { ...toReservationSummary(dto), nickname: dto.nickname };
}

export function toGameReservation(dto: GameReservationDto): AdminGameReservation {
  return { ...toAdminReservation(dto), slots: dto.slots.map(toPricedSlot) };
}

/** 이력 한 줄의 문구 — 서버는 무엇이 언제 누구에 의해 바뀌었는지만 줍니다 (API 명세서 §6). */
function historyLine(h: ReservationHistoryDto): Omit<ReservationHistory, "at" | "current"> {
  switch (h.status) {
    case "RESERVED":
      return { label: "신청함" };
    case "PAYMENT_SUBMITTED":
      return { label: "입금 완료 알림" };
    case "APPROVED":
      return { label: "주최자 확인 완료" };
    case "ATTENDED":
      return { label: "참가 완료" };
    case "EXPIRED":
      return { label: "기간 만료", note: "24시간 내 미입금" };
    case "CANCELLED":
      return { label: h.actor === "PLAYER" ? "취소함" : "경기 취소로 취소됨" };
    case "REJECTED":
      return { label: "거절됨", note: h.reason ? `사유: ${REJECT_REASON_LABEL[h.reason]}` : undefined };
    case "NO_SHOW":
      return { label: "노쇼 처리" };
  }
}

function toHistory(dto: ReservationDetailDto): ReservationHistory[] {
  const lines: ReservationHistory[] = dto.history.map((h) => ({ ...historyLine(h), at: h.at }));
  const last = lines.at(-1);
  if (!last) return lines;
  // 입금 알림 뒤에는 "주최자 확인 중"이라는 아직 일어나지 않은 단계가 현재 상태입니다
  if (dto.status === "PAYMENT_SUBMITTED") return [...lines, { label: "주최자 확인 중", at: last.at, note: "대기 중", current: true }];
  if (dto.status === "APPROVED") last.note = "확정";
  last.current = true;
  return lines;
}

export function toReservation(dto: ReservationDetailDto): Reservation {
  return {
    id: dto.id,
    gameId: dto.game.id,
    status: dto.status,
    depositorName: dto.depositorName,
    createdAt: dto.createdAt,
    expiresAt: dto.expiresAt ?? undefined,
    slotCount: dto.slotCount,
    totalFee: dto.totalFee,
    slots: dto.slots.map(toPricedSlot),
    rejectReason: dto.rejectReason ?? undefined,
    history: toHistory(dto),
    reviewed: dto.reviewed,
    game: {
      id: dto.game.id,
      startsAt: toStartsAt(dto.game.gameDate, dto.game.gameTime),
      venue: dto.game.stadiumName,
      leagueName: dto.game.leagueName,
      status: dto.game.status,
      bank: toBank(dto.game.bank),
      notice: dto.game.notice ?? undefined,
    },
  };
}

/* ─── 알림 ─── */

const REJECT_TITLE: Record<RejectReason, string> = {
  NOT_DEPOSITED: "입금이 확인되지 않아 거절됐어요",
  AMOUNT_MISMATCH: "입금 금액이 맞지 않아 거절됐어요",
  DUPLICATE: "중복 신청으로 거절됐어요",
  OTHER: "예약이 거절됐어요",
};

/** 문구는 서버가 주지 않습니다 — 카피 수정에 서버 배포가 필요 없게 하려는 명세의 결정입니다 (API 명세서 §8). */
function notificationCopy(dto: NotificationDto): { title: string; description: string } {
  switch (dto.type) {
    case "EXPIRING_1H":
      return { title: "입금 마감이 1시간 남았어요", description: "입금하지 않으면 예약이 자동으로 취소돼요" };
    case "EXPIRING_12H":
      return { title: "입금 마감이 12시간 남았어요", description: "입금 후 「입금했어요」를 눌러주세요" };
    case "APPROVED":
      return { title: "예약이 확정됐어요", description: "경기 당일 집합 시간을 확인해주세요" };
    case "REJECTED":
      return {
        title: REJECT_TITLE[dto.reason ?? "OTHER"],
        description: dto.reason ? `사유: ${REJECT_REASON_LABEL[dto.reason]}` : "예약 상세에서 확인해주세요",
      };
    case "NO_SHOW_MARKED":
      return { title: "노쇼로 처리됐어요", description: "노쇼가 2회 누적되면 신청이 제한돼요" };
    case "WAITLIST_PROMOTED":
      return { title: "기다리던 자리가 났어요", description: "지금 신청할 수 있어요" };
  }
}

export function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: dto.type,
    ...notificationCopy(dto),
    createdAt: dto.createdAt,
    read: dto.isRead,
    reservationId: dto.reservationId ?? undefined,
    gameId: dto.gameId ?? undefined,
  };
}

/* ─── 사용자 · 리그 · 평가 ─── */

export function toProfile(dto: UserDetailDto): Profile {
  return {
    nickname: dto.nickname,
    region: dto.region ?? "",
    position: dto.primaryPosition ? POSITION_FULL_LABEL[dto.primaryPosition] : undefined,
    level: dto.selfLevel ? LEVEL_LABEL[dto.selfLevel] : "",
    profileUrl: dto.gamewonUrl ?? dto.uniqueplayUrl ?? undefined,
    noShowCount: dto.noShowCount,
    isSuspended: dto.isSuspended,
  };
}

export function toLeague(dto: LeagueDto): League {
  return {
    id: dto.id,
    name: dto.name,
    region: dto.region,
    intro: dto.intro ?? undefined,
    venue: dto.stadiumName,
    bankId: dto.bank?.id,
    ...toBank(dto.bank),
    fees: dto.defaultFees,
  };
}

export function toReviewTargets(dto: ParticipantsDto): ReviewTarget[] {
  return dto.items.map((p) => ({
    id: p.userId,
    name: p.nickname,
    team: TEAM_FROM_API[p.team],
    position: POSITION_LABEL[p.position],
    reviewed: p.reviewedByMe,
  }));
}
