# Git 멀티 계정 SSH 설정

> 최종 업데이트: 2026-04-08

## 개념

하나의 PC에서 **여러 GitHub/Bitbucket 계정**을 사용할 때, 계정별로 SSH Key를 분리하여 충돌 없이 인증하는 설정이다.

- 회사 계정과 개인 계정을 동시에 쓸 때, 같은 `github.com`으로 접속하면 어떤 계정인지 구분할 수 없어서 IntelliJ 등 IDE에서 계정 전환 팝업이 계속 뜸
- `~/.ssh/config`에 **Host 별명**을 만들어 각 계정에 다른 SSH Key를 매핑하면 해결
- SSH Key 자체에 대한 설명은 [SSH Key 문서](../../CS%20이론/네트워크/SSH%20Key.md) 참고

```
문제 (하나의 키 또는 HTTPS):
  회사 repo ─── git@github.com ──→ 어떤 계정?? → 팝업/인증 실패
  개인 repo ─── git@github.com ──→ 어떤 계정?? → 팝업/인증 실패

해결 (계정별 Host 별명 + SSH Key):
  회사 repo ─── git@github-work ──→ id_ed25519_work ──→ 회사 계정 ✓
  개인 repo ─── git@github-personal ──→ id_ed25519_personal ──→ 개인 계정 ✓
```

## 설정 순서

### 1. 계정별 SSH Key 생성

```bash
# 회사용
ssh-keygen -t ed25519 -C "work@company.com" -f ~/.ssh/id_ed25519_work

# 개인용
ssh-keygen -t ed25519 -C "personal@gmail.com" -f ~/.ssh/id_ed25519_personal
```

| 옵션 | 값 | 설명 |
|---|---|---|
| `-t` | `ed25519` | 알고리즘 **t**ype. Ed25519 권장 (RSA보다 짧고 빠르고 안전) |
| `-C` | `"work@company.com"` | **C**omment. 키에 붙는 주석 (식별용, 인증에 영향 없음) |
| `-f` | `~/.ssh/id_ed25519_work` | **f**ile. 저장할 파일 경로. **생략하면 기본 경로에 저장되어 멀티 계정 시 키가 덮어써짐** |

- `-f`로 파일명을 계정별로 다르게 지정하는 것이 핵심
- passphrase는 보안을 위해 설정 권장 (ssh-agent로 입력 번거로움 해소 가능)

### 2. 각 공개키를 해당 GitHub 계정에 등록

```bash
# 회사 공개키 복사
cat ~/.ssh/id_ed25519_work.pub       # 출력 내용을 복사
pbcopy < ~/.ssh/id_ed25519_work.pub  # macOS: 클립보드에 바로 복사

# 개인 공개키 복사
cat ~/.ssh/id_ed25519_personal.pub
```

| 서비스 | 등록 경로 |
|---|---|
| GitHub | Settings → SSH and GPG keys → New SSH key |
| Bitbucket | Personal settings → SSH keys → Add key |
| GitLab | Preferences → SSH Keys |

> 회사 공개키는 **회사 계정**에, 개인 공개키는 **개인 계정**에 등록해야 한다. 반대로 넣으면 안 됨.

### 3. ~/.ssh/config 설정

전화기 단축 다이얼처럼, 어디에 연결할 때 어떤 키를 쓸지 미리 지정해두는 것이다.

```bash
# ~/.ssh/config (파일이 없으면 새로 생성: touch ~/.ssh/config && chmod 644 ~/.ssh/config)

# 회사 GitHub
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# 개인 GitHub
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes
```

| 필드 | 설명 |
|---|---|
| `Host` | 내가 정하는 별명. remote URL에서 `github.com` 대신 사용 |
| `HostName` | 실제 서버 주소 (둘 다 github.com) |
| `User` | git (GitHub/Bitbucket SSH는 항상 git) |
| `IdentityFile` | 사용할 개인키 경로 |
| **`IdentitiesOnly yes`** | **이 키만 사용**. 없으면 ssh-agent에 등록된 다른 키까지 시도하여 엉뚱한 계정으로 인증될 수 있음 |

> `IdentitiesOnly yes`를 빼먹으면 설정이 무시되는 것처럼 보일 수 있다. ssh가 기본적으로 agent에 등록된 모든 키를 순서대로 시도하기 때문이다. **반드시 설정할 것**.

### 4. ssh-agent에 키 등록

passphrase를 설정한 경우, ssh-agent에 키를 등록하면 매번 입력하지 않아도 된다.

```bash
# ssh-agent 시작 (대부분의 환경에서 자동 실행됨)
eval "$(ssh-agent -s)"

# 키 등록
ssh-add ~/.ssh/id_ed25519_work
ssh-add ~/.ssh/id_ed25519_personal

# 등록된 키 확인
ssh-add -l
```

**macOS Keychain 연동** (재부팅 후에도 유지):

```bash
# ~/.ssh/config에 추가
Host *
    AddKeysToAgent yes
    UseKeychain yes    # macOS 전용

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# ...
```

```bash
# Keychain에 등록 (1회)
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_personal
```

### 5. 연결 테스트

