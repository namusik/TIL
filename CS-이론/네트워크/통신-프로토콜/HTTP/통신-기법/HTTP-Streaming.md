# HTTP Streaming

> 최종 업데이트: 2026-04-22 | 기준: HTTP/1.1 Chunked Transfer Encoding

## 개념

**HTTP Streaming**은 **"하나의 HTTP 응답을 끊지 않고 서버가 계속 데이터를 흘려보내는"** 통신 기법이다. 일반 HTTP가 "응답 한 번 주고 연결 종료"인 것과 달리, 응답을 **열어둔 채로 쪼개진 데이터(chunk)** 를 계속 전송한다.

> 비유하자면 일반 HTTP가 **"편지 한 통 보내고 끝"** 이라면, HTTP Streaming은 **"봉투를 안 닫고 종이를 계속 추가로 넣어 보내는"** 방식. 수신자는 봉투가 닫힐 때까지 내용물을 조금씩 읽어갈 수 있다.

## "프로토콜이 아니라 기법"인 이유

| 항목 | 분류 |
|------|------|
| 와이어 포맷 | **일반 HTTP** (`Transfer-Encoding: chunked` 헤더 활용) |
| 전용 MIME | 없음 (구현마다 다름) |
| 표준 스펙 | **없음** — 단, 그 발상을 표준화한 게 **SSE** |
| 본질 | **HTTP 응답을 길게 유지하는 패턴** |

→ 용어 설명은 [../../프로토콜의 구성 요소.md](../../%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EC%9D%98-%EA%B5%AC%EC%84%B1-%EC%9A%94%EC%86%8C.md) 참고.

## 배경/역사 — "Comet" 시대

- **2000년대 중반~2010년대 초반** — WebSocket과 SSE 표준화 이전
- **"Comet"** 이라는 이름으로 Long Polling과 HTTP Streaming이 실시간 웹의 **거의 유일한 수단**
- **Gmail 채팅**, **Facebook 초기 알림**, Google Maps 초기 버전 등이 이런 기법 활용
- 표준이 없어 **브라우저별로 다른 꼼수**가 필요했음
- **2011년 SSE 표준화**로 HTTP Streaming의 "공식 버전"이 등장 → 점차 대체됨

## 동작 원리

```
Client                                   Server
  │ GET /stream ──────────────────────► │
  │                                     │
  │ ◄─ 200 OK                           │
  │    Transfer-Encoding: chunked       │
  │                                     │
  │ ◄─ chunk1 (data)                    │   (응답 유지한 채)
  │                                     │
  │ ◄─ chunk2 (data)                    │
  │                                     │
  │ ◄─ chunk3 (data)                    │
  │                                     │
  │ ◄─ 0\r\n (끝)                       │   (서버가 닫을 때까지)
```

- HTTP/1.1의 **`Transfer-Encoding: chunked`** 활용
- 서버가 응답 헤더를 보낸 뒤 **응답 바디를 chunk 단위로 계속 추가**
- 클라이언트는 `0\r\n` 종결 chunk를 받을 때까지 연결 유지

## `Transfer-Encoding: chunked` 란?

HTTP Streaming의 **핵심 엔진**. "응답 바디를 여러 조각(chunk)으로 나눠 보내는 HTTP/1.1 전송 방식"이다.

### 왜 필요한가

일반 HTTP 응답은 서버가 **총 크기를 미리 알고** `Content-Length` 헤더에 적어 보낸다.

```http
HTTP/1.1 200 OK
Content-Length: 1234        ← "바디가 1234 바이트다"
Content-Type: text/html
```

그런데 서버가 **크기를 미리 모르는 경우**가 있다.

- 실시간으로 생성되는 응답 (로그 스트림, AI 토큰 스트림)
- DB에서 한 줄씩 뽑아오는 대용량 데이터
- 압축이 완료되기 전에 전송 시작하고 싶을 때
- **연결을 열어둔 채 계속 추가 전송하고 싶을 때** ← HTTP Streaming

이럴 때 `Content-Length` 대신 **`Transfer-Encoding: chunked`** 를 쓴다.

### 동작 방식

