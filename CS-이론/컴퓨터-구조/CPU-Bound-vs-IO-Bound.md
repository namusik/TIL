# CPU Bound vs I/O Bound

> 최종 업데이트: 2026-06-07 | 기준: 일반 워크로드 분류

## 개념

**CPU Bound / I/O Bound** 는 어떤 작업의 **성능 병목이 어디에 있느냐**로 워크로드를 분류하는 용어다.

| 분류 | 무엇이 병목인가 |
|---|---|
| **CPU Bound (CPU 바운드)** | **CPU 연산**이 병목. CPU가 풀로 일하고 있어 더 빠른 CPU·더 많은 코어가 답 |
| **I/O Bound (I/O 바운드)** | **I/O 대기**가 병목. CPU는 한가하고 디스크·네트워크·DB 응답을 기다림 |

> 비유하자면 **요리사의 하루**. 종일 칼질·볶기·반죽으로 손이 쉴 새 없으면 **CPU 바운드**(요리사가 병목). 만두 빚어놓고 찜기에서 익기를 30분 기다리면 **I/O 바운드**(찜기가 병목, 요리사는 한가).

핵심은 **병목 = 가장 오래 기다리게 만드는 자원**. 이 분류가 중요한 이유는 **잘못 진단하면 엉뚱한 곳에 돈을 쓰기 때문**이다. I/O 바운드 서버에 CPU 코어 64개를 박아도 효과 없고, CPU 바운드 작업에 가상 스레드 10만 개를 만들어도 효과 없다.

> 같이 보면 좋은 문서: [CPU.md](CPU.md), [IO-작업.md](IO-작업.md), [../IO-Model.md](../IO-Model.md), [OS-Thread.md](OS-Thread.md), [../../Java/Java-Thread/Java-Virtual-Threads.md](../../Java/Java-Thread/Java-Virtual-Threads.md)

## 배경

용어 자체는 **컴퓨터 과학 초기**(1960~70년대)부터 사용. 시분할 시스템에서 "이 작업은 CPU를 많이 쓰니까 짧게 끊고, 저 작업은 I/O 대기가 많으니 길게 줘도 무방"이라는 **스케줄러 설계 분류**가 시작.

- **MLFQ (Multi-Level Feedback Queue)** 스케줄러 핵심 가정: I/O 바운드 작업은 우선순위를 높여 빨리 응답시키고, CPU 바운드 작업은 낮춰 백그라운드에서 굴림
- 현대 OS(Linux CFS, Windows)도 같은 원칙으로 작업 우선순위 동적 조정

## 대표 예시

### CPU Bound 작업

| 작업 | 왜 CPU 바운드인가 |
|---|---|
| 동영상·이미지 **인코딩/디코딩** | 픽셀 연산 폭증 |
| **암호화·해싱** (AES, bcrypt) | 수십~수백만 회 반복 연산 |
| **머신러닝 학습/추론** | 행렬 곱 압도적 |
| **압축**(zip, gzip), 직렬화 | 비트 단위 알고리즘 |
| 대량 데이터 **정렬·집계** | 비교·이동 반복 |
| **수치 시뮬레이션** (과학 계산) | 부동소수점 폭증 |
| **거대 JSON/XML 파싱** | 토큰화·트리 구축 |

특징: **CPU 사용률 100%, I/O Wait 0에 가까움**.

### I/O Bound 작업

| 작업 | 왜 I/O 바운드인가 |
|---|---|
| **웹 서버 (REST/GraphQL API)** | 요청당 DB 조회·외부 API 호출 시간이 큼 |
| **DB 쿼리 응답 대기** | 디스크/네트워크 왕복 |
| **파일 읽기/쓰기** | 디스크 대역폭 한계 |
| **외부 API/MSA 간 호출** | 네트워크 RTT |
| **메시지 큐 소비** (Kafka, RabbitMQ) | 브로커 응답 대기 |
| **WebSocket 다중 연결** | 클라이언트 메시지 대기 |
| **장치 입력 대기** (키보드, 센서) | 사용자/하드웨어 응답 대기 |

특징: **CPU 사용률 낮음, I/O Wait·블로킹 대기 많음**. **일반적인 백엔드 서버 워크로드 대부분이 여기에 속함.**

## CPU 시간 분포로 본 차이

