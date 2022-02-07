# Stomp

## (Simple Text Oriented Message Protocol)

    메시지 전송을 효율적으로 하기 위한 프로토콜

    PUB / SUB 구조로 되어있음

    클라이언트와 서버가 전송할 메세지의 유형, 형식, 내용들을 정의하는 매커니즘

    메세지의 헤더에 값을 줘서 인증 처리를 구현하는 것도 가능

### PUB / SUB 

    메시지를 공급하는 주체와 소비하는 주체를 분리해 제공하는 메세징 방법

    채팅방 생성 - 우체통(Topic)
    채팅방에 글을 씀 - 집배원(Publisher)
    채팅방에 들어감 - 구독자(Subscriber)


## Message Broker 

    Broker를 통해 타 사용자들에게 메세지를 보내거나 서버가 특정 작업을 수행하도록 메세지를 보냄

    Spring에서 지원하는 STOMP를 사용하면 Simple In-Memory Broker를 이용

    RabbitMQ, ActiveMQ같은 외부 메세징 시스템을 STOMP Broker로 사용할 수 있도록 지원

    스프링은 메세지를 외부 Broker에게 전달하고, Broker는 WebSocket으로 연결된 클라이언트에게 메세지를 전달
    
## 프레임 구조

    COMMAND(SEND(메세지 전송)/SUBSCRIBE(메세지 구독))
    header1:value1 : 어디로 보낼지 destination이 됨
    header2:value2

    Body^@ : payload

    

```
예시

<ClientA가 5번채팅방에 대해 구독>

SUBSCRIBE
destination: /topic/chat/room/5
id: sub-1

^@
    
<ClientB에서 채팅메세지 보냄>

SEND
destination: /pub/chat
content-type: application/json

{"chatRoomId": 5, "type": "MESSAGE", "writer": "clientB"} ^@

<받은 메세지를 모든 구독자에게 보냄>

MESSAGE
destination: /topic/chat/room/5
message-id: d4c0d7f6-1
subscription: sub-1


{"chatRoomId": 5, "type": "MESSAGE", "writer": "clientB"} ^@

