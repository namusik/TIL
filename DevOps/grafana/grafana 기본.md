# Grafana


## 명령어 

```shell
kubectl get pods --all-namespaces -l app.kubernetes.io/name=grafana 
```
- 모든 네임스페이스에서 Grafana 파드를 검색

```shell
kubectl get deployment grafana -n <namespace> -o yaml
```
- dev-ops 네임스페이스의 Grafana 배포 정보를 YAML 형식으로 조회

```shell
kubectl get service grafana -n dev-ops -o yaml
```
- dev-ops 네임스페이스의 Grafana 서비스 정보를 YAML 형식으로 조회

```shell
kubectl get ingress -n dev-ops -o yaml
```
- dev-ops 네임스페이스의 모든 Ingress 정보를 YAML 형식으로 조회

```shell
kubectl get configmap grafana -n dev-ops -o yaml
```
- dev-ops 네임스페이스의 Grafana ConfigMap 정보를 YAML 형식으로 조회

```shell
helm get all grafana -n dev-ops
```
- dev-ops 네임스페이스의 grafana 릴리스에 대한 모든 정보를 조회
