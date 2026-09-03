import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import { FEE_TIER_LABEL, FEE_TIERS, type FeeTier } from "@/lib/types";

/** P-4 티어 4종 한 줄 — `투수 13,000 · 포수 무료 · 야수 17,000 · 지타 13,000`. `무료`만 강조 (§3.1). */
export function FeeSummary({ fees, className }: { fees: Record<FeeTier, number>; className?: string }) {
  return (
    <p className={cn("type-body-md text-text-default", className)}>
      {FEE_TIERS.map((tier, i) => (
        <Fragment key={tier}>
          {i > 0 ? <span className="text-text-tertiary"> · </span> : null}
          {FEE_TIER_LABEL[tier]}{" "}
          <span className={cn("font-mono font-medium tabular-nums", fees[tier] === 0 && "font-sans font-bold text-text-brand")}>
            {formatAmount(fees[tier])}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
