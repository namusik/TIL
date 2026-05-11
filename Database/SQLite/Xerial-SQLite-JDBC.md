# Xerial SQLite JDBC Driver

> 최종 업데이트: 2026-04-22 | 기준: `org.xerial:sqlite-jdbc` 3.45.x

## 개념

**Xerial SQLite JDBC**는 Java 애플리케이션에서 **SQLite 데이터베이스를 사용할 수 있게 해주는 JDBC 드라이버** 다. 하나의 JAR 파일 안에 **표준 JDBC 인터페이스 + JNI 바인딩 + 플랫폼별 네이티브 SQLite 바이너리**가 모두 들어있는 것이 특징.

> 비유하자면 "외국인 통역기 + 휴대용 엔진"을 한 상자에 담은 것. SQLite는 외국어(C)로 말하는 DB인데, 이 JAR 하나만 있으면 Java가 통역을 거쳐 SQLite를 직접 실행까지 할 수 있다.

## 배경/역사

- **Xerial Project** — 일본의 **Taro L. Saito(齊藤太郎)** 가 주도하는 오픈소스 프로젝트
- 데이터·과학 계산 관련 Java 라이브러리 다수 배포 (Snappy-Java, Larray, Airframe 등)
- **sqlite-jdbc** 는 Xerial의 대표작 — Java 세계에서 **SQLite JDBC의 사실상 표준**
- **GitHub**: `xerial/sqlite-jdbc`
- **Maven 좌표**: `org.xerial:sqlite-jdbc`
- 활발한 유지보수 — SQLite 본체 신버전이 나오면 빠르게 번들링

## 왜 필요한가

SQLite는 **C로 작성**된 DB라 Java가 직접 호출하지 못한다. 중간에 **번역기(브릿지)** 가 필요하고, 그 역할이 이 JAR.

```
Java 앱 ─ JDBC API ─► xerial-sqlite-jdbc.jar ─ JNI ─► 네이티브 SQLite (C)
                                                          │
                                                          ▼
                                                     mydb.sqlite 파일
```

| 구성 | 역할 |
|------|------|
| **JDBC API** | `Connection`, `Statement` 등 Java 표준 DB 인터페이스 |
| **JNI (Java Native Interface)** | Java가 C 함수를 호출하게 해주는 다리 |
| **네이티브 SQLite** | JAR 안에 OS/아키텍처별로 바이너리 번들 |

## JAR의 특이한 점 — "Fat JAR"

보통 JDBC 드라이버는 순수 Java만 있어 수백 KB인데, 이 JAR는 **10MB+**. 이유는 **20개 이상 플랫폼의 네이티브 바이너리를 다 내장**했기 때문.

### 내부 구조 예시

```
sqlite-jdbc-3.45.1.0.jar
├── org/sqlite/...                           (Java 클래스)
├── org/sqlite/native/
│   ├── Linux/x86_64/libsqlitejdbc.so
│   ├── Linux/aarch64/libsqlitejdbc.so
│   ├── Linux-Android/arm/libsqlitejdbc.so
│   ├── Mac/x86_64/libsqlitejdbc.dylib
│   ├── Mac/aarch64/libsqlitejdbc.dylib        (Apple Silicon)
│   ├── Windows/x86_64/sqlitejdbc.dll
│   ├── FreeBSD/x86_64/libsqlitejdbc.so
│   └── ...
└── META-INF/
```

### 네이티브 로딩 동작

앱 실행 시 드라이버가 다음 순서로 동작.

1. **현재 OS·아키텍처 감지** (`os.name`, `os.arch`)
2. 해당 플랫폼용 `.so`/`.dylib`/`.dll` 을 JAR에서 꺼내 **임시 디렉터리에 풀기**
3. `System.load()` 로 그 파일을 로드
4. JNI를 통해 SQLite C 함수 호출

덕분에 사용자는 **OS에 SQLite를 따로 설치할 필요 없이** JAR 하나만 의존성에 추가하면 끝.

> 일부 제한된 환경(예: Alpine Linux, musl libc)에서는 바이너리 호환 문제로 실패할 수 있음 → `-Dorg.sqlite.lib.path` 로 커스텀 `.so` 지정 가능.

## 사용법 (Spring Boot 기준)

### 1. 의존성 추가

```groovy
// Gradle
dependencies {
    implementation 'org.xerial:sqlite-jdbc:3.45.1.0'
}
```

```xml
<!-- Maven -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.1.0</version>
</dependency>
```

### 2. `application.properties`

```properties
spring.datasource.url=jdbc:sqlite:./data/mydb.sqlite
spring.datasource.driver-class-name=org.sqlite.JDBC
```

### 3. 순수 Java 코드

