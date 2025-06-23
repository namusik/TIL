# Tomcat

## 개념
- 가장 널리 쓰이는 오픈소스 **서블릿 컨테이너**이자 **WAS**
  - Java 진영에서는 WAS를 좀 더 구체적으로 **서블릿 컨테이너(Servlet Container)** 라고 부름.
  - 서블릿 컨테이너 : HTTP 요청을 받아 서블릿 클래스를 로딩·실행·수명 관리하고, 응답까지 책임지는 런타임 환경
- Jakarta Servlet·JSP·WebSocket 등 핵심 규격을 구현
- 스프링부트 애플리케이션 JAR 내부에 Tomcat 라이브러리를 포함
- 별도 WAS 설치·운영 없이도 java -jar 한 줄로 서비스가 구동 가능
- **spring-boot-starter-web** 의존성을 추가하면 Boot가 **TomcatServletWebServerFactory**를 자동 등록해 8080 포트의 내장 서버를 생성

## Spring Boot와 Tomcat

- 과거 : Tomcat을 직접 설치
  - 개발자가 Java 코드를 WAR 형식으로 압축
  - 서버에 Tomcat 소프트웨어 직접 설치/실행
  - WAR 파일을 Tomcat의 특정 폴더에 복사
  - Tomcat이 WAR 파일을 인식해서 웹 애플리케이션 실행
  
- 현재  : Spring Boot 내장
  - build.gradle에 `spring-boot-starter-web` 의존성을 추가
  - 의존성 안에는 **경량화된 Tomcat**이 라이브러리 형태로 포함되어 있음
  - Spring Boot 애플리케이션을 실행하면 내장된 Tomcat을 스스로 실행하고 애플리케이션을 그 위에서 동작시킴

```sh
... o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) ...
... o.s.b.SpringApplication                  : Started SpringApplication in ...
```


## Tomcat 역할
- 포트 리스닝
  - 기본 8080(또는 server.port)에 소켓을 열고 커넥션을 수락합니다. ￼
- 서블릿 파이프라인 실행
  - 디스패처 서블릿을 통해 컨트롤러 매핑, 필터, 인터셉터 등을 호출합니다. ￼
- 스레드풀 관리
  - server.tomcat.threads.* 설정으로 워커 스레드 수·백로그를 조정해 동시 요청을 처리합니다. (앞선 대화에서 설명한 톰캣 스레드풀)
- 정적 리소스 제공·압축·HTTPS
  - boot-starter-web은 Tomcat의 StaticFile 서블릿·HTTP/2·TLS 처리기를 그대로 사용합니다. ￼

## Tomcat 쓰레드 풀

- Acceptor → Poller(NIO) → Worker (Executor) 3단 구조로 동작
- `Acceptor` 스레드가 TCP 연결을 받아 `Poller` 스레드(비차단 커넥터만 해당)가 keep-alive 소켓을 감시하고, 실제 요청-응답은 `Worker` 스레드가 처리
- Acceptor 스레드
  - 각 Connector(HTTP/1.1, HTTP/2, AJP 등)마다 1-2개의 Acceptor가 커널 listen 소켓을 accept() 한 뒤 새 소켓을 Poller/큐에 넘긴다.
- Poller 스레드(NIO · NIO2 전용)
  - Selector 기반 Poller가 수백~수천 개의 keep-alive 연결을 한 스레드로 감시하고, 읽을 데이터가 생기면 작업을 Worker 풀에 제출
- Worker(요청-처리) 스레드
  - 요청당 1 스레드를 점유해 서블릿 체인을 끝까지 실행
  - 최대 동시 개수를 maxThreads로 제한하며, 풀 가용 스레드가 고갈될 경우 OS 레벨 큐(백로그)가 acceptCount 만큼 쌓임.

## Spring Boot 설정 코드

```yaml
server:
  port: 8081 # 기본 8080 대신 8081 포트로 서버를 시작합니다.
```

