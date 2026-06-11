# 3GPP

> 최종 업데이트: 2026-06-11 | Release 19 freeze 완료, Release 20(5G-Advanced/6G 스터디) 진행 중 기준

## 개념

**3GPP(3rd Generation Partnership Project, 3세대 파트너십 프로젝트)** 는 **전 세계 이동통신 표준을 만드는 국제 표준화 단체**다. 우리가 쓰는 2G(GSM)부터 5G(NR)까지, 거의 모든 이동통신 규격이 여기서 나온다.

> 비유: 이동통신 세계의 '헌법'을 만드는 기구. LTE·5G라는 말 자체가 3GPP가 정한 이름이고, 단말기·기지국·교환기 제조사들은 이 표준을 따라야 서로 통신이 된다.

이름은 "3세대(3G)"로 시작했지만 지금은 3G만 다루는 게 아니다. **4G·5G·6G까지 전부 3GPP가 표준화**한다. 이름만 3G일 뿐, 사실상 이동통신 표준 전반을 관장하는 단체다.

## 배경/역사

| 연도 | 사건 |
|------|------|
| 1998 | 유럽 ETSI 주도로 **3GPP 설립**. 당초 목표는 GSM 기반 **3G(UMTS)** 표준화 |
| 1999 | 첫 표준 **Release 99** 발표 (3G UMTS) |
| 2008 | **Release 8**에서 **LTE(4G)** 최초 표준화 |
| 2018 | **Release 15**에서 **5G NR** 최초 표준화 |
| 2020 | Release 16 — 5G 본격 확장 (산업용 IoT, V2X 등) |
| 2024 | Release 18 = 최초의 **5G-Advanced**. Release 19 진행 |
| 2025~ | **Release 19 freeze 완료**. Release 20에서 5G-Advanced 마무리 + **6G 스터디 시작** |
| 향후 | **Release 21** = 최초의 **6G 정규 표준** 예정 |

### 왜 'GSM'이 아니라 '3GPP'였나

3GPP가 생기기 전, 유럽은 ETSI가 GSM(2G)을 표준화했다. 3G로 넘어가면서 **유럽 혼자가 아니라 전 세계가 함께 표준을 만들 필요**가 생겼고, 각국 표준화 기관이 연합해 1998년 3GPP를 결성했다. 그래서 3GPP는 단일 회사·국가가 아니라 **여러 표준화 기관의 파트너십(연합체)** 이다.

> 참고로 CDMA2000 진영(퀄컴 중심)의 표준은 별도 단체인 **3GPP2**가 맡았으나, 시장이 LTE/5G로 통일되면서 3GPP2는 사실상 활동을 종료했다. 지금은 3GPP가 이동통신 표준을 단일하게 주도한다.

## 조직 구성

3GPP는 **7개 표준화 기관(Organizational Partners)** 의 연합이다.

| 지역 | 기관 |
|------|------|
| 한국 | **TTA** (한국정보통신기술협회) |
| 유럽 | ETSI |
| 미국 | ATIS |
| 일본 | ARIB, TTC |
| 중국 | CCSA |
| 인도 | TSDSI |

실제 표준 작업은 **TSG(Technical Specification Groups, 기술명세그룹)** 단위로 진행된다.

| TSG | 담당 영역 |
|-----|----------|
| **RAN** (Radio Access Network) | 무선 접속망 — 기지국, 무선 신호 |
| **SA** (Service & System Aspects) | 서비스·시스템 구조 — 전체 아키텍처 |
| **CT** (Core network & Terminals) | 코어망·단말 — 프로토콜, 단말 동작 |

## Release — 3GPP의 버전 체계

3GPP 표준은 **Release(릴리스)** 단위로 묶여 발표된다. 소프트웨어의 버전(v1, v2, …)과 같은 개념으로, 한 Release에 그 시점의 모든 기능 표준이 담긴다.

| Release | 핵심 내용 | 세대 |
|---------|----------|------|
| Release 99 | UMTS | 3G |
| Release 8 | **LTE 최초 표준** | 4G |
| Release 10 | LTE-Advanced | 4G+ |
| Release 15 | **5G NR 최초 표준** | 5G |
| Release 16~17 | 5G 확장 (IoT, V2X, NTN 등) | 5G |
| Release 18~20 | **5G-Advanced** + 6G 스터디 | 5G-Adv |
| Release 21 (예정) | **6G 정규 표준** | 6G |

