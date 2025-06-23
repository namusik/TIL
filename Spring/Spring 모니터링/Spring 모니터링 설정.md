# Spring 모니터링

## Spring Boot Actuator와 Micrometer
Spring Boot 애플리케이션에서 위 지표들을 노출하기 위한 핵심은 Actuator와 Micrometer입니다.
Spring Boot Actuator: Spring Boot 애플리케이션의 운영 정보를 모니터링하고 관리하는 데 사용되는 모듈입니다. 기본적인 헬스 체크, 환경 정보, 메트릭스(지표) 등을 HTTP 엔드포인트나 JMX를 통해 제공합니다.
Micrometer: JVM 기반 애플리케이션에서 메트릭스를 수집하기 위한 벤더 중립적인(vendor-neutral) 애플리케이션 메트릭스 파사드(facade)입니다. Micrometer를 사용하면 애플리케이션 코드에 특정 모니터링 시스템(Prometheus, Datadog 등) 종속성을 심지 않고도 다양한 모니터링 시스템으로 메트릭스를 전송할 수 있습니다. Spring Boot는 Micrometer를 내장하고 자동으로 많은 지표들을 수집합니다.

```gradle
// Gradle (build.gradle)
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator' // Spring Boot 애플리케이션은 런타임에 액추에이터 엔드포인트(예: /actuator/health, /actuator/metrics)를 자동으로 노출
    runtimeOnly 'io.micrometer:micrometer-registry-prometheus' // Micrometer가 수집한 모든 메트릭스를 Prometheus가 스크랩할 수 있는 형식으로 /actuator/prometheus 엔드포인트에서 노출
}
```
## 톰캣 지표 설정

```yaml
server:
  tomcat:
    mbean-names:
      web-connector: tomcat.connector:name="http-nio-8080" # Tomcat 커넥터의 JMX MBean 이름 지정
```
- Tomcat의 상세 지표를 수집하려면, Micrometer가 Tomcat의 JMX MBean에 접근할 수 있도록 mbean-names.web-connector 설정을 추가해야 함.
- Micrometer에게 Tomcat 웹 커넥터의 지표를 어떤 JMX MBean을 통해 가져와야 하는지 알려주는 역할
  - tomcat.connector: JMX MBean의 도메인 이름입니다.
  - name="http-nio-8080": Tomcat의 기본 HTTP 커넥터 이름. 8080 포트로 NIO 방식의 HTTP 연결을 처리하는 커넥터라는 의미.


```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*" # 모든 엔드포인트 노출 (운영 환경에서는 필요한 것만 노출하는 것이 보안상 좋음)
        # 또는 include: "health,info,metrics,prometheus" 등으로 특정 엔드포인트만 노출
  metrics:
    tags: # Pod나 서비스 구분용 태그 추가 (선택 사항)
      application: my-spring-boot-app
```

- Spring Boot 애플리케이션이 실행될 때 /actuator/metrics 엔드포인트에서 다양한 지표를 JSON 형태로 확인할 수 있습니다.
http://localhost:8080/actuator/metrics : 사용 가능한 모든 메트릭스 이름 목록
http://localhost:8080/actuator/metrics/http.server.requests : HTTP 요청 관련 지표
http://localhost:8080/actuator/metrics/tomcat.threads.current : Tomcat 스레드 관련 지표
http://localhost:8080/actuator/metrics/jvm.memory.used : JVM 메모리 사용량

