# 쿠버네티스 Pod

## 개념
- 노드에서 container를 감싸고 있는 콩껍질 같은 개념
- 컨테이너를 실행하기 위한 가장 기본적인 배포 단위
- 여러 노드에 1개 이상의 pod을 분산 배포/실행 가능 (Pod Replicas) pod 복제본
  - 쿠버네티스가 하나의 pod 오브젝트 정의를 가지고 복제해서 여러 node에 분산 배포

## POD IP
![podip](../../images/kubernentes/podIp2.png)

- pod을 생성할 때 노드에서 유일한 IP를 할당해줌
  - 마치 하나의 서버처럼 동작
- 기본적으로 클러스터 내부에서만 접근 가능한 IP 이다.
  - 외부의 트래픽을 받기 위해서는 `service`, `ingress` 오브젝트의 도움이 필요
- pod 내부의 컨테이너들은 localhost로 통신 가능
  - 컨테이너들은 port는 다르게 실행시켜야 됨.

## Pod Volume
- pod 안의 볼륨을 컨테이너들은 공유 가능

## Pod 과 Container 관계

- 컨테이너들의 라이프 사이클이 같은지
  - Pod의 라이프사이클 == Continer 라이프 사이클
  - ex) A : app 컨테이너, B:  로그 수집 컨테이너. A 컨테이너가 없으면 B도 필요없음. 
  - 강결합인 경우 하나의 pod에 묶을 수 있음
- 스케일링 요구사항이 같은지
  - pod이 여러개 필요한 컨테이너인지
- 인프라 활용도가 높아지는 방향으로
  - 쿠버네티스는 노드 리소스를 고려해서 Pod를 스케쥴링
- 기본적으로 생성과 종료가 빈번하다보니 1:1 추천

## Pod 배포 과정
1. 쿠버네티스에 생성 요청
2. `API Server`가 요청을 받음
3. 요청 받은 이벤트가 `Replication Controller`에서 pod 생성 요청을 확인
4. 현재 0개인데 3개 요청이 들어오면 숫자 불일치를 확인
5. API Server에 추가로 3개 생성하라고 `API Server`에 전달
6. 이때 Pod에는 아직 node 정보가 없음
7. `Scheduler`가 node 정보가 없는 pod만 고름
8. node의 리소스를 파악해서 pod에 적잘한 node 정보를 기입
9. `kubelet` 자기가 실행되고 있는 Worker Node에 할당받은 pod 이벤트를 수신
10. pod 생성, container 실행의 역할을 `Container Runtime`에 위임
11. 생성된 container가 종료되거나 하면 `kubelet`은 container에 주기적으로 health check를 보냄
12. 상태결과를 API Server에 보고

### Kubernetes 스케줄러의 pod 배포 전략

#### 필터 단계 (Predicates)
- 자원 적합성(ResourceFit)
  - requests 기반 필터: 스케줄러는 각 노드의 **allocatable** 자원(총량)에서 **이미 예약된(requested) 자원**(현재 노드에 배포된 파드들의 requests 합계)을 차감한 뒤, 
    - capacity: 노드가 물리적으로 제공할 수 있는 총량
    - **allocatable**: 시스템 데몬(kubelet, kube-proxy 등)에 예약된 자원을 뺀, 팟에 할당 가능한 실제 자원 .
  - 파드의 requests.cpu 및 requests.memory 요구량이 남은 자원보다 작거나 같은 노드를 대상으로 합니다.
  - actual usage 미반영: 실시간 CPU/메모리 사용량(cAdvisor 지표)이나 limits 설정은 배치 판단에 전혀 사용되지 않습니다.
  - 그 외 필터: nodeSelector, nodeAffinity, taints/tolerations, volume binding 등 다른 조건도 모두 만족해야 후보 노드로 남습니다.

#### 점수 매김 단계 (Priority)

- NodeResourcesLeastRequested
  - 최소 요청 우선: 기본 프로파일에서는 NodeResourcesLeastRequested 우선순위 플러그인을 사용해, (남은 자원 ÷ 전체 allocatable) 비율이 높은 노드에 더 높은 점수를 부여합니다.
  - 이는 결과적으로 “가장 여유로운” 노드를 선택하도록 유도하며, 자원 파편화를 줄입니다.

- 기타 우선순위 플러그인
  - Pod Priority: priorityClassName이 높은 파드를 우선으로 스케줄링하며, 필요 시 저우선 파드를 선점(preempt)할 수 있습니다.
  - TopologySpread, Affinity/Anti-Affinity 등 추가 플러그인을 통해 사용자 정의 점수 매김도 가능합니다.

## Pod 한계
- ReplicaSet 오브젝트를 써야 pod이 종료되도 유지됨
- Pod IP는 생성될 때마다 변경됨.
  - service 오브젝트를 통해 Pod 집합의 고정된 엔드포인트 제공