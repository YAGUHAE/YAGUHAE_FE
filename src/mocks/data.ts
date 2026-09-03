/**
 * 화면 구현용 목 데이터. API가 붙으면 `src/lib/data/*`의 함수 본문만 바뀌고 이 파일은 사라집니다.
 * 날짜는 오늘 기준 상대값으로 만들어 P-3 날짜 스트립·P-6 카운트다운이 항상 살아 있게 합니다.
 */
import type {
  AdminReservation,
  FeeTier,
  Game,
  League,
  Notification,
  Profile,
  Reservation,
  ReservationSlot,
  Slot,
  Team,
} from "@/lib/types";
import { POSITION_PRESET, TEAM_LABEL } from "@/lib/types";

const HOUR = 60 * 60 * 1000;

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

export const LEAGUE_FEES: Record<FeeTier, number> = {
  PITCHER: 13000,
  CATCHER: 0,
  FIELDER: 17000,
  DH: 13000,
};

/** 팀 슬롯 11개. `names[i]`가 있으면 채워진 슬롯. `mine`·`proxy` 인덱스로 표시를 겁니다. */
function team(
  t: Team,
  fees: Record<FeeTier, number>,
  names: (string | null)[],
  opts: { mine?: number[]; proxy?: number[]; omit?: number[] } = {},
): Slot[] {
  return POSITION_PRESET.filter((_, i) => !opts.omit?.includes(i)).map((p, i) => {
    const name = names[i];
    return {
      id: `${TEAM_LABEL[t]}-${p.position}`,
      team: t,
      index: i + 1,
      position: p.position,
      feeTier: p.feeTier,
      fee: fees[p.feeTier],
      ...(name ? { participantName: name } : {}),
      ...(opts.mine?.includes(i) ? { isMine: true } : {}),
      ...(opts.proxy?.includes(i) ? { proxy: true } : {}),
    };
  });
}

const _ = null;

