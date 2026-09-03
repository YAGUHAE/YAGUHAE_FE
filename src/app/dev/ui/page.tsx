import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { DialogPanel } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ICON_NAMES, Icon } from "@/components/ui/icon";
import { InfoItem } from "@/components/ui/info-item";
import { RosterStrip } from "@/components/ui/roster-strip";
import { SectionBand } from "@/components/ui/section-band";
import { SelectField } from "@/components/ui/select-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextField } from "@/components/ui/text-field";
import { TextLink } from "@/components/ui/text-link";
import { Toast } from "@/components/ui/toast";
import { AdminRow } from "@/components/data/admin-row";
import { MatchRow } from "@/components/data/match-row";
import { ReservationRow, ReservationRowAction } from "@/components/data/reservation-row";
import { StatTile } from "@/components/data/stat-tile";
import {
  PAYMENT_TABLE_COLUMNS,
  Table,
  TableCell,
  TablePrimaryCell,
  TableRow,
  TableStatusText,
} from "@/components/data/table";
import { PageHeader } from "@/components/navigation/page-header";
import { RESERVATION_STATUSES } from "@/lib/reservation-status";
import {
  InteractiveBoard,
  InteractiveChips,
  InteractiveDates,
  InteractiveDialog,
  InteractiveRating,
  InteractiveTabs,
} from "./interactive";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-lg">
      <h2 className="type-heading-md text-text-default">{title}</h2>
      {children}
    </section>
  );
}

