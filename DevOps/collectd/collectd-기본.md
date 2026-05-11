# Collectd

https://www.collectd.org/

시스템 성능 및 애플리케이션 메트릭을 수집하는 오픈 소스 데몬

주로 리눅스 및 유닉스 계열 운영 체제에서 사용되며, 다양한 플러그인을 통해 CPU 사용률, 메모리 사용량, 네트워크 트래픽, 디스크 I/O 등 다양한 시스템 메트릭을 수집

확장성이 뛰어나 사용자 정의 플러그인을 추가하여 특정 애플리케이션이나 서비스의 메트릭을 수집

----

## collectd와 AWS CloudWatch Agent의 연계

AWS CloudWatch Agent는 기본적으로 AWS CloudWatch로 메트릭과 로그를 전송하는 역할을 하지만, collectd와 연계하여 더 다양한 메트릭을 수집하고 전송할 수 있습니다. 이를 통해 기존에 collectd를 사용하여 수집하던 메트릭을 AWS CloudWatch와 통합하여 중앙에서 관리하고 시각화할 수 있습니다.

연계의 주요 장점

1.	확장된 메트릭 수집:
-	collectd의 다양한 플러그인을 활용하여 CloudWatch Agent가 기본적으로 제공하지 않는 세부적인 시스템 및 애플리케이션 메트릭을 수집할 수 있습니다.
2.	유연한 구성:
-	collectd의 설정 파일을 통해 수집할 메트릭을 세밀하게 조정할 수 있으며, 이를 CloudWatch Agent와 연계하여 필요한 데이터만 선택적으로 전송할 수 있습니다.
3.	기존 인프라와의 통합:
-	이미 collectd를 사용하고 있는 환경에서는 추가적인 설정을 통해 AWS CloudWatch와의 통합이 용이하여 기존 모니터링 시스템을 강화할 수 있습니다.

------

## 설치 방법

1.	collectd 설치 및 구성:
-	먼저, collectd를 서버에 설치하고 필요한 플러그인을 활성화하여 원하는 메트릭을 수집하도록 설정합니다.
-	예를 들어, CPU, 메모리, 네트워크, 디스크 등의 메트릭을 수집하도록 설정할 수 있습니다.
```sh
# amazon linux 2023 예시
# 시스템의 패키지를 최신 상태로 업데이트
sudo dnf update -y

# Amazon Linux 2023의 기본 저장소에서 collectd를 직접 설치할 수 있는지 확인
sudo dnf search collectd

# collectd 패키지가 목록에 나타난다면, 다음 명령어로 설치
sudo dnf install collectd -y

# 서비스 시작
sudo systemctl start collectd

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable collectd

# collectd 서비스 정상 실행 확인
sudo systemctl status collectd
● collectd.service - Collectd statistics daemon
     Loaded: loaded (/usr/lib/systemd/system/collectd.service; disabled; preset: disabled)
     Active: active (running) since Tue 2024-11-12 05:05:10 UTC; 45s ago
       Docs: man:collectd(1)
             man:collectd.conf(5)
   Main PID: 972936 (collectd)
      Tasks: 11 (limit: 1112)
     Memory: 1.3M
        CPU: 9ms
     CGroup: /system.slice/collectd.service
             └─972936 /usr/sbin/collectd

# collectd 로그 확인
sudo journalctl -u collectd.service -f
```

------

2.	CloudWatch Agent 설치 및 설정:
[cloudwatch agent 설치](../../AWS/Amazon%20Logging/CloudWatch%20기본.md)

------

3.	collectd와 CloudWatch Agent 연동 설정:
-	collectd가 데이터를 전송할 수 있도록 CloudWatch Agent를 설정합니다. 위의 예시에서 service_address는 collectd가 데이터를 전송하는 주소를 나타냅니다.
-	collectd의 write_http 플러그인을 사용하여 데이터를 CloudWatch Agent로 전송할 수 있습니다. collectd.conf 파일에 다음과 같은 설정을 추가할 수 있습니다.

```sh
# write_http 플러그인 설치
# EPEL 저장소 활성화
sudo dnf install epel-release -y
sudo dnf update -y

# collectd-write_http 패키지가 있는지 확인
sudo dnf search collectd | grep write_http

# collectd-write_http 패키지가 검색된다면, 다음 명령어로 설치
sudo dnf install collectd-write_http -y

# network 플러그인을 찾기
less /etc/collectd.conf
/network

# 주석 삭제 및 설정 추가
// CloudWatch 에이전트는 기본적으로 호스트 127.0.0.1 및 UDP 포트 25826에 collectd 서버를 띄워서 데이터를 수집
LoadPlugin network
<Plugin network>
  Server "127.0.0.1" "25826"
</Plugin>

// fhcount 플러그인은 Linux에서 사용 중인 파일 핸들, 사용되지 않은 파일 핸들 및 총 파일 핸들 수에 대한 통계 정보를 제공
// ValuesAbsolute = true로 설정하면 사용 중인 파일 핸들/사용되지 않은 파일 핸들/최대 값에 대한 3개의 지표를 생성합니다.
//  ValuesPercent = true로 설정하면 사용 중인 파일 핸들 및 사용되지 않은 파일 핸들의 백분율에 대한 2개의 지표를 생성합니다.
LoadPlugin fhcount
<Plugin fhcount>
  ValuesAbsolute true
  ValuesPercentage true
</Plugin>

# collectd 재시작
sudo systemctl restart collectd

# collectd 상태 확인
sudo systemctl status collectd

# collectd 로그 확인
sudo journalctl -u collectd -f
```
-------

4. 네트워크 통신 확인

```sh
# TCPDump 설치 (필요한 경우):
sudo dnf install -y tcpdump

# UDP 포트 25826 모니터링
sudo tcpdump -i lo udp port 25826

# 예시
dropped privs to tcpdump
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on lo, link-type EN10MB (Ethernet), snapshot length 262144 bytes
10:15:31.107377 IP localhost.59666 > localhost.25826: UDP, length 1271
10:15:41.107373 IP localhost.59666 > localhost.25826: UDP, length 1322
```