```yaml
server:
  servlet:
    context-path: /my-app # http://localhost:8080/my-app/hello 와 같이 접근
```
- 애플리케이션의 기본 URL 경로를 설정합니다. / 외의 경로를 사용하면 애플리케이션의 모든 엔드포인트 앞에 해당 경로가 붙는다.


```yaml

server:
  tomcat:
    threads:
      max: 200 # 최대 200개의 스레드 동시 처리 가능 (기본값: 200)
      min-spare: 10 # 최소 10개의 스레드는 항상 준비 상태로 유지 (기본값: 10)
      accept-count: 100 # 최대 100개의 요청을 대기열에 쌓을 수 있습니다. (기본값: 100)
      max-connections: 8192 # 기본값 그대로 또는 필요에 따라 조절. (너무 낮추면 동시 접속자 수에 제한)
  compression:
    enabled: true # HTTP 응답 압축 활성화 (기본값: false)
    mime-types: application/json,application/xml,text/html,text/xml,text/plain,text/css,text/javascript # 압축할 MIME 타입 지정
    min-response-size: 1024 # 최소 응답 크기 (바이트). 이보다 작은 응답은 압축하지 않음 (기본값: 2048)
```
- 스레드 풀 설정 (Thread Pool)
  - Tomcat은 클라이언트의 요청을 처리하기 위해 스레드 풀을 사용한다.
  - 이 스레드 풀의 크기는 서버의 동시 요청 처리 능력에 직접적인 영향을 미침.
  - server.tomcat.threads.max: 
    - **요청을 처리할 최대 스레드 수**. 
    - 이 값을 너무 낮게 설정하면 동시 요청이 많을 때 병목 현상이 발생하고, 너무 높게 설정하면 서버 자원(메모리, CPU)을 과도하게 소모할 수 있음.
    - 일반적으로 CPU 코어 수의 2배 ~ 4배 정도를 기준으로 시작하여 부하 테스트를 통해 최적화합니다. (예: 4코어 CPU면 8~16 정도)
  - server.tomcat.threads.min-spare: 
    - 최소 유휴 스레드 수. 
    - 항상 대기하고 있는 스레드 수. 
    - 요청이 없을 때도 이 스레드 수는 유지됨. 
    - 너무 낮으면 요청이 갑자기 몰릴 때 스레드 생성 오버헤드가 발생할 수 있다.
  - **동시 사용자 수**와 **개별 요청 처리 시간**에 따라 신중하게 결정해야 한다.
    - 요청 처리 시간이 짧은(ms 단위) API 위주라면 더 많은 스레드가 유리할 수 있고, 요청 처리 시간이 긴(수 초 이상) API가 많다면 스레드 수를 너무 늘리는 것이 오히려 서버 과부하를 유발
- 연결 대기열 설정
  - server.tomcat.accept-count: 
    - 최대 대기열 크기.
    - 스레드 풀이 모두 바쁠 때, 이 값만큼의 요청은 큐에 쌓여 대기함.
    - 이 값을 초과하는 요청은 즉시 거부됩니다 (connection refused).
  - max-threads와 함께 조절해야 합니다. 스레드가 부족할 때 너무 많은 요청을 큐에 쌓으면 클라이언트 입장에서는 응답이 늦어지는 것처럼 느껴지고, 큐가 가득 차면 요청이 거부됨.
- 연결 제한 설정
  - server.tomcat.max-connections: 
    - Tomcat이 받아들일 수 있는 최대 동시 연결 수. 
    - 이 연결에는 HTTP 요청뿐만 아니라 Keep-Alive 연결, WebSocket 연결 등 모든 유형의 연결이 포함됩니다. (기본값: 8192)
  - 이 값은 물리적인 네트워크 자원과 max-threads 값보다 훨씬 커야 합니다. 하나의 스레드가 여러 연결을 처리할 수 있기 때문
- 압축 설정
  - 대용량 JSON/HTML/JS 파일을 전송할 때 네트워크 성능 향상에 매우 효과적
  - 하지만 압축/압축 해제에 CPU 자원이 소모되므로, 작은 파일에는 오버헤드가 더 클 수 있어 min-response-size를 조절하는 것이 좋다.


## Tomcat 모니터링

