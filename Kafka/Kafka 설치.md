# Kafka 설치 및 실행

## 설치

[kafka.apache.org/downloads](https://kafka.apache.org/downloads)

설치 후 압축해제

## 실행

설치 폴더 C드라이브 바로 아래로 옮기기(설치경로가 너무 길면 실행이 되지 않는 오류 발생)

1. Zookeeper 실행해주기
    1. .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
    2. zookeeper-server-start.bat
        1. zookeeper 서버 실행 파일
    3. zookeeper.properties
        1. zookeeper 서버 설정 파일
2. 새로운 powershell 열어서 kafka 실행해주기
    1. .\bin\windows\kafka-server-start.bat .\config\server.properties
    2. kafka-server-start.bat
        1. kafka 서버 실행 파일
    3. server.properties
        1. 설정 파일
3. 실행확인
    1. powershell에서 netstat -a 했을 때
    2. 주소 2181 인게 zookeeper 서버 포트
    3. 주소 9092 인게 kafka 서버 포트
4. kafka 테스트
    1. .\bin\windows\kafka-topics.bat --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
       --topic test
        1. --create : 새로운 토픽 만들기
        2. --bootstrap-server localhost:9092  : 연결할 kafka 서버. 이 옵션이 추가되면 직접 zookeeper에 연결하지 않아도 됨
        3. --replication-factor 1         :   partition 복제할 개수. 안쓰면 기본값 사용(server.properties파일
           default.replication.factor에서 기본값 설정 가능)
        4. --partitions 1 : topic 생성할 때 만들 partition 수
        5. --topic test           :     topic 이름
    2. Created topic test.
        1. 라고 뜨면 성공
    3. topic 목록 확인하기
        1. .\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
        2. --list  : 목록 볼 때
    4. topic 상세 정보 보기
        1. .\bin\windows\kafka-topics.bat --describe --topic test --bootstrap-server localhost:9092
        2. --describe 상세정보 볼 때
    5. topic 삭제하기
        1. .\bin\windows\kafka-topics.bat --delete --topic test --bootstrap-server localhost:9092
        2. --delete
            1. 토픽을 삭제하려면 server.properties에서 delete.topic.enable=true를 추가해줘야 함.
    6. Producer 설정
        1. topic으로 메시지 보내기
        2. .\bin\windows\kafka-console-producer.bat --broker-list localhost:9092 --topic woosik
    7. Consumer 설정
        1. topic에서 메시지 받기
        2. .\bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic woosik --from-beginning
        3. --from-beginning       :     가장 먼저 도착한 메시지부터 읽기
        4. powershell 2개 동시에 키고 실시간 전송 확인하면 됨

## 출처

https://oingdaddy.tistory.com/274

https://victorydntmd.tistory.com/345
