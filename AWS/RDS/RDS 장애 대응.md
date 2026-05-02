# RDS 장애 대응 (Performance Insights 활용)

> 최종 업데이트: 2026-04-20 | 기준: Aurora MySQL 3.x + RDS Performance Insights

## 개념

RDS에서 성능 장애가 났을 때는 **"누가(세션)", "무엇을(SQL)", "왜 기다리는가(대기 이벤트)"** 를 차례로 짚어나가는 게 표준 진단법이다. AWS는 이걸 위해 **Performance Insights(성능 개선 도우미)** 를 무료로 제공한다.

> 비유하자면 병원의 혈액검사 — AAS는 "백혈구 수치(전반 부하)", Top Waits는 "어느 장기에 이상이 있나", Top SQL은 "구체적 원인균"에 해당.

## 진단 플레이북 (순서)

```
1. 현상 확인     ─► AAS 그래프 추세, CPU/Connection 스파이크
2. 부하 유형 분류 ─► Slice = Waits  (어떤 대기가 올라가는가)
3. 원인 쿼리 식별 ─► Slice = SQL   (어떤 쿼리가 그 대기를 유발하는가)
4. 자원 확인     ─► CloudWatch (CPU/Memory/IOPS/Latency)
5. 조치         ─► 쿼리 최적화 → 파라미터 튜닝 → 스펙 업그레이드 순
6. 재발 방지     ─► 알림 설정, Slow Query Log 상시 수집
```

## 1. AAS (평균 활성 세션 수)

**Average Active Sessions** — 특정 기간 동안 동시에 활성화된 세션의 평균 수. Performance Insights의 핵심 지표.

- **vCPU 수** = RDS 인스턴스의 CPU 용량 = 동시에 처리 가능한 스레드 수
- **AAS** = 현재 실행 중이거나 **자원을 기다리는** 세션 수

### AAS 해석 기준 (vCPU 대비)

| 수준 | 상태 | 조치 |
|------|------|------|
| `AAS ≤ vCPU` | 정상 | 모니터링만 |
| `AAS ≈ vCPU` | 최대 용량 근접 | 부하 증가 대비, 상세 모니터링 |
| `AAS > vCPU` | **CPU 자원 경쟁** 발생, 세션 대기 | 성능 개선 조치 필요 |
| `AAS > 2×vCPU` | 심각한 성능 문제 | 즉시 쿼리/스펙 대응 |

> vCPU 4개 인스턴스에서 AAS 4 이상이 바로 문제는 아니지만, **지속적으로 초과**하면 응답 시간 증가와 장애의 전조.

### AAS가 높을 때 고려 사항

1. **쿼리 최적화** — 상위 부하 쿼리의 실행 계획 분석, 인덱스 점검
2. **인덱스 활용도 개선** — 자주 쓰는 컬럼에 인덱스 생성/재검토
3. **하드웨어 자원 증설** — 인스턴스 클래스 업그레이드 (vCPU/메모리)
4. **워크로드 관리** — 배치를 비피크 시간대로 이동, 커넥션 풀링
5. **대기 이벤트 분석** — CPU 대기 외에 I/O / 락 대기 원인 확인

## 2. 데이터베이스 로드 그래프 (슬라이스 기준)

Performance Insights의 로드 그래프는 **Dimension(슬라이스)** 에 따라 부하를 다르게 쪼개 보여준다.

| 슬라이스 | 용도 |
|---------|------|
| **Database** | 여러 DB/스키마 중 어떤 쪽이 부하를 많이 유발하는지 |
| **Host** | 특정 애플리케이션 서버/IP에서 과도한 부하 유발 여부 |
| **SQL** | 어떤 SQL 문이 부하를 유발하는지 (최적화 대상 식별) |
| **User** | 특정 사용자 계정(앱별 계정 분리 시 유용) |
| **Waits** | 어떤 **대기 이벤트**로 지연되고 있는지 (병목 식별) |

### 슬라이스 활용 예

