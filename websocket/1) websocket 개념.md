## 정의
```
두 프로그램 간의 메시지를 교환하기 위한 통신 방법 중에 하나

HTML5에서 많이 사용됨

```


## 특징
#### 1. 양방향 통신
	데이터 송수신을 동시에 처리
    클라와 서버가 서로에게 원할 떄 데이터를 주고 받을 수 있음
    기존의 http통신은 클라가 요청을 보내는 경우에만 서버가 응답할 수 있었음
    커넥션이 open, close 된 여부를 따짐
#### 2. 실시간 네트워킹 Real Time Networking
	웹환경에서 연속된 데이터를 빠르게 노출시켜야 할 때 곧잘 사용
	채팅, 주식, 비디오 데이터
    친구들과 채팅을 한다면 친구들과 연결된 것이 아니라 같은 websocket 서버에 들어가 있는 상태인거
    여기서 브라우저 끼리 연결을 시켜버리는 개념이 WebRTC. P2P 커뮤니케이션
	여러 단말기에 빠르게 데이터를 교환
	
#### 3. Polling, Long Polling, Streaming과의 차이
	서버로 일정 주기로 요청을 보냄
	real time 통신에 비해서 불필요한 요청을 보내게 됨 
    header가 불필요하게 큼
    
## 동작방식
#### 핸드 쉐이킹

![](https://images.velog.io/images/rainbowweb/post/5a28097a-db1a-409d-afe2-a7c31356042f/image.png)

1. 빨간 박스 Opening Handshake
```
  HTTP80/443을 사용
  응답코드는 101
```
```
    요청
    GET /chat HTTP/1.1     ##반드시 GET 메서드
    Host: localhost:8080  
    Upgrade: websocket     ##웹소켓 전환을 위해서 고정값
    Connection: Upgrade    ##현재의 전송이 완료된 후 네트워크 접속을 유지할 것인가에 대한 정보. 웹소켓 요청 시에는 반드시 Upgrade라는 값 고정
    Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==  ##유효한 요청인지 확인하기 위해 사용하는 키 값. base64로 인코딩
    Sec-WebSocket-Protocol: chat, superchat  
    Sec-WebSocket-Version: 13 
    Origin: http://localhost:9000
```
```
    응답
    HTTP/1.1 101 Switching Protocols ##응답코드가 101. 101은 '프로토콜 전환' 으로 요청자가 서버에 프로토콜 전환을 요청했으며 서버는 이를 승인하는 상태
    Server: Apache-Coyote/1.1 
    Upgrade: websocket 
    Connection: upgrade 
    Sec-WebSocket-Accept: y0C2sLRjQhdq3geJIKYeRVUgtFg= ##보안을 위한 응답 키로 Sec-WebSocket-Key를 base64로 인코딩. 클라에서 보낸값과 일치해야함

	
```
2. 노란 박스 Data Transfer
```
    데이터 전송파트
    메세지라는 개념으로 데이터를 주고 받음
    여기서 메세지는 프레임단위로 되어있음. 프
    레임은 communication에서 가장 작은 단위. 작은헤더 + payload로 구성
    서버와 클라이언트는 서로가 살아 있는지 확인하기 위해 heartbeat 패킷을 보내며, 주기적으로 ping을 보내 체크

    프로토콜이 ws로 변경됨. ws(80/443)
```
3. 보라 박스 Closing HandShake
```
    커넥션을 종료하기 위한 컨트롤 프레임을 전송
```

## 한계
#### SockJS
```
    웹소켓은 HTML5 이후에 나왔기 때문에
    HTML5이전의 기술로 구현된 서비스에서 웹소켓 처럼 사용할 수 있도록 도와줌

    자바스크립트를 사용하여 실시간 웹을 구현
```



## 참고
https://www.youtube.com/watch?v=rvss-_t6gzg
https://kellis.tistory.com/65
https://ws-pace.tistory.com/105?category=968973
https://dev-gorany.tistory.com/212?category=901854
https://dydtjr1128.github.io/spring/2019/05/26/Springboot-react-chatting.html


    

