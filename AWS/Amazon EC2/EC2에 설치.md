# EC2에 설치 

## nginx 설치
- Amazon linux 2023 AMI 기준 

```sh
# Nginx 설치
sudo dnf install nginx

# 현재 시스템에 설치된 패키지 중에 이름이 nginx 포함된 것 검색
rpm -qa | grep nginx

# nginx 서비스 시작
sudo systemctl start nginx

# nginx 서비스 상태 확인
sudo systemctl status nginx

# Nginx 자동 시작 설정 (EC2 인스턴스 재부팅 후 자동으로 Nginx가 시작되도록 설정):
sudo systemctl enable nginx
```


## nodejs 설치

https://docs.aws.amazon.com/ko_kr/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html


```sh
# 프로젝트의 dependencies(의존성)을 설치하는 명령어
npm install 

# package.json에 정의된 build 스크립트를 실행하는 명령어
npm run build

nohup npm start &

# 3000 포트 있는지 확인
netstat -ntlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      72155/node
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      2177/sshd: /usr/sbi
tcp6       0      0 :::22                   :::*                    LISTEN      2177/sshd: /usr/sbi

curl -v localhost:3000
```


## maven 설치

```sh
sudo dnf install java-11-amazon-corretto java-11-amazon-corretto-devel maven

# java-devel은 Java 개발 도구 키트(JDK: Java Development Kit)와 관련된 패키지

# 설치 확인
mvn -version
Apache Maven 3.8.4 (Red Hat 3.8.4-3.amzn2023.0.5)
Maven home: /usr/share/maven
Java version: 17.0.12, vendor: Amazon.com Inc., runtime: /usr/lib/jvm/java-17-amazon-corretto.x86_64
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "6.1.112-122.189.amzn2023.x86_64", arch: "amd64", family: "unix"
```

## mysql 설치 

```sh
# MySQL의 공식 리포지토리를 시스템에 추가
sudo dnf install https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm

#  GPG 검증을 비활성화하고 설치
sudo dnf install mysql-community-server --nogpgcheck

# 설치 확인
mysql --version 
```

## git 설치

```sh
sudo dnf install git

git --version

# 리포지토리 pull
```


