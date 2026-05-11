# Git Pull

> 최종 업데이트: 2026-04-08

## 개념

**원격 저장소의 변경 사항을 로컬로 가져와 현재 브랜치에 병합**하는 명령어다. 내부적으로 `git fetch` + `git merge` (또는 `git rebase`)를 순차 실행한다.

- 우편함에 비유하면, 우체국(원격)에서 편지(커밋)를 가져와(`fetch`) 내 책상 위에 올려놓고 읽는(merge) 것
- `git pull` = `git fetch` + `git merge`
- `git pull --rebase` = `git fetch` + `git rebase`

```
원격 (GitHub)                           로컬 (내 PC)
┌──────────────────┐    pull           ┌──────────────────┐
│  main             │ ──────────────→  │  main             │
│  ├── commit A     │   ① fetch       │  ├── commit A     │
│  ├── commit B     │   ② merge       │  ├── commit B     │
│  └── commit C ✨  │                  │  └── commit C ✨  │
└──────────────────┘                   └──────────────────┘
      (변경됨)                               (동기화됨)
```

## git fetch vs git pull

이 둘의 차이를 이해하는 것이 핵심이다.

| 비교 | `git fetch` | `git pull` |
|---|---|---|
| 동작 | 원격 데이터를 **다운로드만** | 다운로드 + **현재 브랜치에 병합** |
| 워킹 디렉토리 | 변경 없음 | 변경됨 (merge/rebase) |
| 충돌 가능성 | 없음 | 있음 |
| 안전성 | 완전히 안전 | 충돌 발생 가능 |
| 비유 | 편지를 우편함에서 꺼내 탁자에 올려놓기 | 꺼내서 바로 읽고 반영하기 |

```
git fetch만 실행:
  원격: A → B → C (origin/main)
  로컬: A → B (main)
  → origin/main은 C를 가리키지만, 로컬 main은 B에 그대로

git pull 실행 (= fetch + merge):
  원격: A → B → C
  로컬: A → B → C (main = origin/main)
  → 로컬 main이 C로 이동
```

### fetch 단독 사용이 유용한 경우

```bash
# 1. 원격 변경 사항을 미리 확인하고 싶을 때
git fetch
git log HEAD..origin/main --oneline   # 원격에만 있는 커밋 확인
git diff HEAD..origin/main            # 변경 내용 확인

# 2. 확인 후 수동으로 병합
git merge origin/main
# 또는
git rebase origin/main
```

> 팀 규모가 크거나 충돌이 잦은 프로젝트에서는 `fetch` → 확인 → `merge/rebase` 패턴이 더 안전하다.

## 기본 사용법

```bash
# 추적 중인 원격 브랜치에서 pull
git pull

# 원격 이름과 브랜치를 명시
git pull origin main

# 다른 브랜치의 변경을 현재 브랜치에 가져오기
git pull origin develop
```

## Pull 전략: Merge vs Rebase

`git pull` 시 원격 변경과 로컬 변경을 합치는 두 가지 방식이 있다.

### Merge (기본값)

원격과 로컬의 변경을 합쳐 **Merge Commit**을 생성한다.

```bash
git pull origin main
# 또는
git pull --no-rebase origin main
```

```
원격:  A → B → C
로컬:  A → B → D (로컬 커밋)

pull (merge) 후:
  A → B → C ──┐
       └→ D ──┴→ M (merge commit)
```

- 히스토리에 분기와 합류가 그대로 남아 **작업 과정이 보존**됨
- merge commit이 많아지면 히스토리가 복잡해질 수 있음

### Rebase

로컬 커밋을 원격 커밋 **위에 다시 쌓는다**. merge commit이 생기지 않아 히스토리가 깔끔하다.

```bash
git pull --rebase origin main
# 또는
git pull -r origin main
```

```
원격:  A → B → C
로컬:  A → B → D (로컬 커밋)

pull --rebase 후:
  A → B → C → D' (D를 C 위에 재적용)
```

- 히스토리가 **일직선**으로 깔끔
- D가 D'로 재작성되므로 커밋 해시가 바뀜 (이미 push한 커밋이면 주의)

### 어떤 전략을 쓸까?

| 상황 | 권장 전략 | 이유 |
|---|---|---|
| 개인 feature 브랜치 | `--rebase` | 깔끔한 히스토리, PR 리뷰 용이 |
| 공유 브랜치 (main, develop) | `merge` (기본) | 히스토리 보존, 안전 |
| PR 머지 전 최신화 | `--rebase` | base가 최신이므로 충돌 최소화 |
| 충돌이 복잡한 경우 | `merge` | rebase 중 충돌은 커밋마다 해결해야 해서 번거로움 |

### 기본 전략 설정

