# fluentd

https://www.fluentd.org/

## 정의
- 오픈 소스 데이터 수집기
- 다양한 소스로부터 데이터를 수집하여 여러 목적지로 전송하는 역할
- 특히 쿠버네티스 환경에서는 파드 내 컨테이너들이 생성하는 로그를 효과적으로 수집하고 중앙 집중식 로깅 시스템(예: Elasticsearch, Kafka, S3 등)으로 보내는 데 널리 활용

## 로그 수집 방식
1. DaemonSet으로 배포
   1. 보통 쿠버네티스 클러스터의 각 노드(Node)에 **데몬셋(DaemonSet)** 형태로 배포됨.
   2. 클러스터에 새로운 노드가 추가될 때마다 **해당 노드에도 자동으로 Fluentd 파드가 생성**되어 로그 수집을 시작
2. 로그 파일 접근
   1. 각 노드에서 실행되는 Fluentd 파드는 해당 노드의 **특정 디렉토리** (일반적으로 /var/log/containers 또는 /var/log/pods)에 **저장된 컨테이너 로그 파일에 접근**.
      1. 쿠버네티스는 컨테이너의 표준 출력(stdout)과 표준 에러(stderr)를 이 디렉토리에 파일 형태로 저장.
3. 로그 파싱 및 필터링
   1. Fluentd는 수집한 로그를 파싱하여 **구조화된 데이터로 변환**한다.
      1. 이때, 로그 형식(예: JSON, 정규식)에 맞춰 파서를 설정 가능
      2. 또한, 특정 조건에 맞는 로그만 선택하거나, 로그에 추가 정보를 덧붙이는 등의 필터링 작업도 수행 가능 
         1. 예를 들어, 쿠버네티스 메타데이터(파드 이름, 네임스페이스, 레이블 등)를 로그에 추가하여 나중에 검색과 분석을 용이하게 할 수 있다.
4. 데이터 전송: 
   1. 처리된 로그는 설정된 목적지로 전송됨.
   2. Fluentd는 다양한 출력 플러그인(Output Plugin)을 지원하여 Elasticsearch, Kafka, Fluent Bit, Splunk, Amazon S3, Google Cloud Logging 등 여러 시스템과 쉽게 연동 가능하다.

## 특징
- 유연성 및 확장성
  - 풍부한 플러그인 생태계를 통해 다양한 입력 소스와 출력 목적지를 지원.
- 신뢰성
  - 버퍼링 기능을 제공하여 네트워크 문제나 목적지 시스템의 일시적인 장애 발생 시 로그 유실을 방지. 메모리 또는 파일 기반 버퍼를 사용할 수 있다.
- 경량성
  - Fluent Bit이라는 더 가볍고 성능에 중점을 둔 버전도 존재하며, 리소스가 제한적인 환경에서 Fluentd 대신 사용되거나 함께 사용될 수 있다. (Fluent Bit이 로그를 수집하여 Fluentd로 전달하는 구조)
- 통합 용이성
  - 쿠버네티스와의 통합이 용이하며, 관련 설정 및 배포 자료가 풍부
- 데이터 변환
  - 로그를 원하는 형식으로 쉽게 변환하고 풍부하게 만들 수 있는 다양한 필터 플러그인을 제공

## 배포
- DaemonSet으로 배포하는 것이 가장 일반적
### Fluentd Docker 이미지 준비
- 공식 이미지 사용
  - Docker Hub 등에서 제공하는 **공식 Fluentd 이미지** (fluent/fluentd, fluent/fluentd-kubernetes-daemonset 등)를 사용.
  - 이 이미지들은 쿠버네티스 환경에 필요한 플러그인(예: fluent-plugin-kubernetes_metadata_filter)이 미리 설치되어 있는 경우가 많습니다.

### Fluentd 설정 파일 (ConfigMap 생성):
- Fluentd의 **동작 방식**(입력, 필터, 출력)을 정의하는 설정 파일(**fluent.conf** 또는 다른 이름)을 작성합니다.
- 이 설정 파일은 **ConfigMap 리소스로 만들어 쿠버네티스 클러스터에 저장**합니다. Fluentd 파드는 이 **ConfigMap을 볼륨으로 마운트**하여 설정을 읽어옴.

