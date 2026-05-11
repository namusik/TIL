# Git Pull Request

> 최종 업데이트: 2026-04-09 | GitHub Docs, GitHub Blog 기준

## 개념

**Pull Request(PR)는 자신이 작업한 브랜치의 변경 사항을 다른 브랜치(보통 main)에 병합해 달라고 요청하는 협업 메커니즘**이다.

- 식당에 비유하면, 요리사(개발자)가 새 메뉴(기능)를 만들어서 "이거 메뉴판(main 브랜치)에 올려도 될까요?"라고 주방장(리뷰어)에게 검토를 요청하는 것
- 단순히 코드를 합치는 것이 아니라, **코드 리뷰 + 토론 + 자동 테스트 + 승인**이 이루어지는 협업의 핵심 단위
- PR이 머지되면 feature 브랜치의 변경이 target 브랜치에 반영됨

```
feature/login 브랜치                    main 브랜치
┌──────────────┐                      ┌──────────────┐
│ commit A     │    Pull Request      │              │
│ commit B     │  ──────────────→     │              │
│ commit C     │   리뷰 → 승인 → 머지  │ + A, B, C    │
└──────────────┘                      └──────────────┘
```

### PR의 핵심 목적

| 목적 | 설명 |
|---|---|
| **코드 리뷰** | 다른 개발자가 변경 사항을 검토하여 버그, 설계 문제, 코딩 컨벤션 위반 등을 사전에 발견 |
| **품질 관리** | CI/CD 파이프라인이 자동으로 테스트, 린트, 빌드를 실행하여 품질 보장 |
| **지식 공유** | 리뷰 과정에서 팀원 간 코드베이스에 대한 이해도가 자연스럽게 공유됨 |
| **변경 이력 추적** | PR 단위로 "왜 이 변경을 했는지" 맥락이 기록됨 |
| **안전한 병합** | main 브랜치에 직접 push하는 것을 막고, 검증된 코드만 병합 |

## PR vs Merge Request

Pull Request와 Merge Request는 **본질적으로 동일한 개념**이다. 플랫폼마다 부르는 이름이 다를 뿐이다.

| 항목 | Pull Request | Merge Request |
|---|---|---|
| **사용 플랫폼** | GitHub, Bitbucket, Azure DevOps | GitLab |
| **등장 시기** | 2008년 (GitHub 출시) | 2011년 (GitLab 출시) |
| **이름의 유래** | Git의 `git request-pull` 명령어에서 유래. "내 변경을 pull 해달라"는 의미 | "내 브랜치를 merge 해달라"는 최종 결과에 초점 |
| **워크플로우** | 동일 | 동일 |
| **기능** | 코드 리뷰, 인라인 댓글, CI/CD 연동, 승인 | 동일 (GitLab은 더 세분화된 승인 규칙 제공) |

> GitLab의 "Merge Request"라는 이름이 동작을 더 직관적으로 설명한다는 의견도 있지만, "Pull Request"가 Git의 원래 용어에 더 충실하다.

## PR 워크플로우

일반적인 PR 기반 개발 흐름은 다음과 같다.

```
① 브랜치 생성      ② 작업 & 커밋      ③ Push         ④ PR 생성
main에서 분기  →  코드 수정/추가  →  원격에 push  →  GitHub에서 PR 오픈
     │                                                    │
     │            ⑦ 브랜치 삭제    ⑥ 머지          ⑤ 코드 리뷰
     └──────────  정리          ← 승인 후 머지  ← 리뷰어 검토/피드백
```

### 단계별 상세

```bash
# ① 브랜치 생성
git checkout -b feature/user-login main

# ② 작업 & 커밋
git add .
git commit -m "feat(auth): 사용자 로그인 API 구현"

# ③ 원격에 Push
git push -u origin feature/user-login

# ④ PR 생성 (GitHub UI 또는 gh CLI)
# ⑤ 리뷰어가 코드 검토, 피드백, 수정 요청
# ⑥ 승인 후 머지
# ⑦ 머지된 브랜치 삭제
git branch -d feature/user-login
git push origin --delete feature/user-login
```

## PR 생성 방법

### GitHub UI