export const GAMES: Game[] = [
  {
    id: "g1",
    venue: "상암 유소년 야구장",
    address: "서울 마포구 월드컵로 240",
    region: "서울 마포구",
    startsAt: at(0, 19),
    durationHours: 2,
    leagueName: "상암 리틀리그",
    recommendedLevel: "3~5급",
    dugout: { FIRST: "3루 덕아웃", SECOND: "1루 덕아웃" },
    notice: "주차는 서문 이용, 18:40 집합",
    status: "OPEN",
    fees: LEAGUE_FEES,
    slots: [
      ...team("FIRST", LEAGUE_FEES, ["김도현", _, _, "박서준", "이준호", _, "최민수", _, "정우성", _, _]),
      ...team("SECOND", LEAGUE_FEES, ["최민식", "송강호", _, _, "김태리", "유해진", _, "전도연", _, _, "마동석"]),
    ],
  },
  {
    id: "g2",
    venue: "고척 스카이돔 보조구장",
    address: "서울 구로구 경인로 430",
    region: "서울 구로구",
    startsAt: at(0, 21),
    durationHours: 2,
    leagueName: "상암 리틀리그",
    dugout: { FIRST: "3루 덕아웃", SECOND: "1루 덕아웃" },
    status: "OPEN",
    fees: LEAGUE_FEES,
    slots: [
      ...team("FIRST", LEAGUE_FEES, ["박지훈", "한지민", "이한별", "오정세", "류승룡", "김혜수", "조진웅", _, "김고은", "이병헌", _]),
      ...team("SECOND", LEAGUE_FEES, ["김윤석", "하정우", "이정재", "정재영", "황정민", "조인성", "천우희", "박보영", "손예진", "공유", "이제훈"]),
    ],
  },
  {
    id: "g3",
    venue: "목동 야구장 2구장",
    address: "서울 양천구 안양천로 939",
    region: "서울 양천구",
    startsAt: at(1, 14),
    durationHours: 2,
    leagueName: "상암 리틀리그",
    recommendedLevel: "2~4급",
    dugout: { FIRST: "3루 덕아웃", SECOND: "1루 덕아웃" },
    status: "CLOSED",
    fees: { ...LEAGUE_FEES, FIELDER: 15000, PITCHER: 15000 },
    slots: [
      ...team("FIRST", { ...LEAGUE_FEES, FIELDER: 15000, PITCHER: 15000 }, ["강동원", "김우빈", "박서준", "송중기", "유아인", "이도현", "임시완", "지창욱", "차은우", "최우식", "변요한"]),
      ...team("SECOND", { ...LEAGUE_FEES, FIELDER: 15000, PITCHER: 15000 }, ["김수현", "남주혁", "박보검", "서강준", "안효섭", "여진구", "이종석", "장기용", "정해인", "주지훈", "현빈"]),
    ],
  },
  {
    id: "g4",
    venue: "잠실 학생야구장",
    address: "서울 송파구 올림픽로 25",
    region: "서울 송파구",
    startsAt: at(1, 10),
    durationHours: 2,
    leagueName: "상암 리틀리그",
    recommendedLevel: "4~6급",
    dugout: { FIRST: "3루 덕아웃", SECOND: "1루 덕아웃" },
    status: "OPEN",
    fees: LEAGUE_FEES,
    slots: [
      ...team("FIRST", LEAGUE_FEES, [_, "야구해123", "김민재", _, _, "이서준", _, _, _, _, _], { mine: [1, 2, 5] }),
      ...team("SECOND", LEAGUE_FEES, ["손흥민", _, _, "이강인", _, _, "황희찬", _, _, _, _]),
    ],
  },
  {
    id: "g5",
    venue: "상암 유소년 야구장",
    address: "서울 마포구 월드컵로 240",
    region: "서울 마포구",
    startsAt: at(-6, 19),
    durationHours: 2,
    leagueName: "상암 리틀리그",
    recommendedLevel: "3~5급",
    dugout: { FIRST: "3루 덕아웃", SECOND: "1루 덕아웃" },
    status: "CLOSED",
    fees: LEAGUE_FEES,
    slots: [
      ...team("FIRST", LEAGUE_FEES, ["홍길동", "정우성", "김철수", "박민수", "이영희", "최민식", "송강호", "김태리", "유해진", "전도연", "마동석"], { proxy: [1, 3] }),
      ...team("SECOND", LEAGUE_FEES, ["최민식", "송강호", "김태리", "유해진", "전도연", "마동석", "홍길동", "정우성", "김철수", "박민수", "야구해123"], { proxy: [7], mine: [10] }),
    ],
  },
  {
    id: "g6",
    venue: "상암 유소년 야구장",
    address: "서울 마포구 월드컵로 240",
    region: "서울 마포구",
    startsAt: at(7, 19),
    durationHours: 2,
    leagueName: "상암 리틀리그",
    recommendedLevel: "3~5급",
    dugout: { FIRST: "3루 덕아웃", SECOND: "1루 덕아웃" },
    status: "OPEN",
    fees: LEAGUE_FEES,
    slots: [
      ...team("FIRST", LEAGUE_FEES, ["김도현", _, _, _, _, _, _, _, _, _, _]),
      ...team("SECOND", LEAGUE_FEES, [_, _, _, _, _, _, _, _, _, _, _]),
    ],
  },
];

function rs(team: Team, position: string, participantName: string, isOwner = false): ReservationSlot {
  const preset = POSITION_PRESET.find((p) => p.position === position)!;
  return { team, position, participantName, isOwner, feeTier: preset.feeTier, fee: LEAGUE_FEES[preset.feeTier] };
}

export const PROFILE: Profile = {
  nickname: "야구해123",
  region: "서울 송파구",
  position: "유격수",
  level: "4급",
  profileUrl: "",
  noShowCount: 0,
  isSuspended: false,
};

