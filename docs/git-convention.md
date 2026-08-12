# Git 컨벤션

야구해 FE 레포의 브랜치 전략과 커밋/PR 규칙입니다.

---

## 1. 브랜치 전략

GitHub Flow를 기반으로 `dev` 통합 브랜치를 하나 둔 **Git Flow Lite** 방식입니다.

```
main        ●──────────────●──────────────●        배포 (production)
             ╲            ╱ ╲            ╱
dev           ●───●───●──●   ●───●───●──●          통합 (개발 서버)
               ╲ ╱   ╲ ╱      ╲ ╱   ╲ ╱
feat/#12       ●─●     ●        ●     ●            기능 작업
```

### 상시 브랜치

| 브랜치 | 역할 | 규칙 |
| --- | --- | --- |
| `main` | 배포 가능한 상태만 유지 | 직접 push 금지. `dev`에서 오는 PR만 머지 |
| `dev` | 기능이 모이는 통합 브랜치 | 직접 push 금지. 작업 브랜치 PR만 머지 |

### 작업 브랜치

`dev`에서 분기하고, 작업이 끝나면 `dev`로 PR을 올립니다. 머지 후에는 삭제합니다.

```
<type>/#<이슈번호>-<설명>
```

- `type`은 아래 커밋 타입과 동일한 값을 씁니다 (`hotfix`, `release` 추가).
- 설명은 **영문 소문자 + 하이픈(kebab-case)** 으로 짧게 적습니다.

```bash
feat/#12-player-list
fix/#31-login-redirect
design/#45-admin-sidebar
refactor/#52-api-client
```

### 브랜치 흐름

```bash
# 1. dev 최신화 후 분기
git switch dev
git pull origin dev
git switch -c feat/#12-player-list

# 2. 작업 & 커밋
git add .
git commit -m "feat: 선수 목록 화면 추가"

# 3. push 후 dev로 PR
git push -u origin feat/#12-player-list
```

### 긴급 수정 (hotfix)

배포된 `main`에 문제가 있을 때만 사용합니다. `main`에서 분기해 `main`으로 PR을 올리고, 머지 후 `dev`에도 반영합니다.

```bash
git switch main && git pull origin main
git switch -c hotfix/#77-payment-error
# 머지 후
git switch dev && git merge main
```

### 머지 방식

| 대상 | 방식 | 이유 |
| --- | --- | --- |
| 작업 브랜치 → `dev` | **Squash and merge** | 기능 단위로 커밋 1개, `dev` 히스토리를 깔끔하게 유지 |
| `dev` → `main` | **Merge commit** | 배포 시점이 히스토리에 남음 |

---

## 2. 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 기반이며, **본문은 한글**로 작성합니다.

```
<type>: <제목>

<본문(선택)>

<꼬리말(선택)>
```

### 규칙

- 타입 뒤에는 `: `(콜론 + 공백) 을 붙입니다.
- 제목은 **72자 이내**, 마침표를 찍지 않습니다.
- 제목은 "무엇을 했는지"를 명령형/명사형으로 적습니다. (`추가`, `수정`, `제거`)
- 본문이 필요하면 제목과 **한 줄 띄우고** 작성합니다. "왜" 그렇게 했는지를 적습니다.
- 하나의 커밋에는 하나의 관심사만 담습니다.

### 타입

| 타입 | 설명 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `design` | UI/스타일 구현 및 변경 (CSS, 레이아웃) |
| `refactor` | 기능 변화 없는 코드 구조 개선 |
| `style` | 포매팅, 세미콜론 등 코드 의미에 영향 없는 변경 |
| `docs` | 문서 수정 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드, 패키지 매니저, 설정 파일 등 기타 잡무 |
| `ci` | CI/CD 설정 변경 |
| `perf` | 성능 개선 |
| `revert` | 이전 커밋 되돌리기 |

### 예시

```
feat: 선수 목록 무한 스크롤 구현

한 번에 전체를 불러오면 초기 로딩이 느려서
Intersection Observer 기반 페이지네이션으로 변경했다.

Refs: #12
```

```
fix: 로그인 후 리다이렉트되지 않는 문제 수정
design: 관리자 사이드바 반응형 대응
chore: husky, commitlint 설정 추가
```

### 꼬리말

| 키워드 | 용도 |
| --- | --- |
| `Refs: #12` | 관련 이슈 참조 |
| `Closes: #12` | 이슈 자동 종료 |
| `BREAKING CHANGE:` | 하위 호환이 깨지는 변경 |

