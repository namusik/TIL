# Git Reset

> 최종 업데이트: 2026-04-08

## 개념

**HEAD 포인터를 특정 커밋으로 이동**시켜, 이후 커밋을 히스토리에서 제거하는 명령어다.

- Git에는 **Working Directory**, **Staging Area(Index)**, **Repository(HEAD)** 3개의 영역이 있다
- reset은 이 3영역 중 **어디까지 되돌릴지**를 `--soft`, `--mixed`, `--hard` 옵션으로 결정
- 비유하면, 문서 작성 과정에서 "최종 제출(commit)"을 취소하되, **초안(working)은 남길지, 검토 목록(staging)까지 남길지, 전부 버릴지** 고르는 것

```
Git의 3영역과 reset 범위

Working Directory      Staging Area (Index)      Repository (HEAD)
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  파일 수정     │      │  git add 된 내용   │      │  커밋된 스냅샷      │
│  (초안)       │      │  (검토 목록)       │      │  (최종 제출)       │
└──────┬───────┘      └────────┬─────────┘      └────────┬─────────┘
       │                      │                         │
       │    ←── --mixed ────  │   ←── --soft ─────────  │
       │                                                │
       │    ←───────── --hard ──────────────────────────│
```

## 3가지 모드 상세

### --soft

HEAD만 이동. Staging Area와 Working Directory는 그대로 유지된다.

```bash
git reset --soft HEAD~1
```

- "커밋 버튼만 취소"한 상태. 변경 내용은 staged에 남아서 바로 다시 커밋 가능
- 여러 커밋을 하나로 합칠 때(squash) 유용

```
Before:  A → B → C (HEAD)
After:   A → B (HEAD)    /  C의 변경 → staging에 존재
```

### --mixed (기본값)

HEAD + Staging Area를 이동. Working Directory는 유지.

```bash
git reset HEAD~1           # --mixed가 기본값
git reset --mixed HEAD~1   # 동일
```

- "커밋 + add 취소". 변경 내용은 워킹 디렉토리에 unstaged 상태로 남음
- 커밋 전 staging 구성을 다시 하고 싶을 때 사용

```
Before:  A → B → C (HEAD)
After:   A → B (HEAD)    /  C의 변경 → working directory (unstaged)
```

### --hard

HEAD + Staging Area + Working Directory 모두 초기화. 변경 내용이 완전히 사라진다.

```bash
git reset --hard HEAD~1
```

- "모든 것을 되돌림". 복구가 어려우므로 가장 주의해야 하는 옵션
- 실험적 코드를 완전히 폐기할 때 사용

```
Before:  A → B → C (HEAD)
After:   A → B (HEAD)    /  C의 변경 → 삭제됨
```

### 모드 비교 요약

| 모드 | HEAD | Staging Area | Working Directory | 비유 |
|---|---|---|---|---|
| `--soft` | 이동 | 유지 | 유지 | 제출 취소, 검토 목록은 그대로 |
| `--mixed` | 이동 | 초기화 | 유지 | 제출 + 검토 취소, 초안은 남음 |
| `--hard` | 이동 | 초기화 | 초기화 | 전부 폐기 |

## 기본 사용법

### 커밋 기준 지정

```bash
# 직전 커밋으로 (1개 되돌리기)
git reset --soft HEAD~1

# 3개 전 커밋으로
git reset --mixed HEAD~3

# 특정 커밋 해시로
git reset --hard abc1234
```

### 특정 파일만 unstage

`git reset`은 파일 단위로도 사용 가능하다. 이 경우 HEAD는 이동하지 않고, 해당 파일만 staging에서 제거된다.

```bash
# 특정 파일을 staging에서 제거 (워킹 디렉토리는 유지)
git reset HEAD -- src/Main.java

# Git 2.23+ 에서는 restore 명령어를 권장
git restore --staged src/Main.java
```

## reset 동작 흐름도

```
git reset --soft HEAD~1 실행 시:

Step 1: HEAD 이동
  HEAD ──→ 이전 커밋으로 포인터 변경
  (브랜치 참조도 함께 이동)

Step 2: Staging Area
  변경 없음 (이전 커밋의 변경 사항이 staged 상태로 남음)

Step 3: Working Directory
  변경 없음


git reset --hard HEAD~1 실행 시:

Step 1: HEAD 이동
  HEAD ──→ 이전 커밋으로 포인터 변경

Step 2: Staging Area
  해당 커밋 시점으로 초기화

Step 3: Working Directory
  해당 커밋 시점으로 초기화 (이후 변경 사항 삭제)
```

## reset vs checkout vs revert

| 항목 | reset | checkout | revert |
|---|---|---|---|
| **동작** | HEAD(브랜치)를 이동 | HEAD만 이동 (detached) 또는 브랜치 전환 | 되돌리는 **새 커밋** 생성 |
| **히스토리** | 변경 (커밋 제거) | 변경 없음 | 보존 (새 커밋 추가) |
| **영향 범위** | 브랜치 자체가 이동 | 워킹 디렉토리 전환 | 워킹 디렉토리 + 새 커밋 |
| **협업 안전성** | 위험 (force push 필요) | 안전 | 안전 |
| **용도** | 로컬 히스토리 정리 | 브랜치 전환, 특정 커밋 확인 | 공유 브랜치에서 안전하게 되돌리기 |

