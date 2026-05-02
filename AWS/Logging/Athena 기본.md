# Amazon Athena

> 최종 업데이트: 2026-04-09 | AWS 공식 문서 기준

## 개념

Amazon Athena는 **Amazon S3에 저장된 데이터를 표준 SQL로 직접 분석할 수 있는 서버리스 인터랙티브 쿼리 서비스**이다.

쉽게 말하면, 데이터베이스 서버를 따로 구축하지 않고도 S3에 쌓여 있는 로그 파일이나 데이터를 SQL 한 줄로 바로 조회할 수 있는 서비스이다. 마치 S3를 거대한 데이터베이스처럼 사용하는 것과 같다.

- 별도의 인프라 설정/관리 불필요
- 쿼리한 만큼만 비용 지불 (종량제)
- SQL에 익숙하다면 바로 사용 가능

---

## 쿼리 엔진

Athena의 쿼리 엔진은 오픈소스 분산 SQL 엔진인 **Trino**(구 PrestoSQL)와 **Presto**를 기반으로 한다.

| 엔진 버전 | 기반 기술 | 비고 |
|-----------|----------|------|
| Athena v1 | Presto 0.172 | 최초 버전 (지원 종료) |
| Athena v2 | Presto 0.217 | 2020년 출시 |
| Athena v3 | Trino 기반 | 2022년 출시, 현재 권장 버전 |

> Presto에서 포크된 **Trino** 프로젝트를 기반으로 발전하면서, v3부터는 Trino 커뮤니티의 개선사항이 지속적으로 통합(CI)되는 구조이다.

### Apache Spark 지원

Athena는 SQL 엔진 외에도 **Apache Spark**을 지원한다. Python이나 Spark API를 사용한 데이터 분석이 가능하며, Notebook 인터페이스를 제공한다.

---

## 주요 특징

| 특징 | 설명 |
|------|------|
| **서버리스** | 인프라 프로비저닝/관리 불필요. AWS가 리소스를 자동 관리 |
| **온디맨드** | 쿼리 실행 시에만 리소스 사용, 유휴 비용 없음 |
| **자동 스케일링** | 쿼리를 병렬로 실행하여 대용량 데이터도 빠르게 처리 |
| **표준 SQL** | ANSI SQL 지원 (JOIN, 윈도우 함수, 배열 등) |
| **스키마-온-리드** | 데이터를 이동하지 않고 S3 원본 위치에서 직접 읽음 |
| **즉시 사용** | 테이블 정의 후 바로 쿼리 가능, ETL 파이프라인 불필요 |

---

## 데이터 소스

### 기본 데이터 소스 - Amazon S3

Athena의 주요 데이터 소스는 **Amazon S3**이다. S3에 저장된 파일의 위치를 지정하고 스키마를 정의하면 바로 쿼리할 수 있다.

> 물리적 테이블을 생성하는 것이 아니라, Athena가 데이터를 어떻게 해석할지를 정의하는 **스키마-온-리드(Schema-on-Read)** 방식이다.

### Federated Query를 통한 외부 데이터 소스

사전 구축된 30개 이상의 커넥터를 통해 다양한 데이터 소스를 지원한다.

| 분류 | 지원 소스 |
|------|----------|
| **AWS 서비스** | DynamoDB, RDS, Redshift, CloudWatch Logs, DocumentDB |
| **관계형 DB** | MySQL, PostgreSQL (JDBC) |
| **클라우드** | Google BigQuery, Google Cloud Storage, Azure Synapse, Azure Data Lake Storage, Snowflake |
| **기타** | Redis, SAP Hana, 커스텀 커넥터 |

---

## 지원 데이터 포맷

| 포맷 | 유형 | 특징 |
|------|------|------|
| **CSV / TSV** | 행 기반 | 범용적, 사람이 읽기 쉬움. 비효율적 스캔 |
| **JSON** | 행 기반 | 중첩 구조 지원. 비효율적 스캔 |
| **Parquet** | 열(컬럼) 기반 | 분석 워크로드에 최적. 압축률 높음. **권장 포맷** |
| **ORC** | 열(컬럼) 기반 | Hive 생태계에 최적화. 높은 압축률 |
| **Avro** | 행 기반 | 스키마 진화(evolution) 지원. 직렬화에 강점 |
| **Apache Iceberg** | 테이블 포맷 | ACID 트랜잭션, 시간 여행(Time Travel) 지원 |

