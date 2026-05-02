# Git Branch

> 최종 업데이트: 2026-04-09 | Git 2.47 기준, Git SCM 공식 문서, Atlassian, GitHub Docs 참고

## 개념

**Branch(브랜치)는 커밋을 가리키는 가벼운 포인터(참조)**이다. Git에서 브랜치를 만드는 것은 단순히 40바이트짜리 텍스트 파일 하나를 생성하는 것에 불과하다.

- 나무에 비유하면, 줄기(main)에서 가지(branch)가 뻗어 나가는 것. 각 가지는 독립적으로 자라다가 필요할 때 다시 줄기에 합쳐질 수 있다
- 브랜치를 사용하면 **원본 코드에 영향을 주지 않고** 새로운 기능 개발, 버그 수정, 실험 등을 병렬로 진행할 수 있다
- SVN 등 다른 VCS와 달리 Git의 브랜치는 **디렉토리 전체를 복사하지 않는다**. 커밋 해시를 가리키는 포인터일 뿐이므로 생성/전환이 거의 비용 없이 가능하다

```
main:     A → B → C (main이 가리키는 커밋)
                  ↘
feature:           D → E (feature가 가리키는 커밋)
```

## 브랜치의 내부 구조

Git 브랜치의 실체는 `.git/refs/heads/` 디렉토리 안의 **텍스트 파일**이다.

### refs/heads

```bash
# 브랜치 목록 = refs/heads 디렉토리의 파일 목록
ls .git/refs/heads/
# main  feature/login  develop

# 브랜치 파일의 내용 = 커밋 SHA-1 해시 (40자)
cat .git/refs/heads/main
# e83c5163316f89bfbde7d9ab23ca2e25604af290
```

| 요소 | 저장 위치 | 내용 | 비유 |
|---|---|---|---|
| **브랜치** | `.git/refs/heads/<이름>` | 커밋 SHA-1 해시 (40자) | 책갈피 (특정 페이지를 가리킴) |
| **HEAD** | `.git/HEAD` | 현재 브랜치 참조 | "지금 읽고 있는 책갈피가 어디인지" |
| **원격 추적 브랜치** | `.git/refs/remotes/<원격>/<이름>` | 마지막으로 확인한 원격 커밋 해시 | 원격 서버의 책갈피 사본 |

### HEAD 포인터

HEAD는 **현재 체크아웃된 브랜치(또는 커밋)를 가리키는 특수한 참조**다.

```bash
# HEAD의 내용 확인
cat .git/HEAD
# ref: refs/heads/main    ← main 브랜치를 가리키는 심볼릭 참조

# 다른 브랜치로 전환하면 HEAD의 내용이 변경
git switch feature/login
cat .git/HEAD
# ref: refs/heads/feature/login
```

- HEAD가 브랜치를 가리키면 → **정상 상태** (attached HEAD)
- HEAD가 커밋 해시를 직접 가리키면 → **detached HEAD 상태** (후술)

### SHA-1 포인터 동작 원리

새 커밋을 만들면 현재 브랜치 파일의 내용(SHA-1 해시)이 새 커밋의 해시로 **자동 업데이트**된다.

```
커밋 전:
  .git/refs/heads/main → abc1234 (커밋 C)
  .git/HEAD → ref: refs/heads/main

커밋 후:
  .git/refs/heads/main → def5678 (커밋 D, 부모=C)
  .git/HEAD → ref: refs/heads/main (변경 없음)
```

- 브랜치를 만드는 것 = 새 파일에 현재 커밋 해시를 쓰는 것 (약 41바이트)
- 브랜치를 전환하는 것 = HEAD 파일의 참조를 바꾸는 것
- 이 구조 덕분에 브랜치 생성/전환이 **O(1)** 연산으로 즉시 수행된다

## 기본 명령어

### 브랜치 생성

```bash
# 브랜치 생성 (현재 커밋 기준, 전환하지 않음)
git branch feature/login

# 브랜치 생성 + 전환
git switch -c feature/login
git checkout -b feature/login     # 전통적 방식

# 특정 커밋/브랜치 기준으로 생성
git branch feature/login abc1234
git switch -c feature/login main
```

