# newrelic



## 관련 명령어

```sh
kubectl get pod -n newrelic -l app.kubernetes.io/name=newrelic-infrastructure \
  -o=jsonpath='{.items[0].metadata.labels}'
```