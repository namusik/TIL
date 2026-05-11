# Polling과 Long Polling

> 최종 업데이트: 2026-04-22 | 기준: HTTP/1.1 기반 실시간 통신 패턴

## 개념

**Polling(폴링)** 과 **Long Polling(롱 폴링)** 은 **HTTP 요청/응답을 반복하면서 "실시간처럼" 동작하게 만드는 통신 기법**이다. 별도의 프로토콜이 아니라 **일반 HTTP를 어떻게 사용하느냐의 패턴**.

> 비유하자면 폴링은 **"새로 온 택배 있어요?"를 30초마다 물어보는 것**, 롱 폴링은 **"새 택배 오면 바로 알려주세요. 올 때까지 기다릴게요"** 라고 해두는 것.

## "프로토콜이 아니라 기법"인 이유

| 항목 | HTTP | WebSocket | SSE | **Polling / Long Polling** |
|------|------|-----------|-----|---------------------------|
| 표준 문서 | RFC 9110 외 | RFC 6455 | WHATWG HTML | **없음** |
| 와이어 포맷 | HTTP 메시지 | WebSocket 프레임 | `text/event-stream` | **일반 HTTP 그대로** |
| 전용 MIME | - | - | `text/event-stream` | **없음** |
| 본질 | 프로토콜 | 프로토콜 | 프로토콜(HTTP 기반) | **HTTP를 사용하는 패턴** |

→ Polling/Long Polling은 클라이언트가 **언제·어떻게 HTTP 요청을 보내느냐**의 전략일 뿐, 별도 스펙이 없다.

> 표에 나오는 **표준 문서 / 와이어 포맷 / 전용 MIME** 같은 프로토콜 공통 용어는 [../../프로토콜의 구성 요소.md](../../%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EC%9D%98%20%EA%B5%AC%EC%84%B1%20%EC%9A%94%EC%86%8C.md) 참고.

## Polling (주기적 폴링)

### 동작

```
Client                         Server
  │ GET /msgs ─────────────────►  │
  │ ◄─── 200 [] ─────────────────  │    (새 거 없음)
  │                                │
  │ (3초 대기)                      │
  │                                │
  │ GET /msgs ─────────────────►  │
  │ ◄─── 200 [] ─────────────────  │
  │                                │
  │ (3초 대기)                      │
  │                                │
  │ GET /msgs ─────────────────►  │
  │ ◄─── 200 [msg1, msg2] ───────  │   (새 메시지 도착)
```

- 클라이언트가 **고정 주기**로 서버에 요청을 보냄
- 서버는 매번 즉시 응답 (있으면 데이터, 없으면 빈 응답)
- 클라이언트는 응답을 받은 뒤 다시 대기 → 반복

### 구현 예시

```javascript
// 브라우저
setInterval(async () => {
    const res = await fetch("/msgs");
    const data = await res.json();
    if (data.length > 0) console.log(data);
}, 3000);
```

### 장점

- **구현이 가장 단순** — 평범한 REST API 호출
- 서버 상태관리 불필요 (stateless)
- 방화벽·프록시·캐시 모두 표준 HTTP 그대로 동작

### 단점

- **낭비 많음** — 대부분의 요청이 빈 응답
- **지연** — 주기 사이 시간만큼 실시간성 손해
- **헤더 오버헤드** — 요청마다 쿠키·인증 헤더 전송
- 서버 부하가 클라이언트 수에 비례 급증

## Long Polling (긴 폴링)

### 동작

```
Client                         Server
  │ GET /msgs ─────────────────►  │
  │                                │    (이벤트 대기 중...)
  │                                │
  │                                │    (30초 후 새 메시지 발생)
  │ ◄─── 200 [msg1] ─────────────  │
  │                                │
  │ (즉시 다시 요청)                 │
  │ GET /msgs ─────────────────►  │
  │                                │    (다시 대기 중...)
```

- 클라이언트가 요청을 보내면 서버가 **이벤트가 발생할 때까지 응답을 보류**
- 이벤트 발생 또는 타임아웃 시 응답
- 클라이언트는 응답 받자마자 **즉시 재요청**

### 구현 예시 (Spring 서버)

```java
@GetMapping("/msgs")
public DeferredResult<List<Msg>> msgs() {
    DeferredResult<List<Msg>> result = new DeferredResult<>(30_000L); // 30초 타임아웃
    messageQueue.onNewMessage(msgs -> result.setResult(msgs));
    return result;
}
```

### 클라이언트

```javascript
async function loop() {
    while (true) {
        const res = await fetch("/msgs");  // 서버가 응답 보류
        const data = await res.json();
        if (data.length > 0) console.log(data);
        // 응답 받자마자 다음 요청
    }
}
loop();
```

### 장점

- **지연 거의 없음** — 이벤트 발생 즉시 응답
- **빈 응답이 없음** — 의미 있는 데이터만 오감
- Polling 대비 네트워크 효율 좋음

### 단점

- **서버에 대기 중인 요청이 많아짐** — 수만 명이 접속하면 Thread/Connection 부담
  - Spring의 `DeferredResult`, Servlet Async, WebFlux 등 **비동기 모델** 필요