### 브랜치 전환

```bash
# 브랜치 전환 (Git 2.23+, 권장)
git switch feature/login

# 전통적 방식
git checkout feature/login
```

### 브랜치 목록 조회

```bash
# 로컬 브랜치 목록
git branch

# 원격 브랜치 포함 전체 목록
git branch -a

# 원격 브랜치만
git branch -r

# 각 브랜치의 마지막 커밋 + 추적 정보
git branch -vv
```

### 브랜치 삭제

```bash
# 머지된 브랜치 삭제 (안전)
git branch -d feature/login

# 머지되지 않은 브랜치 강제 삭제
git branch -D feature/login

# 원격 브랜치 삭제
git push origin --delete feature/login
```

## git checkout vs git switch

Git 2.23(2019.08)에서 `git switch`와 `git restore`가 새로 도입되었다. 기존 `git checkout`이 **브랜치 전환**과 **파일 복원**이라는 두 가지 전혀 다른 역할을 하나의 명령어로 처리했기 때문이다.

- 가위와 칼이 합쳐진 만능 도구(checkout)를 **가위(switch)**와 **칼(restore)**로 분리한 것

| 비교 | `git checkout` | `git switch` |
|---|---|---|
| **도입 시기** | Git 초기부터 | Git 2.23 (2019.08) |
| **역할** | 브랜치 전환 + 파일 복원 + detach 등 다목적 | 브랜치 전환 전용 |
| **브랜치 전환** | `git checkout feature` | `git switch feature` |
| **생성 + 전환** | `git checkout -b feature` | `git switch -c feature` |
| **detached HEAD** | `git checkout abc1234` (암묵적) | `git switch --detach abc1234` (명시적) |
| **파일 복원** | `git checkout -- file.txt` | `git restore file.txt` (별도 명령어) |
| **안전성** | 실수로 파일을 덮어쓸 위험 | 브랜치 전환만 수행하므로 안전 |
| **머지 중 강제 전환** | `git checkout -f` 가능 | 불가 (명시적 abort 필요) |

> `git switch`는 브랜치 전환 시 명시적 `--detach` 플래그가 필요하므로, 실수로 detached HEAD 상태에 빠지는 것을 방지한다. 2026년 기준 `git switch`/`git restore` 사용이 권장되지만, `checkout`도 여전히 유효하며 제거 예정은 아니다.

## 로컬 브랜치 vs 원격 추적 브랜치

### 로컬 브랜치

직접 생성하고 작업하는 브랜치. `.git/refs/heads/`에 저장된다.

```bash
git branch
# * main
#   feature/login
#   develop
```

### 원격 추적 브랜치 (Remote-Tracking Branch)

원격 저장소의 브랜치 상태를 **로컬에 캐시**한 읽기 전용 참조. `.git/refs/remotes/`에 저장된다.

- 원격 서점의 재고 목록 사본에 비유할 수 있다. 직접 수정할 수 없고, `git fetch`로 최신 정보를 갱신한다

```bash
# 원격 추적 브랜치 확인
git branch -r
# origin/main
# origin/develop
# origin/feature/login
```

| 구분 | 로컬 브랜치 | 원격 추적 브랜치 |
|---|---|---|
| **저장 위치** | `.git/refs/heads/` | `.git/refs/remotes/origin/` |
| **예시** | `main`, `feature/login` | `origin/main`, `origin/feature/login` |
| **수정 가능** | 커밋으로 직접 업데이트 | `git fetch`/`git pull`로만 업데이트 |
| **체크아웃** | 직접 체크아웃 가능 | 체크아웃하면 detached HEAD (또는 추적 브랜치 자동 생성) |

### 업스트림 (Upstream) 설정

로컬 브랜치가 특정 원격 추적 브랜치를 **추적(tracking)**하도록 설정하면, `git pull`/`git push`를 매개변수 없이 사용할 수 있다.