/** 공용 컴포넌트 갤러리. 개발 확인용이며 제품 라우트가 아닙니다. */
export default function UiGalleryPage() {
  return (
    <div className="mx-auto flex w-full max-w-console flex-col gap-6xl px-lg py-3xl md:px-2xl lg:px-3xl">
      <header className="flex flex-col gap-sm">
        <h1 className="type-display-lg text-text-default">야구해 공용 컴포넌트</h1>
        <p className="type-body-md text-text-secondary">
          Figma 컴포넌트 30종 → React. 레이아웃 셸은{" "}
          <TextLink href="/dev/ui/player">용병 셸</TextLink> ·{" "}
          <TextLink href="/dev/ui/admin">어드민 셸</TextLink>에서 확인합니다.
        </p>
      </header>

      <Section title="Icon (13)">
        <div className="flex flex-wrap gap-lg text-icon-default">
          {ICON_NAMES.map((name) => (
            <div key={name} className="flex w-[72px] flex-col items-center gap-xs">
              <Icon name={name} />
              <span className="type-caption text-text-tertiary">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button (Variant × Size × State)">
        <div className="flex flex-col gap-md">
          {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-md">
              <Button variant={variant}>버튼</Button>
              <Button variant={variant} icon="check">
                버튼
              </Button>
              <Button variant={variant} disabled>
                버튼
              </Button>
              <Button variant={variant} size="medium">
                버튼
              </Button>
              <Button variant={variant} size="medium" icon="check">
                버튼
              </Button>
              <Button variant={variant} size="medium" disabled>
                버튼
              </Button>
            </div>
          ))}
          <Button fullWidth>신청하기</Button>
        </div>
      </Section>

      <Section title="StatusBadge (8)">
        <div className="flex flex-wrap gap-md">
          {RESERVATION_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section title="TextField · SelectField">
        <div className="grid gap-2xl md:grid-cols-2">
          <TextField label="닉네임" placeholder="홍길동" helper="2~10자로 입력해주세요" />
          <TextField label="닉네임" defaultValue="홍길동" error="2~10자로 입력해주세요" />
          <TextField label="닉네임" defaultValue="홍길동" helper="2~10자로 입력해주세요" disabled />
          <SelectField label="활동 지역" placeholder="서울 송파구" helper="주로 활동하는 지역을 선택해주세요">
            <option value="songpa">서울 송파구</option>
            <option value="gangnam">서울 강남구</option>
          </SelectField>
          <SelectField label="활동 지역" defaultValue="songpa" error="주로 활동하는 지역을 선택해주세요">
            <option value="songpa">서울 송파구</option>
          </SelectField>
          <SelectField label="활동 지역" defaultValue="songpa" helper="주로 활동하는 지역을 선택해주세요" disabled>
            <option value="songpa">서울 송파구</option>
          </SelectField>
        </div>
      </Section>

      <Section title="FilterChip · SegmentedTab · DateCell">
        <InteractiveChips />
        <div className="max-w-content">
          <InteractiveTabs />
        </div>
        <InteractiveDates />
      </Section>

      <Section title="TextLink · InfoItem · SectionBand">
        <div className="flex gap-lg">
          <TextLink href="https://map.naver.com">지도 보기</TextLink>
          <TextLink>주소 복사</TextLink>
        </div>
        <div className="grid max-w-content grid-cols-2 gap-md">
          <InfoItem icon="users">10~18명</InfoItem>
          <InfoItem icon="clock">2시간</InfoItem>
          <InfoItem icon="map-pin">인조 잔디</InfoItem>
          <InfoItem icon="banknote">3~5급</InfoItem>
        </div>
        <SectionBand />
      </Section>

      <Section title="MatchRow (Open / Closed / Cancelled)">
        <div className="max-w-content">
          <MatchRow
            href="/games/1"
            time="19:00"
            venue="상암 유소년 야구장"
            capacity="선공 4/11 · 후공 6/11"
            price="13,000원부터"
            meta="3~5급"
            chips={["포수 모집", "3루 모집"]}
            status="OPEN"
          />
          <MatchRow
            time="19:00"
            venue="상암 유소년 야구장"
            capacity="선공 4/11 · 후공 6/11"
            price="13,000원부터"
            meta="3~5급"
            status="CLOSED"
          />
          <MatchRow
            time="19:00"
            venue="상암 유소년 야구장"
            capacity="선공 4/11 · 후공 6/11"
            price="13,000원부터"
            meta="3~5급"
            status="CANCELLED"
          />
        </div>
      </Section>

      <Section title="ReservationRow">
        <div className="max-w-content">
          <ReservationRow
            href="/reservations/1"
            venue="잠실 리틀야구장"
            datetime="2026년 8월 12일 (수) 19:00"
            status="ATTENDED"
            action={<ReservationRowAction>평가하기</ReservationRowAction>}
          />
          <ReservationRow
            href="/reservations/2"
            venue="잠실 리틀야구장"
            datetime="2026년 8월 12일 (수) 19:00"
            status="RESERVED"
          />
        </div>
      </Section>

      <Section title="PositionSlot (Empty / Selected / Filled · 내 신청)">
        <div className="max-w-content">
          <InteractiveBoard />
        </div>
      </Section>

      <Section title="AdminRow · StatTile">
        <div className="max-w-content">
          <AdminRow
            href="/admin/games/1"
            title="홍길동"
            badge="대기"
            description="정지 해제 요청"
            meta="08.03 21:14"
          />
        </div>
        <div className="grid gap-lg md:grid-cols-3">
          <StatTile label="입금 확인 대기" value={0} href="/admin/payments" />
          <StatTile label="입금 확인 대기" value={3} href="/admin/payments" />
          <StatTile label="오늘 경기" value={1} unit="경기" />
        </div>
      </Section>

      <Section title="Table (lg 전용 · TableHeader + TableRow)">
        <Table columns={PAYMENT_TABLE_COLUMNS}>
          {[false, true].map((selected) => (
            <TableRow key={String(selected)} selected={selected}>
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
          <TableRow>
            <TablePrimaryCell title="9/6(토) 19:00" sub="상암 유소년 야구장" />
            <TableCell align="right" className="type-body-sm text-text-secondary">
              4/11
            </TableCell>
            <TableCell className="type-body-sm text-text-secondary">6/11</TableCell>
            <TableCell className="type-body-sm text-text-secondary">2건</TableCell>
            <TableCell>
              <TableStatusText>모집중</TableStatusText>
            </TableCell>
            <TableCell align="right">
              <Icon name="chevron-right" className="ml-auto text-icon-secondary" />
            </TableCell>
          </TableRow>
        </Table>
      </Section>

      <Section title="PageHeader">
        <PageHeader title="입금 확인" />
        <PageHeader
          title="경기 목록"
          meta="상암 리그 · 2026년 9월 3일 (수)"
          actions={<Button size="medium">경기 등록</Button>}
        />
        <PageHeader
          title="경기 상세"
          backHref="/dev/ui"
          actions={
            <>
              <Button variant="secondary" size="medium">
                취소
              </Button>
              <Button size="medium">저장</Button>
            </>
          }
        />
      </Section>

      <Section title="Toast · Countdown · RosterStrip">
        <div className="flex max-w-content flex-col gap-md">
          <Toast type="success">저장되었어요</Toast>
          <Toast type="warning">베스트플레이어는 최대 2명까지 고를 수 있어요</Toast>
          <Toast type="danger">로그인에 실패했어요</Toast>
          <Toast type="info">입금 기한이 1시간 남았어요</Toast>
        </div>
        <div className="grid max-w-content gap-md">
          <Countdown durationMs={(23 * 60 * 60 + 47 * 60 + 12) * 1000} />
          <Countdown durationMs={5 * 60 * 60 * 1000} />
          <Countdown durationMs={30 * 60 * 1000} />
        </div>
        <RosterStrip filled={4} />
      </Section>

      <Section title="Dialog · EmptyState · RatingScale">
        <InteractiveDialog />
        <div className="flex flex-wrap gap-2xl">
          <DialogPanel
            title="이미 같은 시간대에 신청한 경기가 있어요"
            description="기존 예약을 취소한 뒤 다시 신청해주세요."
            primary={{ label: "확인" }}
          />
          <DialogPanel
            title="예약을 취소할까요?"
            description="취소하면 자리가 다른 사람에게 열립니다."
            secondary={{ label: "아니요" }}
            primary={{ label: "취소하기" }}
          />
        </div>
        <div className="max-w-content">
          <EmptyState
            title="조건에 맞는 경기가 없어요"
            description="필터를 조정하면 더 많은 경기를 볼 수 있어요"
            action={
              <Button variant="secondary" size="medium">
                필터 초기화
              </Button>
            }
          />
        </div>
        <div className="max-w-content">
          <InteractiveRating />
        </div>
      </Section>

      <footer className="type-caption text-text-tertiary">
        <Link href="/">← 홈</Link>
      </footer>
    </div>
  );
}
