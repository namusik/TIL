# Java 애플리케이션에서 H2 사용법

> 최종 업데이트: 2026-04-22 | 기준: H2 2.x, Spring Boot 3.x, Java 17+

## 개념

H2는 **Java로 작성된 DB**라 **JAR 의존성 하나만 추가하면 바로 사용** 가능하다. JDBC 드라이버·DB 엔진·웹 콘솔이 한 JAR에 들어있어, 별도 설치나 서버 기동 없이 Java 애플리케이션 안에서 곧바로 동작한다.

> 비유하자면 "앱을 실행하면 같이 켜지는 미니 DB". 운영용 MySQL/PostgreSQL을 띄울 필요 없이, **개발·테스트·프로토타입** 단계에서 즉시 DB를 쓸 수 있게 해준다.

H2 자체 개념이나 실행 모드(Embedded/In-Memory/Server)는 [H2 기본.md](H2%20기본.md) 참고. 이 문서는 **Java 코드에서 H2를 쓰는 실제 방법**에 집중한다.

## 사용 시나리오

| 시나리오 | 모드 | 특징 |
|---------|------|------|
| **단위 테스트** | In-Memory | 테스트마다 빈 DB, 속도 빠름 |
| **통합 테스트** | In-Memory + 스키마 스크립트 | 격리된 테스트 환경 |
| **로컬 개발** | Embedded (파일) | 재시작해도 데이터 유지 |
| **프로토타입/데모** | In-Memory or 파일 | 빠른 구현 |
| **여러 앱 공유 개발 DB** | Server (TCP) | 팀 공유, H2 서버 별도 기동 |

> **운영 프로덕션에서는 쓰지 않는다**. MySQL/PostgreSQL로 대체.

## 1. 의존성 추가

### Gradle

```groovy
dependencies {
    runtimeOnly 'com.h2database:h2'
}
```

- `runtimeOnly` — 런타임에만 필요 (컴파일 타임에는 JDBC 표준만 있으면 충분)
- Spring Boot 스타터 없이도 동작

### Maven

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

## 2. 순수 Java (JDBC 직접 사용)

가장 기본 형태. 어떤 프레임워크에도 의존하지 않음.

```java
import java.sql.*;

public class H2Example {
    public static void main(String[] args) throws Exception {
        // 인메모리 DB
        String url = "jdbc:h2:mem:testdb";

        try (Connection conn = DriverManager.getConnection(url, "sa", "")) {
            try (Statement st = conn.createStatement()) {
                st.executeUpdate("CREATE TABLE users(id INT PRIMARY KEY, name VARCHAR(50))");
                st.executeUpdate("INSERT INTO users VALUES (1, 'wsnam')");
            }

            try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?")) {
                ps.setInt(1, 1);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        System.out.println(rs.getInt("id") + ", " + rs.getString("name"));
                    }
                }
            }
        }
    }
}
```

- Driver 클래스명을 명시할 필요 없음 — **JDBC 4.0부터 자동 로딩**
- 기본 사용자는 `sa`, 비밀번호는 빈 문자열

## 3. Spring Boot에서 사용

가장 흔한 패턴. 의존성만 추가하면 **자동 설정**.

### 의존성

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.h2database:h2'
}
```

### `application.properties` — 모드별 설정

#### 인메모리 (기본값)

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
```

> 아무 설정 없이 H2 의존성만 추가해도 Spring Boot가 **자동으로 인메모리 H2**를 세팅.

#### 파일 기반 (로컬 개발용)

```properties
spring.datasource.url=jdbc:h2:file:./data/mydb
spring.datasource.username=sa
spring.datasource.password=
```

- 프로젝트 루트 아래 `data/mydb.mv.db` 파일이 자동 생성
- 앱을 재시작해도 데이터 유지

#### 서버 모드 (팀 공유)

```properties
spring.datasource.url=jdbc:h2:tcp://localhost/~/shared-db
spring.datasource.username=sa
spring.datasource.password=
```

- 별도로 `./h2.sh`로 H2 서버가 떠 있어야 함
- 자세한 서버 기동은 [H2 시작하는 법.md](H2%20시작하는%20법.md) 참고

