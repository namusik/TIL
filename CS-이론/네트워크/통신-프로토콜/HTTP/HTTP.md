# HTTP (Hypertext Transfer Protocol)

> 최종 업데이트: 2026-04-22 | 기준: HTTP/1.1 (RFC 9110~9112), HTTP/2 (RFC 9113), HTTP/3 (RFC 9114)

## 개념

**HTTP(Hypertext Transfer Protocol)** 는 웹의 기본 통신 프로토콜. 클라이언트가 서버에 **요청(Request)** 을 보내고 서버가 **응답(Response)** 을 돌려주는 **요청/응답(request-response)** 모델로 동작한다. 1989년 팀 버너스리가 웹을 설계하면서 만든 이후 지금까지 웹 통신의 근간.

> 비유하자면 **편지 주고받기**. 주소(URL)·제목(헤더)·본문(body)을 갖춘 편지를 보내면 상대가 답장을 보내주는 방식. 한 번 편지 교환이 끝나면 대화가 종료된다 — 그래서 기본적으로 **무상태(stateless)**.

## 배경/역사

- **1989~1991** — 팀 버너스리(Tim Berners-Lee)가 CERN에서 웹 설계. **HTTP/0.9** 공개 (한 줄짜리 GET만)
- **1996** — **HTTP/1.0** (RFC 1945) — 헤더, 상태 코드 도입
- **1997** — **HTTP/1.1** (RFC 2068 → 2616 → 9110~9112) — Keep-Alive, Host 헤더, 파이프라이닝
- **2015** — **HTTP/2** (RFC 7540 → 9113) — **바이너리 프레임**, 멀티플렉싱, 헤더 압축(HPACK)
- **2022** — **HTTP/3** (RFC 9114) — **QUIC(UDP) 기반**, TCP 헤드오브라인 블로킹 해소

### 버전별 핵심 차이

| 버전 | 전송 | 주요 특징 |
|------|------|----------|
| HTTP/1.0 | TCP, 연결당 1요청 | 헤더, 상태 코드 |
| **HTTP/1.1** | TCP, **Keep-Alive** | **여전히 가장 널리 쓰임**, 파이프라이닝(제한적) |
| HTTP/2 | TCP, **바이너리** | **멀티플렉싱**, HPACK 헤더 압축, 서버 푸시 |
| HTTP/3 | **QUIC(UDP)** | 0-RTT, 연결 마이그레이션, HOL 블로킹 해소 |

## 동작 방식

```
Client                         Server
  │                              │
  │  HTTP Request                │
  │  ────────────────────────►   │
  │  GET /index.html HTTP/1.1    │
  │  Host: example.com           │
  │  (요청 헤더 + 바디)            │
  │                              │
  │  HTTP Response               │
  │  ◄────────────────────────   │
  │  HTTP/1.1 200 OK             │
  │  Content-Type: text/html     │
  │  (응답 헤더 + 바디)            │
```

### 메시지 구조

**요청/응답 모두 동일한 3부분** — 시작 라인, 헤더, (빈 줄 + 선택적 바디).

```
[시작 라인]        // 요청: GET /path HTTP/1.1 / 응답: HTTP/1.1 200 OK
[헤더들]           // Key: Value 형식, 여러 줄
                  // 빈 줄로 헤더 끝 표시
[바디]             // 선택 — JSON, HTML, 파일 등
```

## 요청 메서드 (Methods)

자주 쓰이는 것부터.

| 메서드 | 용도 | 안전? | 멱등? |
|-------|------|------|------|
| **`GET`** | 조회 | O | O |
| **`POST`** | 생성·실행 | X | X |
| **`PUT`** | 전체 교체 | X | O |
| **`PATCH`** | 부분 수정 | X | △ |
| **`DELETE`** | 삭제 | X | O |
| `HEAD` | 헤더만 조회 | O | O |
| `OPTIONS` | 허용 메서드 확인 (CORS 프리플라이트) | O | O |
| `CONNECT` | 터널 연결 (HTTPS 프록시) | X | X |
| `TRACE` | 루프백 테스트 | O | O |

- **안전(Safe)** — 서버 상태를 바꾸지 않음
- **멱등(Idempotent)** — 여러 번 호출해도 결과 동일

## 상태 코드 (Status Codes)

서버 응답의 첫 3자리 숫자.

