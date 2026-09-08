import { AdminShell } from "@/components/layout/admin-shell";
import { getLeagueSummary } from "@/lib/data/admin";

/**
 * 어드민 콘솔 셸 (routing.md §3-2). `/admin/login`은 이 그룹 밖입니다.
 * ⚠️ 입금 확정·거절 서버 액션에서 `revalidatePath('/admin', 'layout')`을 걸어야 배지 숫자가 갱신됩니다.
 */
export default async function ConsoleLayout({ children }: LayoutProps<"/admin">) {
  const { name, pendingPayments } = await getLeagueSummary();
  return (
    <AdminShell leagueName={name} badges={{ payments: pendingPayments || undefined }}>
      {children}
    </AdminShell>
  );
}