## 4. H2 웹 콘솔 활성화

Spring Boot는 내장 콘솔을 자동 지원 (`http://localhost:8080/h2-console`).

```properties
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=false
```

| 설정 | 의미 |
|------|------|
| `enabled=true` | 콘솔 활성화 |
| `path=/h2-console` | 콘솔 경로 |
| `web-allow-others=true` | **외부 IP 접근 허용** (운영 절대 금지) |

### Spring Security와 함께 쓸 때

Security가 요청을 차단하므로 예외 허용이 필요.

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(PathRequest.toH2Console()).permitAll()
            .anyRequest().authenticated())
        .headers(h -> h.frameOptions(f -> f.sameOrigin()))  // iframe 허용
        .csrf(c -> c.ignoringRequestMatchers(PathRequest.toH2Console()));
    return http.build();
}
```

> 운영 환경에서는 **반드시 `spring.h2.console.enabled=false`** 로 설정.

## 5. JPA / Hibernate와 함께

```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

| `ddl-auto` 값 | 동작 | 용도 |
|--------------|------|------|
| `none` | 아무것도 안 함 | 운영 기본 |
| `validate` | 스키마 검증만 | 운영 권장 |
| `update` | 필요한 변경만 추가 | 로컬 개발 |
| `create` | 시작 시 DROP→CREATE | 테스트 |
| `create-drop` | 시작 시 생성, 종료 시 삭제 | 인메모리 테스트 표준 |

### 엔티티 예시

```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // getters/setters
}

@Repository
public interface UserRepository extends JpaRepository<User, Long> { }
```

## 6. 초기 데이터 스크립트

Spring Boot는 클래스패스의 `schema.sql` / `data.sql`을 자동 실행.

```
src/main/resources/
├── schema.sql   ← 테이블 생성
└── data.sql     ← 초기 데이터 INSERT
```

```sql
-- schema.sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- data.sql
INSERT INTO users(name) VALUES ('alice'), ('bob');
```

### JPA와 동시에 쓸 때 주의

```properties
spring.jpa.defer-datasource-initialization=true
```

- JPA `ddl-auto`가 먼저 테이블을 만든 후 `data.sql`을 실행하도록 보장
- 이 옵션 없으면 `data.sql`이 먼저 실행돼 테이블 없음 에러 발생

## 7. MODE 호환 — 운영 DB 문법에 맞추기

H2는 **다른 DB를 흉내내는 호환 모드**를 제공. 테스트에서 MySQL 문법이 돌게 하려면.

```properties
spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DATABASE_TO_LOWER=TRUE
```

| `MODE` 값 | 설명 |
|----------|------|
| `MySQL` | MySQL 문법·함수 호환 |
| `PostgreSQL` | PostgreSQL 호환 |
| `Oracle` | Oracle 호환 |
| `MSSQLServer` | SQL Server 호환 |
| `DB2` | DB2 호환 |

> **완전 호환은 아님**. `GROUP_CONCAT`, `ON DUPLICATE KEY` 같은 일부 MySQL 기능은 동작하지 않을 수 있음. 최근 실무는 **Testcontainers**로 실제 DB를 쓰는 게 대세.

## 8. 테스트에서 쓰는 패턴

### 단위 테스트 — 인메모리 기본

```java
@DataJpaTest  // JPA 컴포넌트만 로드 + 자동 H2 사용
class UserRepositoryTest {
    @Autowired UserRepository repo;

    @Test void save_and_find() {
        User u = new User();
        u.setName("test");
        repo.save(u);
        assertThat(repo.findAll()).hasSize(1);
    }
}
```

- `@DataJpaTest`는 테스트 클래스별로 새 인메모리 DB를 생성

### 프로파일 분리

`application-test.properties`

```properties
spring.datasource.url=jdbc:h2:mem:testdb-${random.uuid};DB_CLOSE_DELAY=-1;MODE=MySQL
spring.jpa.hibernate.ddl-auto=create-drop
```

- **`${random.uuid}`** 로 병렬 테스트 간 DB 충돌 방지
- `DB_CLOSE_DELAY=-1` — 커넥션이 잠깐 비더라도 DB 유지

