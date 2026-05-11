# 서버 OS 개요

> 최종 업데이트: 2026-04-22 | 기준: 전 세계 서버 OS 지형 (현역 + 레거시)

## 개념

**서버 OS**는 데스크톱·모바일 OS와 달리 **다수의 클라이언트 요청을 24/7 안정적으로 처리**하는 것에 특화된 운영체제다. 주요 요구사항은 **신뢰성(장애 최소화), 성능(동시성), 보안, 원격 관리**다.

> 비유하자면 데스크톱 OS는 "개인용 스포츠카", 서버 OS는 "화물 트럭/버스". 혼자 빠른 게 아니라 **많은 짐을 오래 안정적으로** 실어나르는 것이 목표.

## 서버 OS 지형 (계열 분류)

현대 서버 OS는 크게 **4대 계열**로 나뉜다.

```
                    ┌───────────────────┐
                    │    서버 OS         │
                    └─────────┬─────────┘
          ┌───────────┬───────┴────────┬──────────────┐
          ▼           ▼                ▼              ▼
     ┌────────┐  ┌────────┐     ┌──────────┐   ┌────────┐
     │ Unix   │  │ Linux  │     │ Windows  │   │ 메인   │
     │ 계열   │  │        │     │ Server   │   │ 프레임 │
     └────────┘  └────────┘     └──────────┘   └────────┘
     AIX         RHEL           Windows        z/OS
     HP-UX       Ubuntu         Server         (IBM Z)
     Solaris     Amazon Linux   2019/2022
     (macOS)     Alpine
                 Debian
                 SUSE
     BSD 계열
     FreeBSD
     OpenBSD
```

## 대략적인 시장 점유율 (서버 기준)

| 계열 | 점유율 | 위치 |
|------|-------|------|
| **Linux** | 70~80%+ | 클라우드·웹·컨테이너의 사실상 표준 |
| **Windows Server** | 15~20% | AD / MSSQL / .NET / 기업 인트라넷 |
| **Unix 계열** (AIX) | 1~2% | 금융권 코어뱅킹 (IBM POWER) |
| **BSD 계열** | 1% 미만 | Netflix CDN, 네트워크 장비 펌웨어 |
| **Solaris / HP-UX** | 1% 미만 | 레거시 유지보수 |
| **z/OS (메인프레임)** | — | 은행·보험 기간계 (별도 세계) |

> 통계는 측정 기관마다 다르지만, **Linux의 지배적 점유는 일치**.

## 4대 계열 비교

| 항목 | **Linux** | **Unix 계열** | **Windows Server** | **BSD 계열** |
|------|-----------|---------------|---------------------|--------------|
| 라이선스 | 오픈소스(GPL) | 상용 | 상용(MS) | **오픈소스(BSD 라이선스)** |
| 계보 | Unix-like (독립 구현) | System V / BSD | MS 독자 (NT 커널) | 버클리 BSD 직계 |
| 대표 제품 | RHEL, Ubuntu, Amazon Linux | AIX, HP-UX, Solaris | Windows Server 2022 | FreeBSD, OpenBSD |
| 하드웨어 | x86/ARM 범용 | 전용 (POWER, SPARC 등) | x86/x64 | x86/ARM 범용 |
| 주 사용처 | 클라우드, 웹, 컨테이너 | 금융 코어뱅킹 | 기업 AD/MSSQL | CDN, 네트워크 장비 |
| 클라우드 지원 | **모든 메이저 클라우드** | 제한적 | AWS/Azure 지원 | AWS/FreeBSD 지원 |
| 관리 방식 | SSH + CLI | SSH + CLI | RDP + PowerShell | SSH + CLI |

## 왜 Linux가 이겼나

상용 Unix와 초기 Windows Server를 밀어낸 이유.

1. **오픈소스 + 무료** — 라이선스 비용 제로
2. **하드웨어 종속 해제** — 범용 x86에서 동작, 전용 장비 불필요
3. **개발자 생태계** — GCC, Apache, MySQL, Docker, Kubernetes 등 전부 Linux 우선
4. **클라우드와의 궁합** — AWS/GCP/Azure 인스턴스의 기본이 Linux
5. **컨테이너 시대** — Docker/K8s가 Linux 커널 기능(cgroups, namespaces)에 의존