1. GitHub 저장소에서 **Pull requests** 탭 클릭
2. **New pull request** 버튼 클릭
3. **base 브랜치**(병합 대상)와 **compare 브랜치**(작업 브랜치) 선택
4. 변경 사항 diff 확인
5. **Create pull request** 클릭
6. 제목, 설명, 리뷰어, 라벨 등 입력
7. **Create pull request** (또는 Draft로 생성)

### gh CLI (GitHub CLI)

```bash
# 기본 생성 (인터랙티브 모드)
gh pr create

# 제목과 본문 지정
gh pr create --title "feat: 로그인 API 구현" --body "## 변경 사항\n- JWT 인증 추가"

# 리뷰어, 라벨, 마일스톤 지정
gh pr create --title "feat: 로그인" \
  --reviewer "teammate1,teammate2" \
  --label "enhancement" \
  --milestone "v1.0"

# Draft PR 생성
gh pr create --draft --title "WIP: 결제 모듈"

# base 브랜치 지정
gh pr create --base develop --title "feat: 결제 기능"

# git 커밋 메시지로 자동 채우기
gh pr create --fill

# 브라우저에서 생성
gh pr create --web
```

### gh CLI PR 관리 명령어

```bash
# PR 목록 조회
gh pr list

# PR 상세 조회
gh pr view 123

# PR 체크아웃 (로컬에서 테스트)
gh pr checkout 123

# PR 머지
gh pr merge 123 --squash

# PR 닫기
gh pr close 123

# 리뷰 요청
gh pr ready 123    # draft → ready로 변경
```

## PR 구성 요소

PR을 생성할 때 설정할 수 있는 항목들이다.

| 구성 요소 | 설명 | 비유 |
|---|---|---|
| **Title** | PR의 한 줄 요약. 목록에서 구분하기 위한 핵심 | 보고서 제목 |
| **Description (Body)** | 변경 사항, 동기, 테스트 방법 등 상세 설명 | 보고서 본문 |
| **Reviewers** | 코드 리뷰를 요청할 팀원 | 결재선 |
| **Assignees** | PR 담당자 (보통 작성자 본인) | 담당자 |
| **Labels** | 분류 태그 (`bug`, `enhancement`, `documentation` 등) | 문서 태그 |
| **Milestone** | 릴리즈/스프린트 그룹핑 | 마감 기한 |
| **Projects** | GitHub Projects 보드에 연결 | 칸반 보드 카드 |
| **Linked Issues** | 관련 이슈 연결 (`Closes #123`으로 자동 닫기 가능) | 참조 문서 |

### 이슈 자동 닫기 키워드

PR 설명에 아래 키워드 + 이슈 번호를 쓰면, PR 머지 시 해당 이슈가 자동으로 닫힌다.

```
Closes #123
Fixes #456
Resolves #789
```

## 코드 리뷰

PR에서 리뷰어는 3가지 상태 중 하나로 리뷰를 완료한다.

| 리뷰 상태 | 아이콘 | 의미 | 사용 시점 |
|---|---|---|---|
| **Approve** | 녹색 체크 | 변경 승인. 머지 가능 | 코드에 문제가 없을 때 |
| **Request Changes** | 빨간 X | 수정 요청. 수정 전까지 머지 차단 | 반드시 고쳐야 할 문제가 있을 때 |
| **Comment** | 회색 말풍선 | 의견만 남김. 머지 차단하지 않음 | 질문, 제안, 참고사항 |

### 리뷰 기능

| 기능 | 설명 |
|---|---|
| **인라인 댓글** | 특정 코드 라인에 직접 댓글 |
| **Suggestion** | 코드 수정안을 제안하면 작성자가 클릭 한 번으로 반영 가능 |
| **리뷰 스레드** | 하나의 논의 주제를 스레드로 관리. Resolve로 완료 표시 |
| **Batch review** | 여러 댓글을 모아서 한 번에 제출 (Pending → Submit Review) |

```markdown
# GitHub Suggestion 문법 (리뷰 댓글에서)
```suggestion
public String getName() {
    return this.name;
}
```　
```

## 머지 전략

GitHub에서 PR을 머지할 때 3가지 전략을 선택할 수 있다. 각각 히스토리에 남는 결과가 다르다.

