import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

/** `은행 · 국민은행` 같은 라벨/값 한 줄. 숫자 값은 `mono`로 Roboto Mono, 한글 값은 본문 서체 (design-system.md §6). */
export function KeyValueRow({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[28px] items-center justify-between gap-md", className)}>
      <span className="shrink-0 type-body-md text-text-secondary">{label}</span>
      <span className={cn("min-w-0 truncate text-right", mono ? "type-numeric-price text-text-default" : "type-body-lg text-text-default")}>
        {value}
      </span>
    </div>
  );
}

/** 회색 면 위 정보 묶음 (P-6 입금 계좌 · P-10 나만 볼 수 있는 기록 · A-4 참가비). */
export function InfoBox({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex w-full flex-col gap-sm rounded-md bg-bg-subtle px-lg py-md", className)}>{children}</div>;
}

/** 섹션 제목 줄 — 좌측 제목 + 우측 보조 (P-4 `포지션 보드 5/11`, P-6 `입금 계좌 · 계좌 복사`). */
export function SectionTitle({
  title,
  aside,
  description,
  className,
}: {
  title: string;
  aside?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-xs", className)}>
      <div className="flex min-h-[28px] items-center justify-between gap-md">
        <h2 className="type-heading-md text-text-default">{title}</h2>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {description ? <p className="type-body-md text-text-secondary">{description}</p> : null}
    </div>
  );
}

/** P-10 메뉴 행 — 라벨 + chevron, 높이 56. `href`가 없으면 버튼. */
export function MenuRow({
  label,
  href,
  onClick,
  muted = false,
  className,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  muted?: boolean;
  className?: string;
}) {
  const cls = cn(
    "flex h-[56px] w-full items-center justify-between border-b border-border-subtle bg-bg-default px-lg text-left transition-colors hover:bg-bg-hover",
    className,
  );
  const inner = (
    <>
      <span className={cn("type-body-lg", muted ? "text-text-tertiary" : "text-text-default")}>{label}</span>
      {muted ? null : <Icon name="chevron-right" size="lg" className="text-icon-default" />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
