# Git 커밋 히스토리 관리

> 최종 업데이트: 2026-04-08

## 개념

Git은 모든 변경을 **커밋 체인**으로 기록한다. 한 번 push된 커밋은 코드를 수정해서 다시 push해도 **이전 커밋에 원본이 그대로 남아 있다**. 민감 정보(API 키, DB 비밀번호 등)가 커밋에 포함되면 단순 삭제 커밋으로는 이력에서 사라지지 않는다.

- 은행 거래 내역에 비유하면, 잘못 보낸 송금을 "취소 거래"로 되돌릴 수는 있지만 **거래 기록 자체는 장부에 남아 있는 것**과 같다
- 히스토리를 **진짜로** 지우려면 장부 자체를 다시 써야(rewrite) 한다

> **참고**: reset/revert/amend 의 기본 동작은 [Git Commit.md](Git%20Commit.md)에서, reset 상세는 [Git Reset.md](Git%20Reset.md)에서 다룬다. 이 문서는 **히스토리를 고치거나 민감 데이터를 완전히 제거**하는 데 집중한다.

## 히스토리 관리 도구 비교

| 도구 | 용도 | 장점 | 단점 |
|---|---|---|---|
| `git reset` | 최근 커밋 제거 | 간단, 빠름 | 이미 push된 커밋은 force push 필요 |
| `git rebase -i` | 커밋 편집/합치기/순서 변경 | 세밀한 제어 | 충돌 해결 필요할 수 있음 |
| `git filter-repo` | 전체 이력에서 파일/데이터 완전 삭제 | 빠르고 안전, 공식 추천 | 별도 설치 필요 (`pip install git-filter-repo`) |
| `git filter-branch` | 전체 이력 재작성 (레거시) | Git 내장 | 느리고 위험, **공식적으로 비권장** |
| **BFG Repo-Cleaner** | 대용량 파일·민감정보 일괄 삭제 | 매우 빠름, 사용 간편 | Java 필요, filter-repo보다 유연성 낮음 |

## 시나리오별 가이드

### 1. 최근 1개 커밋 제거 (push 전)

아직 push하지 않았다면 reset으로 간단히 제거.

```bash
# 커밋만 취소, 변경 사항은 staging에 유지
git reset --soft HEAD~1

# 커밋과 변경 사항 모두 삭제
git reset --hard HEAD~1
```

### 2. 최근 1개 커밋 제거 (push 후)

이미 push한 경우 원격에도 반영해야 한다.

```bash
git reset --hard HEAD~1
git push --force-with-lease origin main
```

> `--force-with-lease`는 다른 사람이 그 사이에 push한 커밋이 있으면 거부된다. 실수로 동료의 작업을 날리는 것을 방지.

### 3. 중간 커밋 편집 (rebase -i)

최근 n개 커밋 중 특정 커밋을 수정·삭제·합치고 싶을 때.

```bash
git rebase -i HEAD~3
```

에디터에서 각 커밋 앞의 명령어를 변경한다.

| 명령어 | 동작 | 비유 |
|---|---|---|
| `pick` | 그대로 유지 | 사진 보존 |
| `drop` | 커밋 삭제 | 사진 폐기 |
| `squash` | 이전 커밋과 합침 (메시지 편집) | 여러 장을 한 장으로 합성 |
| `fixup` | 이전 커밋과 합침 (메시지 버림) | 합성 후 메모 삭제 |
| `edit` | 해당 커밋에서 멈춤 → 수정 가능 | 사진 리터칭 |
| `reword` | 커밋 메시지만 수정 | 사진 뒷면 메모만 고침 |

### 4. 특정 파일을 전체 이력에서 완전 삭제

단순 `git rm`으로는 현재 트리에서만 제거될 뿐, 과거 커밋에 파일이 남아 있다. **git filter-repo**를 사용하면 모든 커밋에서 해당 파일을 제거한 새 히스토리를 생성한다.

```bash
# 설치
pip install git-filter-repo

# 특정 파일을 전체 이력에서 삭제
git filter-repo --invert-paths --path config/secrets.yml

# 특정 디렉토리 삭제
git filter-repo --invert-paths --path-glob '*.env'
```

> filter-repo는 **로컬 리포를 재작성**하므로 실행 전 반드시 백업(클론)을 만들 것.

### 5. 민감 정보(텍스트) 치환

파일은 남기되, 특정 문자열(비밀번호, 토큰 등)만 전체 이력에서 치환.

```bash
# expressions.txt 파일에 치환 규칙 작성
# regex:패턴==>대체문자열
echo 'regex:AKIA[0-9A-Z]{16}==>***REDACTED***' > expressions.txt

git filter-repo --replace-text expressions.txt
```

### 6. BFG Repo-Cleaner로 대용량 파일·비밀 삭제

**BFG**는 Roberto Tyley가 만든 오픈소스 도구로, filter-branch보다 10~720배 빠르다고 알려져 있다. 대용량 바이너리나 비밀 정보 삭제에 특화.

```bash
# 설치 (macOS)
brew install bfg

# 10MB 이상 파일을 전체 이력에서 삭제
bfg --strip-blobs-bigger-than 10M

# 특정 파일 삭제
bfg --delete-files secrets.yml

# 비밀번호 목록으로 텍스트 치환
bfg --replace-text passwords.txt
```

