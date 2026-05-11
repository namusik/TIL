# Socket Exceptoin

## Borken pipe
- 파이프 끊김은 일반적으로 한 장치가 죽었거나 연결이 끊어진 다른 장치에서 데이터를 읽거나 쓰려고 할 때 발생


```java
java.net.SocketException: Broken pipe
	at java.base/sun.nio.ch.NioSocketImpl.implWrite(NioSocketImpl.java:420)
	at java.base/sun.nio.ch.NioSocketImpl.write(NioSocketImpl.java:440)
	at java.base/sun.nio.ch.NioSocketImpl$2.write(NioSocketImpl.java:826)
	at java.base/java.net.Socket$SocketOutputStream.write(Socket.java:1035)
	at java.base/java.io.OutputStream.write(OutputStream.java:127)
	at com.example.tcp.socketexception.Client.main(Client.java:16)
```


## 원인
- 연결이 닫히면 그 이후에 클라이언트가 서버에 데이터를 쓰려고 시도하면 '파이프 끊김' 오류가 발생
- 네트워크 소켓의 경우 네트워크 케이블이 분리되어 있거나 반대쪽 끝의 프로세스가 작동하지 않는 경우 이 오류가 발생

## 해결방안
- 항상 클라이언트와 서버가 소켓 연결을 적절하게 처리하고 스트림과 소켓을 정상적으로 닫도록 하는 것이 좋다.
- 타임아웃을 효과적으로 관리하고 신속하게 대응해야 한다.