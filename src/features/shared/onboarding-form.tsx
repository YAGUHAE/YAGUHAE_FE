"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionBand } from "@/components/ui/section-band";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { SectionTitle } from "@/features/shared/rows";
import type { Profile } from "@/lib/types";

export type OnboardingFormProps = {
  initial?: Partial<Profile>;
  regions: string[];
  positions: string[];
  levels: string[];
  /** 온보딩은 `시작하기` → P-3, 프로필 수정은 `저장` → P-10 */
  mode: "onboarding" | "edit";
};

/** P-2 프로필 설정 — 필수(닉네임·지역·급수) / 선택(포지션·프로필 URL). 급수는 제한이 아니라 정보 (§3.3). */
export function OnboardingForm({ initial, regions, positions, levels, mode }: OnboardingFormProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [url, setUrl] = useState(initial?.profileUrl ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (nickname.trim().length < 2) next.nickname = "닉네임은 2자 이상 입력해주세요";
    if (!region) next.region = "활동 지역을 골라주세요";
    if (!level) next.level = "급수를 골라주세요";
    if (url && !/^https?:\/\/.+/.test(url)) next.url = "http:// 또는 https://로 시작하는 주소만 받아요";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // TODO: PATCH /users/me — 급수·포지션은 라벨 → enum으로
    router.push(mode === "onboarding" ? "/games" : "/my");
  };

  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-lg px-lg py-2xl">
        <SectionTitle title="기본 정보" description="경기 신청에 필요한 정보예요" />
        <TextField
          label="닉네임"
          value={nickname}
          placeholder="야구해123"
          helper="보드와 예약 내역에 표시돼요"
          error={errors.nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <SelectField
          label="활동 지역"
          value={region}
          placeholder="지역 선택"
          helper="주로 경기하는 지역을 골라주세요"
          error={errors.region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </SelectField>
      </section>
      <SectionBand />
      <section className="flex flex-col gap-lg px-lg py-2xl">
        <SectionTitle title="선택 정보" description="나중에 마이페이지에서 바꿀 수 있어요" />
        <SelectField
          label="주 포지션"
          value={position}
          placeholder="포지션 선택"
          helper="신청할 때 기본값으로 제안해요"
          onChange={(e) => setPosition(e.target.value)}
        >
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="본인 주장 급수"
          value={level}
          placeholder="급수 선택"
          helper="참가를 막지는 않아요. 주최자가 팀을 짤 때 참고해요"
          error={errors.level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </SelectField>
        <TextField
          label="게임원 / 유니크플레이 프로필"
          value={url}
          type="url"
          inputMode="url"
          placeholder="https://"
          helper="URL 형식만 확인해요"
          error={errors.url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </section>
      <SectionBand />
      <div className="px-lg py-2xl">
        <Button fullWidth onClick={submit}>
          {mode === "onboarding" ? "시작하기" : "저장하기"}
        </Button>
      </div>
    </div>
  );
}
