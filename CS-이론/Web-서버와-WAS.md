# Web Server와 WAS

> 최종 업데이트: 2026-03-24

## 개요

| 구분 | 역할 | 제공 콘텐츠 | 예시 |
|------|------|------------|------|
| Web Server | 정적 파일 제공, 리버스 프록시 | HTML, CSS, JS, 이미지 | Nginx, Apache |
| WAS | 비즈니스 로직 실행, 동적 콘텐츠 생성 | API 응답, DB 조회 결과 | Tomcat, Jetty, Undertow |

## Web Server

클라이언트의 HTTP 요청을 받아 **정적 콘텐츠**를 반환하는 서버. 누가 언제 요청해도 동일한 파일을 제공한다.

### 주요 Web Server

| 서버 | 특징 |
|------|------|
| **Nginx** | 이벤트 기반 비동기 처리, 높은 동시 처리 성능, 현재 점유율 1위 |
| **Apache HTTP Server** | 프로세스/스레드 기반, 오랜 역사와 풍부한 모듈 |

### 역할

- 정적 파일 서빙 (HTML, CSS, JS, 이미지)
- 리버스 프록시 (WAS 앞단에서 요청 중계)
- SSL 터미네이션, 로드 밸런싱, 캐싱, gzip 압축

## WAS (Web Application Server)

클라이언트 요청에 대해 **프로그래밍 로직을 실행**하여 동적 콘텐츠를 생성하는 서버.

### 주요 WAS (Java 기준)

| 서버 | 특징 |
|------|------|
| **Tomcat** | Apache 재단, Servlet/JSP 구현체, Spring Boot 기본 내장 WAS |
| **Jetty** | Eclipse 재단, 경량, 임베디드 사용에 적합 |
| **Undertow** | Red Hat(JBoss), 논블로킹 기반, 높은 성능 |

### Spring Boot와 WAS의 관계

```
Spring Boot ≠ WAS
Spring Boot = 프레임워크 + 내장 WAS(Tomcat)
```

- Spring Boot 프로젝트에 **Embedded Tomcat**이 포함되어 있어 별도 WAS 설치 없이 `java -jar`로 실행 가능
- 내장 WAS는 변경 가능하다

```groovy
// Tomcat 제외하고 Undertow로 변경
implementation('org.springframework.boot:spring-boot-starter-web') {
    exclude module: 'spring-boot-starter-tomcat'
}
implementation 'org.springframework.boot:spring-boot-starter-undertow'
```

## 일반적인 아키텍처

### Web Server + WAS 분리 구조 (권장)

```
Client
  ↓ (HTTPS)
Nginx (Web Server)
  ├── 정적 파일 → 직접 응답 (/static, /images)
  ├── SSL 터미네이션
  ├── 로드 밸런싱
  └── 동적 요청 → proxy_pass
          ↓ (HTTP)
     ┌─── Tomcat 1 (WAS)
     ├─── Tomcat 2 (WAS)
     └─── Tomcat 3 (WAS)
              ↓
           Database
```

### WAS 단독 구조

```
Client → Tomcat (Spring Boot) → Database
```

- 소규모 서비스나 개발 환경에서 사용
- WAS가 정적 파일 서빙, SSL 처리까지 모두 담당 → 부하 증가

### 왜 분리하는가?

| 이유 | 설명 |
|------|------|
| **WAS 부하 감소** | 정적 파일, SSL 처리를 Web Server가 대신 담당 |
| **보안** | WAS를 외부에 직접 노출하지 않음, 서버 정보 은닉 |
| **확장성** | WAS만 수평 확장(scale-out)하고 Web Server가 로드 밸런싱 |
| **무중단 배포** | Web Server 뒤에서 WAS를 순차적으로 교체 가능 |
| **장애 격리** | WAS 하나가 죽어도 Web Server가 다른 WAS로 요청 분배 |

## Servlet Container vs WAS

| 구분 | 설명 | 예시 |
|------|------|------|
| Servlet Container | Servlet/JSP만 실행하는 경량 컨테이너 | Tomcat, Jetty |
| Full WAS | Servlet + EJB, JMS, JTA 등 Java EE 전체 스펙 지원 | WildFly, WebLogic, WebSphere |

- Tomcat은 엄밀히 **Servlet Container**이지만, Spring Boot와 함께 사용하면 WAS 역할을 충분히 수행한다
- Full Java EE 스펙이 필요한 경우가 아니면 Tomcat으로 충분하다