```http
HTTP/1.1 200 OK
Transfer-Encoding: chunked
Content-Type: text/plain

7\r\n                   ← chunk 크기 (16진수, 7 = 7바이트)
Mozilla\r\n             ← 실제 데이터
9\r\n
Developer\r\n
7\r\n
Network\r\n
0\r\n                   ← 크기 0 = 끝 신호
\r\n
```

- 각 chunk = **"16진수 크기 + `\r\n` + 데이터 + `\r\n`"**
- 연속으로 여러 chunk 전송 가능
- **`0\r\n\r\n`** 을 받으면 수신자는 응답 종료로 인식

### 왜 이게 Streaming의 핵심인가

`Content-Length`를 쓰면 서버가 **미리 모든 데이터를 준비**해야 한다 → 스트리밍 불가능.

반면 chunked는:
- 서버가 첫 chunk만 있으면 전송 시작
- 도중에 새 데이터가 생기면 **다음 chunk로 추가 전송**
- 언제 끝날지 미리 몰라도 됨 (`0\r\n`으로 끝내면 되니까)

→ **"응답을 열어둔 채 계속 흘려보내기"가 가능한 이유**가 바로 이 헤더.

### 서버 출력 흐름 예시

```
서버 (1초마다 새 데이터)              응답 바디
────────────────────────────────────────────────
t=0:  "hello" 생성 ──► chunk 전송    5\r\nhello\r\n
t=1:  "world" 생성 ──► chunk 전송    5\r\nworld\r\n
t=2:  "!!!"   생성 ──► chunk 전송    3\r\n!!!\r\n
t=3:  종료     ──►    끝 chunk        0\r\n\r\n
```

클라이언트는 chunk가 들어올 때마다 즉시 처리 가능.

### HTTP/2 이후

- **HTTP/2는 `Transfer-Encoding: chunked`를 쓰지 않는다**
- 대신 HTTP/2의 **DATA 프레임**이 본질적으로 스트리밍 구조 — "청크" 개념이 프로토콜 레벨에 내장
- HTTP/1.1용 chunked 응답은 HTTP/2 게이트웨이를 지나면 DATA 프레임으로 자동 변환

## 과거 구현 기법들

표준이 없던 시절 브라우저 호환을 위해 여러 편법이 등장했다.

| 기법 | 방식 | 한계 |
|------|------|------|
| **Chunked Transfer** | `Transfer-Encoding: chunked`로 응답을 계속 flush | 프록시 버퍼링 이슈 |
| **`multipart/x-mixed-replace`** | 한 응답에 여러 MIME 파트를 경계문자로 구분해 순차 전송 | 브라우저 지원 일관성 부족 |
| **Forever iframe** | 숨겨진 iframe을 열어두고 `<script>` 태그를 계속 밀어넣음 | 편법, 보안·오류 처리 복잡 |
| **XHR Streaming** | `XMLHttpRequest`의 `onprogress`로 응답 조각 실시간 수신 | IE 구버전 미지원 |

### Chunked Transfer 예시

```http
HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

7\r\n
Mozilla\r\n
9\r\n
Developer\r\n
7\r\n
Network\r\n
0\r\n
\r\n
```

- 각 chunk는 "16진수 크기 + `\r\n` + 데이터 + `\r\n`"
- `0\r\n\r\n` 으로 종료

### Forever iframe — 역사적 편법

```html
<!-- 숨겨진 iframe에 스트림 URL을 로드하고, 서버는 <script>를 계속 밀어넣음 -->
<iframe style="display:none" src="/stream"></iframe>
```

서버가 이런 응답을 계속 flush:

```html
<script>parent.onMessage("new data 1")</script>
<script>parent.onMessage("new data 2")</script>
...
```

## SSE와의 관계

**SSE = HTTP Streaming의 표준화 버전**.

| 항목 | HTTP Streaming | SSE |
|------|----------------|-----|
| 표준 | 없음 (기법) | WHATWG HTML (프로토콜) |
| 전용 MIME | 없음 (구현마다) | `text/event-stream` |
| 메시지 포맷 | 자유 | `event:/data:/id:` 필드 |
| 재연결 | 수동 | **브라우저 자동** |
| 브라우저 API | 없음 (`XHR` 수동 파싱) | `EventSource` |
| 현재 위상 | 레거시 | **현역 표준** |

