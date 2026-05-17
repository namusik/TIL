# Loki

> 최종 업데이트: 2026-05-03 | Loki 3.x + Grafana Alloy(통합 에이전트) 기준

## 개념

Loki는 **Grafana Labs가 만든 오픈소스 로그 저장·검색 백엔드**다. 수집기가 보내준 로그를 받아 **인덱싱·저장·쿼리**까지 책임진다. *"Prometheus처럼 로그를 다루자"*는 철학으로, 가장 큰 특징은 **로그 본문(라인)을 인덱싱하지 않고 메타데이터(라벨)만 인덱싱**한다는 점.

> 비유: 도서관에서 책 본문을 통째로 색인하지 않고 **서가 위치(라벨)만 색인**하는 방식. "결제 서가 → 2024년 10월 칸"까지는 빠르게 찾고, 거기서부터는 grep으로 본문 검색. 책 본문 색인을 안 만드니 도서관 운영비(스토리지)가 1/10로 줄어든다.

핵심 명제: **"모든 로그 라인을 인덱싱하는 것은 비용 낭비"** — 라벨로 좁힌 후 line filter(grep)로 충분하다는 가설. Elasticsearch 대비 저장 비용을 대폭 절감.

## 파이프라인에서의 위치 — "Loki는 어디서 일하는가"

Loki를 처음 만날 때 가장 흔한 혼동: **"수집기(Fluent Bit/Promtail)랑 뭐가 다른가?"** 답은 간단함 — **완전히 다른 레이어**이고, 둘 다 있어야 한다.

```mermaid
flowchart LR
  App[애플리케이션] -- stdout --> Node[노드 디스크<br/>/var/log/containers]
  Node --> Collector[수집기<br/>Fluent Bit / Promtail / Alloy]
  Collector -- push --> Loki[(Loki<br/>저장·인덱싱·쿼리)]
  Loki -- LogQL --> Grafana[Grafana 대시보드]
  Loki -- 알림 규칙 --> Alert[Alertmanager]
  Loki -- chunk flush --> S3[(Object Storage<br/>S3/GCS/Azure)]
```

| 레이어 | 역할 | 대표 도구 |
|---|---|---|
| **앱** | stdout으로 한 줄씩 출력 | (Logback, slf4j, etc.) |
| **수집기 (Collector)** | 노드 파일을 읽어 어딘가로 **전달**. 자체 저장/검색 기능 없음 | Fluent Bit, Promtail, Grafana Alloy, Fluentd |
| **저장·쿼리 백엔드** | 받은 로그를 **인덱싱·저장·검색** 제공 | **Loki**, Elasticsearch, CloudWatch Logs |
| **시각화·알림** | 사람이 보고, 임계치 넘으면 알림 | Grafana, Alertmanager |

### 자주 묻는 혼동: "Fluent Bit이 그냥 수집해서 저장하면 안 돼?"

Fluent Bit으로 파일에 떨궈 두는 것 자체는 가능. 그런데 그 다음 단계가 **전부 직접 만들어야** 한다.

| 운영 요구 | 파일 저장만으로 | Loki 사용 시 |
|---|---|---|
| "어제 3시 payment 에러 찾기" | GB 단위 파일 grep — 너무 느림 | `{app="payment"} \|= "error"` 즉시 |
| "10개 노드 로그 한 화면에서" | 노드마다 분산 → 직접 합쳐야 | 알아서 통합 |
| "분당 5xx 100건 넘으면 알림" | 별도 스크립트 작성 | LogQL `rate()` + Ruler |
| "trace_id로 마이크로서비스 추적" | 사실상 불가 | Tempo와 자동 연동 |
| "30일 지난 로그 자동 삭제" | cron + find 직접 | retention 정책 한 줄 |
| "팀/테넌트별 권한 분리" | 없음 | 다중 테넌트 내장 |

→ 결국 직접 만들면 **그게 곧 Loki(혹은 ES)**. 이미 잘 만들어진 걸 쓰는 게 합리적.

### 그러면 수집기는 왜 따로 두나? Loki가 직접 수집하면 안 되나?

Loki는 **노드에 직접 들어가서 파일을 읽지 않는다.** 노드별 로그 파일에 접근하려면 노드마다 에이전트가 떠 있어야 함(DaemonSet). 이걸 가벼운 수집기가 담당하고, Loki는 받는 쪽에 한 번만 띄움. **관심사 분리** + 노드 자원 절약.

