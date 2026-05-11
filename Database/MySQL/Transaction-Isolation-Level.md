# Transaction Isolation Level

> 최종 업데이트: 2026-04-06 | MySQL 8.0 / InnoDB 기준

## 개념

동시에 여러 트랜잭션이 실행될 때, **서로의 작업을 얼마나 볼 수 있는지** 결정하는 설정이다.

- 은행 창구에 비유하면, 내가 송금 처리 중일 때 옆 창구 직원이 내 작업 중간 상태를 볼 수 있느냐 없느냐를 정하는 규칙
- **SQL-92 표준**에서 4가지 격리 수준을 정의했고, MySQL을 포함한 대부분의 RDBMS가 이를 따름
- `transaction_isolation`은 **MySQL 자체의 시스템 변수**이며, Aurora MySQL 파라미터 그룹에서 보이는 것도 이 변수를 그대로 노출한 것 (AWS가 만든 설정이 아님)
- MySQL 5.7.20 이전에는 `tx_isolation`이라는 이름이었으나, 이후 `transaction_isolation`으로 변경 (`tx_isolation`은 deprecated)

```
격리 수준 ↑  ──────────────────────────────────────→  격리 수준 ↓
READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE
  동시성 높음                                            동시성 낮음
  정합성 낮음                                            정합성 높음
```

## 읽기 이상 현상

격리 수준을 이해하려면 먼저 어떤 문제가 발생하는지 알아야 한다.

| 현상 | 설명 | 비유 |
|---|---|---|
| **Dirty Read** | 커밋되지 않은 데이터를 읽음 | 아직 결재 안 된 서류를 미리 가져감 |
| **Non-Repeatable Read** | 같은 행을 두 번 읽었는데 값이 달라짐 | 같은 페이지를 다시 펼쳤더니 내용이 바뀌어 있음 |
| **Phantom Read** | 같은 조건으로 조회했는데 행 수가 달라짐 | 명단을 다시 세었더니 사람이 늘어나 있음 |

```
Dirty Read         : 트랜잭션 A가 아직 COMMIT 안 한 값을 B가 읽음 → A가 ROLLBACK하면 유령 데이터
Non-Repeatable Read: B가 같은 행을 두 번 SELECT → 그 사이 A가 UPDATE+COMMIT → 값이 달라짐
Phantom Read       : B가 같은 WHERE 조건으로 두 번 SELECT → 그 사이 A가 INSERT+COMMIT → 행 수가 달라짐
```

## 4가지 격리 수준

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read | 기본 사용 |
|---|---|---|---|---|
| **READ UNCOMMITTED** | O | O | O | 거의 안 씀 |
| **READ COMMITTED** | X | O | O | Oracle, PostgreSQL |
| **REPEATABLE READ** | X | X | △ | **MySQL/Aurora 기본값** |
| **SERIALIZABLE** | X | X | X | 특수 경우만 |

> △ = InnoDB에서는 일반 SELECT는 MVCC로 방지, Locking Read 혼용 시 발생 가능 (아래 상세 설명)

### READ UNCOMMITTED

가장 낮은 격리 수준. 다른 트랜잭션이 아직 커밋하지 않은 변경 사항도 읽을 수 있다.

커밋 전에 롤백되면 존재하지 않는 데이터를 읽은 셈이 되는데, 이를 **Dirty Read**라고 한다. 실무에서는 거의 사용하지 않는다.

```
트랜잭션 A: UPDATE account SET balance = 0 WHERE id = 1;  (아직 COMMIT 안 함)
트랜잭션 B: SELECT balance FROM account WHERE id = 1;     → 0 (커밋 안 된 값을 읽음)
트랜잭션 A: ROLLBACK;                                      → 실제로는 변경 취소됨
```

### READ COMMITTED

커밋된 데이터만 읽을 수 있어 Dirty Read는 방지된다. **Oracle, PostgreSQL의 기본 격리 수준**이다.

하지만 같은 트랜잭션 안에서 같은 쿼리를 두 번 실행했을 때, 그 사이에 다른 트랜잭션이 커밋하면 결과가 달라질 수 있다. 이를 **Non-Repeatable Read**라고 한다.

```
트랜잭션 B: SELECT balance FROM account WHERE id = 1;     → 1000
트랜잭션 A: UPDATE account SET balance = 500 WHERE id = 1; COMMIT;
트랜잭션 B: SELECT balance FROM account WHERE id = 1;     → 500 (같은 쿼리인데 결과가 다름)
```

### REPEATABLE READ

**MySQL과 Aurora MySQL의 기본값**이다.

트랜잭션이 시작된 시점의 스냅샷을 기준으로 데이터를 읽는다. 같은 쿼리를 여러 번 실행해도 항상 같은 결과를 보장한다. 사진을 찍어두고 그 사진만 보는 것과 같다.