export const RESERVATIONS: Reservation[] = [
  {
    id: "r1",
    gameId: "g4",
    status: "RESERVED",
    depositorName: "야구해123",
    createdAt: hoursFromNow(-0.3),
    expiresAt: hoursFromNow(23.7),
    slots: [rs("FIRST", "구원", "야구해123", true), rs("FIRST", "포수", "김민재"), rs("FIRST", "3루", "이서준")],
    history: [{ label: "신청함", at: hoursFromNow(-0.3), current: true }],
  },
  {
    id: "r2",
    gameId: "g2",
    status: "PAYMENT_SUBMITTED",
    depositorName: "야구해123",
    createdAt: hoursFromNow(-20),
    expiresAt: hoursFromNow(4),
    slots: [rs("FIRST", "좌익", "야구해123", true)],
    history: [
      { label: "신청함", at: hoursFromNow(-20) },
      { label: "입금 완료 알림", at: hoursFromNow(-19.6) },
      { label: "주최자 확인 중", at: hoursFromNow(-19.6), note: "대기 중", current: true },
    ],
  },
  {
    id: "r3",
    gameId: "g3",
    status: "APPROVED",
    depositorName: "야구해123",
    createdAt: at(-3, 21, 10),
    expiresAt: at(-2, 21, 10),
    slots: [rs("FIRST", "3루", "야구해123", true)],
    history: [
      { label: "신청함", at: at(-3, 21, 10) },
      { label: "입금 완료 알림", at: at(-3, 21, 32) },
      { label: "주최자 확인 완료", at: at(-2, 9, 5), note: "확정", current: true },
    ],
  },
  {
    id: "r4",
    gameId: "g5",
    status: "ATTENDED",
    depositorName: "야구해123",
    createdAt: at(-9, 20, 0),
    expiresAt: at(-8, 20, 0),
    slots: [rs("SECOND", "지타", "야구해123", true)],
    history: [
      { label: "신청함", at: at(-9, 20, 0) },
      { label: "입금 완료 알림", at: at(-9, 20, 14) },
      { label: "주최자 확인 완료", at: at(-8, 10, 2) },
      { label: "참가 완료", at: at(-6, 21, 30), current: true },
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
    slots: [rs("SECOND", "유격", "야구해123", true)],
    history: [
      { label: "신청함", at: at(-15, 12, 0) },
      { label: "기간 만료", at: at(-14, 12, 0), note: "24시간 내 미입금", current: true },
    ],
  },
  {
    id: "r6",
    gameId: "g3",
    status: "REJECTED",
    depositorName: "야구해123",
    createdAt: at(-20, 18, 0),
    expiresAt: at(-19, 18, 0),
    slots: [rs("SECOND", "1루", "야구해123", true)],
    history: [
      { label: "신청함", at: at(-20, 18, 0) },
      { label: "입금 완료 알림", at: at(-20, 18, 40) },
      { label: "거절됨", at: at(-19, 9, 12), note: "사유: 미입금", current: true },
    ],
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "PAYMENT_DUE_1H",
    title: "입금 마감이 1시간 남았어요",
    description: "잠실 학생야구장 · 30,000원",
    createdAt: hoursFromNow(-1),
    read: false,
    reservationId: "r1",
  },
  {
    id: "n2",
    type: "APPROVED",
    title: "예약이 확정됐어요",
    description: "목동 야구장 2구장 · 1자리",
    createdAt: hoursFromNow(-3),
    read: false,
    reservationId: "r3",
  },
  {
    id: "n3",
    type: "REJECTED",
    title: "입금이 확인되지 않아 거절됐어요",
    description: "목동 야구장 2구장 · 사유: 미입금",
    createdAt: hoursFromNow(-30),
    read: true,
    reservationId: "r6",
  },
  {
    id: "n4",
    type: "PAYMENT_DUE_12H",
    title: "입금 마감이 12시간 남았어요",
    description: "잠실 학생야구장 · 30,000원",
    createdAt: hoursFromNow(-50),
    read: true,
    reservationId: "r1",
  },
];

export const LEAGUE: League = {
  id: "l1",
  name: "상암 리틀리그",
  region: "서울 마포구",
  intro: "매주 금요일 저녁 상암에서 모이는 사회인 리그입니다.",
  venue: "상암 유소년 야구장",
  bank: "국민은행",
  accountNumber: "123456-01-987654",
  accountHolder: "상암리틀리그",
  fees: LEAGUE_FEES,
};

export const ADMIN_RESERVATIONS: AdminReservation[] = [
  // g1 — 선공
  { id: "ar1", gameId: "g1", nickname: "도현", depositorName: "김도현", status: "APPROVED", createdAt: at(-4, 20, 2), expiresAt: at(-3, 20, 2), slots: [rs("FIRST", "선발", "김도현", true)] },
  { id: "ar2", gameId: "g1", nickname: "서준", depositorName: "박서준", status: "PAYMENT_SUBMITTED", createdAt: at(-1, 21, 10), expiresAt: hoursFromNow(2), slots: [rs("FIRST", "1루", "박서준", true), rs("FIRST", "2루", "이준호")] },
  { id: "ar3", gameId: "g1", nickname: "민수", depositorName: "최민수", status: "RESERVED", createdAt: hoursFromNow(-23.3), expiresAt: hoursFromNow(0.7), slots: [rs("FIRST", "유격", "최민수", true)] },
  { id: "ar4", gameId: "g1", nickname: "우성", depositorName: "정우성", status: "PAYMENT_SUBMITTED", createdAt: at(-1, 22, 40), expiresAt: hoursFromNow(5), slots: [rs("FIRST", "중견", "정우성", true)] },
  // g1 — 후공
  { id: "ar5", gameId: "g1", nickname: "민식", depositorName: "최민식", status: "APPROVED", createdAt: at(-5, 9, 30), expiresAt: at(-4, 9, 30), slots: [rs("SECOND", "선발", "최민식", true)] },
  { id: "ar6", gameId: "g1", nickname: "강호", depositorName: "송강호", status: "APPROVED", createdAt: at(-5, 11, 0), expiresAt: at(-4, 11, 0), slots: [rs("SECOND", "구원", "송강호", true)] },
  { id: "ar7", gameId: "g1", nickname: "태리", depositorName: "김태리", status: "APPROVED", createdAt: at(-4, 15, 22), expiresAt: at(-3, 15, 22), slots: [rs("SECOND", "2루", "김태리", true), rs("SECOND", "3루", "유해진")] },
  { id: "ar8", gameId: "g1", nickname: "도연", depositorName: "전도연", status: "RESERVED", createdAt: hoursFromNow(-3), expiresAt: hoursFromNow(21), slots: [rs("SECOND", "좌익", "전도연", true)] },
  { id: "ar9", gameId: "g1", nickname: "동석", depositorName: "마동석", status: "PAYMENT_SUBMITTED", createdAt: at(-1, 23, 5), expiresAt: hoursFromNow(6), slots: [rs("SECOND", "지타", "마동석", true)] },
  { id: "ar10", gameId: "g1", nickname: "yoon", depositorName: "윤지호", status: "REJECTED", createdAt: at(-3, 13, 0), expiresAt: at(-2, 13, 0), slots: [rs("SECOND", "우익", "윤지호", true)] },
  // g2
  { id: "ar11", gameId: "g2", nickname: "한별", depositorName: "이한별", status: "RESERVED", createdAt: at(-1, 20, 2), expiresAt: hoursFromNow(8), slots: [rs("FIRST", "포수", "이한별", true)] },
  { id: "ar12", gameId: "g2", nickname: "지훈이", depositorName: "박지훈", status: "PAYMENT_SUBMITTED", createdAt: at(-1, 22, 40), expiresAt: hoursFromNow(7), slots: [rs("FIRST", "선발", "박지훈", true)] },
  { id: "ar13", gameId: "g2", nickname: "야구해123", depositorName: "야구해123", status: "PAYMENT_SUBMITTED", createdAt: hoursFromNow(-20), expiresAt: hoursFromNow(4), slots: [rs("FIRST", "좌익", "야구해123", true)] },
  { id: "ar14", gameId: "g2", nickname: "지민", depositorName: "한지민", status: "APPROVED", createdAt: at(-6, 10, 0), expiresAt: at(-5, 10, 0), slots: [rs("FIRST", "구원", "한지민", true)] },
  // g4
  { id: "ar15", gameId: "g4", nickname: "야구해123", depositorName: "야구해123", status: "RESERVED", createdAt: hoursFromNow(-0.3), expiresAt: hoursFromNow(23.7), slots: [rs("FIRST", "구원", "야구해123", true), rs("FIRST", "포수", "김민재"), rs("FIRST", "3루", "이서준")] },
  { id: "ar16", gameId: "g4", nickname: "sonny", depositorName: "손흥민", status: "APPROVED", createdAt: at(-2, 8, 0), expiresAt: at(-1, 8, 0), slots: [rs("SECOND", "선발", "손흥민", true), rs("SECOND", "1루", "이강인"), rs("SECOND", "유격", "황희찬")] },
  // g5 (종료) — 출석 대상
  { id: "ar17", gameId: "g5", nickname: "길동", depositorName: "홍길동", status: "ATTENDED", createdAt: at(-12, 10, 0), expiresAt: at(-11, 10, 0), slots: [rs("FIRST", "선발", "홍길동", true), rs("FIRST", "구원", "정우성")] },
];

/** A-4 「직전 경기와 동일하게」가 복사하는 원본 — 가장 최근 등록한 경기 */
export const LAST_CREATED_GAME_ID = "g6";

/** A-4 구장명 최근 사용 3개 */
export const RECENT_VENUES = ["상암 유소년", "고척 보조", "목동 2구장"];

export const REGIONS = ["서울 송파구", "서울 마포구", "서울 구로구", "서울 양천구", "서울 강남구"];
export const LEVELS = ["1급", "2급", "3급", "4급", "5급", "6급"];
export const POSITIONS = ["투수", "포수", "1루수", "2루수", "3루수", "유격수", "외야수", "지명타자"];
