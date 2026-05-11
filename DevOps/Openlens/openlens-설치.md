# OpenLens
https://docs.k8slens.dev/

## 설치
https://github.com/MuhammedKalkan/OpenLens

- 홈브루 설치
  - https://formulae.brew.sh/cask/openlens

## cluster 추가
https://docs.k8slens.dev/getting-started/add-cluster/

## EKS에서 쿠버네티스 정보 가져와서 openlens .kube 폴더에 넣어주기

https://docs.k8slens.dev/cluster/aws-eks/?h=eks

https://dev.to/aws-builders/managing-aws-eks-clusters-locally-using-lens-5n6

aws eks update-kubeconfig \
            --region ap-northeast-2 \
            --name {eks 이름} \
            --kubeconfig {폴더경로/파일이름}

## extension 설치

https://www.npmjs.com/package/@nevalla/kube-resource-map

위에서 검색

- @nevalla/kube-resource-map
  - k8s 리소스 관계를 그림으로 보여주는 extension. Deploy, Statefulset, Daemonset, pod, service, ingress에서 사용 가능
- @andrea-falco/lens-multi-pod-logs
  - 디플로이에 연결된 복수 개의 파드 로그를 볼 수 있는 extension
- @alebcay/openlens-node-pod-menu
  - node, pod 메뉴를 볼 수 있는 extension