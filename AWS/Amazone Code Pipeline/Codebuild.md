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