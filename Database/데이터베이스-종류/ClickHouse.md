# ClickHouse

> 최종 업데이트: 2026-09-17 | ClickHouse 일반 기준

## 개념

**ClickHouse**는 **수십억 건의 데이터를 SQL로 실시간 집계·분석하는 데 특화된 컬럼 지향(column-oriented) 데이터베이스**다. MySQL·PostgreSQL 같은 일반 RDBMS와 SQL을 쓴다는 점은 같지만, **데이터를 저장하는 방식 자체**가 다르다.

> 도서관에 비유하면 — 일반 RDBMS(**행 지향**)는 책 한 권(행 하나)을 통째로 한 서가에 꽂아둔다. "모든 책의 3번째 챕터만 모아서 보고 싶다"면 **책을 전부 꺼내서 3장만 골라내야** 한다. ClickHouse(**열 지향**)는 처음부터 **"모든 책의 3번째 챕터"만 따로 한 서가에 모아둔다.** 특정 컬럼(챕터)만 훑는 분석 쿼리라면 훨씬 빠르다.

## 배경/역사

**Alexey Milovidov**를 비롯한 Yandex(러시아 검색엔진 회사)의 개발자들이 2009년, **"집계 안 된 원본 데이터로도 실시간 분석 리포트를 만들 수 있을까"**라는 가설을 검증하려고 실험적으로 시작했다. 3년의 개발을 거쳐 2012년 Yandex의 웹 클릭스트림 분석 도구 **Yandex.Metrica**에 프로덕션으로 투입됐고, **2016년 오픈소스로 공개**됐다. "Click"이라는 이름도 이 클릭스트림 분석 이력에서 온 것으로 보인다(공식적으로 명시된 어원은 아님).

## "관계형 DB와 뭐가 다른가" — 흔한 오해 바로잡기

**ClickHouse도 SQL을 쓰고 테이블·컬럼·스키마가 있는 관계형 데이터베이스다.** "관계형이냐 아니냐"의 문제가 아니라, **저장 방식(행 지향 vs 열 지향)** 과 **설계 목적(OLTP vs OLAP)** 이 다른 것이다.

| | **MySQL/PostgreSQL** (OLTP) | **ClickHouse** (OLAP) |
|---|---|---|
| SQL/관계형 | 지원 | **지원** (관계형 맞음) |
| 저장 방식 | 행 지향(row-oriented) | **열 지향(column-oriented)** |
| 강점 쿼리 | 단일 행 조회/수정 (`WHERE id=?`) | **대량 집계** (`SUM`, `GROUP BY`, 수십억 행) |
| 인덱스 | B-Tree — 포인트 룩업에 최적 | **Sparse primary index** — 레인지 스캔에 최적 |
| 트랜잭션 | 완전한 ACID, row-level lock | 약한 트랜잭션 보장. `UPDATE`/`DELETE`는 즉시 반영이 아니라 **무거운 비동기 mutation** |
| 삽입 패턴 | 소량씩 빈번한 INSERT/UPDATE에 강함 | **대량 배치 INSERT**를 선호. 소량을 자주 넣으면 오히려 성능 저하 |
| JOIN | 정규화된 스키마 + 효율적 JOIN 최적화 | JOIN을 지원하지만 상대적으로 무거워, **비정규화된 넓은 테이블**을 선호 |

즉 "MySQL은 관계형, ClickHouse는 비관계형"이 아니라 — **둘 다 관계형이고, MySQL은 트랜잭션 처리(OLTP)에, ClickHouse는 분석·집계(OLAP)에 최적화된 것**이라고 이해해야 정확하다.

**같은 쿼리가 왜 다르게 동작하는지 예시로 보면:**

```sql
-- ① 단일 행 조회 — MySQL의 안마당
SELECT * FROM orders WHERE order_id = 12345;
-- MySQL: B-Tree 인덱스로 그 행 하나만 즉시 찾음 → 빠름
-- ClickHouse: 포인트 룩업용 인덱스가 아니라서 이런 패턴엔 상대적으로 느림

-- ② 대량 집계 — ClickHouse의 안마당
SELECT toDate(created_at) AS day, AVG(price)
FROM orders
WHERE created_at >= now() - INTERVAL 90 DAY
GROUP BY day;
-- ClickHouse: price·created_at 컬럼만 읽어 벡터화 연산 → 수십억 행도 수 초
-- MySQL: 조건에 안 걸리는 컬럼까지 포함해 행 전체를 읽어야 해 훨씬 느림
```

