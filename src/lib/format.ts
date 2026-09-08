const TZ = "Asia/Seoul";

function parts(iso: string) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("ko-KR", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of f.formatToParts(d)) map[p.type] = p.value;
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    weekday: map.weekday,
    time: `${map.hour === "24" ? "00" : map.hour}:${map.minute}`,
  };
}

/** `8월 13일 (금) 19:00` */
export function formatDateTime(iso: string) {
  const p = parts(iso);
  return `${p.month}월 ${p.day}일 (${p.weekday}) ${p.time}`;
}

/** `8월 13일 (금)` */
export function formatDate(iso: string) {
  const p = parts(iso);
  return `${p.month}월 ${p.day}일 (${p.weekday})`;
}

/** `2026년 9월 3일 (목)` */
export function formatFullDate(iso: string) {
  const p = parts(iso);
  return `${p.year}년 ${p.month}월 ${p.day}일 (${p.weekday})`;
}

/** `8/13(금) 19:00` — 어드민 카드·테이블용 축약 */
export function formatShortDateTime(iso: string) {
  const p = parts(iso);
  return `${p.month}/${p.day}(${p.weekday}) ${p.time}`;
}

/** `8/13(금)` */
export function formatShortDate(iso: string) {
  const p = parts(iso);
  return `${p.month}/${p.day}(${p.weekday})`;
}

/** `19:00` */
export function formatTime(iso: string) {
  return parts(iso).time;
}

/** `8월 12일 21:10` — 상태 이력·신청 시각 */
export function formatTimestamp(iso: string) {
  const p = parts(iso);
  return `${p.month}월 ${p.day}일 ${p.time}`;
}

/** `8/12 21:10` */
export function formatShortTimestamp(iso: string) {
  const p = parts(iso);
  return `${p.month}/${p.day} ${p.time}`;
}

/** `13,000원` · 0원은 `무료` */
export function formatPrice(won: number) {
  return won === 0 ? "무료" : `${won.toLocaleString("ko-KR")}원`;
}

/** `13,000` (단위 생략) · 0원은 `무료` */
export function formatAmount(won: number) {
  return won === 0 ? "무료" : won.toLocaleString("ko-KR");
}

/** `1시간 전` · `어제` · `2일 전` */
export function formatRelative(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  return `${day}일 전`;
}

/** 만료까지 남은 시간 — `만료 2시간 전` · `만료 40분 전` */
export function formatUntilExpiry(iso: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return "만료됨";
  const min = Math.floor(diff / 60000);
  if (min < 60) return `만료 ${min}분 전`;
  return `만료 ${Math.floor(min / 60)}시간 전`;
}

/** 서울 기준 `YYYY-MM-DD` — P-3 `date` 쿼리 키 값 */
export function toDateKey(date: Date | string) {
  const d = new Date(date);
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return f.format(d);
}

/** 같은 날(서울 기준)인지 */
export function isSameDay(a: string, b: string | Date) {
  return toDateKey(a) === toDateKey(b);
}
