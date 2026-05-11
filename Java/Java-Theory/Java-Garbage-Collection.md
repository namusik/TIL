# Java Garbage Collection (GC)

> 최종 업데이트: 2026-03-27 | Java 21 기준

## 개념

참조되지 않는 객체를 자동으로 메모리에서 해제하는 JVM의 메커니즘.

- 사무실 청소 담당자에 비유하면: 아무도 안 쓰는 물건(참조 없는 객체)을 찾아서 치우는 것. 누군가 쓰고 있으면(참조 있음) 건드리지 않음
- C/C++은 개발자가 직접 `free()`/`delete`로 메모리를 해제해야 하지만, Java는 GC가 자동으로 처리

## Reachability (도달성) 분석

GC가 "이 객체를 지워도 되는가"를 판단하는 기준.

- 집에서 출발해서 도로를 따라 갈 수 있는 건물은 살아있는 것, 어떤 도로로도 갈 수 없는 건물은 버려진 것으로 판단하는 원리

### GC Root

도달성 분석의 **출발점**. 여기서 참조 체인을 따라가며 도달 가능 여부를 판단.

| GC Root 종류 | 설명 |
|-------------|------|
| Stack 지역 변수 | 현재 실행 중인 메서드의 지역 변수 |
| Static 변수 | 클래스의 static 필드 |
| 활성 스레드 | 실행 중인 Thread 객체 |
| JNI 참조 | 네이티브 코드에서 참조 중인 객체 |

```
GC Root
  │
  ▼
객체A → 객체B → 객체C      ← Reachable → 유지

객체D → 객체E               ← Unreachable → GC 대상
```

### 참조 유형

GC의 회수 대상 여부를 세밀하게 제어할 수 있는 참조 타입.

- 손의 악력에 비유하면: Strong은 꽉 쥔 것, Weak는 살짝 잡은 것 — 메모리가 부족해지면 약하게 잡은 것부터 놓음

| 참조 유형 | 클래스 | GC 대상 조건 | 용도 |
|----------|--------|-------------|------|
| **Strong** | (기본) | Unreachable일 때만 | 일반적인 객체 참조 |
| **Soft** | `SoftReference<T>` | 메모리 부족 시 | 캐시 구현 |
| **Weak** | `WeakReference<T>` | 다음 GC 시 | `WeakHashMap`, 리스너 등록 |
| **Phantom** | `PhantomReference<T>` | finalize 후 | 정리 작업 트리거 |

```java
// Strong — GC 대상 아님
Object obj = new Object();

// Weak — 다른 Strong 참조가 없으면 다음 GC 시 회수
WeakReference<Object> weakRef = new WeakReference<>(new Object());
```

## GC 동작 기본 흐름

### Minor GC (Young Generation)

```
Eden이 가득 참
    ↓
Stop-The-World (짧음)
    ↓
GC Root에서 Reachable 객체 탐색
    ↓
살아남은 객체 → Survivor 영역으로 복사 (Age + 1)
    ↓
Eden 전체 비움
    ↓
Age가 임계값 초과한 객체 → Old Generation으로 승격 (Promotion)
```

- 대부분의 객체는 생성 직후 금방 사라짐 (**Weak Generational Hypothesis**) → Minor GC만으로도 대부분 정리됨
- Minor GC는 빈번하지만 STW가 짧음 (보통 수 ms)

### Major GC / Full GC (Old Generation)

- Old 영역이 부족할 때 수행
- Young + Old 전체를 대상으로 하므로 **STW가 김** (수백 ms ~ 수 초)
- Full GC가 자주 발생하면 애플리케이션 응답 지연의 주 원인

## GC 기본 알고리즘

각 GC 구현체가 내부적으로 사용하는 기법들. 자판기 회수를 예로 들면:

| 알고리즘 | 방식 | 비유 |
|----------|------|------|
| **Mark-Sweep** | 살아있는 객체를 표시(Mark) → 표시 안 된 객체 제거(Sweep) | 쓰는 물건에 스티커 붙이고, 스티커 없는 물건 버림 |
| **Mark-Compact** | Mark-Sweep 후 살아남은 객체를 한쪽으로 압축 | 버린 뒤 남은 물건을 앞으로 정리 → 메모리 단편화 방지 |
| **Copying** | 살아있는 객체를 새 영역으로 복사 후 기존 영역 전체 비움 | 정리할 물건만 새 방으로 옮기고 옛 방을 통째로 비움 |

- Young 영역은 주로 **Copying** (Survivor 간 복사)
- Old 영역은 주로 **Mark-Sweep** 또는 **Mark-Compact**

## GC 구현체 (Collector)

### Serial GC

- **단일 스레드**로 GC 수행
- STW 동안 하나의 스레드만 GC 작업
- `-XX:+UseSerialGC`
- 적합: 싱글 코어, 소규모 애플리케이션, 클라이언트 JVM

### Parallel GC

- **여러 스레드**로 Young 영역을 병렬 수집
- Throughput(처리량) 극대화가 목표
- `-XX:+UseParallelGC`
- Java 8 기본 GC
- 적합: 배치 작업, 높은 처리량이 중요한 서버

### CMS GC (Concurrent Mark Sweep)

- Old 영역을 **애플리케이션 스레드와 동시에** Mark/Sweep
- STW를 줄이기 위한 시도였으나, 메모리 단편화 문제 발생
- **Java 9에서 deprecated, Java 14에서 제거**
- G1 GC로 대체됨

### G1 GC (Garbage First)

- 힙을 **동일 크기의 Region**으로 분할하여 관리

