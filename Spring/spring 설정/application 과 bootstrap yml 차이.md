# application.yml과 bootstrap.yml 차이

> 최종 업데이트: 2026-03-23 | 기준: Spring Boot 3.4, Spring Cloud 2024.0

## 개요

| 구분 | 컨텍스트 | 로드 시점 | 주요 용도 |
|------|----------|-----------|-----------|
| `bootstrap.yml` | 부트스트랩 컨텍스트 (부모) | 먼저 로드 | 외부 설정 서버 접속, 암호화 설정 |
| `application.yml` | 메인 애플리케이션 컨텍스트 | 이후 로드 | 서버 포트, DB, 로깅 등 일반 설정 |

- Spring Boot 3.x에서는 bootstrap.yml이 자동 로드되지 않으며, `spring.config.import` 방식이 권장된다.

## application.yml

애플리케이션 전반의 설정을 정의한다.

```yaml
server:
  port: 8080

spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: password
  config:
    import: "configserver:http://config-server:8888"  # Config 서버 연동 (권장 방식)

logging:
  level:
    root: INFO
    com.example: DEBUG
```

`spring.config.import`는 Config 서버 외에도 다양한 소스를 지원한다.

```yaml
spring:
  config:
    import:
      - "configserver:http://config-server:8888"
      - "vault://secret/my-app"          # HashiCorp Vault
      - "consul:localhost:8500"           # Consul
      - "optional:file:./extra.yml"       # 로컬 파일 (없어도 에러 안남)
```

## bootstrap.yml (레거시)

메인 컨텍스트 로드 전에 필요한 초기 설정을 정의한다. Spring Boot 3.x에서 사용하려면 별도 의존성이 필요하다.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: my-service
  cloud:
    config:
      uri: http://config-server:8888
      fail-fast: true

encrypt:
  key: my-secret-key
```

## 원격 설정 우선순위

bootstrap.yml 또는 `spring.config.import`를 통해 Config 서버에서 가져온 원격 설정은 `PropertySource` 우선순위가 높게 등록된다. 따라서 application.yml에 동일한 키가 있어도 원격 설정값이 우선 적용된다.

| 속성 | 기본값 | 설명 |
|------|--------|------|
| `spring.cloud.config.override-none` | `false` | `true` 시 로컬 설정이 원격보다 우선 |
| `spring.cloud.config.allow-override` | `true` | `false` 시 원격 설정을 로컬에서 재정의 불가 |

```yaml
spring:
  cloud:
    config:
      override-none: true  # 로컬 설정 우선 적용
```
