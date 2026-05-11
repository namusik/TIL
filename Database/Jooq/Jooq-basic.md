# jOOQ 기본

> 최종 업데이트: 2026-04-18 | 기준: jOOQ 3.19, gradle-jooq-plugin 9.x

## 개념

jOOQ(Java Object Oriented Querying)는 **실제 DB 스키마를 기반으로 Java 코드를 자동 생성**해두고, 그 코드로 **타입 안전한 SQL**을 작성하게 해주는 라이브러리다. SQL을 그대로 쓰면서도 컴파일 타임에 컬럼명/타입 오타를 잡을 수 있다.

> 비유하자면 MyBatis처럼 "SQL 중심"이되, JPA처럼 "컴파일러가 오타를 잡아주는" 느낌. SQL을 문자열로 쓰지 않고 메서드 체이닝으로 조립한다.

동작 흐름은 두 단계로 나뉜다.

```
[빌드 타임]  DB 접속 → 스키마 분석 → Java 코드 생성 (Tables, Records, POJOs)
[런타임]     생성된 코드로 SQL 조립 → JDBC로 DB 실행
```

## 배경/역사

- **제작자**: Lukas Eder (스위스 회사 **Data Geekery GmbH**)
- **첫 릴리스**: 2009년
- **철학**: "SQL should be the first-class citizen in Java" — ORM처럼 SQL을 숨기지 말고, 타입 안전성만 덧붙이자
- **라이선스 에디션**

| 에디션 | 라이선스 | 대상 DB |
|-------|---------|---------|
| OSS | Apache 2.0 | MySQL, PostgreSQL, SQLite, H2 등 오픈소스 DB |
| Express / Professional / Enterprise | 상용 | Oracle, SQL Server, DB2 등 상용 DB도 지원 |

> MySQL/PostgreSQL만 쓰면 OSS 에디션으로 충분하다. Oracle/MSSQL을 쓰려면 유료 라이선스 필요.

## 다른 기술과의 비교

| 항목 | JPA / Hibernate | MyBatis | **jOOQ** |
|------|----------------|---------|---------|
| SQL 스타일 | 자동 생성 (JPQL) | XML/어노테이션에 수동 작성 | **Java DSL로 작성** |
| 타입 안전성 | 엔티티 단위는 O, 쿼리는 △ | X (문자열) | **O (컬럼·타입까지)** |
| 복잡 쿼리 | 불리 (네이티브 쿼리로 빠짐) | 자유로움 | **자유로움 + 타입 안전** |
| 러닝 커브 | 중~상 | 하 | 중 |
| 스키마 동기화 | 엔티티가 소스 오브 트루스 | 수동 | **DB가 소스 오브 트루스 (역생성)** |

## Gradle 설정

