# CRD와 Operator 패턴

> 최종 업데이트: 2026-07-31 | Kubernetes 기준

## 개념

**CRD(Custom Resource Definition)**는 쿠버네티스에 **"새로운 리소스 타입"을 추가하는 확장 메커니즘**이다. K8s가 기본으로 아는 `Pod`·`Service` 외에, `Application`·`Certificate` 같은 **도구·도메인 고유 리소스**를 K8s 네이티브처럼 등록해 다룰 수 있게 한다.

> 스마트폰에 비유하면 — K8s는 **OS**, 기본 리소스(Pod·Service)는 **내장 앱**, CRD는 **설치하는 서드파티 앱**이다. OS가 "앱 설치 기능(CRD 메커니즘)"을 제공하고, Argo·cert-manager 같은 도구가 그걸로 새 기능을 꽂는다.

## 기본 리소스 vs CRD

| 구분 | 리소스 | 제공 주체 |
|------|--------|-----------|
| **K8s 네이티브** | `Pod`, `Service`, `Deployment`, `ConfigMap` | 쿠버네티스 |
| **CRD로 추가** | `Application`·`Rollout`(Argo), `Certificate`(cert-manager), `VirtualService`(Istio) | 각 도구 |

등록만 하면 새 리소스도 **기본 리소스와 완전히 똑같이** 다룬다.

```bash
kubectl get pods           # 기본 리소스
kubectl get applications   # CRD로 추가된 리소스 — 동일한 방식
kubectl describe application my-app
```

## 3요소 — CRD / CR / Controller

CRD 하나만으로는 아무 일도 일어나지 않는다. **정의 + 인스턴스 + 컨트롤러**가 세트로 움직인다.

| 구성 | 역할 |
|------|------|
| **CRD** (Custom Resource **Definition**) | 새 리소스 타입의 **정의·스키마** ("Application은 이런 필드를 갖는다") |
| **CR** (Custom Resource) | 그 타입의 **실제 인스턴스**(YAML) |
| **Controller** | CR을 **감시(watch)**하고 실제 상태를 목표에 맞춤 |

```yaml
# ① CRD — 새 타입 "Application"을 K8s에 등록(정의)
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: applications.argoproj.io
spec:
  group: argoproj.io
  names: { kind: Application, plural: applications }
  scope: Namespaced
```

```yaml
# ② CR — 그 타입의 실제 인스턴스 하나
apiVersion: argoproj.io/v1alpha1
kind: Application          # ← CRD로 등록된 타입
metadata: { name: my-app }
spec: { ... }
```

→ ③ **Argo CD 컨트롤러**가 이 `Application`을 감시하며 실제 배포 상태를 맞춘다.

## 왜 필요한가 — 선언형 확장

CRD 덕분에 **"내 도메인 개념"을 K8s 네이티브처럼 선언형으로** 다룰 수 있다.

- Argo가 `Application` CRD → "배포"를 K8s 리소스로 선언 (→ [선언형 vs 명령형](../../CS-이론/선언형-vs-명령형.md))
- cert-manager가 `Certificate` CRD → "TLS 인증서 발급"을 선언
- 즉 **K8s의 어휘에 새 단어를 등재**하는 것. K8s API·`kubectl`·RBAC·GitOps가 그 새 리소스에도 **그대로** 적용된다.

## Operator 패턴

**CRD + 전용 Controller**를 묶은 것이 **Operator**다.

> "이 리소스가 이 상태가 되어야 한다"(CR 선언) → **Operator가 reconciliation loop로 실제를 맞춘다.** 핵심은 **사람 운영자(Operator)의 운영 노하우를 코드(컨트롤러)로 옮긴 것**이다. DBA가 하던 백업·복구·스케일을 컨트롤러가 대신하는 식이다.

| 예시 Operator | CRD | 컨트롤러가 하는 일 |
|---------------|-----|--------------------|
| **Argo CD** | `Application` | Git 상태로 배포 동기화 |
| **cert-manager** | `Certificate` | 인증서 발급·자동 갱신 |
| **Prometheus Operator** | `Prometheus`, `ServiceMonitor` | 모니터링 스택 배포·설정 |
| **Istio** | `VirtualService` 등 | 트래픽 라우팅 구성 |

## 정리

> **CRD = K8s에 새 리소스 타입을 추가하는 확장 판. CRD(정의) + CR(인스턴스) + Controller(감시·조정)가 세트이며, 이 셋을 묶은 게 Operator 패턴이다. Argo의 Application·Rollout, cert-manager의 Certificate가 전부 CRD로 만든 것 — 덕분에 도구별 개념을 K8s 네이티브처럼 선언형으로 다루고, 사람의 운영을 컨트롤러가 대신한다.**

## 관련 문서

- [쿠버네티스 개념](쿠버네티스-개념.md) · [쿠버네티스 오브젝트](쿠버네티스-오브젝트.md) — K8s 리소스 체계
- [Argo 개념](../Argo/Argo-개념.md) · [ApplicationSet](../Argo/ApplicationSet.md) — CRD·컨트롤러의 대표 사례
- [선언형 vs 명령형](../../CS-이론/선언형-vs-명령형.md) — CRD가 가능케 하는 선언형 확장
