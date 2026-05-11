# I/O 모델

> 최종 업데이트: 2026-03-24

## 개요

I/O 모델은 두 가지 축의 조합으로 이해한다.

| | 블로킹 | 논블로킹 |
|---|--------|----------|
| **동기** | 요청 후 완료까지 대기 | 요청 후 즉시 반환, 완료 여부를 직접 반복 확인 |
| **비동기** | (실무에서 거의 없음) | 요청 후 즉시 반환, 완료 시 콜백/이벤트로 통지 |

**핵심 구분:**
- **동기/비동기** — 작업 완료를 **누가** 확인하는가? (호출자 vs 시스템)
- **블로킹/논블로킹** — 호출 후 제어권을 **즉시 반환**하는가? (대기 vs 즉시 반환)

## 동기 vs 비동기

### 동기 (Synchronous)

호출자가 작업 완료를 직접 확인하고, 완료 후 다음 작업을 진행한다.

```java
// 동기 - 호출자가 결과를 직접 받아서 다음 작업 진행
String result = restTemplate.getForObject(url, String.class);  // 완료까지 대기
process(result);
```

- 코드 흐름이 직관적이고 예측 가능
- 작업이 오래 걸리면 전체 실행 시간이 길어짐
- 사용처: 트랜잭션 처리, 순차적 의존 작업, 리소스 동기화

### 비동기 (Asynchronous)

작업 완료를 시스템이 콜백/이벤트로 알려준다. 호출자는 완료를 기다리지 않고 다른 작업을 수행한다.

```java
// 비동기 - 콜백으로 완료 통지
CompletableFuture.supplyAsync(() -> callExternalApi())
        .thenAccept(result -> process(result));  // 완료 시 콜백 실행

doOtherWork();  // 기다리지 않고 다른 작업 수행
```

- 리소스 활용도가 높음
- 코드 흐름이 복잡해지고 완료 순서 예측이 어려움
- 사용처: 네트워크 요청, 대규모 파일 I/O, 동시성 작업

## 블로킹 vs 논블로킹

### 블로킹 I/O

I/O 요청 후 완료될 때까지 스레드가 대기(block) 상태가 된다.

```java
// 블로킹 - read() 호출 시 데이터가 올 때까지 스레드 대기
InputStream in = socket.getInputStream();
int data = in.read();  // 데이터 도착할 때까지 여기서 멈춤
```

- 구현이 간단하고 흐름 추적이 쉬움
- 스레드가 대기하므로 리소스 낭비 발생
- 사용처: 단순 클라이언트-서버 통신, 동시 요청이 적은 환경

### 논블로킹 I/O

I/O 요청 후 즉시 제어를 반환한다. 데이터가 준비되지 않았으면 그 상태를 알려준다.

```java
// 논블로킹 - 데이터가 없으면 즉시 0 반환, 스레드는 멈추지 않음
SocketChannel channel = SocketChannel.open();
channel.configureBlocking(false);
int bytesRead = channel.read(buffer);  // 데이터 없으면 0 반환
```

- 스레드가 멈추지 않아 리소스 활용도가 높음
- 프로그래밍이 복잡해짐
- 사용처: 고성능 네트워크 서버, 실시간 데이터 처리

## 4가지 I/O 모델

### 1. 동기-블로킹

가장 보편적인 모델. 요청 후 완료까지 스레드가 대기한다.

```
Thread          Kernel
  │── read() ────→│
  │   (대기...)    │ 데이터 준비 중...
  │   (대기...)    │ 데이터 준비 완료
  │←── 결과 ──────│
  │── 다음 작업    │
```

```java
// JDBC 쿼리 - 결과 올 때까지 스레드 대기
ResultSet rs = statement.executeQuery("SELECT * FROM users");
while (rs.next()) {
    // 처리
}
```

- Spring MVC + JDBC의 기본 모델

### 2. 동기-논블로킹

요청 후 즉시 반환되지만, 호출자가 완료 여부를 반복 확인(polling)한다.

```
Thread              Kernel
  │── read() ────────→│
  │←── EAGAIN ────────│  (데이터 없음)
  │── read() ────────→│
  │←── EAGAIN ────────│  (데이터 없음)
  │── read() ────────→│
  │←── 결과 ──────────│  (데이터 준비 완료)
  │── 다음 작업        │
```

```java
// Future - 완료 여부를 직접 확인
Future<String> future = executor.submit(() -> callApi());

while (!future.isDone()) {  // polling
    doOtherWork();
}
String result = future.get();
```

- 폴링으로 인한 CPU 낭비 가능성
- 실무에서 단독 사용은 드묾

### 3. 비동기-블로킹

비동기로 작업을 시작하지만, 결과를 기다리면서 블로킹된다. 비동기의 이점을 살리지 못하는 안티패턴.

```
Thread                  Kernel
  │── async read() ──────→│
  │   (콜백 등록)          │
  │── select() ──────────→│  ← 여기서 블로킹 (이벤트 대기)
  │   (대기...)            │
  │←── 완료 통지 ─────────│
  │── 다음 작업            │
```

```java
// 비동기로 시작했지만 get()에서 블로킹
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> callApi());
String result = future.get();  // 여기서 블로킹 → 비동기 의미 없음
```

- 의도치 않게 발생하는 경우가 많음 (비동기 코드에서 `.get()`, `.block()` 호출)

### 4. 비동기-논블로킹

요청 후 즉시 반환되고, 완료 시 시스템이 콜백/이벤트로 알려준다. 가장 효율적인 모델.

```
Thread                  Kernel
  │── async read() ──────→│
  │   (콜백 등록)          │
  │── 다른 작업 수행       │  데이터 준비 중...
  │── 다른 작업 수행       │  데이터 준비 완료
  │←── 콜백 호출 ─────────│
  │── 결과 처리            │
```

```java
// WebClient - 비동기 논블로킹
WebClient.create()
        .get()
        .uri(url)
        .retrieve()
        .bodyToMono(String.class)
        .subscribe(result -> process(result));  // 콜백으로 처리

doOtherWork();  // 즉시 다른 작업 수행
```

- Nginx, Node.js, Netty, Spring WebFlux의 기본 모델
- 적은 스레드로 대량의 동시 요청 처리 가능

## Java/Spring에서의 I/O 모델

| 모델 | Java/Spring 기술 |
|------|-----------------|
| 동기-블로킹 | Spring MVC + RestTemplate + JDBC |
| 동기-논블로킹 | `Future.isDone()` 폴링 |
| 비동기-블로킹 | `CompletableFuture.get()` (안티패턴) |
| 비동기-논블로킹 | Spring WebFlux + WebClient + R2DBC |

```
동기-블로킹 (Spring-MVC)              비동기-논블로킹 (Spring-WebFlux)
┌──────────────┐                     ┌──────────────┐
│ Thread per   │                     │ Event Loop   │
│ Request      │                     │ (소수 스레드)  │
│              │                     │              │
│ 요청1→스레드1 │                     │ 요청1─┐       │
│ 요청2→스레드2 │                     │ 요청2─┼→이벤트 │
│ 요청3→스레드3 │                     │ 요청3─┘  루프  │
│  ...         │                     │              │
│ 요청N→스레드N │                     │ 콜백으로 처리  │
└──────────────┘                     └──────────────┘
스레드 많이 필요                       스레드 적게 필요
```
