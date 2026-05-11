# BSD 계열 서버 OS (FreeBSD / OpenBSD / NetBSD)

> 최종 업데이트: 2026-04-22 | 기준: FreeBSD 14.x, OpenBSD 7.x, NetBSD 10.x

## 개념

**BSD(Berkeley Software Distribution)** 는 1970년대 UC 버클리에서 AT&T UNIX를 기반으로 만든 파생 OS다. 이후 독립 오픈소스로 발전해 **FreeBSD / OpenBSD / NetBSD** 같은 현대적 서버 OS로 이어진다. Linux와 더불어 Unix-like 계열의 양대 축이지만, 서버 시장에서는 **틈새 강자** 위치.

> 비유하자면 Linux가 "대중적 스포츠카 라인업"이라면, BSD는 "특정 용도(스피드·보안·이식성)에 극단적으로 튜닝된 레이싱 카"들. 점유율은 작지만 각자의 전문 영역에서 최고 수준.

## 배경/역사

- **1977** — UC 버클리, AT&T UNIX에 개선 패치를 더해 **1BSD** 배포
- **1980년대** — BSD가 독자 확장(TCP/IP 스택, vi, csh 등) — 현대 인터넷의 토대
- **1992~1994** — AT&T와의 라이선스 소송 종결 후 BSD 코드가 자유 배포 가능해짐
- **1993** — **FreeBSD 1.0**, **NetBSD 0.8** 출시
- **1995** — **OpenBSD** 분기 (Theo de Raadt가 보안 강화 목표로 NetBSD에서 포크)
- 이후 각자의 철학을 유지하며 독립 발전

## BSD 3형제 비교

| 항목 | **FreeBSD** | **OpenBSD** | **NetBSD** |
|------|-------------|-------------|------------|
| 철학 | **성능·실용성** | **보안·코드 정확성** | **이식성**(모든 하드웨어에서 동작) |
| 슬로건 | "The Power to Serve" | "Secure by default" | "Of course it runs NetBSD" |
| 지원 아키텍처 | x86, ARM 등 주류 | 비교적 제한적 | **60+ 플랫폼** (초소형 임베디드까지) |
| 강점 | 네트워크·파일시스템 성능 | 보안 감사된 코드 | 극단적 이식성 |
| 대표 사례 | **Netflix CDN**, WhatsApp 초기 | **OpenSSH**, pfSense(방화벽) | 임베디드, 연구용 |
| 패키지 | `pkg`, ports | `pkg_add`, ports | `pkgsrc` |

## BSD 라이선스

BSD의 정체성을 이해하려면 **라이선스**부터.

| 라이선스 | 특징 | 대표 |
|---------|------|------|
| **BSD (2-clause, 3-clause)** | 저작권 표시만 유지하면 **상용 비공개 제품에도 자유롭게 통합** | FreeBSD, OpenBSD |
| **GPL** (Linux) | 파생물도 같은 라이선스로 공개해야 함 (copyleft) | Linux 커널 |

### 결과

- **Apple macOS/iOS**의 커널(Darwin)이 FreeBSD 기반 — 애플이 상용 제품에 자유롭게 활용
- **Sony PlayStation 3/4/5 OS**도 FreeBSD 기반
- **Netflix CDN**(Open Connect)은 FreeBSD 위에서 동작
- **WhatsApp**은 초기에 FreeBSD로 5억 사용자 처리

> BSD 라이선스의 "허용적" 성격 덕에 **상용 제품 속에 녹아들어 있는** 경우가 많다. 눈에 안 띄어서 시장 점유율은 작아 보이지만, 영향력은 크다.

## FreeBSD — 서버 중심의 성능 OS

### 특징

- **ZFS** 기본 지원 (Solaris에서 이식) — 데이터 무결성·스냅샷·압축 탁월
- **Jails** — Solaris Zones 영향을 받은 컨테이너의 원조
- **pf 방화벽**, **CARP**(HA), **DTrace** 등 엔터프라이즈 기능
- **네트워크 스택 성능** — Netflix가 CDN에 택한 이유

### 주 사용처

- **Netflix Open Connect** — 전 세계 CDN 서버 수만 대가 FreeBSD
- **pfSense / OPNsense** — 상용급 오픈소스 방화벽 (FreeBSD 기반)
- **대용량 파일 스토리지** — ZFS 활용
- WhatsApp 초기 인프라

## OpenBSD — 보안 최우선

### 특징

