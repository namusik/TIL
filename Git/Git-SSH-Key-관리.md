# Git SSH Key 관리

> 최종 업데이트: 2026-04-08

## 개념

Git 원격 저장소(GitHub, GitLab 등) 인증에 사용하는 **SSH Key의 종류, 보안 관리, 운영 방법**을 다룬다.

- SSH Key를 이용한 멀티 계정 설정은 [Git 멀티 계정 SSH 설정](Git-멀티-계정-SSH-설정.md) 참고
- SSH Key 자체의 암호학적 원리는 [SSH Key 문서](../../CS-이론/네트워크/SSH-Key.md) 참고

## Deploy Key vs SSH Key (User Key)

GitHub에서 SSH 기반 인증은 두 종류가 있다. 택배에 비유하면, **User Key**는 본인 신분증(모든 택배를 받을 수 있음)이고, **Deploy Key**는 특정 배송지 전용 수령증(그 주소의 택배만 받을 수 있음)이다.

| 구분 | SSH Key (User Key) | Deploy Key |
|---|---|---|
| 등록 위치 | 사용자 계정의 Settings → SSH keys | 특정 Repository의 Settings → Deploy keys |
| 접근 범위 | 해당 계정이 권한을 가진 **모든 repo** | **등록된 1개 repo만** |
| 사용 주체 | 개발자 개인 (로컬 PC) | CI/CD 서버, 배포 서버 등 **머신** |
| 쓰기 권한 | 계정 권한에 따름 | 등록 시 "Allow write access" 체크해야 push 가능 (기본 read-only) |
| 같은 키 중복 등록 | 여러 계정에 동일 키 등록 불가 | 여러 repo에 동일 키 등록 불가 (repo마다 별도 키 필요) |

> 백엔드 서버에서 특정 repo만 clone/pull 하면 되는 경우(배포, CI 등) Deploy Key가 보안상 더 적합하다. 불필요하게 넓은 접근 권한을 주지 않는 **최소 권한 원칙**에 해당한다.

### Deploy Key 설정

```bash
# 1. 서버용 키 생성
ssh-keygen -t ed25519 -C "deploy@my-service" -f ~/.ssh/id_ed25519_deploy

# 2. 공개키를 GitHub repo에 등록
#    Repository → Settings → Deploy keys → Add deploy key
cat ~/.ssh/id_ed25519_deploy.pub

# 3. ~/.ssh/config에 Host 별명 등록
# Host github-deploy
#     HostName github.com
#     User git
#     IdentityFile ~/.ssh/id_ed25519_deploy
#     IdentitiesOnly yes

# 4. clone
git clone git@github-deploy:company/my-service.git
```

## SSH Key 로테이션

SSH Key는 기본적으로 **만료 기한이 없다**. 하지만 보안 정책상 정기적으로 교체(로테이션)하는 것이 권장된다. 비밀번호를 주기적으로 바꾸는 것과 같은 이유이다.

| 항목 | 내용 |
|---|---|
| 기본 만료 | SSH Key 자체에는 만료 개념이 없음 (OpenSSH CA 서명 키는 예외) |
| GitHub 권장 | 주기적 로테이션 권장. Enterprise에서는 조직 정책으로 강제 가능 |
| 로테이션 주기 | 일반적으로 6개월~1년. 회사 보안 정책에 따름 |
| GitHub SSH Key 마지막 사용일 | Settings → SSH keys에서 각 키의 **Last used** 날짜 확인 가능. 오래 안 쓴 키는 삭제 |

### 로테이션 절차

```bash
# 1. 새 키 생성
ssh-keygen -t ed25519 -C "work@company.com" -f ~/.ssh/id_ed25519_work_new

# 2. 새 공개키를 GitHub에 등록

# 3. ~/.ssh/config의 IdentityFile 경로를 새 키로 변경

# 4. ssh -T git@github-work 로 새 키 동작 확인

# 5. GitHub에서 이전 키 삭제
```

> 새 키 등록 후 이전 키를 **바로 삭제하지 말고**, 새 키가 정상 동작하는 것을 확인한 뒤 삭제하면 안전하다.

### 로테이션 흐름

```
현재 상태: github-work → id_ed25519_work (현재 키)

Step 1: 새 키 생성 (id_ed25519_work_new)
Step 2: 새 공개키를 GitHub에 등록
         └→ 이 시점에 이전 키 + 새 키 둘 다 동작
Step 3: config에서 IdentityFile을 새 키로 변경
Step 4: ssh -T 테스트 → 성공 확인
Step 5: GitHub에서 이전 키 삭제
         └→ 새 키만 남음 (로테이션 완료)
```

## SSH Key 관리 도구

passphrase가 있는 키를 여러 개 관리하면 번거로울 수 있다. 전용 도구를 사용하면 키 보관과 ssh-agent 연동을 자동화할 수 있다. 금고에 열쇠를 넣어두고, 필요할 때 자동으로 꺼내 쓰는 것과 같다.

| 도구 | 플랫폼 | 특징 |
|---|---|---|
| **1Password** | macOS / Windows / Linux | SSH Key를 1Password 볼트에 저장. SSH Agent 내장으로 `~/.ssh/config`에 `IdentityAgent` 지정만 하면 자동 연동. 키 파일이 디스크에 평문으로 남지 않음 |
| **Secretive** | macOS (Apple Silicon) | Secure Enclave에 키 저장 (키를 추출 자체가 불가능). 경량, 오픈소스 |
| **Yubikey / FIDO2** | 모든 OS | 하드웨어 보안 키에 SSH Key 저장. `ed25519-sk` 타입 사용. 물리적 터치 필요 |

### 1Password SSH Agent 연동

```bash
# ~/.ssh/config
Host *
    IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"

Host github-work
    HostName github.com
    User git
    IdentitiesOnly yes
    # IdentityFile 대신 1Password가 키를 제공
```

> 1Password 연동 시 `IdentityFile` 대신 `IdentityAgent`로 1Password의 SSH Agent 소켓을 지정한다. 어떤 키를 어떤 Host에 매핑할지는 1Password 앱 내에서 설정한다.

### Secretive 사용

```bash
# 설치
brew install --cask secretive

# Secretive가 SSH Agent를 제공 — config에 소켓 경로 지정
Host *
    IdentityAgent ~/Library/Containers/com.maxgoedjen.Secretive.SecretAgent/Data/socket.ssh
```

- Secretive에서 키를 생성하면 Secure Enclave에 저장됨
- 공개키만 추출 가능 → GitHub에 등록
- 개인키는 칩 밖으로 나올 수 없어 유출 자체가 불가능

## SSH Key 선택 가이드

| 상황 | 권장 방식 |
|---|---|
| 개인 PC에서 여러 GitHub 계정 사용 | User Key + [멀티 계정 SSH 설정](Git-멀티-계정-SSH-설정.md) |
| CI/CD 서버에서 특정 repo만 접근 | Deploy Key (read-only) |
| 배포 서버에서 특정 repo push 필요 | Deploy Key (write access 활성화) |
| 보안이 엄격한 환경 | Secretive 또는 Yubikey (키 추출 불가) |
| 키를 여러 기기에서 공유 | 1Password SSH Agent |
