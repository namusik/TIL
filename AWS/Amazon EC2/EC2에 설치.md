# EC2 명령어

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
# java-devel은 Java 개발 도구 키트(JDK: Java Development Kit)와 관련된 패키지
sudo dnf install java-11-amazon-corretto java-11-amazon-corretto-devel maven

# 혹은
sudo yum install -y maven


# 설치 확인
mvn -version
Apache Maven 3.8.4 (Red Hat 3.8.4-3.amzn2023.0.5)
Maven home: /usr/share/maven
Java version: 17.0.12, vendor: Amazon.com Inc., runtime: /usr/lib/jvm/java-17-amazon-corretto.x86_64
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "6.1.112-122.189.amzn2023.x86_64", arch: "amd64", family: "unix"


# maven 기존의 빌드 아티팩트(이전 빌드 과정에서 생성된 파일)를 삭제하는 명령어
mvn clean

# 프로젝트 소스 코드를 컴파일하고, 필요한 모든 종속성을 해결하며, 실행 가능한 JAR 또는 WAR 파일을 생성하는 Maven 명령어
mvn package

# 백그라운드에서 Java 애플리케이션을 실행하고, 터미널 세션이 종료되어도 계속 실행되도록 설정하는 명령
nohup java -jar <jar파일명> &

# 8080 서비스 확인
netstat -ntlp

Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      72155/node
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      72390/nginx: master
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      2177/sshd: /usr/sbi
tcp6       0      0 :::8080                 :::*                    LISTEN      100883/java
tcp6       0      0 :::80                   :::*                    LISTEN      72390/nginx: master
tcp6       0      0 :::22                   :::*                    LISTEN      2177/sshd: /usr/sbi
```

## mysql 클라이언트 설치 

```sh
# MySQL의 공식 리포지토리를 시스템에 추가
sudo dnf install https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm

#  GPG 검증을 비활성화하고 설치
sudo dnf install mysql-community-server --nogpgcheck

# 설치 확인
mysql --version 

# RDS에 mysql 연결
mysql -u <유저명> -p -h <RDS 엔트포인트> 

# root 사용자에게 권한 부여
mysql> GRANT ALL PRIVILEGES ON employee.* TO root@'%';
Query OK, 0 rows affected (0.02 sec)

#  권한 변경 사항을 즉시 반영
mysql> flush privileges;
Query OK, 0 rows affected (0.01 sec)
```

## git 설치

```sh
sudo dnf install git

git --version

# 리포지토리 pull
git clone 리포지터리 주소

# private 리포지토리 clone
git clone https://<GIT_USERNAME>:<GIT_TOKEN>@리포지토리 주소
```

## jenkins 설치

```sh
sudo-i
# Jenkins 리포지토리 추가 
sudo tee /etc/yum.repos.d/jenkins.repo<<EOF
[jenkins]
name=Jenkins
baseurl=https://pkg.jenkins.io/redhat-stable/
gpgcheck=1
gpgkey=https://pkg.jenkins.io/redhat-stable/jenkins.io.key
EOF

# Jenkins 설치
sudo dnf install jenkins --nogpgcheck -y

# Jenkins 설치 확인
rpm -qa | grep jenkins
jenkins-2.462.3-1.1.noarch

# jenkins 시작
sudo systemctl enable jenkins
sudo systemctl start jenkins

# jenkins 구동 확인
ps -ef | grep jenkins

jenkins    29426       1 69 08:37 ?        00:00:18 /usr/bin/java -Djava.awt.headless=true -jar /usr/share/java/jenkins.war --webroot=/var/cache/jenkins/war --httpPort=8080
root       29522    3065  0 08:38 pts/1    00:00:00 grep --color=auto jenkins
```

## ansible 설치

```sh
sudo dnf install ansible

# 설치 확인
ansible --version

ansible [core 2.15.3]
  config file = None
  configured module search path = ['/root/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3.9/site-packages/ansible
  ansible collection location = /root/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.9.16 (main, Jul  5 2024, 00:00:00) [GCC 11.4.1 20230605 (Red Hat 11.4.1-2)] (/usr/bin/python3.9)
  jinja version = 3.1.4
  libyaml = True
```


### 스트레스 패키지 설치

```sh
# 설치
sudo dnf install stress-ng

# cpu 정보 확인
cat /proc/cpuinfo
processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model		: 79
model name	: Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz
stepping	: 1
microcode	: 0xb000040
cpu MHz		: 2300.061
cache size	: 46080 KB
physical id	: 0
siblings	: 1
core id		: 0
# core 수
cpu cores	: 1
apicid		: 0
initial apicid	: 0
fpu		: yes
fpu_exception	: yes
cpuid level	: 13
wp		: yes
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx rdtscp lm constant_tsc rep_good nopl xtopology cpuid tsc_known_freq pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm cpuid_fault invpcid_single pti fsgsbase bmi1 avx2 smep bmi2 erms invpcid xsaveopt
bugs		: cpu_meltdown spectre_v1 spectre_v2 spec_store_bypass l1tf mds swapgs itlb_multihit mmio_stale_data bhi
bogomips	: 4600.02
clflush size	: 64
cache_alignment	: 64
address sizes	: 46 bits physical, 48 bits virtual
power management:


# 부하 테스트 백그라운드 실행
# -c 또는 --cpu 옵션은 CPU에 부하를 줄 스레드의 개수를 지정합니다. 여기서 1은 CPU 1개에만 부하를 줄 것을 의미
stress-ng -c 1&
[1] 425906
stress-ng: info:  [425906] defaulting to a 86400 second (1 day, 0.00 secs) run per stressor
stress-ng: info:  [425906] dispatching hogs: 1 cpu

# 실행 확인
ps -ef | grep stress
ec2-user  425906  402513  0 09:50 pts/1    00:00:00 stress-ng -c 1
ec2-user  425907  425906 99 09:50 pts/1    00:00:39 stress-ng-cpu [run]
ec2-user  425909  402513  0 09:50 pts/1    00:00:00 grep --color=auto stress

# 부하 확인
top
top - 09:51:37 up 8 days, 23:40,  2 users,  load average: 0.80, 0.32, 0.12
Tasks: 105 total,   2 running, 103 sleeping,   0 stopped,   0 zombie
%Cpu(s):100.0 us,  0.0 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :    949.5 total,    409.6 free,    152.3 used,    387.5 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.    651.3 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 425907 ec2-user  20   0   70648   6156   4028 R  99.7   0.6   1:24.76 stress-ng-cpu

# 부하 종료
[ec2-user@ip-10-1-1-52 ~]$ jobs
[1]+  Running                 stress-ng -c 1 &
[ec2-user@ip-10-1-1-52 ~]$ kill %1 

# CPU 4개를 사용하여 60초 동안 부하를 주는 명령어
stress-ng --cpu 4 --timeout 60s

# 메모리를 2GB 사용하여 60초 동안 부하를 주는 명령어
stress-ng --vm 1 --vm-bytes 2G --timeout 60s 
```
