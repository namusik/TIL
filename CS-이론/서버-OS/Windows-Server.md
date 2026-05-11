# Windows Server

> 최종 업데이트: 2026-04-22 | 기준: Windows Server 2022 (최신 LTSC)

## 개념

**Windows Server**는 Microsoft가 만든 서버용 Windows OS다. 데스크톱 Windows(10/11)와 같은 **NT 커널**을 공유하지만, **다중 사용자 요청 처리**, **도메인 기반 중앙 관리**, **엔터프라이즈 서비스**(AD, IIS, MSSQL 등)에 최적화되어 있다.

> 비유하자면 "회사에서 쓰는 Windows의 큰형". 일반 Windows처럼 GUI로 쓸 수 있지만, **뒤에서 수백~수천 대 PC를 관리**하는 역할이 본업.

## 배경/역사

- **1993** — Windows NT 3.1 출시 (최초의 NT 커널, 서버·워크스테이션 버전 포함)
- **2003** — Windows Server 2003, 기업 표준으로 정착
- **2008** — Server 2008 / 2008 R2, Hyper-V 내장
- **2016** — Server 2016, **Nano Server / Server Core** 경량화 방향
- **2019/2022** — 컨테이너·Kubernetes 지원 강화
- **2024** — Windows Server 2025 발표

### 릴리스 채널

| 채널 | 설명 | 대상 |
|------|------|------|
| **LTSC** (Long-Term Servicing Channel) | 2~3년 주기, 10년 지원 | 기업 프로덕션 |
| **SAC** (Semi-Annual Channel) — 단종 | 6개월 주기, 18개월 지원 | 컨테이너·빠른 반영용 (2022 이후 중단) |

> 현재는 **LTSC만** 운영. 신규 도입 시 **Server 2022/2025 LTSC** 선택.

## 에디션

| 에디션 | 특징 | 사용처 |
|-------|------|-------|
| **Standard** | 일반 서버 역할, VM 2개 라이선스 포함 | 중소 규모 |
| **Datacenter** | 무제한 VM, 고급 기능(Storage Spaces Direct 등) | 가상화·클라우드 사업자 |
| **Essentials** | 최대 25 사용자, 저렴 | 소규모 사무실 |
| **IoT / Core** | GUI 없는 경량 버전 | 엣지·컨테이너 호스트 |

## 핵심 역할 (Server Roles)

Windows Server의 정체성은 "어떤 **역할**을 담당하느냐"로 결정된다.

| 역할 | 내용 |
|------|------|
| **Active Directory Domain Services (AD DS)** | 계정·그룹·정책 중앙 관리. 조직 인증의 중심 |
| **DNS / DHCP** | 네트워크 이름 해석·IP 자동 할당 |
| **File Server / SMB** | Windows 파일 공유(SMB 프로토콜) |
| **IIS** (Internet Information Services) | 웹 서버 (.NET 호스팅) |
| **Hyper-V** | MS 자체 하이퍼바이저 — VM 호스팅 |
| **Remote Desktop Services (RDS)** | 가상 데스크톱, 앱 스트리밍 |
| **Print Server** | 중앙 인쇄 관리 |
| **WSUS** | Windows 업데이트 사내 배포 |

## Active Directory (핵심 중의 핵심)

Windows Server를 쓰는 **가장 큰 이유**. 기업 인프라의 "주민등록 + 출입카드" 시스템.

- **도메인(Domain)** — 계정·자원을 한데 묶는 관리 경계
- **도메인 컨트롤러(DC)** — AD 정보를 보관하는 서버
- **Group Policy (GPO)** — 조직 전체 PC에 일괄 정책 적용 (비밀번호 정책, USB 차단 등)
- **Kerberos** 기반 SSO — 한 번 로그인으로 사내 서비스 접근
- **LDAP 프로토콜**로 계정 조회

> 국내 대부분 기업의 "사원 계정으로 PC 로그인 + 공유 폴더 접근 + 인트라넷 접속"이 전부 AD로 돌아간다.

## 원격 관리

Linux는 SSH + CLI, Windows Server는 **RDP + GUI + PowerShell** 조합.

| 도구 | 용도 |
|------|------|
| **RDP** (Remote Desktop) | GUI 원격 접속 |
| **PowerShell Remoting** | 스크립트 기반 원격 제어 (Linux SSH와 유사) |
| **Windows Admin Center** | 브라우저 기반 중앙 관리 콘솔 |
| **Server Manager** | 로컬 역할/기능 관리 GUI |

