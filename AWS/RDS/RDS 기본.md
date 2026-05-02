# Amazon RDS 기본

> 최종 업데이트: 2026-04-20 | 기준: Amazon RDS / Aurora MySQL 3.x

## 개념

**Amazon RDS(Relational Database Service)** 는 AWS가 **관계형 데이터베이스를 완전 관리형(Managed)** 으로 제공하는 서비스다. DB 설치·패치·백업·복제·장애 조치 같은 운영 작업을 AWS가 대신해주고, 사용자는 접속 정보와 스키마/쿼리만 신경 쓰면 된다.

> 비유하자면 직접 장비를 사서 DB를 까는 게 아니라, **월세 내고 완성된 DB 서버를 빌리는** 개념. 전원/네트워크/백업은 집주인(AWS) 담당.

## 지원 엔진

| 엔진 | 특징 |
|------|------|
| **Aurora** (MySQL/PostgreSQL 호환) | AWS 자체 개발. 고성능·고가용·자동 확장 |
| **MySQL / MariaDB** | 오픈소스, 친숙, 저렴 |
| **PostgreSQL** | 오픈소스, 기능 풍부 (JSON, GIS 등) |
| **Oracle / SQL Server** | 상용, 라이선스 비용 별도 |

> 국내 백엔드 실무에서는 **Aurora MySQL** 또는 **RDS for MySQL**이 가장 흔하다.

## Aurora vs RDS for MySQL

Aurora는 MySQL 프로토콜과 호환되지만 **스토리지 계층을 AWS가 다시 설계**한 별개 엔진이다.

| 항목 | Aurora (MySQL 호환) | RDS for MySQL |
|------|---------------------|---------------|
| 엔진 출처 | AWS 자체 개발 | Oracle MySQL 그대로 |
| 성능 | 동일 스펙에서 **최대 5배** | 표준 MySQL 수준 |
| 스토리지 | **6개 복제본을 3개 AZ에 자동 분산** | Multi-AZ 선택, 단일 볼륨 |
| 스토리지 확장 | 자동 (10GB → 최대 128TB) | 수동 확장 필요 |
| 장애 복구 | **~30초 페일오버**, 거의 무지연 | 60~120초, 상대적으로 느림 |
| 리드 리플리카 | 최대 **15개**, 지연 ms 단위 | 최대 5개, 상대적 느림 |
| 복제본 → Primary 승격 | 자동/즉시 | 수동/느림 |
| 비용 | 더 비쌈 | 상대적 저렴 |
| 적합 | 트래픽 많고 HA 중요 | 소규모, 비용 민감 |

### Aurora의 구조적 차이 (왜 빠른가)

```
[일반 MySQL]   EC2 (DB엔진) ──→ EBS (스토리지)       : 1:1 구조
[Aurora]       EC2 (DB엔진) ──→ 분산 스토리지 계층    : 6x3AZ 복제를 AWS가 맡음
                                  (Page 기반, Log만 전송)
```
- MySQL은 변경 시 전체 데이터 페이지를 디스크에 기록
- Aurora는 **redo log만** 스토리지 계층에 보내고, 스토리지가 페이지 재구성 담당
- 덕분에 네트워크 I/O↓, 복제 지연↓

## RDS 인스턴스 구성 요소

```
┌──────────────────── VPC ────────────────────┐
│                                              │
│   DB Subnet Group (2+ AZ)                    │
│   ┌──────────┐   ┌──────────┐                │
│   │ Subnet A │   │ Subnet C │  ← 프라이빗 권장 │
│   │ (AZ-a)   │   │ (AZ-c)   │                │
│   └────┬─────┘   └────┬─────┘                │
│        │              │                      │
│     [Writer]      [Reader]   ← Multi-AZ/Reader│
│        │              │                      │
│        └──── 보안 그룹 (SG) ───┐              │
│                                │              │
│                         [Parameter Group]     │
│                         [Option Group]        │
│                         [자동 백업 / 스냅샷]  │
└──────────────────────────────────────────────┘
```

## DB 서브넷 그룹

**Amazon RDS 인스턴스가 배치될 수 있는 VPC 내의 서브넷 모음**. RDS는 VPC 안에서 실행되며, 서브넷 그룹으로 "어떤 서브넷들에 배치할지"를 결정한다.

### 요구사항과 역할

1. **다중 가용 영역 배치** — 서브넷 그룹에는 **최소 두 개 이상 서로 다른 AZ**의 서브넷이 포함되어야 함. Multi-AZ 배포 시 Writer는 한 AZ, Standby/Reader는 다른 AZ에 자동 배치됨 → 고가용성 확보
2. **서브넷 선택** — RDS 인스턴스 생성 시 서브넷 그룹을 지정. 그룹 내 서브넷 중 하나에 실제 인스턴스가 올라감
3. **VPC 통합** — VPC 내부에서 동작하므로 기본은 **프라이빗**. 외부에서 접근해야 하면 퍼블릭 서브넷을 포함해야 함 (권장되지 않음)
4. **보안 제어** — 서브넷의 **보안 그룹(SG)** 과 **네트워크 ACL**로 트래픽 제어

