# Unix 계열 서버 OS (Linux / AIX / HP-UX / Solaris)

> 최종 업데이트: 2026-04-22 | 기준: 현역·레거시 Unix 계열 개괄

## 개념

서버 시장에서 가장 오래되고 넓은 계열. 1969년 Bell Labs에서 탄생한 **UNIX**에서 뻗어나온 상용 제품들(AIX, HP-UX, Solaris)과, UNIX를 **닮게 새로 만든** 오픈소스 Linux가 포함된다.

> 비유하자면 "UNIX"라는 원조 요리법을 각 회사(IBM/HP/Sun)가 자기 브랜드로 팔고, 리누스 토르발즈가 같은 요리법을 **무료 레시피로 재현한 게 Linux**. 맛(사용감)은 거의 같지만 유통 방식과 주방 도구(하드웨어)가 다르다.

## 배경/역사

- **1969** — Bell Labs, Ken Thompson & Dennis Ritchie가 UNIX 개발
- **1980년대** — UNIX가 상용화되며 **BSD 계열**(버클리)과 **System V 계열**(AT&T)로 분화
- **상용 Unix 탄생** — 각 하드웨어 제조사가 자사 서버에 맞춰 자체 Unix 출시
  - IBM → **AIX** (1986)
  - HP → **HP-UX** (1984)
  - Sun → **SunOS/Solaris** (1982/1992)
- **1991** — 리누스 토르발즈(Linus Torvalds)가 **Linux 커널** 공개 (오픈소스, Unix-like)
- **2000년대** — x86 서버 + Linux 조합이 상용 Unix를 빠르게 대체
- **2010년대 이후** — 클라우드(AWS/GCP/Azure)의 기본 OS가 Linux로 굳어지며 **상용 Unix는 레거시화**

## Unix vs Unix-like

헷갈리기 쉬운 포인트. "Unix 계열"이라고 묶어도 엄밀히는 두 종류다.

| 분류 | 설명 | 예 |
|------|------|----|
| **정통 UNIX** | The Open Group의 **UNIX 인증**을 받은 상용 OS | AIX, HP-UX, Solaris, macOS |
| **Unix-like** | Unix를 닮게 만들었지만 인증은 없음 (오픈소스 다수) | **Linux**, FreeBSD, OpenBSD |

> macOS도 사실 정통 UNIX 인증 OS. 반면 Linux는 **인증 없이 Unix처럼 동작**하는 OS.

## 4종 비교

| 항목 | **Linux** | **AIX** | **HP-UX** | **Solaris** |
|------|-----------|---------|-----------|-------------|
| 제조사 | 커뮤니티/배포판 벤더 | IBM | HP(현 HPE) | Sun → Oracle |
| 최초 릴리스 | 1991 | 1986 | 1984 | 1992 (SunOS 1982) |
| 라이선스 | 오픈소스(GPL) | 상용 | 상용 | 상용(일부 오픈소스 시도 있었음) |
| 계보 | Unix-like (독립 구현) | System V | System V | BSD + System V 혼합 |
| 주 하드웨어 | **x86/x64, ARM** 범용 | IBM **POWER** 서버 전용 | HP **PA-RISC / Itanium** | **SPARC** / x86 |
| 패키지 매니저 | `apt`, `yum`, `dnf` | `installp`, `rpm` | `swinstall` | `pkg`, `pkgadd` |
| 기본 쉘 | bash | ksh (AIX 전통) | POSIX sh / ksh | bash(10+) / ksh |
| 대표 파일시스템 | ext4, XFS, Btrfs | **JFS2** | **VxFS (HFS)** | **ZFS** |
| 클라우드 지원 | **모든 메이저 클라우드** | 제한적(IBM Cloud 위주) | 거의 없음 | 거의 없음 |
| 현 상태 | **사실상 표준** | 현역 (IBM 고객층) | **레거시**, 지원 축소 | 레거시, Oracle이 축소 |

## 왜 Linux가 이겼나

상용 Unix들이 밀려난 이유는 기술력이 아니라 **생태계와 하드웨어 종속성**이었다.

