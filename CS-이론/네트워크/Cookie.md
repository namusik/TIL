# Cookie

> 최종 업데이트: 2026-06-02 | 기준: HTTP/1.1, RFC 6265bis

## 개념

**Cookie**는 서버가 브라우저에 저장하라고 내려주는 작은 데이터 조각이다. 한 번 저장되면 같은 도메인으로 가는 모든 요청에 **자동으로 따라붙어** 전송된다.

> 비유하자면 **회원 손목띠**. 카페에서 손목띠를 채워주면(서버가 발급), 그날 매장을 드나들 때마다 직원이 손목띠만 보고 회원임을 알아본다(자동 전송). 손목띠에는 회원 번호만 적혀 있고, 진짜 회원 정보는 카페 컴퓨터에 있다.

HTTP가 **stateless**(요청 간 상태 기억 없음)라서, 로그인 상태나 장바구니, 사용자 설정 같은 "이 사람이 누구인지/뭘 골랐는지"를 유지하려면 별도 메커니즘이 필요하다. 쿠키가 그 표준 해결책으로 1994년 등장했다.

쿠키는 단순히 데이터 저장이 아니라 **자동 전송**이 핵심이다. JS로 직접 만들 수도 있는 `localStorage`/`sessionStorage`와 달리, 쿠키는 브라우저가 알아서 HTTP 헤더에 넣어준다.

## 배경/역사

- **1994년 Netscape**의 엔지니어 **Lou Montulli**가 고안. 최초 용도는 **쇼핑몰 장바구니** — 페이지를 이동해도 카트를 유지하기 위함
- 이름 유래: Unix 시스템의 "magic cookie"(프로그램 간 주고받는 작은 식별 토큰) 차용
- **RFC 2109** (1997): 최초 표준화
- **RFC 2965** (2000): Cookie2 헤더 도입 (실제론 채택 안 됨)
- **RFC 6265** (2011): 현행 표준. 실제 브라우저 동작 기준으로 재정리
- **RFC 6265bis**: SameSite 등 최신 동작 반영, IETF에서 진행 중

### SameSite의 등장

- 쿠키가 자동으로 모든 요청에 실리는 특성을 악용한 **CSRF 공격**이 만연
- **2016년 IETF 드래프트**로 `SameSite` 속성 제안
- **2020년 2월 Chrome 80** — `SameSite=Lax`를 **기본값**으로 적용. 웹 보안의 큰 전환점

## 동작 흐름

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as Server

    B->>S: GET /login (요청 1)
    S->>B: 200 OK<br/>Set-Cookie: theme=dark; Max-Age=86400
    Note over B: 쿠키 저장 (도메인·만료 기준)

    B->>S: GET /mypage (요청 2)<br/>Cookie: theme=dark
    S->>B: 200 OK

    B->>S: GET /cart (요청 3)<br/>Cookie: theme=dark
    S->>B: 200 OK
