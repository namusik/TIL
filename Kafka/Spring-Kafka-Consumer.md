# Spring Kafka — Consumer (컨슈머)

> 최종 업데이트: 2026-06-10 | Spring Boot 3.4.x, Spring for Apache Kafka 3.3.x, kafka-clients 3.8.x 기준

상위 문서 [Spring-Kafka.md](Spring-Kafka.md)에서 컨슈머 부분을 분리한 심화 문서다. Producer·기본 설정·트랜잭션은 상위 문서를 참고한다.

## 개념 — 컨슈머는 3개 층이다

`@KafkaListener` 하나만 쓰지만, 실제로는 세 층이 협력한다. 이걸 구분 못 하면 설정이 어디에 걸리는지 헷갈린다.

| 계층 | 정체 | 하는 일 | 누가 만드나 |
|------|------|--------|-----------|
| `KafkaConsumer` | 진짜 컨슈머 (저수준 클라이언트) | 브로커 접속, `poll()`로 fetch, 오프셋 commit | Spring이 `ConsumerFactory`로 생성 |
| `MessageListenerContainer` | Spring 컨테이너 | poll 루프 실행, 스레드 관리, 커밋 시점 제어 | Spring이 `ContainerFactory`로 생성 |
| `@KafkaListener` 메서드 | 핸들러(콜백) | 받은 메시지 비즈니스 처리만 | 개발자가 코드로 작성 |

> 비유: `KafkaConsumer`는 **배달원**(가게=브로커 가서 재료=메시지 받아옴), `MessageListenerContainer`는 **배달 매니저**(배달원 몇 명 둘지·언제 영수증 처리할지 관리), `@KafkaListener`는 **요리사**(배달원이 가져온 재료로 요리만 함). 개발자는 요리사 코드만 쓰고, 배달원은 매니저가 알아서 고용한다.

핵심: **`@KafkaListener`는 컨슈머가 아니다.** 컨슈머가 가져온 메시지를 처리하는 콜백일 뿐이다. 진짜 컨슈머(`KafkaConsumer`)는 직접 `new` 하지 않아도 Spring이 `ConsumerFactory` 설정으로 뒤에서 만들어 컨테이너 안에서 돌린다.

`concurrency`로 보면 둘이 다른 게 분명해진다.

```
@KafkaListener 메서드 = 1개 (코드 한 벌)
        ↓ 그런데 concurrency: 3 이면
KafkaConsumer = 3개 생성 (스레드 3개)
        ↓ 각 컨슈머가 가져온 메시지를
같은 @KafkaListener 메서드를 각자 호출
```

컨슈머(배달원) 3개가 리스너 메서드(요리법) 1개를 공유한다. `@KafkaListener`가 곧 컨슈머라면 이 그림이 성립하지 않는다.

## 컨슈머 동작 흐름 (poll 루프)

개념의 세 층이 런타임에 어떻게 맞물리는지가 **poll 루프**다. 컨테이너가 품은 컨슈머로 아래 루프를 무한 반복한다. 각 설정이 이 루프의 어느 지점에 걸리는지 보면 컨슈머 전체가 한눈에 들어온다.

```java
while (running) {                              // 컨테이너가 도는 무한 루프
    var records = consumer.poll(timeout);      // ① 브로커에서 가져오기
    for (var r : records) {                    // ② 가져온 묶음을
        listener.consume(r);                   //    리스너에 넘겨 처리
    }
    commitOffset();                            // ③ 처리한 만큼 오프셋 커밋
}
```

| 단계 | 동작 | 방향 | 관련 설정 |
|------|------|------|----------|
| ① poll | 브로커에서 레코드 가져옴 | 컨슈머 ← 브로커 | `poll-timeout`, `MAX_POLL_RECORDS`, `FETCH_MAX_WAIT_MS` |
| ② dispatch | 가져온 레코드를 리스너에 전달 | 컨테이너 → 리스너 | `type` (single/batch) |
| ③ commit | "여기까지 처리함" 오프셋 기록 | 컨슈머 → 브로커 | `ack-mode`, `enable-auto-commit` |