```bash
# push 시 업스트림 설정 (-u = --set-upstream)
git push -u origin feature/login

# 기존 브랜치에 업스트림 설정
git branch --set-upstream-to=origin/main main

# 업스트림 해제
git branch --unset-upstream

# 추적 정보 확인
git branch -vv
# * main          abc1234 [origin/main] 최근 커밋 메시지
#   feature/login def5678 [origin/feature/login: ahead 2] 작업 중
```

- **ahead 2**: 로컬에 원격보다 2개 커밋이 더 있음 (push 필요)
- **behind 3**: 원격에 로컬보다 3개 커밋이 더 있음 (pull 필요)
- **ahead 1, behind 2**: 로컬과 원격이 각각 다른 커밋을 가짐 (분기됨)

## 브랜치 삭제

### 로컬 브랜치 삭제

```bash
# -d: 머지된 브랜치만 삭제 (안전)
git branch -d feature/login
# error: The branch 'feature/login' is not fully merged. ← 머지 안 됐으면 거부

# -D: 강제 삭제 (머지 여부 무관)
git branch -D feature/login
```

- `-d`는 안전장치가 있어서 아직 머지하지 않은 브랜치 삭제를 막아준다
- `-D`는 `-d --force`의 축약. 작업을 버릴 각오가 됐을 때만 사용

### 원격 브랜치 삭제

```bash
# 원격 브랜치 삭제
git push origin --delete feature/login
# 또는
git push origin :feature/login
```

### fetch --prune으로 정리

원격에서 삭제된 브랜치의 로컬 추적 참조를 정리한다.

```bash
# 원격에서 삭제된 브랜치의 추적 참조 정리
git fetch --prune
# 또는
git fetch -p

# 항상 자동으로 prune 실행하도록 설정
git config --global fetch.prune true

# 어떤 브랜치가 정리되는지 미리 확인 (dry-run)
git remote prune origin --dry-run
```

## 브랜치 이름 컨벤션

브랜치 이름은 일반적으로 `<type>/<description>` 형식을 따른다. 소문자와 하이픈(kebab-case)을 사용하는 것이 표준이다.

### 주요 접두사

| 접두사 | 용도 | 예시 |
|---|---|---|
| `feature/` | 새로운 기능 개발 | `feature/social-login` |
| `bugfix/` | 기존 기능의 버그 수정 | `bugfix/cart-quantity-error` |
| `hotfix/` | 프로덕션 긴급 수정 | `hotfix/payment-crash` |
| `release/` | 릴리즈 준비 (버전 번호 포함) | `release/v2.1.0` |
| `refactor/` | 코드 리팩토링 (기능 변경 없음) | `refactor/order-service` |
| `docs/` | 문서 작업 | `docs/api-spec` |
| `test/` | 테스트 추가/수정 | `test/payment-integration` |
| `chore/` | 빌드, 설정, 의존성 등 | `chore/upgrade-spring-boot` |

### 이름 규칙

```bash
# 좋은 예
feature/JIRA-1234-social-login    # 티켓 번호 포함
bugfix/fix-null-pointer-in-order
release/v2.1.0

# 나쁜 예
Feature/Login             # 대문자 사용
feature/my_branch         # 언더스코어 사용
fix                       # 너무 모호
feature/social-login-api-with-google-kakao-naver-apple   # 너무 김
```

- 소문자, 하이픈(`-`) 사용. 언더스코어(`_`), 공백, 특수문자 지양
- 슬래시(`/`)는 접두사 구분에만 사용 (디렉토리처럼 동작)
- Jira 등 이슈 트래커 티켓 번호를 포함하면 추적이 용이
- CI/CD 파이프라인이 브랜치 이름을 파싱하여 워크플로우를 트리거하는 경우가 많으므로 규칙 준수가 중요

## 브랜치 전략

프로젝트의 규모, 배포 주기, 팀 구성에 따라 적합한 브랜치 전략이 달라진다.

### 1. Git Flow

**Vincent Driessen이 2010년에 제안한 전통적인 브랜치 전략.** 명확한 릴리즈 주기가 있는 프로젝트에 적합하다.

