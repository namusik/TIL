# SSH Key

> 최종 업데이트: 2026-04-07 | OpenSSH 9.x 기준

## 개념

비밀번호 대신 사용하는 **공개키 암호화 기반 인증 수단** 이다.

- 비밀번호 로그인이 "매번 신분증 보여주기"라면, SSH Key는 **"미리 등록해둔 지문 인식"** 과 같다
- 키 쌍(개인키 + 공개키)을 생성해서, 개인키는 내 PC에만 보관하고 공개키를 상대(GitHub, 서버 등)에 등록
- GitHub은 2021년부터 **비밀번호로 git push하는 것을 차단**했기 때문에, SSH Key 또는 Personal Access Token(PAT) 사용이 필수

```
비밀번호 방식:
  나 → "비번은 abc123" → GitHub → "확인, 통과"
  (매번 입력, 탈취 위험)

SSH Key 방식:
  나 (개인키 보유) → 서명 전송 → GitHub (공개키로 검증) → "확인, 통과"
  (입력 불필요, 개인키가 내 PC에만 존재)
```

## 키 쌍의 원리

**공개키 암호화(비대칭 암호화)** 기반. 자물쇠와 열쇠에 비유할 수 있다.

```
ssh-keygen 실행
       ↓
┌─────────────────────┐     ┌─────────────────────┐
│  개인키 (Private Key) │     │  공개키 (Public Key)  │
│  ~/.ssh/id_ed25519   │     │  ~/.ssh/id_ed25519.pub│
│  열쇠 — 나만 보관     │     │  자물쇠 — 상대에게 등록 │
└─────────────────────┘     └─────────────────────┘
```

- **개인키**: 내 PC에만 저장. 절대 외부에 공유하면 안 됨 (유출 시 즉시 폐기 후 재생성)
- **공개키**: GitHub, Bitbucket, 서버 등에 등록. 공개되어도 안전 (자물쇠만으로는 열 수 없음)
- 개인키로 서명한 것을 공개키로 검증할 수 있지만, 공개키로 개인키를 역산하는 것은 불가능

## 인증 과정

```
1. 클라이언트 → 서버: "SSH 연결 요청, 내 공개키 지문은 이거야"
2. 서버: 등록된 공개키 목록에서 해당 지문 확인
3. 서버 → 클라이언트: 랜덤 챌린지 데이터 전송
4. 클라이언트: 개인키로 챌린지에 서명하여 응답
5. 서버: 등록된 공개키로 서명을 검증
6. 검증 성공 → 인증 완료, 세션 시작
```

## 비밀번호 vs SSH Key vs PAT

| 항목 | 비밀번호 | SSH Key | Personal Access Token |
|---|---|---|---|
| 인증 방식 | 매번 입력 | 자동 (키 파일) | 비밀번호 대신 토큰 입력 |
| 보안 | 탈취/유출 위험 | 개인키가 PC 밖으로 안 나감 | 토큰 유출 위험 |
| 편의성 | 매번 입력 | 한 번 등록하면 끝 | credential helper로 캐싱 가능 |
| GitHub 지원 | **차단됨** (2021~) | 지원 | 지원 |
| 프로토콜 | HTTPS | SSH | HTTPS |
| 적합한 경우 | - | 개인 PC에서 개발 | CI/CD, 스크립트, 임시 접근 |

## 키 알고리즘

| 알고리즘 | 명령어 | 특징 |
|---|---|---|
| **Ed25519** | `ssh-keygen -t ed25519` | **권장**. 짧고 빠르고 안전. 최신 표준 |
| RSA | `ssh-keygen -t rsa -b 4096` | 호환성 높음. 오래된 서버에서 필요할 때 사용 |
| ECDSA | `ssh-keygen -t ecdsa` | 괜찮지만 Ed25519이 더 나음 |
| DSA | - | **사용 금지**. 보안 취약, OpenSSH 7.0+에서 비활성화 |

> 특별한 이유가 없으면 **Ed25519**를 쓰면 된다.

## 생성 및 등록

### 1. 키 생성

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/you/.ssh/id_ed25519):  ← 엔터 (기본 경로)
Enter passphrase (empty for no passphrase):  ← 비밀구절 (선택, 보안 강화)
Enter same passphrase again:
```

- `-C "이메일"`: 키에 붙는 주석 (식별용, 인증에 영향 없음)
- **passphrase**: 개인키를 한 번 더 암호화하는 비밀구절. 설정하면 PC가 탈취당해도 개인키를 바로 쓸 수 없음

### 2. 생성된 파일 확인

```bash
ls -la ~/.ssh/
# id_ed25519      ← 개인키 (권한: 600, 본인만 읽기/쓰기)
# id_ed25519.pub  ← 공개키 (등록용)
```

### 3. 공개키 복사

```bash
# macOS
pbcopy < ~/.ssh/id_ed25519.pub