| 옵션 | 결과 |
|---|---|
| Loki만 단독 | 노드 로그 수집 불가 — 누가 가져다줄 사람이 없음 |
| Fluent Bit만 단독 | 검색·집계·알림 불가 — 보내고 끝 |
| **Fluent Bit/Promtail + Loki + Grafana** | **표준 LGTM 셋업** |

> 한 줄: **"수집기가 가져다 주고, Loki가 저장·검색하고, Grafana가 보여준다."** 셋이 한 팀.

## 배경/역사

- **2018-12** **Tom Wilkie**(Grafana Labs, Cortex 창시자)가 **KubeCon Seattle**에서 Loki 첫 발표
- **2019-11** Loki 1.0 GA
- **2020-09** Loki 2.0 — LogQL 대폭 강화, single-binary 모드, 다중 테넌트 강화
- **2022** Loki 2.x 시리즈 — 다양한 backends, OTel 호환성
- **2024** **Loki 3.0** — Bloom filters(라인 검색 가속), 새 TSDB 인덱스 포맷, 네이티브 OpenTelemetry 지원
- **2024** **Grafana Alloy** 출시 — Promtail + Grafana Agent를 통합한 차세대 수집기

> Loki라는 이름은 북유럽 신화의 "장난꾸러기 신"에서 따왔다. Prometheus(그리스 신화)의 자매 프로젝트라는 의미를 담음. **개발 동기는 단순했다**: "Elasticsearch는 너무 비싸고 운영이 무겁다. 정말 모든 라인 인덱싱이 필요한가?"

## Loki vs Elasticsearch — 핵심 차이

| 항목 | Loki | Elasticsearch |
|---|---|---|
| **인덱싱 대상** | **라벨(metadata)만** | **모든 라인 본문** (full-text) |
| 스토리지 비용 | ~1/10 | 비쌈 |
| 쓰기 처리량 | 매우 높음 (인덱싱 적음) | 인덱싱 비용 큼 |
| 라인 검색 속도 | 라벨로 좁힌 후 grep | 즉시 full-text |
| 운영 복잡도 | 낮음 | 높음 (샤딩·heap 튜닝 등) |
| 적합 워크로드 | "라벨로 좁히기 쉬운" 로그 | 임의 텍스트 검색 |

→ **트레이드오프 명확**: 임의 단어 검색은 ES가 빠르지만, 비용·운영 부담은 Loki가 압승. **로그가 잘 정형화돼있고 라벨로 분류 가능하면 Loki 적합**.

## 아키텍처

```mermaid
flowchart LR
    A[애플리케이션] -->|로그| B[Promtail/Alloy<br/>수집 에이전트]
    B -->|push| C[Distributor<br/>수신·검증·분배]
    C -->|샤드별 분배| D[Ingester<br/>메모리 → 청크]
    D -->|flush| E[Object Storage<br/>S3/GCS/Azure Blob]
    F[Querier<br/>쿼리 처리] -->|읽기| D
    F -->|읽기| E
    G[Query Frontend<br/>분할·캐싱] --> F
    H[Compactor<br/>인덱스 정리] --> E
    U[사용자/Grafana] --> G
```

| 컴포넌트 | 역할 |
|---|---|
| **Distributor** | 수집 에이전트로부터 로그 수신, 라벨 검증, hash ring으로 Ingester 분배 |
| **Ingester** | 메모리에 chunk 형태로 모은 후 일정 시간/크기 도달 시 Object Storage에 flush |
| **Querier** | 쿼리 실행. 최근 데이터는 Ingester, 과거는 Object Storage에서 조회 |
| **Query Frontend** | 큰 쿼리를 작은 단위로 분할 + 결과 캐싱 + 큐잉 |
| **Compactor** | Object Storage의 인덱스·청크 정리·압축 |
| **Ruler** | 알림 규칙 평가 (Alertmanager 연동) |
| **Object Storage** | 실제 로그 저장소. S3·GCS·Azure Blob·MinIO 등 |

### 배포 모드 3종

| 모드 | 용도 | 특징 |
|---|---|---|
| **Monolithic** | 단일 바이너리, 모든 컴포넌트 통합 | 소규모 / 개발 환경 |
| **Simple Scalable** | read·write 분리 (2개 deployment) | 중간 규모 |
| **Microservices** | 컴포넌트별 독립 deployment | 대규모 / 멀티 테넌트 |

