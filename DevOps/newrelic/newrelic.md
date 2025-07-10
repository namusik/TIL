# newrelic

## 구성

vizier-pem-qxjrq -> pl-nats-0 -> vizier-query-broker
데이터 수집  -> 중간 다리 역할 -> 중앙


## vizier-cloud-connector
- New Relic의 Pixie 통합에서 클러스터 내의 Pixie 배포(Vizier)와 New Relic Pixie 클라우드 간의 핵심적인 연결 다리(Bridge) 역할
- vizier-pem 파드들이 vizier-cloud-connector에 등록
   1. 에이전트 등록 및 관리: vizier-pem 파드들은 각 노드에서 데이터를 수집하는 에이전트입니다. 이 에이전트들은 클러스터에 배포된 후, **자신이 활성화되었음을 vizier-cloud-connector에 알리고 등록**해야 합니다. vizier-cloud-connector는 이렇게 등록된 pem 에이전트들을 관리하고, 이들에게 필요한 설정이나 명령을 전달하는 역할을 합니다.
   2. 데이터 파이프라인 설정: vizier-pem이 수집한 데이터는 vizier-cloud-connector를 통해 New Relic Pixie 클라우드로 전송됩니다. 등록 과정은 이 데이터 파이프라인을 설정하고, pem 에이전트가 어디로 데이터를 보내야 하는지 알게 되는 중요한 단계입니다.
   3. 보안 통신: vizier-cloud-connector는 클러스터 내부와 외부(Pixie 클라우드) 간의 모든 통신을 암호화하고 인증하는 보안 게이트웨이 역할도 수행합니다.



## pl-nats-0 (NATS 서버)
- 클러스터 내부의 고속 우편 시스템 (메시지 브로커)


## 역할 정리

- vizier-pem은 데이터를 수집하는 현장 요원입니다.
- vizier-cloud-connector는 현장 요원들의 보고를 받고, 이를 본부(Pixie 클라우드)에 전달하는 중간 관리자입니다.
-    * 주요 역할: 클러스터 내부의 다양한 Pixie 컴포넌트들(예: vizier-pem, vizier-query-broker, vizier-metadata 등) 간에 실시간으로 대량의 메시지(데이터 스트림)를 빠르고 안정적으로 주고받을 수 있도록 하는 메시지 브로커입니다.
   * 통신 범위: 클러스터 내부 통신에 집중합니다. 컴포넌트들은 NATS에 메시지를 발행(publish)하거나 구독(subscribe)하여 서로 통신합니다.
   * 데이터 종류: 주로 vizier-pem이 수집한 원시 텔레메트리 데이터, 내부 제어 메시지 등 고속으로 처리되어야 하는 스트리밍 데이터입니다.
   * 비유: 클러스터 내의 모든 부서(파드)가 사용하는 초고속 사내 메신저 서버라고 생각할 수 있습니다. 각 부서는 이 메신저를 통해 서로에게 데이터를 보냅니다.

```sh
kubectl get statefulset pl-nats -n newrelic  --kubeconfig=mega-prod
```


## 관련 명령어

```sh
kubectl get pod -n newrelic -l app.kubernetes.io/name=newrelic-infrastructure \
  -o=jsonpath='{.items[0].metadata.labels}'
```


## 현재 버전 확인하기 

```sh
helm list -n newrelic --kubeconfig=mega-prod
```

- nri-bundle-5.0.4