```java
Class.forName("org.sqlite.JDBC");
try (Connection conn = DriverManager.getConnection("jdbc:sqlite:mydb.sqlite")) {
    try (Statement st = conn.createStatement()) {
        st.executeUpdate("CREATE TABLE IF NOT EXISTS users(id INTEGER, name TEXT)");
        st.executeUpdate("INSERT INTO users VALUES(1, 'wsnam')");
    }
}
```

## JDBC URL 형식

| 용도 | URL |
|------|-----|
| 파일 DB (절대 경로) | `jdbc:sqlite:/absolute/path/db.sqlite` |
| 파일 DB (상대 경로) | `jdbc:sqlite:./data/db.sqlite` |
| 인메모리 | `jdbc:sqlite::memory:` |
| 읽기 전용 | `jdbc:sqlite:/path/db.sqlite?mode=ro` |
| WAL 모드 | `jdbc:sqlite:/path/db.sqlite?journal_mode=WAL` |

### 자주 쓰는 파라미터

| 파라미터 | 의미 |
|---------|------|
| `mode=ro` / `rw` / `rwc` | 읽기전용 / 읽기쓰기 / 생성 허용 |
| `journal_mode=WAL` | Write-Ahead Logging — 동시성 향상 |
| `foreign_keys=true` | 외래 키 제약 활성화 (기본 OFF) |
| `busy_timeout=3000` | 락 대기 타임아웃(ms) |

## Hibernate / JPA에서 쓸 때

SQLite는 표준 Hibernate dialect에 **오래도록 포함되지 않았다**. Hibernate 6부터 공식 `SQLiteDialect` 추가.

```properties
# Hibernate 6 이상
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
```

| Hibernate 버전 | Dialect |
|--------------|---------|
| 5.x 이하 | 커뮤니티 서드파티 dialect 필요 |
| 6.x | `org.hibernate.community.dialect.SQLiteDialect` (community 모듈) |

의존성 추가

```groovy
implementation 'org.hibernate.orm:hibernate-community-dialects'
```

## 대안 드라이버 비교

| 드라이버 | 특징 |
|---------|------|
| **`org.xerial:sqlite-jdbc`** | **사실상 표준**. 네이티브 번들 내장, 자동 플랫폼 감지, 활발한 유지보수 |
| `com.almworks.sqlite4java` | 네이티브 파일을 별도 배포해야 함 (레거시) |
| `org.sqlite:sqlite-jna` | JNA 기반, 시스템의 `libsqlite` 의존 |

> 신규 프로젝트는 xerial 거의 무조건 선택.

## 주요 기능 / 한계

### 지원

- JDBC 4.x 인터페이스 완전 구현
- 트랜잭션, PreparedStatement, 배치, 커넥션 풀 호환
- SQLite 본체 기능 거의 전체 (WAL, JSON1, FTS5, R-Tree 등)
- Spring Boot 자동 설정 호환

### 한계

- **SQLite 자체의 한계 그대로** — 동시 쓰기 취약, 네트워크 공유 불가
- **일부 최신 SQLite 확장** — 번들된 버전에 따라 없을 수 있음 (드라이버 업데이트 필요)
- **컨테이너(Alpine/musl)** — 바이너리 호환 이슈 간혹 발생

## 백엔드 개발자 관점 실무 포인트

- **버전 = SQLite 버전 + 드라이버 패치 번호** — 예: `3.45.1.0` → SQLite 3.45.1 + 드라이버 0번째
- **컨테이너 이미지** — `openjdk:*-alpine` 사용 시 glibc 기반 바이너리가 안 돌 수 있음. `eclipse-temurin:*-jre` 같은 glibc 이미지 권장
- **네이티브 추출 경로 변경** — 멀티 테넌트/읽기 전용 파일시스템이면 `-Dorg.sqlite.tmpdir=/tmp/custom` 지정
- **풀 설정** — SQLite는 동시 쓰기 1개만 허용 → 커넥션 풀 크기보다 **`busy_timeout`** 튜닝이 중요
- **로그 감소** — 기본적으로 SQLite 로그가 시끄러움. `org.sqlite` 로거 레벨 조정

## 요약

- **xerial-sqlite-jdbc.jar** = Java ↔ SQLite(C) 브릿지 드라이버
- **JDBC + JNI + 네이티브 SQLite 바이너리**가 한 JAR에 들어있는 **Fat JAR**
- JAR 하나만 추가하면 **OS 설치 없이** Java 앱에서 SQLite 즉시 사용 가능
- Xerial 프로젝트의 대표작, **Java 세계의 표준 SQLite 드라이버**

## 관련 문서

- [SQLite.md](SQLite.md)
- [../H2/H2 기본.md](../H2/H2-기본.md) — H2와의 비교 맥락
