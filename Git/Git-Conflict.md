# Git Conflict

> 최종 업데이트: 2026-04-10

## 개념

**두 브랜치가 같은 파일의 같은 부분을 서로 다르게 수정했을 때, Git이 자동으로 합칠 수 없어 발생하는 상태**다.

Git은 대부분의 변경을 자동으로 합치지만(auto-merge), 같은 라인을 양쪽에서 수정한 경우에는 어느 쪽을 선택할지 판단할 수 없어 사람에게 해결을 맡긴다.

```
main:       파일 10번째 줄 → "email"로 수정
feature:    파일 10번째 줄 → "username"으로 수정
                 ↓
           Git: "둘 중 뭘 쓸지 나는 모르겠다" → Conflict 발생
```

---

## 충돌이 발생하는 경우 vs 안 하는 경우

| 상황 | 충돌 여부 |
|------|----------|
| 서로 **다른 파일** 수정 | 자동 머지 (충돌 없음) |
| 같은 파일의 **다른 부분** 수정 | 자동 머지 (충돌 없음) |
| 같은 파일의 **같은 라인** 수정 | **충돌 발생** |
| 한쪽에서 파일 수정, 다른 쪽에서 **삭제** | **충돌 발생** |
| 양쪽에서 같은 이름의 **새 파일 생성** | **충돌 발생** |

---

## 충돌 마커 읽는 법

충돌이 발생하면 Git이 파일에 **충돌 마커**를 삽입한다.

```
<<<<<<< HEAD (Current Change)
private String email;
=======
private String username;
>>>>>>> feature/login (Incoming Change)
```

| 마커 | 의미 |
|------|------|
| `<<<<<<< HEAD` | Current Change의 시작 |
| `=======` | 두 변경의 구분선 |
| `>>>>>>> feature/login` | Incoming Change의 끝 |

---

## Current Change vs Incoming Change

**어떤 명령어를 쓰냐에 따라 current/incoming의 의미가 달라진다.** 충돌 해결 시 가장 헷갈리는 부분이다.

### merge할 때

```bash
git switch main
git merge feature/login
```

```
  main (Current Change = HEAD = 내가 서 있는 곳)
    │
    ▼
<<<<<<< HEAD
private String email;          ← main의 코드
=======
private String username;       ← feature/login의 코드
>>>>>>> feature/login
    ▲
    │
  feature/login (Incoming Change = 가져오려는 것)
```

| 구분 | 의미 |
|------|------|
| **Current Change** (HEAD) | 내가 지금 서 있는 브랜치 (`main`) |
| **Incoming Change** | 가져오려는 브랜치 (`feature/login`) |

### rebase할 때 (반대가 된다)

```bash
git switch feature/login
git rebase main
```

| 구분 | 의미 | 주의 |
|------|------|------|
| **Current Change** (HEAD) | rebase 대상인 `main` | **내 코드가 아님** |
| **Incoming Change** | 내 브랜치의 커밋 (`feature/login`) | **이게 내 코드** |

> rebase는 main의 최신 커밋 위에 내 커밋을 **하나씩 재적용**하는 과정이다. 그래서 main이 base(current)가 되고, 내 커밋이 들어오는(incoming) 쪽이 된다.

### 명령어별 정리

| 명령어 | Current Change | Incoming Change |
|--------|---------------|-----------------|
| `git merge feature` | **내 브랜치** (HEAD) | 가져오는 브랜치 |
| `git rebase main` | **main** (대상 브랜치) | 내 커밋 |
| `git pull` (기본 merge) | 내 로컬 | 원격 |
| `git pull --rebase` | 원격 | 내 로컬 커밋 |
| `git cherry-pick abc123` | **내 브랜치** (HEAD) | 가져오는 커밋 |
| `git stash pop` | **현재 Working Directory** | stash에 저장한 변경 |

---

## 충돌 해결 방법

### 선택지

```
<<<<<<< HEAD
private String email;
=======
private String username;
>>>>>>> feature/login
```

