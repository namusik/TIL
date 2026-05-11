# HTTP vs SSE vs WebSocket 비교

> 최종 업데이트: 2026-04-22 | 기준: RFC 9110 (HTTP), HTML Living Standard (SSE), RFC 6455 (WebSocket)

## 개념

세 프로토콜 모두 웹에서 서버와 클라이언트 간 통신에 쓰이지만, **통신 방향**과 **연결 유지 여부**가 근본적으로 다르다. **HTTP는 단건 요청/응답**, **SSE는 서버가 일방적으로 흘려보내는 스트림**, **WebSocket은 양쪽이 자유롭게 주고받는 전화 통화**에 비유할 수 있다.

> 기본 원칙: **HTTP로 충분하면 HTTP, 서버 push 필요하면 SSE, 양방향 필요하면 WebSocket.**

## 한눈에 보는 비교

| 항목 | **HTTP** | **SSE** | **WebSocket** |
|------|----------|---------|---------------|
| **표준** | RFC 9110 | WHATWG HTML | RFC 6455 |
| **연결 방식** | **요청마다 열고 닫음** (Keep-Alive로 재사용 가능) | **한 HTTP 응답을 길게 유지** | **HTTP Upgrade 후 독립 프로토콜** |
| **방향성** | **클라이언트 요청 → 서버 응답** | **서버 → 클라이언트 (단방향)** | **양방향 (Full-duplex)** |
| **연결 유지** | 기본 X (짧은 응답) | **O (장기 연결)** | **O (장기 연결)** |
| **프로토콜** | HTTP | **HTTP 기반** | **독립 프로토콜** (`ws://`, `wss://`) |
| **포트** | 80 / 443 | 80 / 443 | 80 / 443 (`ws://`/`wss://`) |
| **데이터 형식** | 텍스트 + 바이너리 | **텍스트만** (UTF-8) | **텍스트 + 바이너리** |
| **메시지 단위** | 요청/응답 메시지 | `event:/data:/id:` 텍스트 필드 | 프레임(frame) |
| **자동 재연결** | 해당 없음 | **브라우저 자동** (`EventSource`) | 직접 구현 |
| **브라우저 API** | `fetch`, `XMLHttpRequest` | `EventSource` | `WebSocket` |
| **방화벽/프록시** | 표준 HTTP → **거의 통과** | HTTP 그대로 → 거의 통과 | Upgrade 헤더 차단 사례 있음 |
| **인증** | 헤더/쿠키/토큰 표준 | **HTTP 그대로** | 초기 핸드셰이크만 HTTP |
| **구현 복잡도** | **가장 단순** | 낮음 | 중간 |
| **HTTP/2 호환** | O (네이티브) | O (멀티플렉싱) | 별도 확장 필요 (RFC 8441) |
| **실시간성** | 없음 (요청 해야 받음) | **높음** | **높음** |
| **서버 리소스** | 짧은 연결 반복 | 장기 HTTP 연결 유지 | 전용 소켓 유지 |

## 방향성 그림

```
[HTTP]                        [SSE]                          [WebSocket]
 Client        Server          Client        Server           Client        Server
   │ GET /xxx    │                │ GET /events │                │ Upgrade     │
   │ ─────────► │                │ ─────────► │                │ ─────────► │
   │            │                │            │                │ 101 Switch  │
   │ ◄────data──│                │ ◄──200 OK──│                │ ◄──────────│
   │  (끝)       │                │ ◄──event──│(계속 push)       │  msg       │
   │ GET /xxx    │                │ ◄──event──│                │ ◄─────────►│ (양방향)
   │ ─────────► │                │ ◄──event──│                │  msg       │
   │ ◄────data──│                │            │                │ ◄─────────►│
 요청마다 단건                   서버 push                      양방향 full-duplex
```

## 각각을 한 줄로

| 프로토콜 | 핵심 성격 |
|---------|---------|
| **HTTP** | "물어봐야 답해주는" 요청-응답 기본 |
| **SSE** | "HTTP 응답을 길게 유지하며 서버가 계속 밀어주는" 단방향 스트림 |
| **WebSocket** | "HTTP로 시작했다가 완전히 다른 프로토콜로 바꿔서 양방향 통신하는" 소켓 |

## 세 가지의 관계

```
                      HTTP
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
       [표준 API]   [스트리밍]      [업그레이드]
       (REST,      (응답 길게        (ws:// 로
       GraphQL 등)  유지 = SSE)      전환 = WebSocket)
```

- **SSE** — HTTP 응답을 스트리밍으로 "길게 쓰기" → HTTP 호환성 유지
- **WebSocket** — HTTP 핸드셰이크로 "다른 프로토콜로 전환" → HTTP와 별개

## 언제 무엇을 쓰나

### HTTP가 적절한 경우 ★ 기본

- 일반적인 **REST API** 호출
- **조회·생성·수정·삭제** 단건 처리
- 서로 밀접한 실시간성이 필요 없는 모든 경우
- 캐싱, 로드밸런싱, 보안, 로깅이 이미 성숙한 생태계

### SSE가 적절한 경우

- 서버 → 클라이언트 **단방향 push**가 핵심
- **AI 응답 스트리밍** (ChatGPT, Claude의 글자 단위 출력)
- **실시간 알림** — 새 메시지, 주문 상태, 빌드 진행률
- **피드/대시보드** 갱신
- 방화벽·프록시 제약이 심한 엔터프라이즈 환경
- HTTP 인프라(인증·캐싱·로깅)를 그대로 재활용하고 싶을 때

