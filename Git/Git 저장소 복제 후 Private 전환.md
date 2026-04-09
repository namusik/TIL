# Git 저장소 복제 후 Private 전환

> 최종 업데이트: 2026-04-08

## 개념

다른 사람의 **공개 저장소를 내 Private 저장소로 가져오는** 방법이다.

- 비유: 도서관의 책(공개 저장소)을 복사해서 내 개인 서재(Private 저장소)에 꽂아두는 것. Fork는 도서관 안에 내 이름표를 붙인 사본을 두는 것이고, Clone + Private 전환은 아예 집으로 가져오는 것
- 핵심: `git clone`으로 이력 전체를 복사한 뒤, remote를 내 Private 저장소로 교체하여 push

> clone 자체의 상세 옵션은 [Git Clone.md](Git%20Clone.md) 참고

### Fork vs Clone + Private 전환

| 비교 항목 | Fork | Clone + Private 전환 |
|---|---|---|
| **저장소 공개 여부** | 원본이 public이면 fork도 **public 유지** | **Private으로 전환 가능** |
| **GitHub 연결** | 원본과 fork 관계가 GitHub에 표시됨 | 연결 없음 (독립 저장소) |
| **커밋 히스토리** | 원본 히스토리 포함 | 원본 히스토리 포함 |
| **PR 기여** | 원본에 PR 가능 | upstream 추가 시 PR 가능 |
| **주 용도** | 오픈소스 기여 | 학습용 코드 보관, 사내 커스터마이징, 포트폴리오 |

**왜 Fork 대신 이 방법을 쓰는가?**

- GitHub Fork는 원본의 visibility를 따라가므로, public 저장소를 fork하면 **내 fork도 public**이 됨
- 학습용 코드, 면접 과제, 사내 커스텀 프로젝트 등 **비공개가 필요한 경우** Clone + Private 전환이 유일한 방법
- Fork 관계를 끊어 **독립적인 프로젝트로 운영**하고 싶을 때도 유용

## 전체 흐름

```
원본 Public Repo (GitHub)         내 Private Repo (GitHub)
┌──────────────────┐              ┌──────────────────┐
│  origin (원본)    │              │  origin (내 것)   │
│  main             │              │  main             │
│  ├── commit A     │   ② remote  │  ├── commit A     │
│  ├── commit B     │   교체 후    │  ├── commit B     │
│  └── commit C     │   push →    │  └── commit C     │
└──────┬───────────┘              └──────────────────┘
       │ ① clone                         ↑ ③ push
       ▼                                 │
┌──────────────────┐─────────────────────┘
│  로컬 (내 PC)     │
│  ├── commit A     │
│  ├── commit B     │
│  └── commit C     │
└──────────────────┘
```

**단계 요약:**
1. 원본 저장소를 로컬에 clone
2. GitHub에 새 Private 저장소 생성
3. 로컬의 remote를 새 저장소로 교체
4. push
5. (선택) 원본을 upstream으로 등록하여 동기화

## 방법 1: Git CLI로 수동 전환

### Step 1. 원본 저장소 clone

```bash
# HTTPS
git clone https://github.com/원본-사용자/원본-레포지토리.git

# SSH
git clone git@github.com:원본-사용자/원본-레포지토리.git
```

### Step 2. GitHub에서 Private 저장소 생성

- GitHub > `+` > **New repository**
- **Repository name** 입력 (원본과 같거나 다른 이름 모두 가능)
- **Private** 선택
- README, .gitignore, LICENSE **모두 체크 해제** (이미 clone한 코드에 포함되어 있으므로)

### Step 3. remote 교체 및 push

```bash
cd 원본-레포지토리

# 기존 remote(원본) 제거
git remote remove origin

# 새 Private 저장소를 origin으로 등록
# HTTPS
git remote add origin https://github.com/내-사용자명/새-private-레포지토리.git
# SSH
git remote add origin git@github.com:내-사용자명/새-private-레포지토리.git

# 모든 브랜치와 태그를 push
git push -u origin main
git push --tags
```

## 방법 2: GitHub CLI(gh)로 한 번에 처리

[GitHub CLI](https://cli.github.com/)를 사용하면 저장소 생성과 remote 교체를 터미널에서 한 번에 할 수 있다.

```bash
# 1. 원본 clone
git clone https://github.com/원본-사용자/원본-레포지토리.git
cd 원본-레포지토리

# 2. 기존 remote 제거
git remote remove origin

# 3. gh로 Private 저장소 생성 + remote 등록 + push까지 한 번에
gh repo create 내-사용자명/새-private-레포지토리 --private --source=. --remote=origin --push
```

| gh 옵션 | 설명 |
|---|---|
| `--private` | Private 저장소로 생성 |
| `--source=.` | 현재 디렉토리를 소스로 지정 |
| `--remote=origin` | 생성된 저장소를 origin으로 등록 |
| `--push` | 생성 후 바로 push |

## upstream 동기화 (원본 업데이트 반영)

원본 저장소의 업데이트를 내 Private 저장소에 반영하고 싶을 때 upstream remote를 등록한다.

```
원본 Public Repo                     내 Private Repo
(upstream)                           (origin)
      │                                    ↑
      │  ② fetch                  ④ push   │
      ▼                                    │
┌──────────────────────────────────────────┐
│              로컬 (내 PC)                 │
│   ③ merge upstream/main → main          │
└──────────────────────────────────────────┘
```

```bash
# 1. upstream 등록 (최초 1회)
git remote add upstream https://github.com/원본-사용자/원본-레포지토리.git

# 2. remote 확인
git remote -v
# origin    https://github.com/내-사용자명/새-private-레포지토리.git (fetch)
# origin    https://github.com/내-사용자명/새-private-레포지토리.git (push)
# upstream  https://github.com/원본-사용자/원본-레포지토리.git (fetch)
# upstream  https://github.com/원본-사용자/원본-레포지토리.git (push)

# 3. 원본의 최신 변경사항 가져오기
git fetch upstream

# 4. 로컬 main에 병합
git checkout main
git merge upstream/main

# 5. 내 Private 저장소에 반영
git push origin main
```

> merge 대신 `git rebase upstream/main`을 사용하면 커밋 히스토리를 더 깔끔하게 유지할 수 있다. 단, 이미 push한 커밋이 있다면 rebase 후 `--force-with-lease`가 필요하므로 주의.

## 주의사항

| 항목 | 설명 |
|---|---|
| **라이선스** | 원본 저장소의 LICENSE 파일을 반드시 확인. MIT, Apache 등은 Private 사용 가능하지만 **저작권 표시 유지 의무**가 있음. GPL 계열은 파생물 배포 시 소스 공개 의무 |
| **원본 권한** | public 저장소는 누구나 clone 가능. private 저장소는 **collaborator 권한이 있어야** clone 가능 |
| **커밋 히스토리** | clone하면 원본의 커밋 이력이 모두 포함됨. 이력을 초기화하려면 `git checkout --orphan`으로 새 브랜치 생성 후 첫 커밋으로 시작 |
| **GitHub Fork 관계** | 이 방법은 fork 관계가 생기지 않으므로, GitHub에서 원본 저장소와의 연결이 표시되지 않음 |
| **대용량 파일** | 원본에 Git LFS 파일이 있는 경우, LFS가 설정된 상태에서 clone해야 대용량 파일도 정상 복제됨 |