```bash
ssh -T git@github-work
# Hi 회사계정! You've successfully authenticated, but GitHub does not provide shell access.

ssh -T git@github-personal
# Hi 개인계정! You've successfully authenticated, but GitHub does not provide shell access.
```

각각 **다른 계정 이름**이 나오면 성공이다. 같은 이름이 나오면 키 매핑이 잘못된 것.

### 6. 프로젝트별 remote URL 변경

기존 프로젝트의 remote URL을 HTTPS 또는 `github.com`에서 Host 별명으로 변경한다.

```bash
# 현재 URL 확인
git remote -v
# origin  https://github.com/company/repo.git (fetch)   ← HTTPS
# 또는
# origin  git@github.com:company/repo.git (fetch)       ← SSH (별명 미사용)

# 회사 프로젝트 → Host 별명으로 변경
git remote set-url origin git@github-work:company/repo.git

# 개인 프로젝트
git remote set-url origin git@github-personal:me/repo.git

# 변경 확인
git remote -v
# origin  git@github-work:company/repo.git (fetch) ✓
```

새로 clone할 때도 동일:

```bash
git clone git@github-work:company/new-repo.git
git clone git@github-personal:me/new-repo.git
```

> GitHub에서 SSH URL 복사 시 `git@github.com:company/repo.git`에서 `github.com` 부분만 Host 별명으로 바꾸면 된다.

**clone 이후 push/pull은 평소처럼 쓰면 된다.** remote URL에 Host 별명이 저장되어 있으므로 ssh가 자동으로 올바른 키를 사용한다.

```bash
# clone 할 때 한 번만 Host 별명 사용
git clone git@github-work:company/project.git

# 이후에는 아무 옵션 없이 평소처럼
git add .
git commit -m "수정"
git push        ← 자동으로 id_ed25519_work 키 사용
git pull        ← 자동으로 id_ed25519_work 키 사용
```

### 7. 프로젝트별 git user 설정

커밋 author가 섞이지 않도록 프로젝트마다 설정한다.

```bash
# 회사 프로젝트 (--global 없이 = 해당 프로젝트만 적용)
cd ~/projects/work-repo
git config user.name "회사이름"
git config user.email "work@company.com"

# 개인 프로젝트
cd ~/projects/personal-repo
git config user.name "개인이름"
git config user.email "personal@gmail.com"

# 확인
git config user.name
git config user.email
```

> `--global`은 전체 기본값이고, 프로젝트별 설정(`.git/config`)이 우선한다.

## gitconfig의 includeIf (디렉토리 기반 자동 적용)

프로젝트마다 `git config`를 치는 게 번거로우면, 디렉토리 경로 기반으로 자동 적용할 수 있다. "이 폴더 아래에 있는 프로젝트는 전부 이 설정을 적용해라"라는 의미이다.

```
~/work/                    ← 회사 프로젝트 모아두는 곳
  ├── project-a/           → 자동으로 회사 이름/이메일 적용
  └── project-b/           → 자동으로 회사 이름/이메일 적용

~/personal/                ← 개인 프로젝트
  └── my-project/          → 기본값 (개인 이름/이메일) 적용
```

### 설정 명령어

```bash
# 1. 회사 전용 gitconfig 파일 생성
cat <<'EOF' > ~/.gitconfig-work
[user]
    name = 회사이름
    email = work@company.com
EOF

# 2. 글로벌 gitconfig에 includeIf 추가
git config --global --add includeIf."gitdir:~/work/".path ~/.gitconfig-work
```

### 설정 결과 (~/.gitconfig)

```bash
# ~/.gitconfig (글로벌)

[user]
    name = 개인이름
    email = personal@gmail.com     ← 기본값 (개인)

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work       ← ~/work/ 하위면 이 파일 설정을 덮어씀
```

```bash
# ~/.gitconfig-work (별도 파일)

[user]
    name = 회사이름
    email = work@company.com
```

### 확인

```bash
# 회사 프로젝트에서
cd ~/work/project-a
git config user.email
# work@company.com  ← 자동 적용

# 개인 프로젝트에서
cd ~/personal/my-project
git config user.email
# personal@gmail.com  ← 기본값 유지
```

> **주의**: `gitdir:~/work/` 경로 끝에 **`/`가 반드시 필요**하다. 없으면 하위 디렉토리에 적용되지 않는다.

## Bitbucket / GitLab 병행 시

GitHub과 Bitbucket/GitLab을 동시에 쓰는 경우에도 동일한 방식이다.

```bash
# ~/.ssh/config

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_work
    IdentitiesOnly yes

Host bitbucket-work
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes

Host gitlab-work
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitlab
    IdentitiesOnly yes
```

```bash
git clone git@github-work:company/repo.git
git clone git@bitbucket-work:company/repo.git
git clone git@gitlab-work:company/repo.git
```

## IntelliJ 설정

remote URL을 SSH(Host 별명)로 변경하면 IntelliJ에서 별도 설정 없이 자동으로 동작한다. IntelliJ는 시스템의 `~/.ssh/config`를 그대로 읽기 때문이다.