# Linux
cat ~/.ssh/id_ed25519.pub
# 출력된 내용 전체를 복사
```

출력 예시:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGz... your_email@example.com
```

### 4. GitHub/Bitbucket에 등록

| 서비스 | 경로 |
|---|---|
| **GitHub** | Settings → SSH and GPG keys → New SSH key |
| **Bitbucket** | Personal settings → SSH keys → Add key |
| **GitLab** | Preferences → SSH Keys |

### 5. 연결 테스트

```bash
# GitHub
ssh -T git@github.com
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.

# Bitbucket
ssh -T git@bitbucket.org

# GitLab
ssh -T git@gitlab.com
```

### 6. SSH 방식으로 Git 사용

```bash
# clone (SSH URL은 git@ 으로 시작)
git clone git@github.com:username/repo.git

# 기존 HTTPS → SSH로 변경
git remote set-url origin git@github.com:username/repo.git

# 현재 remote URL 확인
git remote -v
```

## 여러 키 관리 (~/.ssh/config)

회사 GitHub과 개인 GitHub, 서버 접속 등 여러 키를 사용할 때 `~/.ssh/config`로 관리한다. 전화기 단축 다이얼에 비유하면, 어디에 걸 때 어떤 회선(키)을 쓸지 미리 지정해두는 것이다.

```bash
# ~/.ssh/config

# 회사 GitHub
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work

# 개인 GitHub
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

# 운영 서버
Host prod-server
    HostName 10.0.1.100
    User deploy
    IdentityFile ~/.ssh/id_ed25519_deploy
    Port 2222
```

```bash
# 사용
git clone git@github-work:company/repo.git      # 회사 키 사용
git clone git@github-personal:me/repo.git        # 개인 키 사용
ssh prod-server                                   # ssh deploy@10.0.1.100 -p 2222 -i ... 와 동일
```

## ssh-agent

passphrase를 설정한 경우, 매번 입력하는 번거로움을 없애주는 키 관리 데몬. 한 번 입력하면 메모리에 캐싱해둔다.

```bash
# ssh-agent 시작
eval "$(ssh-agent -s)"

# 키 등록 (passphrase 1회 입력)
ssh-add ~/.ssh/id_ed25519

# 등록된 키 확인
ssh-add -l

# macOS Keychain 연동 (재부팅 후에도 유지)
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

## 서버 접속 용도

GitHub/Bitbucket뿐 아니라 **원격 서버 접속**에도 동일한 원리가 사용된다.

```bash
# 서버에 공개키 등록 (1회)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server-ip
# → 서버의 ~/.ssh/authorized_keys에 공개키가 추가됨

# 이후 비밀번호 없이 접속 가능
ssh user@server-ip
```

```
~/.ssh/authorized_keys (서버 측)
├── ssh-ed25519 AAAA... dev1@company.com    ← 개발자1의 공개키
├── ssh-ed25519 AAAA... dev2@company.com    ← 개발자2의 공개키
└── ssh-ed25519 AAAA... cicd@company.com    ← CI/CD 서버의 공개키
```

## 보안 주의사항

| 항목 | 권장 |
|---|---|
| 개인키 권한 | `chmod 600 ~/.ssh/id_ed25519` (본인만 읽기/쓰기) |
| 개인키 공유 | **절대 금지** — Slack, 이메일, Git에 올리면 안 됨 |
| passphrase | 가능하면 설정 (ssh-agent로 편의성 유지) |
| 키 유출 시 | 즉시 GitHub/서버에서 공개키 삭제 → 새 키 생성 → 재등록 |
| 키 교체 주기 | 조직 정책에 따라 주기적 교체 권장 |
| `.gitignore` | `~/.ssh/` 디렉토리는 Git에 포함하면 안 됨 |

## known_hosts

처음 접속하는 서버의 지문을 저장하는 파일. "이 서버에 처음 접속하는데, 신뢰할 수 있어?" 라고 물어보는 것이다.

```bash
ssh git@github.com
# The authenticity of host 'github.com' can't be established.
# ED25519 key fingerprint is SHA256:+DiY3w...
# Are you sure you want to continue connecting (yes/no)? yes
# → ~/.ssh/known_hosts에 github.com의 지문이 저장됨
```

- 이후 접속 시 저장된 지문과 비교하여 **중간자 공격(MITM)**을 방지
- 서버 IP가 바뀌거나 재설치되면 지문이 달라져서 경고 발생 → `ssh-keygen -R hostname`으로 기존 지문 제거 후 재접속

## 파일 정리

```
~/.ssh/
├── id_ed25519          ← 개인키 (절대 공유 금지)
├── id_ed25519.pub      ← 공개키 (GitHub 등에 등록)
├── config              ← 호스트별 설정 (여러 키 관리)
├── known_hosts         ← 접속한 서버 지문 목록
└── authorized_keys     ← (서버 측) 허용된 공개키 목록
```