```
┌────┬────┬────┬────┬────┬────┬────┬────┐
│Eden│Eden│ S  │Old │Old │ H  │Free│Free│
└────┴────┴────┴────┴────┴────┴────┴────┘
  각 Region이 Eden/Survivor/Old/Humongous 역할을 동적으로 담당
```

- 가비지가 **가장 많은 Region부터 우선 수집** (Garbage First의 의미)
- 전통적인 고정 영역(Young/Old) 대신 Region 단위로 유연하게 관리
- **Humongous Region** — Region 크기의 50% 이상인 큰 객체 전용
- `-XX:+UseG1GC`, `-XX:MaxGCPauseMillis=200` (목표 STW 시간 설정)
- **Java 9+ 기본 GC**
- 적합: 대부분의 서버 애플리케이션 (범용)

### ZGC

- **초저지연** GC — STW가 **1ms 미만** (힙 크기와 무관)
- 최대 **16TB** 힙 지원
- Colored Pointer와 Load Barrier를 사용하여 대부분의 GC 작업을 애플리케이션 스레드와 동시 수행
- `-XX:+UseZGC`
- Java 15에서 정식 도입, **Java 21에서 Generational ZGC** 추가 (`-XX:+ZGenerational`)
  - 기존 ZGC에 세대 구분을 추가하여 Young 객체를 더 효율적으로 수집
- 적합: 지연 시간에 민감한 서비스 (실시간 거래, 게임 서버 등)

### Shenandoah GC

- ZGC와 유사한 **저지연** 목표
- **OpenJDK에서 개발** (Oracle JDK에는 미포함)
- Concurrent Compaction으로 STW 최소화
- `-XX:+UseShenandoahGC`
- 적합: 저지연 필요 시 (OpenJDK 환경)

## GC 구현체 비교

| GC | STW | Throughput | 기본 GC 버전 | 적합한 환경 |
|----|-----|-----------|-------------|------------|
| Serial | 김 | 낮음 | - | 소규모, 싱글 코어 |
| Parallel | 중간 | **높음** | Java 8 | 배치, 처리량 중심 |
| G1 | 짧음 (예측 가능) | 높음 | **Java 9+** | 범용 서버 |
| ZGC | **< 1ms** | 높음 | - | 저지연 서비스 |
| Shenandoah | **< 10ms** | 높음 | - | 저지연 (OpenJDK) |

### 버전별 기본 GC 변경

| Java 버전 | 기본 GC | 주요 변화 |
|-----------|---------|----------|
| Java 8 | Parallel GC | - |
| Java 9 | **G1 GC** | CMS deprecated |
| Java 14 | G1 GC | CMS 제거 |
| Java 15 | G1 GC | ZGC 정식 도입 |
| Java 21 | G1 GC | Generational ZGC 추가 |

## GC 튜닝

### 언제 튜닝하는가

- GC로 인한 STW가 SLA를 초과할 때
- Full GC가 빈번하게 발생할 때
- OOM(OutOfMemoryError)이 발생할 때
- 대부분의 경우 **G1 GC 기본 설정으로 충분** — 문제가 확인된 후 튜닝

### 주요 튜닝 옵션

| 옵션 | 설명 |
|------|------|
| `-Xms` / `-Xmx` | 초기/최대 힙 크기. 동일하게 설정하면 힙 리사이징 오버헤드 방지 |
| `-XX:NewRatio` | Young:Old 비율 (기본 2 → Young 1 : Old 2) |
| `-XX:MaxGCPauseMillis` | G1 GC의 목표 STW 시간 (기본 200ms) |
| `-XX:InitiatingHeapOccupancyPercent` | Old 영역 사용률이 이 값 초과 시 Mixed GC 시작 (G1) |
| `-XX:+ZGenerational` | Generational ZGC 활성화 (Java 21+) |

### GC 로그 활성화

```sh
# Java 9+
java -Xlog:gc*:file=gc.log:time,uptime,level,tags -jar app.jar

# 주요 확인 포인트
# - GC 빈도와 STW 시간
# - Full GC 발생 여부
# - Promotion 실패 여부
```

### GC 로그 분석 도구

| 도구 | 특징 |
|------|------|
| **GCViewer** | 오픈소스, GUI 기반 GC 로그 분석 |
| **GCEasy** | 웹 기반, GC 로그 업로드하면 자동 분석/리포트 |
| **Eclipse MAT** | 힙 덤프 분석 (메모리 누수 탐지) |

## 메모리 누수 (Memory Leak)

GC가 있어도 메모리 누수는 발생할 수 있음. 객체를 사용하지 않지만 **참조를 계속 들고 있으면** GC가 회수 못 함.

- 쓰레기통에 넣어야 치워주는데, 손에 계속 들고 있으면(참조 유지) 청소 담당자가 가져갈 수 없음

### 흔한 원인

| 원인 | 예시 |
|------|------|
| 컬렉션에 계속 추가만 | `static List`에 add만 하고 remove 안 함 |
| 리스너/콜백 미해제 | 이벤트 리스너 등록 후 해제 안 함 |
| 커넥션/스트림 미반환 | DB 커넥션, InputStream 등 close 누락 |
| 캐시 무한 증가 | 만료 정책 없는 캐시에 계속 적재 |
| ThreadLocal 미정리 | 스레드 풀 환경에서 ThreadLocal 값 미제거 |

### 진단 방법

```sh
# 1. 힙 덤프 생성
jmap -dump:format=b,file=heap.hprof <pid>

# 2. OOM 시 자동 힙 덤프
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap.hprof -jar app.jar

# 3. Eclipse MAT으로 분석 → Leak Suspects Report 확인
```

## 관련 문서

- [Java Memory](./Java-Memory.md)
- [JVM](./JVM.md)