**SSH executable 설정** (문제 발생 시):

IntelliJ의 Built-in SSH는 `~/.ssh/config`를 완전히 지원하지 않을 수 있다.

- **Settings → Version Control → Git → SSH executable** → **`Native`** 선택
- Native로 설정하면 시스템의 ssh 명령어와 `~/.ssh/config`를 직접 사용
- ssh-agent의 키도 자동으로 인식

**IntelliJ에서 GitHub 계정 관리**:

- Settings → Version Control → GitHub에 여러 계정이 등록되어 있으면 충돌 원인이 될 수 있음
- SSH 방식을 사용할 경우 여기에 토큰을 등록하지 않아도 push/pull은 동작함
- PR 생성 등 GitHub API 기능을 쓰려면 해당 계정의 토큰이 필요

## 트러블슈팅

### Permission denied (publickey)

```bash
# 디버그 모드로 어떤 키를 시도하는지 확인
ssh -vT git@github-work
```

확인 포인트:

```
주요 로그 확인:
  "Offering public key: ~/.ssh/id_ed25519_work"  ← 올바른 키를 시도하는지
  "Authentication succeeded"                       ← 성공 여부
```

| 증상 | 원인 | 해결 |
|---|---|---|
| `Permission denied` | 키가 GitHub에 등록 안 됨 | 공개키를 해당 계정에 등록 |
| 엉뚱한 계정으로 인증 | `IdentitiesOnly yes` 누락 | config에 추가 |
| `Bad owner or permissions` | config 파일 권한 문제 | `chmod 644 ~/.ssh/config`, `chmod 600 ~/.ssh/id_*` |
| `Could not open a connection` | Host 별명을 remote URL에 안 씀 | `git remote set-url` 확인 |
| IntelliJ에서만 안 됨 | Built-in SSH 사용 중 | SSH executable을 Native로 변경 |

### 올바른 계정인지 확인

```bash
# 각 Host 별명으로 접속 테스트 — 출력되는 계정명 확인
ssh -T git@github-work       # Hi 회사계정!
ssh -T git@github-personal   # Hi 개인계정!

# 프로젝트의 remote URL 확인
git remote -v

# 프로젝트의 user 설정 확인
git config user.name
git config user.email
```

### 기존 HTTPS credential 충돌

기존에 HTTPS로 사용하던 credential이 캐싱되어 있으면 SSH로 전환해도 충돌할 수 있다.

```bash
# macOS Keychain에서 github.com credential 삭제
git credential-osxkeychain erase
host=github.com
protocol=https
# (빈 줄 입력 후 Ctrl+D)

# Windows
git credential reject
host=github.com
protocol=https
```

### .gitconfig에 PAT(토큰)이 평문으로 저장되어 있는 경우

과거에 HTTPS 인증을 위해 `.gitconfig`에 Personal Access Token을 저장했을 수 있다.

```bash
# 이런 식으로 들어가 있으면 보안 위험
[user]
    password = ghp_xxxxxxxxxxxxxxxx   ← 평문 노출!
```

SSH Key 인증으로 전환하면 더 이상 필요 없으므로 삭제한다.

```bash
git config --global --unset user.password
```

이미 노출된 토큰은 GitHub → Settings → Developer settings → Personal access tokens에서 **Delete(폐기)** 하는 것이 안전하다.

## Windows 참고사항

Windows에서는 Git Bash 또는 Windows 내장 OpenSSH를 사용한다.

```
Git Bash:
  ~/.ssh/ → C:\Users\사용자명\.ssh\
  ssh-agent, ssh-add 동일하게 사용

Windows OpenSSH (PowerShell):
  ssh-agent 서비스 시작: Get-Service ssh-agent | Set-Service -StartupType Automatic
  시작: Start-Service ssh-agent
  키 등록: ssh-add ~\.ssh\id_ed25519_work
```

- IntelliJ에서 SSH executable을 **Native**로 설정하면 Git Bash의 ssh를 사용

## 전체 파일 구조

```
~/.ssh/
├── config                   ← Host 별명 → 키 매핑 (핵심 설정 파일)
├── id_ed25519_work          ← 회사 개인키
├── id_ed25519_work.pub      ← 회사 공개키 → 회사 GitHub에 등록
├── id_ed25519_personal      ← 개인 개인키
├── id_ed25519_personal.pub  ← 개인 공개키 → 개인 GitHub에 등록
└── known_hosts              ← 접속한 서버 지문

~/.gitconfig                 ← 글로벌 git 설정 (includeIf)
~/.gitconfig-work            ← 회사용 git 설정 (user.name/email)

~/projects/
├── work-repo/               ← remote: git@github-work:company/repo.git
│   └── .git/config          ← user.name/email = 회사
└── personal-repo/           ← remote: git@github-personal:me/repo.git
    └── .git/config          ← user.name/email = 개인
```

## 더 알아보기

Deploy Key, SSH Key 로테이션, 키 관리 도구(1Password, Secretive, Yubikey) 등 SSH Key 보안 운영에 대해서는 [Git SSH Key 관리](Git%20SSH%20Key%20관리.md) 참고.
