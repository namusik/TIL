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

## 기본 명령어
```sh
# 쿠버네티스 클러스터에서 사용할 수 있는 오브젝트 목록 조회
kubectl api-resources 

kubectl api-resources | grep pod

# 쿠버네티스 오브젝트의 설명과 1레벨 속성들의 설명
# apiVersion, kind, metadata, spec, status
kubectl explain pod
kubectl explain deployment

# 쿠버네티스 오브젝트 속성들의 구체적인 설명 (Json 경로)
# kubectl explain <type>.<fieldName>[.<fieldName>]
kubectl explain pods.spec.containers

# 쿠버네티스 오브젝트 생성/변경
kubectl apply -f 01_06_deployment.yaml

# 애플리케이션 배포 개수를 조정 (replicas: 복제본)
kubectl scale -f deployment.yaml --replicas=3
> deployment.apps/nginx-deployment scaled

# 현재 실행 중인 오브젝트 설정과 입력한 파일의 차이점 분석
kubectl diff -f deployment.yaml
   progressDeadlineSeconds: 600
-  replicas: 3
+  replicas: 2

# 현재 실행중인 컨테이너 프로세스에 접속하여 로그 확인 (-c : container 이름 옵션)
kubectl attach deployment/nginx-deployment -c nginx

# 현재 실행중인 컨테이너 프로세스에 모든 로그 출력 (-f: watch 모드)
kubectl logs deployment/nginx-deployment -c nginx -f
```

## cluster 명령어

```sh
# 현재 활성화된 Kubernetes 클러스터의 주요 컴포넌트(예: API 서버, DNS 서비스 등)에 대한 정보를 제공
kubectl cluster-info

Kubernetes control plane is running at https://127.0.0.1:55497  # 클러스터의 API 서버가 실행되고 있는 주소
CoreDNS is running at https://127.0.0.1:55497/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy # 클러스터 내에서 DNS 서비스를 제공하는 CoreDNS가 실행되고 있는 주소

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

## deployment 명령어
```sh
kubectl get deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           5m16s

# 쿠버네티스 오브젝트의 spec을 editor로 편집 (replicas를 4로 변경)
kubectl edit deployment/nginx-deployment: 

# pod 복제본 개수 조정 가능
kubectl scale deployment orderapp --replicas 3
deployment.apps/nginx-deployment scaled

# deployment 삭제
kubectl delete -f 06_deployment.yaml
deployment.apps "nginx-deployment" deleted
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

## pod 명령어 
```sh
# 실행 중인 Pod(컨테이너) 목록 조회 
# -o wide : 상세정보까지 넓게
kubectl get pods --all-namespaces -o wide 

NAMESPACE : 해당 파드가 속한 네임스페이스를 표시
NAME   : 파드의 이름
READY : 파드 내에서 실행 중인 컨테이너 중 몇 개가 준비 상태인지
STATUS :  파드의 현재 상태        
-	Running: 파드가 실행 중이며 모든 컨테이너가 정상입니다.
-	Pending: 파드가 스케줄되었지만 아직 실행되지 않은 상태입니다. 자원 부족 등의 이유로 실행되지 않을 수 있습니다.
-	Succeeded: 파드의 컨테이너가 정상적으로 종료되어 더 이상 실행되지 않는 상태입니다.
-	Failed: 파드의 컨테이너가 오류로 종료된 상태입니다.
-	CrashLoopBackOff: 파드의 컨테이너가 계속해서 충돌하여 재시작되고 있는 상태입니다.
RESTARTS :  파드의 컨테이너가 얼마나 자주 재시작되었는지를 표시. 컨테이너가 충돌하거나 수동으로 재시작되면 카운트가 증가
AGE : 파드가 생성된 후 경과한 시간

# json 형식으로 확인
kubectl get pod hello-app -o json

# 컨테이너 IP 확인: 
kubectl exec <pod-name> [-c <container-name>] -- ifconfig eth0

# 컨테이너 환경변수 확인
kubectl exec <pod-name> -- env

# 컨테이너 네트워크 상태 확인
netstat: 네트워크 상태를 보여주는 도구로, 현재 열려 있는 네트워크 연결, 포트, 소켓 등을 확인할 수 있습니다.
-a: 모든 연결과 수신 대기 중인 포트를 표시합니다.
-n: 주소와 포트를 숫자 형식으로 표시하여 호스트 이름이나 서비스 이름으로 변환하지 않습니다.
kubectl exec -it hello-app -- netstat -an

# 로컬 포트는 파드에서 실행 중인 컨테이너 포트로 포워딩
# 개발중에 사용
kubectl port-forward hello-app 8080:8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080

# pod 삭제
kubectl delete pod hello-app
pod "hello-app" deleted

# pod 전체 삭제
kubectl delete pod --all


# container 로그 확인
kubectl logs blue-green-app -c blue-app

> blue-app@1.0.0 start
> nodemon --watch views --watch server.js server.js

[nodemon] 2.0.15
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): views/**/* server.js
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Server is running on 8080
```