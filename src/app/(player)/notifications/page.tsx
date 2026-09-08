/** P-11 알림함 — screen-design-player.md §P-11 */
import Link from "next/link";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconName } from "@/components/ui/icon";
import { ScreenHeader } from "@/features/shared/screen-header";
import { getServerNow } from "@/lib/data/clock";
import { listNotifications } from "@/lib/data/reservations";
import { formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { NotificationType } from "@/lib/types";

const ICON: Record<NotificationType, { name: IconName; className: string }> = {
  PAYMENT_DUE_1H: { name: "clock", className: "bg-feedback-warning-bg text-feedback-warning-text" },
  PAYMENT_DUE_12H: { name: "clock", className: "bg-bg-muted text-icon-secondary" },
  APPROVED: { name: "check", className: "bg-feedback-success-bg text-feedback-success-text" },
  REJECTED: { name: "alert-triangle", className: "bg-feedback-danger-bg text-feedback-danger-text" },
  NO_SHOW: { name: "alert-triangle", className: "bg-feedback-danger-bg text-feedback-danger-text" },
};

/** 알림 유형별 목적지 — 만료 임박은 P-6, 나머지는 P-8 (routing.md §7-4 임시 표) */
function destination(type: NotificationType, reservationId?: string) {
  if (!reservationId) return undefined;
  return type === "PAYMENT_DUE_1H" || type === "PAYMENT_DUE_12H"
    ? routes.reservationPayment(reservationId)
    : routes.reservation(reservationId);
}

export default async function NotificationsPage() {
  const [notifications, now] = await Promise.all([listNotifications(), getServerNow()]);

  return (
    <>
      <ScreenHeader title="알림함" />
      {notifications.length === 0 ? (
        <EmptyState icon="bell" title="새로운 알림이 없어요" />
      ) : (
        <ul className="flex flex-col">
          {notifications.map((n) => {
            const icon = ICON[n.type];
            const href = destination(n.type, n.reservationId);
            const body = (
              <>
                <span className={cn("flex size-[40px] shrink-0 items-center justify-center rounded-full", icon.className)}>
                  <Icon name={icon.name} size="md" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2xs">
                  <span className={cn("type-body-lg", n.read ? "text-text-secondary" : "font-bold text-text-default")}>
                    {n.title}
                  </span>
                  <span className="type-body-sm text-text-secondary">{n.description}</span>
                  <span className="type-caption text-text-tertiary">{formatRelative(n.createdAt, now)}</span>
                </span>
                {/* 미읽음은 배경 틴트가 아니라 점 — 아이콘 배지 색과 충돌하지 않게 (design-system.md §6) */}
                {!n.read ? <span aria-label="읽지 않음" className="mt-sm size-[8px] shrink-0 rounded-full bg-bg-brand" /> : null}
              </>
            );
            const cls = cn(
              "flex w-full items-start gap-md border-b border-border-subtle px-lg py-lg text-left",
              n.read ? "bg-bg-subtle" : "bg-bg-default",
              href && "transition-colors hover:bg-bg-hover",
            );
            return (
              <li key={n.id}>
                {href ? (
                  <Link href={href} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
