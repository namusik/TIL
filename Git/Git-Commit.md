# Git Commit

> 최종 업데이트: 2026-04-08

## 개념

**Staging Area(Index)에 올라간 변경 사항을 하나의 스냅샷으로 저장소에 기록**하는 명령어다.

- 파일의 "차이(diff)"를 저장하는 게 아니라, 그 시점의 **전체 파일 상태(스냅샷)**를 저장
- 각 커밋은 고유한 **SHA-1 해시**(40자리)로 식별되며, 부모 커밋을 가리켜 **체인(히스토리)**을 형성
- 사진첩에 비유하면, 커밋은 특정 순간을 찍은 **사진 한 장**. 사진을 찍으려면 먼저 피사체를 프레임에 넣어야(staging) 하고, 셔터를 눌러야(commit) 기록됨

```
Working Directory          Staging Area           Repository (.git)
┌────────────────┐        ┌──────────────┐       ┌──────────────────┐
│  파일 수정       │ add →  │  변경 스냅샷    │ commit→│  commit abc123   │
│  파일 생성       │ ────→  │  (Index)      │ ─────→│  ├── tree (파일들) │
│  파일 삭제       │        │              │       │  ├── parent       │
│                │        │              │       │  └── message      │
└────────────────┘        └──────────────┘       └──────────────────┘
```

## 커밋 내부 구조

Git 커밋은 단순 텍스트가 아니라 여러 **Git 객체**의 조합이다.

| 객체 | 역할 | 비유 |
|---|---|---|
| **Commit** | 메타데이터(작성자, 메시지, 시각) + tree/parent 포인터 | 사진 뒷면의 메모 |
| **Tree** | 디렉토리 구조. 파일명 → Blob 매핑 | 폴더 목록 |
| **Blob** | 파일 내용 그 자체 (이름 없음, 내용만) | 사진 원본 데이터 |

```
commit abc123
├── tree def456
│   ├── blob 111... → README.md
│   ├── blob 222... → src/Main.java
│   └── tree 333... → src/utils/
│       └── blob 444... → Helper.java
├── parent 이전커밋해시
├── author: namusik <email> 1712000000
└── message: "feat: 로그인 기능 추가"
```

- `git cat-file -p <해시>` 로 커밋/트리/블롭 내용을 직접 확인 가능
- 같은 내용의 파일은 하나의 Blob으로 **중복 없이 저장**(content-addressable storage)

## 기본 사용법

### Staging → Commit 흐름

```bash
# 1. 변경 파일을 Staging Area에 추가
git add 파일명           # 특정 파일
git add src/            # 특정 디렉토리
git add .               # 현재 디렉토리 전체
git add -A              # 워킹 트리 전체 (삭제 포함)

# 2. Staging 상태 확인
git status

# 3. 커밋
git commit -m "커밋 메시지"
```

### add + commit 동시에

```bash
# tracked 파일의 수정/삭제만 자동 stage 후 커밋
# 새로 생성한(untracked) 파일은 포함되지 않음
git commit -am "커밋 메시지"
```

### 빈 커밋

```bash
# 파일 변경 없이 커밋 생성 (CI 트리거 등에 활용)
git commit --allow-empty -m "trigger CI"
```

## 커밋 메시지 작성법

### Conventional Commits

업계에서 널리 사용되는 커밋 메시지 규약. 자동 버전 관리, CHANGELOG 생성 도구와 연동 가능.

```
<type>(<scope>): <subject>

<body>

<footer>
```

| 구성 요소 | 필수 | 설명 |
|---|---|---|
| **type** | O | 변경 유형 |
| **scope** | X | 변경 범위 (모듈, 컴포넌트) |
| **subject** | O | 50자 이내 요약. 명령문으로 작성 |
| **body** | X | "왜(Why)" 중심의 상세 설명 |
| **footer** | X | Breaking Change, 이슈 번호 등 |

### 주요 type

