# DB Charset과 인코딩

> 최종 업데이트: 2026-06-10 | MySQL 8.0, JDBC 8.x 기준

## 개념

DB도 결국 **파일 시스템에 바이트로 저장**한다. 어떤 인코딩 바이트로 저장할지를 결정하는 것이 **DB charset** 설정이다. 텍스트를 저장할 때 DB charset에 맞는 바이트로 변환해 디스크에 쓰고, 조회할 때 그 바이트를 다시 charset에 따라 해석해 반환한다.

> 비유: 창고(DB)에 물건(문자)을 보관하는 규칙. 한국식 분류법(EUC-KR)으로 입고된 물건을 일본식 분류법(Shift_JIS)으로 찾으려 하면 엉뚱한 물건이 나온다. 입고 규칙 = 조회 규칙이어야 한다.

한글이 깨지는 원인은 항상 하나다: **저장 시 인코딩 ≠ 조회 시 인코딩**.

## 배경/역사

초기 RDBMS(MySQL 3.x, Oracle 7 등)는 ASCII 중심으로 설계됐다. 한글·일본어 등 멀티바이트 문자 지원은 후속 추가였고, 기본 charset이 `latin1`(ISO-8859-1)이던 시절이 길었다. 이 시기에 구축된 시스템에서 한글 깨짐이 구조적으로 발생했다.

MySQL은 2002년(4.1)에 멀티바이트 지원을 강화하며 `utf8` charset을 도입했으나, 구현상 **최대 3바이트**만 지원하는 불완전한 UTF-8이었다. 4바이트 문자(이모지 등)를 완전히 지원하는 `utf8mb4`는 MySQL 5.5.3(2010)에서야 추가됐다.

## Java → JDBC → DB 전체 흐름

```
Java String "가" (내부: UTF-16)
      ↓  JDBC 드라이버
      ↓  characterEncoding 설정에 따라 바이트로 인코딩
네트워크 전송 (바이트)
      ↓  DB 서버 수신
      ↓  character_set_client 기준으로 해석
      ↓  character_set_connection 기준으로 내부 변환
      ↓  DB/테이블/컬럼 charset으로 저장
디스크 (바이트)
      ↓  조회 시 역순
Java String "가"
```

이 경로에서 charset이 하나라도 어긋나면 깨진다.

## MySQL charset 4개 레이어

MySQL은 charset 설정이 4개 레이어에 독립적으로 존재한다. 전부 일치해야 안전하다.

| 변수 | 의미 |
|------|------|
| `character_set_client` | 클라이언트(JDBC)가 보내는 바이트의 인코딩 |
| `character_set_connection` | 서버가 수신 후 내부 처리 시 사용하는 인코딩 |
| `character_set_database` | 해당 DB의 기본 인코딩 |
| `character_set_server` | 서버 전체 기본 인코딩 |

```sql
SHOW VARIABLES LIKE 'character_set%';
```

`character_set_client`와 `character_set_database`가 다르면, MySQL이 내부적으로 자동 변환을 시도한다. 변환 불가 문자가 있으면 `?`로 대체되거나 에러가 발생한다.

추가로 저장 단위별로도 charset을 **각각 독립적으로** 지정할 수 있다.

```
서버(character_set_server)
  └─ DB(CHARACTER SET)          ← 명시 안 하면 서버 상속
       └─ 테이블(CHARACTER SET) ← 명시 안 하면 DB 상속
            └─ 컬럼(CHARACTER SET) ← 명시 안 하면 테이블 상속, 실제 저장에 적용
```

상위 설정은 하위 설정의 **기본값**일 뿐이다. **실제 저장에 적용되는 charset은 컬럼 레벨**이다. 서버를 utf8mb4로 올려도 기존 컬럼이 utf8이면 이모지는 그 컬럼에서 여전히 잘린다.

같은 DB 안에서도 테이블·컬럼마다 charset이 다를 수 있다.

```sql
-- 실제로 이런 상황이 가능하다
CREATE TABLE mixed_table (
    id       BIGINT,
    name_kr  VARCHAR(100) CHARACTER SET utf8mb4,  -- 한글 + 이모지
    name_en  VARCHAR(100) CHARACTER SET latin1,   -- ASCII만 저장
    memo     TEXT         CHARACTER SET utf8       -- 레거시 컬럼
);
```

컬럼별 실제 charset 확인:

```sql
SELECT column_name, character_set_name, collation_name
FROM information_schema.COLUMNS
WHERE table_schema = 'mydb' AND table_name = 'mixed_table';
```

