/** P-2 프로필 설정 — screen-design-player.md §P-2. 셸 없음, 640 열만 중앙 (responsive-design.md §7.2). */
import { ScreenHeader } from "@/features/shared/screen-header";
import { OnboardingForm } from "@/features/shared/onboarding-form";
import { REGIONS } from "@/lib/constants";
import { LEVEL_LABEL, LEVELS, POSITION_FULL_LABEL, POSITION_PRESET } from "@/lib/types";

// 선택지 값은 아직 라벨입니다 — 저장 API를 붙일 때 서버 enum으로 바꿔 보냅니다
const POSITIONS = POSITION_PRESET.map((p) => POSITION_FULL_LABEL[p.code]);
const LEVEL_OPTIONS = LEVELS.map((l) => LEVEL_LABEL[l]);

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-content flex-col bg-bg-default md:my-2xl md:min-h-0 lg:my-3xl">
      <ScreenHeader title="프로필 설정" backHref="/login" />
      <OnboardingForm mode="onboarding" regions={REGIONS} positions={POSITIONS} levels={LEVEL_OPTIONS} />
    </div>
  );
}