-  반드시 부하 테스트(Load Testing)를 수행하면서 모니터링하고, 반복적으로 튜닝하는 과정이 필요
 
## 모니터링 설정 

```yaml
server:
  tomcat:
    mbeanregistry:
      enabled: true
    mbean-names: # MBean 이름을 Spring Boot가 예상하지 못하게 바꾼 경우
      web-connector: tomcat.connector:name="http-nio-8080" # Tomcat 커넥터의 JMX MBean 이름 지정
```
- Tomcat 지표를 Prometheus-Micrometer로 스크랩하려면, 핵심은 **Tomcat MBean Registry를 켜는 것**
  - Spring Boot 2.1+부터 기본값이 false
  - https://docs.spring.io/spring-boot/reference/actuator/metrics.html?utm_source=chatgpt.com#actuator.metrics.supported.tomcat
- (선택사항) 
  - MBean 이름을 Spring Boot가 예상하지 못하게 바꾼 경우에만 필요
  - Micrometer에게 Tomcat 웹 커넥터의 지표를 어떤 JMX MBean을 통해 가져와야 하는지 알려주는 역할
  - tomcat.connector: JMX MBean의 도메인 이름입니다.
  - name="http-nio-8080": Tomcat의 기본 HTTP 커넥터 이름. 8080 포트로 NIO 방식의 HTTP 연결을 처리하는 커넥터라는 의미.

### 모니터링 핵심 지표

#### Tomcat/JVM 관련 지표 (Application Monitoring)

- 이 지표들은 Spring Boot Actuator와 Micrometer를 통해 쉽게 노출되며, Prometheus/Grafana 또는 APM(Application Performance Monitoring) 툴(New Relic, Dynatrace, Datadog 등)로 수집/시각화 가능
- HTTP 요청 처리 지표:
  - http.server.requests.count: 특정 시간 동안 처리된 총 요청 수 (TPS 계산용).
  - http.server.requests.max: 요청 처리 시간의 최대값 (ms).
  - http.server.requests.avg: 요청 처리 시간의 평균값 (ms).
  - http.server.requests.active: 현재 처리 중인 요청 수.
  - http.server.requests.duration.max: 가장 긴 요청 처리 시간 (분위수 P90, P95, P99 등을 함께 보는 것이 좋음).
  - 주요 모니터링: 요청 처리 시간 (Latency)의 P99 값 (가장 느린 1% 요청의 시간), 초당 요청 수 (TPS). 이 두 가지가 가장 중요합니다.
- Tomcat 스레드 풀 지표:
  - tomcat.threads.current: 현재 활성 스레드 수.
  - tomcat.threads.max: 설정된 최대 스레드 수.
  - tomcat.threads.busy: 현재 요청을 처리 중인 스레드 수.
  - tomcat.connections.current: 현재 열려 있는 HTTP 연결 수.
  - 주요 모니터링: tomcat.threads.current가 tomcat.threads.max에 지속적으로 도달하는지 여부. 도달한다면 스레드 부족을 의심할 수 있습니다.
- JVM (Java Virtual Machine) 지표:
  - Heap Memory Usage: 사용 중인 힙 메모리 양.
  - Garbage Collection (GC) Activity: GC 발생 횟수, GC 소요 시간.
  - CPU Usage (JVM Process): JVM이 사용하는 CPU 비율.
  - 주요 모니터링: GC 일시정지(Pause) 시간. GC Pause가 길어지면 요청 처리가 멈춰서 응답 시간이 급격히 늘어납니다. 힙 메모리가 계속 증가하면 메모리 누수를 의심합니다.

