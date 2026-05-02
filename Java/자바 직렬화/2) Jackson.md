# Jackson

> 최종 업데이트: 2026-04-28 | Jackson 2.x 기준 (Spring Boot 3.x 동봉 버전)

## 개념

Jackson은 **자바 객체와 JSON 사이를 변환해주는 가장 널리 쓰이는 라이브러리**다. Spring Boot의 기본 JSON 처리기로 채택되어 있어, REST API를 만들면 거의 항상 (자기도 모르게) 사용한다.

> 비유: 한국어로 된 책(Java 객체)을 영어(JSON)로 번역해주는 전문 번역가. 단순 단어 매칭이 아니라 문법·관용구·날짜 형식까지 옵션으로 조정 가능.

## 배경/역사

- **2007년** Tatu Saloranta가 시작한 오픈소스 프로젝트 (FasterXML)
- 초기에는 단순 JSON 파서였으나, 데이터바인딩 / 스트리밍 API / 애너테이션 처리기로 확장됨
- **Spring Boot가 기본 채택** — `spring-boot-starter-web` 사용 시 자동 포함
- 2.x는 안정 LTS, **3.0은 개발 중**(메이저 패키지명 변경: `com.fasterxml.jackson` → `tools.jackson`)
- 경쟁 라이브러리: **Gson**(Google, 단순함), **JSON-B**(JEE 표준), **Moshi**(코틀린·안드로이드)

## 모듈 구성

Jackson은 모놀리식이 아닌 **여러 모듈로 분리**되어 있다. Spring Boot는 핵심 모듈을 알아서 묶어준다.

| 모듈 | 역할 |
|---|---|
| jackson-core | 저수준 스트리밍 API (JsonParser, JsonGenerator) |
| jackson-annotations | 애너테이션 정의 (`@JsonProperty` 등) |
| jackson-databind | 객체 ↔ JSON 데이터바인딩 (`ObjectMapper`) — 가장 많이 씀 |
| jackson-datatype-jsr310 | Java 8 시간 타입(`LocalDateTime` 등) 지원 |
| jackson-module-kotlin | 코틀린 데이터 클래스 지원 |
| jackson-module-parameter-names | 생성자 파라미터명 인식 (기본 생성자 없이 역직렬화) |
| jackson-dataformat-xml/yaml/csv | JSON 외 포맷 |

## 세 가지 API 레벨

| 레벨 | API | 비유 | 용도 |
|---|---|---|---|
| Streaming | `JsonParser`, `JsonGenerator` | 토큰 단위 스트림 | 대용량, 최고 성능 |
| Tree Model | `JsonNode` | DOM 트리 | 동적·부분 처리 |
| Data Binding | `ObjectMapper` + POJO | 자동 매핑 | **실무 99%** |

## ObjectMapper 기본

`ObjectMapper`가 Jackson의 핵심. 객체 ↔ JSON 변환은 거의 이걸로 한다.

```java
ObjectMapper mapper = new ObjectMapper();

// 객체 → JSON
String json = mapper.writeValueAsString(user);

// JSON → 객체
User user = mapper.readValue(json, User.class);

// 컬렉션 역직렬화 (제네릭은 TypeReference 필요)
List<User> users = mapper.readValue(json, new TypeReference<List<User>>() {});

// JsonNode로 동적 접근
JsonNode node = mapper.readTree(json);
String name = node.get("user").get("name").asText();
```

> **Spring Boot에서는 `@Autowired ObjectMapper`로 받아 쓴다.** 직접 `new ObjectMapper()` 하면 Spring이 등록한 모듈/설정(JavaTimeModule 등)이 빠진다.

## 주요 애너테이션

### @JsonProperty — 필드명 매핑

JSON 키와 자바 필드명을 다르게 할 때.

```java
public class User {
    @JsonProperty("user_name")
    private String userName; // JSON에서는 user_name
}
```

### @JsonIgnore — 직렬화 제외

비밀번호 같은 민감 정보 제외. (Java의 `transient`와 비슷한 역할)

