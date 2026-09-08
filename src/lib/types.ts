import type { ReservationStatus } from "./reservation-status";

/** 선공 / 후공. 덕아웃 위치는 경기 데이터(`Game.dugout`)가 듭니다. */
export type Team = "FIRST" | "SECOND";
export const TEAMS: Team[] = ["FIRST", "SECOND"];
export const TEAM_LABEL: Record<Team, string> = { FIRST: "선공", SECOND: "후공" };

/** 참가비 티어 4종 (화면설계서 §3.1). 슬롯 → 티어 매핑은 서버 값을 씁니다. */
export type FeeTier = "PITCHER" | "CATCHER" | "FIELDER" | "DH";
export const FEE_TIERS: FeeTier[] = ["PITCHER", "CATCHER", "FIELDER", "DH"];
export const FEE_TIER_LABEL: Record<FeeTier, string> = {
  PITCHER: "투수",
  CATCHER: "포수",
  FIELDER: "야수",
  DH: "지타",
};

/** 기본 슬롯 프리셋 11개 (화면설계서 §3). */
export const POSITION_PRESET: { position: string; feeTier: FeeTier }[] = [
  { position: "선발", feeTier: "PITCHER" },
  { position: "구원", feeTier: "PITCHER" },
  { position: "포수", feeTier: "CATCHER" },
  { position: "1루", feeTier: "FIELDER" },
  { position: "2루", feeTier: "FIELDER" },
  { position: "3루", feeTier: "FIELDER" },
  { position: "유격", feeTier: "FIELDER" },
  { position: "좌익", feeTier: "FIELDER" },
  { position: "중견", feeTier: "FIELDER" },
  { position: "우익", feeTier: "FIELDER" },
  { position: "지타", feeTier: "DH" },
];

export type GameStatus = "OPEN" | "CLOSED" | "CANCELLED";

export type Slot = {
  /** `${team}-${position}` — P-5 `slot` 쿼리 값과 같습니다 (예: `선공-3루`). */
  id: string;
  team: Team;
  index: number;
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

export type Game = {
  id: string;
  venue: string;
  address: string;
  region: string;
  startsAt: string;
  durationHours: number;
  leagueName: string;
  recommendedLevel?: string;
  dugout: Record<Team, string>;
  notice?: string;
  status: GameStatus;
  fees: Record<FeeTier, number>;
  slots: Slot[];
};

export type ReservationSlot = {
  team: Team;
  position: string;
  participantName: string;
  isOwner: boolean;
  feeTier: FeeTier;
  fee: number;
};

export type ReservationHistory = { label: string; at: string; note?: string; current?: boolean };

export type Reservation = {
  id: string;
  gameId: string;
  status: ReservationStatus;
  depositorName: string;
  createdAt: string;
  expiresAt: string;
  slots: ReservationSlot[];
  history: ReservationHistory[];
  /** ATTENDED 건의 평가 여부 (P-7 「평가하기」 배지). */
  reviewed?: boolean;
};

export type NotificationType =
  | "PAYMENT_DUE_12H"
  | "PAYMENT_DUE_1H"
  | "APPROVED"
  | "REJECTED"
  | "NO_SHOW";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  reservationId?: string;
};

export type Profile = {
  nickname: string;
  region: string;
  position?: string;
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
  bank: string;
  accountNumber: string;
  accountHolder: string;
  fees: Record<FeeTier, number>;
};

/** 어드민이 보는 예약 1건 (A-5 · A-6). 닉네임보다 입금자명이 제목입니다. */
export type AdminReservation = {
  id: string;
  gameId: string;
  nickname: string;
  depositorName: string;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
  slots: ReservationSlot[];
};

export type ReviewTarget = {
  id: string;
  name: string;
  team: Team;
  position: string;
  reviewed: boolean;
};
