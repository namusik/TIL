# Stomp

## (Simple Text Oriented Message Protocol)

    메시지 전송을 효율적으로 하기 위한 프로토콜

    웹소켓 위에 얹어 함께 사용할 수 있음

    PUB / SUB 구조로 되어있음

    클라이언트와 서버가 전송할 메세지의 유형, 형식, 내용들을 정의하는 매커니즘

    메세지의 헤더에 값을 줘서 인증 처리를 구현하는 것도 가능

### PUB / SUB 

    메시지를 공급하는 주체와 소비하는 주체를 분리해 제공하는 메세징 방법

    채팅방 생성 - 우체통(Topic)
    채팅방에 글을 씀 - 집배원(Pub)
    채팅방에 들어감 - 구독자(Sub)


## Message Broker 

    발신자의 메세지를 받아와서 수신자들에게 메세지를 전달하는 어떤 것

    Spring에서 지원하는 STOMP를 사용하면 Simple In-Memory Broker를 이용

    RabbitMQ, ActiveMQ같은 외부 메세징 시스템을 STOMP Broker로 사용할 수 있도록 지원

    스프링은 메세지를 외부 Broker에게 전달하고, Broker는 WebSocket으로 연결된 클라이언트에게 메세지를 전달
    
## 프레임 구조

    웹소켓과 다르게 보내는 형식이 정해져있음

    COMMAND          (SEND(메세지 전송)/SUBSCRIBE(메세지 구독))
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
```

##  Pub/Sub 메시징 흐름
</br>

![](https://images.velog.io/images/rainbowweb/post/15faab06-edf1-4a21-bd8e-c081d9a5eeb8/image.png)

SEND : 발신자. 구독자에게 메세지를 보내고 싶어함.

	1. 클라이언트에서 메세지를 보내면 일단 먼저 @MessageMapping이 붙은 Controller가 받는다.
	2. /topic을 destination 헤더로 넣어서 메세지를 바로 송신할 수 도 있고
    3. /app을 destination 헤더로 넣어서 서버 내에서 가공을 줄 수 있음
    4. 서버가 가공을 완료했으면, 메시지를 /topic이란 경로를 담아서 다시 전송하면
    5. SimpleBroker에게 전달되고
    6. simpleBroker는 전달받은 메세지를 구독자들에게 최종적으로 전달하게 됨.

MESSAGE : 구독.  /topic이란 경로를 구독중

