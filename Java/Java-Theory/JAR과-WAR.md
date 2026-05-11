# JAR과 WAR

> 최종 업데이트: 2026-03-28 | Spring Boot 3.x / Java 21 기준

## 개념

Java 애플리케이션을 **패키징하여 배포**하기 위한 압축 파일 형식.

- 이사 짐 포장에 비유하면: **JAR**은 가전·가구·소품을 한 박스에 넣은 것(어디서든 바로 사용 가능), **WAR**은 인테리어 자재를 포장한 것(건물(WAS)에 설치해야 사용 가능)
- 둘 다 내부적으로는 **ZIP 형식**이며, `jar` 명령어로 생성

## JAR (Java Archive)

Java 클래스, 리소스, 메타데이터를 하나로 묶은 범용 아카이브.

- **JRE(JVM)만 있으면 독립 실행 가능** — 별도 서버 불필요

```sh
java -jar myapp.jar
```

### JAR 내부 구조

```
myapp.jar
├── META-INF/
│   └── MANIFEST.MF          ← 메타데이터 (Main-Class, 버전 등)
├── com/
│   └── example/
│       └── MyApp.class       ← 컴파일된 클래스 파일
├── application.yml           ← 설정 파일
└── lib/                      ← (Fat JAR) 의존 라이브러리
```

### MANIFEST.MF

JAR의 메타 정보를 담는 파일. `Main-Class`를 지정하면 `java -jar`로 실행 가능.

```
Manifest-Version: 1.0
Main-Class: com.example.MyApp
Class-Path: lib/spring-core.jar lib/jackson.jar
```

### JAR의 종류

| 종류 | 설명 | 비유 |
|------|------|------|
| **Thin JAR** | 내 코드만 포함, 의존성은 외부 참조 | 가방에 내 옷만 넣고, 세면도구는 호텔 것 사용 |
| **Fat JAR (Uber JAR)** | 모든 의존 라이브러리를 함께 포장 | 옷·세면도구·간식까지 전부 가방에 넣음 |
| **Executable JAR** | `Main-Class` 지정으로 `java -jar`로 실행 가능한 JAR | 전원만 꽂으면 바로 동작하는 가전 |

## WAR (Web Application Archive)

**웹 애플리케이션 전용** 아카이브. **서블릿 컨테이너(WAS)에 배포**해야 실행됨.

- WAR 자체로는 실행 불가 — Tomcat, Jetty 같은 WAS에 올려야 동작
- 건물(WAS) 안에 설치해야 작동하는 인테리어 자재와 같음

```
WAR 파일 → WAS(Tomcat 등)에 배포 → WAS가 압축 해제 후 실행
```

### WAR 내부 구조

```
myapp.war
├── META-INF/
│   └── MANIFEST.MF
├── WEB-INF/                   ← WAR 고유 디렉토리 (외부 직접 접근 불가)
│   ├── web.xml                ← 서블릿 설정 (배치 기술자)
│   ├── classes/               ← 컴파일된 클래스 파일
│   │   └── com/example/...
│   └── lib/                   ← 의존 라이브러리 JAR
├── index.html                 ← 정적 리소스 (외부 접근 가능)
├── css/
└── js/
```

- **WEB-INF/**: 서블릿 컨테이너만 접근 가능한 보안 영역. 클라이언트가 URL로 직접 접근 불가
- **web.xml**: 서블릿 매핑, 필터, 리스너 등을 정의하는 배치 기술자 (Deployment Descriptor)

## JAR vs WAR 비교

| 구분 | JAR | WAR |
|------|-----|-----|
| 용도 | 범용 (라이브러리, 독립 실행 앱) | 웹 애플리케이션 전용 |
| 실행 방식 | `java -jar` (독립 실행) | WAS에 배포 (Tomcat, Jetty 등) |
| WAS 필요 여부 | 불필요 (내장 가능) | **필수** |
| 웹 자원 (JSP 등) | 제한적 지원 | 완전 지원 |
| 구조 | `META-INF/` + 클래스/리소스 | `WEB-INF/` + 정적 리소스 포함 |
| 배포 단위 | 단일 파일 실행 | WAS의 webapps 디렉토리에 복사 |

## Spring Boot의 Executable JAR

Spring Boot는 **내장 톰캣을 포함한 Fat JAR**로 패키징하여, WAR 없이 독립 실행이 가능.

- 과거: 코드(WAR) + 서버(Tomcat) 별도 관리 → 지금: 코드 + 서버를 하나(JAR)로 합침

```
Spring Boot Executable JAR
├── META-INF/
│   └── MANIFEST.MF            ← Main-Class: JarLauncher
├── BOOT-INF/
│   ├── classes/               ← 내 애플리케이션 코드
│   │   ├── com/example/...
│   │   └── application.yml
│   └── lib/                   ← 의존 라이브러리 (spring-web, tomcat-embed 등)
└── org/springframework/boot/
    └── loader/                ← Spring Boot의 JAR 로더
```

```sh
# 빌드
./gradlew bootJar      # Gradle
mvn package             # Maven

# 실행 — Tomcat 별도 설치 없이 바로 실행
java -jar myapp.jar
```

### Spring Boot에서 WAR가 필요한 경우

| 상황 | 이유 |
|------|------|
| JSP 사용 | 내장 톰캣에서 JSP 지원이 제한적 (외장 WAS 권장) |
| 기존 WAS 인프라 | 사내 정책상 외장 Tomcat/WebLogic/JBoss 등을 사용해야 하는 경우 |
| 하나의 WAS에 여러 앱 배포 | 한 Tomcat 인스턴스에 여러 WAR를 올리는 구조 |

```java
// WAR 배포를 위한 Spring Boot 설정
@SpringBootApplication
public class MyApp extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(MyApp.class);
    }
}
```

```groovy
// build.gradle
plugins {
    id 'war'
}
// providedRuntime: WAR 배포 시 내장 톰캣 제외
providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'
```

## 현대 배포 방식 흐름

```
전통 방식:  WAR → 외장 WAS (Tomcat, WebLogic) → 물리 서버
    ↓
Spring Boot: Executable JAR (내장 Tomcat) → 물리/VM 서버
    ↓
컨테이너:   Executable JAR → Docker 이미지 → Kubernetes
    ↓
네이티브:   GraalVM Native Image → 컨테이너 (빠른 시작, 적은 메모리)
```

- 현재 **신규 프로젝트 대부분은 JAR (Spring Boot Executable JAR) 방식**을 채택
- WAR는 레거시 시스템이나 JSP 기반 프로젝트에서 주로 사용

## EAR (Enterprise Archive)

EJB(Enterprise JavaBeans) 기반의 Java EE 엔터프라이즈 애플리케이션 아카이브.

- JAR + WAR + EJB 모듈을 하나로 묶은 상위 패키지
- Java EE 풀 프로파일 서버(WildFly, WebLogic 등)에 배포
- **현재는 거의 사용하지 않음** — 마이크로서비스 + Spring Boot JAR로 대체됨

## 관련 문서

- [JDK](./JDK.md)
- [JVM](./JVM.md)
