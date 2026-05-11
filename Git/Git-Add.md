# Git Add

> 최종 업데이트: 2026-04-10

## 개념

**Working Directory의 변경 사항을 Staging Area(Index)에 등록하는 명령어**다.

커밋할 내용을 "선별"하는 단계라고 보면 된다. 마트에서 카트에 물건을 담는 것과 같다 — 카트에 담아야(add) 계산(commit)할 수 있다.

```
Working Directory          Staging Area (Index)     Repository
┌──────────────┐          ┌──────────────┐         ┌──────────────┐
│ file1.java ✏️ │  add →   │ file1.java   │         │              │
│ file2.java ✏️ │          │              │  commit→│  커밋 기록     │
│ file3.java   │          │              │         │              │
└──────────────┘          └──────────────┘         └──────────────┘
  3개 수정했지만            1개만 골라 담음           아직 커밋 안 함
```

- `git add`는 커밋에 포함할 변경을 **직접 선택**하는 과정
- add 하지 않은 변경은 커밋에 포함되지 않음
- 같은 파일을 수정 → add → 다시 수정하면, **두 번째 수정은 add 안 된 상태**. 다시 add 해야 함

---

## Staging Area가 필요한 이유

파일 10개를 수정했는데 그 중 3개만 커밋하고 싶을 때, `git add`로 **원하는 것만 골라서 커밋**할 수 있다.

```bash
# 로그인 관련 파일만 골라서 커밋
git add AuthService.java LoginController.java
git commit -m "feat: 로그인 기능 추가"

# 나머지는 다음 커밋에서
git add PaymentService.java
git commit -m "feat: 결제 기능 추가"
```

> Staging Area 없이 `git commit`만 있었다면, 변경한 파일 전부를 한 커밋에 넣을 수밖에 없다. **커밋 단위를 의미 있게 나누기 위해** Staging Area가 존재한다.

---

## 기본 명령어

### 파일 지정 add

```bash
# 특정 파일 스테이징
git add file1.java

# 여러 파일 지정
git add file1.java file2.java

# 특정 디렉토리 전체
git add src/

# 특정 확장자 전체
git add *.java
```

### 전체 add

```bash
# 현재 디렉토리 이하 모든 변경 (새 파일 + 수정 + 삭제)
git add .

# 저장소 전체 모든 변경 (위치 무관)
git add -A
git add --all
```

| 명령어 | 새 파일 | 수정 파일 | 삭제 파일 | 범위 |
|--------|--------|----------|----------|------|
| `git add .` | O | O | O | 현재 디렉토리 이하 |
| `git add -A` | O | O | O | **저장소 전체** |
| `git add -u` | X | O | O | 이미 추적 중인 파일만 |

### 부분 add (hunk 단위)

하나의 파일 안에서도 **일부 변경만 골라서** 스테이징할 수 있다.

```bash
git add -p file.java
# 또는
git add --patch file.java
```

```
@@ -10,6 +10,8 @@ public class UserService {
+    private String email;    // 로그인 관련
+    private int cartSize;    // 장바구니 관련

Stage this hunk [y,n,s,q,a,d,?]?
```

| 입력 | 동작 |
|------|------|
| `y` | 이 hunk 스테이징 |
| `n` | 이 hunk 건너뛰기 |
| `s` | hunk를 더 작게 분할 |
| `q` | 종료 (나머지 전부 스킵) |
| `a` | 이 파일의 나머지 hunk 전부 스테이징 |

> 하나의 파일에 로그인 기능과 장바구니 기능을 같이 수정했을 때, `-p` 옵션으로 로그인 부분만 골라서 커밋할 수 있다.

---

## 스테이징 상태 확인

### git status

```bash
git status
```

```
Changes to be committed:          ← add 된 것 (커밋 대상)
  modified:   AuthService.java

Changes not staged for commit:    ← add 안 된 것
  modified:   PaymentService.java

Untracked files:                  ← 새 파일 (한번도 추적 안 됨)
  NewFile.java
```

