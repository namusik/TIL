# BlockingQueue

> 2026-04 기준 / Java 21 기준 정리

## 개괄

`BlockingQueue`는 `java.util.concurrent` 패키지의 **스레드 안전한 큐** 인터페이스다.

> 식당의 주문 창구와 같다. 주문(데이터)이 없으면 주방(소비자)은 주문이 들어올 때까지 대기하고, 주문이 가득 차면 손님(생산자)은 빈자리가 날 때까지 기다린다. 이 대기 동작이 자동으로 일어나는 것이 핵심이다.

```
생산자 Thread ──put()──→ [ BlockingQueue ] ──take()──→ 소비자 Thread
                          (큐가 가득 차면        (큐가 비어있으면
                           생산자 블로킹)          소비자 블로킹)
```

---

## 인터페이스 계층 구조

```
Iterable
 └── Collection
      └── Queue
           ├── BlockingQueue          ← 블로킹 큐
           │    ├── TransferQueue     ← 소비자에게 직접 전달
           │    └── BlockingDeque     ← 양방향 블로킹 큐
           └── Deque
```

> `Queue`에 "스레드 안전 + 블로킹" 기능을 얹은 것이 `BlockingQueue`다. 일반 `Queue`의 `add/poll/peek`에 더해, 대기가 가능한 `put/take`가 추가된다.

---

## 핵심 특징

- **큐가 비어있으면** → `take()` 호출 시 데이터가 들어올 때까지 스레드가 **블로킹(대기)**
- **큐가 가득 차면** → `put()` 호출 시 공간이 생길 때까지 스레드가 **블로킹(대기)**
- 별도의 `synchronized`나 `wait/notify` 없이도 **생산자-소비자(Producer-Consumer) 패턴**을 안전하게 구현 가능
- 내부적으로 `ReentrantLock`과 `Condition`을 사용하여 스레드 안전성을 보장
- `null` 요소를 허용하지 않는다 (`null`은 `poll()`의 실패 반환값으로 사용되기 때문)

---

## Bounded vs Unbounded

> 택배 보관함에 칸 수 제한이 있느냐 없느냐의 차이. 제한이 없으면 편하지만 보관함이 무한히 커져서 창고(메모리)가 터질 수 있다.

| 구분 | 설명 | 예시 |
|------|------|------|
| **Bounded** | 용량 제한 있음. 가득 차면 `put()`이 블로킹 | `ArrayBlockingQueue(100)` |
| **Unbounded** | 용량 제한 없음 (또는 `Integer.MAX_VALUE`). `put()`이 블로킹되지 않음 | `LinkedBlockingQueue()`, `PriorityBlockingQueue` |

### Unbounded 큐의 OOM 위험

```java
// 위험: 생산 속도 > 소비 속도이면 큐가 무한히 커져서 OutOfMemoryError
BlockingQueue<Task> queue = new LinkedBlockingQueue<>();  // 기본 용량: Integer.MAX_VALUE
```

- Unbounded 큐를 사용하면 **생산자가 절대 블로킹되지 않으므로** 소비자가 처리하지 못하는 데이터가 계속 쌓인다
- 실무에서는 반드시 **용량을 지정**하거나, 모니터링으로 큐 크기를 관찰해야 한다

```java
// 권장: 용량을 명시적으로 지정
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(10_000);
```

---

## 주요 메서드

4가지 동작 방식을 제공한다. 상황에 따라 적절한 것을 선택하면 된다.

> 편의점 택배 보관함에 비유하면: 칸이 꽉 찼을 때 "에러를 낼지", "실패를 알려줄지", "빈 칸이 날 때까지 기다릴지", "일정 시간만 기다릴지"를 고르는 것

| 동작 | 예외 발생 | 특수 값 반환 | 블로킹 | 타임아웃 |
|------|----------|-------------|--------|---------|
| **삽입** | `add(e)` → `IllegalStateException` | `offer(e)` → `false` | `put(e)` | `offer(e, time, unit)` |
| **제거** | `remove()` → `NoSuchElementException` | `poll()` → `null` | `take()` | `poll(time, unit)` |
| **조회** | `element()` → `NoSuchElementException` | `peek()` → `null` | - | - |

- **실무에서 가장 많이 쓰는 조합**: `put()` / `take()` (블로킹) 또는 `offer(timeout)` / `poll(timeout)` (타임아웃)

### drainTo - 배치 꺼내기

> 큐에서 여러 개를 한 번에 꺼내는 것. 하나씩 `take()` 하는 것보다 훨씬 효율적

