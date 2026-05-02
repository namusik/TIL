# SpEL (Spring Expression Language)

> 최종 업데이트: 2026-04-24 | 기준: Spring Framework 6.x

## 개념

**SpEL(Spring Expression Language)** 은 **Spring Framework가 제공하는 런타임 표현식 언어**. 문자열로 된 식을 런타임에 파싱·평가해 값을 계산하거나 객체 그래프를 탐색할 수 있다.

> 비유하자면 **Spring 설정 안에 박아 넣는 작은 스크립트**. 자바 코드처럼 생겼지만, 어노테이션·XML·설정값 안에 끼워 넣어 동적으로 값을 계산하게 해준다.

## 배경/역사

- **2009** — Spring 3.0에서 도입
- 목적: XML 설정이 주류였던 시절, **설정에 동적 계산**을 넣을 수 있게 하려는 범용 표현식 엔진
- 이후 **Spring Security, Spring Integration, Spring Batch** 등 Spring 생태계 전반에서 공통 언어로 채택
- EL(Expression Language), OGNL, MVEL 등 기존 표현식 언어의 영향을 받음

## 기본 문법

```
#{표현식}
```

| 문법 | 의미 |
|------|------|
| **`${...}`** | 프로퍼티 플레이스홀더 (application.properties 값) |
| **`#{...}`** | **SpEL 표현식** (계산·객체 접근) |
| `#{'${xxx}' + '!'}` | 둘을 조합 (SpEL 안에서 프로퍼티 참조) |

## 어디서 쓰나

Spring 어노테이션의 **동적 설정**에서 활약.

| 어노테이션 | 용도 |
|----------|------|
| `@Value` | 필드 주입 |
| `@Cacheable`, `@CacheEvict`의 `key` | 캐시 키 계산 |
| `@PreAuthorize`, `@PostAuthorize` | 권한 표현식 |
| `@Scheduled`의 `cron` | 스케줄 표현식 동적 결정 |
| `@ConditionalOnExpression` | 조건부 빈 등록 |
| `@EventListener`의 `condition` | 이벤트 필터 |

## 주요 기능

### 1. 리터럴 / 산술

```java
@Value("#{100}")            int  n;         // 100
@Value("#{'hello'}")        String s;        // "hello"
@Value("#{true}")           boolean b;       // true
@Value("#{2 * 3 + 4}")      int  calc;       // 10
@Value("#{'a' + 'b'}")      String concat;   // "ab"
```

### 2. 객체 프로퍼티 접근

```java
#{user.name}              // user.getName()
#{user.address.city}      // 중첩 접근
#{user['name']}           // 맵 스타일
```

### 3. 메서드 호출

```java
#{user.getName()}
#{'hello'.toUpperCase()}
#{list.size()}
```

### 4. 타입 / 정적 메서드 — `T()`

```java
#{T(java.lang.Math).PI}
#{T(java.time.LocalDate).now()}
#{T(com.example.MyEnum).ACTIVE}
```

### 5. 컬렉션 / 배열

```java
#{list[0]}                  // 인덱스 접근
#{map['key']}               // 맵 조회
#{list.?[age > 18]}         // Selection (필터)
#{list.![name]}             // Projection (매핑)
#{list.^[age > 18]}         // 첫 매치
#{list.$[age > 18]}         // 마지막 매치
```

### 6. 삼항 / Elvis / Safe Navigation

```java
#{user.age > 18 ? 'adult' : 'minor'}
#{user.name ?: 'Unknown'}          // Elvis (null이면 'Unknown')
#{user?.address?.city}             // Safe Navigation (NPE 방지)
```

### 7. 빈 참조

```java
@Value("#{@myBean.someProperty}")
private String val;                 // ApplicationContext의 myBean에서 접근
```

### 8. 시스템 프로퍼티 / 환경변수

```java
@Value("#{systemProperties['user.name']}")
private String osUser;

@Value("#{systemEnvironment['HOME']}")
private String home;
```

## 실무에서 자주 보는 패턴

### `@Cacheable`의 키

```java
@Cacheable(value = "users", key = "#id")
public User findById(Long id) { ... }

@Cacheable(value = "users", key = "#user.email")
public User findByUser(User user) { ... }

@Cacheable(value = "users",
           key = "#user.id + ':' + #user.email")
public User composite(User user) { ... }
```

### `@PreAuthorize`의 보안 조건

