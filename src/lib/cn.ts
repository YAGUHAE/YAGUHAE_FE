/**
 * 클래스명을 조건부로 이어 붙입니다. 외부 의존성 없이 falsy 값만 걸러냅니다.
 * (tailwind-merge 같은 충돌 해소는 하지 않으므로 같은 속성의 유틸리티를 중복으로 넘기지 마세요.)
 */
export type ClassValue = string | number | null | false | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
