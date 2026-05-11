# REST

> 최종 업데이트: 2026-04-08 | Roy Fielding 논문(2000) 기준, 실무 RESTful API 설계 관행 포함

Representational State Transfer

[로이 필딩 논문](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)

## 개념

REST는 **네트워크 소프트웨어의 아키텍처 스타일(Architectural Style)**이다.

> 비유: REST는 "건축 양식"과 같다. 고딕 양식이 뾰족한 아치, 스테인드글라스 등의 **제약조건 집합**이듯, REST도 6가지 제약조건을 정의하여 웹 시스템이 따라야 할 구조를 제시한다.

### 탄생 배경

| 항목 | 내용 |
|------|------|
| 제안자 | **Roy T. Fielding** |
| 시기 | 2000년 박사 논문 *Architectural Styles and the Design of Network-based Software Architectures* |
| 배경 | HTTP 1.0 / 1.1 스펙 설계에 직접 참여하면서, 웹이 이미 갖추고 있는 인프라(HTTP, URI, HTML)를 최대한 활용하는 아키텍처를 정리 |
| 핵심 목표 | 확장성(Scalability), 범용성(Generality), 독립 배포(Independent Deployment) |

### 핵심 아이디어

네트워크의 대부분이 **월드 와이드 웹**이기 때문에, 사실상 웹 기반 전송(HTTP)에 쓰이는 경우가 대부분이다. REST를 준수하는 HTTP 기반 웹 API를 **RESTful API**라고 부른다.

---

## REST 6가지 제약조건

REST는 구체적인 프로토콜이 아니라, 아래 6가지 **제약조건(Constraints)**의 집합이다.

> 비유: 레스토랑 프랜차이즈의 운영 매뉴얼과 비슷하다. "주방과 홀은 분리(Client-Server)", "주문마다 독립 처리(Stateless)", "자주 주문하는 메뉴는 미리 준비(Cache)" 같은 규칙을 지키면 어떤 지점이든 일관된 서비스 품질을 유지할 수 있다.

| # | 제약조건 | 핵심 설명 | 필수 여부 |
|---|---------|----------|----------|
| 1 | **Client-Server** | 클라이언트와 서버의 관심사를 분리. UI와 데이터 저장을 독립적으로 진화 가능 | 필수 |
| 2 | **Stateless** | 각 요청은 필요한 모든 정보를 포함. 서버는 클라이언트 상태를 저장하지 않음 | 필수 |
| 3 | **Cacheable** | 응답에 캐시 가능 여부를 명시하여 불필요한 요청을 줄임 | 필수 |
| 4 | **Uniform Interface** | 리소스 조작 방식을 통일. REST의 가장 핵심적인 제약조건 | 필수 |
| 5 | **Layered System** | 클라이언트는 직접 서버에 연결되었는지, 중간 계층(프록시, 로드밸런서)을 거치는지 알 수 없음 | 필수 |
| 6 | **Code on Demand** | 서버가 클라이언트에 실행 가능한 코드(JavaScript 등)를 전송 가능 | **선택** |

### Stateless 예시

```
-- Stateful (REST 위반) --
Client: "장바구니에 사과 추가해줘"
Server: (세션에 사과 저장)
Client: "결제해줘"            ← 서버가 이전 상태를 기억해야 함

-- Stateless (REST 준수) --
Client: "장바구니=[사과, 바나나] 로 결제해줘"  ← 요청 하나에 모든 정보 포함
```

### Cacheable 예시

```http
GET /products/42 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: max-age=3600
ETag: "v1-product42"
```

---

## Uniform Interface (핵심 제약조건)

REST를 다른 아키텍처 스타일과 구분짓는 **가장 중요한 제약조건**이다. 4가지 하위 제약조건으로 구성된다.

> 비유: 전 세계 어디서든 USB-C 포트에 케이블을 꽂으면 동작하는 것처럼, 리소스를 다루는 방식을 하나로 통일하면 클라이언트-서버 간 결합도가 낮아진다.

