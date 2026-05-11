# Git Push

> 최종 업데이트: 2026-04-08

## 개념

**로컬 저장소의 커밋을 원격 저장소(Remote)에 업로드**하는 명령어다.

- 편지에 비유하면, 로컬에서 편지(커밋)를 쓴 뒤 우체통에 넣어(push) 상대방 우체국(원격 저장소)에 보내는 것
- push는 로컬 브랜치의 커밋을 원격 브랜치에 **Fast-forward** 또는 **Merge** 방식으로 반영
- push할 커밋이 없으면 `Everything up-to-date`가 출력됨

```
로컬 (내 PC)                           원격 (GitHub)
┌──────────────────┐    push          ┌──────────────────┐
│  main             │ ──────────────→ │  main             │
│  ├── commit A     │                 │  ├── commit A     │
│  ├── commit B     │                 │  ├── commit B     │
│  └── commit C ✨  │                 │  └── commit C ✨  │
└──────────────────┘                  └──────────────────┘
      (작성)                                (반영됨)
```

## 기본 사용법

```bash
# 현재 브랜치를 추적 중인 원격 브랜치에 push
git push

# 원격 이름과 브랜치를 명시
git push origin main
```

### 최초 push (Upstream 설정)

새 브랜치를 처음 push할 때는 원격에 해당 브랜치가 없으므로 **Upstream(추적 브랜치)**을 설정해야 한다.

```bash
# -u (--set-upstream): 로컬 브랜치와 원격 브랜치의 추적 관계 설정
git push -u origin feature/login

# 이후에는 git push만으로 충분
git push
```

> `-u`는 최초 1회만 하면 된다. 이후 `git push`, `git pull` 시 자동으로 해당 원격 브랜치를 대상으로 동작.

### push 동작 흐름

```
git push 실행
     │
     ▼
원격 브랜치가 로컬보다 뒤에 있는가?
     │
     ├── 예 (Fast-forward 가능) ──→ 원격 브랜치 포인터를 앞으로 이동 → 성공
     │
     └── 아니오 (원격에 로컬에 없는 커밋이 있음)
              │
              ├── 일반 push ──→ 거부 (rejected)
              │                   └→ git pull 후 다시 push
              │
              └── force push ──→ 원격을 강제 덮어쓰기 (위험)
```

## Fast-forward vs Non-fast-forward

| 상황 | 동작 | 결과 |
|---|---|---|
| **Fast-forward** | 원격 브랜치가 로컬의 조상(ancestor)인 경우 | 포인터만 이동 → push 성공 |
| **Non-fast-forward** | 원격에 로컬에 없는 새 커밋이 있는 경우 | push 거부 → pull 먼저 필요 |

```
Fast-forward (성공):
  원격: A → B
  로컬: A → B → C → D
  push 후 원격: A → B → C → D    ← 포인터만 D로 이동

Non-fast-forward (거부):
  원격: A → B → X (다른 사람의 커밋)
  로컬: A → B → C
  → rejected! 원격의 X를 먼저 pull 해야 함
```

## Tracking Branch (추적 브랜치)

로컬 브랜치와 원격 브랜치의 연결 관계다. 추적 관계가 설정되면 `git push`/`git pull`에서 대상 브랜치를 생략할 수 있다.

```bash
# 현재 브랜치의 추적 정보 확인
git branch -vv
# * main       abc1234 [origin/main] feat: 로그인
# * feature/x  def5678 [origin/feature/x: ahead 2] 작업 중

# 추적 관계 설정/변경
git branch --set-upstream-to=origin/main main
# 또는 push 시
git push -u origin feature/login
```

| 표시 | 의미 |
|---|---|
| `[origin/main]` | 동기화 상태 |
| `[origin/main: ahead 2]` | 로컬이 원격보다 커밋 2개 앞섬 (push 필요) |
| `[origin/main: behind 3]` | 원격이 로컬보다 커밋 3개 앞섬 (pull 필요) |
| `[origin/main: ahead 1, behind 2]` | 양쪽 다 새 커밋 있음 (pull 후 push) |

## 주요 옵션