> 열 기반 포맷(Parquet, ORC)을 사용하면 필요한 컬럼만 읽으므로, CSV/JSON 대비 **I/O를 80~90% 절감**할 수 있다.

---

## 비용 구조

Athena는 두 가지 가격 모델을 제공한다.

### 1. 스캔 기반 과금 (기본)

| 항목 | 가격 |
|------|------|
| **SQL 쿼리** | 스캔된 데이터 **TB당 $5** |
| **최소 과금 단위** | 쿼리당 10 MB |
| **DDL 쿼리** | `CREATE TABLE`, `ALTER TABLE` 등은 **무료** |
| **취소된 쿼리** | 취소 시점까지 스캔된 데이터량에 대해 과금 |
| **Apache Spark** | DPU-시간당 $0.35 |

> 마치 수도 요금처럼, 쿼리가 실제로 읽은 데이터량에 비례하여 비용이 발생한다. 데이터를 적게 읽을수록 비용이 줄어든다.

### 2. 용량 예약 기반 과금

| 항목 | 가격 |
|------|------|
| **DPU당 시간당** | $0.30 |
| **최소 예약 단위** | 4 DPU (기존 24 DPU에서 축소) |
| **최소 예약 시간** | 1분 (기존 60분에서 축소) |

용량 예약은 동시 쿼리가 많거나 비용을 예측 가능하게 관리하고 싶을 때 적합하다.

### 비용 절감 방법

- **Parquet/ORC** 등 컬럼나 포맷 사용 → 최대 **75% 절감**
- **데이터 압축** (Snappy, Zstd, Gzip) → 스캔 데이터량 감소
- **파티셔닝** → 필요한 파티션만 스캔
- **특정 컬럼만 SELECT** → `SELECT *` 지양

---

## 성능 최적화

### 1. 파티셔닝

데이터를 날짜, 리전 등 자주 필터링하는 기준으로 S3 경로를 나누는 것이다. 마치 서류를 월별 폴더로 정리해두면 특정 월의 서류만 꺼내 볼 수 있는 것과 같다.

```
s3://my-bucket/logs/year=2026/month=04/day=09/
```

- 쿼리 시 `WHERE year=2026 AND month=04`로 필요한 파티션만 스캔
- 파티션당 적정 크기: **100 MB ~ 1 GB**

### 2. 컬럼나(열 기반) 포맷 사용

| 포맷 | 추천 용도 |
|------|----------|
| **Parquet** | 범용 분석 워크로드 (가장 추천) |
| **ORC** | Hive 기반 워크로드 |

열 기반 포맷은 쿼리에 필요한 컬럼만 읽으므로 불필요한 I/O를 크게 줄인다.

### 3. 압축

| 압축 형식 | 특징 |
|----------|------|
| **Snappy** | 빠른 압축/해제, Parquet 기본 코덱 |
| **Zstd** | 압축률과 속도의 균형이 좋음 |
| **Gzip** | 높은 압축률, 해제 속도 다소 느림 |
| **LZ4** | 매우 빠른 해제, Parquet/ORC 읽기 지원 |

> 과금은 **압축된 상태의 데이터 크기** 기준이므로, 압축만 해도 비용이 줄어든다.

### 4. 파일 크기 최적화

| 상태 | 문제 | 권장 |
|------|------|------|
| 너무 작은 파일 (< 64 MB) | 메타데이터 오버헤드 증가 | 파일 병합 |
| 너무 큰 파일 (> 1 GB) | 병렬 처리 제한 | 파일 분할 |
| **적정 크기** | - | **약 128 MB** |

### 5. 쿼리 최적화 팁