### 1. Merge Commit (Create a merge commit)

feature 브랜치의 **모든 커밋을 보존**하고, 별도의 **머지 커밋**을 생성하여 두 브랜치를 합친다.

```
feature:  A → B → C
                    \
main:     X → Y ────→ M (merge commit)
```

| 항목 | 내용 |
|---|---|
| **히스토리** | 분기와 합류가 그대로 보임 (비선형) |
| **커밋 수** | feature의 모든 커밋 + 머지 커밋 1개 |
| **장점** | 전체 작업 과정 추적 가능, 되돌리기 쉬움 (머지 커밋만 revert) |
| **단점** | 히스토리가 복잡해질 수 있음 |
| **적합한 경우** | 작업 과정을 그대로 보존하고 싶을 때, 대규모 프로젝트 |

### 2. Squash and Merge

feature 브랜치의 모든 커밋을 **하나의 커밋으로 압축**하여 main에 추가한다.

```
feature:  A → B → C  (3개 커밋)
                 ↓ squash
main:     X → Y → ABC (1개 커밋으로 압축)
```

| 항목 | 내용 |
|---|---|
| **히스토리** | 깔끔한 일직선 (선형) |
| **커밋 수** | PR당 1개 커밋 |
| **장점** | main 히스토리가 매우 깔끔. `git log`와 `git bisect`가 편리 |
| **단점** | feature 브랜치의 개별 커밋 히스토리 소실 |
| **적합한 경우** | 작은 기능/버그 수정, 깔끔한 히스토리 선호 팀. 2026년 기준 가장 많이 사용되는 전략 |

### 3. Rebase and Merge

feature 브랜치의 커밋을 main 위에 **하나씩 재적용**한다. 머지 커밋이 생기지 않는다.

```
feature:  A → B → C
                 ↓ rebase
main:     X → Y → A' → B' → C' (커밋을 하나씩 재적용, 해시 변경)
```

| 항목 | 내용 |
|---|---|
| **히스토리** | 일직선 (선형), 개별 커밋 보존 |
| **커밋 수** | feature의 커밋 수 그대로 (해시는 변경) |
| **장점** | 선형 히스토리 + 개별 커밋 보존 |
| **단점** | 커밋 해시가 변경됨. committer 정보도 변경됨 |
| **적합한 경우** | 의미 있는 커밋 단위를 유지하면서 선형 히스토리를 원할 때 |

### 3가지 전략 비교 요약

| 비교 | Merge Commit | Squash & Merge | Rebase & Merge |
|---|---|---|---|
| **머지 커밋** | 생성됨 | 없음 | 없음 |
| **히스토리** | 비선형 (분기 보임) | 선형 (1커밋) | 선형 (N커밋) |
| **원본 커밋 보존** | 완전 보존 | 압축 (소실) | 재작성 (해시 변경) |
| **되돌리기** | 머지 커밋 revert | 1개 커밋 revert | 각 커밋별 revert |
| **git bisect** | 가능 (커밋 많음) | 효율적 (커밋 적음) | 가능 (커밋 많음) |

> 저장소 설정(Settings → General → Pull Requests)에서 허용할 머지 전략을 제한할 수 있다.

## PR 컨플릭트 해결

base 브랜치와 feature 브랜치가 동일한 파일의 같은 부분을 수정했을 때 **충돌(conflict)**이 발생한다.

```
PR 머지 시도
     │
     ▼
충돌 발생?
     │
     ├── 아니오 → 바로 머지 가능
     │
     └── 예 → 충돌 해결 필요
              │
              ├── 방법 1: GitHub UI (간단한 충돌)
              │     └→ "Resolve conflicts" 버튼 → 웹 에디터에서 수정
              │
              └── 방법 2: 로컬에서 해결 (복잡한 충돌)
                    └→ 아래 명령어 참고
```

### 로컬에서 컨플릭트 해결

