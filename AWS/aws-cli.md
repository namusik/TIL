# AWS CLI

> 최종 업데이트: 2026-04-18 | 기준: AWS CLI v2 (2.x)

## 개념

AWS CLI(Command Line Interface)는 터미널에서 AWS 서비스를 조작하기 위한 공식 커맨드라인 도구다. 콘솔(GUI)로 클릭해가며 하는 작업을 `aws` 명령어 한 줄로 끝낼 수 있고, 셸 스크립트·CI/CD 파이프라인에 그대로 녹여 쓸 수 있다.

> 비유하자면 AWS 콘솔이 "리모컨"이라면, AWS CLI는 "셸 스크립트로 자동화 가능한 리모컨"이다. 반복 작업, 배치 작업, CI/CD 자동화는 거의 CLI로 한다.

내부적으로는 HTTPS로 AWS API(Service API)를 호출하는 래퍼이며, 자격 증명(credentials)과 리전(region) 정보를 로컬 파일에서 읽어 서명(SigV4)한 뒤 API를 호출한다.

## 배경/역사

- **2013** — AWS CLI v1 출시 (Python 2.6+ 기반, `pip install awscli`)
- **2020-02** — AWS CLI v2 정식 출시. **Python 임베디드**로 패키징되어 별도 Python 설치 불필요, SSO/MFA 지원 강화, `aws configure import` 등 기능 추가
- 현재 AWS는 **v2 사용을 권장**하며, 신규 기능(IAM Identity Center 로그인 등)은 v2에만 추가됨

| 버전 | 설치 방식 | Python | 권장 여부 |
|------|----------|--------|---------|
| v1 | pip / bundled installer | 시스템 Python 필요 | 레거시만 |
| v2 | 전용 installer (pkg/msi/zip) | 임베디드 | **권장** |

## 설치

macOS 기준 공식 설치 가이드: https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html

```sh
# macOS - Homebrew
brew install awscli

# macOS - 공식 pkg installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

설치 확인.

```sh
$ which aws
/usr/local/bin/aws

$ aws --version
aws-cli/2.17.20 Python/3.11.6 Darwin/23.3.0 botocore/2.4.5
```

## 명령어 기본 구조

```sh
aws <service> <operation> [parameters] [--profile X] [--region Y] [--output json|yaml|table|text]
```

- `<service>` — `s3`, `ec2`, `iam`, `sts`, `lambda` 등 AWS 서비스명
- `<operation>` — `ls`, `describe-instances`, `get-caller-identity` 등 서비스별 동작
- `--profile` — 사용할 프로필명 (생략 시 기본 프로필)
- `--region` — 요청 리전 (생략 시 프로필 기본 리전)

```sh
aws s3 ls
aws ec2 describe-instances --region ap-northeast-2
aws iam list-users --profile dev --output table
```

## 인증 방식

CLI가 AWS에 요청을 보내려면 **자격 증명(credentials)** 이 필요하다. 크게 세 가지 방식이 있다.

| 방식 | 저장 위치 | 주 용도 |
|------|---------|---------|
| **액세스 키(IAM User)** | `~/.aws/credentials` | 개인 개발자 로컬, 간단한 스크립트 |
| **SSO / IAM Identity Center** | `~/.aws/sso/cache/` | 조직 계정, 다중 계정 환경 |
| **IAM Role (STS Assume Role)** | 임시 credentials | 크로스 계정 접근, CI/CD |

> 보안상 **장기 액세스 키 발급은 지양**하고, 조직 환경이라면 SSO, 자동화라면 IAM Role을 권장한다.

## 액세스 키 기반 IAM 사용자 인증

가장 전통적인 방식. Access Key ID / Secret Access Key를 로컬에 저장해두고 사용한다.

```sh
aws configure --profile megalocal
```
- 프로필을 지정해서 AWS CLI 로그인(자격 증명 등록)
- Access Key, Secret Key, 기본 리전, 기본 출력 형식을 입력

```sh
aws configure list-profiles
```
- 등록된 프로필 목록 확인

```sh
vi ~/.aws/credentials
vi ~/.aws/config
```
- 프로필 삭제/수정 시 여기서 직접 편집
- `credentials` 파일엔 Key가, `config` 파일엔 region/output 등이 저장됨

```sh
aws configure list --profile dev
```
- 현재 프로필의 로컬 설정값 확인
- 로컬 파일 기준으로 프로필에 매핑된 설정값만 출력 (AWS에 요청하지 않음)

## 기본 프로필 해석 우선순위

`--profile`을 생략하면 AWS CLI는 아래 순서로 "기본 프로필"을 결정한다.

1. `AWS_PROFILE` 환경변수
2. `AWS_DEFAULT_PROFILE` 환경변수
3. `~/.aws/credentials`의 `[default]`
4. `~/.aws/config`의 `[default]`

```sh
# 기본 프로필을 일시적으로 변경
export AWS_PROFILE=dev