## 저장 구조 — 실제 데이터는 어디에 어떤 형태로 사는가

Loki는 자체 디스크가 아니라 **Object Storage(객체 스토리지)** 를 본 저장소로 쓴다. 이게 운영 단순함과 비용 절감의 핵심.

### 어디에 저장되나

| 옵션 | 비고 |
|---|---|
| **AWS S3** | 가장 흔함. 별도 DB 불필요 |
| **GCS** (Google Cloud Storage) | GCP |
| **Azure Blob Storage** | Azure |
| **MinIO** | 온프렘에서 S3 호환 |
| 로컬 파일시스템 | 개발/single-node 전용. 운영 비권장 |

→ 실제 디스크 파일은 S3 버킷 안의 객체로 존재. 예: `s3://my-loki-bucket/chunks/<tenant>/<fingerprint>/<chunk-id>`

### 무엇이 저장되나 — 두 종류

| 종류 | 내용 | 형태 |
|---|---|---|
| **Chunk** | 같은 라벨 스트림의 로그 라인들을 묶어 **gzip/snappy 압축** | 바이너리 객체 (수십 KB ~ 수 MB) |
| **Index** | "이 라벨 셋 → 이 chunk들에 있음" 매핑. Loki 3.x는 **TSDB 포맷**(Prometheus와 동일) | 같은 S3 버킷에 별도 prefix로 저장 |

청크 안의 **라인 본문은 인덱싱하지 않는다.** 이게 ES 대비 1/10 비용의 본질.

### 저장 흐름 단계별

1. **수신**: Distributor가 수집기 push를 받음 → 라벨 검증 → hash ring으로 Ingester에 분배
2. **메모리 누적**: Ingester가 라벨 스트림별로 메모리에 chunk를 만들며 압축 누적
3. **WAL 동시 기록**: 메모리 chunk 만드는 동안 **로컬 디스크 WAL**(Write-Ahead Log)에도 동시에 기록 → Ingester가 죽어도 복원 가능
4. **flush 조건 도달 시 S3로**:
   - `chunk_target_size` (기본 1.5 MB) 도달
   - `chunk_idle_period` (기본 30분) 동안 추가 입력 없음
   - `max_chunk_age` (기본 2시간) 초과
   - Ingester graceful shutdown
5. **메모리·WAL 정리**: S3 업로드 확정 후 메모리·WAL에서 제거

> WAL은 "잠깐의 in-flight 데이터 보호"용이지 영구 저장소가 아니다. 영구 저장소는 항상 S3.

### 인덱스의 진화 (참고)

| 시기 | 인덱스 저장소 |
|---|---|
| Loki 1.x | 별도 DB (Cassandra·BigTable·DynamoDB·BoltDB) |
| Loki 2.x | **boltdb-shipper** — 인덱스도 파일로 만들어 S3에 올림 → 별도 DB 불필요 |
| Loki 3.x | **TSDB shipper**(권장) — Prometheus TSDB 포맷. 더 빠르고 압축률 높음 |

→ 현재(3.x)는 **인덱스도 청크도 모두 S3 한 곳**. 외부 DB 의존성 0. 이게 Loki 운영이 단순한 근본 이유.

### 보관(retention)

| 설정 | 의미 |
|---|---|
| `retention_period` | 기간 지나면 Compactor가 자동 삭제 (예: `30d`, `90d`) |
| S3 lifecycle | Loki와 별개로 S3 자체 정책으로 Glacier 이동·완전 삭제 가능 |
| Compactor | 작은 chunk들을 통합·정리해 객체 수 절감 |

> 한 줄: **chunk(압축 로그) + index(TSDB)를 둘 다 S3에 두고, 잠깐 메모리에 있는 동안만 WAL로 보호.**

## LogQL — Loki의 쿼리 언어

PromQL을 닮은 쿼리 언어. 두 단계 구조: **Log Stream Selector + Filter/Parser**.

### 1. Log Stream Selector (필수)

라벨로 어느 로그 스트림을 볼지 선택.

```logql
{app="payment", env="prod"}                    # AND
{app="payment", level=~"error|warn"}            # 정규식
{job="api", status_code!~"2.."}                 # 부정 정규식
```

### 2. Line Filter (라인 본문 grep)

```logql
{app="payment"} |= "error"                      # 포함
{app="payment"} != "healthcheck"                # 미포함
{app="payment"} |~ "(?i)timeout"                # 정규식 (대소문자 무시)
{app="payment"} !~ "test"                       # 정규식 부정
```

