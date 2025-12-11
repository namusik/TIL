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
# 토픽 생성
# 여러 브로커가 클러스터에 있을 때 아무 브로커에 요청하면 됨.
docker exec -it kafka1 bash
/opt/kafka/bin/kafka-topics.sh --create --topic topic2 --bootstrap-server kafka1:9093 --partitions 3 --replication-factor 3 --config min.insync.replicas=2
	•	--create: 토픽 생성 모드
	•	--topic topic-example1: 만들 토픽 이름
	•	--bootstrap-server localhost:9092: 브로커 접속 주소
	    •	Compose 예시에서 KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092이므로 컨테이너 내부에서도 localhost:9092로 접근 가능
	•	--partitions 1: 토픽을 생성할 때 파티션 개수를 지정하는 옵션. 파티션 개수(단일 노드 테스트는 1개 권장)
	•	--replication-factor 1: 각 파티션을 몇 개의 브로커에 복제(replication) 할지를 지정(단일 노드이므로 1 필수)
  --config min.insync.replicas=2

# 토픽 리스트 확인
/opt/kafka/bin/kafka-topics.sh --list --bootstrap-server kafka1:9093
topic2

# 생성한 토픽 확인
/opt/kafka/bin/kafka-topics.sh --describe --topic topic2 --bootstrap-server kafka1:9093
Topic: topic2   TopicId: 6LLbY18tQTum5P4l48JJJQ PartitionCount: 3       ReplicationFactor: 3    Configs: min.insync.replicas=2
        Topic: topic2   Partition: 0    Leader: 13      Replicas: 13,11,12      Isr: 13,11,12   Elr:    LastKnownElr: 
        Topic: topic2   Partition: 1    Leader: 11      Replicas: 11,12,13      Isr: 11,12,13   Elr:    LastKnownElr: 
        Topic: topic2   Partition: 2    Leader: 12      Replicas: 12,13,11      Isr: 12,13,11   Elr:    LastKnownElr: 

# broker 하나를 강제로 끄면 Isr에서 사라짐. leader 변경
Topic: topic2   TopicId: 7LikRBsrQw6AL1utaqEdMA PartitionCount: 3       ReplicationFactor: 3    Configs: min.insync.replicas=2
        Topic: topic2   Partition: 0    Leader: 12      Replicas: 12,13,11      Isr: 12,11      Elr:    LastKnownElr: 
        Topic: topic2   Partition: 1    Leader: 11      Replicas: 13,11,12      Isr: 11,12      Elr:    LastKnownElr: 
        Topic: topic2   Partition: 2    Leader: 11      Replicas: 11,12,13      Isr: 11,12      Elr:    LastKnownElr: 

# broker 다시 키면 Isr 북구되고 leader도 변경됨.
Topic: topic2   TopicId: 7LikRBsrQw6AL1utaqEdMA PartitionCount: 3       ReplicationFactor: 3    Configs: min.insync.replicas=2
        Topic: topic2   Partition: 0    Leader: 12      Replicas: 12,13,11      Isr: 12,11,13   Elr:    LastKnownElr: 
        Topic: topic2   Partition: 1    Leader: 13      Replicas: 13,11,12      Isr: 11,12,13   Elr:    LastKnownElr: 
        Topic: topic2   Partition: 2    Leader: 11      Replicas: 11,12,13      Isr: 11,12,13   Elr:    LastKnownElr: 

# 토픽 수정 
/opt/kafka/bin/kafka-topics.sh --alter --topic topic2 --partitions 6 --bootstrap-server kafka1:9093


# 토픽 삭제
/opt/kafka/bin/kafka-topics.sh --delete --topic topic2 --bootstrap-server kafka1:9093


# 프로듀서 실행. 메시지 전송
/opt/kafka/bin/kafka-console-producer.sh --topic topic2 --request-required-acks 1 --message-send-max-retries 3 --bootstrap-server kafka1:9093,kafka2:9093,kafka3:9093

--request-required-acks : Kafka 프로듀서가 브로커로부터 “메시지 전송 성공”을 얼마나 확실히 보장받을지를 설정하는 옵션. 프로듀서 → 브로커 간 acknowledgment(응답) 수준을 제어
0 acks=0 (Fire-and-forget) 프로듀서가 메시지를 보내자마자 응답을 기다리지 않음.전송 속도는 빠르지만 메시지 손실 가능성 높음.
1 acks=1 (Leader only) 리더 브로커가 메시지를 받으면 “ACK” 응답을 보냄.팔로워 복제 완료 여부는 확인하지 않음.→ 리더 장애 시 일부 메시지 손실 가능성 존재. (일반적 설정)
-1 또는 all acks=all (ISR 모두 확인) 리더뿐만 아니라 모든 ISR(in-sync replicas) 이 메시지를 저장할 때까지 대기 후 ACK.가장 안전한 설정(일관성 보장).
운영 환경에서는 acks=all + min.insync.replicas>=2 조합을 강력히 권장

--message-send-max-retries Kafka 프로듀서가 메시지 전송에 실패했을 때 재시도하는 최대 횟수를 지정
(기본값: 2)
acks=0일 경우 브로커의 응답을 기다리지 않기 때문에 재시도 자체가 동작하지 않는다.


# 발행 테스트
kafka-verifiable-producer.sh

# (메시지 입력)

# 새 터미널 컨슈머 그룹 실행(메시지 수신)
docker exec -it kafka bash
/opt/kafka/bin/kafka-console-consumer.sh --topic topic2 --group group1 --bootstrap-server kafka1:9093,kafka2:9093,kafka3:9093 --from-beginning
	•	--topic test-topic: 구독할 토픽
	•	--bootstrap-server localhost:9092: 브로커 주소
	•	--from-beginning: **토픽의 처음(오프셋 0)**부터 읽기
	•	    지정하지 않으면 현재 시점 이후에 도착하는 메시지만 읽음
  -- group teamA : --group을 지정하지 않으면 익명(anonymous)” 컨슈머로 간주. 오프셋을 저장하지 않는다.

  --property print.key=true  메시지의 key를 value와 함께 출력하도록 설정


```

- CLI 도구가 /opt/kafka/bin/ 디렉터리 안에만 있어서 경로를 지정해줘야 함.


## consumer group CURRENT-OFFSET 확인

```sh
/opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server kafka1:9093,kafka2:9093,kafka3:9093 --group group1 --describe

Consumer group 'team-a' has no active members.

GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID     HOST            CLIENT-ID
team-a          topic-example2  0          4               6               2               -               -               -

GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID     HOST            CLIENT-ID
team-a          topic-example2  0          6               6               0               -               -               -
```


## kafka file sink connect 사용해보기

```sh
docker exec -it kafka1 bash
cd /opt/kafka/config
cat connect-standalone.properties