```java
public class User {
    @JsonIgnore
    private String password;
}
```

### @JsonIgnoreProperties — 클래스 단위 제외/관용

```java
@JsonIgnoreProperties(ignoreUnknown = true) // 모르는 키 무시
public class User { ... }
```

### @JsonInclude — null/빈값 제외

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {
    private String name;
    private String email; // null이면 JSON 결과에 빠짐
}
```

옵션: `ALWAYS`(기본), `NON_NULL`, `NON_EMPTY`(빈 문자열·컬렉션도 제외), `NON_DEFAULT`

### @JsonFormat — 날짜/숫자 포맷

```java
public class Order {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal price; // 숫자를 문자열로 (소수점 정밀도 보존)
}
```

### @JsonCreator — 역직렬화 생성자 지정

`final` 필드, 빌더 패턴, 또는 생성자가 여러 개일 때 어떤 생성자로 역직렬화할지 지정.

```java
public class User {
    private final String name;

    @JsonCreator
    public User(@JsonProperty("name") String name) {
        this.name = name;
    }
}
```

### @JsonAlias — 여러 키 인식

JSON 키가 여러 형태로 들어올 수 있을 때 (외부 API 호환).

```java
public class User {
    @JsonAlias({"user_name", "username", "userName"})
    private String name;
}
```

### @JsonNaming — 네이밍 전략 일괄 적용

```java
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class User {
    private String userName;     // → "user_name"
    private String emailAddress; // → "email_address"
}
```

전략: `SNAKE_CASE`, `LOWER_CAMEL_CASE`, `UPPER_CAMEL_CASE`, `KEBAB_CASE`, `LOWER_CASE`

### @JsonManagedReference / @JsonBackReference — 순환 참조

JPA 양방향 연관관계에서 무한 루프 방지.

```java
public class Team {
    @JsonManagedReference // 부모 (직렬화됨)
    private List<Member> members;
}

public class Member {
    @JsonBackReference // 자식 (직렬화 시 제외)
    private Team team;
}
```

### @JsonTypeInfo / @JsonSubTypes — 다형성

상속 관계 객체를 타입 정보와 함께 직렬화.

```java
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Dog.class, name = "dog"),
    @JsonSubTypes.Type(value = Cat.class, name = "cat")
})
public abstract class Animal { }
```

→ JSON에 `"type":"dog"` 필드가 추가되어 역직렬화 시 적절한 하위 클래스로 매핑.

## ObjectMapper 주요 설정

```java
ObjectMapper mapper = new ObjectMapper();

// 알 수 없는 필드 무시 (서버에 없는 필드가 JSON에 있어도 OK)
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

// null 필드 직렬화 제외
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

// 날짜를 timestamp 대신 ISO 문자열로
mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

// snake_case 네이밍
mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

// Java 8 시간 타입 지원
mapper.registerModule(new JavaTimeModule());

// 들여쓰기 출력 (디버깅용)
mapper.enable(SerializationFeature.INDENT_OUTPUT);
```

## Spring Boot 통합 설정

Spring Boot는 `application.yml`로 ObjectMapper를 일괄 설정한다.

```yaml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE
    serialization:
      write-dates-as-timestamps: false
      indent-output: false
    deserialization:
      fail-on-unknown-properties: false
    default-property-inclusion: non_null
    time-zone: Asia/Seoul
    date-format: yyyy-MM-dd HH:mm:ss
```

> Spring Boot가 자동 등록하는 ObjectMapper에는 `JavaTimeModule`이 이미 포함됨. `LocalDateTime` 등 그대로 쓰면 된다.

세밀한 커스터마이징이 필요하면 `Jackson2ObjectMapperBuilderCustomizer` 빈을 등록한다.

```java
@Bean
public Jackson2ObjectMapperBuilderCustomizer customizer() {
    return builder -> builder
        .featuresToEnable(SerializationFeature.WRAP_ROOT_VALUE)
        .modules(new MyCustomModule());
}
```

## 동작 흐름

```
[Java 객체]
    │
    │ writeValueAsString()
    ▼
