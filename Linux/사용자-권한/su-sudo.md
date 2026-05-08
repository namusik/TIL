# su와 sudo — 권한 변경의 두 도구

> 최종 업데이트: 2026-05-04 | Linux 표준 (sudo 1.9.x 기준)

## 개념

`su`와 `sudo`는 **현재 사용자에서 다른 사용자(특히 root)의 권한으로 명령을 실행하는 도구**다. 이름이 비슷하고 둘 다 권한을 바꾼다는 점이 같아 자주 헷갈리지만, **누구의 패스워드를 쓰느냐 / 어떤 통제를 받느냐 / 결과가 셸인가 명령인가**라는 세 축에서 본질적으로 다르다.

| 도구 | 한 줄 |
|---|---|
| **`su`** (substitute user) | "내가 그 사람이 된다" — 그 사람 패스워드를 입력해 그 사용자로 **변신**. 셸이 그 사람 셸로 바뀜 |
| **`sudo`** (superuser do) | "권한을 위임받았다" — 내 패스워드로 인증해 **명령 1개만** root(또는 다른 사용자) 권한으로 실행. 끝나면 원래 셸로 복귀 |

> 비유: **su는 변신**, **sudo는 위임장**.
> - **su**: 마법으로 다른 사람으로 변신. 변신하려면 그 사람의 정체(=패스워드)를 알아야 한다. 변신 후엔 그 사람으로 계속 활동.
> - **sudo**: 부장님이 내게 위임장 줌. 내 사인(=내 패스워드)으로 위임장 행사. 행사 후엔 원래 내 자리로. 누가 위임장 받을 수 있는지는 부장님이 명단(=`/etc/sudoers`)에 등록.

핵심 명제: **"su는 root 패스워드 자체를 공유 → 사고 위험 ↑. sudo는 명령 단위로 위임 + 감사 로그 → 보안 표준."** 그래서 모던 Linux는 `sudo` 중심 운영.

## 배경/역사

- **1971** Unix V1 (AT&T Bell Labs)에 `su` 등장 — Unix 초창기부터의 표준 명령
- **1980** Bob Coggeshall·Cliff Spencer가 **SUNY Buffalo**에서 `sudo` 첫 개발 — "su를 쓰려면 root 패스워드를 모두에게 공유해야 한다"는 보안 문제 해결 목적
- **1991** **Todd C. Miller**(Colorado University)가 sudo 메인테이너 인수 — 현재까지 30년 이상 단독 유지보수
- **1996** OpenBSD가 `sudo`를 base system에 포함
- **2000년대** 대부분 Linux 배포판이 `sudo`를 기본 패키지로 채택. **Ubuntu**는 root 직접 로그인을 막고 `sudo`만 쓰도록 강제 (2004 Warty Warthog부터)
- **2010년대** 클라우드·DevOps 시대에 **"root 직접 로그인 금지 + sudo + 감사 로그"**가 보안 모범 사례로 표준화
- **현재** sudo 1.9.x 시리즈 — sudoers LDAP, JSON 로그, 세션 녹화 등 엔터프라이즈 기능 강화

> sudo의 핵심 아이디어: **"root 패스워드를 안 알려주고도 일부 사용자에게 root 권한을 부분 위임"**. 1980년 당시엔 혁신, 지금은 표준.

## 한눈에 비교

| 명령 | 패스워드 | 결과 | 통제 시스템 |
|---|---|---|---|
| `su` | **대상자**(보통 root) 패스워드 | 대상자 셸 진입 (환경 유지) | PAM `/etc/pam.d/su` + `wheel` 그룹 |
| `su -` | 대상자 패스워드 | 대상자 **로그인 셸** (환경 새로 로드) | 동일 |
| `su <X>` | X 패스워드 | X 셸 진입 | 동일 |
| `sudo <cmd>` | **자기** 패스워드 (NOPASSWD면 면제) | 명령 1개를 root로 실행, 끝나면 원래 셸 복귀 | `/etc/sudoers` |
| `sudo -u <X> <cmd>` | 자기 패스워드 | 명령 1개를 X로 실행 | sudoers |
| `sudo -s` | 자기 패스워드 | root 셸 진입 (환경 유지) | sudoers |
| `sudo -i` | 자기 패스워드 | root **로그인 셸** 진입 (`su -`와 비슷) | sudoers |

