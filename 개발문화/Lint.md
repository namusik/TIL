# Lint (정적 코드 분석)

> 최종 업데이트: 2026-04-30 | ESLint / Ruff / Biome 등 현행 도구 기준

## 개념

Lint는 **코드를 실행하지 않고 텍스트로만 분석해서, 잠재적 버그·스타일 위반·의심스러운 패턴을 잡아내는 정적 분석 기술**이다.

> 비유: 글을 쓰면 맞춤법 검사기가 빨간 줄을 그어주듯, 코드에도 같은 역할을 하는 게 린터(linter). 컴파일러보다 더 까다롭고 더 친절하다.

## 배경/역사

- **1978년** Bell Labs의 **Stephen C. Johnson**이 Unix 도구 `lint` 발표. C 컴파일러가 못 잡는 의심스러운 패턴(타입 불일치, 사용 안 한 변수 등)을 검출
- 이름의 유래: **"옷에 붙은 보풀(lint)"** — 코드에 거슬리는 작은 흠집을 잡는다는 의미
- 이후 모든 정적 분석기의 통칭이 됨 (ESLint, Pylint, Stylelint…)
- **2010년대** ESLint가 JavaScript 표준으로 등극, 린트가 "있으면 좋은 것"에서 "필수"로 전환
- **2020년대 중반** **Rust로 재작성한 차세대 린터** 등장 — Ruff(Python), Biome(JS) 등이 기존 도구 대비 수십~수백 배 빠른 속도로 시장을 빠르게 재편

> Stephen Johnson은 yacc(파서 생성기)도 만든 인물. lint는 그가 "PCC 컴파일러를 만들다 부산물로 나온 도구"라고 회고.

## 무엇을 잡아주나

```javascript
// 1. 사용 안 하는 변수
const unused = 1;            // ⚠ 'unused' is defined but never used

// 2. 느슨한 비교 (== vs ===)
if (a == b) {}               // ⚠ Use '===' instead of '=='

// 3. null 가드 누락
function f(x) {
  return x.toUpperCase();    // ⚠ 'x' is possibly null
}

// 4. 디버그 코드 잔존
console.log("debug");        // ⚠ Unexpected console statement

// 5. 보안
eval(userInput);             // ⚠ eval can be harmful

// 6. 스타일
const a=1                    // ⚠ Missing space, missing semicolon
```

| 잡아주는 종류 | 예시 |
|---|---|
| 잠재적 버그 | null 가능성, 무한 루프, 사용 안 한 변수, 도달 불가 코드 |
| 스타일 | 들여쓰기, 따옴표, 세미콜론, 네이밍 컨벤션 |
| 안티패턴 | `==` 사용, `var`, 빈 catch, magic number |
| 보안 | `eval`, 하드코딩 시크릿, SQL 인젝션 패턴 |
| 접근성 (a11y) | `<img>` alt 누락, ARIA 잘못 사용 |
| 성능 힌트 | 불필요한 재렌더, 인덱스 누락 |

## 언어별 대표 린터

| 언어 | 린터 | 비고 |
|---|---|---|
| JavaScript / TypeScript | **ESLint**, **Biome** (신흥, Rust) | Biome이 ESLint+Prettier 통합 시도 |
| Python | **Ruff** (Rust, 표준화 중), Pylint, Flake8 | Ruff가 사실상 차세대 표준 |
| Java | **Checkstyle**, PMD, SpotBugs, ErrorProne | Spring 진영 Checkstyle 다수 |
| Kotlin | **ktlint**, detekt | |
| Go | **golangci-lint** | 여러 린터 묶음 메타 도구 |
| Rust | **Clippy** | rustup 기본 동봉 |
| Swift | **SwiftLint** | |
| Shell | **ShellCheck** | bash 안티패턴 검출 강력 |
| CSS | Stylelint | |
| Markdown | markdownlint | |
| Dockerfile | hadolint | |
| SQL | sqlfluff | |

> **2024~2026 트렌드**: Rust로 작성한 고성능 린터(Ruff, Biome, Oxlint)가 기존 JS/Python 도구를 대체 중. 수십 배 빠른 실행 속도로 CI 시간 단축.

## 린터 / 포매터 / 타입체커 — 비슷하지만 다른 도구

| 도구 종류 | 역할 | 예시 |
|---|---|---|
| **Linter** | "이거 문제다"라고 지적 (수정은 선택) | ESLint, Pylint, Checkstyle |
| **Formatter** | 스타일을 자동으로 통일 | Prettier, Black, gofmt |
| **Type Checker** | 타입 오류 검출 | TypeScript(tsc), mypy, Sorbet |

### 셋의 영역 분리

```
[코드 작성]
   │
   ▼
[Type Checker]   ← 타입이 맞는가?
   │
   ▼
[Linter]         ← 안티패턴 / 잠재 버그 있는가?
   │
   ▼
[Formatter]      ← 보기 좋게 정렬
```

요즘은 경계가 흐려지고 통합되는 추세 (Biome = 린터+포매터, Ruff = 린터+포매터+일부 타입체크).

## 자동 수정