```bash
# 1. main 최신화
git checkout main
git pull origin main

# 2. feature 브랜치로 이동
git checkout feature/my-branch

# 3. main을 feature에 merge (또는 rebase)
git merge main
# 또는
git rebase main

# 4. 충돌 파일 수정 (<<<<<<< 마커 해결)
# 5. 해결 후 스테이징
git add <충돌 해결한 파일>

# 6-a. merge 방식이면
git commit -m "merge: main 충돌 해결"

# 6-b. rebase 방식이면
git rebase --continue

# 7. push
git push origin feature/my-branch
# rebase 후에는 force push 필요
git push --force-with-lease origin feature/my-branch
```

## 좋은 PR 작성법

연구에 따르면 **리뷰 품질은 PR 크기가 400줄을 넘으면 급격히 떨어진다**. 작고 명확한 PR이 핵심이다.

### PR 크기

| 크기 | 변경 줄 수 | 리뷰 난이도 | 권장 |
|---|---|---|---|
| **Small** | ~300줄 | 쉬움, 빠른 리뷰 | 권장 |
| **Medium** | 300~500줄 | 보통 | 허용 |
| **Large** | 500줄+ | 어려움, 리뷰 품질 하락 | 분할 권장 |

### PR 제목 컨벤션

Conventional Commits와 동일한 형식을 사용하는 것이 일반적이다.

```
<type>(<scope>): <subject>

# 예시
feat(auth): 소셜 로그인 기능 추가
fix(cart): 장바구니 수량 계산 오류 수정
refactor(order): 주문 서비스 레이어 분리
docs(api): REST API 명세 업데이트
chore(deps): Spring Boot 3.4 업그레이드
```

### PR 설명 작성 가이드

```markdown
## 변경 사항 (What)
- 사용자 로그인 API 엔드포인트 추가
- JWT 토큰 발급/검증 로직 구현

## 변경 이유 (Why)
- 기존 세션 방식에서 JWT로 전환하여 수평 확장 지원

## 테스트 방법 (How to test)
1. POST /api/auth/login 호출
2. 응답의 accessToken 확인
3. Authorization 헤더에 토큰 첨부하여 보호 API 호출

## 관련 이슈
Closes #123

## 스크린샷 (UI 변경 시)
```

### 좋은 PR의 체크리스트

- 하나의 PR은 **하나의 목적**만 수행
- 제목만 봐도 변경 내용이 파악 가능
- 설명에 "왜(Why)" 변경했는지 맥락 포함
- 불필요한 파일 변경(포맷팅, import 정리)은 별도 PR로 분리
- 자체 리뷰(self-review)를 먼저 수행
- 테스트 코드 포함

## Draft PR

**아직 완성되지 않은 작업 중인 PR**을 표시하는 기능이다.

- 회의실 예약에 비유하면, "아직 준비 중이니 들어오지 마세요" 표시를 달아놓는 것
- 머지가 **차단**되어 실수로 머지하는 것을 방지
- CODEOWNERS에 의한 **자동 리뷰 요청 알림이 억제**됨

| 항목 | Draft PR | 일반 PR |
|---|---|---|
| **머지 가능** | 불가 | 가능 |
| **리뷰 요청 알림** | 억제 (CODEOWNERS) | 자동 발송 |
| **CI/CD 실행** | 실행됨 | 실행됨 |
| **시각적 표시** | 회색 "Draft" 배지 | 녹색 "Open" 배지 |

### 사용법

```bash
# gh CLI로 Draft PR 생성
gh pr create --draft --title "WIP: 결제 모듈 리팩토링"

# Draft → Ready 전환
gh pr ready 123
```

### 활용 시나리오

- 초기 설계/구조에 대한 **조기 피드백** 요청
- CI/CD 파이프라인이 정상 동작하는지 사전 확인
- 팀원에게 현재 진행 상황 공유
- 대규모 작업의 점진적 진행 공유

## PR 템플릿

`.github/PULL_REQUEST_TEMPLATE.md` 파일을 생성하면, PR 생성 시 **설명란에 자동으로 템플릿이 채워진다**.

### 저장 위치 (3곳 중 택1)

```
저장소루트/PULL_REQUEST_TEMPLATE.md
저장소루트/.github/PULL_REQUEST_TEMPLATE.md    ← 가장 일반적
저장소루트/docs/PULL_REQUEST_TEMPLATE.md
```

> 파일명은 대소문자를 구분하지 않으며, `.md` 또는 `.txt` 확장자 사용 가능

