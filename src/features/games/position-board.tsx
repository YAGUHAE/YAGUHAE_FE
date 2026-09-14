"use client";

import { useState, type ReactNode } from "react";
import { PositionSlot } from "@/components/data/position-slot";
import { SegmentedTab, SegmentedTabs } from "@/components/ui/segmented-tab";
import { Split } from "@/components/layout/container";
import { TEAM_LABEL, TEAMS, type Game, type Slot, type Team } from "@/lib/types";

export type BoardMode = "view" | "select" | "admin";

export type PositionBoardProps = {
  game: Pick<Game, "slots" | "dugout">;
  /** `view` P-4 (빈 슬롯 = 진입점) · `select` P-5 (체크박스) · `admin` A-5 (탭 불가, `비어 있음`) */
  mode: BoardMode;
  /**
   * `tabs` 모든 구간 팀 탭 · `split` 모든 구간 2열 · `responsive` lg 미만 탭, lg 2열.
   * 화면이 base·lg에서 보드 위치를 달리 두면(P-4·P-5) 인스턴스 둘을 `tabs`·`split`으로 나눠 그립니다.
   */
  layout?: "tabs" | "split" | "responsive";
  title?: string;
  description?: ReactNode;
  selectedIds?: string[];
  onToggle?: (slot: Slot) => void;
  onEmptyClick?: (slot: Slot) => void;
  initialTeam?: Team;
  className?: string;
};

/** 덕아웃은 선택 입력이라 비어 있으면 괄호를 붙이지 않습니다. */
function teamLabel(game: Pick<Game, "dugout">, team: Team) {
  return game.dugout[team] ? `${TEAM_LABEL[team]} (${game.dugout[team]})` : TEAM_LABEL[team];
}

function count(slots: Slot[]) {
  return `${slots.filter((s) => s.participantName).length}/${slots.length}`;
}

/**
 * 팀별 포지션 보드 — P-4 · P-5 · A-5가 공유하는 시그니처 요소.
 * 선공/후공 탭은 클라이언트 state입니다 (routing.md §3-7 예외). P-5는 팀을 오가도 선택이 유지됩니다.
 */
export function PositionBoard({
  game,
  mode,
  layout = "responsive",
  title,
  description,
  selectedIds = [],
  onToggle,
  onEmptyClick,
  initialTeam = "FIRST",
  className,
}: PositionBoardProps) {
  const [team, setTeam] = useState<Team>(initialTeam);
  const byTeam = (t: Team) => game.slots.filter((s) => s.team === t);

  const renderSlot = (slot: Slot) => {
    const filled = Boolean(slot.participantName);
    const selected = selectedIds.includes(slot.id);
    const state = filled ? "filled" : selected ? "selected" : "empty";
    const clickable =
      !filled && ((mode === "select" && onToggle) || (mode === "view" && onEmptyClick));
    return (
      <PositionSlot
        key={slot.id}
        index={slot.index}
        position={slot.position}
        state={state}
        participant={slot.participantName}
        mine={slot.isMine}
        emptyTone={mode === "admin" ? "muted" : "brand"}
        emptyLabel={mode === "admin" ? "비어 있음" : "신청 가능"}
        onClick={
          clickable
            ? () => (mode === "select" ? onToggle?.(slot) : onEmptyClick?.(slot))
            : undefined
        }
      />
    );
  };

  const head = title ? (
    <div className="flex items-center justify-between gap-md pb-md">
      <h2 className="type-heading-md text-text-default">{title}</h2>
      {description ? (
        <span className="type-body-sm text-text-secondary">{description}</span>
      ) : null}
    </div>
  ) : null;

  const tabs = (
    <div className="flex w-full flex-col">
      {title ? (
        <div className="flex items-center justify-between gap-md pb-md">
          <h2 className="type-heading-md text-text-default">{title}</h2>
          {description ? (
            <span className="type-body-sm text-text-secondary">{description}</span>
          ) : (
            <span className="type-numeric-price text-text-default">{count(byTeam(team))}</span>
          )}
        </div>
      ) : null}
      <SegmentedTabs>
        {TEAMS.map((t) => (
          <SegmentedTab key={t} selected={t === team} onClick={() => setTeam(t)}>
            {teamLabel(game, t)}
          </SegmentedTab>
        ))}
      </SegmentedTabs>
      <div className="flex flex-col">{byTeam(team).map(renderSlot)}</div>
    </div>
  );

  const split = (
    <div className="flex w-full flex-col">
      {head}
      <Split variant="even">
        {TEAMS.map((t) => (
          <div key={t} className="flex flex-col">
            <span className="pb-sm type-label-md text-text-secondary">
              {teamLabel(game, t)} · {count(byTeam(t))}
            </span>
            {byTeam(t).map(renderSlot)}
          </div>
        ))}
      </Split>
    </div>
  );

  if (layout === "tabs") return <div className={className}>{tabs}</div>;
  if (layout === "split") return <div className={className}>{split}</div>;
  return (
    <div className={className}>
      <div className="lg:hidden">{tabs}</div>
      <div className="hidden lg:block">{split}</div>
    </div>
  );
}