- **부하 급증 → SQL 슬라이스**: 원인 SQL 식별 → `EXPLAIN` 분석 → 인덱스 추가/재작성
- **응답 지연 → Waits 슬라이스**: I/O 대기면 스토리지 검토, 락 대기면 트랜잭션 관리 개선

## 3. 상위 대기 이벤트(Top Waits) 분석

주요 대기 이벤트 예시와 의미/조치를 표로 정리.

| 대기 이벤트 | 의미 | 주 원인 | 우선 조치 |
|------------|------|---------|---------|
| `wait/io/table/sql/handler` | 테이블 핸들러의 I/O 대기 (디스크 읽기/쓰기 지연) | 인덱스 미사용·풀스캔, 메모리 부족 | 쿼리/인덱스 최적화, `innodb_buffer_pool_size` ↑ |
| `wait/io/redo_log_flush` | Redo 로그 디스크 플러시 대기 | 잦은 커밋, 디스크 느림, log buffer 작음 | 트랜잭션 묶기, `innodb_log_buffer_size` ↑ |
| `wait/synch/sxlock/innodb/hash_table_locks` | InnoDB 해시 테이블 락 경합 | 버퍼 풀 락 경합 | `innodb_buffer_pool_instances` ↑ |
| `CPU` | CPU에서 실제 쿼리 실행 시간 | 복잡 연산, 대량 데이터 처리 | CPU 많이 쓰는 쿼리 최적화, vCPU 증설 |
| `wait/synch/cond/sql/MYSQL_BIN_LOG::COND_done` | 바이너리 로그 조건 변수 대기 | binlog 처리 부하 | binlog 설정 검토, 불필요 binlog 생성 억제 |
| `wait/synch/mutex/innodb/buf_pool_LRU_list_mutex` | 버퍼 풀 LRU 리스트 뮤텍스 대기 | 버퍼 풀 경합 | `innodb_buffer_pool_instances` ↑, 크기 조정 |
| `wait/io/file/sql/io_cache` | SQL 레이어 I/O 캐시 파일 대기 | 임시 테이블 디스크 생성 | `tmp_table_size`, `max_heap_table_size` ↑ |
| `wait/synch/mutex/sql/MYSQL_BIN_LOG::LOCK_log` | binlog 뮤텍스 락 대기 | binlog 동시성 | binlog 설정 최적화 |

### 대기 이벤트별 상세 조치

#### `wait/io/table/sql/handler` (디스크 I/O)
- **쿼리 최적화** — 실행 계획(`EXPLAIN`)으로 풀스캔 제거, 인덱스 추가
- **InnoDB Buffer Pool 크기 증가** — `innodb_buffer_pool_size` 증가로 디스크 I/O 감소
- **하드웨어 업그레이드** — SSD, 프로비저닝 IOPS 증설

#### `wait/io/redo_log_flush` (Redo 로그 플러시)
- **트랜잭션 관리** — 여러 작업을 하나 트랜잭션으로 묶어 커밋 횟수 축소
- **log buffer 증가** — `innodb_log_buffer_size` ↑
- **`innodb_flush_log_at_trx_commit` 조정** — 성능/내구성 트레이드오프. **데이터 손실 위험** 인지 후 신중히 변경
- 디스크 성능 향상 (SSD, IOPS↑)

#### `wait/synch/sxlock/innodb/hash_table_locks` (해시 테이블 락)
- `innodb_buffer_pool_instances` ↑ 로 락 경합 분산
- 락 경합 유발 쿼리 식별·최적화
- `innodb_thread_concurrency` 등 동시성 파라미터 조정
- 버그 가능성 — 최신 안정 버전으로 업그레이드

#### `CPU` (실제 실행 시간)
- 상위 SQL 식별 후 CPU 집약 쿼리 최적화
- 인덱스 활용도 점검
- vCPU 증설 (인스턴스 업그레이드)

## 4. 상위 SQL(Top SQL) 분석

