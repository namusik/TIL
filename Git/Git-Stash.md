# Git Stash

> 최종 업데이트: 2026-04-08

## 개념

**커밋하지 않은 변경 사항(Working Directory + Staging Area)을 임시로 저장해 두고, 워킹 디렉토리를 깨끗한 상태로 되돌리는 명령어**다.

- 서랍에 비유하면, 작업 중이던 물건들을 서랍에 넣어 두고 책상을 깨끗이 치운 뒤, 나중에 서랍을 열어 다시 꺼내는 것
- 내부적으로 **스택(Stack) 구조**로 동작 — 가장 최근에 넣은 stash가 `stash@{0}`
- stash 하나는 사실 **두 개(또는 세 개)의 커밋으로 구성**된 merge commit. Working Directory 상태와 Staging Area(Index) 상태를 각각 저장

```
stash@{0} ← 가장 최근 (스택 top)
stash@{1}
stash@{2} ← 가장 오래된 것 (스택 bottom)
```

### Stash 내부 구조

stash 엔트리 하나는 아래와 같은 커밋 트리로 구성된다.

```
        stash commit (merge commit)
       /          \
  Index 커밋    Working Directory 커밋
     |
  HEAD 커밋 (stash 시점의 기준 커밋)
```

- **Index 커밋**: `git add`로 staging된 상태를 보관
- **Working Directory 커밋**: 수정했지만 아직 staging하지 않은 파일 상태를 보관
- `--include-untracked` 옵션 사용 시 **세 번째 부모 커밋**으로 untracked 파일도 보관

## 기본 사용법

### stash 저장

```bash
# 변경 사항을 임시 저장 (tracked 파일의 수정분만)
git stash

# 메시지를 붙여 저장 (여러 개 쌓일 때 구분 용도)
git stash -m "로그인 기능 작업 중"
# 또는
git stash push -m "로그인 기능 작업 중"
```

### stash 목록 조회

```bash
git stash list
# 출력 예시:
# stash@{0}: On feature/login: 로그인 기능 작업 중
# stash@{1}: WIP on main: abc1234 이전 작업
```

### stash 꺼내기

```bash
# 가장 최근 stash를 꺼내고 목록에서 제거
git stash pop

# 가장 최근 stash를 꺼내되 목록에서 제거하지 않음
git stash apply

# 특정 stash 지정
git stash pop stash@{2}
git stash apply stash@{1}
```

> **pop vs apply**: `pop`은 꺼내면서 삭제, `apply`는 꺼내되 stash 목록에 남겨둠. 안전하게 작업하려면 `apply` 후 확인하고 수동 `drop`하는 것을 권장.

### stash 삭제

```bash
# 특정 stash 삭제
git stash drop stash@{1}

# 모든 stash 삭제
git stash clear
```

### stash 내용 확인

```bash
# 가장 최근 stash의 변경 내용 보기
git stash show

# diff 형태로 상세 확인
git stash show -p

# 특정 stash 지정
git stash show -p stash@{2}
```

## 주요 옵션

| 옵션 | 설명 | 비유 |
|---|---|---|
| `-m "메시지"` | stash에 설명을 달아 저장 | 서랍에 라벨 붙이기 |
| `--keep-index` | staging된 파일은 그대로 두고 unstaged만 stash | 이미 포장한 물건은 놔두고 나머지만 서랍에 넣기 |
| `--include-untracked` (`-u`) | 새로 만든 파일(untracked)도 함께 stash | 바닥에 놓인 새 물건까지 전부 서랍에 넣기 |
| `--all` (`-a`) | `.gitignore`에 해당하는 파일까지 모두 stash | 숨겨놓은 물건까지 전부 정리 |
| `--patch` (`-p`) | 변경 사항을 hunk 단위로 선택하여 stash | 물건을 골라서 서랍에 넣기 |

```bash
# staging 유지, unstaged만 stash
git stash --keep-index

# untracked 파일 포함
git stash -u -m "새 파일 포함 stash"

# 특정 파일만 stash
git stash push -m "특정 파일만" -- src/Main.java src/Config.java
```

## stash 활용 흐름도

### 브랜치 전환 시

```
feature/login 브랜치에서 작업 중
         │
         ▼
    변경 사항 발생 (아직 커밋하기 이름)
         │
         ▼
    git stash -m "로그인 작업 중"
         │
         ▼
    워킹 디렉토리 깨끗해짐
         │
         ▼
    git checkout main  (또는 다른 브랜치로 이동)
         │
         ▼
    긴급 작업 수행 & 커밋
         │
         ▼
    git checkout feature/login  (원래 브랜치 복귀)
         │
         ▼
    git stash pop  (임시 저장한 작업 복원)
         │
         ▼
    이어서 작업 계속
```

## 실무 시나리오

### 1. 긴급 버그 수정 (Hotfix)

기능 개발 중 프로덕션 버그가 발견되었을 때, 현재 작업을 stash에 넣고 hotfix 브랜치로 전환한다.

