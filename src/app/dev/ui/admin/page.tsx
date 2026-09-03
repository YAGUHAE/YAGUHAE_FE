import { AdminShell } from "@/components/layout/admin-shell";
import { AdminRow } from "@/components/data/admin-row";
import { StatTile } from "@/components/data/stat-tile";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  PAYMENT_TABLE_COLUMNS,
  Table,
  TableCell,
  TablePrimaryCell,
  TableRow,
} from "@/components/data/table";
import { PageHeader } from "@/components/navigation/page-header";
import { ReservationRow } from "@/components/data/reservation-row";

/** 어드민 셸 확인용 — base BottomNav 3탭 · md 레일 · lg 풀 사이드바 + 테이블. */
export default function AdminShellDemoPage() {
  return (
    <AdminShell leagueName="상암 리그" active="payments" badges={{ payments: 3 }}>
      <div className="px-lg pt-lg md:px-0 md:pt-0">
        <PageHeader
          title="입금 확인"
          meta="상암 리그 · 2026년 9월 3일 (수)"
          actions={<Button size="medium">경기 등록</Button>}
        />
      </div>
      <div className="hidden gap-lg pb-2xl lg:grid lg:grid-cols-3">
        <StatTile label="입금 확인 대기" value={3} href="/dev/ui/admin" />
        <StatTile label="오늘 경기" value={1} unit="경기" />
        <StatTile label="정지 해제 요청" value={0} />
      </div>
      {/* base · md: 행 표현 */}
      <div className="lg:hidden">
        {[1, 2, 3].map((i) => (
          <ReservationRow
            key={i}
            href="/dev/ui/admin"
            venue={`김철수 · 34,000원`}
            datetime="9/6(토) 19:00 · 선공 3루 홍길동 외 2자리"
            status="PAYMENT_SUBMITTED"
          />
        ))}
        <AdminRow title="홍길동" badge="대기" description="정지 해제 요청" meta="08.03 21:14" />
      </div>
      {/* lg: 테이블 표현 */}
      <div className="hidden lg:block">
        <Table columns={PAYMENT_TABLE_COLUMNS}>
          {[1, 2, 3].map((i) => (
            <TableRow key={i} selected={i === 2}>
              <TablePrimaryCell title="김철수" sub="선공 3루 홍길동 · 외 2자리" />
              <TableCell align="right" className="type-numeric-price text-text-default">
                34,000원
              </TableCell>
              <TableCell className="type-body-sm text-text-secondary">9/6(토) 19:00</TableCell>
              <TableCell className="type-body-sm text-text-secondary">8/4 21:10</TableCell>
              <TableCell>
                <StatusBadge status="PAYMENT_SUBMITTED" />
              </TableCell>
              <TableCell align="right">
                <span className="flex justify-end gap-sm">
                  <Button variant="secondary" size="medium">
                    거절
                  </Button>
                  <Button size="medium">입금 완료</Button>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </AdminShell>
  );
}
