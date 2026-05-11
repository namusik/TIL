# SSE (Server-Sent Events)

> 최종 업데이트: 2026-04-22 | 기준: HTML Living Standard (WHATWG), `text/event-stream`

## 개념

**SSE(Server-Sent Events)** 는 HTTP 위에서 **서버가 클라이언트에게 일방적으로 이벤트 스트림을 밀어내는(push)** 프로토콜이다. 하나의 HTTP 요청으로 연결을 맺고, 서버가 그 연결을 **열어둔 채로 계속 메시지를 흘려보낸다**.

> 비유하자면 **라디오 방송**. 청취자(클라이언트)는 채널을 맞춰놓기만 하면 되고, 방송국(서버)이 일방적으로 계속 소리를 흘려보낸다. 청취자는 말을 걸지 않는다 — 그게 SSE의 본질.

## 배경/역사

- **2004** — Ian Hickson(WebSocket 제안자와 동일 인물)이 Opera 브라우저 팀에서 최초 구현
- **2009~2011** — HTML5 표준(`<eventsource>` → `EventSource` API)에 포함
- 현재는 **WHATWG HTML Living Standard**에서 관리 (`EventSource` 인터페이스)
- HTTP 기반으로 설계되어 **기존 웹 인프라와 자연스럽게 호환**
- 최근 **AI 응답 스트리밍**(ChatGPT, Claude 등)의 기본 프로토콜로 재부각됨

## 특징

### 1. 단방향 (서버 → 클라이언트)

- 서버가 일방적으로 이벤트를 밀어냄
- 클라이언트는 메시지를 보내려면 **별도의 HTTP 요청**을 해야 함 (SSE 연결로는 불가)

### 2. HTTP 기반

- 일반 HTTP GET 요청으로 시작 — 방화벽·프록시·인증·쿠키 모두 HTTP와 동일하게 동작
- `Content-Type: text/event-stream` 으로 식별

### 3. 텍스트만 (UTF-8)

- 바이너리 전송 불가 — 이미지·오디오는 base64로 인코딩하거나 다른 방식 필요
- 이벤트 단위는 사람이 읽을 수 있는 텍스트 형식

### 4. 자동 재연결

- 연결이 끊기면 **브라우저가 알아서 재접속**
- `retry:` 필드로 재연결 간격 지정 가능
- `Last-Event-ID` 헤더로 **끊긴 지점부터 이어받기** 지원

### 5. 표준 브라우저 API

- JavaScript `EventSource` 가 내장 — 별도 라이브러리 불필요

## 동작 흐름

```
[Client]                                    [Server]
   │                                           │
   │  GET /events HTTP/1.1                     │
   │  Accept: text/event-stream               │
   │ ────────────────────────────────────────► │
   │                                           │
   │  HTTP/1.1 200 OK                          │
   │  Content-Type: text/event-stream          │
   │ ◄──────────────────────────────────────── │
   │                                           │
   │  data: first message\n\n                  │
   │ ◄──────────────────────────────────────── │ (연결 유지한 채)
   │                                           │
   │  data: second message\n\n                 │
   │ ◄──────────────────────────────────────── │
   │                                           │
   │  (끊김)                                    │
   │ ◄────────────────X────────────────────── │
   │                                           │
   │  (자동 재연결, Last-Event-ID 포함)         │
   │ ────────────────────────────────────────► │
```

## 메시지 포맷

이벤트는 텍스트 라인의 조합. 빈 줄(`\n\n`)이 **하나의 이벤트 경계**.

```
data: hello

data: multi-line
data: message

event: update
id: 42
retry: 3000
data: {"user":"wsnam","msg":"hi"}

```

### 필드

| 필드 | 역할 |
|------|------|
| `data:` | 실제 메시지 내용 (여러 줄 가능) |
| `event:` | 이벤트 타입 (기본 `message`) |
| `id:` | 이벤트 ID — 끊김 시 재전송 기준점 (`Last-Event-ID`) |
| `retry:` | 재연결 간격 (ms) |
| `:` (주석) | 콜론으로 시작, 무시됨. 하트비트 용도로 사용 |

## 브라우저 클라이언트

```javascript
const es = new EventSource("/events");

// 기본 이벤트
es.onmessage = (e) => console.log("msg:", e.data);

// 커스텀 이벤트
es.addEventListener("update", (e) => {
    console.log("update:", JSON.parse(e.data));
});

es.onerror = (e) => console.log("error or closed");

// 수동 종료
es.close();
```