```
reset:   A → B → C  ──→  A → B         (C가 히스토리에서 사라짐)
revert:  A → B → C  ──→  A → B → C → C'  (C를 되돌리는 새 커밋 추가)
checkout:A → B → C  ──→  HEAD가 B를 가리킴 (브랜치는 그대로 C)
```

## git reflog로 reset 복구

`git reflog`는 HEAD가 이동한 모든 이력을 기록한다. `--hard`로 날려버린 커밋도 reflog에 남아 있어 복구 가능하다.

- 비유하면, 문서를 휴지통에 버려도(reset --hard) **휴지통 비우기(gc) 전까지는** 꺼낼 수 있는 것

```bash
# 1. reflog에서 되돌아갈 커밋 찾기
git reflog
# 출력 예시:
# abc1234 HEAD@{0}: reset: moving to HEAD~1
# def5678 HEAD@{1}: commit: feat: 로그인 기능 추가    ← 이 커밋을 복구하고 싶음

# 2. 해당 커밋으로 reset
git reset --hard def5678
```

```
reflog 동작 흐름:

A → B → C (HEAD)
         ↓ git reset --hard HEAD~1
A → B (HEAD)                    reflog: [C = HEAD@{1}]
         ↓ git reset --hard HEAD@{1}
A → B → C (HEAD) ← 복구 완료!
```

| 주의사항 | 설명 |
|---|---|
| 보존 기간 | 기본 90일 (`gc.reflogExpire`). 이후 `git gc` 시 삭제 |
| untracked 파일 | reflog로 복구 불가. `git add`조차 하지 않은 새 파일은 되살릴 수 없음 |
| stash 활용 | 중요한 작업 중이라면 `git stash`로 미리 백업 권장 |

## 실무 사용 시나리오

### 1. 여러 커밋을 하나로 합치기 (Squash)

```bash
# 최근 3개 커밋을 하나로 합치기
git reset --soft HEAD~3
git commit -m "feat(auth): 소셜 로그인 기능 추가"
```

### 2. 잘못된 커밋 되돌리기 (push 전)

```bash
# 커밋만 취소하고 코드는 유지
git reset --soft HEAD~1
# 수정 후 다시 커밋
```

### 3. staging 다시 구성

```bash
# 커밋과 staging 취소, 코드는 유지
git reset HEAD~1
# 원하는 파일만 다시 add
git add src/OrderService.java
git commit -m "refactor: 주문 서비스 분리"
```

### 4. 실험적 코드 완전 폐기

```bash
# 최근 커밋과 변경 사항 모두 삭제
git reset --hard HEAD~1
```

### 5. 특정 커밋 시점으로 원격 브랜치 복원

```bash
git log --oneline          # 되돌아갈 커밋 해시 확인
git reset --hard <커밋해시>
git push origin <브랜치> --force-with-lease
```

## reset 후 force push 주의사항

| 항목 | 설명 |
|---|---|
| **--force vs --force-with-lease** | `--force`는 무조건 덮어쓰기. `--force-with-lease`는 원격에 다른 사람의 새 커밋이 있으면 거부하므로 더 안전 |
| **공유 브랜치 금지** | `main`, `develop` 등 여러 사람이 쓰는 브랜치에서 force push하면 다른 사람의 작업이 유실됨 |
| **개인 브랜치에서만** | `feature/xxx` 같은 본인만 쓰는 브랜치에서 사용 권장 |
| **팀 규칙 확인** | force push 전 팀의 브랜치 보호 정책(branch protection rule) 확인 |

```bash
# 안전한 force push (권장)
git push --force-with-lease origin feature/my-branch

# 위험한 force push (비권장)
git push --force origin feature/my-branch
```

```
force push 시나리오:

Local:   A → B (reset으로 C 제거)
Remote:  A → B → C

git push --force-with-lease
  → 원격에 내가 모르는 커밋(D)이 없으면 push 성공
  → 다른 사람이 D를 push했으면 거부됨 (안전장치)

git push --force
  → 무조건 덮어쓰기 (D가 있어도 무시 → 유실 위험)
```

## 자주 쓰는 조합

```bash
# 직전 커밋만 취소 후 재커밋
git reset --soft HEAD~1
git commit -m "fix: 수정된 메시지"

# staging 실수 수정 (파일 하나만 unstage)
git reset HEAD -- 잘못추가한파일.java

# 커밋 3개 합치기 후 push
git reset --soft HEAD~3
git commit -m "feat(order): 주문 기능 통합"
git push --force-with-lease origin feature/order

# 잘못된 reset 복구
git reflog
git reset --hard HEAD@{1}
```