### 기본 템플릿 예시

```markdown
## 변경 사항
<!-- 이 PR에서 변경한 내용을 간략히 설명해 주세요 -->

## 변경 이유
<!-- 왜 이 변경이 필요한지 배경을 설명해 주세요 -->

## 테스트 방법
<!-- 리뷰어가 이 변경을 어떻게 테스트할 수 있는지 설명해 주세요 -->

## 체크리스트
- [ ] 자체 리뷰 완료
- [ ] 테스트 코드 추가/수정
- [ ] 문서 업데이트 (필요시)
- [ ] 시크릿/자격증명 포함 여부 확인

## 관련 이슈
<!-- Closes #이슈번호 -->

## 스크린샷 (선택)
```

### 복수 템플릿

여러 종류의 PR 템플릿을 만들어 상황에 맞게 선택할 수 있다.

```
.github/PULL_REQUEST_TEMPLATE/
├── feature.md
├── bugfix.md
└── release.md
```

```bash
# 특정 템플릿으로 PR 생성 (URL 쿼리 파라미터)
https://github.com/owner/repo/compare/main...feature?template=bugfix.md
```

## CI/CD와 PR의 관계

PR을 생성하거나 업데이트하면 **GitHub Actions 워크플로우가 자동으로 트리거**되어 코드 품질을 검증한다.

```
PR 생성/업데이트
     │
     ▼
GitHub Actions 워크플로우 트리거
     │
     ├── 테스트 실행 (Unit, Integration)
     ├── 코드 린트/포맷팅 검사
     ├── 빌드 검증
     ├── 보안 스캔
     └── 커버리지 리포트
     │
     ▼
Status Check 결과
     │
     ├── ✅ 모두 통과 → 머지 가능
     └── ❌ 실패 → 수정 필요 (Required Check이면 머지 차단)
```

### PR 트리거 워크플로우 예시

```yaml
# .github/workflows/pr-check.yml
name: PR Check

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Run tests
        run: ./gradlew test
      - name: Run lint
        run: ./gradlew ktlintCheck
```

### Status Check 상태

| 상태 | 의미 |
|---|---|
| **Success** (녹색 체크) | 검사 통과 |
| **Failure** (빨간 X) | 검사 실패, 수정 필요 |
| **Pending** (노란 원) | 검사 실행 중 |

> Branch Protection에서 **Required status checks**를 설정하면, 지정한 체크가 모두 통과해야만 PR 머지가 가능하다.

## Branch Protection Rules와 PR

Branch Protection Rules는 특정 브랜치(보통 `main`, `develop`)에 대한 **보호 정책**을 설정하여 PR 프로세스를 강제한다.

### 주요 규칙

| 규칙 | 설명 | 효과 |
|---|---|---|
| **Require a pull request before merging** | 직접 push 금지, PR 필수 | main에 직접 push 시 거부 |
| **Require approvals** | 최소 n명의 리뷰 승인 필요 | 승인 없이 머지 불가 |
| **Dismiss stale pull request approvals** | 새 커밋 push 시 기존 승인 무효화 | 승인 후 몰래 코드 변경 방지 |
| **Require review from code owners** | CODEOWNERS에 지정된 사람의 승인 필수 | 핵심 코드 변경 시 담당자 리뷰 보장 |
| **Require status checks to pass** | CI/CD 체크 통과 필수 | 테스트 실패 시 머지 차단 |
| **Require branches to be up to date** | base 브랜치 최신 상태여야 머지 가능 | 오래된 브랜치의 무검증 머지 방지 |
| **Require linear history** | merge commit 금지 (squash/rebase만 허용) | 깔끔한 히스토리 강제 |
| **Require signed commits** | GPG/SSH 서명 커밋만 허용 | 커밋 위변조 방지 |
| **Restrict who can push** | 특정 사용자/팀만 push 가능 | 접근 제어 |
| **Restrict force pushes** | force push 차단 | 히스토리 훼손 방지 |

### Rulesets (차세대 브랜치 보호)

GitHub는 기존 Branch Protection Rules의 후속으로 **Rulesets**를 도입했다(2023~).

