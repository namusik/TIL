# Argo 개념 정리

## Argo란 무엇인가

Argo는 Kubernetes 환경에서
	•	애플리케이션 배포
	•	워크플로우 실행
	•	이벤트 기반 자동화

를 **선언적(Declarative)** 으로 운영하기 위한 컨트롤러 기반 오픈소스 제품군이다.

핵심 철학은 다음과 같다.

운영자는 “원하는 상태(Desired State)”를 선언하고,
Argo는 실제 클러스터 상태를 그에 맞게 지속적으로 동기화한다.

---

## Argo는 단일 제품이 아니다

Argo는 하나의 툴이 아니라 역할별로 분리된 여러 컴포넌트의 집합이다.

- Argo CD
  - GitOps 기반 애플리케이션 배포
- Argo Rollouts
  - Canary / Blue-Green 배포 전략
- Argo Workflows
  - 배치·파이프라인 워크플로우 엔진
- Argo Events
  - 이벤트 기반 트리거 시스템

실무에서는 보통 Argo CD + Argo Rollouts 조합을 핵심으로 사용한다.

---

## Argo CD - GitOps 기반 “배포 컨트롤러”

### Argo CD의 역할

- Kubernetes 클러스터 내부에서 동작하는 GitOps 컨트롤러
- Git 저장소를 유일한 진실(Single Source of Truth) 로 사용
- Git에 정의된 Kubernetes 매니페스트 상태와
- 실제 클러스터 상태를 지속적으로 비교(diff)
- 불일치 시 동기화(sync)

즉, Argo CD는 “배포 도구”라기보다
상태를 맞추는 컨트롤 플레인에 가깝다.

---

### Argo CD 동작 흐름

```
Git Repository (Desired State)
        ↓
Argo CD Controller
        ↓
Kubernetes Cluster (Live State)
```

중요한 포인트

- Argo CD는 “배포 툴”이 아니라 상태 동기화 컨트롤러
- kubectl apply를 사람이 직접 치는 구조에서 → Git commit = 배포 트리거 구조로 전환

---

## Argo Rollouts – “배포 전략 컨트롤러”

### Rollouts이 필요한 이유

Kubernetes 기본 Deployment는 배포 전략이 단순
- RollingUpdate
- maxSurge / maxUnavailable

하지만 실무에서는 다음이 필요합니다.
- Canary 단계별 트래픽 증가
- 메트릭 기반 자동 중단
- Blue-Green + 수동 승인

이를 위해 **Argo Rollouts**가 등장

### Argo Rollouts의 역할

- Deployment를 대체하는 CRD (Rollout)
- 실제 Pod/ReplicaSet은 그대로 사용
- `배포 방식만 컨트롤`

즉,

**애플리케이션이 아니라, 배포 과정을 선언적으로 정의**

```
Step 1: Canary 10%
Step 2: Metric 체크 (error_rate < 1%)
Step 3: Canary 50%
Step 4: 수동 승인
Step 5: Full traffic
```

---

## Argo CD + Rollouts 관계 (중요)

이 둘은 역할이 완전히 다르다.

|구분|Argo CD|Argo Rollouts|
---|---|---|
책임|"무엇을 배포할지"|어떻게 배포할지|
대상|App 전체|특정 워크로드|
트리거|Git 변경|배포 이벤트|

실제 운영 구조

```
Git
 └─ rollout.yaml
        ↓
Argo CD (sync)
        ↓
Rollout Controller
        ↓
Canary / Blue-Green 배포 실행
```
그래서 **둘 중 하나만으로는 완전한 GitOps 배포가 되지 않는다.**

---

## Argo Workflows / Events

- **Argo Workflows**
  - Kubernetes-native 배치/파이프라인 엔진
  - CI 이후 데이터 처리, ML 파이프라인 등에 사용
  - Jenkins 대체재로 쓰이기도 함

- **Argo Events**
  - Webhook, S3, Kafka 등의 이벤트 수신
  - 이벤트 → Workflow 트리거

---

## Kubernetes와의 관계

Argo는 Kubernetes 위에서 컨트롤러 패턴으로 동작
- Kubernetes API를 지속적으로 감시(watch)
- CRD 상태를 reconciliation loop로 맞춤
- 사람 개입 최소화, 재현성 극대화