- **① poll**: `consumer.poll()`은 컨슈머가 브로커에서 메시지를 가져오는 함수다. 리스너에 주는 함수가 아니다. 한 번에 최대 `MAX_POLL_RECORDS`건을 반환하고, 줄 데이터가 없으면 `poll-timeout`/`FETCH_MAX_WAIT_MS`만큼 기다린다(빈손 반복 방지).
- **② dispatch**: 가져온 묶음을 컨테이너가 루프 돌며 리스너에 넘긴다. `type: single`이면 1건씩, `batch`면 통째로.
- **③ commit**: 처리가 끝나면 "여기까지 읽었다"는 오프셋을 기록한다. 언제 커밋할지는 `ack-mode`가 정한다.
- `concurrency: N`이면 이 루프가 **스레드 N개에서 동시에** 돈다(컨슈머 N개).

개발자는 ②의 `listener.consume`(= `@KafkaListener` 메서드)만 작성하고, ①·③·루프·스레드는 컨테이너가 대신 돌린다.

## Consumer Config

```java
@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String servers;

    @Bean
    public ConsumerFactory<String, Chatmessage> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "testgroup");
        // 역직렬화기를 ErrorHandlingDeserializer로 감싼다 (poison pill 방어 — '에러 처리' 참고)
        return new DefaultKafkaConsumerFactory<>(
            config,
            new ErrorHandlingDeserializer<>(new StringDeserializer()),
            new ErrorHandlingDeserializer<>(new JsonDeserializer<>(Chatmessage.class)));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Chatmessage> kafkaListener(
            DefaultErrorHandler errorHandler) {
        ConcurrentKafkaListenerContainerFactory<String, Chatmessage> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setCommonErrorHandler(errorHandler);  // 리스너단 에러 핸들러 연결
        return factory;
    }
}
```

- `ConsumerFactory` — `KafkaConsumer`를 생성하는 팩토리. 역직렬화 방식·그룹 ID·브로커 주소를 담는다. 역직렬화기를 `ErrorHandlingDeserializer`로 감싸 깨진 메시지가 파티션을 막지 않게 한다.
- `ConcurrentKafkaListenerContainerFactory` — `@KafkaListener`가 사용할 컨테이너를 만드는 팩토리. `concurrency`만큼 컨슈머 스레드를 병렬로 띄우고, `setCommonErrorHandler`로 리스너단 에러 핸들러를 연결한다.

### 팩토리와 컨테이너 계층

"팩토리(컨테이너를 찍어내는 공장)"와 "컨테이너(실제 poll 루프를 도는 일꾼)"를 구분해야 한다.

```
KafkaListenerContainerFactory (팩토리 인터페이스)
        └─ ConcurrentKafkaListenerContainerFactory  ← 사실상 유일한 표준 구현체
                  │ 이게 찍어내는 결과물 ↓
MessageListenerContainer (컨테이너 인터페이스)
        ├─ KafkaMessageListenerContainer        (싱글 스레드, 컨슈머 1개)
        └─ ConcurrentMessageListenerContainer   (위 싱글 컨테이너를 N개 묶음)
```

| 컨테이너 | 스레드 | 정체 |
|----------|--------|------|
| `KafkaMessageListenerContainer` | 1개 | 단일 컨슈머. 가장 기본 단위 |
| `ConcurrentMessageListenerContainer` | N개 | `KafkaMessageListenerContainer`를 `concurrency` 수만큼 묶은 래퍼 |

`Concurrent`는 별개 물건이 아니라 **단일 컨테이너를 1~N개 감싼 래퍼**다. `concurrency=1`이면 단일 컨테이너와 사실상 같고, 값을 올리면 그만큼 늘어난다. 그래서 1개도 N개도 커버하는 상위호환이라 표준으로 쓰인다.

- **팩토리는 이거 하나가 표준**이다. `KafkaListenerContainerFactory`는 인터페이스고, `@KafkaListener`용 기본 구현체는 `ConcurrentKafkaListenerContainerFactory`뿐이다.
- **Spring Boot가 `kafkaListenerContainerFactory`라는 이름으로 자동 생성**해 준다. 위처럼 직접 빈을 정의하는 건 역직렬화 래핑·에러 핸들러 같은 커스텀이 필요할 때뿐이고, 안 만들면 Boot 기본 팩토리가 적용된다.
- `@KafkaListener` 없이 프로그래밍 방식으로 리스너를 동적 등록할 때는 `KafkaMessageListenerContainer`를 직접 생성하기도 하지만, 일반적인 애노테이션 방식에선 쓰지 않는다.

