# Java TCP

- Java에서 TCP 통신을 할 때 쓰이는 객체 정리

## ServerSocket
- 서버 측에서 클라이언트의 연결 요청을 기다리는 역할
- 특정 포트에서 들어오는 요청을 듣고, 클라리언트 연결이 들어오면 이를 수락.
- 수락 후, 클라이언트와 통신할 수 있는 Socket 객체를 생성.

```java
ServerSocket serverSocket = new ServerSocket(port)
```
- `ServerSocket` 객체 생성
- 지정된 port에 바인딩.

```java
Socket clientSocket = serverSocket.accept()
```
- 클라이언트의 연결 요청을 기다리다가, 요청이 들어오면 요청을 수락하고 클라이언트와 통신하기 위한 `Socket` 객체를 반환


```java
    public Socket accept() throws IOException {
        if (isClosed())
            throw new SocketException("Socket is closed");
        if (!isBound())
            throw new SocketException("Socket is not bound yet");
        Socket s = new Socket((SocketImpl) null);
        implAccept(s);
        return s;
    }
```
- 내부 코드를 살펴보면, socket이 닫히거나 바운드되지 않으면 예외를 발생시킨다.


```java
serverSocket.close()
```
- 서버 소켓을 닫고, 해당 서버 소켓이 사용하던 모든 시스템 리소스를 해제
- ServerSocket 객체를 더 이상 사용할 수 없게된다.

```java
serverSocket.setSoTimeout(int timeout)
```
- accept()가 영원히 블로킹 상태에 머물지 않도록 하여, 지정된 시간 동안만 연결 요청을 기다리도록 설정


## Socket
### 개념
-  자바에서 네트워크 통신을 위해 사용되는 핵심 클래스
-  네트워크를 통해 데이터를 송수신하기 위한 endpoint을 추상화한 것
-  클라이언트는 `Socket` 객체를 사용하여 서버에 연결하고, 서버는 `ServerSocket`을 사용하여 클라이언트의 연결 요청을 수락
-  연결이 성립되면, 서버와 클라이언트는 각각의 `Socket` 객체를 통해 데이터를 주고받는다.
  
### 특징
- 점대점 통신: TCP/IP 네트워크에서 두 노드 간의 점대점(point-to-point) 연결을 설정
- 신뢰성 있는 데이터 전송: TCP 기반으로 동작하기 때문에, 데이터 전송 순서가 보장되며, 손실되거나 손상된 데이터 없이 전송
- 방향 통신: 데이터를 양방향으로 전송할 수 있어, 서버와 클라이언트는 서로에게 데이터를 보내고 받을 수 있음
  
```java
Socket socket = new Socket(serverAddress, port)
```
- Socket 객체 생성
- host와 port가 필요

```java
try (Socket socket = new Socket()) {
    // 소켓 연결에 타임아웃을 5000 밀리초(5초)로 설정
    socket.connect(endpoint, 5000);
}
```
- 소켓을 서버에 연결. 
- 이미 연결된 소켓에 대해서는 예외를 던진다.
- Socket 객체를 생성할 때 바로 연결하지 않고, 나중에 명시적으로 연결을 시작하고자 할 때 유용
- 연결 시도에 타임아웃 설정이 가능하다.

```java
OutputStream outputStream = socket.getOutputStream();
outputStream.write("Hello, Server!".getBytes());
```
- 소켓으로 데이터를 쓰기 위한 OutputStream을 반환

```java
BufferedReader input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
String serverResponse = input.readLine(); // 서버로부터 한 줄의 메시지를 읽습니다.
```
- 소켓으로부터 데이터를 읽기 위한 InputStream을 반환