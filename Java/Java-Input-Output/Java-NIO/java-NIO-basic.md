# Java NIO

## 개념
- Java New Input/Output
- Java I/O 작업에 대한 새로운 접근 방식
  - [JavaIO 정리](../Java%20IO/Java%20IO%20basic.md)
- java.nio 패키지를 통해 NIO 프레임워크용 클래스와 인터페이스를 포함하는 Java 표준 라이브러리 패키지를 제공한다.


## 배경
- 2002년 Java 1.4 도입
  - 넌블로킹 I/O, 버퍼 관리, 채널을 통한 데이터 입출력, 멀티플렉싱 I/O 연산을 지원하기 위해 설계
- 2011년 Java 7
  - Java NIO.2 도입
  - 파일 시스템 액세스, 파일 속성 관리, 비동기 파일 I/O 작업을 위한 새로운 API
  - java.nio.file 패키지와 그 하위 패키지

## 특징 
- 채널(Channel)과 버퍼(Buffer)
  - 데이터는 버퍼에 저장되며, 채널은 이 버퍼를 통해 데이터를 읽거나 쓸 수 있다.
- 넌블로킹 I/O
  -  넌블로킹 I/O를 지원
  -  입출력 작업을 실행하는 동안 작업이 완료될 때 까지 기다리지 않고 해당 스레드가 다른 작업을 계속할 수 있음을 의미.
  -  하나의 스레드가 여러 채널의 입출력을 처리할 수 있다.
- 셀렉터(Selector)
  - 하나의 스레드로 여러 채널의 입출력 이벤트를 처리할 수 있게 해주는 기능
  - 여러 네트워크 연결을 하나의 스레드로 관리할 수 있음.


## 핵심 클래스

### 채널(Channel)
- 데이터의 소스 혹은 목적지와의 연결을 나타내는 객체
  - FileChannel, DatagramChannel, SocketChannel 등등이 있다.

### 버퍼(Buffer)
- 데이터를 임시로 저장하는 컨테이너 역할
  - ByteBuffer, CharBuffer, IntBuffer 등등이 있다.
- 입출력 작업에서 데이터를 일시적으로 보관하고, 필요할 때 데이터를 읽고 쓸 수 있음.

[ByteBuffer 정리](ByteBuffer.md)

### Selector


## 출처
https://www.baeldung.com/java-io-vs-nio
https://www.baeldung.com/java-nio-selector