### 3. Parser — 구조화 추출

```logql
{app="api"} | json                              # JSON 파싱
{app="api"} | logfmt                            # logfmt 파싱 (key=value)
{app="api"} | pattern `<ip> - <user> [<ts>] "<method> <path>"`  # 패턴 매칭
{app="api"} | regexp `(?P<ip>\d+\.\d+\.\d+\.\d+)`               # 정규식 추출
```

### 4. 집계 (Metric query)

```logql
# 분당 에러 발생률
sum(rate({app="payment"} |= "error" [1m]))

# 상태코드별 요청 수
sum by (status_code) (
  count_over_time({job="api"} | json [5m])
)

# p95 응답시간 (JSON 로그의 latency 필드)
quantile_over_time(0.95,
  {job="api"} | json | unwrap latency [5m]
) by (path)
```

## 라벨 vs 라인 컨텐츠 — 가장 중요한 설계 원칙

| 구분 | 라벨 (인덱싱) | 라인 컨텐츠 |
|---|---|---|
| 검색 속도 | 매우 빠름 | grep 수준 |
| 카디널리티 한계 | **엄격** | 무한 |
| 들어가야 할 것 | `app`, `env`, `level`, `namespace`, `cluster` | 자유 텍스트, JSON 본문 |
| **들어가면 안 되는 것** | **`user_id`, `request_id`, `trace_id`, `session_id`, `ip`** | (라인에 두면 됨) |

> **고cardinality 라벨은 Loki를 죽인다.** `user_id="12345"` 같은 값을 라벨로 넣으면 **유니크 스트림 수가 폭발**해 인덱스가 망가지고 쿼리 성능이 폭락한다.

올바른 패턴:

```
# Bad — user_id가 라벨
{app="api", user_id="12345"} |= "login"

# Good — user_id는 라인 컨텐츠로
{app="api"} |= "user_id=12345" |= "login"
# 또는 JSON 파싱 후
{app="api"} | json | user_id="12345" | __error__=""
```

## 로그 수집기 (Agent)

| 수집기 | 특징 |
|---|---|
| **Grafana Alloy** | 2024~ 신규 통합 에이전트. Promtail + Grafana Agent + OTel 통합 — **신규 권장** |
| **Promtail** | 전통적 Loki 전용 수집기. 단순. **Alloy로 마이그레이션 권장** |
| **Fluent Bit** | 가벼움, 다목적. Loki output plugin |
| **Fluentd** | 무거움, 풍부한 플러그인 |
| **Logstash** | ELK 스택 표준. Loki output |
| **Vector** | Datadog이 만든 고성능 수집기 |
| **OpenTelemetry Collector** | 벤더 중립. Loki Exporter |

> 신규 환경은 **Grafana Alloy** 권장. 기존 Promtail은 점진 마이그레이션.

## Loki 3.x 주요 변화

| 기능 | 설명 |
|---|---|
| **Bloom Filters** | 라인 컨텐츠 검색 가속. "이 청크에 `error_code=12345`가 있을 가능성"을 빠르게 판단 |
| **TSDB 인덱스** | 새 인덱스 포맷 (Prometheus TSDB 기반). 더 빠른 쿼리 |
| **Native OpenTelemetry** | OTel 로그를 직접 수신 |
| **Pattern Parser 강화** | 비정형 로그 구조화 추출 향상 |

## Loki vs 다른 로그 솔루션

| 솔루션 | 강점 | 약점 | 비고 |
|---|---|---|---|
| **Loki** | 비용 1/10, 라벨 기반, Grafana 통합 | 임의 텍스트 검색 느림 | LGTM 스택 |
| **Elasticsearch** | 강력한 full-text, 풍부한 분석 | 비싸고 운영 부담 | ELK 스택 |
| **Splunk** | 엔터프라이즈, SPL 강력 | 매우 비쌈 (라이선스 단위) | — |
| **CloudWatch Logs** | AWS 통합 자동 | 검색 느림, AWS 종속 | — |
| **Datadog Logs** | UI 직관, 통합 | 인제스트당 과금 비쌈 | — |
| **OpenSearch** | ES 포크, AWS Apache 2.0 | 사실상 ES와 유사 | ES 대안 |

## 백엔드 개발자 관점 실무 포인트

