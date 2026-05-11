# Spring Cloud Gateway

> 최종 업데이트: 2026-04-24 | 기준: Spring Cloud Gateway 4.x (Spring Boot 3.x, WebFlux 기반)

## 개념

**Spring Cloud Gateway**는 Spring 진영의 **API Gateway(API 게이트웨이)** 구현체. MSA 환경에서 **여러 마이크로서비스 앞단에 놓여 요청을 라우팅·필터링·인증·모니터링**하는 관문 역할을 한다. Netflix Zuul의 후속으로, **Spring WebFlux + Reactor** 비동기 논블로킹 스택 위에서 동작한다.

> 비유하자면 **호텔 프런트 데스크**. 손님(클라이언트)이 어떤 방(서비스)을 찾는지 확인해 안내하고, 필요한 절차(인증·로깅·변환)를 처리하고, 너무 많은 요청이 몰리면 제한(rate limit)까지 걸어준다. 뒤쪽 방들은 손님과 직접 대면하지 않는다.

## 배경/역사

- **Netflix Zuul 1** (2013) — MSA용 게이트웨이 원조. 동기 Servlet 기반
- **Spring Cloud Netflix Zuul** — Spring 진영이 Zuul을 통합해서 배포
- **2017** — Spring이 **Spring Cloud Gateway** 를 자체 개발해 발표. **WebFlux 기반 비동기** 로 성능·확장성 개선
- **2018** — Netflix가 Zuul을 Zuul 2(비동기)로 리라이트했지만 Spring 통합이 지연 → Zuul은 Spring 생태계에서 점차 **Deprecated**
- **현재** — Spring 진영에서 **사실상 표준 게이트웨이**. 최근엔 **Servlet 기반 버전**(Spring Cloud Gateway MVC)도 제공

## API Gateway가 왜 필요한가

MSA에서는 수십~수백 개의 서비스가 존재. 클라이언트가 각각 직접 호출하면 생기는 문제를 **Gateway가 한곳에서 해결**.

| 문제 | Gateway 해결책 |
|------|--------------|
| 클라이언트가 서비스 URL을 다 알아야 함 | **단일 진입점** |
| 서비스별 인증 중복 | **공통 인증·인가** |
| CORS·로깅·모니터링 중복 구현 | **공통 필터** |
| 레거시 API 포맷 변환 필요 | **요청/응답 변환** |
| 트래픽 제어 어려움 | **Rate Limit, Circuit Breaker** |
| 클라이언트별 응답 조합 | **BFF 역할** |

## 전체 구조

```
                ┌─────────────────────────┐
                │   Spring Cloud Gateway   │
                │                          │
  Client ──► [Predicate 매칭] ──► [Filter 체인] ──► [라우팅]
                │                          │                │
                │  Host=xxx                │  인증, 로깅     │
                │  Path=/api/**            │  재시도        │
                │  Method=GET              │  요청변환      │
                │                          │                │
                └──────────────────────────┘                │
                                                            ▼
                                                   ┌─────────────┐
                                                   │ user-service│
                                                   │ order-svc   │
                                                   │ payment-svc │
                                                   └─────────────┘
```

## 3대 구성 요소

Spring Cloud Gateway의 모든 동작은 **Route + Predicate + Filter** 조합으로 표현된다.

### 1. Route (라우트)

