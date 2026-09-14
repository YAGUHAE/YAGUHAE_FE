/**
 * 서버 DTO — `YAGUHAE_BE/docs/API 명세서.md` v6.1을 손으로 옮긴 것입니다.
 * Swagger에 도메인 DTO가 올라오면 생성 타입으로 바꿉니다. 화면은 이 타입을 직접 쓰지 않고 `mappers.ts`를 거칩니다.
 */
import type { ReservationStatus } from "@/lib/reservation-status";
import type { FeeTier, GameStatus, Level, NotificationType, Position, RejectReason } from "@/lib/types";

/** 경기 내 편. 화면의 선공/후공과는 `mappers.ts`의 `TEAM_FROM_API`로만 대응시킵니다. */
export type ApiTeam = "HOME" | "AWAY";
export type UserRole = "PLAYER" | "HOST";
export type HistoryActor = "PLAYER" | "HOST" | "SYSTEM";

/* ─── §0 봉투 ─── */

export type ApiSuccess<T> = { success: true; data: T; timestamp: string };
export type ApiFailure = {
  success: false;
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  detail?: Record<string, unknown>;
};
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type ListDto<T> = { items: T[] };
export type CursorListDto<T> = ListDto<T> & { nextCursor: string | null };

/* ─── §1 Auth ─── */

export type UserSummaryDto = { id: string; role: UserRole; nickname: string; profileCompleted: boolean };

export type AuthTokenResponseDto = {
  accessToken: string;
  refreshToken: string;
  user: UserSummaryDto;
  leagueId: string | null;
};

/* ─── §2 Users ─── */

export type UserDetailDto = {
  id: string;
  role: UserRole;
  nickname: string;
  region: string | null;
  primaryPosition: Position | null;
  selfLevel: Level | null;
  gamewonUrl: string | null;
  uniqueplayUrl: string | null;
  noShowCount: number;
  isSuspended: boolean;
  profileCompleted: boolean;
};

export type UpdateMeRequest = Partial<{
  nickname: string;
  region: string;
  primaryPosition: Position;
  selfLevel: Level;
  gamewonUrl: string;
  uniqueplayUrl: string;
}>;

/* ─── §3 Banks ─── */

export type BankDto = { id: string; bankName: string; account: string; holder: string };

/* ─── §4 Leagues ─── */

export type LeagueDto = {
  id: string;
  hostId: string;
  name: string;
  region: string;
  stadiumName: string;
  intro: string | null;
  defaultFees: Record<FeeTier, number>;
  /** 계좌를 아직 등록하지 않은 리그 */
  bank: BankDto | null;
  createdAt: string;
};

export type LeagueDashboardDto = {
  pendingPayments: number;
  openGames: number;
  imminentGames: number;
  upcoming: GameSummaryDto[];
  pendingPreview: ReservationSummaryDto[];
};

/* ─── §5 Games ─── */

export type TeamCountDto = { occupied: number; capacity: number };

export type GameSummaryDto = {
  id: string;
  gameDate: string;
  gameTime: string;
  durationMin: number;
  stadiumName: string;
  leagueName: string;
  region: string;
  recommendedLevel: Level | null;
  status: GameStatus;
  feeRange: { min: number; max: number };
  teams: Record<ApiTeam, TeamCountDto>;
  emptySlots: { team: ApiTeam; position: Position }[];
};

export type AdminGameSummaryDto = GameSummaryDto & { pendingPayments: number };

export type GameSlotDto = {
  slotNo: number;
  participantName: string | null;
  reservationId: string | null;
  isMine: boolean;
  isProxy: boolean;
};

export type GamePositionDto = {
  team: ApiTeam;
  position: Position;
  feeTier: FeeTier;
  capacity: number;
  occupiedCount: number;
  remaining: number;
  participationFee: number;
  slots: GameSlotDto[];
};

export type GameDetailDto = {
  id: string;
  leagueId: string;
  gameDate: string;
  gameTime: string;
  durationMin: number;
  recommendedLevel: Level | null;
  stadiumName: string;
  notice: string | null;
  dugout: Record<ApiTeam, string> | null;
  feeRange: { min: number; max: number };
  fees: Record<FeeTier, number>;
  status: GameStatus;
  league: { id: string; name: string; stadiumName: string; bank: BankDto };
  positions: GamePositionDto[];
};

export type AdminGameStatusQuery = "open" | "upcoming" | "ended";

/* ─── §6 Reservations ─── */

export type ReservationSlotDto = { team: ApiTeam; position: Position; participantName: string };

export type PricedReservationSlotDto = ReservationSlotDto & { slotNo: number; feeTier: FeeTier; fee: number };

export type ReservationGameDto = {
  id: string;
  gameDate: string;
  gameTime: string;
  stadiumName: string;
  leagueName: string;
  status: GameStatus;
};

export type ReservationSummaryDto = {
  id: string;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string | null;
  depositorName: string;
  slotCount: number;
  totalFee: number;
  slots: ReservationSlotDto[];
  game: ReservationGameDto;
  reviewed: boolean;
};

export type AdminReservationDto = ReservationSummaryDto & { nickname: string };

/**
 * `GET /games/:gameId/reservations` (A-5). 명세서가 응답 형태를 정하지 않아, A-5가 자리별 금액을 펼쳐 보는 데
 * 필요한 형태로 가정했습니다 — BE 확인 필요.
 */
export type GameReservationDto = Omit<AdminReservationDto, "slots"> & { slots: PricedReservationSlotDto[] };

export type ReservationHistoryDto = {
  status: ReservationStatus;
  at: string;
  actor: HistoryActor;
  reason?: RejectReason;
};

export type ReservationDetailDto = Omit<ReservationSummaryDto, "slots" | "game"> & {
  slots: PricedReservationSlotDto[];
  rejectReason: RejectReason | null;
  history: ReservationHistoryDto[];
  game: GameSummaryDto & { bank: BankDto; notice: string | null };
};

export type MyReservationStatusQuery = "ongoing" | "done" | "closed";
export type LeagueReservationStatusQuery = "pending" | "done";

/* ─── §7 Evaluations ─── */

export type ParticipantsDto = {
  items: { userId: string; nickname: string; team: ApiTeam; position: Position; reviewedByMe: boolean }[];
  bestPlayerVotesLeft: number;
};

/* ─── §8 Notifications ─── */

export type NotificationDto = {
  id: string;
  type: NotificationType;
  reservationId: string | null;
  gameId: string | null;
  reason: RejectReason | null;
  isRead: boolean;
  sendStatus: "PENDING" | "SENT" | "FAILED";
  createdAt: string;
};

export type NotificationListDto = ListDto<NotificationDto> & { unreadCount: number };
