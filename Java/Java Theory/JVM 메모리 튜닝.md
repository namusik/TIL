# JVM 메모리 튜닝

> 최종 업데이트: 2026-03-27 | Java 21 기준

## 개념

JVM 메모리 설정을 조정하여 애플리케이션의 **성능, 안정성, 자원 효율**을 최적화하는 작업.

- 자동차 엔진 세팅에 비유하면: 기본 설정으로도 달리지만, 도로 환경(트래픽 패턴)에 맞게 세팅을 조정하면 연비(처리량)나 가속(응답 시간)이 개선됨
- 대부분의 경우 **기본 설정으로 충분** — 문제가 확인된 후 튜닝

## 언제 튜닝하는가

| 증상 | 의심 원인 |
|------|----------|
| 응답 지연이 간헐적으로 발생 | GC STW 시간이 긴 경우 |
| Full GC가 빈번하게 발생 | 힙 크기 부족 또는 메모리 누수 |
| `OutOfMemoryError` 발생 | 힙/Metaspace 부족 |
| 컨테이너 OOMKill | JVM 메모리가 컨테이너 한도 초과 |
| CPU 사용량이 비정상적으로 높음 | GC가 과도하게 동작 |

## 튜닝 순서

```
1. 모니터링으로 현재 상태 파악
   ↓
2. 문제 지점 식별 (GC 로그, 힙 덤프 분석)
   ↓
3. 가설 수립 (힙 부족? GC 선택 문제? 메모리 누수?)
   ↓
4. 옵션 조정 후 테스트
   ↓
5. 결과 비교 → 반복
```

- 병원 진료에 비유하면: 증상 없이 약부터 먹는 게 아니라, **검사(모니터링) → 진단(분석) → 처방(옵션 조정) → 경과 관찰** 순서

## 힙 메모리 옵션

### 기본 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `-Xms` | 초기 힙 크기 | `-Xms512m` |
| `-Xmx` | 최대 힙 크기 | `-Xmx2g` |
| `-Xmn` | Young Generation 크기 | `-Xmn512m` |
| `-Xss` | 스레드 스택 크기 | `-Xss1m` |

- `-Xms`와 `-Xmx`를 **동일하게 설정**하면 런타임에 힙 리사이징 오버헤드를 방지
  - 리사이징 = JVM이 힙을 늘리거나 줄이는 작업. 이 과정에서 GC가 발생하고 STW가 길어질 수 있음