### WebSocket이 적절한 경우

- **양방향 상호작용** 이 필수인 경우
- **채팅/메신저** (서로 주고받음)
- **온라인 게임** (실시간 상태 동기화)
- **협업 편집** (Figma, Notion 멀티커서)
- **실시간 거래** (주식/암호화폐 주문+체결)
- **바이너리 스트림** (이미지, 오디오)

## 기술 선택 플로우차트

```
  실시간 server push 필요?
        │
    ┌───┴───┐
   NO      YES
    │       │
    ▼       ▼
   HTTP    양방향 통신 필요?
           │
       ┌───┴───┐
      NO      YES
       │       │
       ▼       ▼
      SSE   WebSocket

  * 바이너리 필수면 WebSocket 고려
  * 단순성·방화벽 친화성 우선이면 SSE/HTTP
```

**실무 원칙**: **HTTP로 시작 → 실시간성이 정말 필요해지면 SSE → 양방향이 확실히 필요하면 WebSocket**.
처음부터 WebSocket을 쓰려고 하지 말 것. 대부분 SSE나 Long Polling으로 충분.

## Polling/Long Polling과의 관계

위 3개 프로토콜 외에 HTTP 위의 "실시간 기법"(Polling, Long Polling)도 같은 스펙트럼에 있다.

| 방식 | 종류 | 방향 | 지연 | 헤더 오버헤드 |
|------|------|------|------|-------------|
| **HTTP** | 프로토콜 | 요청/응답 | 해당없음 | 매번 |
| **Polling** | 기법(HTTP) | 요청 반복 | 주기만큼 | 매번 |
| **Long Polling** | 기법(HTTP) | 요청 반복 | 낮음 | 매번 |
| **SSE** | 프로토콜(HTTP 기반) | 서버→클라 | 낮음 | 최초 1회 |
| **WebSocket** | 프로토콜(독립) | 양방향 | 낮음 | 최초 1회 |

## 공통점 (세 프로토콜)

- 모두 **웹 브라우저 표준 지원**
- 모두 **HTTPS/TLS 기반** 운영 권장
- 모두 포트 80/443 사용 → 네트워크적으로는 동일 경로
- 로드밸런서·프록시의 **유휴 타임아웃** 설계가 운영의 핵심

## 백엔드 구현 관점

### HTTP (Spring)

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id);
}
```

### SSE (Spring)

```java
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter stream() {
    SseEmitter emitter = new SseEmitter(0L);
    executor.submit(() -> emitter.send(SseEmitter.event().data("tick")));
    return emitter;
}
```

### WebSocket (Spring)

```java
@Configuration
@EnableWebSocket
class WsConfig implements WebSocketConfigurer {
    public void registerWebSocketHandlers(WebSocketHandlerRegistry r) {
        r.addHandler(new TextWebSocketHandler() {
            public void handleTextMessage(WebSocketSession s, TextMessage m) throws Exception {
                s.sendMessage(new TextMessage("echo: " + m.getPayload()));
            }
        }, "/ws");
    }
}
```

## 인프라/운영 비교

| 항목 | HTTP | SSE | WebSocket |
|------|------|-----|-----------|
| Nginx 설정 | 기본값 | `proxy_buffering off` | `Upgrade` 헤더 포워딩 |
| 로드밸런서 | 일반 LB 그대로 | HTTP LB 그대로 | Sticky Session 권장 |
| 수평 확장 | 무상태 → 쉬움 | Redis Pub/Sub 등으로 브로드캐스트 | 동일 또는 STOMP+브로커 |
| 모니터링 | 성숙 | HTTP 스택 그대로 | 별도 지표 필요 |
| 로깅 | 접근 로그 | 접근 로그 남지만 짧음 | 별도 |
| 캐싱 | **강력** (ETag 등) | 해당없음 | 해당없음 |
| 재연결 | 해당없음 | **자동** | 수동 구현 |

## 흔한 오해

- **"WebSocket이 항상 더 빠르다"** — 이미 연결된 이후는 비슷. 오히려 HTTP/2 멀티플렉싱 + SSE가 더 빠른 경우도 있음
- **"SSE는 오래된 기술이다"** — HTTP/2 이후 재평가. AI 스트리밍 시대에 다시 부상
- **"WebSocket은 HTTP가 아니다"** — 맞지만, **초기 핸드셰이크는 HTTP**로 시작
- **"HTTP는 실시간에 못 쓴다"** — Long Polling·SSE 다 HTTP 기반. "단건 요청-응답"만 쓰면 실시간이 안 될 뿐

## 정리

- **HTTP** — 요청/응답 기본. 대부분의 웹 API 트래픽이 여기 속함
- **SSE** — HTTP 응답을 길게 이어쓰는 "단방향 스트림". AI 스트리밍 시대의 표준
- **WebSocket** — 양방향 소켓. 채팅/게임/협업처럼 진짜 양방향이 필요할 때

세 가지는 **경쟁이 아니라 다른 용도의 도구**. 요구사항에 맞춰 조합해서 쓴다.

## 관련 문서

- [HTTP/HTTP.md](HTTP/HTTP.md)
- [SSE/SSE (Server-Sent Events).md](SSE/SSE%20%28Server-Sent%20Events%29.md)
- [WebSocket/WebSocket.md](WebSocket/WebSocket.md)
- [HTTP/통신 기법/Polling과 Long Polling.md](HTTP/통신%20기법/Polling과%20Long%20Polling.md)
- [HTTP/통신 기법/WebHook.md](HTTP/통신%20기법/WebHook.md)