BFG 실행 후에는 반드시 GC를 수행해야 실제 용량이 줄어든다.

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Force Push 안전 가이드

히스토리를 재작성하면 **원격 저장소에 force push**가 필요하다. 이것은 팀원의 작업을 날릴 수 있는 위험한 작업이다.

```
(로컬)  A → B → C'(재작성)
(원격)  A → B → C → D(동료 커밋)
             ↑ force push 시 D가 사라짐!
```

| 옵션 | 동작 | 안전성 |
|---|---|---|
| `--force` (`-f`) | 무조건 덮어쓰기 | 위험 — 동료 커밋 유실 가능 |
| `--force-with-lease` | 원격 ref가 예상과 다르면 거부 | 안전 — 동료 push 감지 |
| `--force-with-lease=<ref>` | 특정 ref 기준으로 검증 | 더 정밀한 제어 |

**원칙**: force push가 필요하면 항상 `--force-with-lease`를 사용한다. 특히 `main`, `develop` 같은 공유 브랜치에는 가급적 force push를 하지 않는다.

```bash
# 안전한 force push
git push --force-with-lease origin feature/my-branch
```

## GitHub에서 커밋이 실제로 삭제되는 시점

로컬에서 히스토리를 재작성하고 force push해도 GitHub에서 **즉시** 사라지지 않는다.

```
Force Push 완료
     │
     ▼
┌─────────────────────────────────┐
│  커밋이 어떤 브랜치/태그에도     │──── 아니오 ──→ 브랜치·태그 정리 필요
│  참조되지 않는가?                │
└────────────┬────────────────────┘
             │ 예
             ▼
┌─────────────────────────────────┐
│  SHA 해시를 직접 URL로 접근하면  │──── GitHub 캐시에 남아 있을 수 있음
│  아직 보일 수 있음               │     (수 시간 ~ 수 일)
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  GitHub GC(Garbage Collection)  │──── 주기적 실행 (보통 수 일 ~ 수 주)
│  이후 실제 삭제                  │
└─────────────────────────────────┘
```

| 단계 | 설명 |
|---|---|
| Force push 직후 | 브랜치 포인터는 이동하지만, 고아 커밋은 **dangling object**로 남음 |
| SHA 직접 접근 | `github.com/user/repo/commit/<SHA>`로 여전히 조회 가능한 경우 있음 |
| GitHub GC | 참조 없는 객체를 정리. **정확한 시점은 GitHub이 제어**하며 보장 없음 |
| 캐시/CDN | 포크, PR, 이슈 코멘트 등에 SHA가 언급되면 더 오래 남을 수 있음 |

> **민감 정보 유출 시**: force push만으로는 불충분하다. GitHub Support에 **캐시 무효화(purge)**를 요청해야 하며, 유출된 키/비밀번호는 **즉시 폐기(revoke)**하는 것이 정석이다.

## 민감 정보 유출 대응 체크리스트

민감 정보가 public repo에 push된 경우, 시간이 핵심이다.

| 순서 | 작업 | 명령어/방법 |
|---|---|---|
| 1 | **키/토큰 즉시 폐기** | 클라우드 콘솔에서 revoke/rotate |
| 2 | 로컬 이력에서 제거 | `git filter-repo` 또는 `bfg` |
| 3 | Force push | `git push --force-with-lease --all` |
| 4 | 태그도 갱신 | `git push --force-with-lease --tags` |
| 5 | GitHub 캐시 삭제 요청 | GitHub Support에 ticket 제출 |
| 6 | 협업자에게 알림 | 기존 clone을 `git rebase`로 동기화하도록 안내 |
| 7 | GitHub Secret Scanning 확인 | Settings → Code security → Secret scanning alerts |

> GitHub은 **Secret Scanning** 기능으로 알려진 패턴의 토큰(AWS, Slack, npm 등)이 push되면 자동 감지하여 알림을 보낸다. public repo에서는 기본 활성화.

## 예방: .gitignore와 pre-commit hook

히스토리 관리보다 **애초에 민감 정보를 커밋하지 않는 것**이 가장 좋다.

```bash
# .gitignore 예시
*.env
*.pem
*.key
config/secrets.yml
credentials.json
```

```bash
# pre-commit hook으로 민감 패턴 차단 (git-secrets 사용)
# 설치: brew install git-secrets
git secrets --install
git secrets --register-aws          # AWS 키 패턴 등록
git secrets --add '비밀번호=.+'      # 커스텀 패턴 추가
```

| 도구 | 설명 |
|---|---|
| **git-secrets** (AWS 제공) | 커밋 시 민감 패턴 자동 탐지, pre-commit hook으로 차단 |
| **detect-secrets** (Yelp 제공) | baseline 파일 기반으로 새로 추가되는 비밀만 탐지 |
| **gitleaks** | CI/CD 파이프라인에서 사용하기 좋은 비밀 탐지 도구 |
| **truffleHog** | 엔트로피 분석 + 정규식으로 과거 이력까지 스캔 |

## 참고

- [Git 공식 문서 — git-filter-repo](https://git-scm.com/docs/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub Docs — Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
