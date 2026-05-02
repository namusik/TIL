# Claude Code 하네스 엔지니어링 구축 가이드

다른 프로젝트에서 바닥부터 Claude Code 하네스 엔지니어링을 구축할 때 참고하는 문서.
megabird 프로젝트에서 실제 구축한 경험을 기반으로 작성.

---

## 목차

1. [개요](#1-개요)
2. [구축 순서](#2-구축-순서)
3. [Step 1: 루트 CLAUDE.md](#step-1-루트-claudemd)
4. [Step 2: 권한 설정 (settings.local.json)](#step-2-권한-설정)
5. [Step 3: 서비스별 CLAUDE.md](#step-3-서비스별-claudemd)
6. [Step 4: 메모리 구축](#step-4-메모리-구축)
7. [Step 5: 커스텀 스킬](#step-5-커스텀-스킬)
8. [Step 6: Hooks](#step-6-hooks)
9. [Step 7: 검증 (팀에이전트)](#step-7-검증)
10. [파일 구조 총정리](#파일-구조-총정리)

---

## 1. 개요

### 하네스 엔지니어링이란

AI 모델을 효과적으로 활용하기 위한 **주변 시스템 설계**. Claude Code에서는:

- **CLAUDE.md** — AI가 프로젝트를 이해하는 진입점
- **메모리** — 대화 간 유지되는 규칙/컨텍스트
- **권한 설정** — 안전한 명령 실행 범위 통제
- **스킬** — 반복 워크플로우 자동화
- **Hooks** — 도구 사용 시 자동 안전장치

### 구축 원칙

1. **팀에이전트로 검증**: 작성 후 반드시 Investigator/Auditor/Verifier로 교차 검증
2. **점진적 구축**: 자주 쓰는 것부터. 안 쓰는 걸 미리 만들지 않는다
3. **사용자 워크플로우 기반**: 실제 작업 흐름을 관찰하고 거기에 맞춰 구축

---

## 2. 구축 순서

```
Step 1: 루트 CLAUDE.md (프로젝트 전체 맵) ← 모든 대화에 즉시 효과
Step 2: 권한 설정 (Read-Only 원칙)        ← 안전장치
Step 3: 서비스별 CLAUDE.md               ← 코드 작업 품질 향상
Step 4: 메모리 구축 (컨벤션/피드백)        ← 일관된 작업 방식
Step 5: 커스텀 스킬                       ← 반복 작업 자동화
Step 6: Hooks                            ← 자동 안전장치
Step 7: 전체 검증 (팀에이전트)             ← 유기적 동작 확인
```

---

## Step 1: 루트 CLAUDE.md

### 목적
새 대화 시작 시 Claude가 프로젝트 전체를 즉시 이해하도록 하는 진입점.

### 위치
```
{프로젝트 루트}/CLAUDE.md
```

### 필수 섹션

```markdown
# {프로젝트명}

{한 줄 설명}

## 프로젝트 맵
- 서브프로젝트/모듈 목록
- 각각의 역할, 기술 스택
- 역할별 분류 (핵심/배치/인프라/프론트엔드 등)

## 시스템 흐름도
- 서비스 간 데이터 흐름 (텍스트 다이어그램)
- 주의: 실제 코드 기반으로 정확하게. 추측 금지.

## 공통 기술 스택
- 언어, 프레임워크, 빌드 도구, DB, 캐시, MQ, 배포 방식

## Git 브랜치 전략
- main/develop/feature 패턴

## 빌드
- 백엔드/프론트엔드 공통 명령
- 프로젝트별 차이 (프로파일, 특수 task 등)

## 환경
- DEV/PROD 접속 정보 (AWS profile, K8s context 등)

## 주의사항
- 운영 서버 주의사항
- 위험 작업 규칙
```

### 작성 방법

1. **Investigator 에이전트 병렬 투입**: 각 서브프로젝트의 build.gradle/package.json, README, 메인 클래스를 조사
2. **초안 작성**
3. **Auditor + Verifier로 검증**: 흐름도 정확성, 버전 정보, 빌드 명령 실제 동작 여부 확인
4. **수정 반영**

### 주의사항

- **흐름도는 반드시 코드 기반으로 검증**. 추측으로 그리면 API→Kafka 직접 연결 같은 오류가 생긴다. (실제 경험: CDC 기반인데 직접 연결로 잘못 그린 사례)
- 프로젝트별 빌드 차이(profile 지원 여부 등)를 정확히 구분
- 서비스 간 역할 경계를 명확히 (예: "카카오/RCS" → 실제로는 "카카오만"이었던 사례)

---

## Step 2: 권한 설정

### 목적
Read/Select만 자동 허용, CUD(Create/Update/Delete)는 사용자 승인 필요.

### 위치
```
{프로젝트 루트}/.claude/settings.local.json
```

### 원칙

**자동 허용 (Read-Only):**
- AWS: `describe-*`, `list-*`, `get-*`, `head-*`만
- kubectl: `get`, `describe`, `logs`, `config`, `top`
- git: `status`, `log`, `diff`, `show`, `branch`, `blame`
- gh: `pr list/view/diff`, `issue list/view`, `api`
- 빌드 도구: `./gradlew`, `yarn`, `npx` (로컬 빌드)
- 유틸: `curl`, `dig`, `find`, `grep` 등

**승인 필요 (CUD):**
- AWS: `create-*`, `delete-*`, `update-*`, `put-*`, `send-*`
- kubectl: `apply`, `delete`, `patch`, `edit`
- git: `add`, `commit`, `push`, `reset`, `merge`
- gh: `pr create`, `pr merge`, `issue create`
- MCP: `edit*`, `create*`, `update*`, `transition*`

### 구조 예시

```json
{
  "permissions": {
    "allow": [
      "Bash(aws ec2 describe:*)",
      "Bash(aws elbv2 describe:*)",
      "Bash(kubectl get:*)",
      "Bash(kubectl describe:*)",
      "Bash(kubectl logs:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(./gradlew:*)",
      "Bash(yarn:*)",
      "Bash(curl:*)",
      "mcp__atlassian__getJiraIssue",
      "mcp__atlassian__searchJiraIssuesUsingJql"
    ]
  }
}
```

### 주의사항

- `Bash(aws:*)` 같은 과도한 와일드카드는 `terminate-instances` 등도 허용하므로 서비스별로 분리
- `Bash(git -C:*)` 는 `git -C /path push`도 매칭되므로 주의
- 일회성 명령(특정 sed, 특정 경로 decompiler)이 쌓이면 주기적으로 정리

---

## Step 3: 서비스별 CLAUDE.md

### 목적
해당 서비스의 코드를 수정할 때 필요한 컨텍스트를 즉시 제공.

### 위치
```
{서비스 디렉토리}/CLAUDE.md
```

### 필수 섹션 (백엔드)

```markdown
# {서비스명}

{한 줄 역할 설명}

## 스택
Java X / Spring Boot X.X / ORM / Gradle X.X

## 패키지 구조
(tree 형식, 각 패키지 역할 한 줄)

## 핵심 흐름
(이 서비스가 처리하는 데이터/메시지 흐름)

## DB
(스키마, ORM 설정, 마이그레이션 방법)

## 빌드/실행
(빌드 명령, 프로파일, 로컬 개발환경)

## 테스트
(프레임워크, 실행 방법)

## 코딩 컨벤션
(네이밍, 레이어 구조, 예외 처리 패턴)
```

### 필수 섹션 (프론트엔드)

```markdown
# {서비스명}

{한 줄 역할 설명}

## 스택
React X / 라우터 / 상태관리 / UI 라이브러리

## 디렉토리 구조
(routes, components, repositories, hooks, stores 등)

## API 호출 패턴
(Repository → Hook → Component 3계층 등)

## 인증
(JWT, 세션, 토큰 갱신 방식)

## 빌드/실행
(dev/build 명령, 환경변수)

## 코딩 컨벤션
(파일 네이밍, import, 스타일링)
```

### 작성 방법

1. 작업 빈도가 높은 서비스부터 작성 (전부 한꺼번에 할 필요 없음)
2. Investigator로 패키지 구조/설정/의존성 조사
3. Auditor로 루트 CLAUDE.md와 교차 검증 (스택/역할 불일치 확인)
4. Verifier로 구체적 값 대조 (포트, 토픽명, 프로파일 등)

### 주의사항

- 루트 CLAUDE.md와 모순되지 않도록 교차 검증 필수
- `.gitignore`에 `CLAUDE.md` 추가하여 git에 안 보이게 처리 가능

---

## Step 4: 메모리 구축

### 목적
대화 간 유지되는 규칙/컨텍스트. 모든 프로젝트에 공통 적용되는 것들.

### 위치
```
~/.claude/projects/{프로젝트 경로 해시}/memory/
├── MEMORY.md              ← 인덱스 (한 줄 요약)
├── {이름}.md              ← 개별 메모리 파일
└── ...
```

### 메모리 유형별 가이드

#### feedback (행동 규칙) — 가장 중요

사용자가 "이렇게 해", "이렇게 하지 마"라고 한 것. 미래 대화에도 적용.

```markdown
---
name: {규칙명}
description: {한 줄 설명}
type: feedback
---
{규칙 본문}

**Why:** {이유}
**How to apply:** {적용 방법}
```

**권장 메모리 목록 (프로젝트 공통):**

| 메모리 | 내용 |
|---|---|
| 워크플랜 작성 컨벤션 | 전체 작업 흐름 정의 (가장 큰 메모리) |
| PR 작성 컨벤션 | PR title/description 형식 |
| 커밋 컨벤션 | 커밋 메시지 형식 (사용하는 경우) |
| 테스트 코드 컨벤션 | 테스트 작성 기준, 범위, 도구 |
| Jira 작성 형식 | Jira description 구조 |
| 운영 서버 주의사항 | prod 서버 접근 규칙 |
| 인프라 변경 규칙 | 의존성 전수 조사 등 |

#### user (사용자 정보)

```markdown
---
name: {정보명}
description: {한 줄 설명}
type: user
---
{사용자 환경/선호 정보}
```

예: 환경 접속 정보, 앱 별칭 매핑, 역할/전문성

#### project (프로젝트 상태)

시간이 지나면 바뀔 수 있는 정보. 주기적 업데이트 필요.

```markdown
---
name: {정보명}
description: {한 줄 설명}
type: project
---
{프로젝트 상태}

**Why:** {배경}
**How to apply:** {적용 방법}
```

예: 버전 업그레이드 예정, 진행 중인 마이그레이션

### 워크플랜 컨벤션 구조 (핵심 메모리)

가장 크고 중요한 메모리. 아래 구조를 권장:

```
1. 트리거 (언제 이 컨벤션을 따르는지)
2. 워크플로우 (전체 단계)
   - 사전 단계: Jira 읽기
   - Interview: 사용자 Q&A
   - Analysis: 현황 조사
   - 범위 판단/분할: 큰 작업이면 하위작업 생성
   - 브랜치 생성: 대상 리포 + 브랜치명 승인
   - Design: 설계 문서
   - Validation: Auditor + Verifier 검증
   - 실행 (인프라 / 코드 분리)
   - 종결
3. 팀에이전트 구조 (Investigator/Auditor/Verifier 역할)
4. 디렉토리 구조 (워크플랜 문서 저장 위치)
5. 템플릿 (각 문서 형식)
6. Design 작성 규칙
7. 실행 규칙 (인프라 / 코드 각각)
8. 상태 값 / 종결 처리
```

### 주의사항

- MEMORY.md는 인덱스만. 150자 이내 한 줄 요약
- 메모리 간 모순 없도록 교차 검증
- 코드에서 파악 가능한 정보(패키지 구조 등)는 메모리에 넣지 않음

---

## Step 5: 커스텀 스킬

### 목적
반복되는 워크플로우를 명령어 하나로 실행.

### 위치
```
{프로젝트}/.claude/skills/{스킬명}/SKILL.md
```

### 형식

```markdown
---
name: {스킬명}
description: {한 줄 설명}
---

# Skill: {이름}

## Description
{2~3문장 설명}

## Trigger
- 트리거 문구 목록
- Slash command: /{스킬명}

## Arguments
- 인자 설명

## Workflow
### Phase 1: ...
(구체적 단계 + bash 코드 블록)

## Boundaries
**ALLOWED**: ...
**NOT ALLOWED**: ...

## Tips
- 운영 팁
```

### 권장 스킬 목록

| 스킬 | 역할 | 우선순위 |
|---|---|---|
| `/build` | 서비스 자동 감지 빌드 | 높음 |
| `/create-pr` | 팀 컨벤션 기반 PR 생성 | 높음 |
| `/cluster-health` | 클러스터 상태 점검 (인프라 프로젝트) | 중간 |
| `/deploy-dev` | dev 환경 배포 | 중간 |

### 주의사항

- "반복되는 게 느껴질 때" 만든다. 미리 만들면 안 쓰는 스킬이 쌓임
- Boundaries에 NOT ALLOWED를 명확히 — 스킬이 위험한 작업을 하지 않도록

---

## Step 6: Hooks

### 목적
도구 사용 시 자동으로 실행되는 안전장치. **하네스 레벨 강제** — LLM 판단과 무관하게 실행되므로 메모리/CLAUDE.md의 "권고"를 "강제"로 격상.

### 두 가지 방식

| 방식 | 위치 | 정의 | 적합 케이스 |
|---|---|---|---|
| **hookify** (권장) | `.claude/hookify.{name}.local.md` | markdown frontmatter | 패턴 매칭, 경고/차단 |
| **raw JSON + bash** | `.claude/settings.json` + `.claude/hooks/*.sh` | JSON 등록 + bash 스크립트 | 복잡한 검증, 외부 시스템 연동 |

### 6-1. hookify 방식 (권장)

`hookify` 플러그인 (`hookify@claude-plugins-official`)을 활성화하면 markdown frontmatter로 hook을 만들 수 있음. JSON/bash 작성 불필요.

#### 룰 파일 위치

```
{프로젝트 루트}/.claude/hookify.{이름}.local.md
```

#### 포맷

```markdown
---
name: {룰명}
enabled: true
event: bash | file | stop | prompt | all
action: warn | block
pattern: {Python regex}      # 단일 패턴
# 또는 다중 조건 (AND)
# conditions:
#   - field: {field명}
#     operator: regex_match | contains | equals | not_contains | starts_with | ends_with
#     pattern: {pattern}
---

{경고/차단 메시지 본문 — 사용자/Claude에게 표시됨}
```

#### 이벤트별 필드

| 이벤트 | 필드 |
|---|---|
| `bash` | `command` |
| `file` (Edit/Write/MultiEdit) | `file_path`, `new_text`, `old_text`, `content` |
| `prompt` | `user_prompt` |
| `stop` | transcript-based 매칭 |

#### 룰 생성 흐름

```bash
# 자연어 설명으로 자동 생성
/hookify rm -rf 사용 시 경고

# 또는 직접 .claude/hookify.{name}.local.md 작성

# 룰 목록 확인
/hookify:list

# 인터랙티브 토글
/hookify:configure
```

룰은 즉시 적용됨 (재시작 불필요). `enabled: false`로 일시 비활성화 가능.

### 6-2. raw 방식 (복잡한 로직)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/{스크립트}.sh"
          }
        ]
      }
    ]
  }
}
```

bash 스크립트 예시:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if echo "$FILE_PATH" | grep -qE '\.env|/prod/'; then
  echo "⚠️ 주의: 위험 파일 수정 — $(basename "$FILE_PATH")" >&2
fi

exit 0  # 0=통과/경고, 2=차단
```

### 6-3. 권장 룰 세트 (안전 우선)

#### A. 워크플랜 문서에서 상대 날짜 차단 (warn)

```markdown
---
name: workplan-relative-dates
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: workplan/.*\.md$
  - field: new_text
    operator: regex_match
    pattern: (오늘|어제|내일|모레|이번\s?주|다음\s?주|지난\s?주|올해|작년|내년|이번\s?달|다음\s?달|지난\s?달|이번\s?분기|지난\s?분기|다음\s?분기)
---

⚠️ 워크플랜 문서 상대 날짜 감지 — YYYY-MM-DD 형식만 사용
```

#### B. `--no-verify` 차단 (block)

```markdown
---
name: no-verify-block
enabled: true
event: bash
action: block
pattern: --no-verify
---

🛑 `--no-verify` 차단 — pre-commit hook 실패는 우회가 아니라 수정 신호. 사용자 명시 지시 시만 룰 일시 비활성화.
```

#### C. 보호 브랜치 force push 차단 (block)

```markdown
---
name: force-push-protected-block
enabled: true
event: bash
action: block
conditions:
  - field: command
    operator: regex_match
    pattern: git\s+push
  - field: command
    operator: regex_match
    pattern: --force(?!-with-lease)|\s-f(?:\s|$)
  - field: command
    operator: regex_match
    pattern: \b(main|master|develop|release/prod)\b
---

🛑 보호 브랜치(main/master/develop/release/prod) force push 차단. `--force-with-lease`는 허용.
```

#### D. (선택) 위험 파일 편집 경고 (warn) — raw 방식

기존 `.env*`, `**/prod/**` 파일 편집 시 경고 (위 raw 방식 예시). hookify로도 가능:

```markdown
---
name: sensitive-files-warn
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env|credentials|secrets|/prod/
---

🔐 민감 파일 편집 — 자격증명 하드코딩 금지, .gitignore 확인
```

### 6-4. 한계 / 주의

- **추상 판단 불가** — "사용자가 답을 안 했는데 Claude가 진행" 같은 워크플로우 상태 추적은 hookify로 안 됨. 메모리/CLAUDE.md 컨벤션 영역
- **서브에이전트 상속 불확실** — 메인 세션의 hook이 서브에이전트에도 적용되는지는 환경/버전 의존. 첫 룰 추가 후 테스트 필요
- **block은 처음엔 신중하게** — false positive로 정상 작업이 막힐 수 있음. **warn으로 시작 → 안정되면 block 승격**
- **hook이 많으면 느려짐** — 핵심 5~10개로 제한
- **프로젝트별 적용** — `.claude/`는 프로젝트 루트. 같은 룰을 여러 프로젝트에 쓰려면 복사 필요
- **action 의미**:
  - `warn` (또는 `exit 0`) — 경고만 출력, 작업 진행
  - `block` (또는 `exit 2`) — 작업 차단, 메시지가 Claude에게 피드백

---

## Step 7: 검증 (팀에이전트)

### 목적
구축한 하네스 엔지니어링이 유기적으로 동작하는지 확인.

### 검증 방법

#### A. 개별 검증 (Step 1~3 각각)

각 CLAUDE.md 작성 후:

```
Investigator (병렬) → 실제 코드 조사
Auditor → 문서 논리적 결함 분석
Verifier → 구체적 값(버전, 포트, 토픽명) 대조
→ 수정 반영
```

#### B. 전체 워크플로우 시뮬레이션 (Step 4 이후)

모든 메모리를 읽고, 실제 작업 흐름을 시뮬레이션:

```
Auditor에게 시키는 것:
"사용자가 '{이슈번호} 워크플랜 시작'이라고 했을 때,
 메모리들이 아래 흐름에서 빠짐없이 연결되는지 시뮬레이션해라:
 Jira 읽기 → Interview → Analysis → 분할 → 브랜치 → Design → 실행 → 테스트 → PR → 종결"
```

#### C. 검증 체크리스트

- [ ] 메모리 간 모순 없는지 (브랜치 base, 버전 기준 등)
- [ ] CLAUDE.md와 메모리 간 불일치 없는지
- [ ] 워크플로우에 빈 구간 없는지
- [ ] AI가 오해할 수 있는 모호한 표현 없는지
- [ ] 중복 정보가 불일치를 유발하지 않는지

---

## 파일 구조 총정리

```
{프로젝트 루트}/
├── CLAUDE.md                          ← 루트 (프로젝트 전체 맵)
├── .claude/
│   ├── settings.json                  ← Hooks 등록
│   ├── settings.local.json            ← 권한 설정 (Read-Only)
│   ├── hooks/
│   │   └── warn-prod-edit.sh          ← Hook 스크립트
│   └── skills/
│       ├── build/SKILL.md             ← 빌드 스킬
│       └── create-pr/SKILL.md         ← PR 생성 스킬
├── {서비스-A}/
│   └── CLAUDE.md                      ← 서비스별 가이드
├── {서비스-B}/
│   └── CLAUDE.md
└── ...

~/.claude/projects/{프로젝트 해시}/memory/
├── MEMORY.md                          ← 메모리 인덱스
├── workplan_conventions.md            ← 워크플랜 컨벤션 (핵심)
├── feedback_pr_convention.md          ← PR 컨벤션
├── feedback_test_convention.md        ← 테스트 컨벤션
├── feedback_jira_format.md            ← Jira 형식
├── feedback_{주제}.md                 ← 기타 행동 규칙
├── aws_eks_environments.md            ← 환경 정보
├── app_aliases.md                     ← 별칭 매핑
└── project_{주제}.md                  ← 프로젝트 상태
```

---

## 구축 소요 시간 참고

| Step | 예상 소요 | 비고 |
|---|---|---|
| 1. 루트 CLAUDE.md | 30분~1시간 | 팀에이전트 검증 포함 |
| 2. 권한 설정 | 15분 | |
| 3. 서비스별 CLAUDE.md | 서비스당 20분 | 작업 빈도 높은 것만 |
| 4. 메모리 구축 | 점진적 | 작업하면서 쌓임 |
| 5. 스킬 | 스킬당 15분 | 반복이 느껴질 때 |
| 6. Hooks | 15분 | |
| 7. 전체 검증 | 30분 | 메모리 5개 이상일 때 |

---

## 핵심 교훈 (megabird 구축 경험)

1. **흐름도는 추측하지 마라** — 코드를 직접 읽고 Kafka consumer/producer, API 호출 패턴을 확인. "api → Kafka → 엔진"이라고 추측했다가 실제는 "api → DB → CDC → Kafka → 엔진"이었던 사례.

2. **팀에이전트 검증은 필수** — 사람이 검토하면 놓치는 것(토픽명 불일치, 포트 번호, profile 지원 여부)을 Verifier가 잡는다.

3. **메모리 간 모순을 주기적으로 점검** — 워크플랜에서 "origin/main 기준 브랜치"라고 해놓고 PR 컨벤션에서 base를 안 정하면 AI가 혼란.

4. **사용자의 실제 작업 패턴을 관찰하라** — "브랜치를 언제 만드는지", "커밋은 누가 하는지", "PR base는 어디인지" 같은 건 물어봐야 안다.

5. **과도하게 만들지 마라** — 안 쓰는 스킬, 안 쓰는 메모리는 노이즈. "반복되네"라고 느낄 때 만드는 게 맞다.