Gateway의 **최소 단위**. ID, 대상 URI, Predicate, Filter로 구성.

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: http://user-service:8080
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
```

### 2. Predicate (조건식)

"어떤 요청을 이 라우트로 보낼지" 결정. Java 8 `Predicate`에서 따옴.

| Predicate | 설명 |
|-----------|------|
| `Path=/api/users/**` | 경로 매칭 |
| `Host=**.example.com` | Host 헤더 매칭 |
| `Method=GET,POST` | HTTP 메서드 |
| `Header=X-Request-Id,\d+` | 특정 헤더 패턴 |
| `Query=key,value` | 쿼리 파라미터 |
| `Cookie=name,regex` | 쿠키 |
| `After=2026-01-01T00:00:00+09:00[Asia/Seoul]` | 특정 시간 이후 |
| `RemoteAddr=192.168.0.0/16` | 클라 IP |
| `Weight=group1, 8` | 가중치(카나리 배포) |

### 3. Filter (필터)

라우팅 전/후에 요청·응답을 **가공·검사**하는 체인. Servlet 필터 개념과 유사.

| Filter | 용도 |
|--------|------|
| `AddRequestHeader=X-Forwarded-By, gateway` | 요청 헤더 추가 |
| `AddResponseHeader=X-Region, kr` | 응답 헤더 추가 |
| `RewritePath=/api/(?<seg>.*), /$\{seg}` | 경로 재작성 |
| `StripPrefix=1` | 앞 prefix 제거 |
| `SetPath=/new/path` | 경로 교체 |
| `Retry=3` | 실패 시 재시도 |
| `CircuitBreaker=myCB` | **서킷 브레이커** 통합 (Resilience4j) |
| `RequestRateLimiter` | **Rate Limit** (Redis 기반) |
| `RemoveRequestHeader=Cookie` | 헤더 제거 |

### 필터의 분류

- **Gateway Filter** — 특정 라우트에만 적용
- **Global Filter** — 모든 라우트에 자동 적용 (인증, 로깅 등)

## 설정 방식

### 1. YAML 선언형 (추천)

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://USER-SERVICE          # 서비스 디스커버리 연동
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Gateway, true
            - name: CircuitBreaker
              args:
                name: userCB
                fallbackUri: forward:/fallback/user
```

### 2. Java DSL 방식

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("user-route", r -> r.path("/api/users/**")
            .filters(f -> f.stripPrefix(1).addRequestHeader("X-Gateway", "true"))
            .uri("lb://USER-SERVICE"))
        .route("order-route", r -> r.path("/api/orders/**")
            .filters(f -> f.retry(3))
            .uri("lb://ORDER-SERVICE"))
        .build();
}
```

### 3. 동적 라우팅

- Actuator API(`POST /actuator/gateway/routes/{id}`)로 **런타임에 라우트 추가/삭제**
- Config Server·DB에서 라우트를 로드해 주기적으로 갱신
- **주의**: 이 기능을 외부에 노출하면 심각한 보안 취약점 (CVE-2022-22947 등)

## Zuul / Nginx / Kong과 비교

| 항목 | **Spring Cloud Gateway** | Zuul 1 | Nginx | Kong |
|------|-------------------------|--------|-------|------|
| 런타임 | **WebFlux (비동기)** | Servlet (동기) | C 네이티브 | Nginx + Lua |
| 확장 언어 | **Java** | Java | Lua | Lua, 플러그인 |
| 설정 | YAML/Java | Java | conf 파일 | DB + Admin API |
| 상태 관리 | Stateless | Stateless | Stateless | PostgreSQL/Cassandra |
| 성능 | 높음 | 중간 | **최고** | 높음 |
| Spring 생태계 | **완벽 통합** | 통합 | 별도 | 별도 |
| 관리 UI | 기본 없음 | 없음 | 서드파티 | **Konga 등** |

> Spring 기반이라면 **Spring Cloud Gateway**, Non-Java/초고성능이 필요하면 **Nginx/Kong**.

## 핵심 기능 상세

### 1. Service Discovery 연동

Eureka / Consul / Kubernetes Service와 연동해 URL 대신 **서비스 이름**으로 라우팅.

```yaml
uri: lb://USER-SERVICE     # lb:// + 서비스 이름
```

- Gateway가 디스커버리에서 인스턴스 목록을 받아 **클라이언트 사이드 로드밸런싱** 수행

### 2. Rate Limit (요청 제한)

Redis + Token Bucket 알고리즘 기반.

```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 10  # 초당 10개 허용
      redis-rate-limiter.burstCapacity: 20  # 버스트 최대 20개
      key-resolver: "#{@userKeyResolver}"
```

```java
@Bean
KeyResolver userKeyResolver() {
    return exchange -> Mono.just(exchange.getRequest().getHeaders().getFirst("X-User-Id"));
}
```

### 3. Circuit Breaker

Resilience4j와 통합해 **장애 전파 차단**.

```yaml
filters:
  - name: CircuitBreaker
    args:
      name: userCB
      fallbackUri: forward:/fallback/user
```

- 백엔드 실패율이 임계값을 넘으면 **회로가 열려** 요청을 즉시 fallback으로 돌림
- 자세한 원리: [AWS WAF·서킷 브레이커 관련 문서 참고]

### 4. 인증 / 인가

Gateway에서 중앙 인증 처리 패턴.

```java
@Bean
GlobalFilter authFilter() {
    return (exchange, chain) -> {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (!tokenService.validate(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    };
}
```

- 또는 **Spring Security + JWT + OAuth2 Resource Server**를 Gateway에 통합
- 대규모 환경에서는 **OAuth2 Token Relay** 로 뒤쪽 서비스에 토큰 포워딩

### 5. CORS / 로깅 / 모니터링

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "https://app.example.com"
            allowedMethods: "*"
```

- Micrometer 메트릭 자동 수집
- Actuator `/actuator/gateway/routes` 로 현재 라우트 조회

## WebFlux 기반이라는 의미

Spring Cloud Gateway는 **Netty + Reactor** 위에서 비동기 논블로킹으로 동작.

- 장점: **적은 스레드로 많은 동시 연결** 처리 (I/O 많은 게이트웨이에 적합)
- 단점: 블로킹 코드(JDBC, 동기 I/O)를 섞으면 성능 급락 → **Filter 안에서 blocking 금지**
- 비동기 사고방식이 필요 — `Mono`, `Flux` 다루기

> **Spring Cloud Gateway MVC** (Servlet 기반)도 있으니, WebFlux가 부담스러우면 이 옵션 검토.

## 보안 이슈 — SpEL Injection 계보

Gateway의 **동적 라우팅 기능은 SpEL을 광범위하게 평가**하는 구조라, 여러 SpEL Injection CVE가 반복 발생.

| CVE | 내용 |
|-----|------|
| **CVE-2022-22947** | Actuator 엔드포인트 노출 시 라우트 filter SpEL로 RCE |
| **CVE-2025-41243** | WebFlux 환경 SpEL 주입 취약점 |

**대응**:
- 항상 **최신 패치 버전** 유지
- **Actuator `/actuator/gateway/*` 외부 노출 금지**
- 라우트 설정에 **사용자 입력이 동적으로 주입되지 않도록**
- 자세한 내용: [../Spring/SpEL (Spring Expression Language).md](../Spring/SpEL%20%28Spring%20Expression%20Language%29.md)

## 아키텍처 예시

```
  ┌─ Client (Web/Mobile) ─────────┐
  │                                │
  └────────┬───────────────────────┘
           │ HTTPS
           ▼
  ┌────────────────────────────┐
  │  Spring Cloud Gateway       │
  │  - 인증 / JWT 검증           │
  │  - Rate Limit (Redis)       │
  │  - 라우팅 / 경로 재작성       │
  │  - Circuit Breaker          │
  │  - 로그·메트릭 수집           │
  └──────┬──────────┬──────┬────┘
         │          │      │
         │   lb://USER-SERVICE
         │          │      │
         ▼          ▼      ▼
      user-svc   order-svc  payment-svc
      (여러 인스턴스, Eureka 등록)
```

## 백엔드 개발자 실무 포인트

- **Gateway는 stateless 유지** — 세션은 Redis 같은 외부 저장소로, Gateway는 확장이 자유로워야 함
- **블로킹 I/O 절대 금지** — JDBC, 동기 HTTP 클라이언트 쓰면 Netty 스레드 막힘. `WebClient` 사용
- **Global Filter 순서** — `@Order` 또는 `GlobalFilter#getOrder()`로 제어. 인증 → 로깅 → Rate Limit 순서 등
- **Circuit Breaker + Retry 조합** — 순서 잘못 두면 폭주. 보통 `Retry → CircuitBreaker`
- **Gateway 수평 확장** — 앞에 L4/L7 LB 두고 여러 Gateway 인스턴스 분산
- **로그 주의** — 요청 본문 로깅 시 민감정보(토큰, 개인정보) 마스킹 필수
- **테스트** — `WebTestClient` 로 라우팅·필터 단위 테스트 가능

## 언제 쓰지 말아야 하나

- **단일 서비스** — 게이트웨이 없어도 충분
- **초고성능 정적 라우팅만 필요** — Nginx가 훨씬 가벼움
- **Java 생태계가 아닌 환경** — Kong, Traefik 등이 더 적합
- **WebFlux 학습 곡선이 부담** — Spring Cloud Gateway MVC 또는 다른 솔루션 검토

## 관련 문서

- [스프링클라우드 개념.md](스프링클라우드%20개념.md)
- [../Spring/SpEL (Spring Expression Language).md](../Spring/SpEL%20%28Spring%20Expression%20Language%29.md)
- [../MSA/MSA란.md](../MSA/MSA%EB%9E%80.md)
- [../CS-이론/네트워크/통신-프로토콜/HTTP/HTTP.md](../CS-%EC%9D%B4%EB%A1%A0/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%ED%86%B5%EC%8B%A0-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C/HTTP/HTTP.md)
