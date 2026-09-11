/**
 * 목 모드(`API_MOCK=1`)의 원본 데이터 — **API 명세서 v6.1의 DTO 모양 그대로**입니다.
 * 화면은 이 파일을 직접 import하지 않고, `handlers.ts`가 경로별로 응답해 매퍼를 거칩니다.
 * 날짜는 오늘 기준 상대값으로 만들어 P-3 날짜 스트립·P-6 카운트다운이 항상 살아 있게 합니다.
 */
import type {
  ApiTeam,
  BankDto,
  GameDetailDto,
  GamePositionDto,
  GameReservationDto,
  LeagueDto,
  NotificationDto,
  PricedReservationSlotDto,
  ReservationDetailDto,
  ReservationHistoryDto,
  UserDetailDto,
} from "@/lib/api/dto";
import type { ReservationStatus } from "@/lib/reservation-status";
import { toDateKey } from "@/lib/format";
import { POSITION_PRESET, type FeeTier, type Position } from "@/lib/types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** 오늘(로컬) 00:00 기준 `dayOffset`일 뒤 `hour:minute`의 ISO 문자열 */
export function at(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute);
  return d.toISOString();
}

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * HOUR).toISOString();
}

/** 서울 기준 오늘에서 `dayOffset`일 뒤의 `YYYY-MM-DD` — 서버의 `gameDate` */
function kstDate(dayOffset: number) {
  return toDateKey(new Date(Date.now() + dayOffset * DAY));
}

export const LEAGUE_FEES: Record<FeeTier, number> = {
  PITCHER: 13000,
  CATCHER: 0,
  FIELDER: 17000,
  DH: 13000,
};

export const BANK: BankDto = { id: "b1", bankName: "국민은행", account: "123456-01-987654", holder: "상암리틀리그" };

export const LEAGUE: LeagueDto = {
  id: "l1",
  hostId: "h1",
  name: "상암 리틀리그",
  region: "서울 마포구",
  stadiumName: "상암 유소년 야구장",
  intro: "매주 금요일 저녁 상암에서 모이는 사회인 리그입니다.",
  defaultFees: LEAGUE_FEES,
  bank: BANK,
  createdAt: at(-90, 12),
};

/** 목 모드에서 로그인한 용병 */
export const ME: UserDetailDto = {
  id: "u-me",
  role: "PLAYER",
  nickname: "야구해123",
  region: "서울 송파구",
  primaryPosition: "SS",
  selfLevel: "L3",
  gamewonUrl: null,
  uniqueplayUrl: null,
  noShowCount: 0,
  isSuspended: false,
  profileCompleted: true,
};

const _ = null;

/** 팀 11자리. `names[i]`가 있으면 찬 자리. `mine`·`proxy` 인덱스로 표시를 겁니다. */
function team(
  t: ApiTeam,
  fees: Record<FeeTier, number>,
  names: (string | null)[],
  opts: { mine?: number[]; proxy?: number[] } = {},
): GamePositionDto[] {
  return POSITION_PRESET.map((p, i) => {
    const name = names[i];
    return {
      team: t,
      position: p.code,
      feeTier: p.feeTier,
      capacity: 1,
      occupiedCount: name ? 1 : 0,
      remaining: name ? 0 : 1,
      participationFee: fees[p.feeTier],
      slots: [
        {
          slotNo: 1,
          participantName: name,
          reservationId: name ? `ext-${t}-${i}` : null,
          isMine: Boolean(opts.mine?.includes(i)),
          isProxy: Boolean(opts.proxy?.includes(i)),
        },
      ],
    };
  });
}

function game(
  init: Omit<GameDetailDto, "leagueId" | "durationMin" | "feeRange" | "league" | "dugout" | "notice"> & {
    notice?: string;
  },
): GameDetailDto {
  const paid = init.positions.map((p) => p.participationFee).filter((f) => f > 0);
  return {
    leagueId: LEAGUE.id,
    durationMin: 120,
    dugout: { AWAY: "3루 덕아웃", HOME: "1루 덕아웃" },
    notice: null,
    ...init,
    feeRange: { min: Math.min(...paid), max: Math.max(...paid) },
    league: { id: LEAGUE.id, name: LEAGUE.name, stadiumName: LEAGUE.stadiumName, bank: BANK },
  };
}

const G3_FEES = { ...LEAGUE_FEES, FIELDER: 15000, PITCHER: 15000 };

