# Spring for Apache Kafka (Spring Boot 연동)

> 최종 업데이트: 2026-06-10 | Spring Boot 3.4.x, Spring for Apache Kafka 3.3.x, kafka-clients 3.8.x 기준

## 개념

**Spring for Apache Kafka(`spring-kafka`)**는 Kafka의 저수준 클라이언트(`kafka-clients`)를 Spring 스타일로 감싼 모듈이다. 직접 `KafkaProducer`/`KafkaConsumer`를 생성·관리하는 대신, `KafkaTemplate`으로 메시지를 보내고 `@KafkaListener`로 받는다. 구독·스레드 관리·오프셋 커밋·에러 핸들링을 프레임워크가 대신 처리한다.

> 비유: 저수준 `kafka-clients`가 수동변속기라면, `spring-kafka`는 자동변속기다. 클러치(poll 루프, 오프셋 커밋, 리밸런스 대응)를 직접 밟지 않아도 되고, 비즈니스 로직(어떤 메시지를 어떻게 처리할지)에만 집중한다.

핵심은 두 축이다.

| 역할 | 핵심 클래스 | 애노테이션 |
|------|-----------|-----------|
| 발행 (Producer) | `KafkaTemplate` | — |
| 구독 (Consumer) | `MessageListenerContainer` | `@KafkaListener` |

## 배경/역사

- **Spring for Apache Kafka**는 Pivotal(현 VMware Tanzu)의 Spring 팀이 2016년 1.0을 릴리스했다. Spring AMQP(RabbitMQ 연동)에서 검증된 "Template + Listener Container" 패턴을 Kafka에 그대로 이식한 것이다.
- Kafka 자체는 LinkedIn에서 개발 후 Apache 재단에 기증됐고, 창시자 Jay Kreps가 Confluent를 창업했다. ([1)-Kafka-개념.md](1\)-Kafka-개념.md) 참고)
- `spring-kafka`의 버전은 내부적으로 사용하는 `kafka-clients` 버전과 묶여 관리된다. Spring Boot의 의존성 관리(BOM)가 호환되는 조합을 자동 선택해 준다.

이 문서의 기준 환경:

| 구성 | 버전 |
|------|------|
| JDK | Temurin 21 |
| Spring Boot | 3.4.x |
| Spring for Apache Kafka | 3.3.x |
| kafka-clients (Spring 관리) | 3.8.x |
| Kafka Broker (Docker) | 4.1.x |
| Kafka Mode | KRaft (Zookeeper 없는 단일 프로세스) |

## 의존성 추가 (build.gradle)

```gradle
implementation 'org.springframework.kafka:spring-kafka'
```