## 주요 컨슈머 설정 프로퍼티

`ConsumerFactory`의 config map에 넣는 핵심 프로퍼티들이다. 식당 운영에 빗대면 직관적이다.

| 프로퍼티 | 식당 비유 | 의미 |
|----------|----------|------|
| `BOOTSTRAP_SERVERS_CONFIG` | 대표 전화번호 | 브로커 최초 접속 진입점 |
| `AUTO_OFFSET_RESET_CONFIG` | 첫 방문 시 어디부터 | 커밋된 오프셋이 없을 때 시작 위치 |
| `ENABLE_AUTO_COMMIT_CONFIG` | 영수증 자동/수동 | 오프셋 자동 커밋 여부 |
| `MAX_POLL_RECORDS_CONFIG` | 한 번에 받는 주문 수 | poll() 한 번이 반환할 최대 레코드 수 |
| `FETCH_MAX_WAIT_MS_CONFIG` | 양 적을 때 대기 시간 | 데이터가 적을 때 브로커가 모아서 줄 최대 대기 |
| `METADATA_MAX_AGE_CONFIG` | 메뉴판 재확인 주기 | 토픽/파티션 메타데이터 갱신 주기 |

### BOOTSTRAP_SERVERS_CONFIG

브로커의 대표 주소. 여기로 처음 접속하면 Kafka가 "실제 파티션은 어느 브로커에 있다"는 전체 메타데이터를 알려준다. 그래서 모든 브로커를 적을 필요 없이 1~2개만 진입점으로 적어도 된다.

### AUTO_OFFSET_RESET_CONFIG

이 컨슈머 그룹이 **읽은 기록(오프셋)이 하나도 없을 때** 어디서부터 시작할지.

- `earliest` → 토픽 맨 처음부터 전부 읽음 (밀린 메시지 정주행)
- `latest` → 지금 이후 새 메시지만 읽음 (과거 무시)

이미 읽은 기록이 있으면 이 설정은 무시되고 마지막 지점부터 이어 읽는다. "기록이 아예 없을 때"만 적용된다.

### ENABLE_AUTO_COMMIT_CONFIG

"여기까지 읽었다"는 오프셋 커밋을 자동으로 할지.

- `true` → Kafka가 일정 시간마다 알아서 커밋 → 처리 실패해도 넘어가버려 유실 위험
- `false` → 처리 성공을 확인한 뒤 직접 커밋 (수동 ack)

