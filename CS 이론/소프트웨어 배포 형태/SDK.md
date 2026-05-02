# SDK (Software Development Kit)

> 최종 업데이트: 2026-04-27 | 기준 정보: 일반 개념 + 백엔드 개발자 관점

## 개념

**SDK (Software Development Kit)** 는 특정 플랫폼/서비스의 기능을 다른 개발자가 **자신의 애플리케이션에 끼워 넣어 사용할 수 있도록** 제공하는 도구·라이브러리·문서·샘플 코드의 묶음이다.

> 비유: **SDK = 가구 부품 키트.** 나사·경첩·설명서를 묶어서 주면, 고객이 자기 가구에 직접 조립해 넣음. 완성된 가구를 배달하는 것이 아님.

핵심은 **"고객이 만드는 프로그램의 일부로 들어간다"** 는 점. 따라서 SDK는 단독으로 실행되지 않고, 고객 코드가 `import` 해서 함수를 호출해야 동작한다.

---

## 배경/역사

- **1980년대**: Apple이 Macintosh용 개발 도구를 "Macintosh Programmer's Workshop"이란 이름으로 배포한 것이 초기 형태.
- **1990년대**: Microsoft Windows SDK, Java SDK(JDK) 등이 등장하면서 "SDK"라는 용어가 표준화됨.
- **2008년 iPhone SDK**: 모바일 앱 생태계 폭발의 기폭제. 외부 개발자가 플랫폼에 앱을 만들어 올릴 수 있게 됨.
- **2010년대 이후**: 클라우드/SaaS 시대에 들어오며 **각 회사가 자사 API를 쉽게 호출할 수 있게 SDK를 제공**하는 것이 표준이 됨 (AWS SDK, Stripe SDK, Firebase SDK 등).

---

## SDK 구성 요소

SDK는 보통 아래 요소들의 묶음이다.

| 구성 요소 | 설명 | 예시 |
|---|---|---|
| **라이브러리/바이너리** | 실제 기능이 담긴 코드 (`.jar`, `.aar`, `.dll`, `.so`, `.framework`) | `aws-sdk-java.jar` |
| **API 문서** | 어떤 함수/클래스가 있고 어떻게 호출하는지 설명 | Javadoc, ReadTheDocs |
| **샘플 코드** | 빠르게 시작할 수 있는 예제 | GitHub example repo |
| **CLI/도구** | 빌드·테스트·배포를 돕는 명령어 도구 | `aws configure` |
| **에뮬레이터/시뮬레이터** | (모바일 SDK) 실제 기기 없이 테스트할 환경 | Android Emulator |

---

## SDK vs 다른 배포 형태

질문에서 비교한 "**jar 파일 + start.sh로 설치**"는 SDK가 아니라 **standalone 애플리케이션 배포(on-premise 설치)** 에 해당한다. 둘은 완전히 다른 개념이다.

### 핵심 차이

| 구분 | SDK | Standalone 배포 (jar + start.sh) |
|---|---|---|
| **무엇을 주는가** | 라이브러리, API 문서, 샘플 | 완성된 실행 가능한 애플리케이션 |
| **고객이 하는 일** | 자기 코드에 `import`해서 함수 호출 | `start.sh` 실행만 하면 끝 |
| **실행 주체** | 고객 애플리케이션 **프로세스 내부**에서 동작 | **별도 독립 프로세스/서버**로 동작 |
| **고객 코드 수정** | 필수 (코드에 통합해야 함) | 불필요 (네트워크로 통신) |
| **통신 방식** | 함수 호출 (in-process) | HTTP/gRPC/TCP 등 (out-of-process) |
| **대표 예시** | AWS SDK, Stripe SDK | Jenkins, Elasticsearch, 사내 솔루션 on-prem 패키지 |

### 코드로 보는 차이

```java
// SDK 사용 — 고객이 자기 코드에 직접 끼워 넣음
import com.mycompany.sdk.PaymentClient;

PaymentClient client = new PaymentClient("api-key");
client.charge(10000);  // 고객 프로세스 내부에서 실행
```

```bash
# Standalone 배포 — 고객은 그냥 띄우기만
./start.sh
# → 8080 포트에 독립 서버가 뜸
# → 고객 코드는 HTTP로 호출
curl http://localhost:8080/api/charge
```

### SDK vs Library vs API vs Framework

자주 헷갈리는 4가지를 정리하면.

| 용어 | 무엇인가 | 호출 방향 |
|---|---|---|
| **Library** | 특정 기능만 모아둔 코드 묶음 | 내 코드 → 라이브러리 호출 |
| **SDK** | 라이브러리 + 문서 + 도구 + 샘플의 **묶음** (보통 특정 플랫폼/서비스용) | 내 코드 → SDK 호출 |
| **API** | 외부와 통신하는 **인터페이스 명세** (REST API, 함수 시그니처 등) | 통신 규약 자체 |
| **Framework** | 동작 **틀**을 제공하고 내 코드를 끼워 넣는 구조 | 프레임워크 → 내 코드 호출 (IoC) |