```
column_name | character_set_name | collation_name
------------|--------------------|-----------------------
name_kr     | utf8mb4            | utf8mb4_unicode_ci
name_en     | latin1             | latin1_swedish_ci
memo        | utf8               | utf8_general_ci
```

## Aurora MySQL

Aurora MySQL은 MySQL 엔진 기반이라 **charset 계층 구조가 동일**하다. 차이는 서버 레벨 설정을 my.cnf 대신 **파라미터 그룹(Parameter Group)**으로 관리한다는 점이다.

```
RDS/Aurora 파라미터 그룹
  character_set_server   = utf8mb4
  character_set_client   = utf8mb4
  collation_server       = utf8mb4_unicode_ci
```

파라미터 그룹 변경 후 DB 인스턴스 재시작이 필요한 항목(static parameter)과 즉시 적용되는 항목(dynamic parameter)이 나뉜다. `character_set_server`는 dynamic이라 재시작 없이 적용 가능하다.

세션 레벨에서 임시 변경:

```sql
-- 아래 한 줄이 client / connection / results 세 변수를 동시에 설정
SET NAMES utf8mb4;

-- 풀어쓰면
SET character_set_client     = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results    = utf8mb4;
```

`SET NAMES`는 현재 세션에만 적용되며, 연결이 끊기면 사라진다. JDBC에서 `characterEncoding=UTF-8`을 URL에 설정하면 연결마다 자동으로 `SET NAMES`에 해당하는 초기화를 수행한다.

## utf8 vs utf8mb3 vs utf8mb4 — MySQL의 함정

MySQL의 `utf8`은 진짜 UTF-8이 아니다. **최대 3바이트**만 지원하도록 구현된 MySQL 독자 방언이다.

MySQL 8.0.28부터 이 혼란을 해소하기 위해 `utf8`을 **`utf8mb3`으로 공식 rename**했다. `utf8` 별칭은 아직 동작하지만 deprecated 상태이며, `information_schema` 조회나 `SHOW VARIABLES` 결과에서는 `utf8mb3`으로 표시된다.

```
utf8  →  utf8mb3  (MySQL 8.0.28+, 이름만 바뀜. 내용 동일)
utf8mb4            (그대로 유지)
```

| charset | 최대 바이트 | 한글 | 이모지 | BMP 범위 외 문자 |
|---------|-----------|------|--------|----------------|
| `latin1` | 1바이트 | ❌ | ❌ | ❌ |
| `utf8` / `utf8mb3` | 3바이트 | ✅ | ❌ | ❌ |
| `utf8mb4` | 4바이트 | ✅ | ✅ | ✅ |

한글은 UTF-8에서 3바이트라 `utf8mb3`에서도 저장된다. 그러나 이모지(U+1F600 등)나 일부 한자는 4바이트라 `utf8mb3`에서 저장 시 **에러 없이 `?`로 잘리거나 빈 문자열로 저장**된다.

`information_schema`에서 컬럼 charset이 `utf8mb3`으로 조회된다면 구버전 `utf8` 그대로라는 의미이므로, `utf8mb4` 마이그레이션 대상이다.