## 핵심 차이 3가지

### 1. 누구의 패스워드를 쓰는가

- **`su`** = **대상자**의 패스워드. root로 가려면 root 패스워드를 알아야 함 → 여러 사람이 root를 쓰려면 root 패스워드를 공유해야 함 (보안 위험)
- **`sudo`** = **자기** 패스워드. 자기 계정 인증으로 위임받은 권한 행사. root 패스워드는 모를 수도 있음 (Ubuntu 기본은 root 패스워드 자체가 비활성화)

### 2. 무엇을 통과해야 쓸 수 있는가

- **`su`** = OS에 깔리면 **누구나 시도 가능**. 그래서 보안 강화 시 **`wheel` 그룹 + PAM `pam_wheel.so`**로 제한 거는 게 모범 사례.
- **`sudo`** = **`/etc/sudoers`에 명시 등록된 사용자만** 가능. 디폴트로 차단. 명령·호스트별 정밀 제어 가능

### 3. 결과가 무엇인가

- **`su`** = 셸 전환 (계속 그 사용자로 작업)
- **`sudo <cmd>`** = 명령 1개만 실행하고 원래 셸 복귀
- **`sudo -s`/`-i`** = 셸 전환 (sudoers를 거쳐 root 셸 진입)

## su 자세히

### 기본 동작

```sh
$ su            # root로 전환 (root 패스워드 입력). 환경 변수 그대로
$ su -          # root 로그인 셸. 환경 새로 로드 (~root/.bash_profile 등)
$ su alice      # alice 사용자로 전환
$ su - alice    # alice 로그인 셸
```

### `su` vs `su -`의 차이

| 측면 | `su` | `su -` |
|---|---|---|
| 환경 변수 | 현재 사용자 환경 유지 (`$HOME` 등 그대로) | 대상자 환경 새로 로드 |
| 작업 디렉토리 | 그대로 | 대상자 홈디렉토리로 이동 |
| `PATH` | 현재 사용자 PATH | 대상자 PATH |
| 의도 | "권한만 잠깐 빌리고 싶다" | "그 사람으로 완전히 들어간다" |

→ **사고 방지엔 `su -`가 안전**. 환경이 섞이면 의도치 않은 결과 발생 (예: 내 별칭이 root로 따라옴).

### su의 보안 강화: `wheel` 그룹 + PAM

기본 `su`는 누구나 시도 가능. 보안 가이드라인은 **`wheel` 그룹 멤버만 `su` 가능**하도록 제한.

```sh
# /etc/pam.d/su 에서 주석 해제
auth required pam_wheel.so use_uid
```

→ 이후엔 `wheel` 그룹에 등록된 사용자만 `su` 시도 가능. 다른 사용자가 `su`하면 패스워드 맞아도 거부됨.

```sh
# wheel 그룹에 alice 추가
$ sudo usermod -aG wheel alice
```

## sudo 자세히

### 기본 동작

```sh
$ sudo apt update                    # apt update를 root로 실행
$ sudo -u postgres psql              # postgres 계정으로 psql 실행
$ sudo -s                            # root 셸 진입 (환경 유지)
$ sudo -i                            # root 로그인 셸 (su -와 비슷)
$ sudo -u ec2-user -i                # ec2-user 로그인 셸 (su - ec2-user의 sudo 버전)
$ sudo -l                            # 내가 sudo로 할 수 있는 것 목록 조회
$ sudo -k                            # sudo 인증 캐시 즉시 만료 (재인증 강제)
```

### `sudo -u <X> -i` — 다른 사용자 로그인 셸로 전환

`sudo`의 가장 자주 헷갈리는 조합. 옵션 분해:

| 부분 | 의미 |
|---|---|
| `-u <X>` | 대상 사용자를 X로 지정 (기본은 `root`) |
| `-i` | **i**nitial **login shell** — 대상자의 *로그인 셸*을 새로 시작 (`~/.bash_profile` 로드, `$HOME` = X의 홈) |

→ 효과는 **`su - <X>`와 거의 같지만**, 패스워드는 자기 것을 쓴다. 클라우드 환경에서 자주 쓰임.

```sh
sh-5.2$ sudo -u ec2-user -i
[ec2-user@ip-10-0-8-201 ~]$ whoami
ec2-user
```

