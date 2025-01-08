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