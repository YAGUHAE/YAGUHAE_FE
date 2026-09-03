import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const BASE_CLASS =
  "inline-flex h-(--size-touch-min) items-center type-label-md text-text-secondary underline underline-offset-2 hover:text-text-default";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type TextLinkProps = AnchorProps | ButtonProps;

/**
 * Figma `TextLink` — 밑줄 텍스트 링크 (주소 복사 · 지도 보기 · 계좌 복사).
 * 초록이 아니라 text/secondary + 밑줄로 affordance를 만듭니다. 높이 44로 터치 타깃을 지킵니다.
 * `href`가 있으면 링크, 없으면 버튼(복사 등)입니다.
 */
export function TextLink(props: TextLinkProps) {
  if (props.href !== undefined) {
    const { href, className, ...rest } = props;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(BASE_CLASS, className)}
          {...rest}
        />
      );
    }
    return <Link href={href} className={cn(BASE_CLASS, className)} {...rest} />;
  }
  const { className, type = "button", ...rest } = props;
  return <button type={type} className={cn(BASE_CLASS, className)} {...rest} />;
}
