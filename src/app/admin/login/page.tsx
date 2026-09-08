/** A-1 어드민 로그인 — screen-design-admin.md §A-1. `(console)` 밖이라 셸이 없습니다 (routing.md §3-1). */
import Image from "next/image";
import { AdminLoginForm } from "@/features/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-bg-subtle px-lg py-3xl">
      <div className="flex w-full max-w-[400px] flex-col gap-2xl rounded-lg bg-bg-default p-2xl md:shadow-card">
        <div className="flex flex-col items-center gap-sm">
          <Image src="/logo-mark.svg" alt="" width={64} height={64} priority />
          <Image src="/logo-wordmark.svg" alt="야구해" width={120} height={32} priority />
          <span className="type-label-md text-text-secondary">리그 어드민</span>
        </div>
        <AdminLoginForm />
      </div>
      <p className="mt-2xl max-w-[400px] text-center type-caption text-text-tertiary">
        비밀번호를 잊었다면 서비스 운영자에게 문의해주세요.
        <br />
        계정은 리그에 귀속되어 운영자가 바뀌면 넘겨받습니다.
      </p>
    </div>
  );
}
