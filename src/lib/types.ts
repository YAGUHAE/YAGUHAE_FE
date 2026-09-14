/**
 * 화면이 쓰는 뷰 모델. 서버 DTO(`src/lib/api/dto.ts`)와 모양이 다르고, 둘 사이는 `src/lib/api/mappers.ts`가 잇습니다.
 * enum 값(`Position` · `Level` · `FeeTier` 등)은 서버와 같은 문자열을 그대로 씁니다 — 라벨만 여기서 붙입니다.
 */
import type { ReservationStatus } from "./reservation-status";

/** 선공 / 후공. 서버의 `AWAY`/`HOME`과의 대응은 매퍼 한 곳에만 있습니다. 덕아웃 위치는 `Game.dugout`이 듭니다. */
export type Team = "FIRST" | "SECOND";
export const TEAMS: Team[] = ["FIRST", "SECOND"];
export const TEAM_LABEL: Record<Team, string> = { FIRST: "선공", SECOND: "후공" };

/** 서버 `Position` enum과 1:1 (API 명세서 §4). */
export type Position = "SP" | "RP" | "C" | "FIRST" | "SECOND" | "THIRD" | "SS" | "LF" | "CF" | "RF" | "DH";

/** 참가비 티어 4종 (화면설계서 §3.1). 포지션 → 티어 매핑은 서버 값(`feeTier`)을 씁니다. */
export type FeeTier = "PITCHER" | "CATCHER" | "FIELDER" | "DH";
export const FEE_TIERS: FeeTier[] = ["PITCHER", "CATCHER", "FIELDER", "DH"];
export const FEE_TIER_LABEL: Record<FeeTier, string> = {
  PITCHER: "투수",
  CATCHER: "포수",
  FIELDER: "야수",
  DH: "지타",
};

/**
 * 기본 슬롯 프리셋 11개 (화면설계서 §3). 순서가 곧 보드의 줄 순서입니다.
 * `feeTier`는 A-4에서 새 경기를 짤 때의 표시용이고, 저장된 경기는 서버가 준 값을 씁니다.
 */
export const POSITION_PRESET: { code: Position; position: string; feeTier: FeeTier }[] = [
  { code: "SP", position: "선발", feeTier: "PITCHER" },
  { code: "RP", position: "구원", feeTier: "PITCHER" },
  { code: "C", position: "포수", feeTier: "CATCHER" },
  { code: "FIRST", position: "1루", feeTier: "FIELDER" },
  { code: "SECOND", position: "2루", feeTier: "FIELDER" },
  { code: "THIRD", position: "3루", feeTier: "FIELDER" },
  { code: "SS", position: "유격", feeTier: "FIELDER" },
  { code: "LF", position: "좌익", feeTier: "FIELDER" },
  { code: "CF", position: "중견", feeTier: "FIELDER" },
  { code: "RF", position: "우익", feeTier: "FIELDER" },
  { code: "DH", position: "지타", feeTier: "DH" },
];

/** 보드·카드용 짧은 라벨 `3루` */
export const POSITION_LABEL = Object.fromEntries(POSITION_PRESET.map((p) => [p.code, p.position])) as Record<
  Position,
  string
>;

/** 프로필·선택지용 긴 라벨 `3루수` */
export const POSITION_FULL_LABEL: Record<Position, string> = {
  SP: "선발투수",
  RP: "구원투수",
  C: "포수",
  FIRST: "1루수",
  SECOND: "2루수",
  THIRD: "3루수",
  SS: "유격수",
  LF: "좌익수",
  CF: "중견수",
  RF: "우익수",
  DH: "지명타자",
};

/** 급수 — 제한이 아니라 정보입니다 (화면설계서 §3.3). 서버 `LevelEnum`과 1:1. */
export type Level = "L1" | "L2" | "L3" | "L4";
export const LEVELS: Level[] = ["L1", "L2", "L3", "L4"];
export const LEVEL_LABEL: Record<Level, string> = { L1: "1부", L2: "2부", L3: "3부", L4: "4부" };

export type GameStatus = "OPEN" | "CLOSED" | "CANCELLED";

/** 거절 사유 4종 — 신청자에게 그대로 전달됩니다 (API 명세서 §6). */
export type RejectReason = "NOT_DEPOSITED" | "AMOUNT_MISMATCH" | "DUPLICATE" | "OTHER";
export const REJECT_REASON_LABEL: Record<RejectReason, string> = {
  NOT_DEPOSITED: "미입금",
  AMOUNT_MISMATCH: "금액 불일치",
  DUPLICATE: "중복 신청",
  OTHER: "기타",
};

export type BankAccount = { bank: string; accountNumber: string; accountHolder: string };

