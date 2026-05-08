# New Relic

> 최종 업데이트: 2026-05-03 | One Platform 통합 + Pixie/eBPF 기반 K8s 관찰성 기준

## 개념

New Relic은 **애플리케이션·인프라·사용자 경험을 한 플랫폼에서 통합 관찰(Observability)하는 SaaS 도구**다. 핵심 제품군이었던 APM(Application Performance Monitoring)에서 시작해 현재는 로그·메트릭·트레이스·이벤트를 통합한 풀스택 관찰성 플랫폼으로 확장됐다.

> 비유: 자동차의 종합 계기판. 엔진 RPM(애플리케이션), 연료(인프라 자원), 운전자 반응(사용자 경험)을 한 화면에서 본다. 어딘가 이상이 생기면 어떤 부품이 원인인지 한 번에 추적 가능.

핵심 명제: **"한 곳에서 모두 본다"(One Platform)**. 메트릭·이벤트·로그·트레이스(MELT) 4종을 단일 데이터 모델로 묶어 NRQL이라는 통합 쿼리 언어로 분석.

## 배경/역사

- **2008** **Lew Cirne**(전 Wily Technology 창업자)이 New Relic 창립. SaaS 형태 APM 개척
- **2014-12** NYSE 상장 (티커: NEWR)
- **2017~** Infrastructure·Logs·Synthetics·Browser·Mobile 등 제품군 확장
- **2020-07** **One Platform 출범** — 이전엔 제품별 분리 청구였으나 통합 사용량 기반 모델로 전환
- **2020-12** **Pixie Labs 인수** — eBPF 기반 Kubernetes 관찰성 플랫폼. 자동 계측이 핵심 가치
- **2023-07** Francisco Partners·TPG의 **65억 달러 사모 인수**로 비상장 전환
- **2024~** AI 기반 관찰성(Errors Inbox, Apollo 등) 강화

> Lew Cirne의 이름 "Lew Cirne"의 애너그램이 "New Relic"이다. 회사명 = 창업자 이름 재배열.

## 핵심 기능 (One Platform)

| 영역 | 제품명 | 다루는 것 |
|---|---|---|
| **APM** | Application Performance Monitoring | 응답시간·throughput·에러율·트랜잭션 추적 |
| **Infrastructure** | Infrastructure Monitoring | 서버·컨테이너·K8s 메트릭 |
| **Logs** | Log Management | 모든 소스 로그 통합 검색 |
| **Distributed Tracing** | Distributed Tracing | 서비스 간 호출 추적 |
| **Browser / Mobile** | RUM (Real User Monitoring) | 실제 사용자 페이지 성능 |
| **Synthetics** | Synthetic Monitoring | 합성 트래픽으로 장애 사전 감지 |
| **Network** | Network Performance | 네트워크 흐름·지연 |
| **AI Monitoring** | AI Observability (2024~) | LLM 호출 추적 |
| **Errors Inbox** | 에러 그룹화·알림 | Sentry 유사 |

→ 단일 플랫폼에서 위 모든 데이터가 **통합 데이터 모델(MELT)**로 저장되어 cross-domain 분석 가능.

## NRQL — New Relic Query Language

SQL 유사 문법으로 모든 텔레메트리를 쿼리.

```sql
-- 최근 1시간 동안 에러율 상위 5개 트랜잭션
SELECT percentage(count(*), WHERE error IS true) AS errorRate
FROM Transaction
SINCE 1 hour ago
FACET name
LIMIT 5

-- K8s 파드별 CPU 사용률 평균
SELECT average(cpuUsedCores)
FROM K8sContainerSample
FACET podName
TIMESERIES AUTO
```

→ 대시보드·알림·API 모두 NRQL 기반. **NRQL을 알면 New Relic 활용도가 결정**된다.

## Kubernetes 통합 — `nri-bundle`

New Relic의 K8s 통합은 Helm 차트 `nri-bundle` 한 번으로 끝.

