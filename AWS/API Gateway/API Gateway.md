# API Gateway

> 최종 업데이트: 2026-04-17 | 기준 정보: Amazon API Gateway (2026년 4월)

## 개념

API Gateway는 **클라이언트의 API 요청을 받아서 적절한 백엔드로 전달하는 "API 전용 문지기(Gatekeeper)"** 역할을 하는 AWS 관리형 서비스다. 건물의 경비실에 비유하면, 방문자 신원 확인(인증) → 입장 통제(Rate Limit) → 목적지 안내(라우팅)까지 대신 처리해주는 창구다.

- 클라이언트 ↔ 백엔드(Lambda, ECS, EC2, 외부 HTTP) 사이의 **단일 진입점**
- 인증, 요청/응답 변환, 스로틀링, 캐싱, 로깅을 Gateway에서 일괄 처리
- 서버리스 API, 마이크로서비스 게이트웨이, 모바일/웹 백엔드 등에 사용

## 배경/역사

- **2015년 7월 출시** — Lambda(2014)와 함께 AWS 서버리스 스택의 핵심으로 자리잡음
- 초기에는 **REST API** 타입만 존재 → 기능이 많지만 비용이 비쌈
- **2019년 HTTP API** 추가 — REST API보다 약 **70% 저렴**하고 지연시간도 개선, 기능은 일부 축소
- **WebSocket API** 지원 — 실시간 채팅/알림용
- 2024~2025년 **VPC Lattice**, **Service Connect** 등 새로운 내부 통신 서비스가 나오면서 "API Gateway vs 다른 게이트웨이" 선택지가 다양해짐

## API 타입 비교

| 구분 | REST API | HTTP API | WebSocket API |
|------|----------|----------|---------------|
| 주 용도 | 풀기능 REST 엔드포인트 | 경량 HTTP 프록시 | 양방향 실시간 통신 |
| 비용 | 비쌈 (1M 요청당 $3.50) | 저렴 (1M 요청당 $1.00) | 연결 시간 + 메시지 기반 |
| 지연시간 | 보통 | 낮음 | — |
| 캐싱 | ✅ 지원 | ❌ 미지원 | — |
| 요청/응답 변환 | ✅ (VTL 템플릿) | 제한적 | — |
| 사용량 플랜/API 키 | ✅ | ❌ | ❌ |
| JWT Authorizer | ❌ (Custom만) | ✅ 내장 | ✅ |
| Private 엔드포인트 | ✅ (VPC) | ❌ | ❌ |
| 추천 시점 | 레거시 호환, 고급 기능 필요 | **신규 프로젝트 기본 선택** | 채팅, 실시간 피드 |

## 핵심 구성 요소

| 구성 요소 | 설명 |
|----------|------|
| **Resource** | URL 경로 (`/users`, `/orders/{id}`) |
| **Method** | HTTP 메서드 (GET, POST, PUT, DELETE…) |
| **Integration** | 요청을 전달할 백엔드 (Lambda, HTTP, AWS 서비스, Mock) |
| **Stage** | 배포 환경 단위 (`dev`, `staging`, `prod`) |
| **Authorizer** | 인증 처리기 (IAM, Cognito, JWT, Lambda Custom) |
| **Usage Plan / API Key** | 고객/팀별 호출량 제한 및 과금 관리 |

## 주요 기능

### 인증/인가 (Authorizer)
- **IAM Authorizer** — AWS SigV4 서명 기반 (AWS 내부 서비스 호출에 적합)
- **Cognito User Pool** — Cognito 발급 토큰 검증
- **JWT Authorizer** (HTTP API 전용) — 외부 IdP 토큰 검증
- **Lambda Authorizer** — 완전 커스텀 로직 (토큰/요청 기반)

### 스로틀링 (Rate Limiting)
- 계정/스테이지/메서드/API 키 단위로 RPS 제한
- 초과 요청은 `429 Too Many Requests` 응답

### 캐싱 (REST API)
- Stage 단위로 응답 캐시 활성화 (TTL 0~3600초)
- 캐시 크기 0.5GB ~ 237GB 선택 가능