```
hotfix ──────── * ──────────────────── * ──────
                ↑                      ↓
main ─── * ──── * ──── * ──────────── * ──── * ───
          ↓            ↑    ↓                ↑
release   │            * ── * ── *           │
          ↓                      ↓           │
develop ─ * ── * ── * ── * ── * ── * ── * ── * ──
               ↑    ↓        ↑
feature        * ── * ── * ──┘
```

| 브랜치 | 수명 | 역할 |
|---|---|---|
| `main` | 영구 | 프로덕션 릴리즈 코드. 태그로 버전 관리 |
| `develop` | 영구 | 다음 릴리즈를 위한 통합 브랜치 |
| `feature/*` | 임시 | 기능 개발. develop에서 분기 → develop으로 머지 |
| `release/*` | 임시 | 릴리즈 준비(버그 수정, 문서). develop에서 분기 → main + develop으로 머지 |
| `hotfix/*` | 임시 | 프로덕션 긴급 수정. main에서 분기 → main + develop으로 머지 |

### 2. GitHub Flow

**GitHub이 사용하는 단순한 브랜치 전략.** main 브랜치와 feature 브랜치만 사용한다.

```
main ─── * ── * ────── * ────── * ── * ──────── * ───
              ↓        ↑        ↓                ↑
feature       * ── * ──┘        * ── * ── * ─────┘
              (PR → 리뷰 → 머지)    (PR → 리뷰 → 머지)
```

- main은 항상 배포 가능한 상태
- feature 브랜치에서 작업 → PR 생성 → 코드 리뷰 → main에 머지 → 즉시 배포
- 1~3일 정도의 짧은 수명의 브랜치 권장

### 3. GitLab Flow

**GitHub Flow에 환경별 브랜치를 추가한 전략.** 여러 환경(staging, production)을 거쳐 배포하는 프로젝트에 적합하다.

```
main ─── * ── * ── * ── * ── * ──
                        ↓
staging ─────────────── * ── * ──
                             ↓
production ──────────────── * ──
```

- 코드가 **downstream으로 흘러간다** (main → staging → production)
- 환경별 브랜치 또는 릴리즈 브랜치 두 가지 모델 지원
- 모든 환경에서 테스트를 거친 코드만 프로덕션에 도달

### 4. Trunk-Based Development (TBD)

**모든 개발자가 main(trunk)에 직접, 자주 커밋하는 전략.** 가장 단순하며 CI/CD와 궁합이 좋다.

```
main ── * ─ * ─ * ─ * ─ * ─ * ─ * ─ * ─ * ──
            ↑   ↓   ↑       ↑   ↓   ↑
            └─ * ──┘       └── * ──┘
          (수시간 이내의 극히 짧은 브랜치)
```

- 브랜치 수명: 수 시간~최대 1일. 하루 1회 이상 main에 머지
- Feature Flag로 미완성 기능을 코드에 포함하되 비활성화
- 소규모 팀, 지속적 배포(CD) 환경에서 적합

### 전략 비교

| 비교 | Git Flow | GitHub Flow | GitLab Flow | Trunk-Based |
|---|---|---|---|---|
| **복잡도** | 높음 | 낮음 | 중간 | 가장 낮음 |
| **영구 브랜치** | main + develop | main | main + 환경별 | main |
| **브랜치 수명** | 일~주 | 일 | 일 | 시간 |
| **릴리즈 방식** | release 브랜치 | main에서 직접 | 환경 브랜치로 전파 | main에서 직접 |
| **배포 빈도** | 주~월 | 일 | 일 | 일~시간 |
| **적합한 프로젝트** | 모바일 앱, 패키지 SW | 웹 앱, SaaS | 다중 환경, 단계적 배포 | CI/CD 성숙 팀 |
| **2026년 트렌드** | 복잡성 때문에 감소 추세 | 웹 앱 표준 | 엔터프라이즈에서 인기 | 급성장 중 |

