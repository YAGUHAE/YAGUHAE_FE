"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingScale, type RatingValue } from "@/components/ui/rating-scale";
import { SectionBand } from "@/components/ui/section-band";
import { Toast } from "@/components/ui/toast";
import { ScreenHeader } from "@/features/shared/screen-header";
import { TEAM_LABEL, type ReviewTarget } from "@/lib/types";
import Link from "next/link";

type Scores = { manner: RatingValue; skill: RatingValue; punctuality: RatingValue };
const EMPTY: Scores = { manner: 0, skill: 0, punctuality: 0 };
const MAX_BEST = 2;

export type ReviewFormProps = {
  targets: ReviewTarget[];
  /** `8월 6일` — 헤더 아래 `선공 유격 · 8월 6일 경기` */
  gameDateLabel: string;
  backHref: string;
};

/** P-9 평가 작성 — 참가자 한 명씩 3척도 + 베스트플레이어(최대 2명). 전원 작성 후 일괄 제출 (§2-1 임시 결정). */
export function ReviewForm({ targets, gameDateLabel, backHref }: ReviewFormProps) {
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, Scores>>({});
  const [best, setBest] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (targets.length === 0 || done) {
    return (
      <>
        <ScreenHeader title="평가 작성" backHref={backHref} />
        <EmptyState
          icon="check"
          title="모든 참가자 평가를 완료했어요"
          description="평가는 상대에게 공개되지 않아요"
          action={
            <Link href={backHref}>
              <Button variant="secondary" size="medium">
                예약 상세로
              </Button>
            </Link>
          }
        />
      </>
    );
  }

  const target = targets[index];
  const current = scores[target.id] ?? EMPTY;
  const complete = current.manner > 0 && current.skill > 0 && current.punctuality > 0;
  const isBest = best.includes(target.id);
  const last = index === targets.length - 1;

  const setScore = (key: keyof Scores) => (value: RatingValue) =>
    setScores({ ...scores, [target.id]: { ...current, [key]: value } });

  const toggleBest = () => {
    if (isBest) {
      setBest(best.filter((id) => id !== target.id));
      return;
    }
    if (best.length >= MAX_BEST) {
      setToast(`베스트플레이어는 최대 ${MAX_BEST}명까지 선택할 수 있어요`);
      window.setTimeout(() => setToast(null), 2000);
      return;
    }
    setBest([...best, target.id]);
  };

  const next = () => {
    if (last) {
      // TODO: 평가 제출 API (미정)
      setDone(true);
      return;
    }
    setIndex(index + 1);
  };

  return (
    <>
      <ScreenHeader
        title="평가 작성"
        backHref={backHref}
        trailing={
          <span className="type-numeric-price text-text-secondary">
            {index + 1} / {targets.length}
          </span>
        }
      />
      <div className="flex flex-col gap-xs px-lg py-2xl">
        <span className="type-body-md text-text-secondary">
          {TEAM_LABEL[target.team]} {target.position} · {gameDateLabel} 경기
        </span>
        <h2 className="type-heading-lg text-text-default">{target.name}</h2>
      </div>
      <SectionBand />
      <div className="flex flex-col gap-2xl px-lg py-2xl">
        <RatingScale label="매너" value={current.manner} onChange={setScore("manner")} />
        <RatingScale label="실력 - 프로필 일치도" value={current.skill} onChange={setScore("skill")} />
        <RatingScale label="시간 준수" value={current.punctuality} onChange={setScore("punctuality")} />
      </div>
      <SectionBand />
      <div className="flex flex-col gap-md px-lg py-2xl">
        <h2 className="type-heading-md text-text-default">베스트플레이어</h2>
        <label className="flex min-h-(--size-touch-min) cursor-pointer items-center gap-md">
          <input
            type="checkbox"
            checked={isBest}
            onChange={toggleBest}
            className="size-[24px] shrink-0 accent-(--color-bg-brand)"
          />
          <span className="type-body-lg text-text-default">이 경기의 베스트플레이어로 뽑기</span>
        </label>
        <p className="type-caption text-text-tertiary">
          최대 {MAX_BEST}명까지 뽑을 수 있어요 · 지금까지 {best.length}명
        </p>
      </div>
      <SectionBand />
      <div className="px-lg py-2xl">
        <Button fullWidth disabled={!complete} onClick={next}>
          {last ? "평가 제출하기" : "다음 참가자"}
        </Button>
      </div>
      {toast ? (
        <Toast type="warning" className="fixed inset-x-lg bottom-[84px] z-50 lg:inset-x-auto lg:right-3xl lg:bottom-3xl lg:w-[360px]">
          {toast}
        </Toast>
      ) : null}
    </>
  );
}
