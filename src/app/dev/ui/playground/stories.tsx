"use client";

import type { ReactNode } from "react";
import {
  Button,
  Countdown,
  DialogPanel,
  EmptyState,
  FilterChip,
  ICON_NAMES,
  Icon,
  InfoItem,
  RatingScale,
  RosterStrip,
  SectionBand,
  SelectField,
  StatusBadge,
  TextField,
  TextLink,
  Toast,
  type ButtonSize,
  type ButtonVariant,
  type IconName,
  type IconSize,
  type RatingValue,
  type ToastType,
} from "@/components/ui";
import {
  AdminRow,
  MatchRow,
  PAYMENT_TABLE_COLUMNS,
  PositionSlot,
  ReservationRow,
  ReservationRowAction,
  StatTile,
  Table,
  TableCell,
  TablePrimaryCell,
  TableRow,
  TableStatusText,
  type GameStatus,
  type PositionSlotState,
} from "@/components/data";
import {
  ADMIN_NAV_ITEMS,
  BottomNav,
  PLAYER_NAV_ITEMS,
  PageHeader,
  SideNav,
  TopNav,
  type AdminNavKey,
  type PlayerNavKey,
} from "@/components/navigation";
import { AdminShell, Container, PlayerShell, Split } from "@/components/layout";
import { RESERVATION_STATUSES, type ReservationStatus } from "@/lib/reservation-status";
import {
  InteractiveBoard,
  InteractiveChips,
  InteractiveDates,
  InteractiveTabs,
} from "../interactive";

export type Control =
  | { type: "select"; options: readonly string[]; label?: string }
  | { type: "boolean"; label?: string }
  | { type: "text"; label?: string }
  | { type: "number"; min?: number; max?: number; label?: string };

export type StoryGroup = "ui" | "data" | "navigation" | "layout";

export const STORY_GROUP_LABEL: Record<StoryGroup, string> = {
  ui: "UI",
  data: "데이터",
  navigation: "내비게이션",
  layout: "레이아웃",
};

export type Story<P extends Record<string, unknown> = Record<string, unknown>> = {
  /** URL slug */
  id: string;
  name: string;
  group: StoryGroup;
  /** Figma 노드 id (`15:101`). 링크로 변환됩니다. */
  figma?: string;
  description?: string;
  defaults: P;
  controls: { [K in keyof P]?: Control };
  /** 셸처럼 화면 전체를 쓰는 스토리 — 미리보기 높이를 고정합니다. */
  fullHeight?: boolean;
  render: (props: P) => ReactNode;
};

export type AnyStory = Story<Record<string, unknown>>;

function defineStory<P extends Record<string, unknown>>(story: Story<P>): AnyStory {
  return story as unknown as AnyStory;
}

export const FIGMA_FILE = "https://www.figma.com/design/FlB17wV6KQbQCHNEp32mbR";

export function figmaUrl(nodeId: string) {
  return `${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`;
}

const ICON_COLOR_CLASS = {
  default: "text-icon-default",
  secondary: "text-icon-secondary",
  brand: "text-icon-brand",
  disabled: "text-icon-disabled",
  inverse: "text-icon-inverse bg-bg-inverse",
} as const;

const PLAYER_KEYS = PLAYER_NAV_ITEMS.map((i) => i.key);
const ADMIN_KEYS = ADMIN_NAV_ITEMS.map((i) => i.key);
const NAV_KEYS = [...PLAYER_KEYS, ...ADMIN_KEYS];

function Note({ children }: { children: ReactNode }) {
  return <p className="type-caption text-text-tertiary">{children}</p>;
}

function SampleMatchRows({ link }: { link?: boolean }) {
  return (
    <>
      {[18, 19, 20, 21].map((h, i) => (
        <MatchRow
          key={h}
          href={link ? "#" : undefined}
          time={`${h}:00`}
          venue="상암 유소년 야구장"
          capacity="선공 4/11 · 후공 6/11"
          price="13,000원부터"
          meta="3~5급"
          chips={i === 0 ? ["포수 모집", "3루 모집"] : undefined}
          status={i === 3 ? "CLOSED" : "OPEN"}
        />
      ))}
    </>
  );
}