[공식문서 - gradle-jooq-plugin](https://github.com/etiennestuder/gradle-jooq-plugin)

### 플러그인 적용

```groovy
plugins {
    id 'nu.studer.jooq' version '9.0'
}
```

### DB 드라이버 추가

```groovy
dependencies {
    implementation 'org.jooq:jooq'
    jooqGenerator 'mysql:mysql-connector-java:8.0.33'
}
```
- `jooqGenerator` 구성은 **코드 생성 시점**에 사용할 DB 드라이버
- `implementation`의 `jooq`는 **런타임**에 사용할 jOOQ 본체

### jOOQ 버전 고정

```groovy
jooq {
    version = '3.19.0'
    edition = nu.studer.gradle.jooq.JooqEdition.OSS
}
```

### XML 스키마 버전 강제 (필요 시)

```groovy
buildscript {
    configurations['classpath'].resolutionStrategy.eachDependency {
        if (requested.group == 'org.jooq') {
            useVersion '3.19.0'
        }
    }
}
```

## 코드 생성기(Generator) 구성

실제로 DB에 붙어서 Java 코드를 뽑는 부분. 대체로 이 블록이 설정의 중심이다.

```groovy
jooq {
    version = '3.19.0'
    edition = nu.studer.gradle.jooq.JooqEdition.OSS

    configurations {
        main {
            generateSchemaSourceOnCompilation = true

            generationTool {
                jdbc {
                    driver = 'com.mysql.cj.jdbc.Driver'
                    url = 'jdbc:mysql://localhost:3306/mydb'
                    user = 'root'
                    password = 'root'
                }
                generator {
                    name = 'org.jooq.codegen.DefaultGenerator'
                    database {
                        name = 'org.jooq.meta.mysql.MySQLDatabase'
                        includes = '.*'
                        excludes = 'test_.* | temp_.* | zDEL.* | zBAK.*'
                        inputSchema = 'mydb'
                    }
                    generate {
                        records = true      // Record 클래스 생성
                        pojos = true        // POJO 클래스 생성
                        fluentSetters = true
                        javaTimeTypes = true // java.time 사용 (Date 대신)
                    }
                    target {
                        packageName = 'com.example.jooq.generated'
                        directory = 'build/generated-src/jooq/main'
                    }
                }
            }
        }
    }
}
```

### 주요 옵션

| 옵션 | 설명 |
|------|------|
| `includes` / `excludes` | 생성 대상 테이블 필터 (정규식) |
| `records` | `XxxRecord` 클래스 생성 여부 (기본 true) |
| `pojos` | 순수 POJO 생성 여부 |
| `fluentSetters` | setter가 자기 자신을 반환해 체이닝 가능하게 |
| `javaTimeTypes` | `java.time.*` 사용 (MySQL DATETIME → LocalDateTime) |
| `target.packageName` | 생성 코드의 패키지 |
| `target.directory` | 생성 코드의 물리 경로 |

## 생성되는 코드 구조

```
com.example.jooq.generated
├── Tables.java              // 모든 테이블 상수 진입점 (Tables.USER 등)
├── Keys.java                // PK/FK/UK 정의
├── tables
│   ├── User.java            // 테이블 메타 클래스
│   └── records
│       └── UserRecord.java  // 행 1개에 대응하는 Record
└── tables.pojos
    └── User.java            // POJO (DTO로 쓰기 좋음)
```

## 기본 사용 예시

```java
@Autowired
DSLContext create;   // jOOQ의 진입점

// SELECT
UserRecord user = create.selectFrom(USER)
    .where(USER.ID.eq(1L))
    .fetchOne();

// INSERT
create.insertInto(USER)
    .set(USER.NAME, "wsnam")
    .set(USER.EMAIL, "wsnam@mz.co.kr")
    .execute();

// UPDATE
create.update(USER)
    .set(USER.NAME, "newName")
    .where(USER.ID.eq(1L))
    .execute();

// DELETE
create.deleteFrom(USER)
    .where(USER.ID.eq(1L))
    .execute();
```

## Spring Boot 통합

`spring-boot-starter-jooq`를 의존성에 추가하면 `DSLContext` 빈이 자동 구성된다.

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-jooq'
    jooqGenerator 'mysql:mysql-connector-java:8.0.33'
}
```

- Spring의 `DataSource`를 jOOQ가 공유 → 동일 트랜잭션 안에서 동작
- `@Transactional` 그대로 사용 가능

## 자주 쓰는 이슈/팁

- **코드 생성이 빌드를 느리게 만든다** → `generateSchemaSourceOnCompilation = false`로 두고 필요 시에만 `./gradlew generateJooq` 실행
- **DDL 스크립트만으로 생성하기** → DB 없이도 Flyway/Liquibase 스크립트에서 직접 메타를 뽑는 `DDLDatabase` 사용 가능 (CI 환경에서 유용)
- **테스트용 별도 스키마 생성** → `configurations { test { ... } }` 블록으로 분리 (자세한 설정은 [test용 Jooq 설정](test용-Jooq-설정.md) 참고)

## 관련 문서

- [Jooq_method.md](Jooq_method.md) — select/fetch/insert 등 메서드 사용법
- [test용-Jooq-설정.md](test용-Jooq-설정.md) — 테스트용 별도 generator 구성
