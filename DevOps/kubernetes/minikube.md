# minikube

## 정의
- 작은 쿠버네티스
- 학습용으로 좋다.

## 설치
https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Farm64%2Fstable%2Fhomebrew

- 사양을 잘 봐야됨

```sh
> brew install minikube

> minikube start -h

# Docker를 드라이버로 사용하여 로컬 환경에 Kubernetes 클러스터를 시작
> minikube start --driver docker
😄  Darwin 15.1.1 (arm64) 의 minikube v1.34.0
🆕  이제 1.31.0 버전의 쿠버네티스를 사용할 수 있습니다. 업그레이드를 원하신다면 다음과 같이 지정하세요: --kubernetes-version=v1.31.0
✨  기존 프로필에 기반하여 docker 드라이버를 사용하는 중
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.45 ...
🤷  docker "minikube" container is missing, will recreate.
🔥  Creating docker container (CPUs=2, Memory=4000MB) ...
# 쿠버네티스 버전, 도커 버전
🐳  쿠버네티스 v1.24.1 을 Docker 20.10.17 런타임으로 설치하는 중
❌  캐시된 이미지를 로드할 수 없습니다: LoadCachedImages: stat /Users/ioi01-ws_nam/.minikube/cache/images/arm64/registry.k8s.io/kube-controller-manager_v1.24.1: no such file or directory
    ▪ 인증서 및 키를 생성하는 중 ...
    # 쿠버네티스 마스터 노드 역할
    ▪ 컨트롤 플레인을 부팅하는 중 ...
    ▪ RBAC 규칙을 구성하는 중 ...
🔗  bridge CNI (Container Networking Interface) 를 구성하는 중 ...
🔎  Kubernetes 구성 요소를 확인...
💡  애드온이 활성화된 후 "minikube tunnel"을 실행하면 인그레스 리소스를 "127.0.0.1"에서 사용할 수 있습니다
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
    ▪ Using image k8s.gcr.io/ingress-nginx/kube-webhook-certgen:v1.1.1
    ▪ Using image ingress-nginx/controller:v1.2.1
    ▪ Using image k8s.gcr.io/ingress-nginx/kube-webhook-certgen:v1.1.1
🔎  ingress 애드온을 확인 중입니다 ...
❗  Enabling 'ingress' returned an error: running callbacks: [waiting for app.kubernetes.io/name=ingress-nginx pods: context deadline exceeded]
🌟  애드온 활성화 : storage-provisioner, default-storageclass

❗  /opt/homebrew/bin/kubectl is version 1.31.3, which may have incompatibilities with Kubernetes 1.24.1.
    ▪ Want kubectl v1.24.1? Try 'minikube kubectl -- get pods -A'
🏄  끝났습니다! kubectl이 "minikube" 클러스터와 "default" 네임스페이스를 기본적으로 사용하도록 구성되었습니다.

# minikube 동작 확인
> minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

## 명령어
```sh
# 클러스터 중지
minikube stop

# 클러스터 일시중지
minikube pause

# 클러스터 삭제
minikube delete

# node에 ssh 연결
minikube ssh
Last login: Fri Nov 29 05:05:08 2024 from 192.168.58.1

```

## minikube 애드온
- 로컬 Kubernetes 클러스터의 기능을 확장하기 위해 Minikube에서 제공하는 추가 기능 또는 서비스
- 다양한 도구와 서비스를 손쉽게 통합할 수 있어 개발 및 테스트 환경을 더욱 풍부하게 구성
- Dashboard
  - Kubernetes 대시보드를 제공하여 클러스터의 리소스 상태를 시각적으로 관리
- Ingress
  - Ingress 컨트롤러를 제공하여 클러스터 외부에서 내부 서비스로의 HTTP 및 HTTPS 트래픽을 관리
- Metrics Server
  - 클러스터의 리소스 사용량(CPU, 메모리 등)을 수집하여 kubectl top 명령어를 통해 모니터링

```sh
# 애드온 목록 확인
minikube addons list

# 애드온 활성화
minikube addons enable <addon-name>
```