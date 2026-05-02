# MSA (Microservice Architecture)

> 최종 업데이트: 2026-04-18 | 기준: 일반 이론 + 현업 관행

## 개념

MSA(Microservice Architecture, 마이크로서비스 아키텍처)는 **하나의 큰 애플리케이션을, 작고 독립적으로 배포 가능한 여러 서비스로 쪼개서** 구성하는 아키텍처 스타일이다. 각 서비스는 자기 DB와 자기 코드베이스를 가지고, 네트워크(HTTP/gRPC/메시지큐)로만 통신한다.

> 비유하자면 하나의 거대한 백화점(Monolith)을 쪼개서, 각기 독립된 **전문 매장들이 배달로 협업**하는 쇼핑 거리(MSA)로 만드는 것. 각 매장은 자기 재고(DB)와 자기 운영 방식을 가진다.

## 배경/역사

- **2011~2012** — 유럽 아키텍트 워크숍에서 "microservice" 용어가 정착
- **2014** — Martin Fowler & James Lewis가 "Microservices" 글 발표 ([링크](https://martinfowler.com/articles/microservices.html)) — 사실상 **MSA의 교과서 정의** 문서
- **Netflix** — 2008년 DB 장애로 서비스 전체가 3일간 중단된 사건을 계기로 AWS 이전과 함께 마이크로서비스 전환. **Eureka, Hystrix, Zuul, Ribbon** 등을 오픈소스화하며 MSA 대중화에 기여
- **Amazon** — "2-pizza team"(피자 2판으로 먹을 수 있는 크기 = 6~8명) 단위로 서비스를 소유하는 조직 구조와 결합
- **쿠버네티스(2015~)** — MSA 운영의 사실상 표준 플랫폼으로 자리잡음

## 모놀리식 vs MSA

| 항목 | Monolith | MSA |
|------|----------|-----|
| 배포 단위 | 하나의 거대한 앱 | 서비스별 독립 배포 |
| DB | 단일 DB 공유 | **서비스별 DB** (Database per Service) |
| 통신 | 함수/메서드 호출 | HTTP/gRPC/메시지큐 |
| 장애 격리 | 한 기능 장애 → 전체 장애 | 서비스 단위 격리 가능 |
| 기술 스택 | 보통 단일 | 서비스마다 다른 언어/DB 가능 |
| 초기 개발 속도 | 빠름 | 느림 (인프라 오버헤드) |
| 확장성 | 전체 스케일아웃 | 병목 서비스만 스케일아웃 |
| 팀 조직 | 전체 한 팀 | 서비스별 작은 팀 |

## 왜 쓰는가

### 1. 클라우드/오토스케일링 궁합

클라우드 인프라(AWS/GCP)는 **"작고 독립적인 단위를 수평 확장"** 하도록 설계됐다. MSA는 구조 자체가 이와 맞아떨어진다.

- 트래픽 많은 서비스만 pod 10개로 늘리고, 한산한 서비스는 1개로 유지 가능
- 모놀리스였다면 안 바쁜 기능까지 같이 스케일아웃해야 함 → 비용 낭비

### 2. 배포 독립성 / 개발 속도

- 결제 팀이 주문 팀 릴리스를 기다릴 필요가 없음
- 하루 수십 번의 배포(Netflix/Amazon)가 가능해짐
- 팀 경계가 명확해져 병렬 개발 효율↑

### 3. 장애 격리

- 추천 서비스가 죽어도 주문·결제는 살아있음
- Circuit Breaker / Bulkhead 같은 **탄력성(resilience)** 패턴으로 보강

### 4. 기술 다양성

- 검색 서비스는 Go + Elasticsearch, 정산은 Java + PostgreSQL… 서비스마다 최적 스택 선택

## 단점 / 비용

그냥 쪼개면 지옥이 열린다. 다음 비용을 감당할 수 있을 때 도입해야 한다.

- **분산 시스템의 복잡도** — 네트워크 실패, 타임아웃, 재시도, 멱등성
- **데이터 일관성** — 분산 트랜잭션 불가 → Saga/이벤트 기반 정합성
- **운영 오버헤드** — 서비스 N개 = 모니터링·로깅·배포 파이프라인 N세트
- **디버깅 난이도** — 한 요청이 여러 서비스를 거쳐 감 → 분산 추적(Tracing) 필수
- **조직 비용** — Conway's Law — 조직 구조가 아키텍처를 따라가지 못하면 MSA도 실패

> 일반 경험칙: **"Monolith First"**. 처음부터 MSA로 시작하지 말고, 모놀리스로 시작해 경계가 분명해진 후 분리.

## 서비스를 어떻게 나눌 것인가

가장 어려운 부분. 잘못 나누면 **"분산된 모놀리스(Distributed Monolith)"** 가 된다 (서비스는 쪼갰는데 배포는 같이 해야 함).

### DDD(Domain-Driven Design)의 Bounded Context 기준

- 업무 도메인의 경계를 분석해서 경계 문맥(Bounded Context) 단위로 서비스 분리
- 예: 주문, 결제, 배송, 회원, 상품, 재고 각각이 별개 Bounded Context

### 나누기 좋은 기준

- 데이터가 거의 공유되지 않는 경계
- 변경 주기가 다른 기능 (배포 독립성 확보 목적)
- 트래픽 패턴이 다른 기능 (스케일링 독립성)
- 규제/보안 요구가 다른 기능 (예: 결제는 PCI-DSS 격리)

### 나누기 안 좋은 신호

- 두 서비스가 **동시에 배포되어야** 하는 경우 → 잘못 나눔
- 두 서비스 간 **동기 호출이 체인처럼 긴** 경우 → 경계 재검토
- 같은 엔티티의 DB를 **두 서비스가 동시에 쓰는** 경우 → 소유권 불분명

## 핵심 구성 요소

```
              ┌────────────┐
   Client ──► │ API Gateway│  (인증/라우팅/rate limit)
              └─────┬──────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   ┌───────┐   ┌────────┐   ┌────────┐
   │Order  │   │Payment │   │Ship    │
   │Service│   │Service │   │Service │
   └───┬───┘   └───┬────┘   └───┬────┘
       ▼           ▼            ▼
   [Order DB]  [Pay DB]    [Ship DB]

   ↕ 비동기 이벤트
   ┌──────────────────────────────┐
   │  Message Broker (Kafka, SQS) │
   └──────────────────────────────┘
```

| 구성요소 | 역할 | 대표 기술 |
|---------|------|----------|
| **API Gateway** | 외부 진입점, 인증/라우팅 | Spring Cloud Gateway, Kong, AWS API Gateway |
| **Service Discovery** | 서비스 위치 찾기 | Eureka, Consul, Kubernetes DNS |
| **Config Server** | 설정 중앙화 | Spring Cloud Config, Consul KV |
| **Message Broker** | 비동기 이벤트 | Kafka, RabbitMQ, AWS SQS/SNS |
| **Circuit Breaker** | 장애 전파 차단 | Resilience4j, Hystrix(EOL) |
| **분산 추적** | 요청 흐름 추적 | Zipkin, Jaeger, AWS X-Ray |
| **로그/메트릭 집계** | 관측성 | ELK, Prometheus+Grafana, Datadog |

## 서비스 간 통신

| 방식 | 특징 | 쓰는 곳 |
|------|------|--------|
| **동기 REST/gRPC** | 간단, 결합도 높음 | 즉시 응답 필요한 조회 |
| **비동기 이벤트** | 느슨한 결합, 최종 일관성 | 도메인 이벤트 전파, 사이드이펙트 |
| **BFF(Backend for Frontend)** | 프론트 맞춤 aggregation | 화면별 응답 조합 |

## 데이터 관리 전략

모놀리스의 트랜잭션을 그대로 못 쓰므로 별도 패턴이 필요.

- **Database per Service** — 서비스는 자기 DB만 직접 접근. 남의 DB를 읽지 않음
- **Saga 패턴** — 긴 트랜잭션을 단계별 로컬 트랜잭션 + 보상 트랜잭션으로 나눔
- **Outbox 패턴** — DB 커밋과 메시지 발행의 원자성 보장
- **CQRS** — 명령(쓰기)과 조회(읽기)를 다른 모델로 분리
- **Event Sourcing** — 상태 대신 이벤트를 저장, 필요 시 재생

## 관측성 (Observability)

MSA에서는 **로그만 보는 디버깅이 불가능**. 3종 세트가 필수.

1. **Logs** — 구조화 로그 + 중앙 집계 (ELK, Loki)
2. **Metrics** — 서비스별 RPS/에러율/p99 latency (Prometheus, CloudWatch)
3. **Traces** — 요청 하나의 전 구간 추적 (OpenTelemetry, Jaeger)

## 백엔드 개발자가 알아야 할 실무 포인트

- **멱등성(Idempotency)** — 네트워크는 재시도되므로 같은 요청이 여러 번 와도 결과가 같아야 함
- **타임아웃 / 재시도 / 서킷브레이커** — 모든 외부 호출에 기본 적용
- **API 버저닝** — 서비스 독립 배포 = API 호환성 책임이 생김 (`/v1`, `/v2`)
- **Contract Test** — 서비스 간 API 계약을 테스트 (Pact 등)
- **비동기 우선(Async-first) 설계** — 필요한 곳만 동기로 두고 나머지는 이벤트로
- **12-Factor App 원칙** — 설정 외부화, stateless, 로그 stdout 등

## 언제 MSA를 쓰지 말아야 하는가

- 팀이 10명 미만 → 대개 모놀리스가 유리
- 도메인 경계가 아직 불분명 → 섣불리 쪼개면 리팩터링 지옥
- 운영 인력/플랫폼(K8s/관측성)이 준비되지 않음
- 트래픽이 낮고 단일 DB로 충분

## 참고

- Martin Fowler — Microservices (https://martinfowler.com/articles/microservices.html)
- Sam Newman — "Building Microservices" (책)
- https://ducktyping.tistory.com/6?category=1180172
