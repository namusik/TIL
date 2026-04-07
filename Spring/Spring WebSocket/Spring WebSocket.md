# Spring WebSocket

> 최종 업데이트: 2026-04-06 | Spring Boot 3.x / Spring 6.x 기준 | [공식문서](https://docs.spring.io/spring-framework/reference/web/websocket.html)

## 개념

Spring에서 **실시간 양방향 통신**을 구현하기 위한 WebSocket 지원 모듈이다.

- 일반 HTTP는 편지(요청 → 응답 → 끝)와 같고, WebSocket은 **전화 통화**(연결을 열어두고 양쪽이 자유롭게 주고받음)와 같다
- HTTP의 요청-응답 모델로는 서버가 먼저 클라이언트에게 데이터를 보낼 수 없는데, WebSocket은 이를 해결
- `spring-boot-starter-websocket` 의존성으로 사용

```
HTTP:
  Client ── 요청 ──→ Server
  Client ←── 응답 ── Server
  (연결 끊김, 다시 보내려면 다시 요청)

WebSocket:
  Client ←──── 연결 유지 ────→ Server
  (양쪽 모두 자유롭게 메시지 전송 가능)
```

## WebSocket vs 다른 실시간 방식

| 방식 | 방향 | 프로토콜 | 비유 | 적합한 경우 |
|---|---|---|---|---|
| **Polling** | 클라 → 서버 (반복) | HTTP | 1분마다 "새 소식 있어?" 물어보기 | 실시간성 낮아도 되는 경우 |
| **Long Polling** | 클라 → 서버 (대기) | HTTP | "새 소식 생기면 알려줘" 하고 기다림 | 간헐적 업데이트 |
| **SSE** | 서버 → 클라 (단방향) | HTTP | 라디오 방송 | 알림, 실시간 피드 |
| **WebSocket** | 양방향 | WS | 전화 통화 | 채팅, 게임, 실시간 협업 |

```
Polling:       Client ──→ Server (매 n초마다 요청, 대부분 빈 응답)
Long Polling:  Client ──→ Server (응답 올 때까지 대기, 응답 후 재연결)
SSE:           Client ←── Server (서버가 일방적으로 이벤트 전송)
WebSocket:     Client ←→ Server (양방향 자유 통신)
```

## WebSocket 핸드셰이크

WebSocket 연결은 **HTTP 업그레이드** 요청으로 시작된다. 처음에는 HTTP로 악수(Handshake)를 하고, 성공하면 프로토콜을 WebSocket으로 전환한다.

```
Client → Server (HTTP)
  GET /ws/chat HTTP/1.1
  Upgrade: websocket
  Connection: Upgrade

Server → Client (HTTP 101)
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade

(이후부터 WebSocket 프레임으로 통신)
```

- 포트는 HTTP와 동일 (80/443) → 방화벽 문제 적음
- `ws://` (평문) 또는 `wss://` (TLS 암호화) 스킴 사용

## Spring WebSocket 사용 방식

Spring은 2가지 방식을 제공한다.

```
1. WebSocketHandler (저수준)
   → WebSocket API를 직접 다룸
   → 단순한 양방향 메시지 교환에 적합

2. STOMP (고수준)
   → WebSocket 위에 메시징 프로토콜을 얹음
   → pub/sub, 브로드캐스트, 특정 사용자 전송 등 구조화된 메시징에 적합
```

## 방식 1: WebSocketHandler

WebSocket 연결과 메시지를 직접 핸들링하는 저수준 방식.

### 의존성

```gradle
implementation 'org.springframework.boot:spring-boot-starter-websocket'
```

### 설정

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatHandler(), "/ws/chat")
                .setAllowedOrigins("*");        // CORS 설정
    }

    @Bean
    public WebSocketHandler chatHandler() {
        return new ChatHandler();
    }
}
```

### 핸들러 구현

```java
public class ChatHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        // 연결 수립 시 호출
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        // 전체 세션에 브로드캐스트
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage("Echo: " + payload));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        // 연결 종료 시 호출
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        // 전송 에러 처리
        sessions.remove(session);
    }
}
```

### 라이프사이클

```
afterConnectionEstablished()  ← 연결 수립
        ↓
handleTextMessage()           ← 메시지 수신 (반복)
        ↓
afterConnectionClosed()       ← 연결 종료
```

## 방식 2: STOMP (Simple Text Oriented Messaging Protocol)

WebSocket 위에 **pub/sub 메시징 구조**를 얹는 방식. 메시지를 직접 관리하지 않고, 목적지(destination) 기반으로 메시지를 라우팅한다. 우체국에 비유하면, WebSocketHandler는 편지를 직접 배달하는 것이고, STOMP는 우체국 시스템(구독, 발송, 주소 체계)을 이용하는 것이다.

```
STOMP 메시지 구조:
  COMMAND        ← CONNECT, SUBSCRIBE, SEND, MESSAGE 등
  header1:value1
  header2:value2

  Body (payload)
```

### 설정

```java
@Configuration
@EnableWebSocketMessageBroker
public class StompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();  // WebSocket 미지원 브라우저 폴백
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트 → 서버 메시지의 prefix
        registry.setApplicationDestinationPrefixes("/app");
        // 서버 → 클라이언트 구독 경로 (내장 브로커)
        registry.enableSimpleBroker("/topic", "/queue");
        // /topic: 1:N 브로드캐스트, /queue: 1:1 개인 메시지
    }
}
```

### 메시지 흐름

```
Client                         Server                        Subscribers
──────                         ──────                        ───────────
CONNECT /ws         ──→   WebSocket 연결 수립
SUBSCRIBE /topic/chat ──→   구독 등록
SEND /app/chat      ──→   @MessageMapping("/chat")
                           처리 후 @SendTo("/topic/chat")  ──→  /topic/chat 구독자 전원에게 전달
