# OpenAPI

> 최종 업데이트: 2026-03-23 | 기준: OpenAPI 3.1.0

## OpenAPI란?

OpenAPI Specification(OAS) — RESTful API를 JSON이나 YAML로 정의하는 업계 표준 규격.

## OpenAPI vs Swagger

| 구분 | 설명 |
|------|------|
| OpenAPI | RESTful API 디자인에 대한 **규격(Specification)** |
| Swagger | OpenAPI 규격을 구현하는 **도구 모음** |

- SmartBear가 Swagger 2.0의 **규격(Specification)만** Linux Foundation 산하 OpenAPI Initiative(OAI)에 기부 → OpenAPI 3.0으로 발전
- Swagger UI, Swagger Editor 등 **도구는 여전히 SmartBear 소유**
- springdoc-openapi는 위 둘과 무관한 별도 오픈소스로, Spring Boot에서 OpenAPI 문서를 자동 생성하는 라이브러리

## 스펙 기본 구조

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0

servers:
  - url: https://api.example.com/v1

paths:
  /users:
    get:
      summary: 사용자 목록 조회
      operationId: getUsers
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
      required:
        - id
        - name
```

## 주요 구성 요소

| 요소 | 설명 |
|------|------|
| `openapi` | 스펙 버전 |
| `info` | API 제목, 버전, 설명 |
| `servers` | API 서버 URL 목록 |
| `paths` | 엔드포인트별 HTTP 메서드 정의 |
| `components` | 재사용 가능한 스키마, 파라미터, 응답 등 |
| `security` | 인증 방식 정의 (Bearer, OAuth2 등) |
| `tags` | API 그룹핑 |

## OpenAPI 3.0 vs 3.1 주요 차이

| 항목 | 3.0 | 3.1 |
|------|-----|-----|
| JSON Schema | 자체 변형 | JSON Schema 2020-12 완전 호환 |
| `nullable` | `nullable: true` 사용 | `type: ["string", "null"]` |
| Webhook | 미지원 | `webhooks` 필드 지원 |

## OpenAPI 생태계 구조

```
┌─────────────────────────────────────────────────┐
│  OpenAPI Initiative (Linux Foundation 산하)       │
│  → OpenAPI Specification 규격 관리                │
└─────────────────────────────────────────────────┘
                      ↓ 규격 기반
┌─────────────────────────────────────────────────┐
│  도구 & 라이브러리                                 │
│                                                   │
│  SmartBear (상업/오픈소스)                          │
│  ├── Swagger UI      : 스펙 시각화 및 API 테스트   │
│  ├── Swagger Editor   : 스펙 작성/편집             │
│  └── Swagger Codegen  : 코드 자동 생성             │
│                                                   │
│  오픈소스 커뮤니티                                  │
│  ├── springdoc-openapi : Spring Boot 연동          │
│  ├── OpenAPI Generator : 코드 자동 생성 (fork)     │
│  ├── Redoc            : 문서 렌더링 (읽기 전용)    │
│  └── Postman          : 스펙 import 지원           │
└─────────────────────────────────────────────────┘
```

## OpenAPI 활용 흐름

```
API 설계 (Swagger Editor 등에서 스펙 작성)
        ↓
OpenAPI Specification (JSON/YAML)
        ↓
  ┌─────────┬──────────────┬──────────────┐
  ↓         ↓              ↓              ↓
문서화    코드 생성      테스트        서버 연동
Swagger UI  OpenAPI     Postman     springdoc-openapi
Redoc     Generator                (Spring Boot → 스펙 자동 생성)
```