**①은 MySQL이, ②는 ClickHouse가 압도적으로 유리**하다는 것이 바로 "OLTP vs OLAP" 차이의 실체다.

## 왜 컬럼 지향이 분석에 유리한가

집계 쿼리(`SUM`, `AVG`, `COUNT`)를 돌릴 때 관련 없는 컬럼은 아예 디스크에서 읽지 않아도 되고, 같은 컬럼끼리는 값이 비슷해 **압축률도 훨씬 높다.** 여기에 **벡터화 실행(vectorized execution)** — 한 행씩이 아니라 컬럼 데이터를 CPU의 SIMD 명령으로 한 번에 뭉텅이로 처리하는 방식까지 더해져, 수십억 행 집계도 수 초 내에 끝나는 경우가 많다.

```
행 지향 저장:  [id1,name1,age1] [id2,name2,age2] [id3,name3,age3] ...
열 지향 저장:  [id1,id2,id3,...] [name1,name2,name3,...] [age1,age2,age3,...]
```

`age`의 평균만 구하면 열 지향은 `age` 컬럼 블록만 읽으면 끝나지만, 행 지향은 모든 행을 통째로 읽어야 한다.

## MergeTree 엔진 계열

ClickHouse의 기본 저장 엔진 계열이 **MergeTree**다. 데이터를 작은 파트(part) 단위로 먼저 쓰고, 백그라운드에서 이 파트들을 주기적으로 **병합(merge)**하며 정렬·최적화한다 — LSM-tree와 비슷한 사상이다. 이 구조 때문에 **대량 배치 삽입**은 파트 하나로 효율적으로 처리되지만, **소량씩 자주 삽입**하면 파트가 과도하게 늘어나 병합 부담이 커진다.

## 실전 도입 사례와 용도

Uber, Comcast, eBay, Cisco, CERN(LHCb 실험의 수십억 건 이벤트 메타데이터 관리) 등이 도입한 사례로 알려져 있다. 주 용도는:

- **실시간 분석 대시보드** — 사용자 행동, 매출 통계 등
- **로그·메트릭 분석** — 관측성(Observability) 스택의 백엔드로도 최근 많이 쓰임(대량의 로그를 저렴하게 오래 보관하며 집계 쿼리)
- **클릭스트림·이벤트 분석** — 태생이 이 용도

## 언제 안 맞나

**단일 행 조회·수정이 잦은 트랜잭션 처리(OLTP)에는 안 맞는다.** 컬럼 지향 구조라 "이 사용자 정보 하나를 수정해달라" 같은 작업은 오히려 비효율적이다. 그래서 보통 **MySQL/PostgreSQL(OLTP) + ClickHouse(OLAP)를 함께** 두고, 트랜잭션 데이터는 전자에 쌓았다가 분석용으로 후자에 옮겨 쓰는 구성이 흔하다.

## 정리

> **ClickHouse = Yandex가 만든 컬럼 지향 관계형 데이터베이스, OLAP(분석)에 최적화.** MySQL과 마찬가지로 SQL을 쓰는 관계형 DB이지만, 데이터를 행이 아니라 컬럼 단위로 저장·압축하고 벡터화 실행으로 처리해 수십억 행 규모의 집계 쿼리를 실시간에 가깝게 처리한다. "관계형이냐 아니냐"가 아니라 "OLTP냐 OLAP냐"가 MySQL과의 진짜 차이이며, 트랜잭션·단일 행 조회에는 부적합해 보통 OLTP DB와 병행해서 쓴다.

## 관련 문서

- [Neo4j](Neo4j.md) · [Vector Database](Vector-Database.md) — 각기 다른 특수 목적으로 일반 RDBMS와 구분되는 DB 종류
- [database-index](../데이터베이스-이론/database-index.md) — B-Tree 인덱스 등 행 지향 DB의 인덱스 구조와의 대조

## 출처

- [Wikipedia — ClickHouse](https://en.wikipedia.org/wiki/ClickHouse)
- [ClickHouse 공식 문서](https://clickhouse.com/docs)