> 2026년 기준, 웹 애플리케이션/SaaS에는 **GitHub Flow** 또는 **Trunk-Based Development**가 주류이며, 모바일 앱이나 명확한 릴리즈 주기가 있는 프로젝트에서는 여전히 **Git Flow**가 사용된다.

## 브랜치 병합: merge vs rebase

두 브랜치를 합치는 두 가지 방식이다. 결과(코드 상태)는 같지만 **히스토리**가 달라진다.

### merge

두 브랜치의 변경 사항을 합쳐서 **새로운 머지 커밋**을 생성한다. 브랜치의 존재와 합류 이력이 그대로 보존된다.

```bash
git switch main
git merge feature/login
```

```
feature:  A → B → C
                    \
main:     X → Y ────→ M (머지 커밋)
```

### rebase

feature 브랜치의 커밋을 main 브랜치의 **끝 위에 하나씩 재적용**한다. 마치 처음부터 main의 최신 코드 위에서 작업한 것처럼 **선형 히스토리**를 만든다.

```bash
git switch feature/login
git rebase main
```

```
Before:
main:     X → Y
               ↘
feature:        A → B → C

After:
main:     X → Y
                → A' → B' → C' (feature, 커밋 해시 변경됨)
```

### merge vs rebase 비교

| 비교 | merge | rebase |
|---|---|---|
| **히스토리** | 비선형 (분기/합류 보임) | 선형 (일직선) |
| **머지 커밋** | 생성됨 | 없음 |
| **원본 커밋 해시** | 보존 | 변경됨 (재작성) |
| **충돌 해결** | 한 번에 처리 | 커밋마다 개별 처리 |
| **안전성** | 히스토리 변경 없어 안전 | push된 커밋은 rebase 금지 |
| **적합한 경우** | 공유 브랜치, 히스토리 보존 중시 | 개인 브랜치, 깔끔한 히스토리 선호 |
| **실행 취소** | 머지 커밋 revert | 어려움 (reflog 필요) |

> **Golden Rule of Rebasing**: 다른 사람과 공유하는 브랜치(main, develop 등)에서는 절대 rebase하지 않는다. rebase는 커밋을 재작성하므로 다른 개발자의 히스토리와 충돌이 발생한다.

## Fast-Forward Merge vs 3-Way Merge

`git merge` 실행 시 두 브랜치의 상태에 따라 자동으로 결정된다.

### Fast-Forward Merge

main 브랜치에 **feature 분기 이후 새 커밋이 없을 때** 발생. main 포인터를 feature의 최신 커밋으로 **앞으로 이동**시키기만 한다.

```
Before:
main (HEAD)
  ↓
  X → Y → A → B → C ← feature

After (fast-forward):
  X → Y → A → B → C ← main (HEAD), feature
```

- 별도의 머지 커밋이 생기지 않음
- 히스토리가 완전히 선형
- feature 브랜치가 존재했다는 흔적이 남지 않음

```bash
# fast-forward merge
git switch main
git merge feature/login

# fast-forward 금지 (항상 머지 커밋 생성)
git merge --no-ff feature/login

# fast-forward만 허용 (불가능하면 머지 거부)
git merge --ff-only feature/login
```

### 3-Way Merge

main과 feature가 **각각 다른 커밋을 가지고 있을 때** (분기된 상태) 발생. **공통 조상 + 양쪽 최신 커밋** 3개를 비교하여 새 머지 커밋을 생성한다.

```
Before:
          ← A → B (feature)
         /
main → X → Y → Z (main에도 새 커밋이 있음)

After (3-way merge):
          ← A → B ──┐
         /            ↓
main → X → Y → Z → M (머지 커밋, 부모가 2개)
```

- "3-way"의 의미: **공통 조상(X)**, **main 최신(Z)**, **feature 최신(B)** 세 지점을 비교
- 머지 커밋은 **부모(parent)가 2개**인 특수한 커밋
- 분기와 합류 이력이 히스토리에 명확히 기록됨