**Freeze(프리즈)**: 한 Release의 기능이 확정되어 더 이상 새 기능을 추가하지 않는 시점. Freeze 이후엔 버그 수정·세부 보완만 한다. Release 19는 freeze가 완료됐고, Release 20은 5G-Advanced 마무리와 6G 초기 스터디를 동시에 진행 중이다.

## 명세 문서 — TS / TR

3GPP가 펴내는 표준 문서는 두 종류다.

| 종류 | 의미 | 성격 |
|------|------|------|
| **TS** (Technical Specification) | 기술 명세 | 실제 구현이 따라야 할 **정규 표준** |
| **TR** (Technical Report) | 기술 보고서 | 연구·검토용 (스터디 결과, 비정규) |

문서 번호는 `TS xx.xxx` 형식이며, **앞자리가 기술 영역**을 뜻한다.

| 번호 대역 | 영역 | 예시 |
|----------|------|------|
| `23.xxx` | 시스템 아키텍처 | **TS 23.038** (SMS 문자 인코딩), TS 23.040 (SMS 구조) |
| `24.xxx` | 단말 ↔ 코어망 프로토콜 | TS 24.301 (LTE NAS) |
| `36.xxx` | LTE 무선 | TS 36.211 (LTE 물리계층) |
| `38.xxx` | 5G NR 무선 | TS 38.211 (NR 물리계층) |

### TS는 Release마다 버전이 갱신되는 living document

하나의 TS 번호는 특정 Release에 갇히지 않는다. **번호(`23.040`)는 영구 고정**이고, **Release가 바뀔 때마다 그 문서의 새 버전이 freeze되어 발행**된다. 도서관에 같은 제목 책의 개정판이 여러 쇄 꽂혀있는 것과 같다.

버전 번호는 `Vx.y.z` 형식이며, **맨 앞자리 `x`가 Release 번호**다.

| 문서 | 버전 | 소속 Release |
|------|------|-------------|
| TS 23.040 | V16.x.x | Release 16 |
| TS 23.040 | **V19.x.x** | **Release 19 (현재 확정된 최신)** |
| TS 23.040 | V20.x.x (작성 중) | Release 20 (freeze 전) |

- "Release 19의 TS 23.040"과 "Release 16의 TS 23.040"은 **같은 번호, 다른 버전**이다. 단말·장비 제조사는 자기가 지원하는 Release에 맞는 버전을 본다
- 따라서 "최신 확정본"은 가장 최근 freeze된 Release의 버전을 뜻한다 (현재는 Release 19)
- 단, **SMS(TS 23.040)처럼 성숙한 기능은 Release가 올라가도 실질 변경이 거의 없어** 버전 숫자만 따라 오른다. 반대로 5G NR 무선(`38.xxx`) 같은 최신 영역은 Release마다 내용이 크게 바뀐다

## 정리

- **3GPP** = 이동통신(2G~6G) 국제 표준화 단체. 7개 표준화 기관의 연합
- **Release** = 표준의 버전 묶음. Release 8=LTE, 15=5G, 21=6G(예정)
- **TS/TR** = 표준 문서. `TS 23.038` 처럼 번호 앞자리가 기술 영역
- LTE·5G·SMS 규격까지 전부 여기서 정의 → 통신 관련 표준 얘기엔 항상 3GPP가 등장한다

## 관련 문서

- [SMS-기술규격.md](SMS-기술규격.md) — 3GPP TS 23.040/23.038이 정의하는 SMS 구조·인코딩, 통신사 문자가 EUC-KR을 쓰는 이유
- [한글-인코딩.md](../../한글-인코딩.md) — EUC-KR/UTF-8 바이트 차이
- [Network-Basic.md](../Network-Basic.md) — 네트워크 기초

## 출처

- [3GPP 공식 — About](https://www.3gpp.org/about-us)
- [3GPP — Release 19](https://www.3gpp.org/specifications-technologies/releases/release-19)
- [3GPP — Release 20](https://www.3gpp.org/specifications-technologies/releases/release-20)
- [Qualcomm — 3GPP Release 20](https://www.qualcomm.com/news/onq/2025/06/3gpp-release-20-completing-5g-advanced-evolution-preparing-for-global-6g-standardization)
- TS 23.038, TS 23.040 — 3GPP SMS 명세