프롬프트가 `sh-5.2$`(기본 sh) → `[ec2-user@host ~]$`(ec2-user의 bash 로그인 셸)로 바뀜. ec2-user의 `~/.bashrc`가 로드된 결과.

비슷한 명령들 비교:

| 명령 | 결과 |
|---|---|
| `sudo -u ec2-user -i` | ec2-user **로그인 셸** (홈으로 이동, 환경 새로 로드) |
| `sudo -u ec2-user -s` | ec2-user **셸** (현재 디렉토리 유지, 환경 일부만 로드) |
| `sudo -u ec2-user <cmd>` | ec2-user 권한으로 명령 1개만 실행, 셸은 안 바뀜 |
| `su - ec2-user` | 같은 효과지만 **ec2-user 패스워드** 입력 필요 (sudo는 자기 패스워드) |

### NOPASSWD — 패스워드 없이 sudo

`/etc/sudoers`에 `NOPASSWD:` 명시 시 패스워드 입력 없이 실행. 보통 자동화 스크립트·CI/CD에서 사용.

```
alice ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

→ alice는 패스워드 없이 nginx 재시작 가능. 그 외 명령은 일반 sudo (패스워드 필요).

### sudo 인증 캐시

기본적으로 한 번 인증하면 **15분 동안** 같은 터미널에서 재입력 면제. `/etc/sudoers`의 `timestamp_timeout`으로 조절.

## 헷갈리는 비교: `sudo -s` vs `su` — 결과는 같은데 길이 다름

둘 다 "환경 유지하면서 root 셸 진입"이라는 **결과가 거의 같다**. 하지만 도달 경로(인증·통제·로그)가 다르다.

| 항목 | `sudo -s` | `su` |
|---|---|---|
| **결과 셸** | root 셸 | root 셸 |
| **환경 유지** | ✅ ($HOME 등 유지) | ✅ ($HOME 등 유지) |
| **로그인 셸 로딩** | ❌ (`~/.bash_profile` 안 읽음) | ❌ (안 읽음) |
| **패스워드** | **자기** 패스워드 | **root** 패스워드 |
| **통제 시스템** | `/etc/sudoers` | PAM `/etc/pam.d/su` + `wheel` 그룹 |
| **감사 로그** | `/var/log/auth.log`에 자세히 (누가/어떤 명령) | "전환했다"만 기록, 이후 명령 추적 X |

```sh
# 길 A: sudo -s
$ sudo -s              # 내 패스워드 입력
[sudo] password for alice: ***
# root@host:~$         ← root 셸 (환경 유지)

# 길 B: su
$ su                   # root 패스워드 입력
Password: ***          # root 패스워드를 알아야 함
# root@host:~$         ← root 셸 (환경 유지)
```

→ **셸 모양은 똑같지만 인증 방식이 다름**. "도달했다"는 사실이 같아도 **누가 어떻게 도달했는지의 추적성**이 다름.

**모던 Linux 권장은 `sudo -s`** — 자기 패스워드만 알면 됨(root 패스워드 공유 X), 자세한 감사 로그, sudoers 정밀 제어. Ubuntu는 아예 root 패스워드 자체를 비활성화해 `su`를 못 쓰게 만들어둠.

## 4가지 명령 2×2 매트릭스 — 한눈에 정리

`su` / `su -` / `sudo -s` / `sudo -i`의 차이는 **2개 축의 곱**이다.

|  | **환경 유지** (현재 환경 그대로) | **로그인 셸** (홈으로 이동, `~/.bash_profile` 로드) |
|---|---|---|
| **자기 패스워드** (sudo) | `sudo -s` | `sudo -i` |
| **대상자 패스워드** (su) | `su` | `su -` |

→ 가로축은 *"환경을 새로 로드할 것인가"*, 세로축은 *"누구의 패스워드인가"*.

다른 사용자(예: ec2-user)로 가려면 `-u <X>` 추가:
- `sudo -u ec2-user -s` — ec2-user 셸, 환경 유지, 자기 패스워드
- `sudo -u ec2-user -i` — ec2-user 로그인 셸, 자기 패스워드 (`su - ec2-user`의 sudo 버전)

## /etc/sudoers와 visudo

`sudo`의 모든 권한은 **`/etc/sudoers` 파일**에 정의. **반드시 `visudo` 명령으로 편집** — 직접 vi로 열어 저장하면 syntax 오류 시 sudo 자체가 망가져 복구 어려움. visudo는 저장 전 검증해줌.

### 기본 문법

```
사용자  호스트=(실행할 사용자) [NOPASSWD:] 명령
```

### 예시

```sudoers
# alice는 모든 호스트에서 모든 명령을 root로 실행 (관리자 권한)
alice   ALL=(ALL) ALL

