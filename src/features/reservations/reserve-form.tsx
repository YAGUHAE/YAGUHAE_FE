"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionBand } from "@/components/ui/section-band";
import { TextField } from "@/components/ui/text-field";
import { Split } from "@/components/layout/container";
import { PositionBoard } from "@/features/games/position-board";
import { FeeBreakdown } from "@/features/shared/fee-breakdown";
import { InlineNotice } from "@/features/shared/inline-notice";
import { SectionTitle } from "@/features/shared/rows";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import { FEE_TIER_LABEL, TEAM_LABEL, type Game, type Slot } from "@/lib/types";

export type ReserveFormProps = {
  game: Game;
  nickname: string;
  /** P-4 빈 슬롯 탭 진입 시 프리필 (`?slot=선공-3루`). */
  initialSlotId?: string;
};

/** P-5 예약 신청 폼 — 보드 다중 선택 → 참가자 이름 → 입금자명 → 제출. 한 화면 폼이고 단계 라우트가 없습니다 (routing.md §6). */
export function ReserveForm({ game, nickname, initialSlotId }: ReserveFormProps) {
  const router = useRouter();
  const prefilled =
    initialSlotId && game.slots.some((s) => s.id === initialSlotId && !s.participantName) ? initialSlotId : undefined;
  const [selected, setSelected] = useState<string[]>(prefilled ? [prefilled] : []);
  const [names, setNames] = useState<Record<string, string>>(prefilled ? { [prefilled]: nickname } : {});
  const [depositor, setDepositor] = useState(nickname);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedSlots = selected
    .map((id) => game.slots.find((s) => s.id === id))
    .filter((s): s is Slot => Boolean(s));
  const total = selectedSlots.reduce((sum, s) => sum + s.fee, 0);

  const toggle = (slot: Slot) => {
    if (selected.includes(slot.id)) {
      setSelected(selected.filter((id) => id !== slot.id));
      return;
    }
    setSelected([...selected, slot.id]);
    // 첫 슬롯은 본인 닉네임 프리필, 나머지는 동행자 이름 (§P-5)
    setNames({ ...names, [slot.id]: names[slot.id] ?? (selected.length === 0 ? nickname : "") });
  };

  const submit = () => {
    const next: Record<string, string> = {};
    for (const s of selectedSlots) if (!names[s.id]?.trim()) next[s.id] = "참가자 이름을 입력해주세요";
    if (!depositor.trim()) next.depositor = "입금자명을 입력해주세요";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    // TODO: POST /games/:gameId/reservations — 성공 시 expiresAt 수신 후 P-6
    router.push(routes.reservationPayment("r1"));
  };

  const boardProps = {
    game,
    mode: "select" as const,
    title: "자리 고르기",
    description: "여러 자리를 고를 수 있어요",
    selectedIds: selected,
    onToggle: toggle,
  };

  const slotLabel = (s: Slot) => `${TEAM_LABEL[s.team]} ${s.position}`;

  return (
    <div className="flex flex-col lg:px-3xl lg:py-2xl">
      <Split variant="info">
        <div className="flex flex-col">
          <div className="flex flex-col gap-2xs px-lg py-2xl">
            <span className="type-body-md text-text-secondary">{formatDateTime(game.startsAt)}</span>
            <span className="type-heading-md text-text-default">{game.venue}</span>
          </div>
          <SectionBand />

          <div className="px-lg py-2xl lg:hidden">
            <PositionBoard {...boardProps} layout="tabs" />
          </div>

          <div className="px-lg pb-2xl lg:pt-2xl">
            {selectedSlots.length > 0 ? (
              <FeeBreakdown
                rows={selectedSlots.map((s) => ({
                  key: s.id,
                  label: `${slotLabel(s)} · ${FEE_TIER_LABEL[s.feeTier]}`,
                  fee: s.fee,
                }))}
                total={{ label: `${selectedSlots.length}자리 선택`, amount: total }}
              />
            ) : (
              <p className="rounded-md bg-bg-subtle px-lg py-md type-body-md text-text-secondary">
                보드에서 신청할 자리를 골라주세요
              </p>
            )}
          </div>
          <SectionBand />

          <div className="flex flex-col gap-lg px-lg py-2xl">
            <SectionTitle title="참가자 이름" description="여기 적은 이름이 포지션 보드에 그대로 표시돼요" />
            {selectedSlots.length === 0 ? (
              <p className="type-body-md text-text-tertiary">자리를 고르면 입력란이 생겨요</p>
            ) : (
              selectedSlots.map((s, i) => (
                <TextField
                  key={s.id}
                  label={`${slotLabel(s)} · 참가자`}
                  value={names[s.id] ?? ""}
                  placeholder={i === 0 ? nickname : "동행자 이름"}
                  error={errors[s.id]}
                  onChange={(e) => setNames({ ...names, [s.id]: e.target.value })}
                />
              ))
            )}
          </div>
          <SectionBand />

          <div className="flex flex-col gap-lg px-lg py-2xl">
            <TextField
              label="입금자명"
              value={depositor}
              helper="자리가 여러 개여도 입금은 1건이에요"
              error={errors.depositor}
              onChange={(e) => setDepositor(e.target.value)}
            />
            <InlineNotice tone="warning">신청 후 24시간 내 미입금 시 자동 취소돼요</InlineNotice>
          </div>
          <SectionBand />

          <div className="px-lg py-2xl">
            <Button fullWidth disabled={selectedSlots.length === 0 || submitting} onClick={submit}>
              {selectedSlots.length === 0 ? "자리를 골라주세요" : `${selectedSlots.length}자리 신청하기`}
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <PositionBoard {...boardProps} layout="split" />
        </div>
      </Split>
    </div>
  );
}
