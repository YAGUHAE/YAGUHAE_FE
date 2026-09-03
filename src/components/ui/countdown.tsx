"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export type CountdownUrgency = "normal" | "warning" | "critical";

const HOUR = 60 * 60 * 1000;

const TONE: Record<CountdownUrgency, string> = {
  normal: "bg-bg-muted text-text-default",
  warning: "bg-feedback-warning-bg text-feedback-warning-text",
  critical: "bg-feedback-danger-bg text-feedback-danger-text",
};

/** 12시간 전 Warning, 1시간 전 Critical — P-11 알림 발송 타이밍과 동일합니다. */
export function countdownUrgency(remainingMs: number): CountdownUrgency {
  if (remainingMs <= HOUR) return "critical";
  if (remainingMs <= 12 * HOUR) return "warning";
  return "normal";
}

export function formatCountdown(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export type CountdownProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  onExpire?: () => void;
} & (
    | {
        /** 만료 시각 (`expires_at`). 실제 화면은 이쪽을 씁니다. */
        expiresAt: Date | string | number;
        durationMs?: never;
      }
    | {
        /** 마운트 시점부터의 남은 시간. 서버 시각이 없는 데모·미리보기용. */
        durationMs: number;
        expiresAt?: never;
      }
  );

/**
 * Figma `Countdown` — Urgency(Normal/Warning/Critical). P-6 입금 만료 타이머.
 * 서버/클라이언트 시각 차이로 하이드레이션이 어긋나지 않도록 마운트 후에만 숫자를 그립니다.
 */
export function Countdown({
  expiresAt,
  durationMs,
  label = "남은 시간",
  onExpire,
  className,
  ...rest
}: CountdownProps) {
  const target = expiresAt !== undefined ? new Date(expiresAt).getTime() : null;
  const [remaining, setRemaining] = useState<number | null>(null);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const end = target ?? Date.now() + (durationMs ?? 0);
    let fired = false;
    const tick = () => {
      const left = end - Date.now();
      setRemaining(left);
      if (left <= 0 && !fired) {
        fired = true;
        onExpireRef.current?.();
      }
    };
    const id = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(id);
  }, [target, durationMs]);

  const urgency = remaining === null ? "normal" : countdownUrgency(remaining);
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-xs rounded-md p-lg",
        TONE[urgency],
        className,
      )}
      {...rest}
    >
      <span className="flex items-center gap-xs type-body-sm">
        <Icon name="clock" size="sm" />
        {label}
      </span>
      <span className="type-numeric-countdown" aria-live="polite" suppressHydrationWarning>
        {remaining === null ? "--:--:--" : formatCountdown(remaining)}
      </span>
    </div>
  );
}