> 비유: **Library는 부품, SDK는 부품+설명서+공구 세트, API는 콘센트 규격, Framework는 집의 골조**.

---

## SDK가 API를 감싸는 패턴

요즘 SDK의 가장 흔한 형태는 **REST API 위에 얇은 wrapper**를 씌운 것. 직접 HTTP 호출하면 번거로운 부분(인증, 재시도, 페이지네이션, 에러 처리)을 SDK가 대신 처리해준다.

```java
// API 직접 호출 — 번거로움
HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/v1/users"))
    .header("Authorization", "Bearer " + token)
    .header("Content-Type", "application/json")
    .POST(BodyPublishers.ofString("{\"name\":\"Tom\"}"))
    .build();
HttpResponse<String> res = client.send(req, BodyHandlers.ofString());
// → JSON 파싱, 에러 처리, 재시도 직접 구현해야 함
```

```java
// SDK 사용 — 간결
ExampleClient client = ExampleClient.builder()
    .apiKey("...")
    .build();
User user = client.users().create(UserCreateRequest.of("Tom"));
```

---

## 동작 흐름

```
[ 고객 애플리케이션 프로세스 ]
        │
        │ 함수 호출
        ▼
   ┌─────────┐
   │   SDK   │ ←─── jar/lib 형태로 의존성 추가
   └─────────┘
        │
        │ (내부에서 HTTP 호출)
        ▼
   ┌──────────────┐
   │  SDK 제공사  │
   │  서비스 API  │
   └──────────────┘
```

- SDK는 고객 프로세스 내부에서 실행됨 → 메모리·CPU를 고객 앱이 같이 씀
- 외부 서비스 호출이 필요하면 SDK가 내부적으로 HTTP/gRPC 요청을 보냄

---

## 백엔드 개발자가 알아야 할 포인트

### 1. SDK 의존성 관리
- **버전 고정** 필수. SDK가 자동 업데이트되면서 호환성 깨지는 사례 흔함.
- Gradle: `implementation 'com.amazonaws:aws-java-sdk-s3:1.12.x'` 처럼 명시적 버전 지정.
- BOM(Bill of Materials)을 제공하는 SDK도 있음 → 여러 모듈 버전을 한 번에 맞춰줌.

### 2. SDK 내부 동작 이해
- SDK는 보통 **HTTP 클라이언트 풀, 재시도, 타임아웃, 백오프** 등을 내장.
- 운영 중 장애 분석을 위해 어떤 설정이 가능한지 알아둘 것.
  - 예: AWS SDK의 `ClientConfiguration`에서 타임아웃·재시도 횟수 조정 가능.

### 3. 자체 SDK를 만들 때 고려사항
- **Public API 설계**: 한 번 노출하면 호환성 깨기 어려움 → 신중히.
- **버전 정책**: Semantic Versioning (Major.Minor.Patch) 준수.
- **인증 처리**: API Key, OAuth 등 인증 흐름을 SDK에서 추상화.
- **재시도/에러 처리**: 네트워크 일시 오류는 SDK가 자동으로 처리해주는 것이 친절.
- **로깅/관찰성**: 디버깅 모드, 요청/응답 로깅 옵션 제공.
- **다언어 지원**: 주요 고객층 언어(Java, Python, JS, Go 등)별로 별도 SDK 제공이 일반적.

### 4. SDK 보안
- **API Key 노출 주의**: 클라이언트(모바일/웹)에 SDK 넣을 때 키가 노출되지 않도록 설계.
- **민감 데이터 로깅 금지**: SDK 내부 로그에 토큰·개인정보가 찍히지 않도록.
- **TLS 검증**: SDK가 인증서 검증을 끄는 옵션을 제공한다면 운영에선 절대 사용 금지.

---

## 실제 사례

| SDK | 용도 |
|---|---|
| **AWS SDK** | EC2, S3, DynamoDB 등 AWS 서비스 호출 |
| **Stripe SDK** | 결제 처리 (카드 토큰화, 결제 요청 등) |
| **Firebase SDK** | 모바일 앱 인증, FCM 푸시, Firestore 등 |
| **Slack SDK (Bolt)** | Slack 봇/앱 개발 |
| **Kakao SDK** | 카카오 로그인, 메시지 전송 |
| **Sentry SDK** | 에러 모니터링/리포팅 |

---

## 정리

- **SDK = 라이브러리 + 문서 + 도구 + 샘플의 묶음**, 고객이 자기 코드에 통합해서 쓴다.
- "**jar + start.sh**" 배포는 SDK가 아니라 **standalone 애플리케이션 배포**다. 실행 주체와 통합 방식이 완전히 다름.
- 자체 SDK를 만들 때는 **버전 정책, 인증 추상화, 재시도, 로깅** 등 운영 친화적 설계가 핵심.