대부분의 린터는 `--fix` 옵션으로 **자동 교정 가능한 룰을 즉시 수정**한다.

```bash
eslint src/ --fix            # 자동 수정 후 남은 것만 보고
ruff check . --fix
ruff format .
gofmt -w .
```

자동 수정 가능한 것: 들여쓰기, 따옴표, 세미콜론, 정렬, 단순 안티패턴
자동 수정 불가: null 가드, 변수 미사용(의도일 수도) 등

## 동작하는 위치

```
[IDE]  ────────────► 작성 중 빨간 밑줄 (실시간 피드백)
   │
   │ Save
   ▼
[Editor format-on-save] ─► 저장 시 자동 포맷
   │
   │ Stage / Commit
   ▼
[pre-commit hook (lint-staged)] ─► 변경된 파일만 검사·차단
   │
   │ Push
   ▼
[CI 파이프라인] ─────► PR 머지 전 필수 통과
```

| 위치 | 도구 | 역할 |
|---|---|---|
| IDE | VS Code 확장, IntelliJ 인스펙션 | 실시간 |
| 저장 시 | format-on-save | 자동 정렬 |
| 커밋 전 | husky + lint-staged | 변경된 파일만 빠르게 |
| Push 후 | GitHub Actions, GitLab CI | 강제 게이트 |

## 설정 파일 예시 (ESLint)

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "eqeqeq": ["error", "always"],
    "max-lines-per-function": ["warn", 50]
  },
  "overrides": [
    {
      "files": ["**/*.test.ts"],
      "rules": { "no-console": "off" }
    }
  ]
}
```

| 레벨 | 의미 |
|---|---|
| `"off"` (0) | 검사 안 함 |
| `"warn"` (1) | 경고만, 빌드 실패 안 함 |
| `"error"` (2) | 에러, 빌드 실패 |

## 룰 예외 처리

```javascript
// 한 줄만 무시
const debug = 1;  // eslint-disable-line no-unused-vars

// 다음 줄만 무시
// eslint-disable-next-line no-console
console.log("ok");

// 블록 무시
/* eslint-disable */
... legacy code ...
/* eslint-enable */
```

> **남용 주의**: `eslint-disable` 무더기는 "린트 우회 잔치". CI에서 `disable` 갯수를 카운트해 회귀 방지하는 팀도 있음.

## Husky + lint-staged 패턴

JS 진영에서 가장 흔한 사전 검사 조합.

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

→ **변경된 파일만** 린트·포맷·자동수정. 전체 검사보다 100배 빠름.

## 흔한 함정

### 1. 너무 엄격한 룰 → 개발자가 disable 남용
처음부터 모든 룰을 `error`로 잡으면 팀이 반발. **`warn`으로 시작 → 점진적으로 `error`** 권장.

### 2. 자동 수정에만 의존
`--fix`가 잡아주는 건 표면적 문제. 진짜 버그(null 가드 등)는 사람이 봐야 함.

### 3. 포매터와 린터 룰 충돌
ESLint 스타일 룰 + Prettier 동시 사용 시 무한 루프. **`eslint-config-prettier`로 ESLint의 스타일 룰만 끄기**가 정답. 또는 Biome로 통합.

### 4. CI에서만 돌리기
PR 시점에 처음 알면 되돌리기 비쌈. **IDE/pre-commit으로 앞당겨야** 효율적.

### 5. 레거시 코드에 일괄 적용
한 번에 다 고치려다 PR이 거대해짐. **새 코드만 엄격, 레거시는 점진 마이그레이션** (`overrides`로 폴더별 분리).

## SDD / AI 에이전트와의 관계

AI 에이전트(Claude Code, Cursor 등)가 코드를 짤 때 **린터를 자동 호출**하는 패턴이 표준화되는 중.

```
[AI가 코드 수정]
     │
     ▼
[하네스의 PostEdit 훅]
     │
     ▼
[린터 실행]
     │
     ├─ 통과 → 다음 작업
     └─ 실패 → 에이전트에게 피드백 → 자동 수정
```

린터는 **"AI 출력을 검증하는 결정론적 검사기"** 역할로 재발견되는 중. SDD에서도 명세-구현 일관성 검증의 일부로 들어감.

## 한 줄 요약

> **Lint = 1978년부터 있어온 정적 코드 분석 도구**. 컴파일러가 못 잡는 잠재 버그·스타일·안티패턴을 잡아준다. IDE→pre-commit→CI 단계에 깔아두면 코드 품질의 1차 방어선이 되며, AI 코딩 시대엔 에이전트 출력 검증의 핵심 도구로 재부상 중.

## 관련 문서
- [[SDD (Spec-Driven Development)]] — 명세 주도 개발
- [[../AI/harness-engineering-guide]] — Claude Code 하네스 구축 가이드 (린터를 훅으로 통합)

## 참조
- ESLint: https://eslint.org/
- Ruff: https://docs.astral.sh/ruff/
- Biome: https://biomejs.dev/
- ShellCheck: https://www.shellcheck.net/
- 원조 lint 논문 (1978): https://www.cs.dartmouth.edu/~mckeeman/references/oldpapers/Johnson_lint.pdf