| 하위 제약조건 | 설명 | 예시 |
|-------------|------|------|
| **Resource Identification** | 각 리소스는 URI로 고유하게 식별 | `GET /users/42` |
| **Resource Manipulation through Representations** | 리소스의 표현(JSON, XML 등)을 주고받아 리소스를 조작 | 요청 본문에 JSON을 담아 `PUT /users/42` |
| **Self-descriptive Messages** | 메시지 자체에 처리 방법이 담겨야 함 (Content-Type, HTTP 메서드 등) | `Content-Type: application/json` |
| **HATEOAS** | 응답에 다음 가능한 행동(링크)을 포함 | 아래 예시 참조 |

### HATEOAS

**Hypermedia As The Engine Of Application State**

응답 본문에 관련 리소스로의 링크를 포함하여, 클라이언트가 서버 API 구조를 사전에 알 필요 없이 링크를 따라가며 상태를 전이할 수 있게 하는 제약조건이다.

```json
{
  "id": 42,
  "name": "Alice",
  "links": [
    { "rel": "self",   "href": "/users/42" },
    { "rel": "orders", "href": "/users/42/orders" },
    { "rel": "delete", "href": "/users/42", "method": "DELETE" }
  ]
}
```

> HATEOAS는 [Richardson Maturity Model](Richardson-Maturity-Model.md)의 **Level 3**에 해당한다. 상세 내용은 해당 문서 참조.

---

## REST vs RESTful

대부분의 실무 API는 **완전한 REST가 아니다.** Roy Fielding 본인도 이 점을 여러 차례 지적했다.

```
REST (이론)                        실무 API
───────────────────────────────────────────────────
6가지 제약조건 모두 만족             대부분 Uniform Interface 일부만 만족
HATEOAS 필수                       HATEOAS 거의 미구현
Self-descriptive Messages 필수      Content-Type 정도만 명시
```

| 구분 | REST | RESTful API (실무) |
|------|------|-------------------|
| 정의 | Roy Fielding이 제시한 아키텍처 스타일 전체 | REST 제약조건을 **부분적으로** 따르는 HTTP API |
| HATEOAS | 필수 | 거의 구현하지 않음 |
| 엄밀한 REST 여부 | O | 대부분 X (REST-like 또는 HTTP API에 가까움) |

> 현실적으로 "RESTful API"라 불리는 대다수 API는 **Richardson Maturity Model Level 2** 수준이다. 성숙도 모델 상세는 [Richardson Maturity Model](Richardson-Maturity-Model.md) 참조.

---

## RESTful API 설계 원칙 (실무)

### URI 설계 규칙

| 규칙 | Good | Bad |
|------|------|----|
| 명사 사용 (동사 X) | `/users` | `/getUsers` |
| 복수형 | `/products` | `/product` |
| 계층 구조 표현 | `/users/42/orders` | `/getUserOrders?id=42` |
| 소문자 + 하이픈 | `/order-items` | `/OrderItems`, `/order_items` |
| 확장자 미포함 | `/users/42` | `/users/42.json` |
| 마지막 슬래시 X | `/users` | `/users/` |

### HTTP 메서드 매핑

| 메서드 | 목적 | 멱등성 | 안전성 | URI 예시 |
|--------|------|--------|--------|---------|
| `GET` | 리소스 조회 | O | O | `GET /users/42` |
| `POST` | 리소스 생성 | X | X | `POST /users` |
| `PUT` | 리소스 전체 교체 | O | X | `PUT /users/42` |
| `PATCH` | 리소스 부분 수정 | X | X | `PATCH /users/42` |
| `DELETE` | 리소스 삭제 | O | X | `DELETE /users/42` |

> **멱등성(Idempotent)**: 같은 요청을 여러 번 보내도 결과가 동일. `PUT`은 멱등이지만 `PATCH`는 구현에 따라 다를 수 있다.

### 상태 코드 활용