#### fluent.conf 예시
```conf
# ============== INPUTS ==============
# 호스트의 컨테이너 로그 수집
# 로그를 수집할 대상과 방법을 정의합니다. (예: 파일, HTTP, TCP)
<source>
  @type tail
  @id in_tail_container_logs
  path /var/log/containers/*.log  # 컨테이너 로그 파일 경로
  pos_file /var/log/fluentd-containers.log.pos
  tag kubernetes.* # 로그에 태그 부여
  read_from_head true
  <parse>
    @type cri                     # Container Runtime Interface 로그 형식 (containerd, CRI-O)
                                  # Docker의 경우 json 또는 다른 파서 사용 가능
  </parse>
</source>

# ============== FILTERS ==============
# 쿠버네티스 메타데이터 추가 (파드 이름, 네임스페이스, 레이블 등)
# 매칭된 로그를 변환하거나 필터링
<filter kubernetes.**>
  @type kubernetes_metadata
  @id filter_kube_metadata
</filter>

# ============== OUTPUTS ==============
# 특정 태그(tag)를 가진 로그를 어떻게 처리하고 어디로 보낼지 정의
# 예시: Elasticsearch로 전송
<match kubernetes.**>
  @type elasticsearch
  @id out_es
  host YOUR_ELASTICSEARCH_HOST
  port YOUR_ELASTICSEARCH_PORT
  logstash_format true
  logstash_prefix fluentd
  # ... 기타 Elasticsearch 설정 ...

  # 버퍼 설정 (로그 유실 방지)
  <buffer>
    @type file
    path /var/log/fluentd-buffers/kubernetes.system.buffer
    flush_interval 10s
  </buffer>
</match>

# Fluentd 내부 로그 출력 (디버깅용)
<match fluent.**>
  @type stdout
</match>
```

#### configMap.yml 예시
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: kube-system # 또는 로깅 전용 네임스페이스
data:
  fluent.conf: |
    # 위에 작성한 fluent.conf 내용을 여기에 넣습니다.
    <source>
      @type tail
      # ... (나머지 설정)
    </source>
    <filter kubernetes.**>
      @type kubernetes_metadata
      # ... (나머지 설정)
    </filter>
    <match kubernetes.**>
      @type elasticsearch
      # ... (나머지 설정)
    </match>
```

### RBAC 설정 (ServiceAccount, ClusterRole, ClusterRoleBinding)

- Fluentd 파드가 **쿠버네티스 API에 접근**하여 파드 **메타데이터**(이름, 네임스페이스, 레이블 등)를 가져오고, **노드의 로그 파일**(/var/log/containers)에 접근하려면 적절한 **권한이 필요**

#### rbac.yaml 예시
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluentd
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluentd
rules:
- apiGroups: [""]
  resources: ["pods", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["nodes/proxy"] # kubelet API 접근 권한 (로그 수집 방식에 따라 필요할 수 있음)
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluentd
roleRef:
  kind: ClusterRole
  name: fluentd
  apiGroup: rbac.authorization.k8s.io
subjects:
- kind: ServiceAccount
  name: fluentd
  namespace: kube-system
```

### DemonSet 배포