같은 1초 동안 CPU가 보내는 시간 비교.

```
CPU 바운드 작업 (1초)
┌──────────────────────────────────────┐
│ CPU 연산 95%                          │  I/O 대기 5%
└──────────────────────────────────────┘

I/O 바운드 작업 (1초)
┌─────┐                                  ┌─────┐
│ CPU │  ────── I/O 대기 90% ──────     │ CPU │
│ 5%  │                                  │ 5%  │
└─────┘                                  └─────┘
```

## 어떻게 대응이 달라지나

| 측면 | CPU Bound | I/O Bound |
|---|---|---|
| **병목 해소 방향** | 알고리즘 개선, SIMD·벡터화, GPU, 멀티코어 활용 | 비동기 I/O, 스레드 늘리기, 캐싱, 커넥션 풀 |
| **스레드 풀 크기 (Brian Goetz)** | **코어 수 + 1** | **코어 수 × (1 + 대기시간/CPU시간)** — 보통 수십~수백 |
| **하드웨어 업그레이드** | CPU 코어·클럭, GPU | NVMe SSD, RAM, 네트워크 대역폭 |
| **언어/프레임워크** | C, C++, Rust, CUDA, Fortran | Node.js, Go, Java Virtual Threads, WebFlux, Vert.x |
| **가상 스레드 효과** | **거의 없음** (코어 수 한계) | **압도적** (동기 코드 + 고동시성) |
| **수평 확장** | 보통 (CPU 추가) | 좋음 (스레드·인스턴스 추가) |
| **GC 압박** | 보통 | 객체 수 폭증할 수 있음 |

> [Java Virtual Threads](../../Java/Java-Thread/Java-Virtual-Threads.md)가 의미 있는 시나리오의 핵심도 이것 — Virtual Threads는 **I/O 바운드 서버**에 강하고, **CPU 바운드**엔 의미가 없다.

## 진단 방법 (Linux)

### `top` / `htop`

화면 첫 줄 `%Cpu(s):`에서:

| 컬럼 | 의미 | 높으면 |
|---|---|---|
| **us** (user) | 사용자 프로세스 CPU 사용 | **CPU Bound** |
| **sy** (system) | 커널 CPU 사용 | **CPU Bound** (시스템 콜 많음) |
| **wa** (iowait) | I/O 완료 대기 | **I/O Bound** |
| **id** (idle) | 유휴 | 한가 |
| **st** (steal) | 가상화 환경에서 빼앗긴 시간 | 노이지 네이버 |

### 진단 기준

- `us`+`sy`가 **90% 이상**이고 `wa`가 낮음 → **CPU Bound**
- `wa`가 **20% 이상**이고 `us`+`sy`는 낮음 → **I/O Bound**
- 둘 다 애매 → **Mixed**

### 보조 명령어

```bash
vmstat 1                  # us/sy/wa 컬럼 실시간
iostat -x 1               # 디스크 I/O 부하·대기 큐 길이
sar -u 1                  # CPU 상세
mpstat -P ALL 1           # 코어별 CPU 사용률 분포
pidstat -d 1              # 프로세스별 I/O 사용량
perf top                  # 어떤 함수가 CPU를 많이 쓰는지
```

## 스레드 풀 크기 결정 — Brian Goetz 공식

`Java Concurrency in Practice`(Brian Goetz, 2006)에서 제시한 권장 공식.

### CPU Bound

```
스레드 수 = 코어 수 + 1
```

코어를 100% 채우는 게 목표. 한 스레드가 잠깐 page fault나 OS 인터럽트로 멈춰도 대기 스레드가 1개 있으면 코어가 계속 일함.

### I/O Bound

```
스레드 수 = 코어 수 × CPU 활용 목표(%) × (1 + 대기시간/CPU시간)
```

대기시간이 CPU 시간의 9배(외부 API 호출이 대부분)면:
- 8코어 × 100% × (1 + 9/1) = **80 스레드**

> 톰캣 기본 200, Spring Boot 일반 백엔드 50~200이 이 공식의 결과. 무작정 늘리면 컨텍스트 스위칭 비용으로 역효과 — 이 한계를 깨려고 등장한 게 [Java Virtual Threads](../../Java/Java-Thread/Java-Virtual-Threads.md), Go goroutine.

## 섞인 경우 (Mixed Workload)