- 끊기면 자동 재연결 — 대략 3초 뒤 (`retry:` 로 조정 가능)
- 브라우저당 **동시 6개 제한** (HTTP/1.1 기준) — HTTP/2에서는 거의 해소

## Java/Spring 서버 예시

Spring MVC/WebFlux 모두 SSE를 기본 지원.

### MVC — `SseEmitter`

```java
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter stream() {
    SseEmitter emitter = new SseEmitter(0L);  // 0 = 무제한 타임아웃
    executor.submit(() -> {
        try {
            for (int i = 0; i < 10; i++) {
                emitter.send(SseEmitter.event()
                    .id(String.valueOf(i))
                    .name("update")
                    .data("tick " + i));
                Thread.sleep(1000);
            }
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    });
    return emitter;
}
```

### WebFlux — `Flux<ServerSentEvent>`

```java
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> stream() {
    return Flux.interval(Duration.ofSeconds(1))
        .map(i -> ServerSentEvent.<String>builder()
            .id(String.valueOf(i))
            .event("update")
            .data("tick " + i)
            .build());
}
```

## 대표 사용처

- **AI 응답 스트리밍** — ChatGPT, Claude의 "글자 단위로 나오는" 응답은 모두 SSE (OpenAI/Anthropic API의 `stream: true`)
- **실시간 알림** — 새 메시지, 주문 상태 변경
- **피드/주식 시세** (단순 조회형)
- **배치 작업 진행률** 표시
- **대시보드·차트** 실시간 업데이트

## HTTP/2·HTTP/3 시대의 SSE

과거 SSE의 약점은 "HTTP/1.1에서 도메인당 동시 연결 6개 제한" 이었다. HTTP/2 멀티플렉싱 도입으로 거의 해소되면서 **SSE 재평가** 추세.

| HTTP 버전 | SSE 동시 연결 수 |
|-----------|-----------------|
| HTTP/1.1 | 브라우저당 도메인별 6개 |
| HTTP/2/3 | 사실상 제한 없음 (멀티플렉싱) |

## 한계

- **단방향** — 클라이언트가 보내려면 별도 HTTP 요청 필요
- **텍스트 전용** — 바이너리는 base64
- **일부 레거시 브라우저 미지원** (IE는 폴리필 필요)
- **프록시 버퍼링** — Nginx 등 일부 프록시는 응답을 버퍼링해 이벤트가 즉시 안 감 → `X-Accel-Buffering: no` 헤더 또는 프록시 설정 필요

## 폴링·WebSocket과의 비교

| 방식 | 방향 | 지연 | 오버헤드 | 복잡도 |
|------|------|------|---------|--------|
| Polling | 단방향(요청) | 주기만큼 | 높음(매번 요청) | 낮음 |
| Long Polling | 단방향(요청) | 낮음 | 중간 | 중간 |
| **SSE** | **서버→클라 단방향** | **낮음** | **낮음** | **낮음** |
| **WebSocket** | **양방향** | 낮음 | 낮음 | 중간 |

자세한 비교는 [../SSE vs WebSocket 비교.md](../SSE-vs-WebSocket-비교.md) 참고.

## 백엔드 개발자 실무 포인트

- **Nginx 프록시 앞단** — `proxy_buffering off;`, `proxy_read_timeout 24h;` 필수
- **타임아웃** — 로드밸런서(ALB, ELB 등) 유휴 타임아웃을 넘지 않도록 하트비트(주석 라인) 주기 전송
- **연결 수 관리** — SSE는 장기 연결이므로 서버 스레드/커넥션 풀 한계 주의 (WebFlux 같은 비동기 스택 권장)
- **재연결 + `Last-Event-ID`** 처리 — 끊김 복구 시 중복/누락 없도록 서버가 ID 기준 이벤트 재전송
- **인증** — 일반 HTTP와 동일. 쿠키·JWT 그대로 동작 (WebSocket은 초기 핸드셰이크만 HTTP라 별도 처리 필요)

## 관련 문서

- [../SSE vs WebSocket 비교.md](../SSE-vs-WebSocket-비교.md)
- [../WebSocket/WebSocket.md](../WebSocket/WebSocket.md)
- [../HTTP/HTTP.md](../HTTP/HTTP.md)