| 범주 | 주요 코드 | 설명 |
|------|----------|------|
| **2xx** 성공 | `200 OK` | 요청 정상 처리 |
| | `201 Created` | 리소스 생성 완료 (POST 성공 시) |
| | `204 No Content` | 성공했지만 응답 본문 없음 (DELETE 성공 시) |
| **4xx** 클라이언트 오류 | `400 Bad Request` | 잘못된 요청 (유효성 검증 실패 등) |
| | `401 Unauthorized` | 인증 필요 |
| | `403 Forbidden` | 인가 실패 (권한 없음) |
| | `404 Not Found` | 리소스 없음 |
| | `409 Conflict` | 리소스 충돌 (중복 생성 등) |
| **5xx** 서버 오류 | `500 Internal Server Error` | 서버 내부 오류 |
| | `503 Service Unavailable` | 서버 일시적 사용 불가 |

### 버전 관리

| 방식 | 예시 | 장점 | 단점 |
|------|------|------|------|
| **URI Path** | `/api/v1/users` | 직관적, 브라우저에서 테스트 용이 | URI 오염 |
| **Header** | `Accept: application/vnd.myapp.v1+json` | URI 깔끔 | 테스트/디버깅 불편 |
| **Query Param** | `/users?version=1` | 간단 | 캐시 키 복잡 |

> 실무에서는 **URI Path 방식**이 가장 널리 사용된다.

---

## 전체 요청-응답 흐름

```
Client                          Server
  |                               |
  |  1. GET /api/v1/users/42      |
  |  Host: example.com            |
  |  Accept: application/json     |
  |  Authorization: Bearer xxx    |
  | ----------------------------→ |
  |                               |  2. URI로 리소스 식별
  |                               |  3. 인증/인가 확인
  |                               |  4. 리소스 조회
  |                               |  5. JSON 표현 생성
  |                               |
  |  6. HTTP/1.1 200 OK           |
  |  Content-Type: application/json
  |  Cache-Control: max-age=60    |
  |  {                            |
  |    "id": 42,                  |
  |    "name": "Alice",           |
  |    "links": [                 |
  |      {"rel":"self",           |
  |       "href":"/users/42"}     |
  |    ]                          |
  |  }                            |
  | ←---------------------------- |
  |                               |
```

```
[Uniform Interface 제약조건 매핑]

  GET /users/42                → Resource Identification (URI)
  Accept: application/json     → Representation
  Content-Type, 메서드, 상태코드 → Self-descriptive Messages
  links 배열                    → HATEOAS
```

---

## Spring Boot에서의 RESTful API 예시

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);  // 200 OK
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid UserRequest req) {
        User created = userService.create(req);
        URI location = URI.create("/api/v1/users/" + created.getId());
        return ResponseEntity.created(location).body(created);  // 201 Created
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}
```

---

## 관련 기술 및 생태계

| 구분 | 이름 | 설명 |
|------|------|------|
| 프레임워크 | **Spring MVC / Spring WebFlux** | Java/Kotlin 진영 대표 REST API 프레임워크 |
| | **Express.js** | Node.js 진영 경량 웹 프레임워크 |
| | **Django REST Framework** | Python 진영 REST API 프레임워크 |
| 문서화 도구 | **Swagger / OpenAPI** | REST API 스펙 문서화 및 자동 생성 |
| | **Spring REST Docs** | 테스트 기반 API 문서 생성 |
| HATEOAS 구현 | **Spring HATEOAS** | Spring 생태계 HATEOAS 지원 라이브러리 |
| 대안 기술 | **GraphQL** (Facebook, 2015) | 클라이언트가 필요한 데이터 구조를 직접 정의 |
| | **gRPC** (Google) | Protocol Buffers 기반 고성능 RPC |

---

## 참고

- https://en.wikipedia.org/wiki/Representational_state_transfer
- https://en.wikipedia.org/wiki/HATEOAS
- https://tv.naver.com/v/2292653
- [Richardson Maturity Model](Richardson-Maturity-Model.md)