---

## 3. PR 컨벤션

### 제목

커밋 제목과 동일한 형식을 씁니다.

```
<type>: <제목>
```

```
feat: 선수 목록 화면 구현
```

번호를 직접 붙이지 않습니다. Squash 머지 시 GitHub이 제목 뒤에 **PR 번호를 자동으로 덧붙이기** 때문에, 직접 쓰면 `feat: 선수 목록 화면 구현 (#12) (#13)`처럼 번호가 두 번 붙습니다. 이슈 연결은 본문의 `Closes #12`가 담당합니다.

> PR 제목은 CI에서도 검사합니다. Squash 머지 후 `dev`에 남는 커밋 메시지가 곧 이 제목이기 때문입니다.

### 규칙

- PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md` 템플릿을 채웁니다.
- **리뷰어 1명 이상 approve** 후 머지합니다.
- 리뷰 코멘트는 반드시 resolve 하거나 답변을 남깁니다.
- 머지는 **PR 작성자**가 합니다.
- PR이 너무 커지지 않게 (변경 500줄 내외) 작업 단위를 쪼갭니다.

### 리뷰 규칙

코멘트 앞에 태그를 붙여 강도를 표현합니다.

| 태그 | 의미 |
| --- | --- |
| `P1` | 머지 전 반드시 반영 |
| `P2` | 반영을 권장, 논의 후 결정 |
| `P3` | 단순 제안. 반영하지 않아도 무방 |
| `Q` | 질문 |

---

## 4. 이슈 컨벤션

- 이슈는 `.github/ISSUE_TEMPLATE`의 템플릿(버그 리포트 / 기능 제안)을 사용합니다.
- 작업은 **이슈 생성 → 브랜치 생성 → PR** 순서로 진행합니다.
- 이슈 제목은 템플릿의 `[Bug]`, `[Feature]` 접두사를 유지합니다.

---

## 5. 자동 검사

검사는 2단계입니다. **로컬 훅이 1차, CI가 최종 게이트**입니다.

### 로컬 (husky)

레포를 clone 한 뒤 `pnpm install`만 하면 자동으로 설치됩니다 (`prepare` 스크립트).

| 훅 | 검사 내용 |
| --- | --- |
| `commit-msg` | commitlint로 커밋 메시지 형식 검사 |
| `pre-push` | `main`/`dev` 직접 push 차단 + 브랜치명 규칙 검사 |

설정 파일은 `commitlint.config.mjs`, `.husky/` 에 있습니다.

훅을 건너뛰어야 하는 예외 상황에서는 `--no-verify`를 쓸 수 있지만, 원칙적으로 사용하지 않습니다.

### CI (GitHub Actions)

`main`/`dev`로 향하는 PR과 두 브랜치의 push에서 실행됩니다. 정의는 `.github/workflows/ci.yml`에 있습니다.

| Job | 검사 내용 | 로컬 재현 |
| --- | --- | --- |
| `commitlint` | PR의 커밋 메시지 + **PR 제목** 형식 검사 | `pnpm exec commitlint --from origin/dev --to HEAD` |
| `lint` | ESLint | `pnpm lint` |
| `typecheck` | `next typegen` 후 `tsc --noEmit` | `pnpm typecheck` |
| `build` | 프로덕션 빌드 | `pnpm build` |

로컬 훅은 `--no-verify`로 우회할 수 있고 `pnpm install`을 하지 않은 사람에게는 적용되지 않으므로, 실제 강제는 CI가 담당합니다.

### 배포 (Vercel)

배포는 Actions가 아니라 **Vercel Git 연동**이 담당합니다. 별도 워크플로우나 토큰이 없습니다.

| 브랜치 | 결과 |
| --- | --- |
| `main` | 프로덕션 배포 |
| `dev` · 모든 PR | 프리뷰 배포 (Vercel 봇이 PR에 URL을 남깁니다) |

### GitHub 설정 (권장)

레포 Settings에서 아래를 함께 적용해야 위 검사들이 실제로 강제됩니다.

- `main`, `dev`에 **Branch protection rule** 추가
  - Require a pull request before merging (Require approvals: 1)
  - Require status checks to pass → `commitlint`, `lint`, `typecheck`, `build` 지정
  - Do not allow bypassing the above settings
- General → Pull Requests → **Automatically delete head branches** 체크