```java
List<Task> batch = new ArrayList<>();
queue.drainTo(batch, 100);  // 최대 100개를 한 번에 꺼내서 batch에 담음

// 모아서 한 번에 DB insert
batchInsert(batch);
```

- 락을 한 번만 잡고 여러 요소를 꺼내므로 성능이 좋다
- 로그 배치 처리, DB 벌크 인서트 등에 활용

---

## 주요 구현체

| 구현체 | 내부 구조 | 용량 | 락 구조 | 특징 |
|--------|----------|------|---------|------|
| `ArrayBlockingQueue` | 고정 배열 | Bounded (필수 지정) | 단일 락 | 가장 일반적. 공정성 옵션 지원 |
| `LinkedBlockingQueue` | 연결 리스트 | 지정 가능 (기본 무제한) | 삽입/제거 락 분리 | 처리량이 높음 |
| `PriorityBlockingQueue` | 힙(Heap) | Unbounded | 단일 락 | 우선순위 정렬 |
| `SynchronousQueue` | 없음 | 0 (버퍼 없음) | - | 직접 핸드오프 |
| `DelayQueue` | 힙(Heap) | Unbounded | 단일 락 | 지연 시간 후 꺼냄 |
| `LinkedTransferQueue` | 연결 리스트 | Unbounded | 락 프리 (CAS) | `transfer()`로 직접 전달 |
| `LinkedBlockingDeque` | 연결 리스트 | 지정 가능 | 단일 락 | 양방향(Deque) 블로킹 |

### ArrayBlockingQueue vs LinkedBlockingQueue

> 가장 많이 비교되는 두 구현체. 핵심 차이는 **락 구조**다.

```
ArrayBlockingQueue:
  [put] ──→ [ 단일 Lock ] ←── [take]
            (삽입/제거가 같은 락을 공유 → 동시 불가)

LinkedBlockingQueue:
  [put] ──→ [ putLock ]   [ takeLock ] ←── [take]
            (삽입과 제거가 각자의 락 → 동시 가능)
```

| 항목 | `ArrayBlockingQueue` | `LinkedBlockingQueue` |
|------|---------------------|----------------------|
| 락 | 단일 `ReentrantLock` | put/take 별도 `ReentrantLock` |
| 동시성 | 삽입/제거 동시 불가 | 삽입/제거 동시 가능 |
| 메모리 | 배열 미리 할당 (예측 가능) | 노드 동적 생성 (GC 부담) |
| 처리량 | 보통 | 높음 (락이 분리되므로) |
| 용량 | 반드시 지정 | 생략 시 `Integer.MAX_VALUE` (주의) |

### 공정성 (Fairness) 옵션

> 줄 서기 규칙. 공정 모드는 "먼저 기다린 스레드가 먼저 진입". 비공정 모드는 "아무나 먼저 잡는 사람이 진입"

```java
// 공정 모드: FIFO 순서 보장. 처리량은 다소 떨어짐
new ArrayBlockingQueue<>(100, true);

// 비공정 모드 (기본값): 처리량 우선
new ArrayBlockingQueue<>(100, false);
```

- 공정 모드는 기아(starvation) 방지에 유리하지만, 오버헤드로 처리량이 감소
- 대부분의 경우 **기본값(비공정)**으로 충분

### SynchronousQueue 상세

> 내부 버퍼가 전혀 없는 특수한 큐. 생산자가 `put()`하면 소비자가 `take()`할 때까지 블로킹되고, 그 순간 직접 핸드오프된다. 우체통 없이 직접 손에서 손으로 전달하는 것과 같다.

```java
BlockingQueue<Task> queue = new SynchronousQueue<>();

// put()은 누군가 take()할 때까지 블로킹
queue.put(task);  // 소비자가 take()하는 순간 바로 전달
```

- `size()`는 항상 0, `peek()`은 항상 `null`
- `Executors.newCachedThreadPool()`이 내부적으로 사용
- 생산자와 소비자가 항상 짝을 이루므로, 처리 속도가 매우 빠른 경우에 적합

### DelayQueue 상세

> 지정한 시간이 지나야 꺼낼 수 있는 큐. 택배 보관함에 "3시 이후에 찾아가세요"라고 써붙인 것과 같다.

