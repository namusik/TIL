# aws cli 


https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html

command line installer 

```sh
$ which aws
/usr/local/bin/aws 

$ aws --version
aws-cli/2.17.20 Python/3.11.6 Darwin/23.3.0 botocore/2.4.5
```

## 액세스 키 기반 IAM 사용자 인증

```sh
aws configure --profile megalocal
```
- profile 지정해서 aws cli 로그인

```sh
aws configure list-profiles
```
- 등록된 프로필 목록 확인

```sh
vi ~/.aws/credentials
vi ~/.aws/config
```
- 프로필 삭제시 여기서 수정

```sh
aws configure list --profile dev
```
- 현재 프로필 설정 확인
- 로컬 설정값 확인. 프로필에 매핑된 설정값을 출력
  - 로컬 파일 기준
- AWS에 요청하지 않는다.

```sh
aws sts get-caller-identity
```
-  기본 프로필(default profile) 은 AWS CLI의 프로필 해석 우선순위 규칙에 따라 결정됨.
- 1.	AWS_PROFILE 환경변수
	2.	AWS_DEFAULT_PROFILE 환경변수
	3.	~/.aws/credentials 의 [default]
	4.	~/.aws/config 의 [default] 


```sh
export AWS_PROFILE=dev
```
-  기본 프로필을 일시적으로 변경

```sh
aws sts get-caller-identity --profile megalocal
```
- AWS가 인정한 실제 실행 주체를 확인하는 명령
- AWS STS API 호출

```sh
export AWS_PROFILE=프로필명
```