# AWS EKS + Bitbucket 기반 Argo 설치 가이드

## 전체 설치 흐름 요약

```
1. Argo CD 설치 (GitOps 컨트롤 플레인)
2. Argo CD ↔ Bitbucket 연동
3. Argo Rollouts 설치 (배포 전략 컨트롤러)
4. Argo Rollouts CRD 확인
5. Argo CD Application으로 Rollout 관리
```

**핵심 원칙**
- Argo CD가 먼저 설치되어야 한다
- Argo Rollouts는 Argo CD가 관리하는 대상이다

---

## 0. 전제 조건

**인프라 / 도구**
- Kubernetes Cluster: Amazon EKS
- Git Repository: Bitbucket
- 접근 도구
  - kubectl
  - helm
  - eks cluster 접근 권한

---

## 1. Argo CD 설치 (가장 먼저)

왜 Argo CD부터 설치하나
- Argo CD는 GitOps 컨트롤 플레인
- 이후 설치되는 모든 Argo 컴포넌트(Rollouts 포함)를 관리하는 주체


### 1.1 Namespace 생성

```sh
kubectl create namespace dev-ops
```
- 실무에서는 Argo 계열을 전용 네임스페이스(dev-ops, argocd 등)에 둔다


### 1.2 Helm Repo 추가
```sh
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
```

### 1.3 Argo CD 설치
```sh
helm install argo \
  argo/argo-cd \
  -n dev-ops

# 설치 확인
kubectl get pods -n dev-ops
```


### 1.4 Argo CD 접근 방식 결정

보통 EKS에서는 아래 중 하나를 선택한다.
  - ALB Ingress (운영 환경 권장)
  - NLB / Ingress Controller
  - Port-forward (초기 테스트용)

초기 확인용

```sh
kubectl port-forward svc/argo-argocd-server -n dev-ops 8080:443
```

--- 

## 2. Argo CD ↔ Bitbucket 연동

왜 필요한가
- Argo CD는 Git을 직접 pull 해야 함
- Bitbucket private repository 접근을 위한 인증 필요



### 2.1 Bitbucket App Password 생성

Bitbucket에서:
- Account → App Passwords
- 권한
  - Repository: Read
  - Pull Requests: Read (선택)


### 2.2 Argo CD에 Repository 등록

```sh
argocd repo add https://bitbucket.org/<workspace>/<repo>.git \
  --username <bitbucket-username> \
  --password <app-password>

## 확인
argocd repo list
```

---

## 3. Argo Rollouts 설치

**중요한 설계 결정 (먼저 정해야 함)**

네임스페이스 전략
- 권장: **argo-rollouts 전용 네임스페이스**
- 이유
  - 권한 분리
  - 업그레이드 독립성
  - 장애 영향 최소화

### 3.1 Namespace 생성

```sh
kubectl create namespace argo-rollouts
```

### 3.2 Helm으로 Argo Rollouts 설치

```sh
helm install argorollouts \
  argo/argo-rollouts \
  -n argo-rollouts

# 확인
kubectl get pods -n argo-rollouts
```

### 3.3 CRD(Custom Resource Definition) 확인 (중요)
- **Kubernetes**에 “쿠버네티스가 원래 모르는 리소스 타입을 새로 등록하는 스키마”를 추가하는 메커니즘
- Kubernetes 기본 리소스: Pod, Service, Deployment
- CRD로 추가되는 리소스 예:
  - Application (Argo CD)
  - Rollout (Argo Rollouts)
  - AnalysisTemplate (Argo Rollouts)


```sh
kubectl get crd | grep rollout

정상적으로 보이면:
rollouts.argoproj.io
analysistemplates.argoproj.io
clusteranalysistemplates.argoproj.io
```

### 3.4 Argo Rollouts를 “진짜 쓰고 있는지” 확인

```sh
kubectl get rollout -A
```
- 결과가 있다 → 실제 서비스가 Rollout 기반으로 배포 중

## 4. Argo Rollouts Dashboard (선택)

UI가 필요하면 추가 설치 가능

```sh
kubectl argo rollouts dashboard -n argo-rollouts
```

또는 Ingress 노출

## 5. Argo CD로 Rollouts 관리하기

핵심 개념
- Argo Rollouts는 직접 쓰는 도구가 아님
- Argo CD가 Rollout YAML을 Sync
- Rollouts Controller가 배포 전략을 수행


### 5.1 Git Repository 구조 예시

```
repo/
 └─ k8s/
    └─ app-a/
       ├─ rollout.yaml
       ├─ service.yaml
       └─ ingress.yaml
```

### 5.2 Rollout 리소스 예시
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: app-a
spec:
  replicas: 2
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: {}
        - setWeight: 50
        - pause: {}
  selector:
    matchLabels:
      app: app-a
  template:
    metadata:
      labels:
        app: app-a
    spec:
      containers:
        - name: app
          image: my-image:latest
```