> 실무에서는 **프라이빗 서브넷만** 서브넷 그룹에 넣고, 앱 서버에서만 접근 가능하도록 SG로 제한하는 것이 표준. DB에 퍼블릭 IP 부여는 보안 사고 1순위.

## 파라미터 그룹 / 옵션 그룹

| 구분 | 역할 |
|------|------|
| **Parameter Group** | DB 엔진 설정값 (`my.cnf` 대용) — 타임존, 문자셋, innodb 관련 등 |
| **Option Group** | DB 엔진별 추가 기능 — MariaDB 감사 플러그인, SQL Server 네이티브 백업 등 |

- 자세한 파라미터 설정은 [필수 파라미터 그룹 설정](필수%20%20파라미터%20그룹%20설정.md) 참고

## 백업 / 복구

| 기능 | 설명 |
|------|------|
| **자동 백업** | 매일 1회 풀 백업 + 5분 단위 트랜잭션 로그. 보관 1~35일 |
| **수동 스냅샷** | 명시적으로 만든 백업. 보관 기간 무제한 (계정 내) |
| **PITR (Point-In-Time Recovery)** | 자동 백업 기간 내 **임의 시점**으로 복원 (5분 단위 정밀도) |
| **스냅샷 공유/복사** | 다른 계정·리전으로 이동 가능 (DR용) |

## 고가용성 구성

| 구성 | 용도 |
|------|------|
| **Single-AZ** | 단일 인스턴스. 개발/테스트용 |
| **Multi-AZ (Standby)** | 동기 복제 대기 인스턴스. 장애 시 자동 페일오버 |
| **Multi-AZ (Cluster)** | 2개 Reader + 1 Writer. 페일오버 빠름 (RDS for MySQL 8.0.28+) |
| **Aurora Cluster** | Writer 1 + Reader N (최대 15). Endpoint 자동 라우팅 |

## Aurora 엔드포인트

Aurora는 3종류의 엔드포인트를 제공. 연결 대상을 용도에 맞게 선택해야 한다.

| 엔드포인트 | 대상 | 용도 |
|-----------|------|------|
| **Cluster (Writer) Endpoint** | 항상 현재 Writer | 쓰기 트래픽 |
| **Reader Endpoint** | Reader 인스턴스들을 라운드로빈 | 읽기 분산 |
| **Custom Endpoint** | 사용자가 지정한 인스턴스 묶음 | 분석용 대형 리플리카만 분리 등 |

```
애플리케이션 ─► cluster.xxx.rds.amazonaws.com  (쓰기)
             ─► cluster-ro.xxx.rds.amazonaws.com (읽기)
```

## 모니터링

| 도구 | 내용 |
|------|------|
| **CloudWatch Metrics** | CPU, 커넥션 수, 읽기/쓰기 IOPS 등 기본 지표 |
| **Enhanced Monitoring** | OS 레벨 지표 (프로세스, 디스크 I/O 세부) |
| **Performance Insights** | 쿼리 단위 부하 분석 — **운영에서 필수로 켤 것** |
| **Slow Query Log** | 느린 쿼리 기록 — CloudWatch Logs로 내보낼 수 있음 |

## 비용 구성

- **인스턴스 시간당 요금** — 클래스(db.r6g.large 등)별
- **스토리지 요금** — GB-월 (Aurora는 I/O 요금이 있는 표준 / I/O 요금 없는 I/O-Optimized 선택)
- **백업 스토리지** — 할당량 초과분
- **데이터 전송** — AZ/리전 간 이동 시 과금

> Aurora는 2022년부터 **I/O-Optimized** 옵션 제공 — I/O가 많은 워크로드는 오히려 총비용이 낮아질 수 있음.

## 백엔드 개발자 관점 실무 포인트

- **커넥션 풀** — 앱 측에 HikariCP 등으로 풀을 두고, 인스턴스 `max_connections`를 넘지 않게 관리
- **RDS Proxy** — Lambda/서버리스에서 커넥션 폭주 방지. 풀링·페일오버 가속
- **Reader 분리** — `@Transactional(readOnly = true)`에서 Reader로 보내도록 라우팅
- **장기 트랜잭션 금지** — Aurora는 undo 누적 시 성능 저하. OLAP 쿼리는 분석용 리플리카로
- **스키마 변경** — 큰 테이블 `ALTER`는 온라인 DDL 가능 여부 확인 + `pt-online-schema-change`/`gh-ost` 고려
- **페일오버 가정 설계** — 커넥션이 끊기는 순간이 반드시 온다. **재시도·커넥션 재초기화** 로직 필수

## 관련 문서

- [필수 파라미터 그룹 설정.md](필수%20%20파라미터%20그룹%20설정.md)
- [RDS 로그 그룹.md](RDS%20로그%20그룹.md)
- [RDS 장애 대응.md](RDS%20장애%20대응.md)
- [AuroraEstimatedSharedMemoryBytes.md](AuroraEstimatedSharedMemoryBytes.md)