```sql
-- utf8mb3 컬럼 확인
SELECT table_name, column_name, character_set_name
FROM information_schema.COLUMNS
WHERE table_schema = 'mydb'
  AND character_set_name = 'utf8mb3';

-- utf8mb4로 변환
ALTER TABLE 테이블명
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

신규 프로젝트는 무조건 `utf8mb4`를 써야 한다.

## 설정 방법

### DB / 테이블 생성

```sql
-- DB 생성
CREATE DATABASE mydb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 테이블 생성
CREATE TABLE users (
    id   BIGINT PRIMARY KEY,
    name VARCHAR(100)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 컬럼 단위 지정 (테이블 설정과 다를 때만)
ALTER TABLE users
  MODIFY name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### MySQL 서버 설정 (my.cnf)

```ini
[mysqld]
character-set-server  = utf8mb4
collation-server      = utf8mb4_unicode_ci

[client]
default-character-set = utf8mb4
```

### JDBC URL

```
jdbc:mysql://localhost:3306/mydb?characterEncoding=UTF-8&useUnicode=true
```

Spring Boot `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?characterEncoding=UTF-8&useUnicode=true
```

`characterEncoding=UTF-8`을 빠뜨리면 JDBC 드라이버의 기본값이 JVM `file.encoding`에 따라 결정되어, 환경에 따라 EUC-KR로 전송하는 경우가 있다.

## Collation — 정렬·비교 규칙

charset과 함께 **collation**(콜레이션) 설정도 중요하다. 같은 charset이라도 문자를 어떻게 비교·정렬하는지의 규칙이 다르다.

| collation | 특징 |
|-----------|------|
| `utf8mb4_unicode_ci` | 유니코드 표준 비교, 대소문자 구분 없음(CI) |
| `utf8mb4_general_ci` | 빠르지만 일부 유니코드 규칙 무시. 구버전 호환용 |
| `utf8mb4_bin` | 바이트 단위 비교, 대소문자 구분 |
| `utf8mb4_0900_ai_ci` | MySQL 8.0 기본. Unicode 9.0 기반, 악센트·대소문자 무시 |

`_ci` = case-insensitive (대소문자 무시), `_cs` = case-sensitive, `_bin` = binary.

```sql
-- 'A'와 'a'를 같다고 보는 경우 (ci)
SELECT * FROM users WHERE name = 'hello';  -- 'Hello', 'HELLO' 모두 매칭

-- 정확히 구분해야 하면 bin 또는 cs 사용
SELECT * FROM users WHERE BINARY name = 'hello';
```

## 레거시 마이그레이션 — utf8 → utf8mb4

서버만 utf8mb4로 올려도 기존 DB·테이블·컬럼은 그대로 utf8이 유지된다. 컬럼까지 전부 변환해야 한다.

```sql
-- DB 변경 (이후 생성되는 테이블의 기본값만 바뀜, 기존 테이블은 그대로)
ALTER DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ❌ 이것만 하면 기존 컬럼은 안 바뀜 (신규 컬럼 기본값만 변경)
ALTER TABLE users CHARACTER SET utf8mb4;

-- ✅ 기존 컬럼까지 일괄 변환 (CONVERT TO 사용)
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`CONVERT TO`는 MySQL 전용 문법으로, 테이블의 **모든 문자열 컬럼을 한번에 변환**한다. 단, 테이블 크기에 따라 잠금(Lock)이 발생할 수 있으므로 대용량 테이블은 온라인 DDL(`ALGORITHM=INPLACE`) 또는 pt-online-schema-change 사용을 검토해야 한다.

```sql
-- 온라인 DDL (MySQL 5.6+, InnoDB)
ALTER TABLE users
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  ALGORITHM=INPLACE, LOCK=NONE;
```

## 깨짐 시나리오 정리

| 상황 | 원인 | 결과 |
|------|------|------|
| JDBC `characterEncoding` 미설정 + JVM이 EUC-KR | JDBC가 EUC-KR 바이트 전송, DB는 UTF-8로 해석 | 한글 깨짐 |
| DB charset = `latin1` | latin1은 1바이트, 한글 멀티바이트 처리 불가 | `?` 또는 에러 |
| DB charset = `utf8` + 이모지 저장 시도 | utf8 최대 3바이트, 이모지 4바이트 초과 | 에러 없이 잘림 또는 에러 |
| 레거시 EUC-KR DB → UTF-8 마이그레이션 미완료 | 일부 테이블만 변환 | 테이블 간 조합 시 깨짐 |
| `character_set_client` ≠ `character_set_database` | MySQL 자동 변환 실패 | 변환 불가 문자 소실 |

## 진단 방법

```sql
-- 현재 세션 charset 전체 확인
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 실제 저장된 바이트 확인 ('가'의 UTF-8 바이트: 0xEAB080)
SELECT HEX(name) FROM users WHERE id = 1;

-- DB별 charset 확인
SELECT schema_name, default_character_set_name
FROM information_schema.SCHEMATA;

-- 테이블별 charset 확인
SELECT table_name, table_collation
FROM information_schema.TABLES
WHERE table_schema = 'mydb';
```

상세 확인 쿼리는 [MySQL/Charset-확인.md](MySQL/Charset-확인.md) 참고.

## 관련 문서

- [CS-이론/Character-Encoding.md](../CS-이론/Character-Encoding.md) — 인코딩·디코딩 개념, CCS/CES, UTF-8/16, Mojibake
- [CS-이론/한글-인코딩.md](../CS-이론/한글-인코딩.md) — EUC-KR, CP949, 한글 인코딩 역사
- [MySQL/Charset-확인.md](MySQL/Charset-확인.md) — MySQL charset 확인 쿼리 모음
- [timezone.md](timezone.md) — DB timezone 설정 (charset과 함께 자주 맞춰야 하는 설정)

## 출처

- MySQL 8.0 Reference Manual — Character Sets, Collations, Unicode
- JDBC 4.2 API Specification
