"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateCell } from "@/components/ui/date-cell";
import { Dialog } from "@/components/ui/dialog";
import { FilterChip } from "@/components/ui/filter-chip";
import { RatingScale, type RatingValue } from "@/components/ui/rating-scale";
import { SegmentedTab, SegmentedTabs } from "@/components/ui/segmented-tab";
import { PositionSlot } from "@/components/data/position-slot";

export function InteractiveDialog() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="secondary" size="medium" onClick={() => setOpen(true)}>
        Dialog 열기
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="이미 같은 시간대에 신청한 경기가 있어요"
        description="기존 예약을 취소한 뒤 다시 신청해주세요."
        secondary={{ label: "닫기", onClick: () => setOpen(false) }}
        primary={{ label: "내 예약 보기", onClick: () => setOpen(false) }}
      />
    </div>
  );
}

export function InteractiveRating() {
  const [value, setValue] = useState<RatingValue>(0);
  return <RatingScale label="매너 점수" value={value} onChange={setValue} />;
}

export function InteractiveTabs() {
  const [tab, setTab] = useState(0);
  return (
    <SegmentedTabs>
      {["진행중", "완료", "종료·취소"].map((label, i) => (
        <SegmentedTab key={label} selected={tab === i} onClick={() => setTab(i)}>
          {label}
        </SegmentedTab>
      ))}
    </SegmentedTabs>
  );
}

export function InteractiveChips() {
  const [selected, setSelected] = useState("region");
  return (
    <div className="flex gap-sm">
      <FilterChip selected={selected === "region"} onClick={() => setSelected("region")}>
        서울 송파구
      </FilterChip>
      <FilterChip selected={selected === "level"} onClick={() => setSelected("level")}>
        급수
      </FilterChip>
      <FilterChip disabled>마감 가리기</FilterChip>
    </div>
  );
}

export function InteractiveDates() {
  const [picked, setPicked] = useState(2);
  const base = new Date(2026, 8, 3);
  return (
    <div className="flex gap-xs">
      {Array.from({ length: 7 }, (_, i) => {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        return <DateCell key={i} date={d} selected={picked === i} onClick={() => setPicked(i)} />;
      })}
    </div>
  );
}

const SLOTS = ["선발", "구원", "포수", "1루", "2루", "3루", "유격", "좌익", "중견", "우익", "지명"];

export function InteractiveBoard() {
  const [selected, setSelected] = useState<number[]>([1]);
  const filled: Record<number, string> = { 0: "김도현", 4: "최민식" };
  return (
    <div className="flex w-full flex-col">
      {SLOTS.map((pos, i) => {
        const isFilled = i in filled;
        const isSelected = selected.includes(i);
        return (
          <PositionSlot
            key={pos}
            index={i + 1}
            position={pos}
            state={isFilled ? "filled" : isSelected ? "selected" : "empty"}
            participant={filled[i]}
            mine={i === 0}
            onClick={
              isFilled
                ? undefined
                : () =>
                    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
            }
          />
        );
      })}
    </div>
  );
}