```yaml
# Kubernetes API 버전을 명시합니다. DaemonSet은 apps/v1 그룹에 속합니다.
apiVersion: apps/v1
# 리소스의 종류를 명시합니다. 여기서는 DaemonSet을 사용합니다.
# DaemonSet은 클러스터의 모든 (또는 특정 레이블을 가진) 노드에 파드 복제본을 하나씩 실행하도록 보장합니다.
kind: DaemonSet
# DaemonSet 리소스의 메타데이터입니다.
metadata:
  # DaemonSet의 고유한 이름입니다.
  name: fluentd-eks
  # 이 DaemonSet이 배포될 네임스페이스입니다.
  # AWS EKS 환경에서는 'amazon-cloudwatch', 'aws-observability' 또는 일반적인 'kube-system', 'logging' 등을 사용할 수 있습니다.
  # 여기서는 'kube-system'을 예시로 사용합니다.
  namespace: kube-system # Fluentd 파드가 시스템 수준에서 동작하므로 kube-system이 적합할 수 있습니다.
  # DaemonSet을 식별하고 관리하기 위한 레이블입니다.
  labels:
    k8s-app: fluentd-logging # Kubernetes 애플리케이션임을 나타내는 표준 레이블
    app: fluentd           # 애플리케이션 이름 레이블
    version: v1.0          # 버전 관리용 레이블 (선택 사항)
    # EKS 환경임을 명시하는 레이블 추가 가능 (예: environment: eks)
# DaemonSet의 상세 스펙을 정의합니다.
spec:
  # 이 selector는 DaemonSet이 관리할 파드를 식별합니다.
  # 아래 template.metadata.labels와 일치해야 합니다.
  selector:
    matchLabels:
      k8s-app: fluentd-logging
      app: fluentd
  # DaemonSet에 의해 생성될 파드의 템플릿입니다.
  template:
    # 파드의 메타데이터입니다.
    metadata:
      # DaemonSet의 selector와 일치하는 레이블을 지정합니다.
      labels:
        k8s-app: fluentd-logging
        app: fluentd
        version: v1.0 # DaemonSet selector와 일치하도록 버전 레이블 포함
      # 파드에 특정 어노테이션을 추가할 수 있습니다. (예: Prometheus 스크랩 설정, IRSA 설정 등)
      # annotations:
      #   iam.amazonaws.com/role: arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/YOUR_EKS_FLUENTD_IAM_ROLE # EKS IRSA 사용 시
    # 파드의 스펙을 정의합니다.
    spec:
      # Fluentd 파드가 사용할 ServiceAccount의 이름입니다.
      # AWS EKS 환경에서는 이 ServiceAccount에 IAM 역할을 연결하여 (IRSA - IAM Roles for Service Accounts),
      # Fluentd 파드가 AWS 서비스(예: CloudWatch Logs)에 안전하게 접근하도록 하는 것이 권장됩니다.
      # 이 ServiceAccount와 IAM 역할은 별도로 생성 및 구성해야 합니다.
      serviceAccountName: fluentd # 'fluentd'라는 이름의 ServiceAccount 사용 (사전 생성 필요)

      # 특정 테인트(taint)가 있는 노드에도 Fluentd 파드를 스케줄링하기 위한 tolerations 설정입니다.
      # 예를 들어, 마스터/컨트롤플레인 노드에도 배포하려면 해당 테인트를 허용해야 합니다.
      # 기본 EKS 워커 노드에는 특별한 toleration이 필요 없을 수 있습니다.
      tolerations:
        - key: node-role.kubernetes.io/master # 마스터 노드의 테인트 허용 (구 버전)
          effect: NoSchedule
        - key: node-role.kubernetes.io/control-plane # 컨트롤 플레인 노드의 테인트 허용 (최신 버전)
          effect: NoSchedule
        # EKS에서 특정 인스턴스 그룹이나 Fargate 프로파일에 따라 추가 toleration이 필요할 수 있습니다.

      # 파드의 우선순위를 지정합니다. 중요한 시스템 파드인 경우 높은 우선순위를 부여할 수 있습니다. (선택 사항)
      # priorityClassName: system-node-critical

      # 컨테이너가 호스트의 네트워크 네임스페이스를 사용할지 여부입니다.
      # Fluentd가 노드의 다른 서비스와 통신해야 하는 특정 경우가 아니라면 false가 일반적입니다.
      hostNetwork: false

      # 파드의 DNS 정책입니다. ClusterFirst가 기본값입니다.
      dnsPolicy: ClusterFirst

      # 파드 내에서 실행될 컨테이너 목록입니다. Fluentd는 단일 컨테이너로 실행됩니다.
      containers:
      - name: fluentd # 컨테이너의 이름
        # 사용할 Fluentd Docker 이미지입니다.
        # AWS EKS 환경에서는 CloudWatch Logs 플러그인(fluent-plugin-cloudwatch-logs)이 포함된 이미지를 사용해야 합니다.
        # 공식 Fluentd 이미지, AWS에서 제공하는 이미지, 또는 직접 빌드한 커스텀 이미지를 사용할 수 있습니다.
        # 예시: 'fluent/fluentd-kubernetes-daemonset'의 특정 태그 또는 AWS ECR의 이미지
        image: fluent/fluentd-kubernetes-daemonset:v1.16-debian-cloudwatch-1 # CloudWatch 플러그인이 포함된 이미지 예시 (실제 사용 가능한 최신 태그 확인 필요)
        # image: public.ecr.aws/aws-observability/aws-for-fluent-bit:latest # Fluent Bit을 사용하는 경우의 AWS 제공 이미지 예시 (Fluentd와는 다름)

        # 컨테이너에 설정할 환경 변수입니다.
        # fluent.conf 파일 내에서 이 환경 변수들을 참조하여 동적으로 설정을 구성할 수 있습니다.
        env:
          # AWS 리전을 환경 변수로 전달 (CloudWatch Logs 플러그인이 사용)
          - name: AWS_REGION
            value: "ap-northeast-2" # EKS 클러스터가 위치한 AWS 리전으로 변경
          # CloudWatch Logs 그룹 이름을 환경 변수로 전달 (선택 사항, fluent.conf에서 직접 지정 가능)
          # - name: CLOUDWATCH_LOG_GROUP_NAME
          #   value: "/aws/eks/fluentd/logs" # 예시 로그 그룹 이름
          # Fluentd가 실행 중인 노드의 이름을 가져와 로그에 추가하거나 식별자로 사용할 수 있습니다.
          - name: K8S_NODE_NAME
            valueFrom:
              fieldRef:
                apiVersion: v1 # Kubernetes API 버전
                fieldPath: spec.nodeName # 파드가 실행 중인 노드의 이름을 참조

        # 컨테이너의 리소스 요청 및 제한입니다.
        # EKS 노드 인스턴스 유형, 예상 로그 볼륨, Fluentd 설정의 복잡도에 따라 적절히 조절해야 합니다.
        # 너무 낮게 설정하면 OOMKilled 등의 문제가 발생할 수 있고, 너무 높으면 리소스 낭비가 됩니다.
        resources:
          requests: # 최소 보장 리소스
            cpu: "100m"    # CPU 0.1 코어
            memory: "200Mi"  # 메모리 200 MiB
          limits:   # 최대 사용 가능 리소스
            cpu: "1"       # CPU 1 코어
            memory: "500Mi"  # 메모리 500 MiB

        # 컨테이너 내부로 마운트할 볼륨 목록입니다.
        volumeMounts:
        # 1. Fluentd 설정 파일 (fluent.conf)이 포함된 ConfigMap을 마운트합니다.
        - name: config-volume # 아래 volumes 섹션에 정의된 볼륨 이름과 일치해야 함
          mountPath: /fluentd/etc # Fluentd가 설정 파일을 찾는 표준 경로 중 하나
          readOnly: true         # 설정 파일은 읽기 전용으로 마운트

        # 2. 호스트 노드의 컨테이너 로그 디렉토리를 마운트합니다. (읽기 전용)
        # EKS는 주로 containerd를 사용하므로 /var/log/pods 와 /var/log/containers 가 중요합니다.
        # /var/log 전체를 마운트하여 하위의 로그 파일 및 심볼릭 링크에 접근합니다.
        - name: varlog
          mountPath: /var/log
          readOnly: true
        # Docker 런타임을 사용하는 경우 (EKS 초기 버전 또는 커스텀 AMI) /var/lib/docker/containers 경로도 필요할 수 있습니다.
        # 최신 EKS는 containerd가 기본이므로 이 마운트는 선택적이거나 필요 없을 수 있습니다.
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true

        # 3. Fluentd 파일 버퍼를 위한 볼륨을 마운트합니다.
        # 네트워크 또는 로그 백엔드 장애 시 로그 유실을 방지하기 위해 파일 버퍼를 사용합니다.
        # 호스트 경로를 사용하여 파드가 재시작되어도 버퍼가 유지되도록 합니다.
        - name: fluentd-buffer
          mountPath: /fluentd/buffer # fluent.conf의 버퍼 설정 경로와 일치해야 함

        # 컨테이너의 보안 컨텍스트를 설정합니다. (선택 사항)
        # 일부 로그 소스 접근이나 시스템 호출을 위해 권한 상승이 필요할 수 있으나, 최소 권한 원칙을 따르는 것이 좋습니다.
        # securityContext:
        #   privileged: true # 매우 높은 권한을 부여하므로 신중하게 사용해야 합니다.
        #   runAsUser: 0     # root 사용자로 실행

      # 파드 종료 요청 시, 컨테이너가 정상적으로 종료될 수 있도록 주어지는 유예 시간(초)입니다.
      # Fluentd가 버퍼의 데이터를 안전하게 전송(flush)할 시간을 확보합니다.
      terminationGracePeriodSeconds: 30

      # 파드 레벨에서 정의되는 볼륨 목록입니다. 위 volumeMounts에서 참조됩니다.
      volumes:
      # 1. Fluentd 설정 파일(fluent.conf 등)을 담고 있는 ConfigMap을 참조하는 볼륨입니다.
      # 이 ConfigMap은 'fluentd-config-eks'라는 이름으로 미리 생성되어 있어야 합니다.
      - name: config-volume
        configMap:
          name: fluentd-config-eks # ConfigMap의 이름

      # 2. 호스트 노드의 /var/log 디렉토리를 참조하는 hostPath 볼륨입니다.
      - name: varlog
        hostPath:
          path: /var/log # 호스트의 /var/log 경로

      # 3. (선택 사항) 호스트 노드의 /var/lib/docker/containers 디렉토리를 참조하는 hostPath 볼륨입니다.
      # EKS에서 containerd를 주로 사용하므로, 이 볼륨은 필수가 아닐 수 있습니다.
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers

      # 4. Fluentd 파일 버퍼를 저장할 호스트 경로를 참조하는 hostPath 볼륨입니다.
      # 이 경로는 각 EKS 노드에 실제로 존재해야 하며, Fluentd 파드가 읽고 쓸 수 있는 권한이 필요합니다.
      # 노드 부팅 스크립트(user data) 등을 통해 디렉토리를 생성하고 권한을 설정할 수 있습니다.
      - name: fluentd-buffer
        hostPath:
          path: /var/log/fluentd-buffer # 예시 경로, 실제 환경 및 권한에 맞게 조정 필요
          # type: DirectoryOrCreate # Kubernetes v1.17+에서 사용 가능, 디렉토리가 없으면 생성.
                                   # 사용 시 노드의 파일 시스템 권한과 SELinux 등 보안 설정을 고려해야 합니다.
```