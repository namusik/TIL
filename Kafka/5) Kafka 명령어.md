# Kafka 관련 명령어

## 브로커 설정 파일

```sh
25168cf6092c:/$ cd /opt/kafka/config/
25168cf6092c:/opt/kafka/config$ cat server.properties 

advertised.listeners=PLAINTEXT://localhost:9092
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
transaction.state.log.min.isr=1
controller.quorum.voters=1@kafka:9093
transaction.state.log.replication.factor=1
node.id=1
process.roles=broker,controller
inter.broker.listener.name=PLAINTEXT
controller.listener.names=CONTROLLER
offsets.topic.replication.factor=1
log.dirs=/var/lib/kafka/data  # 메시지 데이터 저장 경로
```

## kafka 생성

```sh
# 토픽/프로듀서/컨슈머 테스트
docker exec -it kafka bash
/opt/kafka/bin/kafka-topics.sh --create --topic topic-example1 --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
	•	--create: 토픽 생성 모드
	•	--topic topic-example1: 만들 토픽 이름
	•	--bootstrap-server localhost:9092: 브로커 접속 주소
	    •	Compose 예시에서 KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092이므로 컨테이너 내부에서도 localhost:9092로 접근 가능
	•	--partitions 1: 토픽을 생성할 때 파티션 개수를 지정하는 옵션. 파티션 개수(단일 노드 테스트는 1개 권장)
	•	--replication-factor 1: 각 파티션을 몇 개의 브로커에 복제(replication) 할지를 지정(단일 노드이므로 1 필수)


# 프로듀서 실행. 메시지 전송
/opt/kafka/bin/kafka-console-producer.sh --topic topic-example1 --bootstrap-server localhost:9092
# (메시지 입력)

# 새 터미널 컨슈머 실행(메시지 수신)
docker exec -it kafka bash
/opt/kafka/bin/kafka-console-consumer.sh --topic topic-example1 --group groupA --bootstrap-server localhost:9092 --from-beginning
	•	--topic test-topic: 구독할 토픽
	•	--bootstrap-server localhost:9092: 브로커 주소
	•	--from-beginning: **토픽의 처음(오프셋 0)**부터 읽기
	•	지정하지 않으면 현재 시점 이후에 도착하는 메시지만 읽음
  -- group teamA : --group을 지정하지 않으면 익명(anonymous)” 컨슈머로 간주. 오프셋을 저장하지 않는다.
```

- CLI 도구가 /opt/kafka/bin/ 디렉터리 안에만 있어서 경로를 지정해줘야 함.


## consumer group CURRENT-OFFSET 확인

```sh
/opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group team-a --describe

Consumer group 'team-a' has no active members.

GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID     HOST            CLIENT-ID
team-a          topic-example2  0          4               6               2               -               -               -

GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID     HOST            CLIENT-ID
team-a          topic-example2  0          6               6               0               -               -               -
```