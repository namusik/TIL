# Prometheus 이슈.

- Openlens에서 container의 cpu, memory 그래프가 보이지 않음.
```sh
kubectl get pods --all-namespaces -o wide --kubeconfig=/Users/ioi01-ws_nam/.kube/mega-dev
```
prometheus    kube-prometheus-stack-kube-state-metrics-859b47db84-dj2fx         0/1     ContainerStatusUnknown   14 (52d ago)      170d    10.0.153.223   ip-10-0-156-187.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-kube-state-metrics-859b47db84-rfbx4         1/1     Running                  27 (8h ago)       52d     10.0.143.93    ip-10-0-138-173.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-operator-58b7fdfc46-2lq7d                   1/1     Running                  0                 51d     10.0.148.21    ip-10-0-156-187.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-operator-58b7fdfc46-4hxzz                   1/1     Terminating              0                 170d    10.0.139.72    ip-10-0-128-48.ap-northeast-2.compute.internal    <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-2v2xh              1/1     Running                  561 (2d8h ago)    224d    10.0.143.49    ip-10-0-143-49.ap-northeast-2.compute.internal    <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-52bw4              0/1     Running                  2 (52d ago)       52d     10.0.128.48    ip-10-0-128-48.ap-northeast-2.compute.internal    <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-5x4q7              1/1     Running                  299 (9h ago)      224d    10.0.138.173   ip-10-0-138-173.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-7qxqj              1/1     Running                  198 (32h ago)     224d    10.0.158.208   ip-10-0-158-208.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-jvggb              1/1     Running                  0                 224d    10.0.131.179   ip-10-0-131-179.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-n6pg7              1/1     Running                  0                 224d    10.0.158.240   ip-10-0-158-240.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-nr5fm              1/1     Running                  0                 224d    10.0.143.214   ip-10-0-143-214.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-pw8ks              1/1     Running                  3 (45d ago)       52d     10.0.156.187   ip-10-0-156-187.ap-northeast-2.compute.internal   <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-qhfxp              1/1     Running                  0                 224d    10.0.149.42    ip-10-0-149-42.ap-northeast-2.compute.internal    <none>           <none>
prometheus    kube-prometheus-stack-prometheus-node-exporter-vskc7              1/1     Running                  238 (46d ago)     224d    10.0.156.120   ip-10-0-156-120.ap-northeast-2.compute.internal   <none>           <none>
prometheus    prometheus-kube-prometheus-stack-prometheus-0                     2/2     Running                  0                 8m26s   10.0.154.122   ip-10-0-156-187.ap-northeast-2.compute.internal   <none>           <none>
prometheus    prometheus-kube-prometheus-stack-prometheus-1                     0/2     Init:0/1                 0                 50d     <none>         ip-10-0-128-48.ap-northeast-2.compute.internal    <none>           <none>

- stack-prometheus가 미동작중이었다.

```sh
kubectl describe pod prometheus-kube-prometheus-stack-prometheus-1 -n prometheus --kubeconfig=/Users/ioi01-ws_nam/.kube/mega-dev
```

Events:
  Type     Reason       Age                   From     Message
  ----     ------       ----                  ----     -------
  Warning  FailedMount  4m (x35958 over 50d)  kubelet  MountVolume.MountDevice failed for volume "pvc-a1f57d82-033f-41c9-a1a4-b086815b5c38" : rpc error: code = Unavailable desc = connection error: desc = "transport: Error while dialing: dial unix /var/lib/kubelet/plugins/efs.csi.aws.com/csi.sock: connect: resource temporarily unavailable"

- Prometheus 파드가 PersistentVolumeClaim(PVC)을 마운트하지 못해 Pending 상태로 멈춰버림

## EFS CSI 드라이버 파드 확인

```sh
kubectl get pods -n kube-system --kubeconfig=/Users/ioi01-ws_nam/.kube/mega-dev
```

efs-csi-controller-7cbfcdb44-bv47m                                3/3     Running   183 (8h ago)        224d
efs-csi-controller-7cbfcdb44-jrz9s                                3/3     Running   217 (8h ago)        170d
efs-csi-node-7dcx4                                                3/3     Running   23 (45d ago)        170d
efs-csi-node-cgx8j                                                3/3     Running   450 (5d8h ago)      224d
efs-csi-node-db5df                                                3/3     Running   0                   224d
efs-csi-node-fbn6w                                                3/3     Running   11 (52d ago)        170d
efs-csi-node-kggbv                                                3/3     Running   600 (8h ago)        224d
efs-csi-node-kmbl5                                                3/3     Running   435 (8h ago)        224d
efs-csi-node-m8qm8                                                3/3     Running   0                   224d
efs-csi-node-nwrfg                                                3/3     Running   0                   224d
efs-csi-node-qlsxq                                                3/3     Running   1198 (8h ago)       224d
efs-csi-node-rrzfl                                                3/3     Running   0                   224d

## PersistentVolumeClaim (PVC) 상태 확인
- Prometheus 파드가 사용하는 PVC가 올바르게 설정되고, 바인딩 상태인지 확인합니다.
```sh
kubectl get pvc -n prometheus --kubeconfig=/Users/ioi01-ws_nam/.kube/mega-dev

NAME                                                                                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      VOLUMEATTRIBUTESCLASS   AGE
prometheus-kube-prometheus-stack-prometheus-db-prometheus-kube-prometheus-stack-prometheus-0   Bound    pvc-b130a88d-dc42-457e-8e20-1e914dfe55c6   50Gi       RWO            aws-efs-storage   <unset>                 405d
prometheus-kube-prometheus-stack-prometheus-db-prometheus-kube-prometheus-stack-prometheus-1   Bound    pvc-a1f57d82-033f-41c9-a1a4-b086815b5c38   50Gi       RWO            aws-efs-storage   <unset>                 405d
```

## PVC 상세 정보 확인
-  StorageClass가 올바르게 EFS를 참조하고 있는지 확인
```sh
kubectl describe pvc prometheus-kube-prometheus-stack-prometheus-db-prometheus-kube-prometheus-stack-prometheus-1 -n prometheus --kubeconfig=/Users/ioi01-ws_nam/.kube/mega-dev

Name:          prometheus-kube-prometheus-stack-prometheus-db-prometheus-kube-prometheus-stack-prometheus-1
Namespace:     prometheus
StorageClass:  aws-efs-storage
Status:        Bound
Volume:        pvc-a1f57d82-033f-41c9-a1a4-b086815b5c38
Labels:        app.kubernetes.io/instance=kube-prometheus-stack-prometheus
               app.kubernetes.io/managed-by=prometheus-operator
               app.kubernetes.io/name=prometheus
               operator.prometheus.io/name=kube-prometheus-stack-prometheus
               operator.prometheus.io/shard=0
               prometheus=kube-prometheus-stack-prometheus
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: efs.csi.aws.com
               volume.kubernetes.io/storage-provisioner: efs.csi.aws.com
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      50Gi
Access Modes:  RWO
VolumeMode:    Filesystem
Used By:       prometheus-kube-prometheus-stack-prometheus-1
Events:        <none>
```