/** 경기 상세 + 명세에 없는 목 전용 값(`region` — 목록 DTO에만 있음). */
export const GAMES: { detail: GameDetailDto; region: string }[] = [
  {
    region: "서울 마포구",
    detail: game({
      id: "g1",
      gameDate: kstDate(0),
      gameTime: "19:00",
      recommendedLevel: "L3",
      stadiumName: "상암 유소년 야구장",
      notice: "주차는 서문 이용, 18:40 집합",
      fees: LEAGUE_FEES,
      status: "OPEN",
      positions: [
        ...team("AWAY", LEAGUE_FEES, ["김도현", _, _, "박서준", "이준호", _, "최민수", _, "정우성", _, _]),
        ...team("HOME", LEAGUE_FEES, ["최민식", "송강호", _, _, "김태리", "유해진", _, "전도연", _, _, "마동석"]),
      ],
    }),
  },
  {
    region: "서울 구로구",
    detail: game({
      id: "g2",
      gameDate: kstDate(0),
      gameTime: "21:00",
      recommendedLevel: null,
      stadiumName: "고척 스카이돔 보조구장",
      fees: LEAGUE_FEES,
      status: "OPEN",
      positions: [
        ...team("AWAY", LEAGUE_FEES, ["박지훈", "한지민", "이한별", "오정세", "류승룡", "김혜수", "조진웅", _, "김고은", "이병헌", _]),
        ...team("HOME", LEAGUE_FEES, ["김윤석", "하정우", "이정재", "정재영", "황정민", "조인성", "천우희", "박보영", "손예진", "공유", "이제훈"]),
      ],
    }),
  },
  {
    region: "서울 양천구",
    detail: game({
      id: "g3",
      gameDate: kstDate(1),
      gameTime: "14:00",
      recommendedLevel: "L2",
      stadiumName: "목동 야구장 2구장",
      fees: G3_FEES,
      status: "CLOSED",
      positions: [
        ...team("AWAY", G3_FEES, ["강동원", "김우빈", "박서준", "송중기", "유아인", "이도현", "임시완", "지창욱", "차은우", "최우식", "변요한"]),
        ...team("HOME", G3_FEES, ["김수현", "남주혁", "박보검", "서강준", "안효섭", "여진구", "이종석", "장기용", "정해인", "주지훈", "현빈"]),
      ],
    }),
  },
  {
    region: "서울 송파구",
    detail: game({
      id: "g4",
      gameDate: kstDate(1),
      gameTime: "10:00",
      recommendedLevel: "L4",
      stadiumName: "잠실 학생야구장",
      fees: LEAGUE_FEES,
      status: "OPEN",
      positions: [
        ...team("AWAY", LEAGUE_FEES, [_, "야구해123", "김민재", _, _, "이서준", _, _, _, _, _], { mine: [1, 2, 5], proxy: [2, 5] }),
        ...team("HOME", LEAGUE_FEES, ["손흥민", _, _, "이강인", _, _, "황희찬", _, _, _, _], { proxy: [3, 6] }),
      ],
    }),
  },
  {
    region: "서울 마포구",
    detail: game({
      id: "g5",
      gameDate: kstDate(-6),
      gameTime: "19:00",
      recommendedLevel: "L3",
      stadiumName: "상암 유소년 야구장",
      fees: LEAGUE_FEES,
      status: "CLOSED",
      positions: [
        ...team("AWAY", LEAGUE_FEES, ["홍길동", "정우성", "김철수", "박민수", "이영희", "최민식", "송강호", "김태리", "유해진", "전도연", "마동석"], { proxy: [1, 3] }),
        ...team("HOME", LEAGUE_FEES, ["최민식", "송강호", "김태리", "유해진", "전도연", "마동석", "홍길동", "정우성", "김철수", "박민수", "야구해123"], { proxy: [7], mine: [10] }),
      ],
    }),
  },
  {
    region: "서울 마포구",
    detail: game({
      id: "g6",
      gameDate: kstDate(7),
      gameTime: "19:00",
      recommendedLevel: "L3",
      stadiumName: "상암 유소년 야구장",
      fees: LEAGUE_FEES,
      status: "OPEN",
      positions: [
        ...team("AWAY", LEAGUE_FEES, ["김도현", _, _, _, _, _, _, _, _, _, _]),
        ...team("HOME", LEAGUE_FEES, [_, _, _, _, _, _, _, _, _, _, _]),
      ],
    }),
  },
];

export function findGame(id: string) {
  return GAMES.find((g) => g.detail.id === id);
}

const LABEL_TO_CODE = Object.fromEntries(POSITION_PRESET.map((p) => [p.position, p.code])) as Record<string, Position>;