| 비교 | Branch Protection Rules | Rulesets |
|---|---|---|
| **적용 범위** | 저장소 단위 | 저장소 또는 **조직(Organization) 단위** |
| **중복 적용** | 하나만 적용 | 여러 Ruleset이 동시 적용 (가장 엄격한 것 우선) |
| **대상** | 브랜치만 | 브랜치 + **태그** |
| **Push 규칙** | 제한적 | 파일 크기, 확장자, 경로 기반 push 차단 |
| **Bypass** | 관리자 예외만 | 특정 Actor에게 세밀한 bypass 허용 |
| **권장** | 소규모 단일 저장소 | 대규모 팀, 다중 저장소 관리 시 |

> 2026년 기준, 조직 수준의 거버넌스가 필요하면 Rulesets로 마이그레이션하는 것이 권장된다.

## GitHub PR 관련 주요 기능

### Auto-merge

PR이 모든 조건(리뷰 승인, 상태 체크 통과)을 만족하면 **자동으로 머지**되도록 설정하는 기능이다.

```
PR 생성 → Auto-merge 활성화 → 리뷰 승인 + CI 통과 → 자동 머지
```

- Branch Protection이 활성화된 저장소에서만 사용 가능
- 머지 전략(Merge/Squash/Rebase)을 미리 선택
- 리뷰어 승인을 기다리는 동안 작성자가 다른 작업에 집중 가능
- 주의: 여러 리뷰어 중 최소 요구 수만 충족되면 바로 머지됨

```bash
# gh CLI로 auto-merge 활성화
gh pr merge 123 --auto --squash
```

### CODEOWNERS

저장소의 특정 파일/디렉토리에 대한 **코드 소유자**를 지정하는 파일이다. 해당 파일이 변경된 PR이 생성되면 자동으로 리뷰어로 할당된다.

```bash
# .github/CODEOWNERS 파일 위치
# 저장소루트/CODEOWNERS
# .github/CODEOWNERS      ← 일반적
# docs/CODEOWNERS
```

```bash
# CODEOWNERS 예시

# 전체 저장소 기본 소유자
* @backend-team

# 특정 디렉토리
/src/main/java/auth/     @security-team
/src/main/java/payment/  @payment-team @tech-lead

# 특정 파일 패턴
*.gradle                  @devops-team
Dockerfile                @devops-team
*.yml                     @devops-team

# 문서
/docs/                    @docs-team
```

- Branch Protection에서 "Require review from code owners"를 활성화하면, CODEOWNERS에 지정된 사람의 승인이 **필수**
- 변경된 파일에 매칭되는 CODEOWNERS 규칙이 있으면 해당 소유자가 자동으로 리뷰어로 추가됨

### Required Reviewers

| 기능 | 설명 |
|---|---|
| **최소 승인 수** | PR 머지에 필요한 최소 리뷰 승인 수 (예: 2명) |
| **Stale review 무효화** | 새 커밋 push 시 이전 승인 자동 무효화 |
| **Code Owner 승인 필수** | CODEOWNERS에 지정된 소유자의 승인 필수 |
| **특정 팀 승인 필수** | Rulesets에서 특정 팀의 승인을 필수로 요구 가능 (2025.11~) |

### 기타 유용한 기능

| 기능 | 설명 |
|---|---|
| **Merge Queue** | 여러 PR을 순서대로 자동 머지. main에 대한 동시 머지 충돌 방지 |
| **Branch deploy** | PR에서 직접 스테이징/프로덕션 배포 트리거 |
| **PR 댓글 자동화** | GitHub Actions로 PR에 테스트 결과, 커버리지 등을 자동 코멘트 |
| **Dependabot PR** | 의존성 업데이트를 자동 PR로 생성 |
| **GitHub Copilot PR Review** | AI 기반 자동 코드 리뷰 (2025~) |

## 참고 자료

- [About pull requests - GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [About merge methods on GitHub - GitHub Docs](https://docs.github.com/articles/about-merge-methods-on-github)
- [About protected branches - GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [About rulesets - GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [About code owners - GitHub Docs](https://docs.github.com/articles/about-code-owners)
- [gh pr create - GitHub CLI](https://cli.github.com/manual/gh_pr_create)
- [Creating a pull request template - GitHub Docs](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