| type | 의미 | 예시 |
|---|---|---|
| `feat` | 새 기능 추가 | `feat(auth): 소셜 로그인 추가` |
| `fix` | 버그 수정 | `fix(cart): 수량 0 허용 버그 수정` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor: 주문 서비스 메서드 분리` |
| `docs` | 문서 수정 | `docs: API 명세 업데이트` |
| `style` | 포맷팅, 세미콜론 등 (코드 의미 변경 없음) | `style: 들여쓰기 수정` |
| `test` | 테스트 추가/수정 | `test: 결제 단위 테스트 추가` |
| `chore` | 빌드, 설정 파일 등 기타 | `chore: Gradle 버전 업그레이드` |
| `perf` | 성능 개선 | `perf: 쿼리 N+1 해결` |
| `ci` | CI 설정 변경 | `ci: GitHub Actions 캐시 추가` |

### 멀티라인 메시지 작성

```bash
# -m 플래그 여러 번 사용 (각각 별도 문단)
git commit -m "feat(auth): 소셜 로그인 추가" -m "Google, Kakao OAuth2 연동. 기존 세션 방식은 유지."

# 에디터에서 작성
git commit   # -m 없이 실행하면 설정된 에디터가 열림
```

## 주요 옵션

| 옵션 | 설명 | 용도 |
|---|---|---|
| `-m "메시지"` | 인라인 커밋 메시지 | 간단한 커밋 |
| `-am "메시지"` | add + commit 동시 (tracked만) | 빠른 커밋 |
| `--amend` | 직전 커밋 수정 | 메시지 오타, 파일 누락 |
| `--allow-empty` | 변경 없이 빈 커밋 | CI 트리거 |
| `--no-edit` | amend 시 메시지 유지 | 파일만 추가할 때 |
| `-S` | GPG 서명 | 커밋 검증 |
| `--date="..."` | 작성일 지정 | 특수한 경우 |
| `--fixup=<해시>` | fixup 커밋 생성 | rebase --autosquash용 |

## 커밋 수정

### amend — 직전 커밋 수정

마지막 커밋의 메시지나 내용을 수정한다. **새 커밋을 만드는 게 아니라 기존 커밋을 대체**하므로, 이미 push한 커밋에는 주의.

```bash
# 메시지만 수정
git commit --amend -m "새 메시지"

# 파일 추가 후 메시지는 유지
git add 빠뜨린파일.java
git commit --amend --no-edit
```

> **push 후 amend 시**: `git push --force-with-lease` 필요. 혼자 쓰는 브랜치에서만 권장.

### revert — 커밋 되돌리기 (안전)

지정한 커밋의 변경을 **반대로 적용하는 새 커밋**을 생성. 히스토리를 보존하므로 협업 시 안전.

```bash
# 특정 커밋 되돌리기
git revert <커밋해시>

# 연속된 여러 커밋 되돌리기
git revert <이전해시>..<최신해시>

# 커밋 생성 없이 워킹 디렉토리만 변경 (직접 커밋)
git revert --no-commit <커밋해시>
```

```
A → B → C → D (현재)
         revert C
A → B → C → D → C' (C의 변경을 되돌리는 새 커밋)
```

### reset — 커밋 제거 (주의)

HEAD를 과거 커밋으로 이동시켜 이후 커밋을 **히스토리에서 제거**. 공유 브랜치에서는 사용 금지.

| 모드 | Staging Area | Working Directory | 용도 |
|---|---|---|---|
| `--soft` | 유지 | 유지 | 커밋만 취소, 다시 커밋 가능 |
| `--mixed` (기본) | 초기화 | 유지 | 커밋 + staging 취소 |
| `--hard` | 초기화 | 초기화 | 완전히 되돌림 (변경 사항 삭제) |

```bash
git reset --soft HEAD~1   # 커밋만 취소, 변경은 staging에 유지
git reset --mixed HEAD~1  # 커밋 + staging 취소, 워킹 디렉토리 유지
git reset --hard HEAD~1   # 완전 삭제 (복구 어려움)
```

> 자세한 내용은 [Git Reset](Git-Reset.md) 참고

### revert vs reset 비교

| 항목 | revert | reset |
|---|---|---|
| 히스토리 | 보존 (새 커밋 추가) | 변경 (커밋 제거) |
| 안전성 | 협업 브랜치에서 안전 | 개인 브랜치에서만 권장 |
| force push | 불필요 | 필요 (`--force-with-lease`) |
| 되돌리기 대상 | 특정 커밋 하나씩 | HEAD 이후 전체 |

## 커밋 히스토리 조회

### git log 기본

```bash
# 기본 로그
git log

# 한 줄 요약
git log --oneline

# 그래프 + 브랜치 표시
git log --oneline --graph --all

# 최근 5개만
git log -5
```

### 필터링

```bash
# 특정 파일의 커밋
git log -- src/Main.java