```

서버가 `Set-Cookie` 헤더로 보내면 브라우저가 저장하고, 이후 같은 도메인 요청마다 `Cookie` 헤더에 자동으로 실어 보낸다.

## HTTP 헤더 형식

**서버 → 클라 (응답)**

```http
Set-Cookie: sessionId=abc123; Domain=example.com; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Lax
```

**클라 → 서버 (요청)**

```http
Cookie: sessionId=abc123; theme=dark; lang=ko
```

요청 쪽은 이름=값만 줄줄이 붙는다. 속성(`Domain`, `Path` 등)은 응답에만 존재한다.

## 쿠키 속성

| 속성 | 의미 | 예시 |
|---|---|---|
| `Domain` | 쿠키를 보낼 도메인 범위 | `Domain=example.com` → `api.example.com`에도 전송 |
| `Path` | 쿠키를 보낼 경로 범위 | `Path=/admin` → `/admin/*`에만 전송 |
| `Expires` | 절대 만료 시각 (구식) | `Expires=Wed, 01 Jan 2027 00:00:00 GMT` |
| `Max-Age` | 상대 만료 (초). Expires보다 우선 | `Max-Age=3600` → 1시간 후 만료 |
| `Secure` | **HTTPS에서만** 전송. 평문 도청 방지 | (속성만 있으면 활성화) |
| `HttpOnly` | **JS에서 접근 불가** (`document.cookie` 차단). XSS 토큰 탈취 방지 | |
| `SameSite` | 크로스 사이트 요청에 쿠키 포함 여부. **CSRF 방어** | `SameSite=Lax` |
| `Partitioned` | 사이트별로 쿠키 저장소 분리 (CHIPS, 2024년~) | |

> `Domain`을 명시하지 않으면 **현재 도메인에만** 적용 (서브도메인 X). 명시하면 자기 + 모든 서브도메인.

## SameSite 정책

크로스 사이트 요청(다른 도메인에서 우리 도메인으로 가는 요청)에 쿠키를 실을지 결정. CSRF 방어의 핵심.

| 값 | 동작 | 쓰임새 |
|---|---|---|
| `Strict` | **같은 사이트 요청에만** 쿠키 전송. 외부 링크로 들어와도 쿠키 없음 → 로그인 풀려 보임 | 결제·관리자 등 민감 작업 |
| `Lax` | 같은 사이트 + **Top-level GET 네비게이션**(외부 링크 클릭, 북마크)에 전송. POST·iframe·XHR은 차단 | **현재 브라우저 기본값** |
| `None` | 모든 크로스 사이트 요청에 전송. **반드시 `Secure` 동반 필요** | 3rd party 위젯, OAuth 콜백 |

> Chrome 80(2020) 이후 `SameSite` 미지정 시 자동으로 `Lax`. 옛 코드 중 3rd party iframe에 쿠키 의존하는 부분이 이때 대거 깨졌다.

## 쿠키 종류

| 분류 | 종류 | 차이 |
|---|---|---|
| 수명 | **Session Cookie** | `Expires`/`Max-Age` 없음 → 브라우저 종료 시 삭제 |
|  | **Persistent Cookie** | 만료 시각까지 유지 |
| 출처 | **1st Party Cookie** | 사용자가 보는 도메인이 직접 발급 |
|  | **3rd Party Cookie** | 페이지에 포함된 외부 도메인(광고·트래커)이 발급. **사생활 이슈로 단계적 폐기 중** — Safari/Firefox는 차단, Chrome도 점진 폐지 |

## 쿠키 vs localStorage / sessionStorage

브라우저 데이터 저장 방식 비교. 쿠키는 **서버 자동 전송**이 핵심이고, Storage 계열은 **JS에서만 다루는 클라이언트 저장소**다.

| 항목 | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| 최대 크기 | ~4KB | ~5~10MB | ~5~10MB |
| 자동 전송 | ✅ 모든 요청에 자동 | ❌ JS가 직접 첨부 | ❌ JS가 직접 첨부 |
| 만료 | `Max-Age`/`Expires` | 명시적 삭제 전까지 영구 | **탭 종료 시 삭제** |
| JS 접근 | `HttpOnly` 시 차단 가능 | 항상 가능 | 항상 가능 |
| 서버 발급 | ✅ | ❌ (JS만) | ❌ (JS만) |

> 인증 토큰은 보통 **`HttpOnly` 쿠키** 또는 **localStorage** 중 선택. localStorage는 XSS에 통째로 노출돼 보안상 쿠키가 우위.

## 쿠키 메커니즘의 보안 위협

쿠키가 자동으로 모든 요청에 실리는 특성이 곧 공격 표면이 된다. 위에서 본 속성들이 각각의 방어책.

| 공격 | 내용 | 방어 |
|---|---|---|
| **XSS → 쿠키 탈취** | `document.cookie`로 쿠키 통째로 빼감 | `HttpOnly` |
| **CSRF** | 피해자가 로그인된 상태에서 공격 사이트가 우리 사이트로 요청 위조 → 쿠키 자동 동승 | `SameSite=Lax/Strict`, CSRF 토큰 |
| **MITM (평문 도청)** | HTTP 평문에서 쿠키 추출 | `Secure` + HTTPS 강제 (HSTS) |
| **서브도메인 공격** | 한 서브도메인의 XSS가 부모 도메인 쿠키 접근 | `Domain` 최소화, `__Host-` 프리픽스 |

> 세션 ID를 쿠키에 담아 운반할 때의 추가 위협(Session Hijacking, Session Fixation)은 [Session.md](Session.md) 참고.

## 관련 문서

- [Session.md](Session.md)
- [통신-프로토콜/HTTP/](통신-프로토콜/HTTP/)
- [보안/TLS/TLS.md](보안/TLS/TLS.md)
- [../../인증/](../../인증/)