# bob은 nginx 재시작만 (패스워드 없이)
bob     ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx

# %wheel 그룹 멤버는 모든 명령 (sudo 표준 패턴)
%wheel  ALL=(ALL) ALL

# %sudo 그룹 (Ubuntu 표준 패턴)
%sudo   ALL=(ALL:ALL) ALL

# 별칭(Alias)으로 그룹화
User_Alias     ADMINS = alice, bob
Cmnd_Alias     SERVICES = /usr/bin/systemctl, /usr/sbin/service
ADMINS         ALL=(ALL) SERVICES
```

### `/etc/sudoers.d/` — 분할 관리

`/etc/sudoers`를 직접 수정하지 않고 **`/etc/sudoers.d/` 디렉토리에 파일별로** 정책을 둘 수 있음. 패키지·역할별로 분리 관리에 유리.

```sh
$ sudo visudo -f /etc/sudoers.d/nginx-restart
```

## 배포판별 wheel/sudo 그룹 컨벤션

| 배포판 | sudo 권한 그룹 |
|---|---|
| **Ubuntu / Debian** | `sudo` |
| **RHEL / CentOS / Fedora / Rocky** | `wheel` |
| **Arch / openSUSE** | `wheel` (관례) |

→ 배포판이 다르면 그룹명도 다름. 이식성 있게 작성하려면 `/etc/sudoers`에 둘 다 명시하거나 sudoers.d로 분리.

## 감사·로깅 — sudo의 결정적 장점

### sudo의 로그

```sh
# /var/log/auth.log (Debian/Ubuntu) 또는 /var/log/secure (RHEL)
May  4 10:23:45 host sudo: alice : TTY=pts/0 ; PWD=/home/alice ;
  USER=root ; COMMAND=/bin/cat /etc/shadow
```

→ **누가 / 언제 / 어디서 / 어떤 명령을** 실행했는지 자동 기록. 보안 감사·사고 추적의 표준 데이터.

### su의 로그

```sh
May  4 10:25:12 host su: (to root) alice on pts/0
```

→ "alice가 root로 전환했다"는 사실만 기록. **전환 후 무슨 명령을 실행했는지는 안 남음** — root 셸 안에서 한 모든 행동은 root가 한 일이 되어 버림.

> 이게 운영 환경에서 **`su` 대신 `sudo`를 강제하는 가장 큰 이유**. 사고 발생 시 "누가 무엇을 했나"의 답이 가능.

### sudo 세션 녹화 (sudo 1.7+)

`sudoers`에 `log_input`, `log_output`을 켜면 **터미널 입력·출력 자체가 녹화**됨 (`sudoreplay`로 재생). 엔터프라이즈 감사용.

## 실무 패턴

### 권장 패턴

1. **root 직접 로그인 금지** — `/etc/ssh/sshd_config`에서 `PermitRootLogin no`
2. **root 패스워드 비활성화** (Ubuntu 기본) — 사람은 자기 계정으로만 로그인
3. **관리자는 sudo 그룹에 등록** — 명령은 `sudo <cmd>` 형식
4. **자동화는 NOPASSWD** — 단, 명령 화이트리스트로 좁게
5. **`wheel`/`sudo` 그룹 멤버 정기 감사** — `getent group wheel` 등으로 점검
6. **PAM `pam_wheel.so`로 `su` 제한** — wheel 그룹 외엔 `su` 자체 금지
7. **`/etc/sudoers.d/`로 분할 관리** — Ansible·Terraform·Chef 등 IaC와 잘 맞음

### 일상 워크플로우

```sh
# 패키지 업데이트 — sudo 1회용 명령
$ sudo apt update && sudo apt upgrade

# 여러 명령을 root로 — sudo -i로 잠시 root 셸
$ sudo -i
# (root 셸에서 작업 후 exit)

# 다른 사용자(예: postgres)로 명령 실행
$ sudo -u postgres psql