| 비교 | Fast-Forward | 3-Way Merge |
|---|---|---|
| **발생 조건** | base 브랜치에 새 커밋 없음 | base 브랜치에 새 커밋 있음 (분기) |
| **머지 커밋** | 없음 | 생성됨 |
| **히스토리** | 선형 | 비선형 (분기/합류 보임) |
| **브랜치 흔적** | 남지 않음 | 머지 커밋으로 기록 |
| **`--no-ff`** | 강제로 머지 커밋 생성 | 해당 없음 (항상 머지 커밋) |

> Git Flow에서는 `--no-ff`를 권장한다. feature 브랜치의 존재 이력을 남기고, `git revert`로 feature 전체를 한 번에 되돌릴 수 있기 때문이다.

## 브랜치 보호 규칙 (요약)

특정 브랜치(main, develop 등)에 보호 정책을 설정하여 의도치 않은 변경을 방지한다. PR 기반 워크플로우를 강제하는 핵심 메커니즘이다.

| 규칙 | 효과 |
|---|---|
| **Require PR before merging** | 직접 push 금지, PR 필수 |
| **Require approvals** | 최소 n명 리뷰 승인 필요 |
| **Require status checks** | CI/CD 통과 필수 |
| **Restrict force pushes** | force push 차단으로 히스토리 보호 |
| **Require linear history** | merge commit 금지 (squash/rebase만 허용) |

> 상세 내용은 [Git Pull Request](Git%20Pull%20Request.md)의 Branch Protection Rules 섹션 참고.
> GitHub는 2023년부터 **Rulesets**를 도입하여 조직(Organization) 수준의 규칙 관리를 지원한다.

## 유용한 브랜치 관련 명령어

### 브랜치 이름 변경 (rename)

```bash
# 현재 브랜치 이름 변경
git branch -m new-name

# 특정 브랜치 이름 변경
git branch -m old-name new-name

# 원격에도 반영하려면: 기존 삭제 + 새 이름 push
git push origin --delete old-name
git push -u origin new-name
```

### 업스트림 설정

```bash
# 현재 브랜치의 업스트림 설정
git branch --set-upstream-to=origin/main

# push할 때 동시에 설정
git push -u origin feature/login

# 업스트림 해제
git branch --unset-upstream
```

### 머지된 브랜치 확인

```bash
# main에 이미 머지된 브랜치 목록
git branch --merged main

# 아직 머지되지 않은 브랜치 목록
git branch --no-merged main

# 머지된 브랜치 일괄 삭제 (main, develop 제외)
git branch --merged main | grep -v "main\|develop" | xargs git branch -d
```

### 브랜치 간 비교

```bash
# 두 브랜치 사이의 커밋 차이
git log main..feature/login --oneline

# 두 브랜치 사이의 코드 차이
git diff main...feature/login

# 브랜치가 분기한 공통 조상 커밋 확인
git merge-base main feature/login
```

### 기타

```bash
# 브랜치에 포함된 커밋인지 확인
git branch --contains abc1234

# 현재 브랜치 이름만 출력
git branch --show-current

# 브랜치 정렬 (최근 커밋 순)
git branch --sort=-committerdate

# 원격 브랜치를 로컬에 추적 브랜치로 체크아웃
git switch --track origin/feature/login
```

## Detached HEAD 상태

**HEAD가 브랜치가 아닌 특정 커밋을 직접 가리키는 상태**다. 브랜치 없이 길을 걷는 것과 같아서, 이 상태에서 만든 커밋은 어떤 브랜치에도 속하지 않는다.

### 발생하는 경우

```bash
# 특정 커밋을 직접 체크아웃
git checkout abc1234

# 태그를 체크아웃
git checkout v1.0.0

# 원격 추적 브랜치를 직접 체크아웃
git checkout origin/main
```

### 위험성

```
정상 상태:
HEAD → refs/heads/main → 커밋 C

detached HEAD 상태:
HEAD → 커밋 C (브랜치 없이 직접 참조)
     → 커밋 D → 커밋 E (이 커밋들은 브랜치가 없어서 미아 상태)
```