### 테스트에서 H2 대신 실제 DB 쓰기 (Testcontainers)

```groovy
testImplementation 'org.testcontainers:mysql:1.19.3'
testImplementation 'org.springframework.boot:spring-boot-testcontainers'
```

```java
@Testcontainers
@SpringBootTest
class RealDbTest {
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", mysql::getJdbcUrl);
        r.add("spring.datasource.username", mysql::getUsername);
        r.add("spring.datasource.password", mysql::getPassword);
    }
}
```

- H2 호환 모드로 안 되는 MySQL 전용 쿼리도 검증 가능

## 9. Flyway / Liquibase와 함께

스키마 마이그레이션 도구와도 자연스럽게 연동.

```groovy
implementation 'org.flywaydb:flyway-core'
runtimeOnly 'com.h2database:h2'
```

```
src/main/resources/db/migration/
├── V1__init.sql
└── V2__add_email_column.sql
```

- 앱 시작 시 Flyway가 마이그레이션을 H2에 적용
- Spring Boot 자동 설정으로 별도 코드 없이 동작
- `spring.jpa.hibernate.ddl-auto=validate`로 맞춰두면 실수 방지

## 10. 커넥션 풀

기본 HikariCP가 붙는다. H2 특성을 고려한 튜닝은 거의 불필요.

```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
```

- 인메모리 H2는 **한 JVM 내에서만** 동작하므로 풀 크기를 크게 잡을 이유가 없음
- 서버 모드라면 일반 DB와 동일한 튜닝 원칙 적용

## 자주 쓰는 URL 파라미터

| 파라미터 | 용도 |
|---------|------|
| `MODE=MySQL` | 호환 모드 |
| `DB_CLOSE_DELAY=-1` | 인메모리에서 마지막 커넥션 닫혀도 DB 유지 |
| `DATABASE_TO_UPPER=FALSE` | 대소문자 구분 |
| `AUTO_SERVER=TRUE` | 여러 프로세스가 같은 파일에 접근 가능 |
| `INIT=RUNSCRIPT FROM 'classpath:init.sql'` | 연결 시 스크립트 실행 |
| `TRACE_LEVEL_FILE=0` | 로그 파일 비활성화 |

```properties
spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_UPPER=FALSE
```

## 문제 해결

| 증상 | 원인 / 해결 |
|------|-----------|
| 데이터가 사라짐 | 인메모리 + 커넥션 끊김 → `DB_CLOSE_DELAY=-1` 추가 |
| `Database may be already in use` | 같은 파일을 다른 프로세스가 잠금 → `AUTO_SERVER=TRUE` |
| `Table "USERS" not found` | 대문자 문제 → `DATABASE_TO_UPPER=FALSE` 또는 호환 모드 |
| H2 콘솔 접속 안 됨 | Security 차단 → `permitAll()` + `frameOptions.sameOrigin()` |
| `data.sql` 실행 전 에러 | `spring.jpa.defer-datasource-initialization=true` 추가 |
| MySQL 전용 쿼리 에러 | `MODE=MySQL` 추가, 그래도 안 되면 Testcontainers 사용 |

## 요약

- **의존성 하나 + `jdbc:h2:mem:testdb` URL**이면 바로 시작
- Spring Boot는 **설정 없이도** 인메모리 H2를 자동 세팅
- 테스트는 인메모리, 로컬 개발은 파일, 팀 공유는 서버 모드
- 운영 DB 문법 차이는 **`MODE=MySQL` 호환 모드** 또는 **Testcontainers**로 해결
- `schema.sql`/`data.sql`, Flyway, JPA `ddl-auto` 등 다양한 스키마 초기화 옵션
- 운영 환경에서는 **절대 사용 금지**

## 관련 문서

- [H2 기본.md](H2%20기본.md) — H2 자체 개념/모드
- [H2 시작하는 법.md](H2%20시작하는%20법.md) — 독립 H2 서버 설치·기동
- [../Flyway.md](../Flyway.md)
- [../JPA/](../JPA/)
- [../Jooq/](../Jooq/)
