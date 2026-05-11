# WebSocket

> 최종 업데이트: 2026-04-22 | 기준: RFC 6455 (WebSocket Protocol)

## 개념

**WebSocket**은 하나의 TCP 연결 위에서 **서버와 클라이언트가 서로 원할 때 메시지를 주고받는** 양방향 실시간 통신 프로토콜이다. 기존 HTTP는 요청이 있어야만 응답할 수 있는 **단방향(request-response)** 구조였지만, WebSocket은 한 번 연결을 맺으면 **Full-duplex(전이중)** 으로 양쪽 어디서든 데이터를 밀어낼 수 있다.

> 비유하자면 HTTP가 "편지 주고받기"라면, WebSocket은 **"전화 통화"**. 한 번 연결되면 양쪽 모두 언제든 말할 수 있고, 끊을 때까지 유지된다.

## 배경/역사

- **2008** — Google의 Ian Hickson이 HTML5 사양 작업 중 최초 제안
- **2011** — **RFC 6455**로 IETF 표준 채택
- HTTP의 한계(단방향, 폴링 비효율)를 극복하기 위해 등장
- HTML5 시대 이후 브라우저 기본 내장 (JS `WebSocket` API)
- 채팅·게임·주식 등 **실시간 웹** 생태계의 표준으로 자리잡음

## 특징

### 1. 양방향 통신 (Full-duplex)

- 데이터 송수신을 **동시에** 처리
- 클라이언트와 서버가 서로에게 원할 때 데이터를 주고받음
- 기존 HTTP는 클라이언트가 요청을 보낼 때에만 서버가 응답 가능
- 커넥션이 **open / close** 상태로 관리됨

### 2. 실시간 네트워킹 (Real-Time Networking)

- 웹 환경에서 연속된 데이터를 빠르게 노출시켜야 할 때 사용
- 대표 사례: **채팅, 주식 시세, 비디오 스트림**
- "친구들과 채팅"은 친구와 직접 연결된 게 아니라 **같은 WebSocket 서버에 접속된 상태**
  - 브라우저끼리 직접 연결은 **WebRTC**(P2P 통신)의 영역
- 여러 단말기에 동시에 데이터를 빠르게 배포

### 3. Polling / Long Polling / Streaming 대비 장점

| 방식 | 동작 | 단점 |
|------|------|------|
| Polling | 주기적으로 요청 | 불필요한 요청, 지연 |
| Long Polling | 요청 → 이벤트까지 대기 → 응답 → 재요청 | 구현 복잡, 헤더 오버헤드 |
| **WebSocket** | **한 번 연결 후 양방향** | (구현은 약간 복잡) |

- Polling은 불필요한 요청을 보내고 **헤더가 매번 커서** 효율이 나쁨
- WebSocket은 연결 후 프레임 단위로 아주 가볍게 주고받음

## 동작 방식

### 핸드셰이크 흐름