현실은 깔끔하게 안 갈라짐. 한 HTTP 요청 안에서:

```
DB 쿼리 응답 대기 (I/O)
       ↓
결과 JSON 직렬화 (CPU)
       ↓
Redis 캐싱 (I/O)
       ↓
응답 전송 (I/O)
```

→ 부분적으로 CPU, 전체적으로 I/O. 보통 백엔드 서비스는 이 패턴. "주된 병목이 어디냐"로 분류한다.

### 진단 우선순위

1. 전체 응답 시간 중 **어느 단계가 가장 오래 걸리는가** 측정 (APM, OpenTelemetry)
2. 그 단계가 CPU 바운드인지 I/O 바운드인지 판별
3. 해당 단계만 최적화

> 가장 흔한 실수: CPU 사용률 30%인 걸 보고 "CPU가 한가하니 더 빠르게 만들자"며 CPU 코어를 늘림 → 실제 병목은 DB 응답이라 효과 없음.

## 스케줄러 관점

OS 스케줄러는 작업의 성격을 동적으로 파악해 우선순위를 조정한다.

| 작업 성격 | OS 스케줄러 우선순위 | 이유 |
|---|---|---|
| **I/O Bound** | **높이는 경향** | 짧게 CPU 쓰고 곧 I/O로 빠짐 → 빨리 처리해야 사용자 응답성 ↑ |
| **CPU Bound** | **낮추는 경향** | 오래 CPU 점유 → 짧게 끊어 다른 작업에 양보 |

> Linux CFS도 vruntime(가상 실행 시간) 기반으로 비슷한 효과. I/O로 sleep한 시간은 vruntime에 안 더해지므로 깨어나면 우선순위가 높음.

## 자주 받는 질문

### Q. 내 백엔드는 둘 중 어느 쪽?
A. **거의 무조건 I/O 바운드.** 일반적 CRUD·REST API는 응답 시간의 80%+가 DB·외부 API 대기. CPU 바운드는 이미지 처리·암호화·집계 배치 같은 특수 작업.

### Q. CPU 사용률이 낮은데 응답이 느리다?
A. **I/O 바운드일 가능성 높음.** DB 슬로우 쿼리, 외부 API 지연, 디스크 병목 의심. `iostat`, APM의 DB 시간 확인.

### Q. CPU 사용률이 100%인데 처리량이 안 늘어?
A. **CPU 바운드 + 단일 코어 병목**일 수 있음. 멀티스레드로 안 짜인 코드면 8코어 중 1코어만 풀가동. `mpstat -P ALL 1`로 코어별 분포 확인.

### Q. WebFlux/Reactive를 쓸까, Virtual Threads를 쓸까?
A. 둘 다 **I/O 바운드 서버 처리량**을 늘리는 기술. **CPU 바운드면 둘 다 효과 없음.** I/O 바운드면 코드 단순성에서 Virtual Threads가 유리.

### Q. 멀티스레드로 짜면 CPU 바운드가 빨라지나?
A. **코어 수만큼만** 빨라짐. 8코어면 최대 8배. 그 이상 스레드를 만들어도 컨텍스트 스위칭 비용만 늘어남.

### Q. 메모리 바운드라는 말도 있던데?
A. 캐시 미스가 많아 **RAM 접근이 병목**인 작업. CPU·I/O와 별도로 보기도 함. 대용량 그래프 탐색, 큰 해시 테이블 조회 등. 해결은 캐시 친화적 자료구조·데이터 레이아웃.

## 관련 문서

- [CPU.md](CPU.md) — CPU 사용률 측정과 구조
- [IO-작업.md](IO-작업.md)
- [../IO-Model.md](../IO-Model.md) — 동기/비동기, 블로킹/논블로킹 I/O
- [OS-Thread.md](OS-Thread.md) — 스레드 풀 크기 공식
- [Memory.md](Memory.md)
- [../../Java/Java-Thread/Java-Virtual-Threads.md](../../Java/Java-Thread/Java-Virtual-Threads.md) — I/O 바운드에 강한 가상 스레드

## 출처

- *Java Concurrency in Practice* (Brian Goetz, 2006)
- *Operating System Concepts* (Silberschatz et al.)
- [Linux Performance (Brendan Gregg)](https://www.brendangregg.com/linuxperf.html)
