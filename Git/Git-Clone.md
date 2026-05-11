# Git Clone

> 최종 업데이트: 2026-04-08

## 개념

원격 저장소(Remote Repository)를 **로컬에 복제**하는 명령어다.

- 단순히 파일만 가져오는 게 아니라, 전체 커밋 히스토리, 브랜치, 태그까지 모두 복사
- ZIP 다운로드와의 차이: ZIP은 파일만 받지만, clone은 **Git 이력 전체**를 가져와서 push/pull 등 Git 작업이 가능

```
원격 저장소 (GitHub)              로컬 (내 PC)
┌─────────────────┐   clone    ┌─────────────────┐
│  main            │ ────────→ │  main            │
│  ├── commit A    │           │  ├── commit A    │
│  ├── commit B    │           │  ├── commit B    │
│  └── commit C    │           │  └── commit C    │
│  feature/login   │           │  (remote 추적)    │
└─────────────────┘           └─────────────────┘
```

## 기본 사용법

```bash
git clone <원격 저장소 URL>
```

### 프로토콜별 URL 형태

| 프로토콜 | URL 형태 | 특징 |
|---|---|---|
| **SSH** | `git@github.com:user/repo.git` | SSH Key 인증. 멀티 계정 시 Host 별명 사용 가능 |
| **HTTPS** | `https://github.com/user/repo.git` | 토큰(PAT) 인증. 방화벽 환경에서 유리 |

```bash
# SSH (권장)
git clone git@github.com:namusik/project.git

# SSH (멀티 계정 — Host 별명 사용)
git clone git@github-megabird:company/project.git
#              ↑ ~/.ssh/config의 Host 별명

# HTTPS
git clone https://github.com/namusik/project.git
```

> GitHub에서 SSH 방식 URL 복사: 저장소 → Code 버튼 → SSH 탭 → 복사. `github.com` 부분을 config의 Host 별명으로 바꿔서 사용.

## 주요 옵션

### 폴더명 지정

```bash
# 기본: 저장소 이름으로 폴더 생성
git clone git@github.com:user/my-project.git
# → my-project/ 폴더 생성

# 원하는 폴더명 지정
git clone git@github.com:user/my-project.git my-app
# → my-app/ 폴더 생성
```

### 특정 브랜치만 clone

```bash
# 기본: 기본 브랜치(main/master)를 체크아웃
git clone git@github.com:user/repo.git

# 특정 브랜치로 체크아웃
git clone -b develop git@github.com:user/repo.git
```

### Shallow Clone (히스토리 제한)

전체 히스토리가 필요 없을 때 최근 커밋만 가져온다. 대형 저장소에서 clone 속도를 크게 단축할 수 있다.

```bash
# 최근 1개 커밋만
git clone --depth 1 git@github.com:user/repo.git

# 최근 10개 커밋만
git clone --depth 10 git@github.com:user/repo.git
```

- CI/CD에서 빌드만 할 때 유용 (이력이 필요 없으므로)
- 이후 전체 이력이 필요하면 `git fetch --unshallow`

### Single Branch

특정 브랜치 하나만 가져온다. 다른 브랜치 정보를 아예 받지 않아 더 빠르다.

```bash
git clone --single-branch -b main git@github.com:user/repo.git
```

### Bare Clone

작업 디렉토리(파일) 없이 **Git 데이터만** 복제. 서버용 저장소나 미러링에 사용.

```bash
git clone --bare git@github.com:user/repo.git
# → repo.git/ 폴더 생성 (파일 없이 .git 내용만)
```

## 옵션 정리

| 옵션 | 설명 | 용도 |
|---|---|---|
| `-b <브랜치>` | 특정 브랜치 체크아웃 | feature 브랜치에서 바로 시작 |
| `--depth <n>` | 최근 n개 커밋만 | CI/CD, 대형 저장소 빠른 clone |
| `--single-branch` | 지정 브랜치만 가져옴 | 다른 브랜치 불필요 시 |
| `--bare` | 작업 디렉토리 없이 Git 데이터만 | 서버 저장소, 미러링 |
| `--mirror` | 모든 refs 포함 완전 복제 | 저장소 백업/이전 |
| `--recurse-submodules` | 서브모듈도 함께 clone | 서브모듈 포함 프로젝트 |
| `--filter=blob:none` | 파일 내용 없이 구조만 (부분 clone) | 초대형 모노레포 |
| `--no-checkout` | clone 후 파일 체크아웃 안 함 | sparse-checkout과 조합 |

## Sparse Checkout (부분 체크아웃)

대형 모노레포에서 **특정 디렉토리만** 로컬에 체크아웃할 때 사용한다. 저장소 전체를 받지 않으므로 디스크와 시간을 절약할 수 있다.

> 비유: 도서관에서 책 전체를 빌리는 게 아니라, 필요한 챕터만 복사해오는 것과 같다.