```
트랜잭션 B: SELECT balance FROM account WHERE id = 1;     → 1000
트랜잭션 A: UPDATE account SET balance = 500 WHERE id = 1; COMMIT;
트랜잭션 B: SELECT balance FROM account WHERE id = 1;     → 1000 (시작 시점 스냅샷 유지)
```

이것이 가능한 이유는 InnoDB의 **MVCC** 덕분이다 (아래 상세 설명).

### SERIALIZABLE

가장 높은 격리 수준. 모든 SELECT가 암묵적으로 `SELECT ... FOR SHARE`로 동작하여 읽기에도 공유 락이 걸린다.

동시성이 크게 떨어지므로 특수한 경우(금융 정산 등 절대적 정합성이 필요한 경우)가 아니면 사용하지 않는다.

## MVCC (Multi-Version Concurrency Control)

InnoDB가 격리 수준을 구현하는 핵심 메커니즘이다.

데이터를 수정할 때 기존 값을 덮어쓰지 않고, **Undo Log에 이전 버전을 보관**해두는 방식이다. 도서관 책에 비유하면, 누군가 책 내용을 수정하더라도 이전 판본을 서고에 보관해두는 것과 같다.

```
                    ┌─────────────┐
                    │ 현재 데이터   │  balance = 500 (트랜잭션 A가 변경)
                    └──────┬──────┘
                           │ roll pointer
                    ┌──────▼──────┐
                    │  Undo Log   │  balance = 1000 (이전 버전)
                    └──────┬──────┘
                           │ roll pointer
                    ┌──────▼──────┐
                    │  Undo Log   │  balance = 800 (더 이전 버전)
                    └─────────────┘
```

- 각 트랜잭션은 시작 시점에 **Read View(스냅샷)**를 생성하고, 자기보다 나중에 시작된 트랜잭션의 변경은 보이지 않음
- 읽기 작업에 락을 걸지 않기 때문에, 읽기와 쓰기가 서로 블로킹하지 않음 → 동시성 확보
- Undo Log의 이전 버전들은 더 이상 참조하는 트랜잭션이 없으면 **Purge 스레드**가 정리

```
시점 1: 트랜잭션 B 시작 → Read View 생성 (이 순간의 스냅샷을 기억)
시점 2: 트랜잭션 A가 balance를 1000 → 500으로 변경 후 COMMIT
         → 현재 데이터: 500 / Undo Log: 1000 (이전 버전 보관)
시점 3: 트랜잭션 B가 SELECT → Undo Log의 1000을 읽음 (자기 스냅샷 기준)
```

**격리 수준별 MVCC 동작 차이:**

| 격리 수준 | Read View 생성 시점 | 결과 |
|---|---|---|
| READ COMMITTED | **매 SELECT마다** 새로 생성 | 항상 최신 커밋 데이터를 읽음 |
| REPEATABLE READ | **트랜잭션 첫 SELECT 시** 1회 생성 | 트랜잭션 내내 같은 스냅샷을 읽음 |

> READ UNCOMMITTED는 스냅샷을 사용하지 않고 현재 데이터를 직접 읽고, SERIALIZABLE은 락 기반으로 동작한다.

## Locking Read

일반 SELECT는 스냅샷만 읽고 락을 걸지 않는다(**Consistent Read**). 반면 Locking Read는 조회하면서 해당 행에 락을 거는 SELECT다. "이 데이터 내가 쓸 거니까 건드리지 마" 라고 예약을 걸어두는 것과 같다.

| 구문 | 락 종류 | 의미 |
|---|---|---|
| `SELECT ... FOR UPDATE` | 배타적 락 (X Lock) | 다른 트랜잭션의 읽기(FOR UPDATE/SHARE)/수정/삭제 차단 |
| `SELECT ... FOR SHARE` | 공유 락 (S Lock) | 다른 트랜잭션도 읽기는 가능, 수정/삭제는 차단 |

주로 **"조회 후 그 값을 기반으로 업데이트"** 할 때 사용한다. 락 없이 하면 조회와 업데이트 사이에 다른 트랜잭션이 끼어들 수 있기 때문이다.

```sql
-- 예: 잔액 차감 — FOR UPDATE 없으면 두 트랜잭션이 같은 잔액을 읽고 각각 차감할 수 있음
BEGIN;
SELECT balance FROM account WHERE id = 1 FOR UPDATE;  -- 1000, 락 걸림
UPDATE account SET balance = balance - 300 WHERE id = 1;
COMMIT;  -- 락 해제
```

**Locking Read는 스냅샷이 아닌 현재 데이터를 읽는다.** 이 차이가 REPEATABLE READ에서 Phantom Read가 발생하는 원인이 된다.

## InnoDB의 Phantom Read 방지

일반 SELECT는 과거 사진(스냅샷)을 보는 것이고, FOR UPDATE는 지금 현재 실물을 보는 것이다.

```
                       일반 SELECT          Locking Read (FOR UPDATE)
읽는 대상              MVCC 스냅샷           현재 실제 데이터
락                     없음                  행 락 + Gap Lock
Phantom Read           발생 안 함            Gap Lock이 INSERT를 차단
```

