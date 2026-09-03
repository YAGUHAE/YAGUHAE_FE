/** P-10 마이페이지 — screen-design-player.md §P-10 */
import { Button } from "@/components/ui/button";
import { SectionBand } from "@/components/ui/section-band";
import { InlineNotice } from "@/features/shared/inline-notice";
import { InfoBox, KeyValueRow, MenuRow, SectionTitle } from "@/features/shared/rows";
import { ScreenHeader } from "@/features/shared/screen-header";
import { getProfile } from "@/lib/data/reservations";

export default async function MyPage() {
  const profile = await getProfile();
  const meta = [profile.region, profile.position, profile.level].filter(Boolean).join(" · ");

  return (
    <>
      <ScreenHeader title="마이페이지" />
      <section className="flex flex-col gap-xs px-lg py-2xl">
        <h2 className="type-heading-lg text-text-default">{profile.nickname}</h2>
        <p className="type-body-md text-text-secondary">{meta}</p>
      </section>
      <SectionBand />

      <section className="flex flex-col gap-md px-lg py-2xl">
        {/* 노쇼 누적·정지 여부는 이 화면 밖 어디에도 노출하지 않습니다 (§P-10 비공개 규칙) */}
        <SectionTitle title="나만 볼 수 있는 기록" />
        <InfoBox>
          <KeyValueRow label="노쇼 누적" value={`${profile.noShowCount}회`} mono />
          <KeyValueRow label="신청 제한" value={profile.isSuspended ? "제한 중" : "없음"} />
        </InfoBox>
        {profile.isSuspended ? (
          <InlineNotice tone="danger">
            노쇼가 누적되어 신청이 제한된 상태예요. 잘못 처리된 것 같다면 문의해주세요.
          </InlineNotice>
        ) : (
          <p className="type-caption text-text-tertiary">다른 사람에게는 보이지 않아요</p>
        )}
        {profile.isSuspended ? (
          <Button variant="secondary" href="mailto:help@yaguhae.app">
            문의하기
          </Button>
        ) : null}
      </section>
      <SectionBand />

      <nav className="flex flex-col">
        {/* P-2와 같은 필드를 수정합니다. 별도 라우트는 routing.md에 없어 온보딩 폼을 재사용합니다 */}
        <MenuRow label="프로필 수정" href="/onboarding" />
        {/* TODO: 문의가 닿을 곳(서비스 운영자 역할)이 확정되면 교체 — 어드민 명세 §6-1 */}
        <MenuRow label="문의하기" href="mailto:help@yaguhae.app" />
        <MenuRow label="로그아웃" href="/login" muted />
      </nav>
    </>
  );
}