### 세대별 비율 조정

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-XX:NewRatio` | Old:Young 비율 | 2 (Old 2 : Young 1) |
| `-XX:SurvivorRatio` | Eden:Survivor 비율 | 8 (Eden 8 : S0 1 : S1 1) |
| `-XX:MaxTenuringThreshold` | Young → Old 승격 기준 Age | 15 (G1 기본) |

```
힙 2GB, NewRatio=2 인 경우:
Young = 682MB (Eden 546MB + S0 68MB + S1 68MB)
Old   = 1365MB
```

- 단명 객체가 많은 서비스 → Young 비율을 높여 Minor GC로 빠르게 정리
- 장수 객체가 많은 서비스 → Old 비율을 높여 Full GC 빈도 감소

## Metaspace 옵션

| 옵션 | 설명 |
|------|------|
| `-XX:MetaspaceSize` | Metaspace 초기 크기 (이 크기를 넘으면 GC 트리거) |
| `-XX:MaxMetaspaceSize` | Metaspace 최대 크기 (기본: 무제한) |

- 기본이 무제한이므로, 클래스 누수 시 OS 메모리를 모두 소진할 수 있음
- 운영 환경에서는 `-XX:MaxMetaspaceSize=256m` 등으로 상한 설정 권장
- 리플렉션, 동적 프록시, CGLIB를 많이 사용하는 Spring 앱은 Metaspace 사용량이 높을 수 있음

## 컨테이너 환경 설정

컨테이너(Docker/K8s)에서는 고정 크기 대신 **비율 기반 설정**이 유연.

| 옵션 | 설명 |
|------|------|
| `-XX:InitialRAMPercentage` | 컨테이너 메모리 대비 초기 힙 비율 |
| `-XX:MaxRAMPercentage` | 컨테이너 메모리 대비 최대 힙 비율 |
| `-XX:MinRAMPercentage` | 소규모 힙(< 200MB)일 때 적용되는 비율 |

```sh
# 컨테이너 메모리 2GB 기준
java -XX:MaxRAMPercentage=75.0 -jar app.jar
# → 최대 힙 = 2GB * 75% = 1.5GB
```

### 힙 외 메모리를 고려해야 하는 이유

JVM은 힙 외에도 메모리를 사용함. 컨테이너 메모리 한도를 힙으로 100% 채우면 OOMKill 발생.

```
컨테이너 메모리 = 힙 + Metaspace + 스레드 스택 + Native Memory + 기타
```

| 영역 | 대략적 사용량 |
|------|-------------|
| Metaspace | 50~300MB (Spring 앱 기준) |
| 스레드 스택 | 스레드 수 × `-Xss` (기본 1MB) |
| Native Memory (Direct Buffer, JNI 등) | 가변 |
| Code Cache (JIT 컴파일 결과) | 50~250MB |

- 일반적으로 `MaxRAMPercentage=75.0`이면 나머지 25%로 힙 외 영역을 감당 가능
- 스레드가 매우 많은 애플리케이션은 비율을 낮추거나 컨테이너 메모리를 늘려야 함

### 힙 메모리가 안 줄어드는 현상

- 힙이 한 번 확장되면, GC로 객체를 회수하더라도 **JVM은 기본적으로 메모리를 OS에 반환하지 않음**
- JVM이 다시 메모리를 요청하는 오버헤드를 줄이기 위한 전략
- 모니터링에서 메모리 사용량이 줄지 않는 이유 → 대부분 정상 동작
- G1 GC, ZGC는 OS에 메모리를 반환하는 기능 지원 (`-XX:MinHeapFreeRatio`, `-XX:-ShrinkHeapInSteps`)

## GC 튜닝

### GC 선택 가이드

| 우선순위 | 추천 GC | 옵션 |
|---------|--------|------|
| 범용 (기본) | G1 GC | `-XX:+UseG1GC` (Java 9+ 기본) |
| 처리량 극대화 | Parallel GC | `-XX:+UseParallelGC` |
| 저지연 (< 1ms STW) | ZGC | `-XX:+UseZGC` |
| 저지연 (OpenJDK) | Shenandoah | `-XX:+UseShenandoahGC` |

### G1 GC 주요 튜닝 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-XX:MaxGCPauseMillis` | 목표 STW 시간 | 200ms |
| `-XX:InitiatingHeapOccupancyPercent` | Old 영역 사용률이 이 값 초과 시 Mixed GC 시작 | 45% |
| `-XX:G1HeapRegionSize` | Region 크기 (1~32MB, 2의 거듭제곱) | 자동 |
| `-XX:ConcGCThreads` | Concurrent GC 스레드 수 | 자동 |

- `MaxGCPauseMillis`를 너무 낮추면 GC 빈도가 증가하여 오히려 Throughput 저하
- 대부분의 경우 `MaxGCPauseMillis`만 조정하면 충분

### GC 로그 활성화

```sh
# Java 9+ (Unified Logging)
java -Xlog:gc*:file=gc.log:time,uptime,level,tags -jar app.jar

# 주요 확인 포인트
# - GC 빈도와 각 STW 시간
# - Full GC 발생 여부와 빈도
# - Promotion Failure 발생 여부
# - 힙 사용량 추이 (증가 추세면 메모리 누수 의심)
```

## 모니터링

### JDK 기본 도구

