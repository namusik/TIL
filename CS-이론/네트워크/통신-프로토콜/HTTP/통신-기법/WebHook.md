# WebHook

> 최종 업데이트: 2026-04-22 | 기준: HTTP 기반 이벤트 콜백 패턴

## 개념

**WebHook(웹훅)** 은 **"이벤트가 발생했을 때 미리 등록된 URL로 서버가 HTTP 요청을 보내주는"** 이벤트 기반 통신 기법이다. 별도 프로토콜이 아니라 **HTTP POST를 이용한 서버→서버 콜백 패턴**.

> 비유하자면 **"택배 오면 초인종 눌러주세요"**. 내가 주기적으로 "택배 왔어?" 하고 물어볼 필요 없이, 택배가 오면 배달원이 알아서 벨을 눌러주는 방식. Polling(내가 계속 묻는 것)의 반대 방향.

## "프로토콜이 아니라 기법"인 이유

| 항목 | 분류 |
|------|------|
| 와이어 포맷 | **그냥 HTTP POST** (별도 포맷 없음) |
| 전용 MIME | 없음 (서비스별 커스텀) |
| 표준 스펙 | **없음** (업계 관례만 존재) |
| 본질 | **HTTP를 이용한 이벤트 알림 패턴** |

→ GitHub, Stripe, Slack 등 각 서비스가 **자체적으로 페이로드 포맷·서명 방식을 정의**하고 있을 뿐, 공통 표준은 없다.

## 배경/역사

- **2007** — Jeff Lindsay가 **"Web Hooks"** 이라는 개념 제안 (블로그 글에서 용어 정착)
- 초기 웹에서는 **Polling 방식** — 클라이언트가 주기적으로 서버에 요청을 보내 데이터 확인
- **2000년대 후반** — GitHub, Slack, Stripe 등 주요 웹 서비스가 웹훅 채택
  - **GitHub**: 코드 저장소 변경을 외부 서비스에 실시간 전송 → CI/CD 자동화
  - **Stripe**: 결제 처리 후 결제 정보를 다른 시스템에 전송 → 재고/영수증 자동화
  - **Slack**: 다양한 이벤트를 채팅방 알림으로 전송 → 팀 협업 강화
- 지금은 SaaS API의 **사실상 표준 통합 수단**

## 동작 과정

```
 [Source 서버]                            [Target 서버]
   │                                         │
 이벤트 발생                                   │
 (예: GitHub push)                            │
   │                                         │
   │  POST /webhook HTTP/1.1                 │
   │  Content-Type: application/json         │
   │  X-Hub-Signature-256: sha256=...        │
   │                                         │
   │  {"event": "push",                      │
   │   "repo": "...",                        │
   │   "commits": [...]}                     │
   │ ──────────────────────────────────────► │
   │                                         │
   │                                    엔드포인트에서
   │                                    페이로드 처리
   │                                    (CI 트리거 등)
   │                                         │
   │              200 OK                     │
   │ ◄────────────────────────────────────── │
```

### 4단계

1. **이벤트 발생** — 웹훅이 설정된 시스템에서 특정 이벤트가 발생 (예: GitHub 코드 푸시)
2. **웹훅 트리거** — 사전에 설정된 엔드포인트로 HTTP 요청 발송
3. **데이터 전송** — 요청 바디에 이벤트 관련 데이터 포함 (주로 **JSON**)
4. **수신 서버 처리** — 엔드포인트가 요청을 받아 페이로드를 처리

## 핵심 용어

| 용어 | 설명 |
|------|------|
| **웹훅 수신 엔드포인트** | 내 애플리케이션이 다른 시스템의 이벤트를 받는 URL (내가 만드는 쪽) |
| **웹훅 발신 엔드포인트** | 내 애플리케이션이 다른 시스템으로 이벤트를 보내는 URL (외부 수신처) |
| **Payload** | 이벤트 데이터 (JSON 본문) |
| **Signature / Secret** | 요청이 위조되지 않았음을 검증하는 서명 |
| **Delivery** | 웹훅 1회 전송 단위 |

## Polling vs WebHook

같은 문제(이벤트 알림)를 푸는 두 가지 반대 방향의 해법.

| 항목 | **Polling** | **WebHook** |
|------|-------------|-------------|
| 방향 | Target → Source (질문) | **Source → Target (푸시)** |
| 누가 주도? | 받는 쪽이 계속 물어봄 | 보내는 쪽이 발생 시 통보 |
| 지연 | 주기만큼 | **즉시** |
| 서버 부하 | 높음 (매번 요청) | 낮음 (이벤트 시만) |
| 구현 위치 | 받는 쪽 | **보내는 쪽** (엔드포인트는 받는 쪽) |
| 공개 IP 필요 | Target은 불필요 | **Target에 공개 가능한 URL 필요** |

> "WebHook은 Polling의 반대" — 이 한 문장으로 이해 끝.

## 대표 사용 사례

