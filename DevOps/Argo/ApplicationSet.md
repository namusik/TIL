# Argo CD ApplicationSet

> 최종 업데이트: 2026-07-29 | Argo CD 기준

## 개념

ApplicationSet은 Argo CD의 배포 단위인 **Application을 템플릿으로 여러 개 자동 생성**해주는 컨트롤러다. 환경·클러스터·벤더마다 거의 똑같은 Application을 손으로 복제하는 대신, **하나의 정의로 N개를 선언적으로** 찍어낸다.

> 붕어빵에 비유하면 — **Application이 붕어빵 하나**라면, **ApplicationSet은 틀 + 반죽 목록**이다. 목록만 주면 붕어빵(App)을 알아서 여러 개 굽는다.

## 전제 — Application이란

- **Argo CD** = Git의 쿠버네티스 매니페스트를 클러스터에 자동 동기화하는 **GitOps 배포 도구** (→ [Argo 개념](Argo-개념.md))
- **Application** = "이 Git 경로의 매니페스트를 이 클러스터·네임스페이스에 배포해라"라는 **배포 정의 하나**
- **ApplicationSet** = 그 Application을 **여러 개 생성·관리**하는 상위 컨트롤러

## 왜 필요한가

dev/prod 환경마다, 클러스터마다, 벤더마다 거의 같은 App을 여러 개 만들어야 할 때, 손으로 복붙하면 **실수·드리프트(drift)·관리 부담**이 커진다. ApplicationSet은 이 반복을 **템플릿 하나로** 없앤다.

## 동작 — 템플릿 + Generator

두 조각으로 구성된다.

- **Generator** — App을 **무엇마다 만들지** 결정하는 파라미터 소스(목록·클러스터·Git 등)
- **Template** — generator가 뽑은 각 파라미터를 끼워넣어 실제 Application을 생성

컨트롤러가 generator를 평가해 파라미터 집합을 만들고, 각 집합마다 템플릿을 채워 **Application을 생성·갱신·삭제**한다. 목록에서 항목을 빼면 해당 App도 **자동 삭제**된다.

## Generator 종류

App을 무엇을 기준으로 찍어낼지 정하는 핵심이다.

| Generator | 무엇마다 App 생성 | 대표 용도 |
|-----------|-------------------|-----------|
| **List** | 직접 나열한 목록 | 벤더·테넌트별 |
| **Cluster** | Argo에 등록된 클러스터마다 | 멀티 클러스터 배포 |
| **Git** | Git 레포의 디렉토리·파일마다 | 모노레포 여러 서비스 |
| **Matrix** | 두 generator를 곱함 | 클러스터 × 앱 조합 |
| **SCM Provider** | Git 조직(org)의 레포마다 | 조직 전체 배포 |
| **Pull Request** | 열린 PR마다 | **PR 프리뷰 환경** 자동 생성·삭제 |

## 예시 — List Generator

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: message-gateway
spec:
  generators:
    - list:
        elements:
          - vendor: ktrcs      # ← 이 목록의 항목마다 App 하나
          - vendor: mts
  template:                     # ← 이 템플릿에 {{vendor}}를 끼워 생성
    metadata:
      name: 'gateway-{{vendor}}'         # gateway-ktrcs, gateway-mts
    spec:
      project: default
      source:
        repoURL: https://git.example.com/message-gateway
        path: 'deploy/{{vendor}}'
        targetRevision: main
      destination:
        namespace: 'gateway-{{vendor}}'
      syncPolicy:
        automated: { prune: true, selfHeal: true }
```

→ Application 2개(`gateway-ktrcs`, `gateway-mts`)가 자동 생성된다. **벤더 추가 = 목록에 `- vendor: xxx` 한 줄.**

> Helm·Kustomize와 함께 쓰면 매니페스트 중복까지 없앤다 — 공통 템플릿 + 벤더별 값(values)만 두면 된다. (→ [Helm 개념](../Helm/Helm-개념.md), [Kustomize](../kubernetes/kustomize.md))

## App of Apps와 차이

비슷한 목적의 선배 패턴이 **App of Apps**(부모 Application이 자식 Application들을 배포)다.

| | App of Apps | **ApplicationSet** |
|---|---|---|
| 자식 App | 자식 App **YAML을 직접 다 작성** | **템플릿+generator로 자동 생성** |
| 반복 관리 | 수동 | **선언적 자동** |
| 동적 대상(클러스터·PR) | 어려움 | generator로 지원 |

ApplicationSet은 **App of Apps의 진화형**으로, 지금은 이쪽이 표준이다.

## ApplicationSet은 Argo CD 제공 — K8s 기본이 아니다

ApplicationSet은 **CRD(Custom Resource Definition)** 라 `kubectl`로 다루고 K8s 리소스처럼 보이지만, **K8s 네이티브가 아니라 Argo CD가 정의한 확장**이다.

| 구분 | 리소스 | 제공 주체 |
|------|--------|-----------|
| **K8s 네이티브** | Pod, Deployment, Service, ConfigMap | **쿠버네티스 API** |
| **Argo CD 확장(CRD)** | **Application, ApplicationSet, AppProject** | **Argo CD** |

**CRD라는 "확장 메커니즘"만 K8s 것**이고, `ApplicationSet` 리소스와 그 컨트롤러는 Argo CD가 제공한다. 즉 **Argo CD를 설치해야 존재**하고, 지우면 사라진다. (원래 별도 프로젝트였다가 **Argo CD 2.3(2022)부터 코어에 통합**되어 지금은 기본 포함이다.)

> 운영체제에 비유하면 — K8s는 OS, Argo CD는 설치한 프로그램이다. `Deployment`는 OS 기본이고 `ApplicationSet`은 그 프로그램이 추가한 기능이다. (→ [쿠버네티스 오브젝트](../kubernetes/쿠버네티스-오브젝트.md))

## 관련 문서

- [Argo 개념](Argo-개념.md) — Argo CD·Rollouts·Workflows 전반
- [Helm 개념](../Helm/Helm-개념.md) · [Kustomize](../kubernetes/kustomize.md) — 매니페스트 템플릿화(ApplicationSet과 함께 사용)
- [쿠버네티스 오브젝트](../kubernetes/쿠버네티스-오브젝트.md) — CRD 등 K8s 리소스 체계
- [아키텍처 스펙트럼](../../MSA/아키텍처-스펙트럼.md) — 배포 N개(모듈별 배포)를 관리하는 맥락