```java
@PreAuthorize("hasRole('ADMIN') or #user.id == principal.id")
public void updateUser(User user) { ... }

@PreAuthorize("@permissionService.canAccess(#resourceId, principal)")
public Resource get(Long resourceId) { ... }
```

### `@Scheduled`의 cron 동적 결정

```java
@Scheduled(cron = "#{@scheduleConfig.cronExpression}")
public void job() { ... }
```

### `@ConditionalOnExpression`

```java
@ConditionalOnExpression("#{'${app.mode}' == 'prod'}")
@Configuration
public class ProdConfig { ... }
```

## 프로그래밍 방식 사용

어노테이션이 아니라 코드로 직접 SpEL을 평가할 수도 있다.

```java
ExpressionParser parser = new SpelExpressionParser();

// 단순 평가
Expression exp = parser.parseExpression("'Hello World'.length()");
Integer length = exp.getValue(Integer.class);   // 11

// 컨텍스트에 변수 주입
StandardEvaluationContext ctx = new StandardEvaluationContext();
ctx.setVariable("name", "wsnam");

String result = parser
    .parseExpression("'Hi, ' + #name")
    .getValue(ctx, String.class);               // "Hi, wsnam"
```

## ★ 보안 — SpEL Injection

**SpEL은 런타임에 임의 코드를 실행할 수 있는 강력한 도구**다. 사용자 입력을 그대로 표현식으로 평가하면 **원격 코드 실행(RCE)** 으로 이어진다.

### 공격 예시

```java
// 🚨 취약한 코드
@GetMapping("/greet")
public String greet(@RequestParam String name) {
    Expression exp = parser.parseExpression("'Hello, ' + '" + name + "'");
    return exp.getValue(String.class);
}
```

공격자가 `name` 파라미터로 이런 페이로드를 보낸다면:

```
?name=' + T(java.lang.Runtime).getRuntime().exec('rm -rf /') + '
```

→ **서버에서 임의 명령 실행**.

### 대표적 실제 사례

| CVE | 영향 | 설명 |
|-----|------|------|
| **CVE-2022-22947** | Spring Cloud Gateway | Actuator `/actuator/gateway/routes` 엔드포인트가 노출되면 라우트 filter의 SpEL이 평가되어 **RCE**. 매우 유명 |
| **CVE-2022-22963** | Spring Cloud Function | 라우팅 헤더 `spring.cloud.function.routing-expression` SpEL 평가로 RCE |
| **CVE-2025-41243** | **Spring Cloud Gateway WebFlux** | 게이트웨이의 SpEL 평가 경로에서 외부 입력이 표현식에 섞여 **RCE** (Gateway SpEL 계보의 최신판) |
| **CVE-2018-1273** | Spring Data Commons | 폼 필드 이름에서 SpEL 평가 |
| **CVE-2017-8046** | Spring Data REST | PATCH 요청 JSON Path에서 SpEL 평가 |
| **CVE-2022-22950** | Spring Framework | 특정 표현식으로 DoS 가능 |

모두 **"신뢰할 수 없는 입력을 SpEL로 평가"** 가 원인.

### Spring Cloud Gateway SpEL 계보 (반복되는 취약점 패턴)

Spring Cloud Gateway는 구조적으로 SpEL 취약점이 반복되는 대표적인 곳이다. 이유를 이해해두면 유사 CVE가 나올 때 빠르게 대응할 수 있다.

#### 왜 Gateway에 SpEL 취약점이 잦은가

Gateway의 **라우팅 규칙 자체가 "런타임에 표현식을 평가"** 하는 구조. Predicate·Filter·URI 변수 등 여러 지점에서 SpEL이 평가되고, 이 중 어딘가에 외부 입력이 닿으면 RCE로 이어진다.

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: myroute
          filters:
            - SetRequestHeader=X-User, #{headers['x-auth']}   # ← SpEL 평가 지점
```

#### 공격 패턴 일반화

```
        [공격자]
           │
           │ HTTP 요청 (악의 페이로드)
           ▼
   [Spring Cloud Gateway]
           │
           │ 요청 속 특정 값을
           │ SpEL 표현식으로 평가
           ▼
  #{T(java.lang.Runtime).getRuntime().exec('명령')}
           │
           ▼
      [서버에서 임의 명령 실행]