```java
public class DelayedTask implements Delayed {
    private final String name;
    private final long executeTime;

    public DelayedTask(String name, long delayMs) {
        this.name = name;
        this.executeTime = System.currentTimeMillis() + delayMs;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        long diff = executeTime - System.currentTimeMillis();
        return unit.convert(diff, TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.executeTime, ((DelayedTask) o).executeTime);
    }
}

DelayQueue<DelayedTask> queue = new DelayQueue<>();
queue.put(new DelayedTask("5초 후 실행", 5000));
queue.put(new DelayedTask("1초 후 실행", 1000));

// take()는 지연 시간이 만료된 요소만 반환 (1초 후 → 5초 후 순서)
DelayedTask task = queue.take();
```

- 스케줄링, 캐시 만료, 재시도 대기 등에 활용

### 구현체 선택 가이드

```
일반적인 생산자-소비자        → ArrayBlockingQueue (용량 고정, 단순)
높은 처리량이 필요            → LinkedBlockingQueue (용량 지정 필수!)
우선순위가 필요              → PriorityBlockingQueue
버퍼 없이 직접 전달          → SynchronousQueue
일정 시간 후 처리            → DelayQueue
소비자에게 확실히 전달 확인   → LinkedTransferQueue
```

---

## 사용 예시

### 기본 생산자-소비자 패턴

```java
BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);

// 생산자 스레드
new Thread(() -> {
    try {
        queue.put("작업1");  // 큐가 가득 차면 대기
        queue.put("작업2");
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}).start();

// 소비자 스레드
new Thread(() -> {
    try {
        while (true) {
            String item = queue.take();  // 큐가 비어있으면 대기
            System.out.println("처리: " + item);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}).start();
```

### 타임아웃을 활용한 안전한 처리

```java
// 3초 동안 데이터가 안 오면 다른 작업 수행
String item = queue.poll(3, TimeUnit.SECONDS);
if (item != null) {
    process(item);
} else {
    handleTimeout();
}
```

### 종료 신호 패턴 (Poison Pill)

> 생산자가 "이제 끝"이라는 특수 메시지를 보내서 소비자를 종료시키는 패턴

```java
private static final String POISON_PILL = "DONE";

// 생산자
queue.put("작업1");
queue.put("작업2");
queue.put(POISON_PILL);  // 종료 신호

// 소비자
while (true) {
    String item = queue.take();
    if (POISON_PILL.equals(item)) break;  // 종료
    process(item);
}
```

- 소비자가 여러 개면 Poison Pill도 소비자 수만큼 넣어야 한다

### drainTo를 활용한 배치 처리

```java
BlockingQueue<LogEvent> logQueue = new LinkedBlockingQueue<>(10_000);

// 소비자: 500ms마다 또는 100개 모이면 배치 처리
new Thread(() -> {
    List<LogEvent> batch = new ArrayList<>();
    while (true) {
        try {
            // 첫 번째 요소는 블로킹으로 대기
            batch.add(logQueue.take());
            // 나머지는 있는 만큼 한 번에 꺼냄
            logQueue.drainTo(batch, 99);
            flushToDatabase(batch);
            batch.clear();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            break;
        }
    }
}).start();
```

---

## ThreadPoolExecutor와의 관계

> 스레드 풀의 핵심 구성 요소가 바로 BlockingQueue다. 어떤 큐를 넣느냐에 따라 스레드 풀의 성격이 완전히 달라진다.

```
        submit(task)
            │
            ▼
┌─ corePoolSize 미달? ──→ 새 스레드 생성하여 즉시 실행
│          │ NO
│          ▼
│  큐에 빈자리 있나? ──→ 큐에 대기
│          │ NO
│          ▼
│  maxPoolSize 미달? ──→ 새 스레드 생성하여 즉시 실행
│          │ NO
│          ▼
│  RejectedExecutionHandler 실행 (거부 정책)
```

```java
// 고정 크기 큐 → 큐가 차면 RejectedExecutionHandler 동작
new ThreadPoolExecutor(
    corePoolSize, maxPoolSize, keepAliveTime, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100)  // 최대 100개 작업 대기
);

// 무제한 큐 → maxPoolSize가 사실상 무의미 (큐가 안 차므로 스레드가 안 늘어남)
new ThreadPoolExecutor(
    corePoolSize, maxPoolSize, keepAliveTime, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>()  // 주의: 메모리 초과 가능
);

// SynchronousQueue → 대기 없이 바로 스레드에 할당
new ThreadPoolExecutor(
    0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
    new SynchronousQueue<>()
);
```