| 범위 | 의미 | 대표 코드 |
|------|------|---------|
| **1xx** | 정보 | `101 Switching Protocols` (WebSocket 업그레이드) |
| **2xx** | 성공 | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** | 리다이렉션 | `301 Moved Permanently`, `302 Found`, `304 Not Modified` |
| **4xx** | 클라이언트 오류 | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests` |
| **5xx** | 서버 오류 | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout` |

## 주요 헤더

### 요청 헤더

| 헤더 | 용도 |
|------|------|
| `Host` | 대상 서버 도메인 (HTTP/1.1 필수) |
| `User-Agent` | 클라이언트 정보 (브라우저 종류 등) |
| `Accept` | 수용 가능한 미디어 타입 (`application/json` 등) |
| `Accept-Encoding` | 수용 가능한 압축 (`gzip, br`) |
| `Authorization` | 인증 정보 (`Bearer <token>`) |
| `Cookie` | 세션 쿠키 |
| `Content-Type` | 요청 바디 포맷 |
| `Content-Length` | 요청 바디 바이트 수 |
| `Origin` | CORS 출처 |

### 응답 헤더

| 헤더 | 용도 |
|------|------|
| `Content-Type` | 응답 바디 포맷 |
| `Content-Length` | 응답 바디 바이트 수 |
| `Set-Cookie` | 쿠키 설정 |
| `Cache-Control` | 캐싱 정책 |
| `ETag` | 자원 버전 식별자 |
| `Location` | 리다이렉션 URL |
| `Access-Control-Allow-Origin` | CORS 허용 출처 |

## 주요 특성

### 1. Stateless (무상태)

- 각 요청은 독립적, 이전 요청을 **서버가 기억하지 않음**
- 로그인 상태 유지 등은 **Cookie / Session / Token**으로 별도 관리
- 확장성(수평 스케일) 유리

### 2. Connectionless → Keep-Alive

- HTTP/1.0 기본: 매 요청마다 TCP 연결·해제
- HTTP/1.1: **Keep-Alive**로 연결 재사용 (기본 동작)
- HTTP/2: 하나의 연결로 여러 요청을 **멀티플렉싱**

### 3. Text-based → Binary

- HTTP/1.x: 텍스트 기반 (`GET / HTTP/1.1\r\n`)
- HTTP/2+: **바이너리 프레임** (효율·보안·파싱 속도↑)

## HTTPS (HTTP over TLS)

- HTTP + **TLS 암호화** = HTTPS
- 포트 443 (HTTP는 80)
- 현대 웹은 사실상 **HTTPS 필수** — 브라우저가 HTTP 사이트에 경고 표시
- **TLS 핸드셰이크**로 대칭 키 교환 → 이후 암호화된 통신

## Content-Type — 바디 포맷

HTTP 바디의 데이터 종류를 명시하는 필수 정보.

| Content-Type | 용도 |
|-------------|------|
| `application/json` | **JSON** (API 표준) |
| `application/x-www-form-urlencoded` | HTML 폼 기본 전송 |
| `multipart/form-data` | **파일 업로드** (아래 상세) |
| `text/html` | HTML 문서 |
| `text/plain` | 평문 |
| `application/octet-stream` | 바이너리 (일반 파일 다운로드) |
| `text/event-stream` | **SSE** |
| `application/grpc` | gRPC |

### multipart/form-data 상세

요청 바디를 여러 **파트(part)** 로 나누어 전송하는 표준 형식. **파일 업로드에 주로 사용**.

- 각 파트는 **개별 헤더 + 콘텐츠**를 가짐
- 파트 구분은 **boundary(경계 문자열)** 로 — 클라이언트가 임의 생성
- 바디 안에서 `--<boundary>` 형태로 사용

#### 파트 구조

- **`Content-Disposition`** 헤더 필수: `form-data; name="<필드명>"; filename="<파일명>"` (파일일 때 `filename` 포함)
- (선택) **`Content-Type`**: 파일이면 MIME 타입(예: `image/png`)
- **빈 줄 후 실제 콘텐츠** (바이너리/텍스트)
- 마지막 표식: `--<boundary>--` 로 바디 끝을 닫음