![](https://images.velog.io/images/rainbowweb/post/5a28097a-db1a-409d-afe2-a7c31356042f/image.png)

전체 흐름은 3단계로 나뉜다.

```
[Opening Handshake] ──► [Data Transfer] ──► [Closing Handshake]
   HTTP 101            ws:// / wss://          CLOSE 프레임
```

### 1. Opening Handshake — HTTP에서 시작

- HTTP 80/443을 그대로 사용해 핸드셰이크
- 서버 응답 코드는 **101 Switching Protocols**

#### 요청 (클라이언트 → 서버)

```http
GET /chat HTTP/1.1                            // 반드시 GET 메서드
Host: localhost:8080
Upgrade: websocket                             // 프로토콜 전환 요청, 고정값
Connection: Upgrade                            // 연결 유지, WebSocket 시 고정값
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==   // 유효한 요청 검증용 키 (base64)
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://localhost:9000
```

#### 응답 (서버 → 클라이언트)

```http
HTTP/1.1 101 Switching Protocols               // '프로토콜 전환' 응답
Server: Apache-Coyote/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: y0C2sLRjQhdq3geJIKYeRVUgtFg=   // Sec-WebSocket-Key를 가공한 값
```

- `Sec-WebSocket-Accept`는 요청의 `Sec-WebSocket-Key`에 고정 문자열을 붙이고 SHA-1 + base64 인코딩한 값
- 클라이언트가 이 값을 검증해 정상 서버인지 확인

### 2. Data Transfer — 프레임 기반 양방향

- **메시지** 단위로 데이터 송수신
- 메시지는 **프레임(Frame)** 단위로 구성 — 통신의 가장 작은 단위
- 프레임 = **작은 헤더 + payload**
- 프로토콜이 `ws://` / `wss://` 로 동작 (포트는 여전히 80/443)
- 연결 유지 확인을 위해 **heartbeat(ping/pong)** 프레임을 주기적으로 주고받음

### 3. Closing Handshake

- 커넥션 종료를 위한 **컨트롤 프레임** 전송
- 정상 종료 코드(1000) 또는 비정상 사유(1001~1015 등)와 함께 종료

## URL 스킴

| 스킴 | 설명 |
|------|------|
| `ws://` | 평문 WebSocket (포트 80) |
| `wss://` | TLS 암호화 WebSocket (포트 443) |

> 실무에서는 반드시 **`wss://`**. 프록시·방화벽 호환성과 보안 모두를 위해 TLS가 기본.

## 프레임 구조

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
```

| 필드 | 의미 |
|------|------|
| `FIN` | 마지막 프레임 여부 |
| `opcode` | 프레임 유형 (text=0x1, binary=0x2, close=0x8, ping=0x9, pong=0xA) |
| `MASK` | 클라 → 서버 프레임은 반드시 마스킹 |
| `Payload length` | 페이로드 크기 |

## 한계와 대응

### SockJS — 브라우저 호환성

- WebSocket은 HTML5 이후 표준이라 **구형 브라우저에서는 동작하지 않음**
- **SockJS**: WebSocket이 안 되는 환경에서 Long Polling 등으로 **fallback** 하며 동일 API 제공
- Spring의 STOMP와 자주 조합

### 프록시/방화벽

- 일부 기업 방화벽이 `Upgrade` 헤더를 차단 → 연결 실패
- `wss://` (TLS) 사용 시 대부분 통과
- HTTP/2, HTTP/3 환경은 WebSocket 호환이 까다로움 — 별도 설정 필요

### 상태 관리

- 연결 끊김이 빈번 — **재연결 로직**을 클라이언트에서 직접 구현해야 함
- 서버에서 세션 식별·복구도 애플리케이션 책임

## Java/Spring 예시

### 서버

```java
@Configuration
@EnableWebSocket
public class WsConfig implements WebSocketConfigurer {
    public void registerWebSocketHandlers(WebSocketHandlerRegistry r) {
        r.addHandler(new MyHandler(), "/ws").setAllowedOrigins("*");
    }
}

public class MyHandler extends TextWebSocketHandler {
    @Override
    public void handleTextMessage(WebSocketSession s, TextMessage msg) throws Exception {
        s.sendMessage(new TextMessage("echo: " + msg.getPayload()));
    }
}
```

### 클라이언트 (브라우저)

```javascript
const ws = new WebSocket("wss://example.com/ws");
ws.onopen    = () => ws.send("hello");
ws.onmessage = (e) => console.log(e.data);
ws.onclose   = () => console.log("closed");
```

## 대표 사용처

- **채팅/메신저** (Slack, WhatsApp 웹)
- **실시간 협업** (Figma, Notion 멀티커서)
- **온라인 게임** (액션·FPS 상태 동기화)
- **주식·암호화폐 시세**
- **알림 + 양방향 상호작용** 필요한 모든 웹 앱

## 관련 기술

- **STOMP** — WebSocket 위에서 동작하는 메시지 브로커 프로토콜 ([STOMP/STOMP.md](STOMP/STOMP.md))
- **SockJS** — WebSocket 폴백 라이브러리
- **WebRTC** — 브라우저 간 P2P 통신 (WebSocket은 서버 경유)
- **SSE** — 단방향 스트리밍이 필요하면 더 단순 ([../SSE/SSE (Server-Sent Events).md](../SSE/SSE-%28Server-Sent-Events%29.md))

## 참고

- https://www.youtube.com/watch?v=rvss-_t6gzg
- https://kellis.tistory.com/65
- https://ws-pace.tistory.com/105?category=968973
- https://dev-gorany.tistory.com/212?category=901854
- https://dydtjr1128.github.io/spring/2019/05/26/Springboot-react-chatting.html

## 관련 문서

- [../SSE/SSE (Server-Sent Events).md](../SSE/SSE-%28Server-Sent-Events%29.md)
- [../SSE vs WebSocket 비교.md](../SSE-vs-WebSocket-비교.md)
- [STOMP/STOMP.md](STOMP/STOMP.md)
- [../HTTP/HTTP.md](../HTTP/HTTP.md)