```

### 컨트롤러

```java
@Controller
public class ChatController {

    // /app/chat 으로 보내면 → /topic/messages 구독자 전원에게 전달
    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage chat(ChatMessage message) {
        return new ChatMessage(message.getSender(), message.getContent());
    }

    // 특정 사용자에게만 전송
    @MessageMapping("/private")
    @SendToUser("/queue/reply")
    public String privateMessage(String message, Principal principal) {
        return "개인 메시지: " + message;
    }
}
```

### SimpMessagingTemplate — 서버에서 능동적 전송

컨트롤러 밖에서(서비스, 스케줄러 등) 메시지를 보내고 싶을 때 사용.

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // 전체 구독자에게 브로드캐스트
    public void broadcast(String message) {
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }

    // 특정 사용자에게 전송
    public void sendToUser(String userId, String message) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/reply", message);
    }
}
```

## WebSocketHandler vs STOMP 선택

| 항목 | WebSocketHandler | STOMP |
|---|---|---|
| 복잡도 | 낮음 | 높음 |
| 메시지 라우팅 | 직접 구현 | 목적지 기반 자동 라우팅 |
| 브로드캐스트 | 세션 목록 직접 관리 | `@SendTo`로 간단하게 |
| 특정 사용자 전송 | 세션에서 직접 찾기 | `@SendToUser` |
| 인증 연동 | 직접 구현 | Spring Security 연동 지원 |
| 적합한 경우 | 단순 1:1 통신, 프로토타입 | 채팅방, 알림, 실시간 대시보드 |

> 실무에서는 대부분 **STOMP 방식**을 사용한다.

## SockJS 폴백

일부 환경(구형 브라우저, 프록시)에서 WebSocket이 차단될 수 있다. SockJS는 WebSocket이 안 되면 자동으로 **Long Polling, Streaming** 등으로 폴백하는 라이브러리다.

```java
// 서버: withSockJS() 추가
registry.addEndpoint("/ws").withSockJS();
```

```javascript
// 클라이언트: SockJS 라이브러리 사용
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);
stompClient.connect({}, (frame) => {
    stompClient.subscribe('/topic/messages', (message) => {
        console.log(JSON.parse(message.body));
    });
});
```

## 외부 메시지 브로커 연동

내장 SimpleBroker는 단일 서버에서만 동작한다. **서버가 여러 대**이면 메시지가 공유되지 않으므로, 외부 브로커(RabbitMQ, ActiveMQ)를 연동해야 한다.

```
단일 서버:
  Client ←→ Server (SimpleBroker) ←→ Client
  (모든 클라이언트가 같은 서버에 연결되어 있으므로 문제 없음)

다중 서버:
  Client ←→ Server A (SimpleBroker)     Client ←→ Server B (SimpleBroker)
  (Server A의 메시지가 Server B 클라이언트에게 전달 안 됨!)

다중 서버 + 외부 브로커:
  Client ←→ Server A ←→ [ RabbitMQ ] ←→ Server B ←→ Client
  (모든 서버가 같은 브로커를 바라보므로 메시지 공유)
```

```java
@Override
public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.setApplicationDestinationPrefixes("/app");
    // 외부 RabbitMQ 브로커 사용
    registry.enableStompBrokerRelay("/topic", "/queue")
            .setRelayHost("rabbitmq-host")
            .setRelayPort(61613)
            .setClientLogin("guest")
            .setClientPasscode("guest");
}
```

## Spring Security 연동

WebSocket 연결 시 인증/인가를 적용할 수 있다.

```java
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/topic/**").authenticated()
            .anyMessage().denyAll();
    }

    @Override
    protected boolean sameOriginDisabled() {
        return true;  // CSRF 비활성화 (WebSocket은 CSRF 토큰 전달이 어려움)
    }
}
```

- STOMP의 CONNECT 프레임에서 JWT 토큰을 헤더로 전달하여 인증하는 것이 일반적
- 인증된 사용자 정보는 `@MessageMapping` 메서드의 `Principal` 파라미터로 접근 가능

## SSE (Server-Sent Events)

서버에서 클라이언트로 **단방향**으로 이벤트를 스트리밍하는 방식. WebSocket보다 단순하고, 일반 HTTP로 동작하므로 인프라 제약이 적다.

```java
// WebFlux 방식
@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> stream() {
    return Flux.interval(Duration.ofSeconds(1))
               .map(i -> ServerSentEvent.<String>builder()
                       .id(String.valueOf(i))
                       .event("heartbeat")
                       .data("tick-" + i)
                       .build());
}

// MVC 방식
@GetMapping("/events")
public SseEmitter stream() {
    SseEmitter emitter = new SseEmitter(60_000L);  // 60초 타임아웃
    executor.execute(() -> {
        try {
            for (int i = 0; i < 10; i++) {
                emitter.send(SseEmitter.event().name("update").data("data-" + i));
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

| 항목 | SSE | WebSocket |
|---|---|---|
| 방향 | 서버 → 클라이언트 (단방향) | 양방향 |
| 프로토콜 | HTTP | WS |
| 자동 재연결 | 브라우저가 자동 재연결 | 직접 구현 필요 |
| 바이너리 데이터 | 불가 (텍스트만) | 가능 |
| 적합한 경우 | 알림, 실시간 피드, 로그 스트리밍 | 채팅, 게임, 양방향 필요 시 |

## 실무 선택 가이드

```
양방향 메시지가 필요한가?
├── YES → WebSocket (STOMP)
│         └── 서버 다중화? → 외부 브로커 (RabbitMQ) 연동
└── NO → 서버 → 클라이언트 단방향?
          ├── YES → SSE
          └── NO → 일반 HTTP (REST API)
```