```bash
# pull 시 항상 rebase 사용 (글로벌)
git config --global pull.rebase true

# 특정 프로젝트만 rebase
cd ~/projects/my-project
git config pull.rebase true

# merge로 되돌리기
git config --global pull.rebase false
```

## 충돌 해결

pull 시 같은 파일의 같은 부분을 로컬과 원격에서 각각 수정했으면 **충돌(conflict)**이 발생한다.

```
git pull 실행
     │
     ▼
충돌 발생 (CONFLICT)
     │
     ▼
충돌 파일 열기 (<<<<<<< / ======= / >>>>>>> 마커)
     │
     ▼
수동으로 수정 (원하는 내용만 남기기)
     │
     ▼
git add <충돌 해결한 파일>
     │
     ├── merge 방식이면 → git commit
     └── rebase 방식이면 → git rebase --continue
```

### 충돌 마커

```
<<<<<<< HEAD
로컬에서 수정한 내용
=======
원격에서 수정된 내용
>>>>>>> origin/main
```

```bash
# 충돌 해결 후
git add src/OrderService.java
git commit -m "merge: 주문 서비스 충돌 해결"

# rebase 중 충돌이면
git add src/OrderService.java
git rebase --continue

# 복잡해서 pull을 취소하고 싶을 때
git merge --abort     # merge 방식
git rebase --abort    # rebase 방식
```

## 주요 옵션

| 옵션 | 설명 | 용도 |
|---|---|---|
| `--rebase` (`-r`) | merge 대신 rebase로 병합 | 깔끔한 히스토리 |
| `--no-rebase` | 설정과 관계없이 merge로 병합 | 명시적 merge |
| `--ff-only` | fast-forward만 허용, 아니면 거부 | 충돌 가능성 사전 차단 |
| `--autostash` | pull 전 자동 stash, 후 자동 pop | 커밋 안 한 변경이 있을 때 |
| `--all` | 모든 원격의 변경 가져오기 | 여러 remote 사용 시 |
| `--prune` | 원격에서 삭제된 브랜치를 로컬에서도 정리 | 불필요한 추적 브랜치 정리 |
| `--depth <n>` | 최근 n개 커밋만 가져오기 | 대형 저장소 |

## git fetch 활용

`fetch`는 pull의 안전한 첫 단계다. 원격 데이터만 가져오고 로컬 브랜치는 건드리지 않는다.

```bash
# 기본: origin의 모든 브랜치 데이터 가져오기
git fetch

# 특정 원격
git fetch origin

# 모든 원격
git fetch --all

# 원격에서 삭제된 브랜치를 로컬 추적 목록에서 제거
git fetch --prune

# shallow clone의 전체 이력 복원
git fetch --unshallow
```

### fetch 후 유용한 확인 명령

```bash
# 원격에만 있는 커밋 확인
git log HEAD..origin/main --oneline

# 로컬에만 있는 커밋 확인
git log origin/main..HEAD --oneline

# 원격과 로컬 차이 확인
git diff origin/main

# 원격 브랜치 목록
git branch -r
```

## 실무 워크플로우

### 매일 아침 동기화

```bash
# 방법 1: pull --rebase (간편)
git pull --rebase origin main

# 방법 2: fetch → 확인 → merge (신중)
git fetch
git log HEAD..origin/main --oneline
git merge origin/main
```

### PR 머지 전 최신화

```bash
# feature 브랜치에서 main의 최신 변경 반영
git checkout feature/payment
git pull --rebase origin main

# 충돌 해결 후 push
git push --force-with-lease
```

### 커밋하지 않은 변경이 있을 때 pull

```bash
# 방법 1: --autostash (자동으로 stash → pull → pop)
git pull --rebase --autostash

# 방법 2: 수동 stash
git stash -m "작업 중"
git pull --rebase
git stash pop
```

> `--autostash`는 `pull.rebase true`와 함께 설정하면 편리하다.

## 권장 글로벌 설정

```bash
# pull 시 rebase 기본 사용
git config --global pull.rebase true

# rebase 시 autostash 자동 활성화
git config --global rebase.autoStash true

# fetch 시 삭제된 원격 브랜치 자동 정리
git config --global fetch.prune true
```

이 설정이 적용되면 `git pull`만 실행해도 `--rebase --autostash --prune`과 동일하게 동작한다.

## 자주 쓰는 조합

```bash
# 일반 동기화
git pull

# 깔끔한 rebase pull
git pull --rebase

# 변경 사항 있는 상태에서 안전한 pull
git pull --rebase --autostash

# 원격 확인 후 수동 병합
git fetch
git log HEAD..origin/main --oneline
git merge origin/main

# fast-forward만 허용 (충돌 가능성 원천 차단)
git pull --ff-only

# 브랜치 정리 포함 fetch
git fetch --all --prune
```
