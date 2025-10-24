# Kafka 도커에 설치하기

JDK Temurin 21
Spring Boot 3.4.10
Spring for Apache Kafka 3.3.10
kafka-clients (Spring 관리) 3.8.x
Kafka Broker (Docker 서버) 4.1.x (최신)
Kafka Mode KRaft (Zookeeper 없이 단일 프로세스)


## 도커 카프카 구성
- 단일 브로커
[docker-compose](./docker-compose.yml)

- 멀티 구성
[docker-compose-multi](./docker-compose-multi.yml)