```http
POST /client/v1/attach/info/bp_0001_20200924145602 HTTP/1.1
Host: api.rcs.uplus.co.kr
Authorization: Bearer <access_token>
Content-Type: multipart/form-data; boundary=----Boundary7MA4YWxkTrZu0gW

------Boundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="attach_file"; filename="image.png"
Content-Type: image/png

<PNG 바이너리 바이트...>
------Boundary7MA4YWxkTrZu0gW--
```

## 캐싱

HTTP가 가진 강력한 기본 기능. 응답 속도 향상 + 서버 부하 감소.

| 헤더 | 역할 |
|------|------|
| `Cache-Control: max-age=3600` | 3600초 동안 캐시 유효 |
| `Cache-Control: no-cache` | 매번 서버에 유효성 검사 |
| `Cache-Control: no-store` | 아예 캐시 금지 |
| `ETag: "abc123"` | 자원 버전 태그 |
| `If-None-Match: "abc123"` | 클라이언트가 보낸 캐시 버전 → `304 Not Modified`로 응답 가능 |
| `Last-Modified` / `If-Modified-Since` | 수정 시간 기반 캐싱 |

## CORS (Cross-Origin Resource Sharing)

브라우저는 **다른 출처(origin)** 간 요청을 기본적으로 막는다. 서버가 **허용 헤더**를 응답해야 통과.

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

- **단순 요청** — 바로 요청
- **프리플라이트(Preflight)** — 복잡한 요청(`PUT`, 커스텀 헤더 등)은 사전에 `OPTIONS` 요청으로 허가 확인

## 인증 방식

HTTP 자체는 상태를 안 가지므로 인증은 별도 설계.

| 방식 | 설명 |
|------|------|
| **Basic** | `Authorization: Basic <base64(user:pass)>` — 간단, 평문 |
| **Bearer** | `Authorization: Bearer <token>` — OAuth/JWT 표준 |
| **Cookie/Session** | `Set-Cookie` + 서버 세션 저장소 |
| **API Key** | 헤더 또는 쿼리에 키 전달 |
| **mTLS** | 상호 TLS 인증서 검증 |

## HTTP 기반 위의 기법·프로토콜

HTTP 위에 여러 통신 기법과 프로토콜이 쌓인다.

| 종류 | 설명 |
|------|------|
| **REST** | HTTP 메서드 + URL로 리소스 CRUD를 설계하는 스타일 |
| **GraphQL over HTTP** | 쿼리 언어를 HTTP POST 바디에 담아 전송 |
| **gRPC / gRPC-Web** | HTTP/2 기반 RPC |
| **WebHook** | 이벤트 발생 시 서버→서버 HTTP 콜백 |
| **Polling / Long Polling** | HTTP 요청을 반복 또는 응답 지연으로 실시간화 |
| **SSE** | HTTP 응답을 스트리밍으로 유지 |

자세한 내용은 [통신-기법/](통신-기법/) 및 상위 `통신-프로토콜/` 참고.

## 백엔드 개발자 실무 포인트

- **요청/응답 로깅** — 접근 로그(Nginx, ALB)에 메서드·상태 코드·응답 시간 필수
- **HTTP/2 멀티플렉싱** — 모던 애플리케이션은 HTTP/2 이상 권장. 서버·로드밸런서·CDN 지원 확인
- **HTTPS 필수** — Let's Encrypt 등으로 무료 TLS 인증서
- **쿠키 보안 플래그** — `Secure`, `HttpOnly`, `SameSite` 3종 세트
- **`Content-Type` 정확히 지정** — 잘못 주면 브라우저가 오동작 (특히 JSON과 form)
- **상태 코드 의미 지키기** — 생성은 `201`, 검증 실패는 `422`, 인증 실패는 `401`, 권한 부족은 `403`
- **멱등성 설계** — `PUT`/`DELETE`는 여러 번 호출돼도 안전해야 함 (재시도 대응)

## 관련 문서

- [통신-기법/Polling과 Long Polling.md](통신-기법/Polling과%20Long%20Polling.md)
- [통신-기법/WebHook.md](통신-기법/WebHook.md)
- [../WebSocket/WebSocket.md](../WebSocket/WebSocket.md)
- [../SSE/SSE (Server-Sent Events).md](../SSE/SSE%20%28Server-Sent%20Events%29.md)
- [../HTTP vs SSE vs WebSocket 비교.md](../HTTP%20vs%20SSE%20vs%20WebSocket%20비교.md)