# 자기가 sudo로 뭘 할 수 있는지 확인
$ sudo -l
```

## 안티패턴

| 안티패턴 | 왜 위험 |
|---|---|
| **root 패스워드 팀 공유** | 누가 무엇을 했는지 추적 불가. 사고 시 책임소재 X |
| **`ALL=(ALL) NOPASSWD: ALL`** | 사실상 root 자유 사용. 사고·악성 스크립트 시 무방비 |
| **`/etc/sudoers` 직접 vi 편집** | syntax 오류 시 sudo 자체 망가짐. 복구 어려움. **반드시 `visudo`** |
| **편의로 root 셸 상주** (`sudo -i` 후 작업) | 모든 명령이 감사 로그에 안 남음. sudo의 가치 소실 |
| **`su` 사용** (sudo 사용 가능 환경에서) | 셸 전환 = 감사 로그 끊김 |
| **NOPASSWD에 와일드카드 인자** (예: `vim *`) | `vim /etc/shadow` 같은 의도치 않은 root 권한 행사 가능. 명령은 절대 경로 + 정밀 화이트리스트 |
| **wheel 그룹에 모두 등록** | sudo 그룹의 의미 소실 |
| **PAM `pam_wheel.so` 미설정** | `su` 누구나 시도 가능 → 보안 가이드 위반 |

## 백엔드 개발자 관점 실무 포인트

- **개발 머신: `sudo`로 충분** — `sudo apt`, `sudo systemctl` 등. root 직접 로그인 X
- **서버 운영: SSH로 자기 계정 로그인 → sudo** — root SSH 금지가 표준
- **컨테이너 안에선 보통 root** — Docker 컨테이너 기본 사용자가 root. `USER` 지시로 비-root 전환 권장 (보안 모범)
- **Kubernetes Pod의 `securityContext.runAsNonRoot: true`** — 컨테이너에서 root 사용 차단
- **Ansible의 `become: true`** — 내부적으로 sudo 호출. ansible_become_password로 패스워드 전달
- **CI/CD 자동화는 NOPASSWD 화이트리스트** — 좁은 명령만 허용. `ALL` 금지
- **systemd 유저 서비스** — root 권한 없이 사용자 단위 서비스 가능. sudo 의존도 ↓
- **로그 수집 시 `/var/log/auth.log` 또는 `/var/log/secure` 포함** — 감사 추적용
- **`visudo` 습관화** — sudoers 편집 시 직접 vi 절대 X
- **`sudo -l`로 자기 권한 확인** — 권한이 헷갈리면 즉시 점검
- **`sudo -k`로 캐시 즉시 만료** — 작업 끝나면 재인증 강제

## 한 줄 요약

> **`su`는 "변신"**(대상자 패스워드 → 그 사람 셸로 전환), **`sudo`는 "위임장"**(자기 패스워드 → 명령 1개만 다른 사용자 권한으로 실행). 핵심 차이는 **(1) 누구의 패스워드 (2) 어떤 통제 시스템 (3) 결과가 셸인가 명령인가**. **`sudo`는 `/etc/sudoers` 정밀 제어 + 감사 로그**라 모던 Linux 운영의 표준. **`su`는 `wheel` 그룹 + PAM `pam_wheel.so`로 제한**하는 게 보안 모범 사례. 운영 환경에서는 **root 직접 로그인 금지 + 자기 계정 + sudo + 감사 로그**가 표준 패턴.

## 관련 문서

- [Linux/쉘](../쉘/) — 셸 환경
- (예정) chmod·chown·umask — 파일 권한
- (예정) PAM — 인증 모듈 시스템

## 참조

- [sudo 공식 사이트](https://www.sudo.ws/)
- [sudo manpage](https://www.sudo.ws/docs/man/sudo.man/)
- [sudoers manpage](https://www.sudo.ws/docs/man/sudoers.man/)
- [su manpage (util-linux)](https://man7.org/linux/man-pages/man1/su.1.html)
- [PAM pam_wheel manpage](https://man7.org/linux/man-pages/man8/pam_wheel.8.html)
- [Sudo: A Brief History (Todd Miller)](https://www.sudo.ws/about/history/)
- [Ubuntu RootSudo (root 패스워드 비활성화 정책)](https://help.ubuntu.com/community/RootSudo)