- `SELECT *` 대신 **필요한 컬럼만 지정**
- `WHERE` 절에 **파티션 키를 포함**
- `LIMIT`을 활용하여 결과 제한
- `ORDER BY`를 반드시 필요한 경우에만 사용

---

## AWS Glue Data Catalog과의 관계

```
┌─────────────────────────────────────────────┐
│           AWS Glue Data Catalog             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Database A│  │Database B│  │Database C│  │
│  │ Table 1  │  │ Table 1  │  │ Table 1  │  │
│  │ Table 2  │  │ Table 2  │  │ Table 2  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────┬──────────────────────────┘
                   │ 메타데이터 참조
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Athena       Redshift    EMR
                Spectrum
```

- **Glue Data Catalog**은 Athena의 **중앙 메타데이터 저장소** 역할을 한다
- 테이블명, 컬럼명, 데이터 타입, S3 위치 정보 등 **스키마 정보를 저장**
- Athena에서 `CREATE TABLE`을 실행하면 Glue Data Catalog에 등록됨
- 반대로, **Glue Crawler**로 S3 데이터를 자동 탐색하여 스키마를 생성하면 Athena에서 바로 조회 가능
- Redshift Spectrum, EMR 등 다른 서비스와도 같은 카탈로그를 공유하여 **일관된 메타데이터 관리** 가능

---

## 다른 AWS 서비스와의 연동

| AWS 서비스 | 연동 방식 |
|-----------|----------|
| **Amazon S3** | 기본 데이터 저장소. 쿼리 대상 데이터 및 결과 저장 |
| **AWS Glue** | 메타데이터 카탈로그, Crawler로 자동 스키마 탐색, ETL 작업 |
| **Amazon QuickSight** | Athena를 데이터 소스로 연결하여 대시보드/시각화 |
| **AWS Lambda** | Federated Query 커넥터 실행, 쿼리 결과 후처리 자동화 |
| **AWS CloudTrail** | CloudTrail 로그를 Athena로 직접 쿼리하여 보안 감사 |
| **Amazon CloudWatch** | Athena 쿼리 메트릭 모니터링, 워크그룹 알람 설정 |
| **AWS IAM** | 쿼리 접근 권한 제어, 워크그룹별 권한 관리 |
| **AWS Lake Formation** | 세밀한 데이터 접근 제어 (행/열 수준 보안) |
| **Amazon Redshift** | Federated Query로 Redshift 데이터 직접 조회 |
| **AWS Step Functions** | Athena 쿼리를 워크플로에 포함하여 파이프라인 구성 |

---

## Workgroup (워크그룹)

Workgroup은 Athena에서 **쿼리를 논리적으로 분리하고 관리하는 단위**이다. 마치 회사에서 부서별로 예산과 권한을 분리하는 것과 같다.

### 주요 기능

| 기능 | 설명 |
|------|------|
| **쿼리 분리** | 팀/용도별로 쿼리를 분리 관리 (예: 분석팀 vs 자동화 스크립트) |
| **접근 제어** | IAM 정책으로 워크그룹별 접근 권한 제어 |
| **비용 추적** | 워크그룹별 비용 태깅 → Cost Explorer에서 팀별 비용 확인 |
| **데이터 사용 제한** | 쿼리당/워크그룹당 스캔 데이터 상한 설정 |
| **설정 강제** | 쿼리 결과 S3 위치, 암호화 설정 등을 워크그룹 수준에서 강제 |
| **쿼리 이력** | 워크그룹별 독립적인 쿼리 히스토리 및 저장된 쿼리 관리 |

### 사용 예시

```
워크그룹 구성 예:
├── primary (기본)
├── analytics-team      → 분석팀 전용, 일일 100GB 스캔 제한
├── data-engineering    → 데이터 엔지니어링, CTAS 작업용
└── automated-reports   → 자동 리포트 생성, 별도 S3 결과 경로
```

### 제한

- 리전당 최대 **1,000개** 워크그룹
- 워크그룹당 최대 **1,000개** Prepared Statements
- 워크그룹당 최대 **50개** 태그

---

## Federated Query (연합 쿼리)