```java
// 1. Accept Current — Current Change만 유지
private String email;

// 2. Accept Incoming — Incoming Change만 유지
private String username;

// 3. Accept Both — 둘 다 유지
private String email;
private String username;

// 4. 직접 수정 — 완전히 새로운 코드로 작성
private String loginId;
```

> 마커(`<<<<<<<`, `=======`, `>>>>>>>`)는 반드시 전부 제거해야 한다. 남아있으면 컴파일 에러가 발생한다.

### IDE에서 해결

VS Code, IntelliJ 모두 충돌 마커 위에 버튼을 제공한다.

| IDE | 제공 기능 |
|-----|----------|
| **VS Code** | Accept Current / Accept Incoming / Accept Both / Compare Changes 버튼 |
| **IntelliJ** | Merge Tool (3-way 비교 에디터) — 왼쪽(yours), 가운데(결과), 오른쪽(theirs) |

### GitHub UI에서 해결

간단한 충돌은 PR 페이지에서 직접 해결할 수 있다.

1. PR 페이지에서 **"Resolve conflicts"** 버튼 클릭
2. 웹 에디터에서 충돌 마커를 수정
3. **"Mark as resolved"** → **"Commit merge"**

> 복잡한 충돌(바이너리 파일, 대규모 변경)은 웹에서 해결 불가. 로컬에서 해결해야 한다.

---

## merge 충돌 해결 흐름

```bash
# 1. merge 실행 → 충돌 발생
git switch main
git merge feature/login
# CONFLICT (content): Merge conflict in UserService.java
# Automatic merge failed; fix conflicts and then commit the result.

# 2. 충돌 파일 확인
git status
# Both modified: UserService.java

# 3. 파일 열어서 충돌 마커 해결 (IDE 또는 편집기)

# 4. 해결한 파일 스테이징
git add UserService.java

# 5. 머지 커밋 생성
git commit
# 기본 메시지: "Merge branch 'feature/login'"

# (선택) 머지 취소하고 원래 상태로 되돌리기
git merge --abort
```

---

## rebase 충돌 해결 흐름

rebase는 커밋을 **하나씩** 재적용하므로, 커밋마다 충돌이 발생할 수 있다.

```bash
# 1. rebase 실행 → 충돌 발생
git switch feature/login
git rebase main
# CONFLICT (content): Merge conflict in UserService.java

# 2. 충돌 해결 (파일 수정)

# 3. 해결한 파일 스테이징
git add UserService.java

# 4. rebase 계속 진행 (다음 커밋 재적용)
git rebase --continue
# → 다음 커밋에서 또 충돌이 발생할 수 있음. 2~4 반복

# (선택) rebase 전체 취소
git rebase --abort
```

| merge vs rebase 충돌 해결 | merge | rebase |
|--------------------------|-------|--------|
| **충돌 해결 횟수** | 한 번에 모두 | 커밋마다 개별 해결 |
| **완료 후** | `git commit` | `git rebase --continue` |
| **취소** | `git merge --abort` | `git rebase --abort` |
| **push** | `git push` | `git push --force-with-lease` |

---

## 충돌 예방 팁

| 방법 | 효과 |
|------|------|
| **자주 pull/merge** | main의 변경을 자주 가져와 차이를 줄임 |
| **작은 PR** | 변경 범위가 작을수록 충돌 확률 낮음 |
| **파일 분리** | 하나의 거대한 파일보다 여러 작은 파일이 충돌이 적음 |
| **팀 커뮤니케이션** | 같은 파일을 동시에 수정하는 상황을 사전에 공유 |
| **포맷팅 통일** | 코드 포맷터(Prettier, ktlint 등)로 불필요한 diff 방지 |

---

## 유용한 명령어

```bash
# 충돌 중인 파일 목록 확인
git diff --name-only --diff-filter=U

# 3-way diff로 충돌 확인 (공통 조상 포함)
git diff --merge

# 머지/리베이스 도중 상태 확인
git status

# merge 취소
git merge --abort

# rebase 취소
git rebase --abort

# cherry-pick 취소
git cherry-pick --abort
```

---

## 참고

- https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
- https://git-scm.com/docs/git-merge
- https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts
