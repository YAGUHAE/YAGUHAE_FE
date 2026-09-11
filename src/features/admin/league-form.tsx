"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { SectionBand } from "@/components/ui/section-band";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { Toast } from "@/components/ui/toast";
import { InlineNotice } from "@/features/shared/inline-notice";
import { MenuRow, SectionTitle } from "@/features/shared/rows";
import { FEE_TIER_LABEL, FEE_TIERS, type FeeTier, type League } from "@/lib/types";

const BANKS = ["국민은행", "신한은행", "우리은행", "하나은행", "농협", "카카오뱅크", "토스뱅크"];

export type LeagueFormProps = {
  league: League;
  regions: string[];
  /** A-4가 계좌 미입력으로 보낸 경우 — 해당 섹션을 `border/danger`로 강조 (responsive-design.md §6 A-8) */
  focusAccount?: boolean;
};

/** A-8 리그 설정 — 리그 정보 / 입금 계좌(필수) / 티어별 참가비 기본값 / 계정. 폼은 720을 넘기지 않습니다. */
export function LeagueForm({ league, regions, focusAccount = false }: LeagueFormProps) {
  const [form, setForm] = useState({
    name: league.name,
    region: league.region,
    intro: league.intro ?? "",
    venue: league.venue,
    bank: league.bank,
    accountNumber: league.accountNumber,
    accountHolder: league.accountHolder,
  });
  const [fees, setFees] = useState<Record<FeeTier, number>>(league.fees);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });
  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const save = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "리그명을 입력해주세요";
    if (!form.accountNumber.trim()) next.accountNumber = "계좌번호가 없으면 경기를 등록할 수 없어요";
    if (!form.accountHolder.trim()) next.accountHolder = "예금주를 입력해주세요";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // TODO: POST·PATCH /banks → PATCH /leagues/:id (2단계, API 명세서 §4)
    notify("저장했어요");
  };

  const section = "flex flex-col gap-lg px-lg py-2xl";

  return (
    <div className="flex flex-col lg:max-w-[720px]">
      <section className={section}>
        <SectionTitle title="리그 정보" />
        <TextField label="리그명" value={form.name} error={errors.name} onChange={(e) => set("name")(e.target.value)} />
        <SelectField label="활동 지역" value={form.region} onChange={(e) => set("region")(e.target.value)}>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </SelectField>
        <TextField label="소개" value={form.intro} placeholder="리그를 한 줄로 소개해주세요" onChange={(e) => set("intro")(e.target.value)} />
        <TextField label="대표 구장" value={form.venue} helper="경기 등록 시 기본값으로 채워집니다" onChange={(e) => set("venue")(e.target.value)} />
      </section>
      <SectionBand />

      <section className={cn(section, focusAccount && "rounded-md outline-2 outline-border-danger")}>
        <SectionTitle
          title="입금 계좌"
          aside={
            <span className="rounded-sm bg-feedback-danger-bg px-sm py-2xs type-label-sm text-feedback-danger-text">필수</span>
          }
        />
        <SelectField label="은행" value={form.bank} onChange={(e) => set("bank")(e.target.value)}>
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </SelectField>
        <TextField
          label="계좌번호"
          value={form.accountNumber}
          inputMode="numeric"
          error={errors.accountNumber}
          className="[&_input]:type-numeric-price"
          onChange={(e) => set("accountNumber")(e.target.value)}
        />
        <TextField label="예금주" value={form.accountHolder} error={errors.accountHolder} onChange={(e) => set("accountHolder")(e.target.value)} />
        <InlineNotice tone="info">용병의 입금 안내 화면에 그대로 나가는 값이에요. 비어 있으면 경기를 등록할 수 없습니다.</InlineNotice>
      </section>
      <SectionBand />

      <section className={section}>
        <SectionTitle title="티어별 참가비 기본값" />
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
        <p className="type-caption text-text-tertiary">
          여기가 정본이고 경기 생성 시 복사됩니다. 이미 만들어진 경기의 금액은 바뀌지 않아요. 0원은 「무료」로 표기됩니다.
        </p>
      </section>
      <SectionBand />

      <nav className="flex flex-col">
        {/* TODO: 비밀번호 변경 화면·API 미정 */}
        <MenuRow label="비밀번호 변경" onClick={() => notify("비밀번호 변경은 준비 중이에요")} />
        <MenuRow label="로그아웃" href="/admin/login" muted />
      </nav>

      <div className="sticky bottom-[68px] border-t border-border-subtle bg-bg-default px-lg py-lg md:bottom-0 lg:mt-3xl lg:px-0">
        <Button fullWidth onClick={save} className="lg:w-auto">
          저장
        </Button>
      </div>

      {toast ? (
        <Toast type="success" className="fixed inset-x-lg bottom-[84px] z-50 md:inset-x-auto md:right-3xl md:bottom-3xl md:w-[360px]">
          {toast}
        </Toast>
      ) : null}
    </div>
  );
}