[ObjectMapper] ─→ [BeanSerializer] ─→ [JsonGenerator] ─→ [JSON 문자열]
    ▲                                                          │
    │ readValue()                                              │
    │                                                          ▼
[Java 객체] ←─ [BeanDeserializer] ←─ [JsonParser] ←─ [JSON 문자열]
```

내부적으로는 리플렉션으로 필드/메서드를 분석하고, 분석 결과를 캐시해 다음 호출부터는 빠르게 처리한다. 그래서 **ObjectMapper는 한 번 만들어 재사용**해야 한다.

## 흔한 함정

### 1. 기본 생성자가 없으면 역직렬화 실패

```java
public class User {
    private final String name;
    public User(String name) { this.name = name; }
}
```

→ 해결책 3가지:
- `@JsonCreator + @JsonProperty` 명시
- 기본 생성자 추가
- `jackson-module-parameter-names` 등록 (Spring Boot 자동 포함)

### 2. LocalDateTime 직렬화 에러

```
InvalidDefinitionException: Java 8 date/time type `LocalDateTime` not supported by default
```

→ `JavaTimeModule` 등록. Spring Boot는 자동 등록되므로 `new ObjectMapper()` 직접 만들 때만 발생.

### 3. JPA 양방향 연관관계 무한 루프

```
StackOverflowError 또는 JsonMappingException: Infinite recursion
```

→ `@JsonManagedReference`/`@JsonBackReference`, 또는 `@JsonIdentityInfo`. 더 나은 해결: **엔티티를 직접 직렬화하지 말고 DTO로 변환**.

### 4. 알 수 없는 필드 에러

```
UnrecognizedPropertyException: Unrecognized field "extra"
```

→ `FAIL_ON_UNKNOWN_PROPERTIES = false` 또는 클래스에 `@JsonIgnoreProperties(ignoreUnknown = true)`. Spring Boot 기본은 `false`.

### 5. BigDecimal 정밀도 손실

자바스크립트 측에서 큰 숫자를 받으면 정밀도가 깨질 수 있다.

```java
@JsonFormat(shape = JsonFormat.Shape.STRING)
private BigDecimal amount;
```

→ 문자열로 직렬화해 정밀도 유지.

## 성능 팁

- **ObjectMapper는 thread-safe** — 싱글톤으로 재사용. 매 요청마다 `new` 하지 말 것.
- 자주 쓰는 타입은 `ObjectReader`/`ObjectWriter`로 미리 만들어 두면 빠름 (내부 캐시 활용).

```java
private static final ObjectReader USER_READER = mapper.readerFor(User.class);
User user = USER_READER.readValue(json);
```

- 대용량은 **Streaming API** 사용 — 메모리에 한 번에 안 올림.

```java
try (JsonParser parser = mapper.getFactory().createParser(largeFile)) {
    while (parser.nextToken() != null) {
        // 토큰 단위로 처리
    }
}
```

- `afterburner` 모듈 등록 시 리플렉션 비용 줄여 약 30% 빨라짐 (Java 17+에서는 `blackbird` 모듈).

## 라이브러리 비교

| 라이브러리 | 속도 | 기능 | 학습 곡선 | 코틀린 |
|---|---|---|---|---|
| Jackson | 빠름 | 풍부 | 중 | 모듈 필요 |
| Gson | 보통 | 단순 | 낮음 | OK |
| Moshi | 빠름 | 단순 | 낮음 | 우수 |
| JSON-B | 보통 | JEE 표준 | 중 | OK |

> **Spring 기반이면 Jackson 거의 자동 선택.** Gson은 안드로이드, Moshi는 코틀린/안드로이드에 강점.

## 관련 문서
- [[1) 자바 직렬화 기본]] — 직렬화 전체 개념과 다른 방식들

## 참조
- https://github.com/FasterXML/jackson
- https://www.baeldung.com/jackson
- https://github.com/FasterXML/jackson-docs
