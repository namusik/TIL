# kustomize

- Kubernetes 리소스의 구성을 관리하고 맞춤화할 수 있게 해주는 오픈 소스 도구
- Kubernetes 매니페스트 파일을 패치하거나 변형하여 여러 환경(예: 개발, 스테이징, 프로덕션)에 맞는 설정을 효율적으로 관리할 수 있도록 도와줌.
- 인기가 많아져서 kubectl에 내장됨
- 양대산맥인 Helm(오픈소스)과 같은 패키지 매니저와 유사한 기능을 제공하지만, 템플릿을 사용하지 않고 YAML 파일을 기반으로 작동한다는 점에서 차별화

## 주요 특징

1.	레이어드 구성 (Layered Configuration)
-	**베이스(Base)** 와 **오버레이(Overlay)** 구조를 사용하여 공통 설정과 환경별 설정을 분리하여 관리할 수 있습니다.
-	**베이스는 모든 환경에서 공통**으로 사용하는 리소스 정의를 포함하며, **오버레이는 특정 환경**에 맞게 베이스를 수정하거나 추가하는 설정을 포함합니다.
2.	패치 및 변형 (Patches and Transformations)
-	기존 Kubernetes 리소스에 패치를 적용하거나 변형(transformations)을 통해 원하는 설정을 추가하거나 수정할 수 있습니다.
-	Strategic Merge Patch와 JSON 6902 패치를 지원하여 유연한 수정이 가능합니다.
3.	재사용성 (Reusability)
-	공통 리소스를 여러 환경에서 재사용할 수 있어 코드의 중복을 줄이고 유지보수를 용이하게 합니다.
-	kustomization.yaml 파일을 통해 다양한 베이스와 오버레이를 조합하여 사용할 수 있습니다.
4.	순수한 YAML
-	템플릿 언어나 스크립트를 사용하지 않고 순수한 YAML 파일만으로 구성을 관리하기 때문에 단순성과 가독성이 높습니다.
-	GitOps와 같은 선언적 관리 방식과 자연스럽게 통합됩니다.

## 설치
https://kubectl.docs.kubernetes.io/installation/kustomize/homebrew/
```sh
brew install kustomize

# 버전 확인
kustomize version
```

## 기본 구성 요소

-	base: 공통적으로 사용되는 리소스 정의를 포함합니다.
-	overlay: 특정 환경에 맞게 base를 수정하거나 추가하는 설정을 포함합니다.
-	kustomization.yaml: Kustomize가 어떤 리소스를 포함하고, 어떻게 변형할지를 정의하는 파일입니다.

```plaintext
├── base
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
├── overlays
    ├── dev
    │   ├── kustomization.yaml
    │   └── patch.yaml
    └── prod
        ├── kustomization.yaml
        └── patch.yaml
```


## 장점

-	간단한 사용법: 복잡한 템플릿 없이도 손쉽게 Kubernetes 리소스를 관리할 수 있습니다.
-	GitOps 친화적: Git과의 통합이 용이하여 GitOps 워크플로우에 적합합니다.
-	유연성: 다양한 환경에 맞춰 쉽게 구성 변경이 가능합니다.
-	순수 선언적 접근: 모든 구성이 선언적으로 관리되므로, 버전 관리와 변경 추적이 용이합니다. 

## 단점

-	기능 제한: Helm과 비교했을 때, 템플릿 기반의 동적 기능이 부족할 수 있습니다.
-	학습 곡선: 기본 개념과 사용법을 익히는 데 시간이 걸릴 수 있습니다.
-	복잡한 환경 관리: 매우 복잡한 환경이나 많은 오버레이가 필요한 경우 관리가 어려워질 수 있습니다.