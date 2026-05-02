# SQLite

> 최종 업데이트: 2026-04-17 | SQLite 3.49.x 기준

## 개념

SQLite는 **서버 없이 동작하는 임베디드 관계형 데이터베이스**다. 별도의 DB 서버 프로세스가 필요 없고, 애플리케이션 안에 라이브러리로 포함되어 함수 호출만으로 SQL을 실행한다. 데이터베이스 전체가 **단일 `.db` 파일** 하나에 저장된다.

> 일반적인 DB(MySQL, PostgreSQL)가 "식당 주방에 주문을 넣고 음식을 받는 방식"이라면, SQLite는 "집에서 냉장고(파일)를 직접 열어 재료를 꺼내 쓰는 방식"이다. 주방장(서버)이 필요 없고, 냉장고 파일만 있으면 어디서든 쓸 수 있다.

- C 언어로 작성, 소스코드 약 15만 줄
- **ACID 트랜잭션** 완벽 지원
- **제로 설정**: 설치, 설정, 관리 불필요
- 세계에서 가장 널리 배포된 데이터베이스 (전 세계 **1조 개 이상**의 활성 DB 추정)

## 배경/역사

**D. Richard Hipp**이 2000년에 만들었다. 당시 **미 해군 구축함 유도 미사일 프로그램**에서 사용할 경량 DB가 필요했는데, 기존 Informix DB는 서버 관리가 필요했고 네트워크가 불안정한 함선 환경에서는 서버 없이 동작하는 DB가 요구되었다.

```
2000  SQLite 1.0 — 최초 릴리즈 (gdbm 기반 스토리지)
 ↓
2001  SQLite 2.0 — 자체 B-tree 스토리지 엔진으로 교체
 ↓
2004  SQLite 3.0 — UTF-8/16 지원, 동적 타입(Manifest Typing) 도입
 ↓
2010  WAL 모드 도입 (3.7.0) — 읽기/쓰기 동시 가능
 ↓
2018  UPSERT, 윈도우 함수 지원 (3.24~3.25)
 ↓
2022  STRICT 테이블 도입 (3.37) — 엄격한 타입 검사 가능
 ↓
2025  SQLite 3.49.x (현재)
```

## 아키텍처

```
┌─────────────────────────────────┐
│        애플리케이션 프로세스        │
│                                 │
│  ┌───────────────────────────┐  │
│  │     SQLite 라이브러리       │  │
│  │                           │  │
│  │  SQL Parser → Code Gen    │  │
│  │       → Virtual Machine   │  │
│  │       → B-Tree Module     │  │
│  │       → Pager Module      │  │
│  │       → OS Interface(VFS) │  │
│  └───────────┬───────────────┘  │
│              │                  │
└──────────────┼──────────────────┘
               │ 파일 I/O
               ▼
        ┌──────────┐
        │ .db 파일  │  ← 단일 파일에 모든 데이터 저장
        └──────────┘
```

- **프로세스 내 라이브러리**: 네트워크 통신, IPC 없이 함수 호출로 동작
- **단일 파일**: USB로 복사만 해도 DB 이동 가능 (크로스 플랫폼)
- **라이브러리 크기**: 약 600KB~1MB

### 잠금 방식

| 잠금 단계 | 설명 |
|---|---|
| UNLOCKED | 잠금 없음 |
| SHARED | 읽기 잠금 — 여러 프로세스가 동시 읽기 가능 |
| RESERVED | 쓰기 예약 — 아직 쓰지는 않지만 쓸 예정 |
| PENDING | 쓰기 대기 — 새로운 SHARED 잠금 차단 |
| EXCLUSIVE | 쓰기 잠금 — 한 번에 하나의 writer만 가능 |

## 다른 RDBMS와의 비교

| 항목 | SQLite | MySQL / PostgreSQL |
|---|---|---|
| 구조 | 임베디드 (라이브러리) | 클라이언트/서버 |
| 프로세스 | 없음 (앱 내 동작) | 별도 서버 데몬 필요 |
| 동시성 | 단일 writer | 다중 writer 지원 |
| 설치/운영 | 제로 설정 | 설치, 설정, 모니터링 필요 |
| 데이터 규모 | 소~중규모 (수 GB~수십 GB 적합) | 대규모 (TB 이상) |
| 네트워크 | 로컬 전용 | 원격 접속 지원 |
| 타입 시스템 | 동적 타입 (Type Affinity) | 엄격한 정적 타입 |
| 사용자 관리 | 없음 | GRANT/REVOKE 기반 권한 관리 |

> 핵심 차이: SQLite는 `fopen()`의 대체재에 가깝고, MySQL/PostgreSQL은 네트워크 서비스다.

## 장단점

### 장점

- **제로 설정**: 설치, 설정, 관리 없이 바로 사용
- **이식성**: 단일 파일이라 복사만으로 이동/백업 가능
- **경량**: 라이브러리 크기 약 600KB~1MB
- **빠른 읽기**: 네트워크 오버헤드가 없어 단순 읽기는 클라이언트/서버 DB보다 빠름
- **안정성**: 항공우주/군사 수준 테스트, 100% 브랜치 커버리지
- **퍼블릭 도메인**: 라이선스 제약 없음

### 단점

