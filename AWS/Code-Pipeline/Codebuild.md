# AWS CodeBuild

## 개념
1.	완전 관리형 서비스: CodeBuild는 빌드 서버를 직접 설정하거나 관리할 필요 없이 완전 관리형으로 제공되며, 필요한 리소스에 따라 자동으로 확장됩니다.
2.	다양한 언어와 환경 지원: Java, Python, Ruby, Go, Node.js, .NET 등 다양한 프로그래밍 언어와 빌드 환경을 지원하며, Docker 이미지를 사용해 사용자 정의 빌드 환경을 생성할 수도 있습니다.
3.	지속적 통합 및 배포(CI/CD): CodePipeline과 통합하여 CI/CD 파이프라인의 빌드 단계를 자동화할 수 있습니다. 이를 통해 코드를 변경할 때마다 자동으로 빌드, 테스트, 배포할 수 있습니다.
4.	보안 및 IAM 통합: IAM을 사용하여 권한을 제어하고 빌드 시 중요한 환경 변수를 안전하게 관리할 수 있습니다. 또한 VPC 통합을 통해 네트워크 보안을 강화할 수 있습니다.
5.	로그와 모니터링: CodeBuild는 Amazon CloudWatch와 통합되어 빌드 로그를 실시간으로 모니터링하고, 빌드 오류나 성능 이슈를 빠르게 탐지할 수 있습니다.
6.	유연한 설정 파일: CodeBuild는 buildspec.yml 파일을 통해 빌드 단계를 정의합니다. 이 파일을 사용하여 다양한 커맨드를 정의하고, 빌드 프로세스를 세분화할 수 있습니다.

## CodeBuild 동작 방식

1.	소스 연결: GitHub, Bitbucket, CodeCommit 같은 소스 리포지토리에서 코드를 가져옵니다.
2.	빌드 스펙 파일 실행: buildspec.yml 파일에 정의된 빌드 명령어와 단계를 순서대로 실행합니다.
3.	아티팩트 저장: 빌드 결과물을 Amazon S3에 저장하거나 배포에 필요한 위치로 전달할 수 있습니다.
4.	결과 알림: 성공, 실패 여부를 알리고 로그 및 메트릭을 제공합니다.


## buildspec.yml
https://docs.aws.amazon.com/ko_kr/codepipeline/latest/userguide/ecs-cd-pipeline.html

buildspec.yml 공식 구조
```yaml
version: 0.2          # ← 공식 (현재 0.2가 최신)

phases:                # ← 공식 키워드
  install:             # ← 공식 단계 (선택)
    runtime-versions:  # ← 공식 키워드 (설치할 런타임)
    commands:          # ← 공식 키워드 (실행할 명령어들)
  pre_build:           # ← 공식 단계 (선택)
    commands:
  build:               # ← 공식 단계 (선택)
    commands:
  post_build:          # ← 공식 단계 (선택)
    commands:

artifacts:             # ← 공식 키워드 (선택 - 결과물 정의)
  files:
  name:

cache:                 # ← 공식 키워드 (선택 - 캐시 설정)
  paths:
```

- install	
  - 가장 먼저	
  - 런타임/도구 설치	
  - 실패시 전체 중단
- pre_build	
  - 빌드 전	
  - 로그인, 의존성 설치 등 준비	
  - 실패시 전체 중단
- build	
  - 메인	
  - 실제 빌드/컴파일	
  - 실패시 전체 중단
- post_build	  
  - 빌드 후	
  - 푸시, 알림, 정리 등	
  - build가 실패해도 실행됨
- 이게 중요합니다. 그래서 기존 buildspec에서 docker push와 ArgoCD 배포를 post_build에 넣은 것입니다.
커스텀하는 부분은?
commands: 아래의 명령어들만 커스텀입니다:
phases:  install:           # ← 공식 (바꿀 수 없음)    commands:        # ← 공식 (바꿀 수 없음)      - echo "여기가 커스텀"    # ← 이 부분만 자유롭게 작성      - pip install something  # ← 이 부분만 자유롭게 작성  build:             # ← 공식 (바꿀 수 없음)    commands:        # ← 공식 (바꿀 수 없음)      - ./gradlew build        # ← 이 부분만 자유롭게 작성
즉, 틀(구조)은 AWS가 정해놓은 것이고, 각 commands: 안에 어떤 셸 명령어를 넣느냐가 개발자 몫입니다.