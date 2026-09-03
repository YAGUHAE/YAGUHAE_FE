/** P-1 카카오 로그인 — screen-design-player.md §P-1. 디자인 시스템에서 유일하게 `bg/brand-strong`이 전면에 깔리는 화면. */
import Image from "next/image";
import Link from "next/link";
import { RosterStrip } from "@/components/ui/roster-strip";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-bg-brand-strong px-lg py-3xl text-text-on-brand-strong">
      <div className="flex w-full max-w-[400px] flex-1 flex-col items-center justify-center gap-5xl">
        <div className="flex flex-col items-center gap-lg">
          <Image src="/logo-mark.svg" alt="" width={96} height={96} priority />
          <Image src="/logo-wordmark-inverse.svg" alt="야구해" width={210} height={56} priority />
          <p className="type-body-lg">야구 게스트 모집 · 예약</p>
        </div>
        {/* 히어로는 로고가 아니라 한 칸 비어 있는 로스터 — 서비스의 존재 이유 (design-system.md §6) */}
        <div className="flex flex-col items-center gap-md">
          <RosterStrip filled={9} total={10} className="[&>span]:bg-gray-0/20 [&>span>span]:bg-green-300" />
          <p className="type-body-sm opacity-80">한 자리가 비어 있어요</p>
        </div>
      </div>
      <div className="flex w-full max-w-[400px] flex-col items-center gap-md">
        {/* TODO: 카카오 OAuth. 콜백에서 신규 유저는 /onboarding, 기존 유저는 /games로 redirect (routing.md §4-3) */}
        <Link
          href="/onboarding"
          className="flex h-(--size-control-lg) w-full items-center justify-center rounded-md bg-bg-kakao type-label-lg text-text-on-kakao transition-opacity hover:opacity-90"
        >
          카카오로 시작하기
        </Link>
        <p className="text-center type-caption opacity-80">계속하면 이용약관과 개인정보 처리방침에 동의하게 돼요</p>
      </div>
    </div>
  );
}