- **동시 쓰기 제한**: 한 번에 하나의 writer만 가능
- **네트워크 접근 불가**: 원격 클라이언트가 직접 접속 불가 (NFS 위에서 사용 금지)
- **대규모 부적합**: 수백 명 이상의 동시 쓰기 환경에는 맞지 않음
- **사용자/권한 관리 없음**: 앱 레벨에서 직접 구현 필요

## 주요 사용처

| 분야 | 예시 |
|---|---|
| 모바일 앱 | Android(기본 내장 DB), iOS(Core Data 백엔드) |
| 웹 브라우저 | Chrome, Firefox, Safari — 쿠키, 히스토리, localStorage |
| 데스크톱 앱 | Photoshop, iTunes, Skype, KakaoTalk |
| 개발 도구 | Claude Code (대화 기록/세션 관리) |
| IoT/임베디드 | 리소스 제한 환경의 로컬 데이터 저장 |
| 테스트 | 인메모리(`:memory:`) 모드로 빠른 통합 테스트 |
| 운영체제 | Windows, macOS, 대부분의 Linux 배포판에 기본 포함 |

## 타입 시스템 — Type Affinity

SQLite는 **동적 타입**이다. 컬럼이 아니라 **값(value) 자체에 타입**이 있다.

> MySQL에서 INTEGER 컬럼에 문자열을 넣으면 에러가 나지만, SQLite에서는 그냥 들어간다. 컬럼의 타입 선언은 "권장(affinity)"일 뿐 강제하지 않는다.

| Type Affinity | 설명 |
|---|---|
| `TEXT` | 문자열 |
| `NUMERIC` | 정수 또는 실수로 변환 시도, 안 되면 TEXT |
| `INTEGER` | 정수 |
| `REAL` | 부동소수점 |
| `BLOB` | 바이너리 데이터 |

**STRICT 테이블** (3.37+)로 엄격한 타입 검사가 가능하다:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER
) STRICT;
```

## ALTER TABLE 제한

| 지원 | 미지원 |
|---|---|
| `RENAME TABLE` | 컬럼 타입 변경 |
| `RENAME COLUMN` | 제약 조건 추가/삭제 |
| `ADD COLUMN` | 컬럼 순서 변경 |
| `DROP COLUMN` (3.35+) | |

미지원 작업의 우회 방법 (공식 권장 패턴):

```sql
-- 1. 새 테이블 생성
CREATE TABLE users_new (id INTEGER, name TEXT NOT NULL, age INTEGER);
-- 2. 데이터 복사
INSERT INTO users_new SELECT * FROM users;
-- 3. 기존 테이블 삭제
DROP TABLE users;
-- 4. 이름 변경
ALTER TABLE users_new RENAME TO users;
```

## WAL 모드 (Write-Ahead Logging)

기본 모드에서는 쓰기 중 읽기가 차단되지만, **WAL 모드에서는 읽기와 쓰기가 동시에 가능**하다.

```
기본 모드 (Rollback Journal)         WAL 모드
──────────────────────────          ──────────────────
쓰기 → 원본을 journal에 백업         쓰기 → 변경분을 WAL 파일에 추가
     → DB 파일 직접 수정                   → 나중에 원본에 반영(checkpoint)

읽기 vs 쓰기: 상호 차단              읽기 vs 쓰기: 동시 가능
```

> WAL은 "먼저 일지(로그)에 적고 나중에 본 장부에 반영"하는 방식이다. 덕분에 읽기가 쓰기를 기다리지 않아도 된다.

- 활성화: `PRAGMA journal_mode=WAL;`
- 파일 2개 추가: `.db-wal` (WAL 파일), `.db-shm` (공유 메모리)
- 여전히 **동시 여러 writer는 불가** (한 번에 하나의 쓰기만)
- **읽기 중심 워크로드에서 성능 크게 향상**

## Spring Boot 연동

### 의존성

```gradle
implementation 'org.xerial:sqlite-jdbc:3.49.1.0'
```

### 설정

```yaml
spring:
  datasource:
    url: jdbc:sqlite:./myapp.db       # 파일 기반
    # url: jdbc:sqlite::memory:       # 인메모리 (테스트용)
    driver-class-name: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update
```

### 주의사항

- **Hibernate Dialect**: `hibernate-community-dialects` 패키지의 `SQLiteDialect` 사용 (Hibernate 6.2+)
- **커넥션 풀**: HikariCP 사용 시 `maximumPoolSize=1` 권장 (단일 writer)
- **WAL 모드 권장**: 읽기/쓰기 경합 감소
- **SQLITE_BUSY 대비**: 재시도 로직 또는 `busy_timeout` 설정 필요
  ```
  jdbc:sqlite:./myapp.db?busy_timeout=5000
  ```
- **프로덕션 비권장**: 다중 사용자 동시 접근이 발생하는 웹 서비스에는 MySQL/PostgreSQL 사용
- **적합한 용도**: 프로토타이핑, 로컬 개발, 통합 테스트, 단일 사용자 데스크톱 앱

## 라이선스

**퍼블릭 도메인(Public Domain)**. 저작권 자체가 없다. 어떤 목적으로든 자유롭게 사용, 수정, 배포 가능하며 라이선스 표기 의무도 없다. 오픈소스 라이선스(MIT, GPL 등)보다 더 자유로운 상태다.

## 출처

- https://www.sqlite.org/about.html
- https://www.sqlite.org/whentouse.html
- https://www.sqlite.org/wal.html
- https://www.sqlite.org/datatype3.html
