# Java 특징

> 최종 업데이트: 2026-03-28 | Java 21 기준

## 역사

| 시기 | 사건 |
|------|------|
| 1991 | Sun Microsystems에서 **제임스 고슬링(James Gosling)** 이 "Green Project"로 시작 (원래 이름: Oak) |
| 1995 | Java 1.0 발표, "Write Once, Run Anywhere" 슬로건 |
| 1996 | JDK 1.0 정식 출시 |
| 2006 | Java를 **오픈소스(GPL)** 로 공개 → OpenJDK 탄생 |
| 2010 | **Oracle이 Sun Microsystems 인수** → Java 소유권 이전 |
| 2017 | Java 9부터 **6개월 릴리스 주기** 도입 |
| 2023 | Java 21 (LTS) — Virtual Threads 정식 도입 |

- 처음에는 가전제품(TV 셋톱박스) 용도로 설계되었으나, 웹의 등장과 함께 서버 개발 언어로 급성장
- 현재 전 세계에서 가장 많이 사용되는 프로그래밍 언어 중 하나 (TIOBE 지수 기준 상위권)

## 핵심 특징

### 플랫폼 독립성 (Write Once, Run Anywhere)

소스 코드를 한 번 컴파일하면 **어떤 OS에서든 동일하게 실행** 가능.

- 에스페란토에 비유: 바이트코드라는 중간 언어로 번역해두면, 각 나라(OS)의 통역사(JVM)가 현지어(기계어)로 변환
- `.java` → `javac` → `.class`(바이트코드) → JVM이 OS별 기계어로 변환

```
                     ┌→ Windows JVM → Windows 기계어
Hello.class ─────────┼→ macOS JVM   → macOS 기계어
                     └→ Linux JVM   → Linux 기계어
```

### 객체 지향 (Object-Oriented)

모든 것을 **객체(Object)** 단위로 설계하고 조합하는 프로그래밍 패러다임.

- 레고 블록에 비유: 각 블록(객체)은 독립적으로 만들어지고, 서로 조합하여 복잡한 구조물(프로그램)을 만듦

| 원칙 | 설명 |
|------|------|
| **캡슐화** | 데이터와 메서드를 하나로 묶고 접근 제어 (`private`, `public`) |
| **상속** | 기존 클래스를 확장하여 재사용 (`extends`) |
| **다형성** | 같은 인터페이스로 다양한 구현을 다룸 (오버라이딩, 인터페이스) |
| **추상화** | 복잡한 내부를 숨기고 필요한 인터페이스만 노출 (`abstract`, `interface`) |

> Java는 `int`, `double` 등 기본 타입(primitive)을 제외하면 **모든 것이 클래스 기반**. 순수 객체 지향은 아니지만, 래퍼 클래스(`Integer`, `Double`)와 오토박싱으로 보완.

### 자동 메모리 관리 (Garbage Collection)

개발자가 직접 메모리를 해제할 필요 없이 **GC가 참조되지 않는 객체를 자동 회수**.

- 사무실 청소 담당자에 비유: 아무도 안 쓰는 물건(참조 없는 객체)을 알아서 치워줌
- C/C++의 `free()`/`delete` 수동 관리에서 발생하는 메모리 누수, 댕글링 포인터 문제를 방지

```java
void example() {
    Object obj = new Object();   // 힙에 객체 생성
    obj = null;                  // 참조 해제 → GC 대상
    // 개발자가 직접 해제할 필요 없음
}
```

### 강타입 (Strongly Typed)

모든 변수의 **타입이 컴파일 시점에 결정**되고, 암묵적 타입 변환이 엄격하게 제한됨.

- 공항 보안 검색에 비유: 컴파일 단계에서 타입 불일치를 미리 걸러냄 → 런타임 오류 감소

```java
int num = "hello";        // 컴파일 에러 — 타입 불일치
String text = 42;         // 컴파일 에러
double d = 10;            // OK — 작은 타입 → 큰 타입 (자동 확장)
int i = (int) 3.14;      // OK — 명시적 캐스팅 필요 (축소)
```

### 멀티스레드 지원