- 버전을 명시하지 않으면 Spring Boot BOM이 관리하는 호환 버전이 적용된다.
- `kafka-clients` 버전을 강제로 올려야 할 경우(브로커 신버전 기능 사용 등)에만 별도 override 한다. [공식 가이드](https://docs.spring.io/spring-kafka/reference/appendix/override-boot-dependencies.html)

## 설정 (application.yml)

가장 단순한 설정은 브로커 주소 한 줄이다. Spring Boot의 auto-configuration이 나머지를 기본값으로 채운다.

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
```

실무에서 자주 쓰는 확장 설정:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all                     # 리더 + ISR 복제까지 확인 (가장 안전)
      retries: 3
    consumer:
      group-id: testgroup
      auto-offset-reset: latest     # 커밋된 오프셋 없을 때 시작 위치 (earliest/latest)
      enable-auto-commit: false     # 오프셋 커밋을 Spring이 직접 제어
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
    listener:
      ack-mode: RECORD
      concurrency: 3
      type: single
      poll-timeout: 1500
```

- `acks` — 발행 시 브로커 확인 수준. `0`(확인 안 함) / `1`(리더만) / `all`(ISR 복제까지). 데이터 유실 방지가 중요하면 `all`.
- `auto-offset-reset` — 컨슈머 그룹의 커밋된 오프셋이 없을 때 어디서부터 읽을지. `earliest`(처음부터) / `latest`(새 메시지부터).
- `enable-auto-commit: false` — ack-mode로 커밋 시점을 직접 제어하려면 반드시 꺼야 한다.

설정을 yaml로 두면 아래 `@Bean` 방식보다 간결하지만, 직렬화 커스터마이징이 복잡하면 Config 클래스가 더 유연하다. 둘 중 하나만 쓰면 된다.

## Producer — 메시지 발행

### Config로 직접 구성

```java
@EnableKafka
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String servers;

    @Bean
    public ProducerFactory<String, Chatmessage> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Chatmessage> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

- `ProducerFactory` — Producer 인스턴스를 생성하는 팩토리. 직렬화 방식·브로커 주소 등을 담는다.
- `KafkaTemplate` — 실제 발행에 쓰는 헬퍼. 스레드 세이프하므로 싱글톤 빈으로 공유한다.
- 키는 `String`, 값은 `Chatmessage` 객체를 JSON으로 직렬화한다.

### 발행 코드

```java
@Service
@RequiredArgsConstructor
public class KafkaProducerService {
    private static final String TOPIC = "testTopic";
    private final KafkaTemplate<String, Chatmessage> kafkaTemplate;

    public void sendMessage(Chatmessage chatmessage) {
        kafkaTemplate.send(TOPIC, chatmessage);
    }
}
```

`send()`는 비동기다. 즉시 `CompletableFuture`를 반환하고, 실제 전송은 백그라운드에서 일어난다. 전송 성공/실패를 확인하려면 콜백을 단다.

```java
kafkaTemplate.send(TOPIC, chatmessage)
    .whenComplete((result, ex) -> {
        if (ex == null) {
            var meta = result.getRecordMetadata();
            System.out.printf("발행 성공: partition=%d offset=%d%n",
                meta.partition(), meta.offset());
        } else {
            System.err.println("발행 실패: " + ex.getMessage());
        }
    });
```

**메시지 키와 파티셔닝**: `send(topic, key, value)`로 키를 지정하면, 같은 키는 항상 같은 파티션으로 간다(순서 보장). 키를 생략하면 라운드로빈/스티키 방식으로 분산된다.

```java
// 같은 sender의 메시지는 같은 파티션 → 순서 보장
kafkaTemplate.send(TOPIC, chatmessage.getSender(), chatmessage);
```

### Controller에서 호출

```java
@RestController
@RequiredArgsConstructor
public class KafkaController {
    private final KafkaProducerService producerService;

    @PostMapping("/kafka")
    public String sendMessage(@RequestBody Chatmessage chatmessage) {
        producerService.sendMessage(chatmessage);
        return "success";
    }
}
```

## Consumer — 개요

컨슈머는 `@KafkaListener` 메서드로 메시지를 받는다. 다만 실제로는 세 층이 협력한다.

| 계층 | 정체 | 하는 일 |
|------|------|--------|
| `KafkaConsumer` | 진짜 컨슈머 | 브로커 접속, poll/commit |
| `MessageListenerContainer` | Spring 컨테이너 | poll 루프·스레드·커밋 관리 |
| `@KafkaListener` 메서드 | 핸들러(콜백) | 받은 메시지 처리 |

```java
@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "testTopic", groupId = "testgroup",
                   containerFactory = "kafkaListener")
    public void consume(Chatmessage message) {
        System.out.println("sender = " + message.getSender());
    }
}
```

`@KafkaListener`는 컨슈머가 아니라 컨슈머가 부르는 콜백이다. 진짜 컨슈머(`KafkaConsumer`)는 직접 `new` 하지 않아도 Spring이 `ConsumerFactory`로 만들어 컨테이너 안에서 돌린다.

Consumer Config, 주요 설정 프로퍼티, 리스너 컨테이너 옵션(concurrency·ack-mode·type·poll-timeout), 리밸런싱, 역직렬화(두 방식·타입 헤더), 에러 처리(poison pill·DLT)는 분리된 심화 문서에서 다룬다.

> **▶ [Spring-Kafka-Consumer.md](Spring-Kafka-Consumer.md) — 컨슈머 심화 문서**

## 트랜잭션 (선택)

DB 작업과 Kafka 발행을 하나의 단위로 묶어야 할 때 Kafka 트랜잭션을 쓴다. `transaction-id-prefix`를 설정하면 `KafkaTemplate`이 트랜잭션 모드로 동작한다.

```yaml
spring:
  kafka:
    producer:
      transaction-id-prefix: tx-
```

```java
@Transactional
public void process(Chatmessage msg) {
    repository.save(toEntity(msg));        // DB
    kafkaTemplate.send("testTopic", msg);  // Kafka — 같은 트랜잭션
}
```

단, DB와 Kafka는 서로 다른 시스템이라 완벽한 원자성은 보장되지 않는다(2PC 아님). 정확히 한 번 처리가 필요하면 **Transactional Outbox 패턴**을 검토한다.

## 관련 문서

- [Spring-Kafka-Consumer.md](Spring-Kafka-Consumer.md) — 컨슈머 심화 (설정·리스너 컨테이너·리밸런싱·역직렬화·에러 처리)
- [Kafka-Consumer.md](Kafka-Consumer.md) — 프레임워크 무관 컨슈머 원리 (Pull 모델·Long Polling·전달 의미론)
- [1)-Kafka-개념.md](1\)-Kafka-개념.md) — Kafka 아키텍처, 토픽/파티션/컨슈머 그룹 개념
- [5)-Kafka-명령어.md](5\)-Kafka-명령어.md) — 토픽 생성·조회 CLI
- [3)-Kafka-도커-설치.md](3\)-Kafka-도커-설치.md) — KRaft 모드 브로커 구성
- `Kafka-pub-sub-예제/` — 이 문서의 코드가 담긴 동작 예제 프로젝트

## 출처

- [Spring for Apache Kafka Reference](https://docs.spring.io/spring-kafka/reference/index.html)
- [Spring Boot Kafka Messaging](https://docs.spring.io/spring-boot/reference/messaging/kafka.html)
- [spring.io/projects/spring-kafka](https://spring.io/projects/spring-kafka#overview)