```powershell
# PowerShell 원격 세션
Enter-PSSession -ComputerName srv01 -Credential (Get-Credential)

# 여러 서버에 동시 실행
Invoke-Command -ComputerName srv01,srv02 -ScriptBlock { Get-Service }
```

## MS 생태계와의 궁합

Windows Server를 선택하는 실질적인 이유는 "이미 MS 스택을 쓰고 있기 때문"인 경우가 많다.

| 기술 | 설명 |
|------|------|
| **.NET / ASP.NET** | Windows + IIS 조합이 전통적 (현재는 .NET이 Linux에서도 동작) |
| **MSSQL Server** | Windows Server가 전통적 배포처 (2017+ 부터 Linux도 지원) |
| **Exchange Server** | 기업 메일 — Windows 전용 |
| **SharePoint** | 그룹웨어 — Windows 전용 |
| **Dynamics 365 On-Prem** | ERP/CRM — Windows 전용 |

## 컨테이너 / 클라우드

- **Windows Container** — Server 2016부터 지원. Docker 엔진 + Windows 이미지
- **Kubernetes on Windows** — Windows 워커 노드로 .NET Framework 앱 컨테이너화 가능
- **Azure** — Windows Server 라이선스를 **Azure Hybrid Benefit**으로 할인 적용
- **AWS** — EC2에서 Windows Server AMI 제공 (시간당 라이선스 포함 가격)

> 다만 컨테이너 생태계 자체는 **Linux 중심**. Windows 컨테이너는 "Windows 전용 앱을 컨테이너화"가 필요할 때만.

## Linux 대비 차이점

| 항목 | Windows Server | Linux |
|------|----------------|-------|
| 라이선스 | 상용 (코어당 과금 + CAL) | 대부분 무료 |
| 기본 관리 | GUI + PowerShell | CLI (SSH) |
| 원격 접속 | RDP | SSH |
| 계정 관리 | **AD (중앙화)** | 로컬 계정 / LDAP 별도 구축 |
| 파일 공유 | SMB | NFS |
| 리소스 효율 | 상대적으로 무거움 | 가벼움 |
| 재부팅 빈도 | 패치 시 재부팅 잦음 | 커널 패치 외에는 드묾 |
| 패키지 관리 | MSI / winget / Chocolatey | apt / yum / dnf |

## 백엔드 개발자 관점 — 언제 쓰는가

| 상황 | Windows Server가 유리/필수인 경우 |
|------|----------------------------------|
| **Active Directory** 기반 사내 시스템 통합 | 거의 필수 |
| .NET Framework 4.x **레거시** 앱 운영 | 필수 (NET Core부터는 Linux 가능) |
| **MSSQL Server** 장기 운영 | 전통적 선택 (Linux 버전도 있음) |
| Exchange / SharePoint | 필수 |
| **Windows 전용 레거시 애플리케이션** | 필수 |

신규 웹/API 서비스는 .NET이라도 **Linux + 컨테이너**가 현재 표준.

## 라이선스 주의

Windows Server는 **코어 단위 라이선스 + CAL(Client Access License)** 이 필수. 클라우드에서도 요금에 반영됨.

- **코어 라이선스** — 물리 서버의 모든 코어 수만큼 구매 (최소 16코어)
- **CAL** — 서버에 접속하는 **사용자 또는 장치**마다 필요 (User CAL / Device CAL)
- **RDS CAL** — RDP로 접속하는 사용자에 대해 추가 필요

> 라이선스 비용이 도입 의사결정에 결정적 영향을 미침. Linux로 대체 가능한 워크로드는 대부분 Linux로 이동하는 이유.

## 요약

- Windows Server는 **MS 생태계와 AD**를 쓰는 기업 환경의 표준
- 신규 웹/클라우드 서비스는 Linux가 기본, Windows Server는 **AD/MSSQL/기존 .NET 레거시**에서 필수
- 관리 방식은 Linux와 다르지만 근본적으로 **역할(Role) 단위**로 이해하면 접근 쉬움
- 라이선스 비용 구조(코어 + CAL)는 반드시 사전 확인

## 관련 문서

- [서버 OS 개요.md](서버-OS-개요.md)
- [Unix 계열 (Linux AIX HP-UX Solaris).md](Unix-%EA%B3%84%EC%97%B4-%28Linux-AIX-HP-UX-Solaris%29.md)
- [BSD 계열.md](BSD-%EA%B3%84%EC%97%B4.md)