언어 차원에서 **멀티스레드 프로그래밍을 기본 지원**.

- 식당에 비유: 요리사(스레드) 여러 명이 동시에 주문을 처리하는 것

| 기능 | 설명 |
|------|------|
| `Thread` 클래스 | 스레드 생성 및 관리 |
| `synchronized` | 공유 자원 동기화 (모니터 락) |
| `java.util.concurrent` | 고수준 동시성 API (ExecutorService, ConcurrentHashMap 등) |
| **Virtual Threads** (Java 21+) | 경량 스레드로 수십만 개 동시 실행 가능 (기존 플랫폼 스레드의 한계 극복) |

```java
// 전통적 방식
Thread thread = new Thread(() -> System.out.println("Hello"));
thread.start();

// Java 21+ Virtual Thread
Thread.startVirtualThread(() -> System.out.println("Hello"));
```

### 풍부한 표준 라이브러리

별도 라이브러리 설치 없이 사용 가능한 광범위한 API를 제공.

| 패키지 | 용도 |
|--------|------|
| `java.lang` | 기본 클래스 (String, Math, System 등) — 자동 import |
| `java.util` | 컬렉션, 날짜/시간, Optional, Stream 등 |
| `java.io` / `java.nio` | 파일·네트워크 I/O |
| `java.net` / `java.net.http` | HTTP 클라이언트, 소켓 통신 |
| `java.sql` | JDBC (데이터베이스 접근) |
| `java.util.concurrent` | 동시성·병렬 처리 |
| `java.time` | 날짜/시간 API (Java 8+, Joda-Time 대체) |

### 하위 호환성 (Backward Compatibility)

**과거 버전에서 작성된 코드가 새 버전 JVM에서도 동작**하도록 매우 엄격하게 호환성을 유지.

- Java 8에서 컴파일한 `.class`가 Java 21 JVM에서도 실행 가능
- 기업 환경에서 Java가 선호되는 핵심 이유 중 하나 — 대규모 레거시 시스템의 안정적 운영

> 반대 방향(Java 21 코드를 Java 8 JVM에서 실행)은 불가. 높은 버전의 기능을 낮은 버전이 이해할 수 없기 때문.

## 주요 사용 분야

| 분야 | 주요 기술/프레임워크 | 사용 기업 예시 |
|------|--------------------|--------------|
| **백엔드 서버** | Spring Boot, Jakarta EE | Netflix, LinkedIn, 삼성, 카카오 |
| **Android 앱** | Android SDK (Kotlin과 공존) | 대부분의 Android 앱 |
| **빅데이터** | Hadoop, Spark, Kafka, Elasticsearch | Yahoo, Uber, Confluent |
| **금융** | 저지연 거래 시스템 | 대부분의 은행, 증권사 |
| **엔터프라이즈** | ERP, CRM, 레거시 시스템 | SAP, Oracle |

## Java 주요 버전별 변화

| 버전 | 릴리스 | 핵심 변화 |
|------|--------|----------|
| **1.0** | 1996 | 최초 릴리스 |
| **1.2** | 1998 | Collections Framework, Swing → "Java 2" |
| **5** | 2004 | Generics, Enum, Annotation, Enhanced for-loop |
| **8** | 2014 | **Lambda, Stream API, Optional**, 새 날짜/시간 API → 현재까지 가장 큰 전환점 |
| **9** | 2017 | Module System (Jigsaw), JShell, 6개월 릴리스 주기 시작 |
| **11** | 2018 | HTTP Client, var, String API 추가 (LTS) |
| **14** | 2020 | Records (preview), Switch Expressions |
| **17** | 2021 | Sealed Classes, Pattern Matching for instanceof (LTS) |
| **21** | 2023 | **Virtual Threads**, Sequenced Collections, Record Patterns (LTS) |

상세 내용은 [JDK](./JDK.md) 참고.

## 관련 문서

- [Java 동작 원리](./Java%20동작%20원리.md)
- [JVM](./JVM.md)
- [JDK](./JDK.md)
- [Java Garbage Collection](./Java%20Garbage%20Collection.md)
