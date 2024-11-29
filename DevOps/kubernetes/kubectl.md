# kubectl

## 정의
- 쿠버네티스의 API 서버와 통신하여 사용자 명령을 전달할 수 있는 CLI 도구
- Kubernetes(K8s) 클러스터를 관리하고 제어하기 위한 커맨드 라인 도구

## kubectl의 역할

-	클러스터 관리: Kubernetes 클러스터 내의 노드, 파드, 서비스 등을 관리합니다.
-	리소스 제어: 배포, 서비스, 인그레스, 설정 맵(ConfigMap), 시크릿(Secret) 등 다양한 Kubernetes 리소스를 생성, 수정, 삭제할 수 있습니다.
-	디버깅 및 모니터링: 리소스의 상태를 조회하고 로그를 확인하며, 문제를 진단할 수 있습니다.

## 설치 명령어
https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/

```sh
brew install kubectl

# 도커 데스크탑에 있는 kubectl보다 설치한 kubectl을 우선시
brew link --overwrite kubernetes-cli
```

## config 파일
- kubectl이 Kubernetes 클러스터에 연결할 때 사용하는 설정 파일
- 클러스터 정보, 사용자 인증 정보, 컨텍스트 등을 포함하여 kubectl이 어떤 클러스터에 어떻게 연결할지를 결정

```sh

> cat ~/.kube/config
# 설정 파일의 API 버전
apiVersion: v1
# 연결 가능한 Kubernetes 클러스터들의 정보 목록
clusters:
- cluster:
    certificate-authority: /Users/ioi01-ws_nam/.minikube/ca.crt # 클러스터 인증에 사용되는 CA 인증서 경로
    extensions: # 추가적인 확장 정보
    - extension:
        last-update: Thu, 28 Nov 2024 20:05:12 KST  # 마지막 업데이트 시간
        provider: minikube.sigs.k8s.io        # 클러스터 제공자 정보
        version: v1.34.0                      # Minikube의 버전
      name: cluster_info
    server: https://127.0.0.1:55497 # Kubernetes API 서버의 주소. 로컬에서 실행 중인 Minikube 클러스터
  name: minikube    # 클러스터 이름
# 클러스터와 사용자, 네임스페이스를 연결한 컨텍스트 정보
contexts:
- context:
    cluster: minikube # 연결할 클러스터의 이름
    extensions:
    - extension: # 추가적인 확장 정보
        last-update: Thu, 28 Nov 2024 20:05:12 KST
        provider: minikube.sigs.k8s.io
        version: v1.34.0
      name: context_info
    namespace: default # 기본적으로 사용할 네임스페이스
    user: minikube # 클러스터에 접근할 때 사용할 사용자 이름
  name: minikube # 컨텍스트의 이름
# 현재 활성화된 컨텍스트
current-context: minikube
# 리소스의 종류
kind: Config
# 사용자 선호 설정으로, 일반적으로 비어 있다.
preferences: {}
# 클러스터에 접근할 때 사용하는 사용자 인증 정보
users:
- name: minikube  # 사용자의 이름
  user:
    client-certificate: /Users/ioi01-ws_nam/.minikube/profiles/minikube/client.crt # 클라이언트 인증서의 경로
    client-key: /Users/ioi01-ws_nam/.minikube/profiles/minikube/client.key         # 클라이언트 키 파일의 경로
```
### config 명령어
```sh
# 현재 사용 중인 컨텍스트 확인
kubectl config current-context

# 사용 가능한 컨텍스트 목록 확인
kubectl config get-contexts

# 컨텍스트 전환
kubectl config use-context <context 이름 >
```

## cluster 명령어

```sh
# 현재 활성화된 Kubernetes 클러스터의 주요 컴포넌트(예: API 서버, DNS 서비스 등)에 대한 정보를 제공
kubectl cluster-info

Kubernetes control plane is running at https://127.0.0.1:55497  # 클러스터의 API 서버가 실행되고 있는 주소
CoreDNS is running at https://127.0.0.1:55497/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy # 클러스터 내에서 DNS 서비스를 제공하는 CoreDNS가 실행되고 있는 주소

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

## node 명령어
```sh
# 현재 활성화된 Kubernetes 클러스터 내의 모든 노드(Node)를 나열
kubectl get nodes

# ROLES: 노드의 역할
  # control-plane : 클러스터의 상태를 관리하고, 스케줄링을 담당
  # worker : 실제 애플리케이션 파드가 실행되는 노드
# AGE : 노드가 클러스터에 추가된 지 얼마나 되었는지를 표시
# VERSION : 노드에서 실행 중인 Kubernetes의 버전
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   17h   v1.24.1
```