#### EKS Pod/Node 관련 지표 (Infra Monitoring)
- Kubernetes 대시보드, kubectl top, Prometheus/Grafana (cAdvisor, kube-state-metrics) 또는 AWS CloudWatch/Container Insights로 모니터링
- Pod CPU Utilization: Pod가 사용 중인 CPU 코어 비율 (할당된 requests 대비 limits 대비).
- Pod Memory Utilization: Pod가 사용 중인 메모리 양 (할당된 requests 대비 limits 대비).
- Node CPU/Memory Utilization: Pod가 배포된 Worker Node의 전체 CPU/메모리 사용률.
- Network I/O: Pod의 네트워크 수신/송신 트래픽.
- 주요 모니터링:
  - CPU/메모리 Limit 도달 여부: Pod가 할당된 limit에 도달하면 throttling이 발생하여 성능 저하로 이어집니다.
  - Pod 재시작 여부: OOMKilled (Out Of Memory Killed) 등 비정상 종료는 없는지 확인합니다.

### Tomcat 설정 개선 포인트

- server.tomcat.threads.max (최대 스레드 수)
  - 초기값: EKS Pod에 할당된 CPU 코어 수의 2배 ~ 4배 (I/O 바운드 앱) 또는 1배 ~ 2배 (CPU 바운드 앱)를 시작으로 합니다. 예: Pod에 4코어 할당 -> 시작 값 100~200
  - 튜닝:
    - 모니터링: **tomcat.threads.current**가 max 값에 자주 도달하고, 동시에 CPU 사용률이 여유가 있다면 max 값을 늘려보세요.
    - 주의: CPU 사용률이 이미 높거나, GC Pause가 길어지는데 스레드만 늘리면 스레드 컨텍스트 스위칭 오버헤드로 오히려 성능이 떨어질 수 있습니다. 
      - 스레드 수는 애플리케이션의 평균 요청 처리 시간과 밀접한 관련이 있습니다. (예: 1개 요청 100ms, 2000 TPS = 2000 * 0.1 = 200 동시 요청이 필요. 여기에 여유분 고려)
    - 너무 높게 설정하면 메모리 사용량이 늘어나 OOM(Out Of Memory) 발생 가능성이 있습니다.
- server.tomcat.threads.min-spare (최소 유휴 스레드 수)
  - 목표: 급작스러운 트래픽 증가 시 스레드 생성 오버헤드를 줄여 초기 응답 지연을 방지합니다.
  - 초기값: max 값의 10~20% 정도로 설정.
  - 튜닝: 트래픽 패턴이 스파이크성이라면 조금 더 높게 설정할 수 있습니다.
- server.tomcat.accept-count (연결 대기열 크기)
  - 목표: 스레드 풀이 모두 바쁠 때, 요청이 즉시 거부되지 않고 잠시 대기할 수 있도록 합니다.
  - 초기값: max-threads 값 또는 그 절반 정도.
  - 튜닝: 부하 테스트 시 Connection Refused 에러가 발생하거나 max-threads에 도달했을 때 요청이 즉시 드롭된다면 이 값을 늘려볼 수 있다.
    - 하지만 이 값이 너무 크면 클라이언트 입장에서는 응답이 한참 뒤에 오거나 결국 타임아웃되어 좋지 않은 사용자 경험을 제공. 이는 임시적인 완화책이지 근본적인 스레드 부족 해결책은 아니다.
- server.tomcat.max-connections (최대 동시 연결 수)
  - 목표: Tomcat이 동시에 유지할 수 있는 물리적인 TCP 연결의 최대 수.
  - 초기값: Spring Boot의 기본값(8192)은 충분히 높습니다.
  - 튜닝: 이 값에 도달하는 경우는 매우 드뭅니다. max-threads보다 훨씬 큰 값을 유지해야 합니다. 일반적으로 max-threads를 먼저 늘리는 것이 우선입니다.
- server.compression.enabled (HTTP 응답 압축)
  - 목표: 네트워크 대역폭 절약 및 응답 시간 단축.
  - 튜닝:
    - enabled: true로 설정하고, 압축할 mime-types를 명확히 지정합니다.
    - min-response-size를 적절히 설정하여 작은 응답에 대한 압축 오버헤드를 피합니다.
  - 모니터링: 압축 시 CPU 사용량이 증가할 수 있으므로, 활성화 후 CPU 사용률을 반드시 확인해야 합니다. 만약 CPU가 이미 병목이라면 압축을 끄는 것이 좋습니다.


## 출처 
https://www.baeldung.com/java-web-thread-pool-config