- **타임아웃·재연결 로직** 직접 구현 필요
- **헤더 오버헤드** — Polling과 마찬가지로 매 요청마다 헤더 재전송
- 로드밸런서·프록시 **유휴 타임아웃**을 넘지 않도록 주의

## Polling vs Long Polling vs SSE vs WebSocket

같은 "실시간 통신" 스펙트럼 안에서 4가지 방식의 차이.

| 항목 | Polling | Long Polling | SSE | WebSocket |
|------|---------|--------------|-----|-----------|
| 종류 | **기법** | **기법** | 프로토콜(HTTP 기반) | 프로토콜(독립) |
| 방향 | 단방향(조회) | 단방향(조회) | 서버→클라 | 양방향 |
| 연결 유지 | X (반복) | 요청당 유지 | O (한 연결) | O (한 연결) |
| 지연 | 주기만큼 | 낮음 | 낮음 | 낮음 |
| 헤더 오버헤드 | **매번** | **매번** | 최초 1회 | 최초 1회 |
| 복잡도 | **최저** | 낮음 | 낮음 | 중간 |
| 자동 재연결 | 해당없음 | 수동 | **브라우저 자동** | 수동 |
| 바이너리 | 가능(HTTP 그대로) | 가능 | 불가(텍스트) | 가능 |
| 대표 용도 | 주기 조회 (뉴스피드, 상태) | 알림 (레거시) | AI 스트리밍, 알림 | 채팅, 게임 |

## 언제 (아직도) 쓰나

### Polling이 여전히 적절한 경우

- **상태 변화가 느리고 주기적 조회로 충분** — 빌드 상태, 배치 진행률
- **GitHub Events API**, 일부 외부 API에 주기 조회
- 서버-서버 통신에서 단순성이 최우선인 경우
- **방화벽 제약** 매우 심한 환경

### Long Polling이 여전히 적절한 경우

- WebSocket/SSE가 **차단되는 엔터프라이즈 환경**
- 레거시 브라우저 지원이 필요
- **SockJS**의 폴백 메커니즘으로 내부 동작
- Comet, BOSH(XMPP) 등 오래된 실시간 웹 기술의 기반

### 쓰지 말아야 할 때

- 고빈도 양방향 통신 → **WebSocket**
- 서버 push만 필요 → **SSE** (현대 표준)
- AI 스트리밍 → **SSE**

## 역사적 맥락 — "Comet"

WebSocket/SSE가 표준화되기 전, 2000년대 중반~2010년대 초반에 **"Comet"** 이라는 이름으로 **Long Polling**과 **HTTP Streaming**(서버가 응답을 끊지 않고 계속 흘려보내는 기법 — SSE의 전신)이 실시간 웹의 거의 유일한 수단이었다.

- **Gmail 채팅**, **Facebook 초기 알림**이 Long Polling으로 구현됨
- HTTP/1.1의 한계를 극복하려는 여러 기법(`iframe streaming`, `multipart/x-mixed-replace` 등)도 등장 → 자세한 건 [HTTP Streaming.md](HTTP-Streaming.md) 참고
- WebSocket(2011) · SSE(2011)가 표준화되며 점차 대체됨
- 현재는 **SockJS 같은 폴백 라이브러리** 안에서만 주로 쓰임

## 백엔드 개발자 실무 포인트

- **Long Polling + Spring** — 반드시 비동기 (`DeferredResult`/`@Async`/WebFlux)로 처리. 동기 I/O로 구현하면 스레드 풀 고갈
- **로드밸런서 타임아웃** — AWS ALB는 기본 60초. Long Polling이 그 이상 대기하면 504 에러 → 타임아웃 설정 조정 필요
- **Nginx 프록시** — `proxy_read_timeout`, `proxy_connect_timeout` 늘려야 함
- **Polling 주기 설계** — 너무 짧으면 서버 과부하, 너무 길면 지연. 지수 백오프(점진적 증가) 고려
- **Polling → SSE/WebSocket 마이그레이션** — 요구사항이 커지면 자연스러운 진화 경로. 단, 운영 환경에서 프록시/방화벽 호환 확인 필요

## 요약

- Polling/Long Polling은 **프로토콜이 아니라 HTTP를 쓰는 기법**
- **Polling** = 주기적 질문, **Long Polling** = 응답 보류 + 즉시 재요청
- 구현 단순함이 장점, 효율은 낮음
- 현대에는 거의 **SSE/WebSocket으로 대체**됐지만, 폴백/레거시/단순 조회에서는 여전히 유효

## 관련 문서

- [HTTP Streaming.md](HTTP-Streaming.md) — Comet 시대의 또 다른 축, SSE의 전신
- [WebHook.md](WebHook.md)
- [../../SSE/SSE (Server-Sent Events).md](../../SSE/SSE%20%28Server-Sent%20Events%29.md)
- [../../WebSocket/WebSocket.md](../../WebSocket/WebSocket.md)
- [../../HTTP vs SSE vs WebSocket 비교.md](../../HTTP%20vs%20SSE%20vs%20WebSocket%20비교.md)
- [../HTTP.md](../HTTP.md)