`false`로 둬야 [ack-mode](#ack-mode)·DLT 방어가 제대로 동작한다. 그래서 실무에선 보통 `false`.

### MAX_POLL_RECORDS_CONFIG

`poll()` 한 번이 **브로커에서 가져와 반환하는 최대 레코드 건수**(기본 500). [poll 루프](#컨슈머-동작-흐름-poll-루프)의 ① 단계에 적용된다. 가져온 묶음을 리스너에 어떻게 넘길지(1건씩 vs 통째로)는 [type 설정](#type)이 정한다.

- 크게 → 한 번에 많이 처리(처리량↑), 대신 한 묶음이 오래 걸리면 다음 poll이 늦어짐
- 작게 → 자주 조금씩(지연↓), 대신 poll 횟수 증가

주의: 이건 **poll이 반환하는 건수**이지 네트워크로 끌어오는 데이터 크기가 아니다. 크기는 `FETCH_MAX_BYTES`/`MAX_PARTITION_FETCH_BYTES`가 따로 정한다. 컨슈머는 네트워크로 큰 덩어리를 받아 내부 버퍼에 쌓고, poll()은 거기서 `MAX_POLL_RECORDS`만큼만 꺼내 준다.

### FETCH_MAX_WAIT_MS_CONFIG

브로커에 데이터가 조금밖에 없을 때, 바로 줄지 / 좀 더 모아서 줄지 기다리는 최대 시간. 조금씩 자주 가져오면 네트워크 왕복이 잦아 비효율적이라, "조금 기다렸다 모아서" 주는 효율 장치다. 지연 vs 효율 트레이드오프.

### METADATA_MAX_AGE_CONFIG

토픽·파티션 구성 정보(메타데이터)를 몇 ms마다 새로 받아올지(기본 5분). 운영 중 파티션을 늘리거나 브로커가 교체되면 이 주기마다 변화를 감지한다. 짧게 → 변화 빨리 반영(요청 잦음), 길게 → 요청 적음(반영 늦음).

## @KafkaListener 사용

```java
@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "testTopic", groupId = "testgroup",
                   containerFactory = "kafkaListener")
    public void consume(Chatmessage message) {
        System.out.println("sender = " + message.getSender());
        System.out.println("context = " + message.getContext());
    }
}
```

- `topics` — 구독할 토픽
- `groupId` — 컨슈머 그룹. 같은 그룹 내에서는 파티션이 분배되고, 다른 그룹끼리는 같은 메시지를 각자 받는다.
- `containerFactory` — 위에서 정의한 컨테이너 팩토리 빈 이름

## Listener 컨테이너 상세 설정

```yaml
spring:
  kafka:
    listener:
      concurrency: 3
      ack-mode: RECORD
      type: single
      poll-timeout: 1500
```

### concurrency

`concurrency` 값이 곧 **생성되는 컨슈머 인스턴스(= 스레드) 개수**다.

- `concurrency ≤ 파티션 수`가 효율적이다.
- Kafka는 한 파티션에 1개 컨슈머만 할당하므로, 파티션 수보다 큰 concurrency는 유휴 스레드만 늘릴 뿐 무의미하다.
- 전체 컨슈머 수 = listener 개수 × concurrency.

```
파티션 4개, concurrency 3  →  스레드 3개가 각각 1~2개 파티션 담당 (1개는 2파티션)
파티션 2개, concurrency 5  →  스레드 2개만 일하고 3개는 유휴 (낭비)
```

### ack-mode

컨슈머가 메시지를 읽은 뒤 **언제 오프셋을 커밋할지** 결정한다.

- Kafka 자체에는 ack-mode 개념이 없다. Kafka는 "컨슈머가 commit 요청을 하면 offset을 기록"할 뿐이다.
- **Listener Container가 언제** `commitSync()`/`commitAsync()`를 호출할지를 결정하는 Spring의 설정이다.
- 전제: `enable-auto-commit=false`여야 Spring이 커밋 로직을 직접 제어한다.

| ack-mode | 커밋 시점 | 적합한 상황 |
|----------|----------|-----------|
| `RECORD` | 메시지 1건 처리 후 | 재처리 범위 최소화, 정확성 우선 |
| `BATCH` | poll()로 받은 배치 전체 처리 후 | 처리량 우선, 중복 일부 허용 |
| `TIME` | 일정 시간 경과 후 | 지연보다 처리량 |
| `COUNT` | 일정 건수 처리 후 | 처리량 |
| `COUNT_TIME` | 시간 또는 건수 중 먼저 도달 | 처리량 |
| `MANUAL` | `Acknowledgment.acknowledge()` 호출 시 (배치 끝에 커밋) | 외부 트랜잭션 연계, 정밀 제어 |
| `MANUAL_IMMEDIATE` | `acknowledge()` 호출 즉시 커밋 | 정밀 제어 + 즉시 반영 |

일반적인 실시간 처리에서는 **RECORD** 또는 **BATCH**가 많이 쓰인다.

```java
// MANUAL — 처리 성공 후 직접 커밋
@KafkaListener(topics = "testTopic", containerFactory = "kafkaListener")
public void consume(Chatmessage message, Acknowledgment ack) {
    process(message);
    ack.acknowledge();
}
```

### type

리스너 컨테이너가 `@KafkaListener` 메서드에 메시지를 전달하는 방식(단건/배치)을 지정한다. `MAX_POLL_RECORDS`로 가져온 묶음을 어떻게 넘길지가 여기서 갈린다.

| type | 컨테이너 동작 | 리스너 호출 |
|------|--------------|------------|
| `single` | poll로 N건 받음 → **1건씩 꺼내서** 호출 | N번 (1건씩) |
| `batch` | poll로 N건 받음 → **통째로** 호출 | 1번 (List N건) |

```java
// type: single — MAX_POLL_RECORDS=500이어도 한 건씩 들어옴
@KafkaListener(topics = "orders")
public void listen(Chatmessage message) { ... }

// type: batch — 한 번에 List로
@KafkaListener(topics = "orders")
public void listen(List<Chatmessage> messages) {
    System.out.println("배치 수신 건수: " + messages.size());
}
```

### poll-timeout

컨테이너가 브로커에 `poll()` 호출 시 레코드가 도착할 때까지 기다리는 최대 시간(ms). 지연 vs CPU 사용률 트레이드오프를 결정한다.

- 짧으면 → 빈 손으로 자주 반복 poll ⇒ 지연↓(새 메시지 빨리 처리), CPU↑
- 길면 → 덜 자주 poll ⇒ CPU↓, 지연↑

## 리밸런싱과 파티션 할당 전략

**리밸런싱(rebalancing)**은 컨슈머 그룹에 컨슈머가 추가/제거되거나 파티션 수가 바뀔 때, 파티션을 그룹 멤버에게 다시 분배하는 과정이다. 어떤 컨슈머가 어떤 파티션을 맡을지 정하는 규칙이 **파티션 할당 전략(Partition Assignment Strategy)**이다.

```java
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG,
    CooperativeStickyAssignor.class.getName());
```

| 방식 | 대표 전략 | 리밸런싱 동작 |
|------|----------|--------------|
| **Eager** (구 기본) | `RangeAssignor`, `RoundRobinAssignor` | 모든 컨슈머가 **자기 파티션을 전부 반납**하고 멈춘 뒤 재분배 (stop-the-world) |
| **Cooperative** (권장) | `CooperativeStickyAssignor` | 옮길 파티션만 반납. **영향 없는 컨슈머는 계속 처리** |

Eager 방식은 컨슈머 한 대만 추가돼도 그룹 전체가 잠깐 멈춘다(stop-the-world). 파티션·컨슈머가 많을수록 멈춤 시간이 길어진다.

`CooperativeStickyAssignor`는 **협력적 리밸런싱**으로, 재배치가 필요한 파티션만 점진적으로 이동시킨다. 멈춤 없이 무중단에 가깝게 리밸런싱하므로 배포·오토스케일이 잦은 운영 환경에서 권장된다. "Sticky"는 기존 할당을 최대한 유지해 불필요한 파티션 이동을 줄인다는 의미다.

> 롤링 배포로 컨슈머가 순차 재시작될 때, Eager면 매번 그룹 전체가 멈췄다 깨어나며 lag이 출렁인다. Cooperative면 영향받는 파티션만 잠깐 멈추므로 처리량이 안정적이다.

## 역직렬화 (Deserializer)

컨슈머는 바이트를 객체로 역직렬화한다. 예제는 `JsonDeserializer`로 JSON → `Chatmessage` 변환을 한다.

### 설정 두 가지 방식

`DefaultKafkaConsumerFactory`는 생성자가 오버로딩돼 있어, Deserializer를 두 가지 방식으로 설정할 수 있다. 결과는 동일하다.

**방식 A — config 프로퍼티 (map에 클래스만 등록)**: Kafka가 리플렉션으로 인스턴스를 직접 생성하고, 나머지 설정을 map에서 읽어 `configure()`로 적용한다.

```java
props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.sample.kafka.model.Chatmessage");
props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
new DefaultKafkaConsumerFactory<>(props);
```

**방식 B — 인스턴스 직접 주입 (생성자 인자)**: `new`로 만든 Deserializer 객체를 생성자에 넘긴다.

```java
new DefaultKafkaConsumerFactory<>(props,
    new ErrorHandlingDeserializer<>(new StringDeserializer()),
    new ErrorHandlingDeserializer<>(new JsonDeserializer<>(Chatmessage.class)));
```

| 설정 | 방식 A (put) | 방식 B (생성자 인자) |
|------|-------------|---------------------|
| 래핑 | `VALUE_DESERIALIZER_CLASS_CONFIG = ErrorHandlingDeserializer.class` | `new ErrorHandlingDeserializer<>(...)` |
| 내부 delegate | `ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS = JsonDeserializer.class` | `new ErrorHandlingDeserializer<>(new JsonDeserializer<>(...))` |
| 대상 타입 | `JsonDeserializer.VALUE_DEFAULT_TYPE = Chatmessage.class` | `new JsonDeserializer<>(Chatmessage.class)` |
| 신뢰 패키지 | `JsonDeserializer.TRUSTED_PACKAGES = "*"` | `jsonDeser.addTrustedPackages("*")` |

**언제 무엇을**: 타입이 고정이면 방식 B가 짧고 컴파일 타임에 타입 안전하다. 반면 **여러 이벤트 타입을 제네릭 메서드로 찍어낼 때**는 방식 A가 정석이다. `VALUE_DEFAULT_TYPE`에 타입을 런타임 문자열로 꽂을 수 있기 때문이다.

```java
// 타입을 런타임에 받아 팩토리를 찍어내는 제네릭 패턴 — 방식 A라야 가능
private <T> ConsumerFactory<String, T> createConsumerFactory(Class<T> targetType) {
    Map<String, Object> props = commonConsumerProps();
    props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, targetType.getName());
    props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
    return new DefaultKafkaConsumerFactory<>(props);
}
```

### 타입 정보 헤더 (USE_TYPE_INFO_HEADERS)

`JsonSerializer`는 기본적으로 메시지를 보낼 때 **자바 타입 정보를 레코드 헤더에 실어 보낸다**(`__TypeId__` 헤더). 컨슈머의 `JsonDeserializer`는 이 헤더를 보고 어떤 클래스로 역직렬화할지 결정한다.

| 설정 | 동작 |
|------|------|
| `USE_TYPE_INFO_HEADERS = true` (기본) | 헤더의 타입 정보로 역직렬화. **프로듀서·컨슈머가 같은 클래스 패키지 경로**를 공유해야 함 |
| `USE_TYPE_INFO_HEADERS = false` | 헤더 무시, `VALUE_DEFAULT_TYPE`로 지정한 타입으로 강제 역직렬화 |

`false`로 두고 `VALUE_DEFAULT_TYPE`을 명시하는 패턴이 안전하다. 프로듀서가 다른 서비스(다른 패키지 구조)여도 컨슈머가 자기 클래스로 매핑하므로 패키지 경로 의존이 사라진다. MSA처럼 프로듀서·컨슈머가 분리된 환경에서 특히 중요하다.

**trusted packages**: `JsonDeserializer`는 보안상 신뢰된 패키지의 클래스만 역직렬화한다. 헤더 타입 정보를 쓸 때 악의적 타입 주입을 막기 위함이다.

```yaml
spring:
  kafka:
    consumer:
      properties:
        spring.json.trusted.packages: "com.sample.kafka.model"
        # 모두 허용하려면 "*" (운영에선 신뢰 경계가 사라져 비권장)
```

`USE_TYPE_INFO_HEADERS=false` + `VALUE_DEFAULT_TYPE` 조합을 쓰면 헤더 기반 타입 해석을 하지 않으므로 trusted packages 위험에서도 자유롭다.

## 에러 처리와 재시도

에러는 **두 단계**에서 발생할 수 있고, 각각 방어 지점이 다르다. 메시지 처리 순서를 보면 명확하다.

| 순서 | 단계 | 담당 | 여기서 터지는 에러 |
|------|------|------|------------------|
| 1 | `poll()`로 레코드 가져옴 | 컨테이너 | — |
| 2 | **역직렬화 (바이트 → 객체)** | Deserializer | 깨진 JSON 등 |
| 3 | `@KafkaListener` 메서드 실행 | 리스너 | 비즈니스 예외 |
| 4 | 예외 처리 | ErrorHandler | — |

리스너단 `DefaultErrorHandler`는 3번 단계 방어다. 그런데 깨진 JSON은 2번(역직렬화)에서 터지므로, 리스너에 도달하기 전이라 리스너단 핸들러가 잡을 기회조차 없다. 그래서 두 단계를 각각 막아야 한다.

### 1단계 방어 — 역직렬화 (ErrorHandlingDeserializer)

역직렬화 단계에서 예외가 나면 컨테이너가 오프셋을 못 넘기고 같은 메시지를 무한 재시도한다. 깨진 메시지 한 건이 파티션 전체를 영구 정지시키는 이 현상을 **poison pill(독이 든 알약)** 이라 한다.

```
깨진 JSON (오프셋 5) 도착
   ↓
역직렬화 실패 → 오프셋 5 커밋 못 함
   ↓
재시도 → 또 오프셋 5 → 또 실패 → 무한 반복
   ↓
오프셋 6, 7, 8... 영원히 도달 못 함 (파티션 정지)
```

`ErrorHandlingDeserializer`로 실제 역직렬화기를 **감싸면**, 역직렬화 예외를 삼키고 실패 정보를 레코드 헤더에 담아 통과시킨다. 그러면 리스너단 ErrorHandler가 헤더를 보고 DLT로 보낸다. 위 [Consumer Config](#consumer-config)의 `consumerFactory()`가 바로 이 래핑을 적용한 형태다.

Spring Kafka 공식 문서가 이 패턴을 권장한다. 특히 `JsonDeserializer`처럼 역직렬화 중 예외가 날 수 있는 Deserializer를 쓸 때는 사실상 표준이다. `StringDeserializer`만 쓰면 깨질 일이 거의 없어 생략해도 되지만, key/value를 일괄로 감싸면 일관성 + key 깨짐 방어까지 된다.

> 안 감싸면: 깨진 메시지 1건이 파티션 하나를 영구 정지시킨다. 운영에서 "특정 파티션만 lag이 계속 오르고 같은 예외 로그가 무한 반복"되면 십중팔구 이 poison pill이다.

### 2단계 방어 — 리스너 (DefaultErrorHandler + DLT)

리스너 메서드에서 비즈니스 예외가 발생하면 `DefaultErrorHandler`가 재시도 후, 최종 실패 시 **Dead Letter Topic(DLT)** 으로 보낸다.

```java
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> template) {
    // 실패한 메시지를 "<원본토픽>.DLT" 토픽으로 전송
    var recoverer = new DeadLetterPublishingRecoverer(template);
    // 1초 간격으로 최대 3회 재시도 후 DLT로
    return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3));
}
```

- **재시도**: 일시적 장애(네트워크 순단, 일시적 DB 락)는 재시도로 회복 가능
- **DLT**: 재시도로도 안 되는 메시지(잘못된 포맷, 1단계에서 헤더로 넘어온 역직렬화 실패 등)를 별도 토픽에 격리해, 메인 컨슈머가 막히지 않게 한다

### 두 방어막의 역할 정리

| 구성 | 위치 | 막는 것 |
|------|------|--------|
| `ErrorHandlingDeserializer` (바깥) | Consumer Config | 역직렬화 예외 (poison pill) |
| `JsonDeserializer` (안쪽) | Consumer Config | 실제 JSON → 객체 변환 |
| `DefaultErrorHandler` + DLT | 컨테이너 (리스너단) | 리스너 예외, 헤더의 실패 정보 받아 DLT 발행 |

세 개가 한 세트로 **"메시지 한 건 깨져도 전체는 안 멈춘다"** 를 구현한다.

ack-mode가 RECORD일 때 처리 중 예외가 나면 오프셋이 커밋되지 않아 재시도/리밸런스 시 같은 메시지를 다시 받는다(at-least-once). 따라서 컨슈머 로직은 **멱등(idempotent)** 하게 작성하는 것이 안전하다.

## 관련 문서

- [Spring-Kafka.md](Spring-Kafka.md) — 상위 문서 (개념·Producer·기본 설정·트랜잭션)
- [Kafka-Consumer.md](Kafka-Consumer.md) — 프레임워크 무관 컨슈머 원리 (Pull 모델·Long Polling·리밸런싱·전달 의미론)
- [1)-Kafka-개념.md](1\)-Kafka-개념.md) — 토픽/파티션/컨슈머 그룹 개념
- [5)-Kafka-명령어.md](5\)-Kafka-명령어.md) — 토픽·컨슈머 그룹 CLI
- `Kafka-pub-sub-예제/` — 동작 예제 프로젝트

## 출처

- [Spring for Apache Kafka Reference](https://docs.spring.io/spring-kafka/reference/index.html)
- [Kafka Consumer Configs](https://kafka.apache.org/documentation/#consumerconfigs)
