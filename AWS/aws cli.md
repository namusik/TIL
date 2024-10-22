# aws cli 


https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html

command line installer 

```sh
$ which aws
/usr/local/bin/aws 
$ aws --version
aws-cli/2.17.20 Python/3.11.6 Darwin/23.3.0 botocore/2.4.5
```

```sh
aws configure --profile megalocal
```
- profile 지정해서 aws cli 로그인

```sh
aws sts get-caller-identity --profile megalocal
```
- aws cli 어떤 유저로 설정되어있는지 확인 가능

```sh
export AWS_PROFILE=프로필명
```