### 요청/응답 변환 (REST API)
- VTL(Velocity Template Language)로 페이로드 매핑
- 예: XML → JSON 변환, 헤더 추가/제거

### 사용자 지정 도메인
- `api.example.com` 같은 자체 도메인 연결
- ACM 인증서로 HTTPS 적용

## Integration 유형

| 유형 | 설명 |
|------|------|
| **Lambda Proxy** | 요청을 그대로 Lambda에 전달 (가장 많이 사용) |
| **Lambda Non-Proxy** | VTL 매핑으로 요청 가공 후 Lambda 호출 |
| **HTTP** | 외부 HTTP 엔드포인트로 프록시 |
| **AWS Service** | DynamoDB, S3 등 AWS API 직접 호출 |
| **Mock** | 백엔드 없이 고정 응답 반환 (개발/테스트용) |

## 간단한 구성 예시 (CloudFormation / SAM)

### SAM 템플릿 — HTTP API + Lambda
```yaml
Resources:
  HelloApi:
    Type: AWS::Serverless::HttpApi

  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs22.x
      Events:
        GetHello:
          Type: HttpApi
          Properties:
            ApiId: !Ref HelloApi
            Path: /hello
            Method: GET
```

### REST API에서 Usage Plan 설정
```yaml
UsagePlan:
  Type: AWS::ApiGateway::UsagePlan
  Properties:
    Throttle:
      RateLimit: 100      # 초당 100건
      BurstLimit: 200
    Quota:
      Limit: 10000        # 월 10,000건
      Period: MONTH
```

## 동작 흐름

```
[Client]
   │ HTTPS 요청
   ▼
[API Gateway]
   │ 1) 도메인/경로 매칭
   │ 2) Authorizer 검증
   │ 3) 스로틀링 체크
   │ 4) (선택) 요청 변환
   ▼
[Integration → Lambda / HTTP / AWS Service]
   │ 응답
   ▼
[API Gateway]
   │ 5) (선택) 응답 변환/캐싱
   ▼
[Client]
```

## 요금 체계 (2026년 4월 us-east-1 기준)

- **HTTP API**: 1M 요청당 **$1.00** (월 300M 요청 이상 할인)
- **REST API**: 1M 요청당 **$3.50** + 캐시 사용 시 시간당 추가
- **WebSocket API**: 메시지 1M당 **$1.00** + 연결 유지 시간 과금
- 프리티어: REST/HTTP 각 월 **1M 요청 (12개월)**

## 장단점

### 장점
- 인증/스로틀링/로깅 같은 공통 기능을 코드 없이 설정
- Lambda와 결합 시 완전한 서버리스 API 구성 가능
- 자동 스케일링, 관리 부담 없음
- CloudWatch 기반 상세 메트릭/로깅 내장

### 단점
- 대규모 트래픽에서는 **자체 ALB + ECS 구성보다 비싸질 수 있음**
- REST API는 Cold Start에 API Gateway 자체 지연이 더해짐 (~30ms)
- 페이로드 크기 제한: **요청 10MB, 응답 10MB**, 타임아웃 **29초** (기본)
- 복잡한 VTL 매핑은 디버깅이 까다로움

## 사용 사례

- **서버리스 백엔드**: API Gateway + Lambda + DynamoDB
- **기존 서비스 앞단의 API 게이트웨이**: 인증/스로틀링만 위임
- **마이크로서비스 외부 진입점**: 여러 ECS/EKS 서비스 라우팅
- **실시간 알림/채팅**: WebSocket API + Lambda
- **파트너 API 공개**: API Key + Usage Plan으로 티어별 과금

## 대안 비교

| 서비스 | 적합한 경우 |
|--------|-----------|
| **API Gateway** | 서버리스, 인증/스로틀링 내장 필요 |
| **ALB (Application Load Balancer)** | 대규모 HTTP 트래픽, 비용 최적화, VPC 내부 |
| **CloudFront + Lambda@Edge** | 글로벌 CDN + 엣지 로직 |
| **AppSync** | GraphQL API 전용 |
| **VPC Lattice** | VPC 간 내부 서비스 통신 |