> HTTP Streaming이 "이렇게 하면 서버 push 된다"는 발상이었다면, SSE는 그걸 **정식 규격**(메시지 포맷 + 재연결 + `Last-Event-ID`)으로 정리한 것. 오늘날 "HTTP Streaming을 하고 싶다"면 거의 모든 경우 **SSE를 쓰면 된다**.

## 현대에도 남아있는 HTTP Streaming

SSE가 표준이 됐지만, SSE 포맷을 따르지 않는 HTTP Streaming이 여전히 쓰이는 경우도 있다.

| 용도 | 예 |
|------|---|
| **AI 응답 스트리밍** | OpenAI/Anthropic API도 실질은 SSE지만, SDK에 따라 raw chunked streaming으로 처리 |
| **대용량 파일 다운로드** | 서버가 파일을 chunk로 흘려보냄 (SSE 아님, 일반 binary streaming) |
| **HTTP/2 DATA 프레임** | HTTP/2는 모든 응답이 프레임 단위라 본질적으로 스트리밍 |
| **gRPC-Web Server Streaming** | gRPC의 서버 스트리밍을 HTTP/2 위에서 구현 |
| **Elasticsearch Bulk/Stream API** | 응답을 chunk로 내림 |

## 폴링 계열과의 비교

| 방식 | 연결 유지 | 응답 빈도 | 종료 조건 |
|------|----------|----------|----------|
| **Polling** | X (매번 새 요청) | 매 주기 | 각 응답이 즉시 종료 |
| **Long Polling** | 요청당 유지 | 이벤트 발생 시 | 응답 1번 후 종료 → 재요청 |
| **HTTP Streaming** | **한 요청으로 계속 유지** | 서버 의지 | 서버가 닫을 때까지 |
| **SSE** | 한 요청으로 계속 유지 | 서버 의지 | 서버가 닫을 때까지 |

## Spring에서 HTTP Streaming 구현

### 단순 Chunked 응답 (비 SSE)

```java
@GetMapping(value = "/stream", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
public StreamingResponseBody stream() {
    return outputStream -> {
        for (int i = 0; i < 10; i++) {
            outputStream.write(("chunk " + i + "\n").getBytes());
            outputStream.flush();
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        }
    };
}
```

- `StreamingResponseBody`가 Spring MVC의 비동기 스트리밍 타입
- 실시간 로그 스트리밍, 대용량 파일 다운로드 등에 적합

### SSE를 쓸 수 있으면 SSE가 더 나음

단순 스트리밍이 필요해도 브라우저 자동 재연결·표준 포맷이 붙는 **SSE(`SseEmitter`)** 가 거의 항상 낫다.

## 한계

- **프록시/로드밸런서 버퍼링** — Nginx가 chunk를 모아서 한 번에 보내면 실시간성 손해 → `proxy_buffering off`
- **로드밸런서 유휴 타임아웃** — 장기 연결이므로 LB 타임아웃을 넘기면 끊김
- **재연결 수동** — SSE와 달리 끊김 복구는 직접 구현
- **포맷 자유도의 함정** — "자유 = 표준 없음" → 브라우저·프록시마다 동작 다를 수 있음

## 요약

- HTTP Streaming = **HTTP 응답을 끊지 않고 chunk로 계속 흘려보내는 기법**
- 표준 없이 **chunked/multipart/iframe/XHR** 등 여러 구현이 공존했던 Comet 시대 기술
- **SSE가 이를 표준화** — 현재 "HTTP Streaming" 용도는 거의 SSE로 대체됨
- 파일 다운로드, 비 SSE AI 응답, gRPC-Web 서버 스트리밍 등 **특수 용도에만 남아있음**
- 새 프로젝트에서 서버 push 스트리밍이 필요하면 **고민 없이 SSE 선택**

## 관련 문서

- [Polling과 Long Polling.md](Polling과-Long-Polling.md) — Comet 시대 다른 한 축
- [WebHook.md](WebHook.md)
- [../../SSE/SSE (Server-Sent Events).md](../../SSE/SSE-%28Server-Sent-Events%29.md) — HTTP Streaming의 표준화 버전
- [../../HTTP vs SSE vs WebSocket 비교.md](../../HTTP-vs-SSE-vs-WebSocket-비교.md)
- [../../프로토콜의 구성 요소.md](../../%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EC%9D%98-%EA%B5%AC%EC%84%B1-%EC%9A%94%EC%86%8C.md)