- **일반 SELECT (Consistent Read)**: MVCC 스냅샷을 읽으므로 사진만 계속 보는 것 → Phantom Read 발생하지 않음
- **Locking Read (FOR UPDATE / FOR SHARE)**: 실물을 직접 보는 대신, **Gap Lock**으로 "이 범위에 아무도 끼어들지 마" 하고 빈 공간까지 잠가서 다른 트랜잭션의 INSERT 자체를 차단 → Phantom Read 방지
- **일반 SELECT 먼저 → 이후 Locking Read를 섞어 쓰는 경우**: 일반 SELECT 시점에는 Gap Lock이 안 걸리기 때문에 그 사이에 다른 트랜잭션의 INSERT가 들어올 수 있고, 이후 FOR UPDATE로 실물을 보면 "사진이랑 다르네?" → Phantom Read 발생

```
트랜잭션 B: SELECT * FROM account WHERE balance > 500;                → 3건 (스냅샷, 락 없음)
트랜잭션 A: INSERT INTO account (balance) VALUES (700); COMMIT;       → Gap Lock 없으므로 성공
트랜잭션 B: SELECT * FROM account WHERE balance > 500;                → 3건 (같은 스냅샷)
트랜잭션 B: SELECT * FROM account WHERE balance > 500 FOR UPDATE;     → 4건 (현재 실물, Phantom!)
```

## 실무 선택 가이드

| 상황 | 권장 격리 수준 | 이유 |
|---|---|---|
| 일반적인 웹 애플리케이션 | **REPEATABLE READ** (기본값) | MySQL 기본값이며 대부분의 시나리오를 안전하게 처리 |
| Oracle에서 마이그레이션 | READ COMMITTED | Oracle 기본값과 동일하게 맞춰 동작 차이 최소화 |
| 대량 리포트/통계 쿼리 | READ COMMITTED | 긴 트랜잭션에서 스냅샷 유지 시 Undo Log 증가 방지 |
| 금융 정산, 절대적 정합성 | SERIALIZABLE | 완전한 직렬화 보장 (성능 희생) |

> 장기 트랜잭션 + REPEATABLE READ 조합은 주의가 필요하다. Read View가 트랜잭션 시작 시점에 고정되므로, 오래 열린 트랜잭션은 Undo Log가 정리되지 않아 **Undo tablespace 비대화**를 유발할 수 있다.

## Spring에서의 설정

Spring `@Transactional`에서 격리 수준을 지정할 수 있다. 지정하지 않으면 DB의 기본값을 따른다.

```java
// DB 기본값 사용 (MySQL이면 REPEATABLE READ)
@Transactional
public void transfer() { ... }

// 특정 격리 수준 지정
@Transactional(isolation = Isolation.READ_COMMITTED)
public void generateReport() { ... }
```

| Spring Isolation | MySQL 매핑 |
|---|---|
| `Isolation.DEFAULT` | DB 기본값 (REPEATABLE READ) |
| `Isolation.READ_UNCOMMITTED` | READ UNCOMMITTED |
| `Isolation.READ_COMMITTED` | READ COMMITTED |
| `Isolation.REPEATABLE_READ` | REPEATABLE READ |
| `Isolation.SERIALIZABLE` | SERIALIZABLE |

> Spring에서 격리 수준을 지정하면, 해당 커넥션에 `SET SESSION transaction_isolation`이 실행된다. 트랜잭션 종료 후 커넥션 풀에 반환될 때 원래 값으로 복원된다.

## 설정 변경

### 세션 단위

전체 서버 설정을 바꾸지 않고, 특정 세션에서만 격리 수준을 변경할 수 있다.

```sql
-- 현재 세션만 변경
SET SESSION transaction_isolation = 'READ-COMMITTED';

-- 다음 트랜잭션 1회만 변경
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### 글로벌

서버 전체의 기본값을 변경한다. 이미 연결된 세션에는 영향 없고, 이후 새 연결부터 적용된다.

```sql
SET GLOBAL transaction_isolation = 'READ-COMMITTED';
```

### Aurora MySQL 파라미터 그룹

Aurora MySQL 파라미터 그룹에서 `transaction_isolation`을 변경하면 클러스터/인스턴스 전체의 기본 격리 수준이 바뀐다.

- **DB 클러스터 파라미터 그룹**: Writer + Reader 전체에 적용
- **DB 인스턴스 파라미터 그룹**: 특정 인스턴스에만 적용 (클러스터 설정보다 우선)
- dynamic 파라미터이므로 재부팅 없이 적용 가능

## 확인 방법

```sql
-- 현재 세션의 격리 수준
SELECT @@transaction_isolation;

-- 글로벌 기본값
SELECT @@global.transaction_isolation;

-- 현재 실행 중인 트랜잭션 확인
SELECT * FROM information_schema.INNODB_TRX;
```
