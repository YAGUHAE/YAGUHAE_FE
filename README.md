# YAGUHAE_FE

야구해 플랫폼의 FE 래포입니다.

## 기술 스택

- Next.js 16.2.10 (App Router)
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만들어 주세요.

```bash
cp .env.example .env.local
```

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 라우트 타입 생성 후 타입 검사 |

## 컨벤션

브랜치 전략, 커밋/PR 규칙은 [docs/git-convention.md](docs/git-convention.md)를 확인해주세요.

`pnpm install` 시 husky 훅이 자동 설치되어 커밋 메시지와 브랜치명을 로컬에서 검사합니다.