S3 외의 다양한 데이터 소스를 **하나의 SQL로 통합 조회**할 수 있는 기능이다.

### 동작 원리

```
사용자 → Athena 쿼리 제출
              │
              ▼
       Athena 쿼리 엔진
              │ 커넥터 호출
              ▼
       AWS Lambda (Data Source Connector)
              │ 데이터 조회
              ▼
       외부 데이터 소스 (RDS, DynamoDB 등)
              │ Apache Arrow 포맷으로 반환
              ▼
       Athena에서 결과 집계 → 사용자
```

1. 쿼리 제출 시 Athena가 대상 데이터 소스의 **Lambda 커넥터**를 호출
2. Lambda가 외부 데이터 소스에서 데이터를 조회하고 **필터 푸시다운** 수행
3. 데이터를 **Apache Arrow** 포맷으로 Athena에 반환
4. Athena가 S3 데이터와 외부 데이터를 **조인/집계**하여 최종 결과 반환

### 사전 구축 커넥터

CloudWatch Logs, DynamoDB, DocumentDB, RDS, MySQL, PostgreSQL 등 다수의 커넥터를 AWS Serverless Application Repository에서 바로 배포 가능하다.

### 커스텀 커넥터

**Athena Query Federation SDK**를 사용하면 Java, Python, C++, Rust 등으로 자체 커넥터를 개발할 수 있다.

### 제한사항

- Athena Engine v2 이상 필요
- Federated 대상에 `INSERT INTO` 불가
- Lambda 실행 비용 별도 발생
- 대규모 데이터 처리 시 **Spill Bucket** (임시 데이터 저장용 S3) 필요

---

## CTAS (Create Table As Select)

**SELECT 쿼리 결과를 새로운 테이블로 생성**하는 기능이다. ETL 파이프라인 없이 데이터를 변환하고 최적화된 포맷으로 저장할 수 있다.

### 주요 사용 사례

```sql
-- 1. CSV를 Parquet으로 변환
CREATE TABLE optimized_logs
WITH (
  format = 'PARQUET',
  external_location = 's3://my-bucket/optimized/',
  partitioned_by = ARRAY['year', 'month']
) AS
SELECT col1, col2, year, month
FROM raw_csv_logs
WHERE year = '2026';

-- 2. 대규모 테이블에서 필요한 데이터만 추출
CREATE TABLE daily_summary
WITH (format = 'PARQUET')
AS
SELECT date, COUNT(*) as cnt, SUM(amount) as total
FROM transactions
GROUP BY date;
```

### 특징

| 항목 | 설명 |
|------|------|
| **지원 포맷** | PARQUET, ORC, AVRO, JSON, TEXTFILE (기본: Parquet) |
| **파티셔닝** | 결과 데이터를 파티셔닝하여 저장 가능 |
| **버킷팅** | 결과 데이터를 버킷팅하여 저장 가능 |
| **카탈로그 자동 등록** | 생성된 테이블이 Glue Data Catalog에 자동 등록 |
| **Iceberg 지원** | Apache Iceberg 테이블로 생성 가능 |
| **S3 Tables 지원** | Amazon S3 Tables로의 변환 지원 (2025년 추가) |

### 제한사항

- CTAS로 생성 가능한 최대 파티션 수: **100개**
- 쿼리 결과 위치에 이미 데이터가 있으면 실패

---

## Athena Engine v2 vs v3 비교

| 항목 | Engine v2 | Engine v3 |
|------|-----------|-----------|
| **기반 엔진** | Presto 0.217 | Trino 기반 |
| **성능** | 기준 | v2 대비 **약 20% 향상** |
| **새 SQL 함수** | - | 50개 이상 추가 (`listagg`, `soundex`, `concat_ws` 등) |
| **새 기능** | - | 30개 이상 (`MATCH_RECOGNIZE`, `INTERSECT ALL`, `EXCEPT ALL` 등) |
| **압축 지원** | 기본 | LZ4, ZSTD 추가 지원 |
| **지리공간** | 기본 | SphericalGeography 네이티브 지원 |
| **업데이트 방식** | 수동 업그레이드 | Trino 커뮤니티와 **지속적 통합(CI)** |