```sh
# 현재 버전 확인
helm list -n newrelic --kubeconfig=mega-prod
# 예: nri-bundle-5.0.4
```

`nri-bundle`이 함께 설치하는 컴포넌트:

| 컴포넌트 | 역할 |
|---|---|
| `newrelic-infrastructure` | 노드·파드 메트릭 수집 |
| `newrelic-prometheus-agent` | Prometheus 호환 메트릭 수집 |
| `newrelic-k8s-metrics-adapter` | K8s 메트릭 API 어댑터 |
| `newrelic-logging` | Fluent Bit 기반 로그 수집 |
| `kube-state-metrics` | K8s 객체 상태 메트릭 |
| `nri-kube-events` | K8s 이벤트 수집 |
| `pixie-chart` | **Pixie/Vizier 자동 계측** (아래 섹션) |

확인 명령:

```sh
# newrelic-infrastructure 파드 라벨 확인
kubectl get pod -n newrelic -l app.kubernetes.io/name=newrelic-infrastructure \
  -o=jsonpath='{.items[0].metadata.labels}'
```

## Pixie 통합 (eBPF 기반 K8s 자동 관찰성)

Pixie는 **eBPF**로 K8s 클러스터의 모든 통신·시스템 호출을 코드 변경 없이 자동 수집한다. New Relic이 2020년 인수해 통합.

> 비유: K8s 클러스터에 도청기를 자동으로 설치. 각 컨테이너에 손대지 않고도 모든 네트워크 트래픽·함수 호출을 관찰. eBPF 덕분에 성능 오버헤드도 매우 낮다.

### 데이터 흐름

```mermaid
flowchart LR
    A[vizier-pem<br/>각 노드의 데이터 수집 에이전트] -->|메시지 발행| B[pl-nats-0<br/>NATS 메시지 브로커]
    B -->|구독·전달| C[vizier-query-broker<br/>쿼리 처리·라우팅]
    C -->|보안 게이트웨이| D[vizier-cloud-connector<br/>Pixie Cloud 연결 다리]
    D -->|암호화 통신| E[New Relic Pixie 클라우드]
```

### 컴포넌트별 역할

#### vizier-pem (Pod-Agent)

- **각 노드에 DaemonSet으로 배포**되는 데이터 수집 에이전트
- eBPF로 시스템 호출·네트워크 패킷 수집
- 비유: **현장 요원** — 각 노드의 모든 활동을 직접 관찰

#### vizier-cloud-connector

New Relic의 Pixie 통합에서 **클러스터 내 Pixie 배포(Vizier)와 New Relic Pixie 클라우드 간의 핵심 연결 다리(Bridge)** 역할.

| 역할 | 설명 |
|---|---|
| **에이전트 등록·관리** | `vizier-pem` 파드들이 자기 활성화를 알리고 등록. cloud-connector가 등록된 pem 에이전트들을 관리하고, 설정·명령을 전달 |
| **데이터 파이프라인 설정** | pem이 수집한 데이터가 cloud-connector를 통해 New Relic Pixie 클라우드로 전송. pem이 어디로 데이터를 보낼지 결정 |
| **보안 통신** | 클러스터 내부 ↔ Pixie 클라우드 간 모든 통신을 암호화·인증하는 **보안 게이트웨이** |

비유: **현장 요원들의 보고를 받아 본부(Pixie 클라우드)에 전달하는 중간 관리자**.

#### pl-nats-0 (NATS 서버)

- **클러스터 내부의 고속 메시지 브로커** (StatefulSet)
- 주요 역할: Pixie 컴포넌트들(`vizier-pem`, `vizier-query-broker`, `vizier-metadata` 등) 간 실시간으로 대량 메시지(데이터 스트림)를 빠르고 안정적으로 주고받게 함
- 통신 범위: **클러스터 내부 통신에만 집중**. 컴포넌트들이 NATS에 publish/subscribe로 통신
- 데이터 종류: `vizier-pem`이 수집한 원시 텔레메트리·내부 제어 메시지 등 고속 스트리밍 데이터
- 비유: **클러스터 내 모든 부서(파드)가 쓰는 초고속 사내 메신저 서버**

