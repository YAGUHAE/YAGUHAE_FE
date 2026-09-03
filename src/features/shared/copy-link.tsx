"use client";

import { useState } from "react";
import { TextLink } from "@/components/ui/text-link";

/** `주소 복사` · `계좌 복사` — 복사 후 2초간 라벨이 `복사됨`으로 바뀝니다. */
export function CopyLink({ text, children }: { text: string; children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <TextLink
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* 권한이 없으면 값이 화면에 그대로 있으므로 조용히 넘어갑니다 */
        }
      }}
    >
      {copied ? "복사됨" : children}
    </TextLink>
  );
}