## 계열별 특징 요약

### Linux
- **배포판** 형태로 제공 (같은 커널 + 다른 패키징/툴)
- 클라우드·컨테이너·엣지까지 전 분야 지배
- 상세: [Unix 계열 (Linux AIX HP-UX Solaris).md](Unix-%EA%B3%84%EC%97%B4-%28Linux-AIX-HP-UX-Solaris%29.md)

### Unix 계열 (AIX / HP-UX / Solaris)
- 상용 Unix — 제조사별 전용 하드웨어에 묶인 "수직 통합" OS
- 뛰어난 RAS(안정성), 하지만 **클라우드 전환 어려움** 으로 레거시화
- 상세: [Unix 계열 (Linux AIX HP-UX Solaris).md](Unix-%EA%B3%84%EC%97%B4-%28Linux-AIX-HP-UX-Solaris%29.md)

### Windows Server
- **Active Directory**(AD), **Group Policy** 중심의 기업 인프라
- **.NET / MSSQL / IIS / Exchange** 등 MS 생태계
- PowerShell 기반 원격 관리
- 상세: [Windows Server.md](Windows-Server.md)

### BSD 계열 (FreeBSD / OpenBSD / NetBSD)
- 버클리 Unix 직계, **BSD 라이선스**(상용 통합 자유로움)
- Netflix CDN, PlayStation OS, pfSense 등에서 활용
- 상세: [BSD 계열.md](BSD-%EA%B3%84%EC%97%B4.md)

### 메인프레임 (z/OS)
- IBM Z 하드웨어 전용 — x86과 **완전히 다른 세계**
- 은행·보험·항공권 예매 등 초대형 트랜잭션 기간계
- JCL(Job Control Language), CICS, COBOL이 살아있는 영역
- 별도 학습 영역이라 본 문서군에서는 개요만 언급

## 백엔드 개발자 관점 — 언제 무엇을 만나는가

| 상황 | OS |
|------|-----|
| 신규 서비스, 스타트업, IT 기업 | **Linux (Ubuntu/Amazon Linux)** |
| AWS/GCP/Azure EC2 | **Linux** 거의 전부 |
| 온프레미스 웹/WAS | Linux (RHEL/Rocky/CentOS) |
| 컨테이너 (Docker/K8s) | Linux (Alpine/Ubuntu 베이스) |
| 기업 Active Directory / SSO / MSSQL | **Windows Server** |
| 은행 코어뱅킹 | **AIX** (IBM POWER) |
| 메인프레임 계정계 | **z/OS** (COBOL/JCL) |
| Netflix 스케일 CDN | **FreeBSD** |
| 방화벽/라우터 펌웨어 | BSD 또는 Linux |

## 선택 기준 (실무)

새 시스템을 구축할 때 기본 판단.

| 요구 | 추천 OS |
|------|--------|
| 클라우드·컨테이너·MSA | **Linux** (Ubuntu/Amazon Linux) |
| Windows 클라이언트 통합, AD, MSSQL | **Windows Server** |
| 최대 안정성 + 기존 IBM 투자 | AIX |
| 네트워크/보안 어플라이언스 | OpenBSD/FreeBSD |
| 기존 기간계 유지 | 기존 OS 그대로 |

> **기본값은 Linux**, 예외 상황에서만 다른 계열 검토.

## 요약

- 서버 OS 시장은 **Linux 압도적 1위, Windows Server 2위**, 나머지는 레거시/특정 용도
- 계열은 **Linux / Unix / Windows / BSD** 4대 축으로 나뉨 + 별세계인 **메인프레임**
- 백엔드 개발자는 Linux를 기본으로 숙달하고, 상황별로 다른 OS 특성을 학습
- 계열별 상세는 이 폴더의 개별 문서 참조

## 관련 문서

- [Unix 계열 (Linux AIX HP-UX Solaris).md](Unix-%EA%B3%84%EC%97%B4-%28Linux-AIX-HP-UX-Solaris%29.md)
- [Windows Server.md](Windows-Server.md)
- [BSD 계열.md](BSD-%EA%B3%84%EC%97%B4.md)