/** 예약 자리 한 줄 — `position`은 보드 라벨(`3루`)로 적고 코드로 바꿉니다. */
function rs(t: ApiTeam, position: string, participantName: string): PricedReservationSlotDto {
  const preset = POSITION_PRESET.find((p) => p.position === position)!;
  return {
    team: t,
    position: LABEL_TO_CODE[position],
    slotNo: 1,
    participantName,
    feeTier: preset.feeTier,
    fee: LEAGUE_FEES[preset.feeTier],
  };
}

function h(status: ReservationStatus, at: string, extra: Partial<ReservationHistoryDto> = {}): ReservationHistoryDto {
  const actor = status === "RESERVED" || status === "PAYMENT_SUBMITTED" || status === "CANCELLED" ? "PLAYER" : status === "EXPIRED" ? "SYSTEM" : "HOST";
  return { status, at, actor, ...extra };
}

type MyReservationSeed = Omit<ReservationDetailDto, "game" | "slotCount" | "totalFee" | "rejectReason" | "reviewed"> & {
  gameId: string;
  rejectReason?: ReservationDetailDto["rejectReason"];
  reviewed?: boolean;
};

/** 목 모드의 "내 예약" — 상세 DTO에서 목록 DTO를 파생합니다(`handlers.ts`). */
export const MY_RESERVATIONS: MyReservationSeed[] = [
  {
    id: "r1",
    gameId: "g4",
    status: "RESERVED",
    depositorName: "야구해123",
    createdAt: hoursFromNow(-0.3),
    expiresAt: hoursFromNow(23.7),
    slots: [rs("AWAY", "구원", "야구해123"), rs("AWAY", "포수", "김민재"), rs("AWAY", "3루", "이서준")],
    history: [h("RESERVED", hoursFromNow(-0.3))],
  },
  {
    id: "r2",
    gameId: "g2",
    status: "PAYMENT_SUBMITTED",
    depositorName: "야구해123",
    createdAt: hoursFromNow(-20),
    expiresAt: hoursFromNow(4),
    slots: [rs("AWAY", "좌익", "야구해123")],
    history: [h("RESERVED", hoursFromNow(-20)), h("PAYMENT_SUBMITTED", hoursFromNow(-19.6))],
  },
  {
    id: "r3",
    gameId: "g3",
    status: "APPROVED",
    depositorName: "야구해123",
    createdAt: at(-3, 21, 10),
    expiresAt: null,
    slots: [rs("AWAY", "3루", "야구해123")],
    history: [h("RESERVED", at(-3, 21, 10)), h("PAYMENT_SUBMITTED", at(-3, 21, 32)), h("APPROVED", at(-2, 9, 5))],
  },
  {
    id: "r4",
    gameId: "g5",
    status: "ATTENDED",
    depositorName: "야구해123",
    createdAt: at(-9, 20, 0),
    expiresAt: null,
    slots: [rs("HOME", "지타", "야구해123")],
    history: [
      h("RESERVED", at(-9, 20, 0)),
      h("PAYMENT_SUBMITTED", at(-9, 20, 14)),
      h("APPROVED", at(-8, 10, 2)),
      h("ATTENDED", at(-6, 21, 30)),
    ],
    reviewed: false,
  },
  {
    id: "r5",
    gameId: "g6",
    status: "EXPIRED",
    depositorName: "야구해123",
    createdAt: at(-15, 12, 0),
    expiresAt: at(-14, 12, 0),
    slots: [rs("HOME", "유격", "야구해123")],
    history: [h("RESERVED", at(-15, 12, 0)), h("EXPIRED", at(-14, 12, 0))],
  },
  {
    id: "r6",
    gameId: "g3",
    status: "REJECTED",
    depositorName: "야구해123",
    createdAt: at(-20, 18, 0),
    expiresAt: null,
    slots: [rs("HOME", "1루", "야구해123")],
    history: [
      h("RESERVED", at(-20, 18, 0)),
      h("PAYMENT_SUBMITTED", at(-20, 18, 40)),
      h("REJECTED", at(-19, 9, 12), { reason: "NOT_DEPOSITED" }),
    ],
    rejectReason: "NOT_DEPOSITED",
  },
];

export const NOTIFICATIONS: NotificationDto[] = [
  { id: "n1", type: "EXPIRING_1H", reservationId: "r1", gameId: "g4", reason: null, isRead: false, sendStatus: "SENT", createdAt: hoursFromNow(-1) },
  { id: "n2", type: "APPROVED", reservationId: "r3", gameId: "g3", reason: null, isRead: false, sendStatus: "SENT", createdAt: hoursFromNow(-3) },
  { id: "n3", type: "REJECTED", reservationId: "r6", gameId: "g3", reason: "NOT_DEPOSITED", isRead: true, sendStatus: "SENT", createdAt: hoursFromNow(-30) },
  { id: "n4", type: "EXPIRING_12H", reservationId: "r1", gameId: "g4", reason: null, isRead: true, sendStatus: "SENT", createdAt: hoursFromNow(-50) },
];

