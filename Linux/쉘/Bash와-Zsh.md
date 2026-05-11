# Bash와 Zsh

> 최종 업데이트: 2026-04-17 | Bash 5.2, Zsh 5.9 기준

## 개념

**Shell(셸)** 은 사용자가 입력한 명령어를 해석해서 운영체제(커널)에 전달해주는 프로그램이다. 마치 **식당의 웨이터**처럼, 손님(사용자)의 주문(명령어)을 주방(커널)에 전달하고 결과를 가져다주는 중개자 역할을 한다.

**Bash**와 **Zsh**는 유닉스/리눅스 계열에서 가장 널리 쓰이는 두 가지 셸이다. 둘 다 Bourne Shell(`sh`) 계열 호환이라 기본 문법은 거의 같지만, Zsh는 Bash의 상위 호환격으로 더 많은 편의 기능을 제공한다.

## 배경/역사

| 셸 | 최초 출시 | 개발자 | 특징 |
|----|-----------|--------|------|
| sh (Bourne Shell) | 1977 | Stephen Bourne (AT&T) | 원조 유닉스 셸 |
| Bash (Bourne-Again Shell) | 1989 | Brian Fox (GNU) | sh의 오픈소스 확장판, Linux 기본 |
| Zsh (Z Shell) | 1990 | Paul Falstad | Bash + ksh + tcsh의 장점 결합 |

### macOS의 기본 셸 변경
- macOS Catalina(10.15, 2019) 이전: **Bash**가 기본
- macOS Catalina 이후: **Zsh**가 기본
- 이유: Apple이 Bash 3.2(2007) 이후 버전을 탑재하지 않음. GPLv3 라이선스 회피 목적으로 Zsh(MIT 호환)로 전환

## 현재 셸 확인

```bash
echo $SHELL      # 로그인 시 기본 셸
echo $0          # 현재 실행 중인 셸
cat /etc/shells  # 시스템에 설치된 셸 목록
```

## 주요 차이 한눈에

| 항목 | Bash | Zsh |
|------|------|-----|
| 설정 파일 | `~/.bashrc`, `~/.bash_profile` | `~/.zshrc`, `~/.zprofile` |
| 기본 탑재 OS | Linux 대부분 | macOS (Catalina+) |
| 자동완성 | 기본 제공 (제한적) | 강력함 (대소문자 무시, 부분 매칭) |
| 플러그인 생태계 | 제한적 | Oh My Zsh 등 풍부 |
| 배열 인덱스 | 0부터 시작 | 1부터 시작 (기본) |
| Glob 확장 | 제한적 | 재귀 `**/*` 기본 지원 |
| 프롬프트 커스터마이징 | `PS1` | `PROMPT` (더 강력) |
| 스크립트 호환성 | POSIX 표준 | Bash와 대부분 호환 |

## 설정 파일 구조

### Bash
```bash
~/.bash_profile   # 로그인 셸 시작 시 1회 실행
~/.bashrc         # 인터랙티브 non-login 셸마다 실행
~/.bash_logout    # 로그아웃 시 실행
```

### Zsh
```bash
~/.zshenv         # 모든 zsh 세션에서 실행 (가장 먼저)
~/.zprofile       # 로그인 셸에서만 실행
~/.zshrc          # 인터랙티브 셸에서 실행
~/.zlogin         # 로그인 셸의 마지막에 실행
~/.zlogout        # 로그아웃 시 실행
```

## Zsh 고유 기능

### 1. 강력한 자동완성
```bash
# Tab 한 번으로 디렉터리 이동 후보 표시
cd Doc<Tab>       # Documents 자동완성
cd /u/l/b<Tab>    # /usr/local/bin 으로 경로 축약 완성
```

### 2. 재귀 Glob 패턴
```bash
# Bash: find 명령어 필요
find . -name "*.md"

# Zsh: 내장 문법으로 해결
ls **/*.md        # 하위 모든 디렉터리의 .md 파일
```

### 3. 디렉터리 스택과 자동 cd
```bash
setopt AUTO_CD           # 'Documents' 입력만으로 cd 수행
cd -<Tab>                # 이전 방문 디렉터리 목록 표시
```

### 4. 프롬프트 커스터마이징
```bash
# Bash
PS1='\u@\h:\w\$ '

# Zsh
PROMPT='%n@%m:%~%# '     # %n=user, %m=host, %~=path
```

## 배열 문법 차이

```bash
# Bash (0부터 시작)
arr=(a b c)
echo ${arr[0]}           # a

# Zsh (1부터 시작이 기본)
arr=(a b c)
echo $arr[1]             # a
```

Zsh에서 `setopt KSH_ARRAYS`로 Bash 방식(0부터)을 사용할 수도 있다.

## Oh My Zsh

Zsh 생태계를 대표하는 **프레임워크**로, 테마/플러그인을 쉽게 관리해주는 도구다. 마치 브라우저에 확장 프로그램을 설치하듯 셸 기능을 확장할 수 있다.

```bash
# 설치
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# ~/.zshrc 주요 설정
ZSH_THEME="robbyrussell"                    # 테마 선택
plugins=(git docker kubectl zsh-autosuggestions)  # 플러그인 활성화
```

대표 플러그인:
- `git` — git 명령어 alias 자동 제공 (`gst`=`git status`)
- `zsh-autosuggestions` — 과거 명령어 기반 자동 제안
- `zsh-syntax-highlighting` — 명령어 구문 실시간 색상 표시

## 셸 변경 방법

```bash
# 기본 셸 변경
chsh -s /bin/zsh         # Zsh로 변경
chsh -s /bin/bash        # Bash로 변경

# 현재 세션만 임시 전환
exec zsh
exec bash
```

## 스크립트 호환성

쉘 스크립트 작성 시 이식성을 위해 shebang을 명확히 지정한다.

```bash
#!/bin/sh         # POSIX 표준 (가장 이식성 높음)
#!/bin/bash       # Bash 전용 기능 사용 시
#!/bin/zsh        # Zsh 전용 기능 사용 시
```

대부분의 Bash 스크립트는 Zsh에서도 동작하지만, `[[ ... ]]` 조건식 일부, 배열 인덱스, 변수 확장 등에서 미묘한 차이가 발생할 수 있다.

## 백엔드 개발자 관점에서

- **서버 작업**: 대부분의 Linux 서버는 **Bash가 기본**이므로, 운영 스크립트는 Bash 기준으로 작성하는 것이 안전하다.
- **로컬 개발**: macOS 사용자라면 **Zsh + Oh My Zsh** 조합이 생산성에 유리하다.
- **CI/CD**: GitHub Actions, GitLab CI 등은 기본 `/bin/sh` 또는 Bash를 사용하므로 스크립트 작성 시 POSIX 호환성 고려.
- **Dockerfile**: 베이스 이미지(alpine은 `ash`, ubuntu는 `bash`)에 따라 셸이 다르므로 `RUN` 명령 작성 시 주의.

## 관련 문서

- [환경변수설정.md](환경변수설정.md)
- [#!binsh.md](#!binsh.md)