| Executors 팩토리 메서드 | 사용하는 큐 | 주의점 |
|------------------------|------------|--------|
| `newFixedThreadPool()` | `LinkedBlockingQueue` (무제한) | 큐가 무한히 쌓일 수 있음 |
| `newCachedThreadPool()` | `SynchronousQueue` | 스레드가 무한히 늘어날 수 있음 |
| `newScheduledThreadPool()` | `DelayedWorkQueue` | - |
| `newSingleThreadExecutor()` | `LinkedBlockingQueue` (무제한) | 큐가 무한히 쌓일 수 있음 |

- `Executors` 팩토리 메서드 대신 `ThreadPoolExecutor`를 직접 생성하여 큐 용량을 명시하는 것이 실무에서 권장됨

---

## 모니터링

운영 환경에서는 큐 상태를 주기적으로 모니터링해야 한다.

```java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1000);

queue.size();              // 현재 큐에 들어있는 요소 수
queue.remainingCapacity(); // 남은 용량 (Unbounded 큐는 Integer.MAX_VALUE)
queue.isEmpty();           // 비어있는지 여부
```

### 모니터링 포인트

| 지표 | 의미 | 위험 신호 |
|------|------|----------|
| `size()` 지속 증가 | 소비 속도 < 생산 속도 | OOM 위험, 소비자 증설 필요 |
| `remainingCapacity()` → 0 | 큐가 가득 참 | 생산자 블로킹 또는 거부 발생 |
| `size()` 항상 0 | 소비 속도 > 생산 속도 | 소비자 과다 (리소스 낭비) |

- Spring Boot에서는 Micrometer를 통해 큐 크기를 메트릭으로 노출하여 Grafana 등에서 모니터링

---

## BlockingQueue vs 메시지 브로커

> BlockingQueue는 **같은 JVM 프로세스 내**의 스레드 간 통신이다. 서버 간 통신이 필요하면 메시지 브로커를 사용한다.

| 항목 | `BlockingQueue` | 메시지 브로커 (Kafka, RabbitMQ) |
|------|-----------------|-------------------------------|
| 범위 | 단일 JVM 내 스레드 간 | 서버/프로세스 간 |
| 영속성 | 메모리만 (JVM 종료 시 소실) | 디스크 저장 가능 |
| 확장성 | JVM 메모리 한계 | 클러스터로 수평 확장 |
| 복잡도 | 매우 낮음 | 인프라 구성 필요 |
| 용도 | 내부 비동기 처리, 스레드 풀 | MSA 간 통신, 이벤트 드리븐 |

- 단일 서버 내 비동기 처리 → `BlockingQueue`
- 서버 간 메시지 전달, 장애 복구, 재처리 필요 → 메시지 브로커

---

## BlockingQueue vs 일반 Queue vs ConcurrentLinkedQueue

| 항목 | `Queue` | `ConcurrentLinkedQueue` | `BlockingQueue` |
|------|---------|------------------------|-----------------|
| 스레드 안전성 | 보장하지 않음 | 보장 (CAS 기반, 락 프리) | 보장 (락 기반) |
| 블로킹 | 없음 | 없음 | put/take에서 블로킹 |
| 용량 제한 | 구현체마다 다름 | 없음 | 구현체마다 다름 |
| 주 용도 | 단일 스레드 | 멀티스레드, 논블로킹 필요 시 | 멀티스레드, 생산자-소비자 |
| 대표 구현체 | `LinkedList`, `ArrayDeque` | `ConcurrentLinkedQueue` | `ArrayBlockingQueue` 등 |

- `ConcurrentLinkedQueue`는 스레드 안전하지만 블로킹이 없다. 폴링 루프를 직접 구현해야 하므로 생산자-소비자 패턴에는 `BlockingQueue`가 더 적합

---

## 실무 활용 사례

| 활용 | 설명 |
|------|------|
| **비동기 로그 처리** | 로그를 큐에 넣고, 별도 스레드가 파일/DB에 기록 |
| **이벤트 처리** | 이벤트 발행자와 처리자를 큐로 분리 (느슨한 결합) |
| **요청 버퍼링 (Back Pressure)** | 급격한 트래픽을 큐에 쌓아두고 일정 속도로 처리. 큐가 차면 자연스럽게 생산자가 느려짐 |
| **배치 수집** | `drainTo()`로 데이터를 모아두었다가 일정량이 차면 한 번에 DB insert |
| **스레드 풀 작업 대기열** | `ThreadPoolExecutor`의 핵심 구성 요소 |
| **스케줄링** | `DelayQueue`로 지연 실행, 캐시 만료 처리 |
| **요청 제한 (Rate Limiting)** | Bounded 큐로 최대 처리량을 제한 |
