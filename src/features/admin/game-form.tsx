"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Split } from "@/components/layout/container";
import { PageHeader } from "@/components/navigation/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FilterChip } from "@/components/ui/filter-chip";
import { SectionBand } from "@/components/ui/section-band";
import { SegmentedTab, SegmentedTabs } from "@/components/ui/segmented-tab";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextLink } from "@/components/ui/text-link";
import { ConsoleHeader } from "./console-header";
import { InfoBox, KeyValueRow, SectionTitle } from "@/features/shared/rows";
import { formatPrice, formatTime, toDateKey } from "@/lib/format";
import { routes } from "@/lib/routes";
import {
  FEE_TIER_LABEL,
  FEE_TIERS,
  POSITION_PRESET,
  TEAM_LABEL,
  TEAMS,
  type FeeTier,
  type Game,
  type League,
  type Team,
} from "@/lib/types";

type SlotDraft = { id: string; team: Team; index: number; position: string; enabled: boolean; locked: boolean };

const LEVEL_OPTIONS = ["1~3급", "2~4급", "3~5급", "4~6급"];

function buildSlots(game?: Game): SlotDraft[] {
  return TEAMS.flatMap((team) =>
    POSITION_PRESET.map((p, i) => {
      const id = `${TEAM_LABEL[team]}-${p.position}`;
      const existing = game?.slots.find((s) => s.id === id);
      return {
        id,
        team,
        index: i + 1,
        position: p.position,
        enabled: game ? Boolean(existing) : true,
        locked: Boolean(existing?.participantName),
      };
    }),
  );
}

function initialFields(game: Game | undefined, league: League) {
  return {
    date: game ? toDateKey(game.startsAt) : "",
    time: game ? formatTime(game.startsAt) : "19:00",
    duration: String(game?.durationHours ?? 2),
    venue: game?.venue ?? league.venue,
    level: game?.recommendedLevel ?? "",
    dugout: game ? `선공 ${game.dugout.FIRST} / 후공 ${game.dugout.SECOND}` : "",
    notice: game?.notice ?? "",
  };
}

export type GameFormProps = {
  mode: "create" | "edit";
  game?: Game;
  league: League;
  recentVenues: string[];
  /** 「직전 경기와 동일하게」의 원본. 없으면 버튼을 그리지 않습니다. */
  lastGame?: Game;
};

/**
 * A-4 경기 등록 / 수정 — "며칠에 할 건지"가 첫 질문이라 일시가 첫 필드입니다.
 * 수정 제약: 신청자 있는 슬롯은 끌 수 없고, 신청자가 1명이라도 있으면 참가비를 바꿀 수 없습니다 (§A-4).
 */