# 특정 작성자
git log --author="namusik"

# 날짜 범위
git log --since="2026-01-01" --until="2026-04-01"

# 메시지 검색
git log --grep="fix"

# 코드 변경 내용 검색 (pickaxe)
git log -S "함수명"
```

### 커밋 상세 보기

```bash
# 특정 커밋의 변경 내용
git show <커밋해시>

# 특정 커밋의 특정 파일
git show <커밋해시>:src/Main.java

# 두 커밋 간 차이
git diff <커밋1>..<커밋2>
```

## 커밋 관련 유용한 명령어

| 명령어 | 설명 |
|---|---|
| `git log --oneline` | 커밋 히스토리 한 줄 요약 |
| `git show <해시>` | 특정 커밋 상세 조회 |
| `git diff --staged` | staging된 변경 사항 확인 |
| `git blame <파일>` | 파일의 각 줄을 마지막으로 수정한 커밋 확인 |
| `git cherry-pick <해시>` | 다른 브랜치의 특정 커밋을 현재 브랜치에 적용 |
| `git reflog` | HEAD 이동 이력 (reset 후 복구에 유용) |
| `git stash` | 커밋하지 않은 변경 사항을 임시 저장 |
| `git rebase -i HEAD~n` | 최근 n개 커밋을 대화형으로 편집 (squash, reorder 등) |
| `git bisect start` | 이진 탐색으로 버그 도입 커밋 찾기 |

## git bisect - 버그 커밋 찾기

이진 탐색(binary search)으로 **버그가 처음 도입된 커밋**을 빠르게 찾는 도구다. 수백 개의 커밋 중에서도 `O(log n)` 만에 원인 커밋을 특정할 수 있다.

도서관에서 "몇 번째 페이지부터 오탈자가 생겼는지" 찾을 때, 절반씩 넘기며 범위를 좁혀가는 것과 같은 원리.

```bash
# 1. bisect 시작
git bisect start

# 2. 현재(버그 있는) 커밋을 bad으로 지정
git bisect bad

# 3. 정상이었던 과거 커밋을 good으로 지정
git bisect good <정상커밋해시>

# 4. Git이 중간 커밋을 checkout → 테스트 후 good/bad 판정 반복
git bisect good   # 또는
git bisect bad

# 5. 원인 커밋을 찾으면 결과 출력 → 종료
git bisect reset
```

```bash
# 자동화: 스크립트로 good/bad 자동 판정
git bisect start HEAD <정상커밋>
git bisect run ./test.sh   # 종료코드 0이면 good, 그 외 bad
```

## 커밋 서명 (GPG / SSH Signing)

커밋에 **암호학적 서명**을 추가하여, 해당 커밋이 본인이 작성한 것임을 증명한다. GitHub/GitLab에서 `Verified` 배지로 표시된다.

| 서명 방식 | 설정 | 특징 |
|---|---|---|
| **GPG** | `git config --global gpg.format openpgp` | 전통적인 방식. GPG 키 필요 |
| **SSH** | `git config --global gpg.format ssh` | Git 2.34+. 기존 SSH 키 재활용 가능 |

```bash
# GPG 서명 커밋
git commit -S -m "feat: 서명된 커밋"

# 모든 커밋에 자동 서명
git config --global commit.gpgSign true

# SSH 키로 서명 (Git 2.34+)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# 서명 검증
git log --show-signature
git verify-commit <커밋해시>
```

> CI/CD 파이프라인이나 오픈소스 프로젝트에서 커밋 위변조 방지를 위해 서명을 요구하는 경우가 늘고 있다.

## 자주 쓰는 조합

```bash
# 일반 커밋 플로우
git add .
git commit -m "feat(order): 주문 취소 기능 추가"

# 커밋 메시지 오타 수정
git commit --amend -m "fix(order): 주문 취소 시 재고 복원 누락 수정"

# 파일 하나 빠뜨렸을 때
git add 빠뜨린파일.java
git commit --amend --no-edit

# 잘못된 커밋을 안전하게 되돌리기 (협업 브랜치)
git revert <커밋해시>

# 직전 커밋 취소 후 다시 작업 (개인 브랜치)
git reset --soft HEAD~1
# 수정 후 다시 커밋

# 특정 커밋만 가져오기
git cherry-pick <커밋해시>

# 커밋 히스토리 깔끔하게 정리 후 push
git rebase -i HEAD~3
git push --force-with-lease
```