- **"Secure by default"** — 최소 활성 데몬, 감사(audit)된 코드
- **OpenSSH**, **OpenBGPD**, **LibreSSL** 개발자 — 전 세계 서버가 쓰는 도구들의 산실
- **Privilege separation**, **W^X**, **ASLR** 등 보안 기법을 업계 최초로 도입
- 릴리스마다 **6개월 지원** 짧은 주기, 안정성보다 보안 우선

### 주 사용처

- **방화벽·네트워크 보안 어플라이언스**
- 고위험 환경(정부, 금융 보안 장비)
- OpenSSH 등 보안 도구 개발 플랫폼

> `ssh` 명령어가 당신 컴퓨터에서 동작한다면, 그 구현체는 **OpenBSD 프로젝트의 OpenSSH**.

## NetBSD — 극단적 이식성

### 특징

- **60개 이상의 하드웨어 플랫폼** 지원 — Amiga, VAX, SPARC, 토스터(실제로 있음)부터 x86까지
- 깔끔한 이식 가능한 커널 설계
- **pkgsrc** — 다른 OS(Solaris, macOS, Linux 등)에서도 쓸 수 있는 이식성 있는 패키지 시스템

### 주 사용처

- 임베디드 시스템
- 연구·학술 환경
- 희귀 하드웨어 지원이 필요한 경우

## BSD vs Linux

같은 Unix-like라도 철학이 다르다.

| 항목 | BSD | Linux |
|------|-----|-------|
| 구성 | **커널 + 유저랜드가 하나의 통합 프로젝트** | 커널(Linus) + 유저랜드(GNU) + 배포판이 분리 |
| 릴리스 | 전체 시스템이 한 버전으로 묶여 릴리스 | 배포판마다 다른 조합 |
| 라이선스 | BSD (허용적) | GPL (copyleft) |
| 패키지 시스템 | ports(소스) + 바이너리 | apt/yum 등 배포판별 |
| 표준화 | 프로젝트 내 일관성 강함 | 배포판마다 차이 큼 |
| 서버 점유율 | 작음 (틈새) | 지배적 |
| 개발 문화 | 보수적·신중함 | 빠른 기능 추가 |

### 어떤 게 더 낫나?

한쪽이 우월하다기보다 **용도**가 다르다.

- 일반 서버·클라우드 → **Linux** (생태계·인력·문서)
- 극한 성능의 네트워크 스토리지 → **FreeBSD** (Netflix 케이스)
- 보안 최우선 어플라이언스 → **OpenBSD**
- 희귀 하드웨어·임베디드 → **NetBSD**

## 백엔드 개발자 관점

일반 웹/API 개발자가 BSD를 **직접 운영**하는 경우는 거의 없다. 하지만 **간접적으로 늘 쓰고 있다**.

- `ssh`, `scp`, `sshd` — OpenBSD 산
- **방화벽 어플라이언스** 뒷단에 pfSense/OPNsense (FreeBSD)
- **macOS 개발 환경** 자체가 BSD 기반 유저랜드 (`bash`/`zsh`, `ls`, `grep` 등 명령어 차이)
  - Linux의 GNU coreutils와 옵션이 미묘하게 다름 (예: `sed -i` 사용법)
- **CDN 캐시/영상 스트리밍 백엔드** — FreeBSD일 가능성 존재

### 실무 주의

- macOS에서 스크립트 짜면 BSD `sed`, Linux 서버에서 돌리면 GNU `sed` — **동작 차이** 주의
- BSD 포트(port)/pkg는 Linux의 `apt`와 명령이 다름
- FreeBSD의 `service`, `rc.conf` 설정은 systemd와 전혀 다름

## 요약

- BSD는 Unix-like의 또 다른 축 — **라이선스(BSD)** 와 **통합된 프로젝트 구조**가 Linux와 다름
- **FreeBSD**(성능), **OpenBSD**(보안), **NetBSD**(이식성)로 특화
- 일반 웹 서버 시장 점유율은 작지만, **macOS/PlayStation/Netflix CDN/OpenSSH** 처럼 눈에 안 띄는 곳에서 지배적
- 백엔드 개발자는 직접 운영하진 않더라도, `ssh`·macOS 개발 환경 등으로 **간접적으로 매일 접함**

## 관련 문서

- [서버 OS 개요.md](서버%20OS%20개요.md)
- [Unix 계열 (Linux AIX HP-UX Solaris).md](Unix%20%EA%B3%84%EC%97%B4%20%28Linux%20AIX%20HP-UX%20Solaris%29.md)
- [Windows Server.md](Windows-Server.md)