### v3 주요 Breaking Changes

주의가 필요한 호환성 변경사항이다.

| 변경 항목 | v2 | v3 |
|----------|-----|-----|
| `CONCAT()` | 단일 인자 허용 | **최소 2개 인자 필수** |
| `log()` 파라미터 순서 | `log(value, base)` | `log(base, value)` |
| `uuid()` 반환 타입 | VARCHAR | **UUID 타입** (CAST 필요) |
| Iceberg 시간 여행 | `SYSTEM_TIME AS OF` | `TIMESTAMP AS OF` |
| 중첩 컬럼 GROUP BY | `user.name` | `"user"."name"` (이중 따옴표 필수) |
| `approx_percentile()` | qdigest 기반 | **tdigest 기반** (결과값 다를 수 있음) |

---

## 주요 사용 사례

| 사례 | 설명 |
|------|------|
| **로그 분석** | CloudTrail, VPC Flow Log, ALB/ELB 액세스 로그 분석 |
| **보안 감사** | IAM 활동, API 호출 이력 조사 |
| **데이터 레이크 쿼리** | S3 데이터 레이크에서 대용량 데이터 애드혹 분석 |
| **ETL / 데이터 변환** | CTAS를 활용한 포맷 변환 및 데이터 정제 |
| **BI / 리포팅** | QuickSight, Tableau 등과 연동한 대시보드 구성 |
| **비용 분석** | AWS Cost and Usage Report(CUR) 분석 |
| **규정 준수** | 감사 로그 분석을 통한 컴플라이언스 모니터링 |

---

## 제한사항 / 단점

### 서비스 쿼터

| 항목 | 제한 |
|------|------|
| DML 쿼리 타임아웃 | 기본 30분 (최대 240분까지 증가 요청 가능) |
| 쿼리 문자열 최대 길이 | 262,144 바이트 (조정 불가) |
| 단일 행/컬럼 최대 크기 | 32 MB (조정 불가) |
| 텍스트 파일 최대 라인 길이 | 200 MB |
| 단일 스캔 최대 파티션 수 | 1,000,000개 |
| CTAS 최대 파티션 수 | 100개 |
| 리전당 최대 워크그룹 수 | 1,000개 |
| `GROUPING SETS` 최대 슬라이스 | 2,048개 |
| 함수 최대 매개변수 수 | 127개 |

### 주요 단점

| 단점 | 설명 |
|------|------|
| **DML 미지원** | `UPDATE`, `DELETE` 문 미지원 (Iceberg 테이블은 제한적으로 지원) |
| **성능 변동** | 글로벌 공유 리소스 기반이므로 성능이 일정하지 않을 수 있음 |
| **트랜잭션 미지원** | 기본 테이블에서는 ACID 트랜잭션 미지원 (Iceberg 제외) |
| **실시간 처리 부적합** | 배치/애드혹 분석에 최적화. 밀리초 단위 응답이 필요한 경우 부적합 |
| **숨겨진 파일** | `_` 또는 `.`으로 시작하는 파일은 자동 무시 |
| **동시 쿼리 제한** | 동시 실행 가능한 쿼리 수에 쿼터 존재 (초과 시 `TooManyRequestsException`) |
| **결과 크기 제한** | 쿼리 결과가 매우 큰 경우 문제 발생 가능 |

---

## 쿼리 예시 참고 링크

- [CloudTrail 로그 쿼리 예시](https://docs.aws.amazon.com/ko_kr/athena/latest/ug/query-examples-cloudtrail-logs.html)
- [ALB 테이블 생성 쿼리](https://docs.aws.amazon.com/ko_kr/athena/latest/ug/create-alb-access-logs-table.html)
- [ALB 로그 쿼리 예제](https://docs.aws.amazon.com/ko_kr/athena/latest/ug/query-alb-access-logs-examples.html)
- [VPC Flow Log 테이블 생성 쿼리](https://docs.aws.amazon.com/ko_kr/athena/latest/ug/vpc-flow-logs-create-table-statement.html)