function SamplePaymentTable({ selectedRow, variant }: { selectedRow: number; variant: string }) {
  const columns =
    variant === "games"
      ? PAYMENT_TABLE_COLUMNS.map((c, i) =>
          i < 5 ? { ...c, label: ["일시", "선공", "후공", "입금 대기", "상태"][i] } : c,
        )
      : PAYMENT_TABLE_COLUMNS;
  return (
    <Table columns={columns}>
      {[1, 2, 3].map((i) => (
        <TableRow key={i} selected={selectedRow === i}>
          {variant === "games" ? (
            <>
              <TablePrimaryCell title="9/6(토) 19:00" sub="상암 유소년 야구장" />
              <TableCell align="right" className="type-body-sm text-text-secondary">
                4/11
              </TableCell>
              <TableCell className="type-body-sm text-text-secondary">6/11</TableCell>
              <TableCell className="type-body-sm text-text-secondary">{i}건</TableCell>
              <TableCell>
                <TableStatusText>{i === 3 ? "마감" : "모집중"}</TableStatusText>
              </TableCell>
              <TableCell align="right">
                <Icon name="chevron-right" className="ml-auto text-icon-secondary" />
              </TableCell>
            </>
          ) : (
            <>
              <TablePrimaryCell title="김철수" sub="선공 3루 홍길동 · 외 2자리" />
              <TableCell align="right" className="type-numeric-price text-text-default">
                34,000원
              </TableCell>
              <TableCell className="type-body-sm text-text-secondary">9/6(토) 19:00</TableCell>
              <TableCell className="type-body-sm text-text-secondary">8/4 21:10</TableCell>
              <TableCell>
                <StatusBadge status="PAYMENT_SUBMITTED" />
              </TableCell>
              <TableCell align="right">
                <span className="flex justify-end gap-sm">
                  <Button variant="secondary" size="medium">
                    거절
                  </Button>
                  <Button size="medium">입금 완료</Button>
                </span>
              </TableCell>
            </>
          )}
        </TableRow>
      ))}
    </Table>
  );
}

