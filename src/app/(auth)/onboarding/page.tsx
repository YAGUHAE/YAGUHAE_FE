/** P-2 프로필 설정 — screen-design-player.md §P-2. 셸 없음, 640 열만 중앙 (responsive-design.md §7.2). */
import { ScreenHeader } from "@/features/shared/screen-header";
import { OnboardingForm } from "@/features/shared/onboarding-form";
import { LEVELS, POSITIONS, REGIONS } from "@/mocks/data";

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-content flex-col bg-bg-default md:my-2xl md:min-h-0 lg:my-3xl">
      <ScreenHeader title="프로필 설정" backHref="/login" />
      <OnboardingForm mode="onboarding" regions={REGIONS} positions={POSITIONS} levels={LEVELS} />
    </div>
  );
}
