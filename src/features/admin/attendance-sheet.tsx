"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTab, SegmentedTabs } from "@/components/ui/segmented-tab";
import { Split } from "@/components/layout/container";
import { InlineNotice } from "@/features/shared/inline-notice";
import { InfoPill } from "@/features/shared/pill";
import { TEAM_LABEL, TEAMS, type Game, type Slot, type Team } from "@/lib/types";

type Mark = "present" | "noshow";

export type AttendanceSheetProps = {
  game: Game;
  backHref: string;
};

/**
 * A-7 출석 체크 — 팀 탭은 필터일 뿐 제출 단위가 아닙니다. 양 팀 전원 체크 후 일괄 제출 1회.
 * 미체크가 반대 탭에 숨지 않게 하는 장치 3종: 탭 아래 두 팀 진행률 · 제출 바의 미체크 안내(탭 이동) · 다이얼로그 팀별 요약.
 */
export function AttendanceSheet({ game, backHref }: AttendanceSheetProps) {
  const router = useRouter();
  const [team, setTeam] = useState<Team>("FIRST");
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);

  const roster = (t: Team) => game.slots.filter((s) => s.team === t && s.participantName);
  const checked = (t: Team) => roster(t).filter((s) => marks[s.id]).length;
  const noShow = (t: Team) => roster(t).filter((s) => marks[s.id] === "noshow").length;
  const remaining = (t: Team) => roster(t).length - checked(t);
  const total = TEAMS.reduce((n, t) => n + roster(t).length, 0);
  const totalChecked = TEAMS.reduce((n, t) => n + checked(t), 0);
  const allChecked = total > 0 && totalChecked === total;
  const other: Team = team === "FIRST" ? "SECOND" : "FIRST";

  const mark = (slot: Slot, value: Mark) => setMarks({ ...marks, [slot.id]: value });

  if (done) {
    return (
      <EmptyState
        icon="check"
        title="출석을 제출했어요"
        description="노쇼 처리된 인원은 신청이 제한될 수 있어요"
        action={
          <Button variant="secondary" size="medium" onClick={() => router.push(backHref)}>
            경기 상세로
          </Button>
        }
      />
    );
  }

  // §A-7 미체크 안내 문구 — 반대 탭에만 / 현재 탭에만 / 양쪽 / 없음
  const hint = (() => {
    const here = remaining(team);
    const there = remaining(other);
    if (here === 0 && there === 0) return null;
    if (here === 0) return { text: `${TEAM_LABEL[other]} ${there}명이 아직 미체크예요 ›`, go: other };
    if (there === 0) return { text: `아직 ${here}명 남았어요`, go: null };
    const first = remaining("FIRST");
    const second = remaining("SECOND");
    return { text: `선공 ${first}명 · 후공 ${second}명 미체크 ›`, go: other };
  })();

  const row = (slot: Slot, compact = false) => (
    <div
      key={slot.id}
      className={cn(
        "flex w-full items-center gap-sm border-b border-border-subtle",
        compact ? "h-[44px]" : "h-[60px]",
      )}
    >
      <span className="w-[22px] shrink-0 text-right type-numeric-price text-text-tertiary">{slot.index}</span>
      <span className="w-[32px] shrink-0 type-body-sm text-text-secondary">{slot.position}</span>
      <span className="flex min-w-0 flex-1 items-center gap-sm">
        <span className="truncate type-heading-sm text-text-default">{slot.participantName}</span>
        {slot.proxy ? <InfoPill>대리</InfoPill> : null}
      </span>
      <span className="flex shrink-0 gap-xs">
        <MarkButton active={marks[slot.id] === "present"} tone="present" compact={compact} onClick={() => mark(slot, "present")}>
          참가
        </MarkButton>
        <MarkButton active={marks[slot.id] === "noshow"} tone="noshow" compact={compact} onClick={() => mark(slot, "noshow")}>
          노쇼
        </MarkButton>
      </span>
    </div>
  );

  const teamList = (t: Team, compact: boolean) =>
    roster(t).length === 0 ? (
      <EmptyState icon="users" title="출석 대상이 없어요" description="확정된 참가자가 없는 팀은 제출 조건에서 빠져요" />
    ) : (
      roster(t).map((s) => row(s, compact))
    );

  return (
    <div className="flex flex-col">
      {/* base · md: 팀 탭 + 진행률 한 줄 */}
      <div className="flex flex-col lg:hidden">
        <SegmentedTabs>
          {TEAMS.map((t) => (
            <SegmentedTab key={t} selected={t === team} onClick={() => setTeam(t)}>
              {game.dugout[t] ? `${TEAM_LABEL[t]} (${game.dugout[t]})` : TEAM_LABEL[t]}
            </SegmentedTab>
          ))}
        </SegmentedTabs>
        <p className="px-lg py-md type-body-sm text-text-secondary">
          {TEAMS.map((t) => `${TEAM_LABEL[t]} 체크 ${checked(t)}/${roster(t).length}`).join(" · ")}
        </p>
        <div className="flex flex-col px-lg">{teamList(team, false)}</div>
      </div>

      {/* lg: 두 팀 나란히 — 22행이 한 화면 */}
      <div className="hidden lg:block">
        <Split variant="even">
          {TEAMS.map((t) => (
            <div key={t} className="flex flex-col">
              <span className="pb-sm type-label-md text-text-secondary">
                {TEAM_LABEL[t]} · {roster(t).length}명
              </span>
              {teamList(t, true)}
            </div>
          ))}
        </Split>
      </div>

      {/* 제출 바 — 미체크 안내는 버튼 라벨이 아니라 별도 한 줄 (비활성 버튼은 탭 타깃이 될 수 없으므로) */}
      <div className="sticky bottom-[68px] flex flex-col gap-md border-t border-border-subtle bg-bg-default px-lg py-lg md:bottom-0 lg:mt-3xl lg:flex-row lg:items-center lg:px-0">
        <InlineNotice tone="warning" className="lg:hidden">
          제출하면 되돌릴 수 없어요. 노쇼 처리된 인원은 신청이 제한될 수 있습니다.
        </InlineNotice>
        <span className="hidden type-body-md text-text-secondary lg:inline">
          {total}명 중 {totalChecked}명 체크
        </span>
        <span className="flex-1" />
        {hint ? (
          hint.go ? (
            <button
              type="button"
              onClick={() => setTeam(hint.go!)}
              className="h-(--size-touch-min) text-left type-label-md text-text-brand lg:hidden"
            >
              {hint.text}
            </button>
          ) : (
            <span className="flex h-(--size-touch-min) items-center type-label-md text-text-brand lg:hidden">{hint.text}</span>
          )
        ) : null}
        <Button fullWidth disabled={!allChecked} onClick={() => setConfirmOpen(true)} className="lg:w-auto">
          출석 제출
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="출석을 제출할까요?"
        description={
          <span className="flex flex-col gap-xs">
            <span className="type-heading-sm text-text-default">
              노쇼 {noShow("FIRST") + noShow("SECOND")}명 — 선공 {noShow("FIRST")} · 후공 {noShow("SECOND")}
            </span>
            <span>제출하면 되돌릴 수 없어요. 노쇼 처리된 인원은 신청이 제한될 수 있어요.</span>
          </span>
        }
        secondary={{ label: "돌아가기", onClick: () => setConfirmOpen(false) }}
        primary={{
          label: "제출",
          onClick: () => {
            // TODO: POST /games/:gameId/attendance — 두 팀 일괄 1회
            setConfirmOpen(false);
            setDone(true);
          },
        }}
      />
    </div>
  );
}

function MarkButton({
  active,
  tone,
  compact,
  onClick,
  children,
}: {
  active: boolean;
  tone: Mark;
  compact: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md border type-label-md transition-colors",
        compact ? "h-(--size-control-sm) px-md" : "h-(--size-control-md) min-w-[52px] px-md",
        active
          ? tone === "present"
            ? "border-border-brand bg-bg-brand text-text-on-brand"
            : "border-transparent bg-bg-danger text-text-on-danger"
          : "border-border-default bg-bg-default text-text-secondary hover:bg-bg-hover",
      )}
    >
      {children}
    </button>
  );
}