로드 그래프에서 원인 대기를 확인했으면, **Top SQL 탭**에서 실제 쿼리를 찾는다.

### 분석 절차

1. **Top SQL 탭 이동**
2. **정렬/필터** — AAS, CPU Time, Wait Time 기준 내림차순. 시간 범위·특정 대기 이벤트로 필터
3. **SQL 상세** — SQL Text, SQL Statistics, Execution Plan 확인
4. **문제 원인 파악** — 호출 빈도 × 지연 시간, Rows Examined 이상치

### Top SQL 핵심 지표

**과부하 시 우선 봐야 할 지표**는 아래 표시(★).

| 지표 | 설명 | 의미/활용 |
|------|------|---------|
| `wait(AAS)별 로드` ★ | 대기 이벤트별 AAS | 병목 지점 식별 |
| `SQL 문` | 실행된 SQL 본문 | 최적화 대상 식별 |
| `ID` | SQL 문 고유 ID | DB 내부 식별자 |
| `지원 ID` | AWS Support 제공용 | 케이스 오픈 시 사용 |
| `Calls/sec` ★ | 초당 호출 횟수 | 고빈도 쿼리 → 최적화 우선순위 높음 |
| `Avg latency (ms)/call` ★ | 호출당 평균 지연 | 느린 쿼리 식별 |
| `Rows examined/sec`, `/call` ★ | 검사된 행 수 | **높으면 인덱스 없거나 풀스캔** |
| `Rows affected/sec`, `/call` | 수정된 행 수 (DML) | DML 규모 |
| `Rows sent/sec` | 클라이언트 전송 행 수 | 결과 집합 크기 |
| `Select full join/sec`, `/call` | 풀 조인 횟수 | 인덱스 없는 조인 — 최적화 필요 |
| `Select range check/sec`, `/call` | 범위 체크 횟수 | 인덱스 미사용 가능성 |
| `Select scan/sec`, `/call` | 테이블 스캔 횟수 | 풀스캔 빈도 — 인덱스 추가 고려 |
| `Sort merge passes/sec`, `/call` | 정렬 병합 패스 | 메모리 부족 → 디스크 정렬. `sort_buffer_size` ↑ |
| `Sort scan/sec`, `/call` | 정렬 스캔 횟수 | 정렬 대상 스캔 규모 |
| `Sort range/sec`, `/call` | 범위 정렬 횟수 | 범위 조건 정렬 |
| `Sort rows/sec`, `/call` | 정렬된 행 수 | 정렬 작업 규모 |
| `Created tmp disk tables/sec`, `/call` ★ | 디스크 임시 테이블 생성 | I/O 부하 원인. `tmp_table_size`, `max_heap_table_size` ↑ |
| `Created tmp tables/sec`, `/call` | 임시 테이블 생성 | 쿼리 구조 점검 |
| `Lock time (ms)/sec`, `/call` ★ | 락 대기 누적 시간 | 동시성 문제. 격리 수준/쿼리 재검토 |

### SQL Statistics 해석 요령

- `Calls/sec` 높음 + `Avg latency` 낮음 → 단일 쿼리는 빠르나 **빈도**가 문제 → 캐싱/집계
- `Calls/sec` 낮음 + `Avg latency` 높음 → **개별 쿼리가 느림** → 실행 계획 개선
- `Rows examined/call >> Rows sent/call` → 인덱스 안 타고 많이 읽어서 일부만 반환 → **인덱스 추가**

## 5. CloudWatch 인스턴스 메트릭

Performance Insights만으로 안 보이는 **리소스 레벨** 지표.

| 메트릭 | 의미 | 이상 시 |
|-------|------|--------|
| `CPUUtilization` | CPU 사용률 | 지속 80% 이상 → 스펙 업그레이드 고려 |
| `DatabaseConnections` | DB 연결 수 | 급증 시 커넥션 누수/풀 설정 점검 |
| `FreeableMemory` | 사용 가능 메모리 | 낮으면 스와핑/OOM 위험 |
| `ReadIOPS` / `WriteIOPS` | 초당 I/O | 프로비저닝 IOPS 한계 근접 여부 |
| `ReadLatency` / `WriteLatency` | I/O 지연 | 수 ms 초과 시 스토리지 병목 |