```sh
# pl-nats StatefulSet 확인
kubectl get statefulset pl-nats -n newrelic --kubeconfig=mega-prod
```

#### vizier-query-broker

- 사용자가 PxL(Pixie Query Language) 쿼리를 던지면 **여러 vizier-pem에 분산 실행하고 결과 집계**
- NRQL과 다른 PxL 언어 사용 — Pixie 고유 쿼리 문법

### 역할 정리

| 컴포넌트 | 비유 | 한 줄 |
|---|---|---|
| `vizier-pem` | 현장 요원 | 각 노드에서 eBPF로 데이터 수집 |
| `pl-nats-0` | 사내 메신저 | 클러스터 내부 고속 메시지 브로커 |
| `vizier-query-broker` | 분석 본부 | 쿼리 분산·결과 집계 |
| `vizier-cloud-connector` | 외부 연락관 | 클러스터 ↔ Pixie 클라우드 보안 게이트웨이 |

## 자주 쓰는 명령어

```sh
# 1. 현재 helm 차트 버전 확인
helm list -n newrelic --kubeconfig=mega-prod

# 2. newrelic-infrastructure 파드 라벨 확인
kubectl get pod -n newrelic -l app.kubernetes.io/name=newrelic-infrastructure \
  -o=jsonpath='{.items[0].metadata.labels}'

# 3. pl-nats StatefulSet 상태
kubectl get statefulset pl-nats -n newrelic --kubeconfig=mega-prod

# 4. vizier-pem 파드 리스트 (노드별 1개)
kubectl get pod -n newrelic -l name=vizier-pem --kubeconfig=mega-prod

# 5. cloud-connector 로그 확인 (인증·연결 이슈 디버깅)
kubectl logs -n newrelic -l name=vizier-cloud-connector --kubeconfig=mega-prod --tail=200

# 6. Pixie 컴포넌트 전체 헬스 체크
kubectl get pods -n newrelic -l 'name in (vizier-pem,vizier-cloud-connector,pl-nats,vizier-query-broker)' \
  --kubeconfig=mega-prod
```

## 경쟁 제품 비교 (2026 기준)

| 제품 | 강점 | 약점 |
|---|---|---|
| **New Relic** | One Platform 통합, NRQL, Pixie 자동 계측, 가격 투명 (사용량 기반) | UI 복잡, 학습 곡선 |
| **Datadog** | UI 직관적, 통합 수 많음 (700+) | 가격 비쌈, 제품별 청구 |
| **Dynatrace** | AI 자동 분석(Davis), 엔터프라이즈 강함 | 가격 매우 비쌈, 진입 장벽 |
| **Grafana Cloud** | 오픈소스 기반(Prometheus·Loki·Tempo), 비용 효율 | 통합 깊이가 상용 대비 약함 |
| **Sentry** | 에러 추적 특화, 가벼움 | APM·인프라는 약함 |
| **AWS CloudWatch** | AWS 통합 기본 | AWS 외 환경엔 한계 |

## 가격 모델

New Relic은 **사용량 기반(Usage-based)** 모델:

| 차원 | 설명 |
|---|---|
| **Data Ingest** | GB당 과금. 100GB까지 무료 |
| **User** | 사용자 수 기반 (Free/Core/Full Platform 3단계) |

> Datadog의 호스트당 과금과 달리 데이터 양 + 사용자로만 청구. 호스트가 많아도 데이터를 적게 보내면 저렴할 수 있다.

## 백엔드 개발자 관점 실무 포인트