| 분야 | 예시 |
|------|------|
| **CI/CD** | GitHub push → Jenkins/GitHub Actions 빌드 트리거 |
| **알림 시스템** | 모니터링 알람 → Slack 메시지, 이메일 |
| **결제 처리** | Stripe 결제 완료 → 가맹점 서버에 주문 확정 |
| **데이터 동기화** | CRM 업데이트 → 외부 시스템 실시간 반영 |
| **SaaS 통합** | Zapier, Make(구 Integromat) 같은 자동화 도구 |
| **챗봇** | Slack/Discord 슬래시 커맨드 |

## 보안

공개 URL로 요청을 받는 구조라 **반드시 검증이 필요**하다.

### 1. Signature 검증 (HMAC)

가장 표준적인 방법. 발신 측과 수신 측이 **공유 secret**을 가지고 HMAC 서명을 계산·검증.

```
X-Hub-Signature-256: sha256=a6f9...  (GitHub)
Stripe-Signature: t=...,v1=...        (Stripe)
```

```java
// 수신 측 검증 예시 (Java)
String payload = request.body();
String signature = request.header("X-Hub-Signature-256");

String expected = "sha256=" + HmacUtils.hmacSha256Hex(secret, payload);
if (!MessageDigest.isEqual(expected.getBytes(), signature.getBytes())) {
    return 401;
}
```

### 2. IP 화이트리스트

GitHub/Stripe 등은 발신 IP 범위를 공개 → 해당 IP만 허용.

### 3. Replay 공격 방지

- `timestamp` 헤더 검증 — 5분 이상 지난 요청 거부
- `event_id` 중복 처리 방지 (멱등성)

### 4. HTTPS 필수

- secret과 payload가 평문 노출되지 않도록 **TLS 필수**

## 안정성 설계

### 1. 재시도 (Retry)

- 수신 측이 `2xx`를 응답하지 않으면 발신 측이 재시도
- 보통 **지수 백오프**(1s → 5s → 25s ...)로 여러 번 시도
- 수신 측은 반드시 **빠르게 `200` 응답** 하고 실제 처리는 비동기로 (타임아웃 방지)

### 2. 멱등성 (Idempotency)

- 재시도로 같은 이벤트가 여러 번 올 수 있음
- `event_id` / `delivery_id`로 **중복 처리 방지** 필수

### 3. Dead Letter

- 반복 실패 시 발신 측에서 포기 — 재전송 로그/UI로 수동 재시도 가능해야 함

### 4. 비동기 처리

- 수신 엔드포인트는 **접수만 하고 즉시 200 응답** → 실제 처리는 큐(SQS, Kafka)로 위임
- 수신 처리에 시간이 걸리면 타임아웃 → 재시도 폭주

## 수신 엔드포인트 구현 (Spring 예시)

```java
@RestController
public class WebHookController {

    private final WebhookService service;

    @PostMapping("/webhook/github")
    public ResponseEntity<Void> github(
            @RequestHeader("X-Hub-Signature-256") String signature,
            @RequestHeader("X-GitHub-Delivery") String deliveryId,
            @RequestBody String payload) {

        if (!service.verifySignature(payload, signature)) {
            return ResponseEntity.status(401).build();
        }
        if (service.alreadyProcessed(deliveryId)) {
            return ResponseEntity.ok().build();          // 멱등
        }

        service.enqueueAsync(payload);                    // 큐에 적재만
        return ResponseEntity.ok().build();              // 즉시 200
    }
}
```

## 개발 시 쓰는 도구

로컬 개발 환경은 공개 IP가 없어 외부 서비스가 WebHook을 보낼 수 없음. 다음 도구로 터널링.

| 도구 | 설명 |
|------|------|
| **ngrok** | 로컬 포트를 공개 URL로 터널링 (표준 도구) |
| **localtunnel** | ngrok 대체 오픈소스 |
| **Cloudflare Tunnel** | Cloudflare의 무료 터널 |
| **webhook.site** | 테스트용 임시 수신 URL (페이로드 확인) |

```sh
ngrok http 8080
# https://abc123.ngrok.io → 로컬 8080 포트로 포워딩
```

## 한계

- **공개 URL 필요** — 방화벽 뒤 서비스는 받을 수 없음 (폴링이 대안)
- **전송 보장 없음** — 수신 측이 내려가면 이벤트 누락 가능 (발신 측 재시도에 의존)
- **서비스마다 스펙 다름** — 표준 없어 통합 비용
- **디버깅 어려움** — 다른 서비스가 보내는 거라 재현 까다로움 → ngrok·webhook.site 활용

## 요약

- WebHook = **이벤트 발생 시 미리 등록된 URL로 HTTP POST를 보내는 서버→서버 콜백 패턴**
- **Polling의 반대 방향** — 즉시 전달, 서버 부하 낮음
- 프로토콜이 아닌 **HTTP 기반 관례**, 서비스마다 포맷/서명이 다름
- **Signature 검증 + 멱등성 + 비동기 처리**가 구현의 핵심 3요소
- SaaS 시대의 **사실상 표준 통합 수단**

## 관련 문서

- [Polling과 Long Polling.md](Polling과-Long-Polling.md) — 반대 방향 기법
- [../HTTP.md](../HTTP.md)
- [../../SSE/SSE (Server-Sent Events).md](../../SSE/SSE-%28Server-Sent-Events%29.md)
- [../../WebSocket/WebSocket.md](../../WebSocket/WebSocket.md)