## 6. 조치 방안 (카테고리별 정리)

### A. 쿼리 최적화

- 비효율 SQL 식별 → `EXPLAIN` 개선
- **인덱스 추가** (자주 조회되는 컬럼)
- **쿼리 재작성** — 복잡 조인/서브쿼리 단순화
- 데이터 정규화/역정규화로 구조 개선

### B. 인스턴스 스펙 업그레이드

- vCPU/메모리 확장 (예: `db.r6g.2xlarge` — vCPU 8, 64 GiB)
- 스토리지: **프로비저닝 IOPS** 또는 Aurora **I/O-Optimized**

### C. DB 엔진 설정 조정

| 파라미터 | 조치 |
|---------|------|
| `innodb_buffer_pool_size` | 증가 — 더 많은 데이터 메모리 캐시 |
| `innodb_buffer_pool_instances` | 증가 — 버퍼 풀 락 경합 완화 |
| `innodb_log_buffer_size` | 증가 — 로그 플러시 빈도 축소 |
| `sort_buffer_size`, `join_buffer_size`, `read_buffer_size` | 조정 — 메모리 내 작업 처리 |
| `tmp_table_size`, `max_heap_table_size` | 증가 — 디스크 임시 테이블 방지 |

### D. 트랜잭션/락 관리

- **트랜잭션 범위 최소화** — 락 유지 시간 축소
- **격리 수준 조정** — 필요 시 낮춰 락 경합 완화
- 애플리케이션 동시성 접근 패턴 리뷰

### E. 애플리케이션 측면

- **커넥션 풀링** (HikariCP 등)
- 애플리케이션 레벨 **캐싱**(Redis 등) 도입
- **배치 작업** 비피크 시간대 스케줄링

## 7. 지속 모니터링 / 재발 방지

- **CloudWatch 알림** — CPU 사용률, AAS 임계치 초과 시 SNS/Slack 알림
- **Performance Insights 모니터링 주기** 단축 — 실시간에 가깝게
- **Slow Query Log** 상시 활성화 + CloudWatch Logs 전송
- **Error Log** 주기 점검 — 경고·오류 조기 발견

## 대기/SQL → 조치 매핑 요약

| 증상 | 대기 이벤트 | 즉시 조치 | 중장기 조치 |
|------|------------|---------|----------|
| 풀스캔 많음 | `wait/io/table/sql/handler` | 인덱스 추가, 쿼리 개선 | 버퍼 풀 확장, 스토리지 업그레이드 |
| 커밋 지연 | `wait/io/redo_log_flush` | 트랜잭션 묶기 | `innodb_log_buffer_size` ↑, SSD/IOPS ↑ |
| 락 대기 | `wait/synch/*` | 트랜잭션 짧게, 격리 수준 낮춤 | 스키마/동시성 재설계 |
| CPU 포화 | `CPU` | CPU 집약 쿼리 최적화 | 인스턴스 업그레이드 |
| 디스크 임시 테이블 | `wait/io/file/sql/io_cache` | `tmp_table_size` ↑ | 쿼리 구조 개선 |

## 참고

- [Performance Insights 대시보드 (AWS 공식)](https://docs.aws.amazon.com/ko_kr/AmazonRDS/latest/UserGuide/USER_PerfInsights.UsingDashboard.AnalyzeDBLoad.html)

## 관련 문서

- [RDS 기본.md](RDS%20기본.md)
- [필수 파라미터 그룹 설정.md](필수%20%20파라미터%20그룹%20설정.md)
- [RDS 로그 그룹.md](RDS%20로그%20그룹.md)
- [AuroraEstimatedSharedMemoryBytes.md](AuroraEstimatedSharedMemoryBytes.md)