```

#### 왜 특히 위험한가

- **Gateway는 MSA의 최전선** — 모든 트래픽이 거쳐가는 관문이라 장악 시 영향 최대
- **`StandardEvaluationContext` 사용** — `T()`, 빈 참조, 정적 메서드 호출 모두 허용
- **WebFlux 비동기 환경** — 스택 추적이 복잡해 탐지·디버깅 어려움
- **"동적 라우팅" 기능 자체가 양날의 검** — 표현식 평가를 없앨 수는 없고, 입력을 섞지 않는 설계가 필수

#### Gateway 대응 체크리스트

- [ ] 취약 버전 → **공식 패치 버전으로 즉시 업그레이드** (1순위)
- [ ] **Actuator 엔드포인트 노출 최소화** — 특히 `gateway.*` 관리 API는 외부 공개 금지
- [ ] 사용자 입력이 라우팅 설정/표현식에 **동적으로 주입되지 않도록** 설계 검토
- [ ] WAF 레벨에서 의심 페이로드 패턴 차단 (`T(java.lang.Runtime)`, `getRuntime`, `exec` 등)
- [ ] 가능한 지점은 **`SimpleEvaluationContext`** 로 축소
- [ ] Spring Security Advisories 구독 (https://spring.io/security)

### 안전한 설계 원칙

1. **사용자 입력을 절대 SpEL 문자열에 합치지 말 것**
   ```java
   // 🚨 NEVER
   parser.parseExpression("'Hello, ' + '" + userInput + "'");

   // ✅ 대신 컨텍스트 변수로 전달
   EvaluationContext ctx = new StandardEvaluationContext();
   ctx.setVariable("name", userInput);   // 문자열로 안전하게
   parser.parseExpression("'Hello, ' + #name").getValue(ctx);
   ```

2. **`SimpleEvaluationContext`를 쓰자** — `StandardEvaluationContext`는 기본적으로 `T()`(타입 참조), 빈 참조, 정적 메서드 호출 등 강력 기능을 모두 허용

   ```java
   EvaluationContext ctx = SimpleEvaluationContext.forReadOnlyDataBinding().build();
   // 프로퍼티 읽기만 허용, 메서드/타입 호출 차단
   ```

3. **입력 검증 우선** — 정규식/화이트리스트로 걸러낸 뒤에만 평가
4. **SpEL이 꼭 필요한지 재검토** — 정적 분기나 전략 패턴으로 대체 가능한지 확인
5. **Spring Security의 `@PreAuthorize`** 같은 **내부 표현식은 안전** (개발자가 작성, 사용자 입력이 직접 들어가지 않음) — 문제가 되는 건 **외부 입력이 표현식 문자열에 포함되는 경우**

### `SimpleEvaluationContext` vs `StandardEvaluationContext`

| 기능 | `StandardEvaluationContext` | `SimpleEvaluationContext` |
|------|----------------------------|--------------------------|
| 프로퍼티 읽기 | O | O (옵션) |
| 프로퍼티 쓰기 | O | O (옵션) |
| **메서드 호출** | **O** | **X** |
| **타입 참조 `T()`** | **O** | **X** |
| **빈 참조 `@bean`** | **O** | **X** |
| **생성자 호출** | **O** | **X** |
| 용도 | 내부 신뢰 환경 | **외부 입력 포함 환경** |

> 외부 입력과 조합될 가능성이 있다면 **무조건 `SimpleEvaluationContext`**.

## 기타 주의사항

- **성능 비용** — 단순 문자열 대비 파싱·평가 오버헤드. 매 호출마다 평가하면 부담 → `Expression` 객체를 캐싱
- **디버깅 어려움** — 표현식이 틀려도 문자열로 들어가 **실행 시점에만 `SpelEvaluationException`**. 컴파일러가 못 잡음
- **Compiled SpEL** — 성능 필요 시 `SpelCompilerMode.IMMEDIATE` 컴파일러 모드로 바이트코드 생성 가능

## 요약

- SpEL = Spring의 **런타임 표현식 언어**, `#{...}` 문법
- `@Value`, `@Cacheable`, `@PreAuthorize`, `@Scheduled`, `@ConditionalOnExpression` 등 Spring 어노테이션의 **동적 설정**에서 활약
- 산술·객체 접근·메서드·타입 참조·컬렉션 필터링·조건식 등 풍부한 기능
- **보안**: 사용자 입력을 SpEL에 직접 넣지 말 것. 외부 입력 환경에서는 **`SimpleEvaluationContext`** 사용
- 실제 CVE(CVE-2022-22963 등) 다수 사례가 SpEL Injection

## 관련 문서

- [annotation/](annotation/)
- [../CS 이론/소프트웨어 아키텍처/](../CS%20이론/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4%20%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98/)
- [XSS.md](XSS.md)