1. **하드웨어 종속 해제** — Linux는 범용 x86에서 동작 → 장비 가격이 1/10로 떨어짐
2. **오픈소스 생태계** — GCC, Apache, MySQL, Kubernetes 등이 전부 Linux 우선
3. **클라우드와의 궁합** — AWS EC2 AMI의 기본은 Linux. 상용 Unix는 클라우드 이전이 사실상 불가
4. **라이선스 비용** — AIX/HP-UX/Solaris는 OS 자체와 전용 하드웨어에 각각 비용 발생
5. **벤더 락인 회피** — 특정 제조사 망하면 끝나는 위험 회피

## 각 OS별 특징

### Linux
- **배포판(Distribution)** 체계: 같은 커널 + 다른 패키징·툴링
  - **RHEL / CentOS / Rocky / AlmaLinux** — 기업용 표준 (RPM, `yum`/`dnf`)
  - **Ubuntu / Debian** — 개발자·클라우드에서 인기 (DEB, `apt`)
  - **Amazon Linux** — AWS 최적화
  - **Alpine** — 컨테이너 이미지용 초경량
- 클라우드 인스턴스·컨테이너·엣지 모두 주력

### AIX (IBM)
- **System V 기반**, IBM POWER CPU 전용
- 장점: 뛰어난 **RAS**(Reliability, Availability, Serviceability) — 무중단 하드웨어 교체 등
- **LPAR**(논리 파티션) — 하드웨어 레벨 가상화가 강점
- 주 사용처: **국내 대형 은행 코어뱅킹**, 대형 ERP, 미션 크리티컬 업무

### HP-UX (HPE)
- System V 기반, HP PA-RISC → Itanium 전환 후 **Itanium 단종(2021)** 으로 사실상 몰락
- HPE 공식 지원은 **2025년 종료** 예정 (이후 확장 지원만)
- 주 사용처: 기존 HP 장비 기반의 대형 제조·통신 레거시

### Solaris (Oracle)
- **BSD + System V 혼합** 계보
- 독보적 기술 몇 가지 — **ZFS**(파일시스템), **DTrace**(동적 추적), **Zones**(컨테이너의 원조)
- 2010년 Oracle 인수 후 커뮤니티 포크(**illumos**, OpenIndiana)로 분화
- 주 사용처: 축소 중. 기존 금융·통신 레거시 유지보수

## 백엔드 개발자 관점

대부분은 **Linux만 알면 충분**. 하지만 국내 금융권·대기업에서 가끔 만나는 경우.

### 현장에서 마주치는 시나리오

| 상황 | 맞닥뜨리는 OS |
|------|--------------|
| 스타트업·IT 기업 신규 구축 | **Linux (Ubuntu/Amazon Linux)** |
| AWS/GCP/Azure | **Linux** 거의 전부 |
| 온프레미스 웹/WAS | Linux (RHEL/CentOS/Rocky) |
| 은행 코어뱅킹 | **AIX** (IBM POWER) |
| 오래된 제조·통신 기간계 | HP-UX, Solaris 간혹 |

### 실무 차이점

- **쉘 호환성** — AIX/HP-UX 기본 쉘이 `ksh` → bash에서만 되는 문법(`[[ ]]`, 배열) 주의
- **패키지 매니저 다름** — AIX는 `installp`, HP-UX는 `swinstall` — Linux의 `apt/yum` 관점과 다름
- **파일시스템** — Solaris ZFS, AIX JFS2는 Linux의 ext4/XFS와 명령어가 다름
- **JVM 벤더** — AIX는 **IBM JDK**, HP-UX는 HP JDK(지원 종료). 같은 Java 코드라도 JVM 옵션이 다를 수 있음

## 요약

- **Unix 계열 서버 OS**는 크게 상용(AIX/HP-UX/Solaris)과 오픈소스(Linux)로 나뉨
- 지금 새로 뭔가 구축하면 **거의 Linux**
- AIX/HP-UX/Solaris는 "아직 살아있는 레거시" — 특정 산업(금융·통신·대기업 기간계)에서만 만남
- 백엔드 개발자는 Linux를 기본으로 숙달하고, **레거시 현장 이슈 발생 시 해당 OS 문법·툴 차이를 그때 학습**하면 충분

## 관련 문서

- [서버 OS 개요.md](서버%20OS%20개요.md)
- [Windows Server.md](Windows-Server.md)
- [BSD 계열.md](BSD%20%EA%B3%84%EC%97%B4.md)
- Linux 폴더: [../../Linux/](../../Linux/)