export type Slot = {
  /** `${team}-${code}-${slotNo}` — P-5 `slot` 쿼리 값과 같습니다 (예: `FIRST-THIRD-1`). */
  id: string;
  team: Team;
  /** 팀 안에서의 줄 번호 (1부터). 프리셋 순서 → 같은 포지션 안의 `slotNo` 순. */
  index: number;
  code: Position;
  slotNo: number;
  position: string;
  feeTier: FeeTier;
  fee: number;
  /** 활성 예약이 있으면 상태와 무관하게 이름이 내려옵니다 (§P-4 노출 원칙). */
  participantName?: string;
  /** 내 예약에 속한 슬롯 (대리 신청분 포함). */
  isMine?: boolean;
  /** 대리 신청분 — A-7에서 `대리` 표시. */
  proxy?: boolean;
};

export type TeamCapacity = { filled: number; total: number };

/** 목록 카드 한 장 (P-3 · A-3 · A-2). 상세를 열지 않고 카드에서 보여야 하는 값만 있습니다. */
export type GameSummary = {
  id: string;
  startsAt: string;
  durationHours: number;
  venue: string;
  leagueName: string;
  region?: string;
  /** 라벨(`3부`)로 담깁니다. 없으면 급수 무관. */
  recommendedLevel?: string;
  status: GameStatus;
  /** 0원(포수)을 뺀 최저 참가비 — `13,000원부터` */
  minFee: number;
  capacity: Record<Team, TeamCapacity>;
  /** 빈 자리 — 서버가 상한(4개)을 두고 내려줍니다. 칩은 `emptyChips()`로 만듭니다. */
  emptyPositions: { team: Team; position: string }[];
  /** A-3 전용 — 입금 미처리 건수 */
  pendingPayments?: number;
};

export type Game = GameSummary & {
  leagueId: string;
  /** 명세에 아직 없는 값입니다. 없으면 P-4가 주소 줄을 그리지 않습니다. */
  address?: string;
  /** 비어 있으면 팀 라벨에 괄호를 붙이지 않습니다. */
  dugout: Record<Team, string>;
  notice?: string;
  fees: Record<FeeTier, number>;
  slots: Slot[];
  bank: BankAccount;
};

export type ReservationSlot = {
  team: Team;
  code: Position;
  position: string;
  participantName: string;
  /** 예약의 첫 자리가 신청자 본인입니다 (API 명세서 §6 — 배열 순서가 의미를 가짐). */
  isOwner: boolean;
};

/** 금액까지 있는 자리 — 예약 상세 · A-5에서만 내려옵니다. */
export type PricedReservationSlot = ReservationSlot & { feeTier: FeeTier; fee: number };

export type ReservationHistory = { label: string; at: string; note?: string; current?: boolean };

/** 예약 카드에 조인돼 오는 경기 정보 — 카드마다 경기를 따로 조회하지 않습니다. */
export type ReservationGame = {
  id: string;
  startsAt: string;
  venue: string;
  leagueName: string;
  status: GameStatus;
};

/** 목록 한 줄 (P-7 · A-6 · A-2). */
export type ReservationSummary = {
  id: string;
  gameId: string;
  status: ReservationStatus;
  depositorName: string;
  createdAt: string;
  /** 입금 대기(`RESERVED`)가 아니면 없을 수 있습니다. */
  expiresAt?: string;
  slotCount: number;
  totalFee: number;
  slots: ReservationSlot[];
  game: ReservationGame;
  /** ATTENDED 건의 평가 여부 (P-7 「평가하기」 배지). */
  reviewed: boolean;
};

/** 예약 상세 (P-6 · P-8 · P-9). */
export type Reservation = Omit<ReservationSummary, "slots" | "game"> & {
  slots: PricedReservationSlot[];
  rejectReason?: RejectReason;
  history: ReservationHistory[];
  game: ReservationGame & { bank: BankAccount; notice?: string };
};

/** 어드민이 보는 예약 1건 (A-6 · A-2). 닉네임보다 입금자명이 제목입니다. */
export type AdminReservation = ReservationSummary & { nickname: string };

/** A-5 — 경기 안에서 자리별 금액까지 펼쳐 봅니다. */
export type AdminGameReservation = Omit<AdminReservation, "slots"> & { slots: PricedReservationSlot[] };

/** 서버 `NotificationType`과 1:1. 문구는 서버가 주지 않아 매퍼가 만듭니다 (API 명세서 §8). */
export type NotificationType =
  | "EXPIRING_12H"
  | "EXPIRING_1H"
  | "APPROVED"
  | "REJECTED"
  | "NO_SHOW_MARKED"
  | "WAITLIST_PROMOTED";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  reservationId?: string;
  gameId?: string;
};

export type Profile = {
  nickname: string;
  region: string;
  /** 라벨(`유격수`) */
  position?: string;
  /** 라벨(`3부`) */
  level: string;
  profileUrl?: string;
  noShowCount: number;
  isSuspended: boolean;
};

export type League = {
  id: string;
  name: string;
  region: string;
  intro?: string;
  venue: string;
  /** 계좌가 아직 없으면 비어 있습니다 — A-4가 저장을 막고 A-8로 보냅니다. */
  bankId?: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  fees: Record<FeeTier, number>;
};

export type ReviewTarget = {
  id: string;
  name: string;
  team: Team;
  position: string;
  reviewed: boolean;
};
