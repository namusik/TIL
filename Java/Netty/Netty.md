# Netty

> 최종 업데이트: 2026-04-06 | Netty 4.1.x / Java 21 기준 | [공식문서](https://netty.io/wiki/) | [GitHub](https://github.com/netty/netty)

## 개념

**비동기 이벤트 기반 네트워크 프레임워크**로, 고성능 TCP/UDP 서버·클라이언트를 쉽게 만들 수 있게 해주는 **순수 Java 라이브러리**다.

- Java NIO를 직접 다루면 Selector, Channel, Buffer, 스레드 관리를 전부 수동으로 해야 해서 복잡하다. Netty는 이를 **이벤트 루프 + 파이프라인**으로 깔끔하게 추상화
- 건축에 비유하면, raw Socket은 벽돌을 직접 쌓는 것이고, Java NIO는 전동 공구를 쓰는 것이며, Netty는 **건축 회사에 맡기는 것**
- **Spring과 무관한 별도 라이브러리**이며, Spring이 커스텀 TCP 프로토콜을 위한 추상화를 제공하지 않기 때문에 Netty를 직접 의존성에 추가해서 사용
- **Trustin Lee**(이희승, 한국인)가 개발. JBOSS/Red Hat을 거쳐 현재 오픈소스 커뮤니티에서 관리
- Apache 2.0 라이선스

### 의존성 추가

```gradle
// Gradle
implementation 'io.netty:netty-all:4.1.118.Final'
```

```xml
<!-- Maven -->
<dependency>
    <groupId>io.netty</groupId>
    <artifactId>netty-all</artifactId>
    <version>4.1.118.Final</version>
</dependency>
```

### 누가 쓰는가

| 프로젝트 | Netty 활용 |
|---|---|
| **Spring WebFlux** | 내장 서버 (Reactor Netty — HTTP용으로 감싼 것) |
| **gRPC-Java** | 전송 계층 |
| **Apache Kafka** | 브로커 간 통신 |
| **Elasticsearch** | 노드 간 통신 |
| **Armeria (LINE)** | 비동기 RPC 프레임워크 |
| **Zuul 2 (Netflix)** | API Gateway |

> Spring WebFlux의 Reactor Netty는 HTTP 프로토콜용으로 Netty를 감싼 것이다. 커스텀 TCP 프로토콜(회사 전문 규격 등)에는 Netty를 직접 사용해야 한다.

## raw Socket / Java NIO / Netty 비교

```
raw Socket (java.net)
  └─ 스레드 관리, 버퍼 처리, 재연결, 반복 읽기 전부 직접 구현
  └─ 연결당 1스레드 → 동시 접속 수천 이상이면 한계

Java NIO (java.nio)
  └─ Selector/Channel/Buffer로 논블로킹 가능
  └─ 하지만 API가 복잡하고, 엣지 케이스(반쪽 닫기, 버퍼 관리, epoll 버그 등) 처리 어려움

Netty
  └─ NIO 위에 이벤트 루프 + 파이프라인 추상화
  └─ 코덱, 재연결, 하트비트 등 실무 기능 내장
  └─ 검증된 고성능 (수만~수십만 동시 연결)
```

| 항목 | raw Socket | Java NIO | Netty |
|---|---|---|---|
| 난이도 | 낮음 (단순 통신) | 높음 | 중간 (학습 곡선 있음) |
| 동시 접속 | 연결당 스레드 (수백) | 높음 | 매우 높음 |
| 코덱 지원 | 없음 | 없음 | 내장 (다양한 코덱) |
| 재연결/하트비트 | 직접 구현 | 직접 구현 | 내장 또는 쉽게 구현 |
| 프로덕션 검증 | 제한적 | 가능 | Kafka, gRPC 등에서 검증 |

## 아키텍처

```
┌──────────────────────────────────────────────────────────┐
│                       Netty                               │
│                                                           │
│  ┌─────────────┐    ┌─────────────────────────────────┐  │
│  │  Boss Group  │    │         Worker Group             │  │
│  │ (EventLoop)  │    │  ┌─────────┐  ┌─────────┐      │  │
│  │              │    │  │EventLoop│  │EventLoop│ ...   │  │
│  │  accept()    │    │  │ (I/O)   │  │ (I/O)   │      │  │
│  └──────┬───────┘    │  └────┬────┘  └────┬────┘      │  │
│         │            │       │             │            │  │
│         │ 새 연결     │  ┌────▼────┐  ┌────▼────┐      │  │
│         └───────────→│  │Channel  │  │Channel  │      │  │
│                      │  │Pipeline │  │Pipeline │      │  │
│                      │  └─────────┘  └─────────┘      │  │
│                      └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Boss Group  : 연결 수락 전담 (접수 창구). 보통 스레드 1개
Worker Group: 실제 I/O 처리 (업무 담당자). 기본 CPU 코어 × 2
Channel     : 하나의 TCP 연결
Pipeline    : 핸들러 체인 (데이터 가공 조립 라인)
```

> 클라이언트는 Boss Group이 필요 없다 (연결을 수락할 일이 없으므로). `Bootstrap`에 Worker Group만 설정하면 된다.

## 핵심 컴포넌트

### Channel

하나의 네트워크 연결을 나타내는 객체. 전화 회선 하나에 해당.

| 구현체 | 설명 |
|---|---|
| `NioSocketChannel` | NIO 기반 TCP 클라이언트 채널 |
| `NioServerSocketChannel` | NIO 기반 TCP 서버 채널 |
| `EpollSocketChannel` | Linux epoll 기반 (Linux에서 더 높은 성능) |
| `KQueueSocketChannel` | macOS kqueue 기반 |

### EventLoop / EventLoopGroup

I/O 이벤트를 감지하고 처리하는 스레드. 교환원이 여러 회선을 감시하는 것과 같다.

- **하나의 EventLoop**가 **여러 Channel**을 담당 (1:N)
- 하나의 Channel은 항상 **같은 EventLoop**에서 처리 → 스레드 안전성 보장 (별도 동기화 불필요)
- `EventLoopGroup`은 EventLoop 여러 개를 묶은 스레드 풀

```
EventLoopGroup (스레드 풀)
├── EventLoop-1 ─── Channel A, Channel B, Channel C
├── EventLoop-2 ─── Channel D, Channel E
└── EventLoop-3 ─── Channel F, Channel G, Channel H
```

**EventLoop에서 절대 하면 안 되는 것:**

EventLoop는 I/O를 처리하는 핵심 스레드다. 여기서 블로킹하면 같은 EventLoop에 할당된 **모든 Channel의 I/O가 멈춘다**. 교환원이 한 통화에 매달려 있으면 다른 회선의 전화를 못 받는 것과 같다.

```
EventLoop에서 금지:
  ✗ Thread.sleep()
  ✗ DB 조회 (JDBC는 블로킹)
  ✗ 외부 HTTP API 호출 (동기)
  ✗ 파일 I/O
  ✗ synchronized로 오래 잠기는 코드

블로킹 작업이 필요하면:
  → 별도 스레드 풀에 위임
  ctx.executor().parent().next().execute(() -> { /* 블로킹 작업 */ });
  또는
  EventExecutorGroup businessGroup = new DefaultEventExecutorGroup(16);
  p.addLast(businessGroup, new BlockingBusinessHandler());
```

### ChannelPipeline / ChannelHandler

데이터가 Channel을 통해 들어오거나 나갈 때 거치는 **핸들러 체인**. 공장의 조립 라인에 비유하면, 원자재(바이트)가 각 공정(핸들러)을 거쳐 완제품(비즈니스 객체)이 되는 것.

```
Inbound (수신) — 왼쪽에서 오른쪽으로:
  ByteBuf → [FrameDecoder] → [ProtocolDecoder] → [BusinessHandler]

Outbound (송신) — 오른쪽에서 왼쪽으로:
  [BusinessHandler] → [ProtocolEncoder] → [StringEncoder] → ByteBuf
```

```
Pipeline 예시 (핸들러 등록 순서):
┌────────────────────────────────────────────────┐
│ FrameDecoder            (프레이밍)     Inbound  │
│     ↓                                          │
│ ProtocolDecoder         (바이트→객체)  Inbound  │
│     ↓                                          │
│ LoggingHandler          (로깅)        양방향    │
│     ↓                                          │
│ IdleStateHandler        (하트비트)    양방향    │
│     ↓                                          │
│ BusinessHandler         (비즈니스)    Inbound  │
│     ↓                                          │
│ ProtocolEncoder         (객체→바이트)  Outbound │
└────────────────────────────────────────────────┘
```

| 인터페이스 | 방향 | 주요 콜백 |
|---|---|---|
| `ChannelInboundHandler` | 수신 | `channelRead()`, `channelActive()`, `channelInactive()` |
| `ChannelOutboundHandler` | 송신 | `write()`, `connect()`, `close()` |
| `ChannelDuplexHandler` | 양방향 | 수신 + 송신 모두 처리 |

자주 사용하는 어댑터 클래스:

| 클래스 | 설명 |
|---|---|
| `SimpleChannelInboundHandler<T>` | 타입 T만 처리, 자동 release. **가장 많이 사용** |
| `ChannelInboundHandlerAdapter` | 모든 인바운드 이벤트 수신, 수동 release |
| `ByteToMessageDecoder` | ByteBuf → 객체 변환 (디코더 구현용) |
| `MessageToByteEncoder<T>` | 객체 → ByteBuf 변환 (인코더 구현용) |

### ChannelFuture / Promise

Netty의 모든 I/O 작업은 **비동기**다. `write()`, `connect()`, `close()` 등이 즉시 리턴하고, 실제 완료는 나중에 된다. 택배를 보낼 때 접수증(Future)을 받고 돌아오는 것과 같다.

```java
// connect()는 즉시 리턴 — 연결이 완료되지 않은 상태
ChannelFuture future = bootstrap.connect(host, port);

// 방법 1: sync() — 완료될 때까지 블로킹 (간단하지만 EventLoop에서 금지)
future.sync();

// 방법 2: 리스너 등록 — 논블로킹 (권장)
future.addListener((ChannelFutureListener) f -> {
    if (f.isSuccess()) {
        System.out.println("연결 성공");
    } else {
        System.out.println("연결 실패: " + f.cause());
        // 재연결 로직
    }
});

// 메시지 전송도 마찬가지
channel.writeAndFlush(message).addListener((ChannelFutureListener) f -> {
    if (!f.isSuccess()) {
        System.out.println("전송 실패: " + f.cause());
    }
});
```

### ByteBuf

Netty의 바이트 버퍼. Java NIO의 `ByteBuffer`를 개선한 것. NIO ByteBuffer는 넣기/꺼내기마다 `flip()`을 호출해야 하는 불편한 상자이고, ByteBuf는 읽기/쓰기 인덱스가 분리되어 편리한 상자다.

```
ByteBuf 구조:
  +-------------------+------------------+------------------+
  | discardable bytes |  readable bytes  |  writable bytes  |
  +-------------------+------------------+------------------+
  |                   |                  |                  |
  0      ≤      readerIndex   ≤    writerIndex    ≤    capacity
```

| 항목 | NIO ByteBuffer | Netty ByteBuf |
|---|---|---|
| 읽기/쓰기 전환 | `flip()` 필요 | reader/writer 인덱스 분리 (불필요) |
| 동적 확장 | 불가 (고정 크기) | 자동 확장 |
| 참조 카운팅 | 없음 | 있음 (메모리 누수 방지) |
| 풀링 | 없음 | `PooledByteBufAllocator` (GC 부담 감소) |
| 종류 | Heap만 | Heap, Direct, Composite |

**참조 카운팅과 메모리 누수:**

ByteBuf는 **참조 카운팅** 방식으로 관리된다. 사용 후 `release()`를 호출하지 않으면 메모리 누수가 발생한다.

```java
ByteBuf buf = ctx.alloc().buffer();
try {
    buf.writeBytes(data);
    ctx.writeAndFlush(buf);  // writeAndFlush가 성공하면 자동 release
} catch (Exception e) {
    buf.release();  // 예외 시 직접 release
}
```

- `SimpleChannelInboundHandler`를 사용하면 `channelRead0()` 이후 **자동 release** (권장)
- `ChannelInboundHandlerAdapter`를 사용하면 직접 `ReferenceCountUtil.release(msg)` 호출 필요
- 개발 중 메모리 누수 탐지: JVM 옵션에 `-Dio.netty.leakDetection.level=PARANOID` 설정

### Bootstrap

Netty 애플리케이션의 시작점. 설정을 모아두고 서버/클라이언트를 구동하는 빌더.

| 클래스 | 용도 | EventLoopGroup |
|---|---|---|
| `ServerBootstrap` | 서버 구동 | Boss + Worker 2개 |
| `Bootstrap` | 클라이언트 구동 | Worker 1개만 |

### ChannelOption

Bootstrap에서 설정하는 소켓 옵션.

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `SO_BACKLOG` | 연결 대기 큐 크기 (서버) | OS 기본값 |
| `SO_KEEPALIVE` | TCP Keep-Alive 활성화 | false |
| `TCP_NODELAY` | Nagle 알고리즘 비활성화 (작은 패킷 즉시 전송) | false |
| `SO_REUSEADDR` | TIME_WAIT 포트 재사용 | false |
| `CONNECT_TIMEOUT_MILLIS` | 연결 타임아웃 (클라이언트) | 30000ms |
| `SO_RCVBUF` / `SO_SNDBUF` | 수신/송신 버퍼 크기 | OS 기본값 |

```java
// 서버: option()은 서버 소켓, childOption()은 수락된 클라이언트 소켓
bootstrap.option(ChannelOption.SO_BACKLOG, 128)
         .childOption(ChannelOption.SO_KEEPALIVE, true)
         .childOption(ChannelOption.TCP_NODELAY, true);

// 클라이언트: option()만 사용
bootstrap.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
         .option(ChannelOption.TCP_NODELAY, true);
```

## 코덱 (Encoder / Decoder)

커스텀 프로토콜 연동의 핵심. 바이트 스트림에서 메시지 단위를 잘라내고(프레이밍), 자바 객체로 변환하는 것.

### TCP 프레이밍 문제

TCP는 **스트림 프로토콜**이라 메시지 경계가 없다. 100바이트를 보내도 50바이트씩 두 번에 나눠 도착하거나, 200바이트가 한 번에 뭉쳐서 올 수 있다. 편지를 보냈는데 반쪽만 먼저 도착하는 것과 같다.

```
보낸 쪽:   [메시지1][메시지2][메시지3]
받는 쪽:   [메시지1 앞반][메시지1 뒷반 + 메시지2][메시지3]  ← 이렇게 올 수 있음
```

그래서 디코더에서 **프레이밍** — 바이트 스트림에서 메시지 단위를 정확히 잘라내는 작업 — 이 가장 중요하다.

### Netty 내장 프레임 디코더

| 디코더 | 프레임 구분 방식 | 예시 |
|---|---|---|
| `LengthFieldBasedFrameDecoder` | 길이 필드 | 헤더에 바디 길이 포함 (**가장 흔함**) |
| `DelimiterBasedFrameDecoder` | 구분자 | STX/ETX, BEGIN/END |
| `FixedLengthFrameDecoder` | 고정 길이 | 모든 메시지가 100바이트 |
| `LineBasedFrameDecoder` | 줄바꿈 (`\n`) | 텍스트 프로토콜 |

### LengthFieldBasedFrameDecoder 상세

가장 많이 사용되는 프레임 디코더. 메시지 안에 길이 필드가 있는 프로토콜에 사용한다.

```
┌──────────┬──────────┬──────────┐
│ Header(4) │ Length(4) │  Body(N)  │
└──────────┴──────────┴──────────┘
                ↑ 이 필드를 읽어서 Body 길이를 결정
```

```java
// maxFrameLength: 최대 프레임 크기
// lengthFieldOffset: 길이 필드 시작 위치 (Header 뒤 = 4)
// lengthFieldLength: 길이 필드 크기 (4바이트 int)
// lengthAdjustment: 길이에 더할 보정값
// initialBytesToStrip: 디코딩 후 앞에서 잘라낼 바이트 수
new LengthFieldBasedFrameDecoder(65535, 4, 4, 0, 0);
```

### 커스텀 코덱 구현 예시

바이너리 프로토콜:

```
┌──────────┬──────────┬──────────┬──────────┐
│ 전문코드(4) │ 전문길이(4) │  Body(N)  │  ETX(1)  │
└──────────┴──────────┴──────────┴──────────┘
```

```java
// 디코더: 바이트 → Message 객체
public class CustomProtocolDecoder extends ByteToMessageDecoder {

    private static final int HEADER_SIZE = 8;  // 전문코드(4) + 전문길이(4)

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        // 1. 헤더만큼 안 왔으면 대기
        if (in.readableBytes() < HEADER_SIZE) return;

        in.markReaderIndex();  // 현재 위치 기억 (되감기용)

        // 2. 헤더 파싱
        byte[] codeBytes = new byte[4];
        in.readBytes(codeBytes);
        String code = new String(codeBytes, StandardCharsets.UTF_8);
        int bodyLength = in.readInt();

        // 3. 바디 + ETX만큼 안 왔으면 되감기 후 대기
        if (in.readableBytes() < bodyLength + 1) {
            in.resetReaderIndex();  // markReaderIndex 위치로 되감기
            return;
        }

        // 4. 바디 읽기
        byte[] body = new byte[bodyLength];
        in.readBytes(body);
        in.readByte();  // ETX 소비

        // 5. 자바 객체로 변환하여 다음 핸들러로 전달
        out.add(new CustomMessage(code, new String(body, StandardCharsets.UTF_8)));
    }
}

// 인코더: Message 객체 → 바이트
public class CustomProtocolEncoder extends MessageToByteEncoder<CustomMessage> {

    @Override
    protected void encode(ChannelHandlerContext ctx, CustomMessage msg, ByteBuf out) {
        byte[] codeBytes = msg.getCode().getBytes(StandardCharsets.UTF_8);
        byte[] bodyBytes = msg.getBody().getBytes(StandardCharsets.UTF_8);

        out.writeBytes(codeBytes);       // 전문코드
        out.writeInt(bodyBytes.length);   // 전문길이
        out.writeBytes(bodyBytes);        // Body
        out.writeByte(0x03);              // ETX
    }
}
```

텍스트 기반 프로토콜 (BEGIN/END 구분자):

```java
// 텍스트 프로토콜은 내장 디코더 조합으로 처리 가능
ch.pipeline()
  .addLast(new DelimiterBasedFrameDecoder(65535,
      Unpooled.copiedBuffer("END\r\n", StandardCharsets.UTF_8)))
  .addLast(new StringDecoder(StandardCharsets.UTF_8))
  .addLast(new TextProtocolDecoder())   // String → 비즈니스 객체
  .addLast(new StringEncoder(StandardCharsets.UTF_8));
```

## 서버 예제

```java
public class NettyServer {

    public void start(int port) throws InterruptedException {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                     .channel(NioServerSocketChannel.class)
                     .option(ChannelOption.SO_BACKLOG, 128)
                     .childOption(ChannelOption.SO_KEEPALIVE, true)
                     .childOption(ChannelOption.TCP_NODELAY, true)
                     .childHandler(new ChannelInitializer<SocketChannel>() {
                         @Override
                         protected void initChannel(SocketChannel ch) {
                             ChannelPipeline p = ch.pipeline();
                             p.addLast(new LoggingHandler(LogLevel.DEBUG));  // 디버깅용
                             p.addLast(new CustomProtocolDecoder());
                             p.addLast(new CustomProtocolEncoder());
                             p.addLast(new IdleStateHandler(30, 0, 0));
                             p.addLast(new ServerBusinessHandler());
                         }
                     });

            ChannelFuture f = bootstrap.bind(port).sync();
            f.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

## 클라이언트 예제

```java
public class NettyClient {

    private Channel channel;
    private EventLoopGroup group;

    public void connect(String host, int port) throws InterruptedException {
        group = new NioEventLoopGroup();

        Bootstrap bootstrap = new Bootstrap();
        bootstrap.group(group)
                 .channel(NioSocketChannel.class)
                 .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                 .option(ChannelOption.TCP_NODELAY, true)
                 .handler(new ChannelInitializer<SocketChannel>() {
                     @Override
                     protected void initChannel(SocketChannel ch) {
                         ChannelPipeline p = ch.pipeline();
                         p.addLast(new CustomProtocolDecoder());
                         p.addLast(new CustomProtocolEncoder());
                         p.addLast(new IdleStateHandler(0, 10, 0));
                         p.addLast(new ClientBusinessHandler());
                     }
                 });

        ChannelFuture f = bootstrap.connect(host, port);
        f.addListener((ChannelFutureListener) future -> {
            if (future.isSuccess()) {
                channel = future.channel();
            } else {
                // 연결 실패 시 재연결
                future.channel().eventLoop().schedule(
                    () -> connect(host, port), 5, TimeUnit.SECONDS);
            }
        });
    }

    public void send(CustomMessage message) {
        if (channel != null && channel.isActive()) {
            channel.writeAndFlush(message);
        }
    }

    public void close() throws InterruptedException {
        if (channel != null) channel.close().sync();
        if (group != null) group.shutdownGracefully();
    }
}
```

## 핸들러 라이프사이클

```
channelRegistered()    ← Channel이 EventLoop에 등록됨
        ↓
channelActive()        ← 연결 수립 완료 (상대와 통신 가능)
        ↓
channelRead()          ← 데이터 수신 (반복)
channelReadComplete()  ← 현재 읽기 작업 완료
        ↓
userEventTriggered()   ← IdleStateEvent 등 사용자 이벤트
        ↓
channelInactive()      ← 연결 종료
        ↓
channelUnregistered()  ← EventLoop에서 해제됨
```

```java
public class BusinessHandler extends SimpleChannelInboundHandler<CustomMessage> {

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        // 연결 수립 시 — 인증 등 초기 작업
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, CustomMessage msg) {
        // 메시지 수신 시 — 비즈니스 로직
        // SimpleChannelInboundHandler이므로 msg 자동 release
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        // 연결 종료 시 — 재연결 로직
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) {
        if (evt instanceof IdleStateEvent e) {
            switch (e.state()) {
                case READER_IDLE -> ctx.close();  // 상대가 응답 없음 → 연결 종료
                case WRITER_IDLE -> ctx.writeAndFlush(heartbeatMsg);  // 하트비트 전송
            }
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

## 연결 관리

### 재연결 (Reconnect)

상대 서버가 다운되거나 네트워크가 끊겼을 때 자동으로 재접속. 즉시 재시도하면 서버에 부하를 줄 수 있으므로 **exponential backoff**(점진적 대기 시간 증가)를 적용한다.

```java
public class ReconnectHandler extends ChannelInboundHandlerAdapter {

    private final Bootstrap bootstrap;
    private int retryCount = 0;
    private static final int MAX_RETRY_DELAY = 30;

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        int delay = Math.min((int) Math.pow(2, retryCount), MAX_RETRY_DELAY);
        ctx.channel().eventLoop().schedule(() -> {
            bootstrap.connect().addListener((ChannelFutureListener) f -> {
                if (f.isSuccess()) {
                    retryCount = 0;
                } else {
                    retryCount++;
                }
            });
        }, delay, TimeUnit.SECONDS);
    }
}
```

### Heartbeat (IdleStateHandler)

일정 시간 동안 데이터 교환이 없으면 연결이 살아있는지 확인하는 패킷을 주고받는 것. 전화를 걸어놓고 아무 말 없으면 "여보세요?" 하고 확인하는 것과 같다.

```java
// 파이프라인에 추가
p.addLast(new IdleStateHandler(30, 10, 0));
// 30초 동안 읽기 없으면 → READER_IDLE (상대가 죽었나? → 연결 끊기)
// 10초 동안 쓰기 없으면 → WRITER_IDLE (하트비트 보내기)
// 세 번째 인자: ALL_IDLE (읽기+쓰기 모두 없으면)
```

### 타임아웃 정리

| 타임아웃 | 설정 방법 | 의미 |
|---|---|---|
| 연결 타임아웃 | `CONNECT_TIMEOUT_MILLIS` | 서버에 연결하는 데 걸리는 최대 시간 |
| 읽기 유휴 | `IdleStateHandler(readerIdle, 0, 0)` | 데이터 수신 없는 시간 감지 |
| 쓰기 유휴 | `IdleStateHandler(0, writerIdle, 0)` | 데이터 송신 없는 시간 감지 |

## SSL/TLS

Netty는 `SslHandler`를 Pipeline 맨 앞에 추가하여 암호화 통신을 지원한다.

```java
// 클라이언트 SSL
SslContext sslCtx = SslContextBuilder.forClient()
    .trustManager(InsecureTrustManagerFactory.INSTANCE)  // 개발용 — 운영에서는 실제 인증서 사용
    .build();

ch.pipeline().addFirst(sslCtx.newHandler(ch.alloc(), host, port));  // 맨 앞에 추가

// 서버 SSL
SslContext sslCtx = SslContextBuilder.forServer(certFile, keyFile).build();
ch.pipeline().addFirst(sslCtx.newHandler(ch.alloc()));
```

## 로깅 / 디버깅

### LoggingHandler

Pipeline에 추가하면 모든 I/O 이벤트와 데이터를 로깅한다. 개발 중 프로토콜 디버깅에 매우 유용.

```java
// 전체 파이프라인 로깅
p.addLast(new LoggingHandler(LogLevel.DEBUG));

// 특정 위치에 추가하여 해당 시점의 데이터 확인
p.addLast(new FrameDecoder());
p.addLast(new LoggingHandler(LogLevel.TRACE));  // 디코딩 후 데이터 확인
p.addLast(new BusinessHandler());
```

### 메모리 누수 탐지

```bash
# JVM 옵션으로 누수 탐지 레벨 설정
-Dio.netty.leakDetection.level=PARANOID   # 개발: 모든 ByteBuf 추적 (느림)
-Dio.netty.leakDetection.level=SIMPLE     # 운영 기본값: 샘플링으로 추적
-Dio.netty.leakDetection.level=DISABLED   # 비활성화
```

## Spring Boot 통합

Netty는 Spring과 별개 라이브러리이므로 **Bean으로 등록하여 라이프사이클을 관리**한다. Spring이 해주는 건 시작/종료 관리 정도이고, TCP 통신 로직은 전부 Netty API로 작성한다.

```java
@Component
@RequiredArgsConstructor
public class TcpClient {

    private final TcpClientProperties properties;
    private Channel channel;
    private EventLoopGroup group;

    @PostConstruct
    public void init() {
        group = new NioEventLoopGroup();
        Bootstrap bootstrap = new Bootstrap()
            .group(group)
            .channel(NioSocketChannel.class)
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, properties.getConnectTimeout())
            .option(ChannelOption.TCP_NODELAY, true)
            .handler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel ch) {
                    ch.pipeline()
                      .addLast(new CustomProtocolDecoder())
                      .addLast(new CustomProtocolEncoder())
                      .addLast(new IdleStateHandler(30, 10, 0))
                      .addLast(new BusinessHandler());
                }
            });

        bootstrap.connect(properties.getHost(), properties.getPort())
                 .addListener((ChannelFutureListener) f -> {
                     if (f.isSuccess()) {
                         channel = f.channel();
                     }
                 });
    }

    public void send(CustomMessage message) {
        if (channel != null && channel.isActive()) {
            channel.writeAndFlush(message);
        }
    }

    @PreDestroy
    public void destroy() throws InterruptedException {
        if (channel != null) channel.close().sync();
        if (group != null) group.shutdownGracefully().sync();
    }
}
```

```yaml
# application.yml
tcp:
  host: 192.168.0.100
  port: 9090
  connect-timeout: 5000
```

```java
@ConfigurationProperties(prefix = "tcp")
@Getter @Setter
public class TcpClientProperties {
    private String host;
    private int port;
    private int connectTimeout;
}
```

## 커스텀 TCP 프로토콜 연동 체크리스트

```
1. 전문 규격서 분석
   □ 프레임 구분 방식 (길이 기반 / 구분자 / 고정 길이)
   □ 인코딩 (UTF-8 / EUC-KR)
   □ 바이트 오더 (Big Endian / Little Endian)
   □ 헤더 구조 (공통 필드, 전문코드, 길이, 응답코드)
   □ 하트비트 규격 (주기, 전문 형태)

2. 프로토콜 객체 설계
   □ Header / Body / Message 클래스 정의

3. Codec 구현
   □ Decoder (바이트 → 객체, 프레이밍 처리)
   □ Encoder (객체 → 바이트)

4. Handler 구현
   □ 비즈니스 로직
   □ 요청-응답 매핑 (요청 보내고 응답 기다리기)

5. 연결 관리
   □ 재연결 (exponential backoff)
   □ Heartbeat (IdleStateHandler)
   □ 타임아웃 (연결 / 읽기 / 쓰기)
   □ SSL/TLS (필요 시)
   □ Graceful Shutdown

6. Spring Boot 통합
   □ Bean 등록 (@PostConstruct / @PreDestroy)
   □ 설정 외부화 (application.yml)
   □ 로깅 (LoggingHandler)
   □ 모니터링
```

## 참고

- https://netty.io/wiki/user-guide-for-4.x.html
- https://www.baeldung.com/netty
