"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

/** A-1 ID/PW 폼. 어느 쪽이 틀렸는지 구분해 알려주지 않습니다 (§A-1). */
export function AdminLoginForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (!id.trim() || !password) {
      setError("아이디 또는 비밀번호를 확인해주세요");
      return;
    }
    // TODO: POST /admin/auth/login — 세션에 leagueId가 실립니다
    router.push("/admin");
  };

  return (
    <form
      className="flex flex-col gap-lg"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TextField
        label="아이디"
        value={id}
        placeholder="sangam-league"
        autoComplete="username"
        onChange={(e) => setId(e.target.value)}
      />
      <TextField
        label="비밀번호"
        type="password"
        value={password}
        autoComplete="current-password"
        error={error}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" fullWidth>
        로그인
      </Button>
    </form>
  );
}
