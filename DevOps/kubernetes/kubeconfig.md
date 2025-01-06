# kubeconfig 파일
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
    server: https://127.0.0.1:55497 # Kubernetes Master Node API 서버의 주소. (로컬에서 실행 중인 Minikube 클러스터)
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
## config 명령어
```sh
# 현재 사용 중인 컨텍스트 확인
kubectl config current-context

# 사용 가능한 컨텍스트 목록 확인
kubectl config get-contexts

# 컨텍스트 전환
kubectl config use-context <context 이름 >
```