# 현재 셸 세션에서만 유효
aws sts get-caller-identity
```

## 실제 실행 주체 확인 (sts get-caller-identity)

로컬 설정이 아니라 **AWS가 실제로 인정한 주체**를 확인하는 명령. 인증 문제 디버깅 시 제일 먼저 치는 명령이다.

```sh
aws sts get-caller-identity
aws sts get-caller-identity --profile megalocal
```
- AWS STS API를 실제로 호출해서 UserId / Account / Arn을 반환
- `aws configure list`와 달리 **AWS에 요청을 보내서** 결과를 받아옴

```json
{
    "UserId": "AIDAEXAMPLEID",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/wsnam"
}
```

## SSO (IAM Identity Center) 로그인

조직 계정에서는 장기 액세스 키 대신 SSO 기반 단기 세션을 쓰는 게 표준.

```sh
aws configure sso --profile sso-dev
```
- SSO start URL, 리전, 계정, 역할을 입력해 프로필 생성

```sh
aws sso login --profile sso-dev
```
- 브라우저가 열리고 로그인하면 단기 토큰이 `~/.aws/sso/cache/`에 저장됨
- 토큰이 만료되면 같은 명령으로 재로그인

## 자격 증명 탐색 순서

`--profile`이 없고 환경변수도 없을 때, CLI는 다음 순서로 자격 증명을 찾는다.

1. 명령어 옵션(`--access-key-id` 등)
2. 환경변수 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)
3. `~/.aws/credentials`
4. `~/.aws/config`
5. 컨테이너 자격 증명(ECS/EKS 메타데이터)
6. EC2 인스턴스 프로파일(IMDS)

> CI/CD나 EC2/ECS에서 실행될 때는 5~6번을 통해 **키 없이도 자동 인증**된다.

## 출력 형식 제어

```sh
aws ec2 describe-instances --output json    # 기본값
aws ec2 describe-instances --output yaml
aws ec2 describe-instances --output table   # 사람이 보기 편함
aws ec2 describe-instances --output text    # 셸 파이프 가공용
```

## JMESPath로 결과 필터링 (--query)

CLI 결과는 JSON인데, `--query`로 필요한 필드만 뽑을 수 있다.

```sh
# 실행 중인 EC2의 InstanceId만 뽑기
aws ec2 describe-instances \
  --query "Reservations[].Instances[?State.Name=='running'].InstanceId" \
  --output text

# S3 버킷 이름만
aws s3api list-buckets --query "Buckets[].Name" --output text
```

## 주요 환경변수

| 환경변수 | 설명 |
|----------|------|
| `AWS_PROFILE` | 사용할 프로필 |
| `AWS_REGION` / `AWS_DEFAULT_REGION` | 기본 리전 |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | 자격 증명 직접 주입 |
| `AWS_SESSION_TOKEN` | 임시 자격 증명의 세션 토큰 |
| `AWS_PAGER` | 긴 출력 페이저 (빈 문자열로 두면 비활성화) |

```sh
# 페이저 끄기 (스크립트에서 자주 필요)
export AWS_PAGER=""
```

## 자주 쓰는 명령 예시

```sh
# S3
aws s3 ls
aws s3 cp ./file.txt s3://my-bucket/path/
aws s3 sync ./dist s3://my-bucket/ --delete

# EC2
aws ec2 describe-instances
aws ec2 start-instances --instance-ids i-0abc123

# IAM
aws iam list-users
aws iam get-user --user-name wsnam

# Lambda 함수 직접 호출
aws lambda invoke --function-name my-fn --payload '{"k":"v"}' out.json
```

## 문제 해결 체크리스트

1. `aws --version` — v2가 맞는가
2. `aws configure list-profiles` — 프로필이 등록돼 있는가
3. `aws configure list --profile X` — 로컬 설정이 예상과 같은가
4. `aws sts get-caller-identity --profile X` — AWS가 인정한 주체가 맞는가
5. 403/`ExpiredToken` — SSO 토큰 만료, `aws sso login` 재실행
6. 리전 미스매치 — `--region` 또는 프로필 `region` 확인