type LeagueReservationSeed = Omit<GameReservationDto, "game" | "slotCount" | "totalFee" | "reviewed"> & { gameId: string };

function ar(
  id: string,
  gameId: string,
  nickname: string,
  depositorName: string,
  status: ReservationStatus,
  createdAt: string,
  expiresAt: string,
  slots: PricedReservationSlotDto[],
): LeagueReservationSeed {
  const pending = status === "RESERVED" || status === "PAYMENT_SUBMITTED";
  return { id, gameId, nickname, depositorName, status, createdAt, expiresAt: pending ? expiresAt : null, slots };
}

/** 리그 전체 예약 (A-5 · A-6 · A-2). */
export const LEAGUE_RESERVATIONS: LeagueReservationSeed[] = [
  // g1 — 선공
  ar("ar1", "g1", "도현", "김도현", "APPROVED", at(-4, 20, 2), at(-3, 20, 2), [rs("AWAY", "선발", "김도현")]),
  ar("ar2", "g1", "서준", "박서준", "PAYMENT_SUBMITTED", at(-1, 21, 10), hoursFromNow(2), [rs("AWAY", "1루", "박서준"), rs("AWAY", "2루", "이준호")]),
  ar("ar3", "g1", "민수", "최민수", "RESERVED", hoursFromNow(-23.3), hoursFromNow(0.7), [rs("AWAY", "유격", "최민수")]),
  ar("ar4", "g1", "우성", "정우성", "PAYMENT_SUBMITTED", at(-1, 22, 40), hoursFromNow(5), [rs("AWAY", "중견", "정우성")]),
  // g1 — 후공
  ar("ar5", "g1", "민식", "최민식", "APPROVED", at(-5, 9, 30), at(-4, 9, 30), [rs("HOME", "선발", "최민식")]),
  ar("ar6", "g1", "강호", "송강호", "APPROVED", at(-5, 11, 0), at(-4, 11, 0), [rs("HOME", "구원", "송강호")]),
  ar("ar7", "g1", "태리", "김태리", "APPROVED", at(-4, 15, 22), at(-3, 15, 22), [rs("HOME", "2루", "김태리"), rs("HOME", "3루", "유해진")]),
  ar("ar8", "g1", "도연", "전도연", "RESERVED", hoursFromNow(-3), hoursFromNow(21), [rs("HOME", "좌익", "전도연")]),
  ar("ar9", "g1", "동석", "마동석", "PAYMENT_SUBMITTED", at(-1, 23, 5), hoursFromNow(6), [rs("HOME", "지타", "마동석")]),
  ar("ar10", "g1", "yoon", "윤지호", "REJECTED", at(-3, 13, 0), at(-2, 13, 0), [rs("HOME", "우익", "윤지호")]),
  // g2
  ar("ar11", "g2", "한별", "이한별", "RESERVED", at(-1, 20, 2), hoursFromNow(8), [rs("AWAY", "포수", "이한별")]),
  ar("ar12", "g2", "지훈이", "박지훈", "PAYMENT_SUBMITTED", at(-1, 22, 40), hoursFromNow(7), [rs("AWAY", "선발", "박지훈")]),
  ar("ar13", "g2", "야구해123", "야구해123", "PAYMENT_SUBMITTED", hoursFromNow(-20), hoursFromNow(4), [rs("AWAY", "좌익", "야구해123")]),
  ar("ar14", "g2", "지민", "한지민", "APPROVED", at(-6, 10, 0), at(-5, 10, 0), [rs("AWAY", "구원", "한지민")]),
  // g4
  ar("ar15", "g4", "야구해123", "야구해123", "RESERVED", hoursFromNow(-0.3), hoursFromNow(23.7), [rs("AWAY", "구원", "야구해123"), rs("AWAY", "포수", "김민재"), rs("AWAY", "3루", "이서준")]),
  ar("ar16", "g4", "sonny", "손흥민", "APPROVED", at(-2, 8, 0), at(-1, 8, 0), [rs("HOME", "선발", "손흥민"), rs("HOME", "1루", "이강인"), rs("HOME", "유격", "황희찬")]),
  // g5 (종료) — 출석 대상
  ar("ar17", "g5", "길동", "홍길동", "ATTENDED", at(-12, 10, 0), at(-11, 10, 0), [rs("AWAY", "선발", "홍길동"), rs("AWAY", "구원", "정우성")]),
];