- detached HEAD에서 새 커밋을 만들 수는 있지만, 다른 브랜치로 전환하면 그 커밋을 **가리키는 참조가 없어** 사실상 유실됨
- Git의 GC(garbage collection)가 참조 없는 커밋을 일정 기간 후 삭제

### 복구 방법

```bash
# 방법 1: detached HEAD에서 작업한 내용을 새 브랜치로 저장
git switch -c save-my-work

# 방법 2: 기존 브랜치로 돌아가기 (작업 내용 포기)
git switch main

# 방법 3: 이미 다른 브랜치로 전환했지만 작업을 살리고 싶을 때
git reflog                       # 유실된 커밋 해시 확인
git branch save-my-work abc1234  # 해당 커밋에 브랜치 생성
```

> `git switch`를 사용하면 detached HEAD에 들어가려면 `--detach` 플래그를 명시해야 하므로, 실수를 방지할 수 있다.

## Stale Branch 정리 방법

오래되어 더 이상 사용하지 않는 브랜치(stale branch)가 쌓이면 저장소가 복잡해진다. 주기적으로 정리하는 것이 좋다.

### 원격에서 삭제된 브랜치의 추적 참조 정리

```bash
# 원격에서 삭제된 브랜치의 추적 참조를 로컬에서 정리
git fetch --prune

# 자동 prune 설정 (매 fetch마다 자동 실행)
git config --global fetch.prune true
```

### 머지 완료된 로컬 브랜치 삭제

```bash
# main에 머지된 브랜치 확인
git branch --merged main

# main, develop 제외하고 머지 완료 브랜치 일괄 삭제
git branch --merged main | grep -v "main\|develop\|\*" | xargs git branch -d
```

### 원격에서 삭제되었으나 로컬에 남은 브랜치 정리

```bash
# 추적 브랜치가 사라진(gone) 로컬 브랜치 확인
git branch -vv | grep ': gone]'

# 해당 브랜치 일괄 삭제
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

### 종합 정리 스크립트

```bash
#!/bin/bash
# stale-branch-cleanup.sh

echo "=== 원격 추적 참조 정리 ==="
git fetch --prune

echo "=== 머지 완료된 로컬 브랜치 삭제 ==="
git branch --merged main | grep -v "main\|develop\|\*" | xargs -r git branch -d

echo "=== 원격에서 삭제된 브랜치의 로컬 정리 ==="
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -d

echo "=== 정리 완료. 남은 브랜치 ==="
git branch -vv
```

### GitHub/GitLab 자동 삭제 설정

| 플랫폼 | 설정 | 위치 |
|---|---|---|
| **GitHub** | "Automatically delete head branches" | Settings → General → Pull Requests |
| **GitLab** | "Delete source branch when merge request is accepted" | Settings → Merge requests |

> PR/MR 머지 시 source 브랜치를 자동으로 삭제하도록 설정하면, stale branch가 쌓이는 것을 근본적으로 방지할 수 있다.

## 참고 자료

- [Git Branching - Branches in a Nutshell - Git SCM](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
- [Git Internals - Git References - Git SCM](https://git-scm.com/book/en/v2/Git-Internals-Git-References)
- [Git Branching - Remote Branches - Git SCM](https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches)
- [Git Branching - Rebasing - Git SCM](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- [Merging vs. Rebasing - Atlassian](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)
- [Git Refs - Atlassian](https://www.atlassian.com/git/tutorials/refs-and-the-reflog)
- [Git Switch vs Checkout - Graphite](https://graphite.com/guides/git-switch-vs-git-checkout)
- [Git Branch Naming Conventions 2025 - Medium](https://medium.com/@jaychu259/git-branch-naming-conventions-2025-the-ultimate-guide-for-developers-5f8e0b3bb9f7)
- [Git Branching Strategies Guide 2026 - DevToolbox](https://devtoolbox.dedyn.io/blog/git-branching-strategies-guide)
- [Trunk-Based Development vs Git Flow - Toptal](https://www.toptal.com/developers/software/trunk-based-development-git-flow)
- [What is GitLab Flow? - GitLab](https://about.gitlab.com/topics/version-control/what-is-gitlab-flow/)