export const STORIES: AnyStory[] = [
  // ---------------------------------------------------------------- ui
  defineStory({
    id: "icon",
    name: "Icon",
    group: "ui",
    figma: "10:19",
    description: "13종. stroke 2 · currentColor. 색은 icon 토큰 유틸리티로.",
    defaults: { name: "calendar", size: "lg", color: "default" },
    controls: {
      name: { type: "select", options: ICON_NAMES },
      size: { type: "select", options: ["sm", "md", "lg"] },
      color: { type: "select", options: Object.keys(ICON_COLOR_CLASS) },
    },
    render: ({ name, size, color }) => (
      <span className={`inline-flex rounded-md p-sm ${ICON_COLOR_CLASS[color as keyof typeof ICON_COLOR_CLASS]}`}>
        <Icon name={name as IconName} size={size as IconSize} />
      </span>
    ),
  }),
  defineStory({
    id: "button",
    name: "Button",
    group: "ui",
    figma: "15:101",
    defaults: {
      children: "신청하기",
      variant: "primary",
      size: "large",
      icon: "",
      disabled: false,
      fullWidth: false,
    },
    controls: {
      children: { type: "text", label: "라벨" },
      variant: { type: "select", options: ["primary", "secondary", "ghost", "danger"] },
      size: { type: "select", options: ["large", "medium"] },
      icon: { type: "select", options: ["", ...ICON_NAMES] },
      disabled: { type: "boolean" },
      fullWidth: { type: "boolean" },
    },
    render: ({ children, variant, size, icon, disabled, fullWidth }) => (
      <Button
        variant={variant as ButtonVariant}
        size={size as ButtonSize}
        icon={icon ? (icon as IconName) : undefined}
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {children}
      </Button>
    ),
  }),
  defineStory({
    id: "status-badge",
    name: "StatusBadge",
    group: "ui",
    figma: "16:18",
    defaults: { status: "RESERVED" },
    controls: { status: { type: "select", options: RESERVATION_STATUSES } },
    render: ({ status }) => <StatusBadge status={status as ReservationStatus} />,
  }),
  defineStory({
    id: "text-field",
    name: "TextField",
    group: "ui",
    figma: "17:22",
    defaults: {
      label: "닉네임",
      placeholder: "홍길동",
      value: "",
      helper: "2~10자로 입력해주세요",
      error: "",
      disabled: false,
    },
    controls: {
      label: { type: "text" },
      placeholder: { type: "text" },
      value: { type: "text", label: "값 (초기값)" },
      helper: { type: "text" },
      error: { type: "text", label: "error (있으면 Error 상태)" },
      disabled: { type: "boolean" },
    },
    render: ({ label, placeholder, value, helper, error, disabled }) => (
      <TextField
        key={value}
        label={label}
        placeholder={placeholder}
        defaultValue={value}
        helper={helper || undefined}
        error={error || undefined}
        disabled={disabled}
      />
    ),
  }),
  defineStory({
    id: "select-field",
    name: "SelectField",
    group: "ui",
    figma: "18:30",
    defaults: {
      label: "활동 지역",
      placeholder: "지역을 선택해주세요",
      value: "",
      helper: "주로 활동하는 지역을 선택해주세요",
      error: "",
      disabled: false,
    },
    controls: {
      label: { type: "text" },
      placeholder: { type: "text" },
      value: { type: "select", options: ["", "songpa", "gangnam", "mapo"], label: "값 (초기값)" },
      helper: { type: "text" },
      error: { type: "text", label: "error (있으면 Error 상태)" },
      disabled: { type: "boolean" },
    },
    render: ({ label, placeholder, value, helper, error, disabled }) => (
      <SelectField
        key={value}
        label={label}
        placeholder={placeholder || undefined}
        defaultValue={value || undefined}
        helper={helper || undefined}
        error={error || undefined}
        disabled={disabled}
      >
        <option value="songpa">서울 송파구</option>
        <option value="gangnam">서울 강남구</option>
        <option value="mapo">서울 마포구</option>
      </SelectField>
    ),
  }),
  defineStory({
    id: "filter-chip",
    name: "FilterChip",
    group: "ui",
    figma: "18:47",
    defaults: { children: "서울 송파구", selected: true, disabled: false },
    controls: {
      children: { type: "text", label: "라벨" },
      selected: { type: "boolean" },
      disabled: { type: "boolean" },
    },
    render: ({ children, selected, disabled }) => (
      <div className="flex flex-col gap-lg">
        <FilterChip selected={selected} disabled={disabled}>
          {children}
        </FilterChip>
        <Note>아래는 상태를 가진 필터 바 예시</Note>
        <InteractiveChips />
      </div>
    ),
  }),
  defineStory({
    id: "segmented-tab",
    name: "SegmentedTab",
    group: "ui",
    figma: "18:56",
    description: "탭을 눌러 선택을 바꿔 보세요. 가로로 FILL 배치됩니다.",
    defaults: {},
    controls: {},
    render: () => <InteractiveTabs />,
  }),
  defineStory({
    id: "text-link",
    name: "TextLink",
    group: "ui",
    figma: "126:5",
    defaults: { children: "지도 보기", href: "" },
    controls: {
      children: { type: "text", label: "라벨" },
      href: { type: "text", label: "href (비우면 button)" },
    },
    render: ({ children, href }) =>
      href ? <TextLink href={href}>{children}</TextLink> : <TextLink>{children}</TextLink>,
  }),
  defineStory({
    id: "section-band",
    name: "SectionBand",
    group: "ui",
    figma: "126:3",
    defaults: {},
    controls: {},
    render: () => (
      <div className="flex flex-col">
        <p className="p-lg type-body-md text-text-default">위 섹션</p>
        <SectionBand />
        <p className="p-lg type-body-md text-text-default">아래 섹션</p>
      </div>
    ),
  }),
  defineStory({
    id: "info-item",
    name: "InfoItem",
    group: "ui",
    figma: "126:8",
    defaults: { icon: "users", children: "10~18명" },
    controls: {
      icon: { type: "select", options: ICON_NAMES },
      children: { type: "text", label: "라벨" },
    },
    render: ({ icon, children }) => <InfoItem icon={icon as IconName}>{children}</InfoItem>,
  }),
  defineStory({
    id: "date-cell",
    name: "DateCell",
    group: "ui",
    figma: "127:21",
    description: "토=파랑 · 일=빨강, Selected가 요일색을 덮습니다. 셀을 눌러 보세요.",
    defaults: {},
    controls: {},
    render: () => <InteractiveDates />,
  }),
  defineStory({
    id: "toast",
    name: "Toast",
    group: "ui",
    figma: "21:56",
    defaults: { type: "success", children: "저장되었어요" },
    controls: {
      type: { type: "select", options: ["success", "warning", "danger", "info"] },
      children: { type: "text", label: "메시지" },
    },
    render: ({ type, children }) => <Toast type={type as ToastType}>{children}</Toast>,
  }),
  defineStory({
    id: "dialog",
    name: "Dialog",
    group: "ui",
    figma: "21:74",
    description: "카드(DialogPanel)만 보여 줍니다. 모달 동작은 갤러리의 「Dialog 열기」.",
    defaults: {
      title: "이미 같은 시간대에 신청한 경기가 있어요",
      description: "기존 예약을 취소한 뒤 다시 신청해주세요.",
      primary: "확인",
      secondary: "",
    },
    controls: {
      title: { type: "text" },
      description: { type: "text" },
      primary: { type: "text", label: "주요 액션" },
      secondary: { type: "text", label: "보조 액션 (있으면 Two)" },
    },
    render: ({ title, description, primary, secondary }) => (
      <DialogPanel
        title={title}
        description={description || undefined}
        primary={{ label: primary }}
        secondary={secondary ? { label: secondary } : undefined}
      />
    ),
  }),
  defineStory({
    id: "empty-state",
    name: "EmptyState",
    group: "ui",
    figma: "21:75",
    defaults: {
      icon: "calendar",
      title: "조건에 맞는 경기가 없어요",
      description: "필터를 조정하면 더 많은 경기를 볼 수 있어요",
      action: "필터 초기화",
    },
    controls: {
      icon: { type: "select", options: ICON_NAMES },
      title: { type: "text" },
      description: { type: "text" },
      action: { type: "text", label: "액션 (비우면 숨김)" },
    },
    render: ({ icon, title, description, action }) => (
      <EmptyState
        icon={icon as IconName}
        title={title}
        description={description || undefined}
        action={
          action ? (
            <Button variant="secondary" size="medium">
              {action}
            </Button>
          ) : undefined
        }
      />
    ),
  }),
  defineStory({
    id: "countdown",
    name: "Countdown",
    group: "ui",
    figma: "21:108",
    description: "12시간 이하 Warning · 1시간 이하 Critical.",
    defaults: { hours: 23, minutes: 47, label: "남은 시간" },
    controls: {
      hours: { type: "number", min: 0, max: 99, label: "남은 시간(시)" },
      minutes: { type: "number", min: 0, max: 59, label: "남은 시간(분)" },
      label: { type: "text" },
    },
    render: ({ hours, minutes, label }) => {
      const ms = (Number(hours) * 3600 + Number(minutes) * 60 + 12) * 1000;
      return <Countdown key={ms} durationMs={ms} label={label} />;
    },
  }),
  defineStory({
    id: "rating-scale",
    name: "RatingScale",
    group: "ui",
    figma: "21:187",
    defaults: { label: "매너 점수", value: 0, disabled: false },
    controls: {
      label: { type: "text" },
      value: { type: "number", min: 0, max: 5 },
      disabled: { type: "boolean" },
    },
    render: ({ label, value, disabled }) => (
      <RatingScale
        label={label}
        value={Math.min(5, Math.max(0, Number(value))) as RatingValue}
        disabled={disabled}
      />
    ),
  }),
  defineStory({
    id: "roster-strip",
    name: "RosterStrip",
    group: "ui",
    figma: "31:9",
    defaults: { filled: 4, total: 10 },
    controls: {
      filled: { type: "number", min: 0, max: 20 },
      total: { type: "number", min: 1, max: 20 },
    },
    render: ({ filled, total }) => <RosterStrip filled={Number(filled)} total={Number(total)} />,
  }),

  // ---------------------------------------------------------------- data
  defineStory({
    id: "match-row",
    name: "MatchRow",
    group: "data",
    figma: "128:41",
    defaults: {
      time: "19:00",
      venue: "상암 유소년 야구장",
      capacity: "선공 4/11 · 후공 6/11",
      price: "13,000원부터",
      meta: "3~5급",
      chips: "포수 모집, 3루 모집",
      status: "OPEN",
      link: true,
    },
    controls: {
      time: { type: "text" },
      venue: { type: "text" },
      capacity: { type: "text" },
      price: { type: "text" },
      meta: { type: "text" },
      chips: { type: "text", label: "빈 포지션 칩 (쉼표 구분)" },
      status: { type: "select", options: ["OPEN", "CLOSED", "CANCELLED"] },
      link: { type: "boolean", label: "href (행 전체 링크)" },
    },
    render: ({ time, venue, capacity, price, meta, chips, status, link }) => (
      <MatchRow
        href={link ? "#" : undefined}
        time={time}
        venue={venue}
        capacity={capacity}
        price={price}
        meta={meta || undefined}
        chips={chips ? chips.split(",").map((c) => c.trim()).filter(Boolean) : undefined}
        status={status as GameStatus}
      />
    ),
  }),
  defineStory({
    id: "reservation-row",
    name: "ReservationRow",
    group: "data",
    figma: "20:20",
    defaults: {
      venue: "잠실 리틀야구장",
      datetime: "2026년 8월 12일 (수) 19:00",
      status: "ATTENDED",
      action: "평가하기",
      link: true,
    },
    controls: {
      venue: { type: "text" },
      datetime: { type: "text" },
      status: { type: "select", options: RESERVATION_STATUSES },
      action: { type: "text", label: "액션 (비우면 chevron)" },
      link: { type: "boolean", label: "href (행 전체 링크)" },
    },
    render: ({ venue, datetime, status, action, link }) => (
      <ReservationRow
        href={link ? "#" : undefined}
        venue={venue}
        datetime={datetime}
        status={status as ReservationStatus}
        action={action ? <ReservationRowAction>{action}</ReservationRowAction> : undefined}
      />
    ),
  }),
  defineStory({
    id: "position-slot",
    name: "PositionSlot",
    group: "data",
    figma: "47:720",
    defaults: {
      index: 1,
      position: "선발",
      state: "empty",
      participant: "김도현",
      mine: false,
      emptyTone: "brand",
      clickable: true,
    },
    controls: {
      index: { type: "number", min: 1, max: 11 },
      position: { type: "text" },
      state: { type: "select", options: ["empty", "selected", "filled"] },
      participant: { type: "text", label: "참가자 (Filled)" },
      mine: { type: "boolean", label: "내 신청 배지" },
      emptyTone: { type: "select", options: ["brand", "muted"], label: "Empty 톤 (어드민은 muted)" },
      clickable: { type: "boolean", label: "onClick (button으로)" },
    },
    render: ({ index, position, state, participant, mine, emptyTone, clickable }) => (
      <PositionSlot
        index={Number(index)}
        position={position}
        state={state as PositionSlotState}
        participant={participant}
        mine={mine}
        emptyTone={emptyTone as "brand" | "muted"}
        onClick={clickable ? () => {} : undefined}
      />
    ),
  }),
  defineStory({
    id: "position-board",
    name: "PositionSlot · 보드",
    group: "data",
    figma: "47:720",
    description: "11행 보드. 빈 행을 눌러 여러 개를 동시에 Selected로 둘 수 있습니다 (체크박스형).",
    defaults: {},
    controls: {},
    render: () => <InteractiveBoard />,
  }),
  defineStory({
    id: "admin-row",
    name: "AdminRow",
    group: "data",
    figma: "59:3",
    defaults: {
      title: "홍길동",
      badge: "대기",
      description: "정지 해제 요청",
      meta: "08.03 21:14",
      chevron: true,
    },
    controls: {
      title: { type: "text" },
      badge: { type: "text", label: "배지 (비우면 숨김)" },
      description: { type: "text" },
      meta: { type: "text", label: "메타 (비우면 숨김)" },
      chevron: { type: "boolean" },
    },
    render: ({ title, badge, description, meta, chevron }) => (
      <AdminRow
        title={title}
        badge={badge || undefined}
        description={description}
        meta={meta || undefined}
        chevron={chevron}
      />
    ),
  }),
  defineStory({
    id: "stat-tile",
    name: "StatTile",
    group: "data",
    figma: "187:20",
    description: "값이 0이면 회색, 1 이상이면 brand 숫자.",
    defaults: { label: "입금 확인 대기", value: 3, unit: "건" },
    controls: {
      label: { type: "text" },
      value: { type: "number", min: 0, max: 999 },
      unit: { type: "text" },
    },
    render: ({ label, value, unit }) => (
      <div className="max-w-[309px]">
        <StatTile label={label} value={Number(value)} unit={unit} href="#" />
      </div>
    ),
  }),
  defineStory({
    id: "table",
    name: "Table",
    group: "data",
    figma: "189:2140",
    description: "lg 전용. 뷰포트를 1280으로 두고 보세요. 열 폭 260·100·160·100·94·170.",
    defaults: { variant: "payments", selectedRow: 0 },
    controls: {
      variant: { type: "select", options: ["payments", "games"], label: "A-6 입금 / A-3 경기" },
      selectedRow: { type: "number", min: 0, max: 3, label: "Selected 행 (0 = 없음)" },
    },
    render: ({ variant, selectedRow }) => (
      <SamplePaymentTable variant={variant} selectedRow={Number(selectedRow)} />
    ),
  }),

  // ---------------------------------------------------------------- navigation
  defineStory({
    id: "bottom-nav",
    name: "BottomNav",
    group: "navigation",
    figma: "18:145",
    description: "용병은 lg에서, 어드민은 md부터 숨겨집니다. 뷰포트 360에서 보세요.",
    defaults: { role: "player", active: "games", badge: 0 },
    controls: {
      role: { type: "select", options: ["player", "admin"] },
      active: { type: "select", options: NAV_KEYS },
      badge: { type: "number", min: 0, max: 99, label: "배지 (내 예약 / 입금 확인)" },
    },
    render: ({ role, active, badge }) => (
      <div className="min-h-[160px]">
        <Note>하단에 고정됩니다.</Note>
        {role === "admin" ? (
          <BottomNav
            role="admin"
            active={(ADMIN_KEYS.includes(active as AdminNavKey) ? active : "games") as AdminNavKey}
            badges={Number(badge) > 0 ? { payments: Number(badge) } : undefined}
          />
        ) : (
          <BottomNav
            role="player"
            active={(PLAYER_KEYS.includes(active as PlayerNavKey) ? active : "games") as PlayerNavKey}
            badges={Number(badge) > 0 ? { reservations: Number(badge) } : undefined}
          />
        )}
      </div>
    ),
  }),
  defineStory({
    id: "side-nav",
    name: "SideNav",
    group: "navigation",
    figma: "184:74",
    description: "md(768)에서 레일 72, lg(1280)에서 풀 240. base에서는 보이지 않습니다.",
    defaults: { leagueName: "상암 리그", active: "payments", badge: 3 },
    controls: {
      leagueName: { type: "text" },
      active: { type: "select", options: ADMIN_KEYS },
      badge: { type: "number", min: 0, max: 99, label: "입금 확인 배지" },
    },
    render: ({ leagueName, active, badge }) => (
      <div className="flex min-h-[420px]">
        <SideNav
          leagueName={leagueName}
          active={active as AdminNavKey}
          badges={Number(badge) > 0 ? { payments: Number(badge) } : undefined}
          className="h-auto"
        />
        <div className="p-lg md:hidden">
          <Note>base(360)에서는 BottomNav가 이 자리입니다. 뷰포트를 768 이상으로 두세요.</Note>
        </div>
      </div>
    ),
  }),
  defineStory({
    id: "top-nav",
    name: "TopNav",
    group: "navigation",
    figma: "206:114",
    description: "lg(1280) 전용. 뷰포트를 1280으로 두세요.",
    defaults: { active: "games", unreadCount: 2 },
    controls: {
      active: { type: "select", options: PLAYER_KEYS },
      unreadCount: { type: "number", min: 0, max: 99, label: "알림함 미읽음" },
    },
    render: ({ active, unreadCount }) => (
      <div className="min-h-[120px]">
        <TopNav active={active as PlayerNavKey} unreadCount={Number(unreadCount)} />
        <div className="p-lg lg:hidden">
          <Note>lg 미만에서는 BottomNav가 이 자리입니다.</Note>
        </div>
      </div>
    ),
  }),
  defineStory({
    id: "page-header",
    name: "PageHeader",
    group: "navigation",
    figma: "186:2107",
    defaults: {
      title: "입금 확인",
      meta: "상암 리그 · 2026년 9월 3일 (수)",
      back: false,
      actions: "one",
    },
    controls: {
      title: { type: "text" },
      meta: { type: "text", label: "메타 (비우면 숨김)" },
      back: { type: "boolean", label: "뒤로가기" },
      actions: { type: "select", options: ["none", "one", "two"] },
    },
    render: ({ title, meta, back, actions }) => (
      <div className="p-lg">
        <PageHeader
          title={title}
          meta={meta || undefined}
          backHref={back ? "#" : undefined}
          actions={
            actions === "none" ? undefined : (
              <>
                {actions === "two" ? (
                  <Button variant="secondary" size="medium">
                    취소
                  </Button>
                ) : null}
                <Button size="medium">경기 등록</Button>
              </>
            )
          }
        />
      </div>
    ),
  }),

  // ---------------------------------------------------------------- layout
  defineStory({
    id: "player-shell",
    name: "PlayerShell",
    group: "layout",
    fullHeight: true,
    description: "base BottomNav → md 640 중앙 + BottomNav → lg TopNav. width=wide는 P-4·P-5 split용.",
    defaults: { active: "games", unreadCount: 2, width: "content", nav: true },
    controls: {
      active: { type: "select", options: PLAYER_KEYS },
      unreadCount: { type: "number", min: 0, max: 99 },
      width: { type: "select", options: ["content", "wide"], label: "lg 본문 폭" },
      nav: { type: "boolean", label: "내비 표시 (P-1·P-2는 끔)" },
    },
    render: ({ active, unreadCount, width, nav }) => (
      <PlayerShell
        active={active as PlayerNavKey}
        unreadCount={Number(unreadCount)}
        width={width as "content" | "wide"}
        nav={nav}
      >
        <Container className="py-lg">
          <h1 className="type-heading-lg text-text-default">경기 목록</h1>
        </Container>
        <SampleMatchRows link />
        {width === "wide" ? (
          <>
            <SectionBand />
            <Container className="py-2xl">
              <Split variant="info">
                <div className="flex flex-col gap-lg">
                  <h2 className="type-heading-md text-text-default">경기 정보</h2>
                  <Button fullWidth>신청하기</Button>
                </div>
                <Split variant="even">
                  {["선공 (3루 덕아웃) · 1/3", "후공 (1루 덕아웃) · 0/3"].map((team) => (
                    <div key={team} className="flex flex-col">
                      <span className="pb-sm type-label-md text-text-secondary">{team}</span>
                      <PositionSlot index={1} position="선발" state="filled" participant="김도현" />
                      <PositionSlot index={2} position="구원" state="empty" />
                      <PositionSlot index={3} position="포수" state="empty" />
                    </div>
                  ))}
                </Split>
              </Split>
            </Container>
          </>
        ) : null}
      </PlayerShell>
    ),
  }),
  defineStory({
    id: "admin-shell",
    name: "AdminShell",
    group: "layout",
    fullHeight: true,
    description: "base BottomNav 3탭 → md 레일 72 + 640 중앙 → lg 풀 240 + 본문 976.",
    defaults: { leagueName: "상암 리그", active: "payments", badge: 3 },
    controls: {
      leagueName: { type: "text" },
      active: { type: "select", options: ADMIN_KEYS },
      badge: { type: "number", min: 0, max: 99, label: "입금 확인 배지" },
    },
    render: ({ leagueName, active, badge }) => (
      <AdminShell
        leagueName={leagueName}
        active={active as AdminNavKey}
        badges={Number(badge) > 0 ? { payments: Number(badge) } : undefined}
      >
        <div className="px-lg pt-lg md:px-0 md:pt-0">
          <PageHeader
            title="입금 확인"
            meta="상암 리그 · 2026년 9월 3일 (수)"
            actions={<Button size="medium">경기 등록</Button>}
          />
        </div>
        <div className="hidden gap-lg pb-2xl lg:grid lg:grid-cols-3">
          <StatTile label="입금 확인 대기" value={Number(badge)} href="#" />
          <StatTile label="오늘 경기" value={1} unit="경기" />
          <StatTile label="정지 해제 요청" value={0} />
        </div>
        <div className="lg:hidden">
          {[1, 2, 3].map((i) => (
            <ReservationRow
              key={i}
              href="#"
              venue="김철수 · 34,000원"
              datetime="9/6(토) 19:00 · 선공 3루 홍길동 외 2자리"
              status="PAYMENT_SUBMITTED"
            />
          ))}
        </div>
        <div className="hidden lg:block">
          <SamplePaymentTable variant="payments" selectedRow={0} />
        </div>
      </AdminShell>
    ),
  }),
  defineStory({
    id: "split",
    name: "Split",
    group: "layout",
    description: "lg 전용 2열. even 1:1 · side 5:3 · info 360:FILL. 그 아래에서는 세로로 쌓입니다.",
    defaults: { variant: "side" },
    controls: { variant: { type: "select", options: ["even", "side", "info"] } },
    render: ({ variant }) => (
      <div className="p-lg">
        <Split variant={variant as "even" | "side" | "info"}>
          {["A", "B"].map((col) => (
            <div
              key={col}
              className="flex h-[160px] items-center justify-center rounded-md border border-dashed border-border-strong type-label-lg text-text-secondary"
            >
              {col}
            </div>
          ))}
        </Split>
      </div>
    ),
  }),
];

export function getStory(id: string): AnyStory | undefined {
  return STORIES.find((s) => s.id === id);
}

export function resolveProps(story: AnyStory, overrides: Record<string, unknown>) {
  const props: Record<string, unknown> = { ...story.defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in story.defaults) props[key] = value;
  }
  return props;
}