```bash
# 1. 빈 clone (파일을 체크아웃하지 않음)
git clone --no-checkout git@github.com:company/monorepo.git
cd monorepo

# 2. sparse-checkout 활성화
git sparse-checkout init --cone

# 3. 원하는 디렉토리만 지정
git sparse-checkout set backend/api shared/libs

# 4. 체크아웃 실행
git checkout main
```

| 명령 | 설명 |
|---|---|
| `git sparse-checkout init --cone` | cone 모드로 초기화 (디렉토리 단위 지정) |
| `git sparse-checkout set <경로>` | 체크아웃할 디렉토리 지정 |
| `git sparse-checkout list` | 현재 설정된 경로 확인 |
| `git sparse-checkout disable` | 전체 파일로 복원 |

- `--filter=blob:none`과 함께 쓰면 필요한 파일만 네트워크로 받아 더 빠르다
- 모노레포에서 자기 팀 서비스 디렉토리만 작업할 때 유용

## CI/CD 파이프라인에서의 clone 활용

CI/CD에서는 빌드 속도가 중요하므로 불필요한 데이터를 최소화하는 것이 핵심이다.

### GitHub Actions

```yaml
# 기본 checkout (shallow clone, depth=1)
- uses: actions/checkout@v4

# 전체 이력 필요 시 (버전 태그 기반 릴리즈 등)
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

# 특정 브랜치만
- uses: actions/checkout@v4
  with:
    ref: develop
    fetch-depth: 1
```

> `actions/checkout`은 내부적으로 `git clone --depth`와 `--single-branch`를 조합한다.

### Jenkins

```groovy
// Jenkinsfile - shallow clone
checkout([
    $class: 'GitSCM',
    branches: [[name: '*/main']],
    extensions: [[$class: 'CloneOption', depth: 1, shallow: true]],
    userRemoteConfigs: [[url: 'git@github.com:company/project.git']]
])
```

### CI/CD clone 최적화 팁

| 전략 | 적용 방법 | 절약 효과 |
|---|---|---|
| Shallow clone | `--depth 1` | 히스토리 전송량 대폭 감소 |
| Single branch | `--single-branch` | 불필요한 브랜치 제외 |
| Partial clone | `--filter=blob:none` | 파일 내용을 필요 시에만 다운로드 |
| Sparse checkout | `sparse-checkout set <경로>` | 필요한 디렉토리만 체크아웃 |
| CI 캐시 활용 | `.git` 디렉토리를 캐시로 보관 | 매번 전체 clone 불필요 |

- 빌드만 필요하면 `--depth 1 --single-branch`가 가장 실용적
- 릴리즈 태그나 changelog 생성 등 이력이 필요하면 `fetch-depth: 0`으로 전체 이력을 받아야 한다

## clone 후 초기 설정

```bash
git clone git@github-megabird:company/project.git
cd project

# 1. remote 확인
git remote -v
# origin  git@github-megabird:company/project.git (fetch)
# origin  git@github-megabird:company/project.git (push)

# 2. 프로젝트별 git user 설정 (멀티 계정 시 중요)
git config user.name "회사이름"
git config user.email "work@company.com"

# 3. 확인
git config user.name
git config user.email
```

## clone vs fork vs download ZIP

| 항목 | clone | fork | download ZIP |
|---|---|---|---|
| Git 이력 | 전체 복사 | 전체 복사 | 없음 |
| push 가능 | 권한 있으면 가능 | 내 fork에 가능 | 불가 |
| 원본과 연결 | origin으로 연결 | upstream으로 연결 가능 | 없음 |
| 위치 | 로컬 | GitHub (원격) | 로컬 |
| 용도 | 일반 개발 | 오픈소스 기여 | 코드만 볼 때 |

```
fork → clone 흐름 (오픈소스 기여):
  1. GitHub에서 원본 저장소를 fork (내 계정에 복사본 생성)
  2. fork된 저장소를 clone
  3. 수정 후 내 fork에 push
  4. 원본에 Pull Request 생성
```

## 자주 쓰는 조합

```bash
# 일반 개발 (SSH, 멀티 계정)
git clone git@github-megabird:company/project.git
cd project && git config user.email "work@company.com"

# CI/CD 빌드 (빠른 clone)
git clone --depth 1 --single-branch -b main git@github.com:company/project.git

# 저장소 이전/백업
git clone --mirror git@github.com:company/old-repo.git
cd old-repo.git
git remote set-url origin git@github.com:company/new-repo.git
git push --mirror

# 서브모듈 포함 프로젝트
git clone --recurse-submodules git@github.com:company/project.git

# 모노레포에서 특정 디렉토리만 (sparse-checkout)
git clone --no-checkout --filter=blob:none git@github.com:company/monorepo.git
cd monorepo
git sparse-checkout init --cone
git sparse-checkout set my-service/ shared/
git checkout main
```