| 도구 | 용도 | 사용 예시 |
|------|------|----------|
| `jps` | 실행 중인 JVM 프로세스 목록 | `jps -lv` |
| `jstat` | GC 통계 실시간 확인 | `jstat -gcutil <pid> 1000` |
| `jmap` | 힙 덤프 생성 | `jmap -dump:format=b,file=heap.hprof <pid>` |
| `jstack` | 스레드 덤프 (데드락 진단) | `jstack <pid>` |
| `jcmd` | 통합 진단 명령어 | `jcmd <pid> VM.flags` |
| `jconsole` / `jvisualvm` | GUI 기반 모니터링 | — |

- `jstat -gcutil`은 운영 중 GC 상태를 빠르게 확인할 때 가장 유용

```sh
# 1초 간격으로 GC 상태 확인
jstat -gcutil <pid> 1000

#  S0     S1     E      O      M     CCS    YGC   YGCT    FGC   FGCT     GCT
#  0.00  45.21  78.33  52.10  95.20  92.11   120  1.234     2   0.567   1.801
# E=Eden, O=Old, M=Metaspace, YGC=Young GC 횟수, FGC=Full GC 횟수
```

### GC 로그 분석 도구

| 도구 | 특징 |
|------|------|
| **GCViewer** | 오픈소스, GUI 기반 GC 로그 분석 |
| **GCEasy** | 웹 기반, GC 로그 업로드하면 자동 분석/리포트 |
| **Eclipse MAT** | 힙 덤프 분석, 메모리 누수 탐지 (Leak Suspects Report) |

### APM 도구

운영 환경에서는 실시간 모니터링을 위해 APM 활용.

| 도구 | 특징 |
|------|------|
| Datadog | 종합 인프라/APM 모니터링. JVM 메트릭 대시보드 제공 |
| New Relic | APM 중심. GC 분석, 메모리 추이 시각화 |
| Elastic APM | 오픈소스 기반. ELK 스택과 통합 |
| Pinpoint | 오픈소스. 분산 추적 + JVM 모니터링. 네이버에서 개발 |

## 실무 체크리스트

### 운영 전 기본 설정

```sh
java \
  -Xms2g -Xmx2g \                    # 힙 크기 고정 (리사이징 방지)
  -XX:+UseG1GC \                      # G1 GC (기본이지만 명시)
  -XX:MaxGCPauseMillis=200 \          # 목표 STW 200ms
  -XX:MaxMetaspaceSize=256m \         # Metaspace 상한
  -XX:+HeapDumpOnOutOfMemoryError \   # OOM 시 힙 덤프 자동 생성
  -XX:HeapDumpPath=/tmp/heap.hprof \  # 힙 덤프 경로
  -Xlog:gc*:file=gc.log:time \        # GC 로그
  -jar app.jar
```

### 컨테이너 환경 기본 설정

```sh
java \
  -XX:MaxRAMPercentage=75.0 \         # 컨테이너 메모리의 75%를 힙으로
  -XX:InitialRAMPercentage=75.0 \     # 초기 힙도 동일하게
  -XX:+UseG1GC \
  -XX:MaxMetaspaceSize=256m \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/heap.hprof \
  -Xlog:gc*:file=gc.log:time \
  -jar app.jar
```

### 장애 대응 시 즉시 확인

```sh
# 1. GC 상태 확인 — Full GC 빈도, STW 시간
jstat -gcutil <pid> 1000

# 2. 스레드 덤프 — 데드락, 대기 스레드 확인
jstack <pid> > thread_dump.txt

# 3. 힙 덤프 — 메모리 누수 분석
jmap -dump:format=b,file=heap.hprof <pid>
# → Eclipse MAT으로 분석
```

## 관련 문서

- [Java Memory](./Java%20Memory.md)
- [Java Garbage Collection](./Java%20Garbage%20Collection.md)
- [JVM](./JVM.md)