- **APM 에이전트 도입은 Maven/Gradle 한 줄** — Spring Boot면 `newrelic-agent` JVM 옵션만 추가
- **NRQL 익히기가 가성비 최고** — 대시보드 클릭만으론 한계. 쿼리 직접 작성이 강력
- **Custom Attribute로 비즈니스 컨텍스트 추가** — `NewRelic.addCustomParameter("orderId", id)` 같은 식. 트랜잭션을 비즈니스 단위로 검색 가능
- **분산 추적은 OpenTelemetry 호환** — OTel 사용하면 New Relic·Datadog 양쪽 송신 가능 (벤더 락인 회피)
- **로그-트레이스 연결** — `trace.id`·`span.id`를 로그에 넣으면 NR UI에서 자동 연결. MDC로 주입
- **Errors Inbox 활용** — Sentry 유사 기능. 새 에러·증가 추세를 자동 그룹화
- **Pixie는 zero-instrumentation 강점** — 코드 수정 없이 K8s 트래픽 자동 관찰. 단 eBPF가 동작하려면 커널 4.14+ 필요
- **데이터 인제스트 모니터링** — 무료 100GB 초과 시 비용 폭증. `NrConsumption` 이벤트로 일별 사용량 추적
- **Synthetic으로 SLO 측정** — 합성 트래픽이 사용자 경험의 baseline. 알림 정책에 활용
- **Alert 정책은 코드로 관리** — Terraform Provider 활용해 정책을 git에 두기. UI에서 직접 만들면 추적 불가

## 안티패턴

| 안티패턴 | 왜 위험 |
|---|---|
| **모든 로그 인제스트** | 데이터 인제스트 비용 폭증. drop rule로 noise 제거 필수 |
| **알림 채널 단일화** | Slack 한 채널에 모든 알림 → 알림 피로 (alert fatigue). 심각도별 분리 |
| **NRQL 학습 회피** | UI 클릭만으론 깊이 있는 분석 불가 |
| **Custom Attribute 누락** | 비즈니스 컨텍스트 없이 기술 메트릭만 → "이 트랜잭션이 어느 고객/주문인가?" 추적 어려움 |
| **벤더 락인 무시** | OpenTelemetry 거치지 않고 NR SDK 직접 사용 → 이전·병행 송신 어려움 |
| **Pixie 데이터 무한 보관 가정** | Pixie는 클러스터 내 메모리 보관이 기본. 영속화하려면 Long-term Pixie storage 설정 필요 |

## 한 줄 요약

> **New Relic = "MELT(메트릭·이벤트·로그·트레이스) 4종을 한 플랫폼에 통합 + NRQL로 쿼리 가능한 SaaS 관찰성 도구."** 2008 Lew Cirne 창립, 2020 Pixie 인수로 K8s eBPF 자동 계측이 핵심 차별화. **K8s 통합은 `nri-bundle` Helm 차트 한 번으로 끝**나며, Pixie 컴포넌트(`vizier-pem` → `pl-nats-0` → `vizier-query-broker` → `vizier-cloud-connector` → Pixie Cloud) 흐름을 이해하면 디버깅이 빨라진다. 경쟁사 대비 강점은 **사용량 기반 가격 + 통합 모델**, 약점은 UI 학습 곡선.

## 관련 문서

- [DevOps](../) — DevOps 폴더 내 다른 모니터링·관찰성 도구
- (예정) eBPF — 커널 레벨 관찰성 기술

## 참조

- [New Relic 공식 문서](https://docs.newrelic.com/)
- [NRQL 레퍼런스](https://docs.newrelic.com/docs/nrql/get-started/introduction-nrql-new-relics-query-language/)
- [nri-bundle Helm 차트](https://github.com/newrelic/helm-charts/tree/master/charts/nri-bundle)
- [Pixie 공식](https://px.dev/)
- [Pixie Architecture (Vizier·PEM·NATS 설명)](https://docs.px.dev/about-pixie/what-is-pixie/)
- [New Relic Pixie 통합 가이드](https://docs.newrelic.com/docs/kubernetes-pixie/auto-telemetry-pixie/)
- [eBPF 공식](https://ebpf.io/)
- [New Relic 가격 정책](https://newrelic.com/pricing)