- **structured logging 필수** — JSON 또는 logfmt. 그래야 LogQL `| json` 또는 `| logfmt`으로 필드 추출
- **Spring Boot 권장 셋업** — Logback + Logstash JSON Encoder → stdout → Promtail/Alloy → Loki
- **trace_id를 로그에 포함** — Tempo와 자동 연결. Spring Cloud Sleuth/Micrometer Tracing이 MDC로 자동 주입
- **라벨 설계 미리** — `cluster`·`namespace`·`app`·`level`·`environment` 정도. 이 5~10개로 충분
- **고cardinality 값은 라인에** — `user_id`·`order_id`·`trace_id`는 절대 라벨 X. JSON 본문에 넣고 `| json | user_id="..."` 로 추출
- **로그 양 통제** — DEBUG는 dev에서만, 프로덕션은 INFO+. 인제스트 GB 단가가 그대로 비용
- **retention 정책** — 보통 7~30일. 장기 보관은 S3 Glacier로 lifecycle policy
- **Alloy로 시작** — Promtail은 deprecated 추세. 신규는 Alloy
- **Grafana 대시보드에 로그 패널** — 메트릭 그래프 옆에 로그를 띄워 cross-domain 분석. 인시던트 대응 속도 ↑
- **알림은 LogQL `rate()`로** — `sum(rate({app="api"} |= "5xx" [5m])) > 10` 같은 식. Ruler가 평가
- **메모리·디스크 모니터링** — Ingester는 chunk를 메모리에 들고 있어 OOM 주의. flush 간격 조정
- **`| __error__=""` 필터** — JSON 파싱 실패 라인 제외. 안 쓰면 결과에 잡음 섞임

## 안티패턴

| 안티패턴 | 왜 위험 |
|---|---|
| **고cardinality 라벨** (`user_id`, `request_id` 등) | 인덱스 폭발, 쿼리 성능 폭락 |
| **모든 로그 DEBUG로** | 인제스트 비용 폭증 |
| **라벨 너무 많음** (20+ 라벨) | cardinality 곱셈으로 폭발 |
| **structured logging 안 함** (free-text only) | LogQL parser로 구조화 추출 불가 → 라인 grep만 가능 |
| **retention 평생** | 스토리지 비용 무한 증가. lifecycle 정책 필수 |
| **Loki를 ES 대체로 모든 케이스에** | 임의 단어 검색 빈번한 워크로드엔 ES가 더 적합할 수 있음 |
| **수집기 미설정** (Promtail relabel 누락) | 의도치 않은 라벨이 자동 생성 → cardinality 폭발 |
| **chunk size 기본값 그대로** | 워크로드에 안 맞으면 메모리 압박 또는 너무 잦은 flush |

## 한 줄 요약

> **Loki = "Prometheus 철학을 로그에 적용한 오픈소스 로그 집계 시스템."** 2018 Tom Wilkie 발표, 핵심 차별점은 **라인 본문은 인덱싱하지 않고 라벨만 인덱싱** → Elasticsearch 대비 비용 1/10. 라벨로 좁힌 후 LogQL의 line filter(grep)로 검색하는 패턴. **고cardinality 라벨이 가장 큰 함정**이며, 신규 수집기는 Promtail 대신 **Grafana Alloy** 권장. Grafana·Tempo·Mimir와 함께 **LGTM 스택**을 구성해 Datadog/New Relic의 오픈소스 대안.

## 관련 문서

- [Grafana](../grafana/Grafana.md) — Loki의 시각화 프론트엔드, LGTM 스택 G
- [fluentd](fluentd.md) — 다른 로그 수집기 (Loki output 가능)
- [Prometheus](../Prometheus/) — Loki의 사상적 형제 (메트릭 버전)
- [newrelic](../newrelic/) — 통합 관찰성 SaaS 비교 대상

## 참조

- [Loki 공식 문서](https://grafana.com/docs/loki/latest/)
- [Loki GitHub](https://github.com/grafana/loki)
- [Tom Wilkie — KubeCon 2018 Loki 발표](https://www.youtube.com/watch?v=ZdEpf4UH-yQ)
- [LogQL 레퍼런스](https://grafana.com/docs/loki/latest/logql/)
- [Grafana Alloy 공식](https://grafana.com/docs/alloy/latest/)
- [Loki Best Practices](https://grafana.com/docs/loki/latest/best-practices/)
- [Why Loki — Grafana Labs 블로그](https://grafana.com/blog/2018/12/12/loki-prometheus-inspired-open-source-logging-for-cloud-natives/)
