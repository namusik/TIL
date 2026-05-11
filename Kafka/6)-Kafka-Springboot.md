# Springboot 에서 kafka 사용하기

## build.gradle

https://spring.io/projects/spring-kafka#overview

https://docs.spring.io/spring-kafka/reference/index.html

JDK Temurin 21
Spring Boot 3.4.10
Spring for Apache Kafka 3.3.10
kafka-clients (Spring 관리) 3.8.x
Kafka Broker (Docker 서버) 4.1.x (최신)
Kafka Mode KRaft (Zookeeper 없이 단일 프로세스)

## build.gradle
```gradle
implementation 'org.springframework.kafka:spring-kafka'
```
- https://docs.spring.io/spring-kafka/reference/appendix/override-boot-dependencies.html
- 스프링 애플리케이션에서 Apache Kafka를 보다 쉽게 사용할 수 있도록 하는 Spring for Apache Kafka 모듈을 추가


## yaml

- https://docs.spring.io/spring-boot/reference/messaging/kafka.html#messaging.kafka

## Producer


## Listener

### 정의
- @KafkaListener 애노테이션으로 선언된 “메시지 리스너(핸들러)”
- Spring에서 Consumer를 감싸는 상위 개념
- Spring이 제공하는 “자동 구독/스레드 관리/오프셋 커밋/에러 핸들링” 기능을 담당


### 구조
KafkaConsumer (저수준 클라이언트)
        │
        ▼
KafkaMessageListenerContainer (Spring 컨테이너)
        │
        ▼
@KafkaListener (비즈니스 로직)

### 설정

```yaml
spring:
  kafka:
    listener:
      concurrency: 3
      ack-mode: RECORD           
      type: single               
      poll-timeout: 1500        
```
- listener 설정: Spring이 메시지를 어떤 방식으로 처리할지 결정 (스레드, 커밋 방식 등)
- concurrency 값이 곧 **생성되는 Consumer 인스턴스(=스레드) 개수**
  - concurrency ≤ 파티션 수가 효율적
  - Kafka는 한 파티션에 1개 consumer만 할당 가능하므로 파티션 수보다 큰 concurrency는 유휴 스레드만 늘어나서 무의미
- listener 개수 × concurrency = 전체 consumer 수
- ack-mode
  - Kafka Consumer가 메시지를 읽은 뒤 “언제 오프셋(offset)을 커밋할지”를 결정하는 설정
  - Kafka 자체에는 ack-mode 개념이 없고, Kafka는 단지 “consumer가 commit 요청을 하면 offset을 기록”
  - **Listener Container가 언제** commitSync()/commitAsync()를 호출할지를 결정
  - 전제사항 **enable-auto-commit=false 상태**에서 Spring이 커밋 로직을 직접 제어
  - 일반적인 실시간 처리 시스템에서는 **RECORD** 혹은 **BATCH**가 많이 사용됩니다.
    - RECORD는 메시지 1건 처리 후 커밋. 재처리 범위를 최소화하고 정확성을 우선할 때
    - BATCH는 poll()으로 받은 전체 배치 처리 후 커밋. 처리량이 더 중요하고 어느 정도 중복을 허용할 수 있을 때
  - 외부 시스템과의 트랜잭션 연계가 있고 정밀 제어가 필요할 경우 MANUAL 또는 MANUAL_IMMEDIATE 선택
  - 지연보다는 처리량 최적화가 우선이라면 TIME, COUNT, COUNT_TIME 고려
- type
  - Kafka 리스너 컨테이너가 @KafkaListener 메서드에 메시지를 전달하는 방식(단건 or 배치) 을 지정하는 설정
    - single : 한 건씩 전달. 실시간 처리 중요할 때.
    - batch : 여러 건씩 한 번에 전달. 대용량 로그처리 할 때.
- poll-timeout
  - 컨테이너가 브로커에 poll() 호출 시 레코드가 도착할 때까지 기다리는 최대 시간
  - 지연 vs CPU 사용률 트레이드오프를 결정:
    - 짧으면 → 빠르게 빈 손으로 반복 poll ⇒ 지연↓(새 메시지 빨리 처리)지만 CPU↑
    - 길면 → 덜 자주 poll ⇒ CPU↓지만 지연↑

### 코드

```java
# type: single 일때
@KafkaListener(topics = "orders")
public void listen(String message) {
    System.out.println("받은 메시지: " + message);
}

# type: batch 일때
@KafkaListener(topics = "orders")
public void listen(List<String> messages) {
    System.out.println("총 수신 메시지 수: " + messages.size());
}
```
