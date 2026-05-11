# Helm

Helm은 **쿠버네티스용 패키지 매니저(package manager)**.

kubectl apply로 YAML 여러 장을 직접 관리하던 방식을, 버전/의존성/배포 단위로 표준화해서 설치·업그레이드·롤백까지 일관되게 처리하는 도구

---

## Helm이 해결하려는 문제

쿠버네티스에 Argo CD 같은 시스템을 올릴 때 실제로는 아래 리소스가 한 번에 들어간다.
- Namespace
- Deployment / StatefulSet
- Service / Ingress
- ConfigMap / Secret
- ServiceAccount / Role / RoleBinding / ClusterRole…
- CRD(CustomResourceDefinition) 및 CR(커스텀 리소스)
- HPA, PodDisruptionBudget, NetworkPolicy 등

이를 kubectl apply -f로 직접 관리하면 보통 문제가 생깁니다.
- YAML 파일 수가 많아지고, 환경(dev/stage/prod)별 값 차이가 커짐
- 업그레이드 시 어떤 변경이 들어가는지 추적이 어려움
- 실패 시 원복(roll back) 이 번거로움
- 다른 팀/클러스터에서도 재현 가능한 설치 방식을 만들기 어려움
- CRD/권한/RBAC/Ingress 등 순서와 의존성 이슈

Helm은 이걸 “패키지 설치”처럼 다루게 해줍니다.

---

## Helm의 핵심 구성요소

### Chart
- Helm 패키지 단위입니다.
- “어떤 쿠버네티스 리소스들을 어떤 템플릿으로 배포할지” 묶어 둔 것.
- 보통 오픈소스 프로젝트(Argo CD 포함)가 **공식 Helm Chart를 제공**합니다.

구성 예:
- Chart.yaml : 차트 메타데이터(이름/버전/의존성 등)
- values.yaml : 기본 설정 값(사용자가 덮어쓸 값)
- templates/ : 쿠버네티스 YAML 템플릿(Go template)
- charts/ : 의존 차트(서브차트)

### Values
- 환경별로 바뀌는 값을 values.yaml 또는 --set으로 주입합니다.
- 예: 도메인, Ingress class, replica 수, 리소스 제한, nodeSelector 등

### Release
- “차트를 특정 설정(values)으로 특정 클러스터에 설치한 **결과물**”을 릴리스라고 부릅니다.
- 같은 chart라도 values가 다르면 서로 다른 release가 됩니다.
- Helm은 release 단위로 업그레이드/롤백/삭제를 수행합니다.

### Repository
- 차트를 배포해 둔 저장소(HTTP 기반).
- helm repo add, helm install로 가져와 설치합니다.

---

## Helm이 실제로 하는 일(동작 원리)

1.	Chart 템플릿 + Values를 합쳐서
2.	최종 쿠버네티스 YAML을 렌더링(render)하고
3.	쿠버네티스 API에 적용
4.	그리고 “이 릴리스가 어떤 리소스를 어떤 버전으로 설치했는지”를 클러스터 내부에 기록

이 기록 덕분에:
- helm upgrade가 “변경분”을 계산해 반영하고
- 실패 시 helm rollback이 가능해집니다.

---

## kubectl apply vs Helm vs Kustomize (운영 관점 차이)

kubectl apply
- 장점: 단순함, 쿠버네티스 기본
- 단점: 배포 단위/버전/롤백/환경별 관리가 커지면 복잡해짐

Kustomize
- 장점: 템플릿 없이 “패치/오버레이”로 환경별 YAML 관리가 깔끔
- 단점: 앱이 복잡하고 의존성이 있거나, 설치/업그레이드/롤백 “패키지 경험”은 Helm이 더 강함

Helm
- 장점: 패키지 설치 경험, 업그레이드/롤백/의존성/버전 관리가 강함
- 단점: 템플릿 복잡도, values 설계가 나쁘면 유지보수 난이도 상승

Argo CD 같은 “플랫폼 컴포넌트”는 대체로 Helm의 장점이 크게 먹힙니다.

---

## “EKS에 Argo 설치할 때 Helm으로 하라”는 이유 (실무적으로)

Argo CD 설치는 단순한 Deployment 하나가 아니라:
	-CRD, RBAC, 여러 컨트롤러/서버 컴포넌트
	-Ingress/Service 구성
	-인증(OIDC), repo credentials, TLS, admin 설정 등
	-업그레이드 시 버전 호환성/마이그레이션

이게 얽혀 있습니다.

그래서 Helm을 쓰면:
	1.	공식 차트가 검증된 기본값과 리소스 구성을 제공
	2.	버전 업 시 helm upgrade로 변경을 통제 가능
	3.	실패 시 helm rollback로 빠르게 원복 가능
	4.	values.yaml만 바꿔서 dev/prod 차이를 관리하기 쉬움
	5.	“설치 방식 표준화”로 팀/클러스터 확장에 유리

특히 EKS에서는 Ingress Controller(ALB Controller 등), IRSA(IAM Roles for Service Accounts), 외부DNS, 인증 연동 등 클러스터별 설정이 많아서 values로 주입하는 방식이 운영에 잘 맞습니다.

---

## Helm을 쓸 때 운영 체크포인트
1.	values.yaml을 **소스 관리**
	-helm install --values values-prod.yaml 같은 식으로 재현 가능하게
2.	Chart 버전 고정
	-“latest”가 아니라 **chart version을 명시**해서 운영 안정성 확보
3.	CRD 처리 방식 확인
	-차트에 따라 CRD가 별도 디렉토리/옵션으로 분리되어 있을 수 있어 업그레이드 시 주의
4.	네임스페이스/권한(RBAC)
	-클러스터 스코프 리소스(ClusterRole 등) 포함 여부 확인
5.	Diff/검증
	-실제 운영에선 변경분 확인(helm diff 플러그인 같은 방식) 후 적용하는 흐름이 일반적

⸻

## 한 줄로 결론

Helm은 쿠버네티스 리소스 묶음을 “버전 있는 설치 패키지”로 관리하게 해주는 도구이고,
Argo CD 같은 플랫폼 컴포넌트는 구성요소/의존성/업그레이드가 복잡해서 Helm 설치가 운영 표준에 가깝다고 보시면 됩니다.