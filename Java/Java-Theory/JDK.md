# JDK (Java Development Kit)

> 최종 업데이트: 2026-03-28 | Java 21 기준

## 개념

Java 애플리케이션을 **개발하고 실행**하기 위한 도구 모음.

- **요리사의 풀세트 도구**에 비유할 수 있음. 칼(컴파일러), 조리도구(런타임 라이브러리), 가스레인지(JVM)가 모두 포함된 키트
- JDK ⊃ JRE ⊃ JVM 관계 (Java 11부터 JRE 별도 배포 없음)

```
┌─────────────────────────────────────────────┐
│  JDK                                        │
│  ┌──────────────────────────────────────┐   │
│  │  JRE (Java Runtime Environment)      │   │
│  │  ┌──────────────────────────────┐    │   │
│  │  │  JVM                         │    │   │
│  │  └──────────────────────────────┘    │   │
│  │  + 런타임 라이브러리 (java.lang 등)    │   │
│  └──────────────────────────────────────┘   │
│  + 개발 도구 (javac, javadoc, jar, jdb 등)  │
└─────────────────────────────────────────────┘
```

| 구성 요소 | 역할 |
|----------|------|
| `javac` | Java 소스(.java) → 바이트코드(.class) 컴파일러 |
| `java` | JVM을 실행하여 바이트코드 실행 |
| `jar` | 클래스 파일을 JAR 아카이브로 패키징 |
| `javadoc` | 소스 코드에서 API 문서 생성 |
| `jdb` | Java 디버거 |
| `jconsole` / `jvisualvm` | 모니터링·프로파일링 도구 |
| `jshell` | REPL (Java 9+) |

## OpenJDK와 Oracle JDK

- **OpenJDK**: Java SE 스펙의 **오픈소스 참조 구현체** (GPLv2+CE 라이선스)
  - 레시피(Java SE 스펙)가 공개되어 누구나 자기 주방(환경)에 맞게 요리(빌드)할 수 있는 것
  - 다양한 벤더가 OpenJDK 소스를 기반으로 자체 배포판을 제공
- **Oracle JDK**: Oracle이 OpenJDK를 기반으로 빌드한 상용 배포판
  - Java 17부터 NFTC(No-Fee Terms and Conditions) 라이선스로 무료 사용 가능
  - 그 이전 버전(8, 11)은 **상용 환경에서 유료 라이선스** 필요

> Oracle JDK와 OpenJDK는 Java 11부터 기능 차이가 거의 없음. 과거에는 Oracle JDK에만 있던 Flight Recorder, ZGC 등이 OpenJDK에도 포함됨.

## JDK 릴리스 모델

- **6개월 주기**로 새로운 기능 릴리스 (매년 3월, 9월)
  - 영화 시리즈에 비유하면: 6개월마다 새 에피소드(기능 릴리스)가 나오고, 몇 년에 한 번 "컬렉터스 에디션"(LTS)이 나오는 구조
- **LTS (Long-Term Support)**: 장기 지원 버전으로, 최소 수 년간 보안·버그 패치 제공
- **분기별** 버그 수정 업데이트 (1월, 4월, 7월, 10월)

### 주요 LTS 버전

| 버전 | 릴리스 | 핵심 기능 |
|------|--------|----------|
| **8** | 2014.03 | Lambda, Stream API, Optional, 새 날짜/시간 API |
| **11** | 2018.09 | HTTP Client, var (지역변수 타입 추론), String 메서드 추가 |
| **17** | 2021.09 | Sealed Classes, Pattern Matching (instanceof), Records, Text Blocks |
| **21** | 2023.09 | Virtual Threads, Sequenced Collections, Record Patterns, Pattern Matching (switch) |

### 비 LTS 주요 기능 (해당 LTS에 포함)

| 버전 | 주요 기능 | 포함 LTS |
|------|----------|----------|
| 9 | Module System (Jigsaw), JShell | 11 |
| 10 | `var` 키워드 (지역 변수) | 11 |
| 14 | Records (preview), Switch Expressions | 17 |
| 15 | Text Blocks, ZGC 정식 | 17 |
| 16 | Pattern Matching for instanceof | 17 |
| 19 | Virtual Threads (preview) | 21 |
| 20 | Scoped Values (preview) | 21 |

## JDK 배포판 비교

OpenJDK 소스를 기반으로 여러 벤더가 자체 빌드를 배포함. 같은 레시피(OpenJDK)로 만들었지만 **포장·보증·부가 서비스가 다른 것**.

### 추천 배포판

| 배포판 | 제공사 | 특징 | 추천 환경 |
|--------|-------|------|----------|
| **Eclipse Temurin** | Adoptium (Eclipse 재단) | 벤더 중립, TCK 인증, 넓은 플랫폼 지원 | 범용 (기본 선택) |
| **Amazon Corretto** | AWS | 무료 LTS, AWS 환경 최적화, 자체 패치 포함 | AWS 인프라 |
| **Azul Zulu** | Azul Systems | 다양한 OS/아키텍처, 유료 지원 옵션 | 엔터프라이즈 |
| **BellSoft Liberica** | BellSoft | 경량 컨테이너용 빌드 제공, Spring Boot 기본 런타임 | 컨테이너·Spring Boot |
| **Microsoft OpenJDK** | Microsoft | Azure 환경 최적화 | Azure 인프라 |
| **Red Hat OpenJDK** | Red Hat | RHEL/CentOS와 긴밀 통합, RPM 패키지 | RHEL 환경 |
| **SAP Machine** | SAP | SAP 제품군과 호환 보증 | SAP 환경 |

### 주의가 필요한 배포판

| 배포판 | 주의 사항 |
|--------|----------|
| **Oracle JDK** | Java 8~16: 상용 환경 유료 라이선스. Java 17+: NFTC 라이선스(무료이나 버전 업그레이드 의무) |
| **Oracle OpenJDK 빌드** | 최신 버전만 6개월간 업데이트. LTS 장기 지원 없음 |
| **IBM Semeru** | OpenJ9 VM 사용 (HotSpot이 아님). OpenJ9이 필요한 경우에만 선택 |

## JDK 선택 가이드

```
어떤 JDK를 써야 할까?
    │
    ├─ 특정 클라우드에 종속? ──→ 해당 벤더 JDK
    │   ├─ AWS      → Amazon Corretto
    │   ├─ Azure    → Microsoft OpenJDK
    │   └─ RHEL     → Red Hat OpenJDK
    │
    ├─ Spring Boot 중심? ──→ BellSoft Liberica (공식 런타임)
    │
    └─ 범용 / 잘 모르겠음 ──→ Eclipse Temurin (Adoptium)
```

**버전 선택:**
- 신규 프로젝트 → **최신 LTS (Java 21)** 권장
- 기존 프로젝트 → Java 17 이상으로 마이그레이션 고려
- 최신 기능 실험 → 비 LTS 최신 버전 사용 후 6개월마다 업그레이드

## 관련 문서

- [JVM](./JVM.md)
- [컴파일과 바이트코드](./컴파일과-바이트코드.md)
- [Java 동작 원리](./Java-동작-원리.md)
- [Java Garbage Collection](./Java-Garbage-Collection.md)

## 출처

- https://whichjdk.com/
- https://docs.oracle.com/en/java/javase/21/