```bash
# 현재 작업 임시 저장
git stash -u -m "feat/payment 작업 중"

# hotfix 브랜치로 이동
git checkout -b hotfix/critical-bug main

# 버그 수정 후 커밋 & 머지
# ...

# 원래 브랜치로 복귀
git checkout feat/payment
git stash pop
```

### 2. 코드 리뷰 중 원본 코드 확인

PR 리뷰를 위해 잠시 변경 전 상태를 보고 싶을 때 활용한다.

```bash
git stash                    # 현재 변경 임시 저장
# 원본 코드 확인
git stash pop                # 다시 복원
```

### 3. 커밋 전 실험적 변경 분리

여러 가지 접근법을 시도할 때, 각각을 stash로 분리해 비교한다.

```bash
# 접근법 A 작업 후 stash
git stash -m "접근법 A: 캐시 적용"

# 접근법 B 작업 후 stash
git stash -m "접근법 B: 쿼리 최적화"

# 비교
git stash show -p stash@{1}   # 접근법 A 확인
git stash show -p stash@{0}   # 접근법 B 확인

# 선택한 접근법 적용
git stash pop stash@{0}
```

## 삭제한 Stash 복구하기

`git stash drop`이나 `git stash clear`로 삭제한 stash도 Git 내부에 커밋 객체가 남아 있는 한 복구할 수 있다.

> 금고에서 물건을 버렸더라도, 쓰레기통(dangling commits)에서 수거 차가 오기 전(`git gc`)에 찾으면 되살릴 수 있는 것과 같다.

### 방법 1: git fsck로 찾기

`git fsck`는 Git 내부 객체 저장소를 검사하는 명령어다. dangling(어디서도 참조되지 않는) commit 중에서 stash의 merge commit을 찾는다.

```bash
# 1단계: 삭제된 stash 후보 목록 가져오기
git fsck --unreachable | grep commit | cut -d ' ' -f3 | xargs git log --merges --no-walk

# 2단계: 출력된 목록에서 복구할 커밋 해시 확인
# (날짜, 메시지를 보고 원하는 stash 식별)

# 3단계: stash로 복구
git update-ref refs/stash <커밋해시> -m "복구할 stash 이름"
```

- `--merges`: stash는 merge commit이므로 이 필터로 대상을 좁힘
- `--no-walk`: 부모 커밋까지 탐색하지 않고 해당 커밋만 표시

### 방법 2: git reflog로 찾기

stash에도 reflog가 남아 있으므로, 최근 삭제라면 reflog가 더 간편하다.

```bash
# stash reflog 확인
git reflog show stash

# 또는 전체 reflog에서 stash 관련 항목 필터
git reflog | grep stash

# 발견한 해시로 복구
git stash apply <커밋해시>
```

### 복구 판단 흐름

```
stash를 실수로 삭제함
        │
        ▼
  git reflog show stash  ──→  목록에 있음? ──→ git stash apply <해시>
        │                           │
        │                          없음
        ▼                           │
  git fsck --unreachable  ←─────────┘
        │
        ▼
  merge commit 목록에서 날짜/메시지로 식별
        │
        ▼
  git update-ref refs/stash <해시>
        │
        ▼
  git stash list 로 복구 확인
```

> **주의**: `git gc`(가비지 컬렉션)가 실행되면 dangling commit이 완전히 삭제되어 복구 불가능. 기본적으로 약 2주 후 자동 실행되므로 빠르게 복구해야 한다.

## stash 명령어 요약

| 명령어 | 설명 |
|---|---|
| `git stash` | 변경 사항 임시 저장 |
| `git stash -m "메시지"` | 메시지와 함께 저장 |
| `git stash -u` | untracked 파일 포함 저장 |
| `git stash list` | stash 목록 조회 |
| `git stash show -p` | stash 내용 상세 확인 |
| `git stash pop` | 꺼내기 + 삭제 |
| `git stash apply` | 꺼내기 (목록 유지) |
| `git stash drop stash@{n}` | 특정 stash 삭제 |
| `git stash clear` | 모든 stash 삭제 |
| `git stash branch <브랜치명>` | stash 내용으로 새 브랜치 생성 |

## 주의사항

| 항목 | 설명 |
|---|---|
| **충돌 가능** | `pop`/`apply` 시 현재 브랜치 상태와 충돌이 발생할 수 있음. 충돌 시 수동 머지 필요 |
| **stash는 로컬 전용** | 원격에 push되지 않음. 다른 환경으로 옮기려면 `git stash show -p \| git apply` 등 패치 활용 |
| **장기 보관 비권장** | 오래 쌓아두면 어떤 작업인지 잊기 쉬움. 메시지를 꼭 달고, 가능하면 빨리 소화할 것 |
| **pop 실패 시** | 충돌로 pop이 실패하면 stash가 삭제되지 않고 남아 있음. 충돌 해결 후 `git stash drop`으로 정리 |

## 참고

- [Git 공식 문서 - git-stash](https://git-scm.com/docs/git-stash)