| 옵션 | 설명 | 용도 |
|---|---|---|
| `-u` / `--set-upstream` | 추적 브랜치 설정 | 새 브랜치 최초 push |
| `--force-with-lease` | 원격에 예상치 못한 커밋이 없을 때만 강제 push | amend, rebase 후 안전한 force push |
| `--force` (`-f`) | 무조건 강제 push | 위험 — 동료 커밋 유실 가능 |
| `--tags` | 모든 태그 push | 릴리즈 태그 공유 |
| `--all` | 모든 브랜치 push | 저장소 미러링 |
| `--delete` | 원격 브랜치 삭제 | 머지 완료된 브랜치 정리 |
| `--dry-run` (`-n`) | 실제 push 없이 결과만 확인 | 사전 검증 |
| `--no-verify` | pre-push hook 건너뜀 | hook 문제 우회 (비권장) |

## Force Push

히스토리를 재작성(`amend`, `rebase`, `reset`)한 후에는 일반 push가 거부된다. 이때 force push가 필요하다.

> force push 상세 설명은 [Git 커밋 히스토리 관리](Git%20커밋%20히스토리%20관리.md) 참고

```bash
# 안전한 force push (권장)
git push --force-with-lease origin feature/my-branch

# 위험한 force push (비권장)
git push --force origin feature/my-branch
```

| 비교 | `--force` | `--force-with-lease` |
|---|---|---|
| 동작 | 무조건 덮어쓰기 | 원격 ref가 예상과 다르면 거부 |
| 동료 커밋 | 유실 가능 | 보호됨 |
| 사용 | 절대적으로 확신할 때만 | **기본으로 사용할 것** |

## 태그 Push

기본 `git push`는 **태그를 포함하지 않는다**. 태그는 별도로 push해야 한다.

```bash
# 특정 태그 push
git push origin v1.0.0

# 모든 태그 push
git push --tags

# 특정 태그 삭제 (원격)
git push origin --delete v1.0.0-beta
```

## 원격 브랜치 관리

```bash
# 원격 브랜치 삭제
git push origin --delete feature/old-branch
# 또는
git push origin :feature/old-branch

# 로컬 브랜치명과 다른 원격 브랜치명으로 push
git push origin local-branch:remote-branch

# 원격의 삭제된 브랜치 정보를 로컬에서 정리
git remote prune origin
# 또는
git fetch --prune
```

## Push 거부 시 대처

```
git push 거부됨 (rejected)
     │
     ▼
원인 파악: "non-fast-forward" 메시지 확인
     │
     ├── 원격에 다른 사람의 커밋이 있음
     │        └→ git pull → 충돌 해결 → git push
     │
     ├── rebase/amend 후 히스토리가 달라짐
     │        └→ git push --force-with-lease
     │
     └── Branch Protection Rule에 의해 차단
              └→ PR을 통해 머지 (직접 push 불가)
```

## Branch Protection (GitHub)

GitHub에서는 중요 브랜치에 직접 push를 막고 PR을 강제할 수 있다. 백엔드 프로젝트에서 `main`/`develop` 브랜치를 보호하는 일반적인 설정이다.

| 규칙 | 설명 |
|---|---|
| **Require pull request** | 직접 push 금지, PR 필수 |
| **Require approvals** | 최소 n명의 리뷰 승인 필요 |
| **Require status checks** | CI 통과 필수 |
| **Require linear history** | merge commit 금지 (rebase/squash만 허용) |
| **Restrict force pushes** | force push 차단 |

```
개발자 → push to main → ❌ 거부 (Branch Protection)
개발자 → push to feature/x → ✅ 성공
       → PR 생성 → 리뷰 → CI 통과 → main에 머지 ✅
```

## 자주 쓰는 조합

```bash
# 새 브랜치 최초 push
git push -u origin feature/new-feature

# 일반 push
git push

# amend 후 안전한 force push (개인 브랜치)
git commit --amend -m "수정된 메시지"
git push --force-with-lease

# 릴리즈 태그 push
git tag v1.2.0
git push origin v1.2.0

# 머지 완료된 원격 브랜치 삭제
git push origin --delete feature/old-branch

# push 전 사전 확인
git push --dry-run
```