export function GameForm({ mode, game, league, recentVenues, lastGame }: GameFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState(() => initialFields(game, league));
  const [slots, setSlots] = useState<SlotDraft[]>(() => buildSlots(game));
  const [fees, setFees] = useState<Record<FeeTier, number>>(game?.fees ?? league.fees);
  const [feeOverride, setFeeOverride] = useState(false);
  const [team, setTeam] = useState<Team>("FIRST");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const feesLocked = mode === "edit" && slots.some((s) => s.locked);
  const set = (key: keyof typeof fields) => (value: string) => setFields({ ...fields, [key]: value });
  const countOf = (t: Team) => slots.filter((s) => s.team === t && s.enabled).length;

  const copyLast = () => {
    if (!lastGame) return;
    setFields({ ...initialFields(lastGame, league), date: "", time: "19:00" });
    setSlots(buildSlots(lastGame).map((s) => ({ ...s, locked: false })));
    setFees(lastGame.fees);
  };

  const toggleSlot = (id: string) =>
    setSlots(slots.map((s) => (s.id === id && !s.locked ? { ...s, enabled: !s.enabled } : s)));

  const save = () => {
    // TODO: POST /admin/games · PATCH /admin/games/:id — 성공 시 A-5
    router.push(routes.adminGame(game?.id ?? "g6"));
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (!fields.date) next.date = "날짜를 골라주세요";
    if (!fields.time) next.time = "시작 시각을 입력해주세요";
    if (!fields.venue.trim()) next.venue = "구장명을 입력해주세요";
    if (!league.accountNumber) next.account = "입금 계좌가 비어 있어 경기를 등록할 수 없어요";
    setErrors(next);
    if (next.account) {
      router.push("/admin/league?focus=account");
      return;
    }
    if (Object.keys(next).length > 0) return;
    const initial = initialFields(game, league);
    const changedSchedule = mode === "edit" && (fields.date !== initial.date || fields.time !== initial.time || fields.venue !== initial.venue);
    if (changedSchedule) {
      setConfirmOpen(true);
      return;
    }
    save();
  };

  const slotRows = (t: Team, compact: boolean) =>
    slots
      .filter((s) => s.team === t)
      .map((s) => (
        <label
          key={s.id}
          className={cn(
            "flex cursor-pointer items-center gap-sm",
            compact ? "h-[32px]" : "h-[52px] border-b border-border-subtle",
            s.locked && "cursor-not-allowed",
          )}
        >
          {compact ? (
            <input
              type="checkbox"
              checked={s.enabled}
              disabled={s.locked}
              onChange={() => toggleSlot(s.id)}
              className="size-[20px] accent-(--color-bg-brand)"
            />
          ) : (
            <span className="w-[22px] shrink-0 text-right type-numeric-price text-text-tertiary">{s.index}</span>
          )}
          <span className={cn("flex-1", compact ? "type-body-md" : "type-body-lg", s.enabled ? "text-text-default" : "text-text-tertiary")}>
            {s.position}
          </span>
          {s.locked ? <span className="type-caption text-text-tertiary">신청자 있음</span> : null}
          {compact ? null : (
            <input
              type="checkbox"
              checked={s.enabled}
              disabled={s.locked}
              onChange={() => toggleSlot(s.id)}
              className="size-[24px] accent-(--color-bg-brand)"
            />
          )}
        </label>
      ));

  return (
    <>
      <ConsoleHeader>
        <PageHeader
          title={mode === "create" ? "경기 등록" : "경기 수정"}
          backHref={mode === "edit" && game ? routes.adminGame(game.id) : "/admin/games"}
          actions={
            mode === "create" && lastGame ? (
              <span className="hidden lg:block">
                <Button variant="secondary" size="medium" onClick={copyLast}>
                  직전 경기와 동일하게
                </Button>
              </span>
            ) : undefined
          }
        />
      </ConsoleHeader>

      {mode === "create" && lastGame ? (
        <div className="flex flex-col gap-sm px-lg pb-2xl lg:hidden">
          <Button variant="secondary" fullWidth onClick={copyLast}>
            직전 경기와 동일하게
          </Button>
          <p className="type-caption text-text-tertiary">구장 · 슬롯 구성 · 참가비 · 안내 문구를 그대로 복사하고 일시만 비웁니다</p>
        </div>
      ) : null}

      <Split variant="side" className="gap-0 lg:gap-3xl">
        <div className="flex flex-col lg:gap-2xl">
          <SectionBand className="lg:hidden" />
          <section className="flex flex-col gap-lg px-lg py-2xl lg:px-0 lg:py-0">
            <h2 className="type-heading-md text-text-default">일시</h2>
            <TextField label="날짜" type="date" value={fields.date} error={errors.date} onChange={(e) => set("date")(e.target.value)} />
            <div className="grid grid-cols-2 gap-md">
              <TextField label="시작 시각" type="time" value={fields.time} error={errors.time} onChange={(e) => set("time")(e.target.value)} />
              <SelectField label="소요 시간" value={fields.duration} onChange={(e) => set("duration")(e.target.value)}>
                {[1, 2, 3, 4].map((h) => (
                  <option key={h} value={String(h)}>
                    {h}시간
                  </option>
                ))}
              </SelectField>
            </div>
          </section>
          <SectionBand className="lg:hidden" />
          <section className="flex flex-col gap-lg px-lg py-2xl lg:px-0 lg:py-0">
            <h2 className="type-heading-md text-text-default">구장</h2>
            <TextField label="구장명" value={fields.venue} error={errors.venue} onChange={(e) => set("venue")(e.target.value)} />
            <div className="flex flex-wrap items-center gap-sm">
              <span className="type-caption text-text-tertiary">최근</span>
              {recentVenues.map((v) => (
                <FilterChip key={v} className="[&>svg]:hidden" selected={fields.venue.startsWith(v)} onClick={() => set("venue")(v)}>
                  {v}
                </FilterChip>
              ))}
            </div>
          </section>
          <SectionBand className="lg:hidden" />
          <section className="flex flex-col gap-lg px-lg py-2xl lg:px-0 lg:py-0">
            <SectionTitle title="표시 정보" description="참가를 막지 않는 안내용 값이에요" />
            <SelectField label="권장 급수" value={fields.level} placeholder="무관" onChange={(e) => set("level")(e.target.value)}>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </SelectField>
            <TextField label="덕아웃 표기" value={fields.dugout} placeholder="선공 3루 / 후공 1루" onChange={(e) => set("dugout")(e.target.value)} />
            <TextField label="안내 문구" value={fields.notice} placeholder="주차는 정문 옆 공영주차장을 이용해주세요." onChange={(e) => set("notice")(e.target.value)} />
          </section>
        </div>

        <div className="flex flex-col lg:gap-2xl">
          <SectionBand className="lg:hidden" />
          <section className="flex flex-col gap-md px-lg py-2xl lg:px-0 lg:py-0">
            <SectionTitle
              title="슬롯 구성"
              aside={
                <span className="type-body-sm text-text-secondary">
                  선공 {countOf("FIRST")}자리 · 후공 {countOf("SECOND")}자리
                </span>
              }
            />
            <div className="flex flex-col lg:hidden">
              <SegmentedTabs>
                {TEAMS.map((t) => (
                  <SegmentedTab key={t} selected={t === team} onClick={() => setTeam(t)}>
                    {TEAM_LABEL[t]}
                  </SegmentedTab>
                ))}
              </SegmentedTabs>
              {slotRows(team, false)}
            </div>
            {/* lg: 같은 순번이 가로로 나란히 — "포수를 양 팀 다 뺐나"가 눈으로 확인됩니다 */}
            <div className="hidden grid-cols-2 gap-lg lg:grid">
              {TEAMS.map((t) => (
                <div key={t} className="flex flex-col">
                  <span className="pb-xs type-label-sm text-text-secondary">{TEAM_LABEL[t]}</span>
                  {slotRows(t, true)}
                </div>
              ))}
            </div>
            <p className="type-caption text-text-tertiary">
              {mode === "edit" ? "신청자가 있는 자리는 뺄 수 없어요. " : ""}순서 변경은 아직 지원하지 않습니다.
            </p>
          </section>
          <SectionBand className="lg:hidden" />
          <section className="flex flex-col gap-md px-lg py-2xl lg:px-0 lg:py-0">
            <SectionTitle
              title="참가비"
              aside={
                feesLocked ? (
                  <span className="type-caption text-text-tertiary">신청자가 있어 수정 불가</span>
                ) : feeOverride ? null : (
                  <TextLink onClick={() => setFeeOverride(true)}>이 경기만 수정</TextLink>
                )
              }
            />
            {feeOverride && !feesLocked ? (
              <div className="grid grid-cols-2 gap-md">
                {FEE_TIERS.map((t) => (
                  <TextField
                    key={t}
                    label={FEE_TIER_LABEL[t]}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    value={fees[t]}
                    onChange={(e) => setFees({ ...fees, [t]: Number(e.target.value) || 0 })}
                  />
                ))}
              </div>
            ) : (
              <InfoBox>
                {FEE_TIERS.map((t) => (
                  <KeyValueRow
                    key={t}
                    label={FEE_TIER_LABEL[t]}
                    value={fees[t] === 0 ? <span className="text-text-brand">무료 0원</span> : formatPrice(fees[t])}
                    mono
                  />
                ))}
              </InfoBox>
            )}
            <p className="type-caption text-text-tertiary">
              리그 설정의 기본값이에요. 신청자가 1명이라도 있으면 금액을 바꿀 수 없습니다.
            </p>
          </section>
        </div>
      </Split>

      {/* 하단 액션 바 — 우측 열이 길어 스크롤이 생기면 제출 버튼이 화면 밖으로 나가므로 sticky */}
      <div className="sticky bottom-[68px] flex gap-sm border-t border-border-subtle bg-bg-default px-lg py-lg md:bottom-0 lg:mt-3xl lg:justify-end lg:px-0">
        <span className="hidden lg:block">
          <Button variant="secondary" href="/admin/games">
            취소
          </Button>
        </span>
        <Button fullWidth onClick={submit} className="lg:w-auto">
          {mode === "create" ? "경기 등록하기" : "수정 저장"}
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="일시·구장을 바꿀까요?"
        description="신청자 전원에게 변경 알림이 발송돼요."
        secondary={{ label: "돌아가기", onClick: () => setConfirmOpen(false) }}
        primary={{
          label: "저장",
          onClick: () => {
            setConfirmOpen(false);
            save();
          },
        }}
      />
    </>
  );
}