### git diff 비교

| 명령어 | 비교 대상 | 용도 |
|--------|----------|------|
| `git diff` | Working Directory ↔ Staging Area | add **안 한** 변경 확인 |
| `git diff --staged` | Staging Area ↔ 마지막 커밋 | add **한** 변경 확인 (= 커밋될 내용) |
| `git diff HEAD` | Working Directory ↔ 마지막 커밋 | 마지막 커밋 이후 모든 변경 확인 |

```
마지막 커밋        Staging Area       Working Directory
┌──────────┐     ┌──────────┐       ┌──────────┐
│ 원본 코드  │ ←── │ add한 변경 │ ←──── │ 현재 파일  │
└──────────┘     └──────────┘       └──────────┘
  diff --staged      diff               diff HEAD
  (이 차이가 커밋됨)   (아직 add 안 됨)     (전체 변경)
```

---

## 스테이징 취소 (Unstage)

실수로 add 한 파일을 Staging Area에서 내리는 방법이다. **파일 내용은 그대로 유지**되고 add만 취소된다.

```bash
# Git 2.23+ (권장)
git restore --staged file.java

# 전통적 방식
git reset HEAD file.java

# 전체 언스테이징
git restore --staged .
```

| 명령어 | 파일 내용 | Staging |
|--------|----------|---------|
| `git restore --staged file` | 유지 | 취소 |
| `git restore file` | **원래대로 되돌림 (주의)** | - |

> `--staged` 없이 `git restore file`을 하면 Working Directory의 변경 자체가 사라지므로 주의해야 한다.

---

## tracked vs untracked 파일

Git이 한 번이라도 추적한 적 있는 파일과 없는 파일의 동작이 다르다.

| 상태 | 의미 | git add 필요 | IDE 자동 감지 |
|------|------|-------------|-------------|
| **tracked + modified** | 기존 추적 파일을 수정 | 수동 또는 IDE가 대신 | 자동으로 잡힘 |
| **untracked** | 새로 생성된 파일 (한번도 커밋 안 됨) | **반드시 수동 add** | 팝업으로 확인 |
| **ignored** | `.gitignore`에 등록된 파일 | add 자체가 무시됨 | 안 보임 |

```bash
# .gitignore에 등록된 파일을 강제로 add
git add -f build/output.jar
```

> IDE(IntelliJ 등)에서 기존 파일 수정 시 자동으로 커밋 대상에 잡히는 이유는, IDE가 내부적으로 `git add`를 대신 해주기 때문이다. 새 파일은 "Add file to Git?" 팝업을 통해 확인한다.

---

## add 안 한 변경의 특성

add/commit 하지 않은 변경은 **특정 브랜치에 속하지 않는다**. Working Directory(로컬 파일 시스템)에 떠 있는 상태다.

```bash
# feature 브랜치에서 파일 수정 (add 안 함)
git switch main
# → 수정 내용이 main에서도 그대로 보임 (브랜치를 따라다님)
```

브랜치 전환 시 충돌이 발생하면 전환이 거부된다.

```bash
git switch main
# error: Your local changes would be overwritten by checkout.
```

이때 해결 방법:

```bash
# 커밋하고 전환
git add . && git commit -m "작업 중 저장"

# 또는 임시 보관
git stash
git switch main
```

---

## 자주 쓰는 조합

```bash
# 모든 변경 add + 커밋 (tracked 파일만, 새 파일 제외)
git commit -am "커밋 메시지"

# 전체 add + 커밋 (새 파일 포함)
git add . && git commit -m "커밋 메시지"

# 변경 확인 → 선택적 add → 커밋
git status
git add -p
git diff --staged
git commit -m "커밋 메시지"
```

> `git commit -am`은 `-a`(tracked 파일 전부 자동 add) + `-m`(메시지)의 조합이다. 새 파일(untracked)은 포함되지 않으므로 주의.

---

## 참고

- https://git-scm.com/docs/git-add
- https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
