# Cloudwatch

AWS 리소스와 애플리케이션을 실시간으로 모니터링하고 운영 데이터를 수집, 분석, 시각화

## 주요 기능

1.	모니터링 및 메트릭 수집:
-	기본 메트릭: EC2 인스턴스, RDS 데이터베이스, Lambda 함수 등 다양한 AWS 서비스에서 기본적으로 제공하는 메트릭(예: CPU 사용률, 메모리 사용량 등)을 자동으로 수집합니다.
-	커스텀 메트릭: 애플리케이션이나 시스템에서 직접 정의한 커스텀 메트릭을 수집하여 세부적인 모니터링이 가능합니다.
2.	로그 관리:
-	CloudWatch Logs: 애플리케이션 로그, 시스템 로그, 커스텀 로그 등을 중앙에서 수집, 저장, 분석할 수 있습니다.
-	로그 필터링 및 검색: 로그 데이터를 실시간으로 필터링하고 검색하여 문제를 신속하게 진단할 수 있습니다.
3.	경보(Alarms):
-	특정 메트릭이 정의된 임계값을 초과하거나 미달할 때 경보를 설정하여 이메일, SMS, AWS Lambda 함수 호출 등 다양한 방식으로 알림을 받을 수 있습니다.
-	자동화된 대응 조치를 설정하여 문제가 발생했을 때 자동으로 조치를 취할 수 있습니다.
4.	대시보드:
-	사용자 정의 대시보드를 생성하여 중요한 메트릭과 로그를 시각적으로 모니터링할 수 있습니다.
-	여러 위젯을 배치하여 다양한 데이터를 한눈에 파악할 수 있습니다.
5.	이벤트 모니터링:
-	AWS 서비스의 이벤트를 실시간으로 감지하고, 이를 기반으로 자동화된 작업을 트리거할 수 있습니다.
-	예를 들어, 특정 이벤트 발생 시 Lambda 함수를 실행하거나 SNS 주제로 알림을 보낼 수 있습니다.
6.	자동화된 대응:
-	CloudWatch Events와 통합하여 자동화된 대응 프로세스를 구축할 수 있습니다.
-	예를 들어, EC2 인스턴스가 특정 상태에 도달하면 자동으로 재시작하거나 스케일링할 수 있습니다.
7.	애플리케이션 성능 모니터링(APM):
-	AWS X-Ray와 통합하여 애플리케이션의 성능을 추적하고 병목 현상을 식별할 수 있습니다.

## 장점

-	통합 관리: 다양한 AWS 서비스와 쉽게 통합되어 중앙에서 일관된 모니터링을 제공합니다.
-	실시간 모니터링: 실시간으로 데이터를 수집하고 분석하여 빠른 의사결정을 지원합니다.
-	확장성: 대규모 환경에서도 안정적으로 동작하며, 필요에 따라 유연하게 확장할 수 있습니다.
-	자동화: 경보 및 이벤트 기반 자동화 기능을 통해 운영 효율성을 높이고, 인적 오류를 줄일 수 있습니다.
-	비용 효율성: 사용한 만큼만 비용을 지불하는 구조로, 필요한 기능에 맞게 비용을 최적화할 수 있습니다.

## 사용 사례

1.	애플리케이션 모니터링:
-	웹 애플리케이션의 성능을 실시간으로 모니터링하고, 사용자 경험을 향상시킬 수 있습니다.
2.	인프라 모니터링:
-	EC2, RDS, S3 등 AWS 리소스의 상태와 성능을 모니터링하여 안정적인 운영을 보장합니다.
3.	로그 분석 및 보안 모니터링:
-	CloudWatch Logs를 활용하여 보안 로그를 분석하고, 이상 활동을 감지하여 대응할 수 있습니다.
4.	비용 관리 및 최적화:
-	사용량 메트릭을 모니터링하여 비용을 최적화하고, 불필요한 리소스 사용을 줄일 수 있습니다.
5.	재해 복구 및 고가용성:
-	장애 발생 시 자동으로 대응 조치를 취하여 시스템의 가용성을 유지합니다.

## cloudwatch 대시보드
AWS 리소스의 모니터링 데이터를 한 곳에서 시각화하고 관리할 수 있는 맞춤형 대시보드를 생성할 수 있게 해주는 기능

### 대시보드의 주요 기능

1.	맞춤형 위젯 생성: 다양한 유형의 위젯(라인 그래프, 영역 그래프, 숫자 표시 등)을 사용하여 원하는 지표를 시각화할 수 있습니다. 각 위젯은 특정 지표나 로그 데이터를 표시하도록 구성할 수 있습니다.
2.	여러 서비스의 지표 통합 모니터링: EC2, RDS, S3, Lambda 등 다양한 AWS 서비스의 지표를 한 대시보드에서 통합하여 모니터링할 수 있습니다. 또한 사용자 정의 지표나 애플리케이션 로그도 포함할 수 있습니다.
3.	실시간 데이터 업데이트: 대시보드는 실시간으로 데이터를 업데이트하여 현재 시스템의 상태를 빠르게 파악할 수 있습니다.
4.	다중 리전 및 계정 지원: 하나의 대시보드에서 여러 리전이나 AWS 계정의 지표를 동시에 모니터링할 수 있어 복잡한 환경에서도 효율적인 관리가 가능합니다.
5.	공유 및 액세스 제어: 대시보드를 팀 내의 다른 사용자와 공유하거나, IAM 정책을 통해 액세스 권한을 제어할 수 있습니다.

## CloudWatch Agent

AWS CloudWatch 서비스의 기능을 확장하여 더 상세한 시스템 및 애플리케이션 수준의 메트릭과 로그를 수집할 수 있도록 도와주는 소프트웨어

운영 체제 수준의 메트릭이나 커스텀 애플리케이션 로그는 기본적으로 수집되지 않습니다. 이러한 추가적인 데이터를 수집하고자 할 때 CloudWatch Agent을 설치

### CloudWatch Agent의 주요 기능

1.	시스템 메트릭 수집:
-	메모리 사용량: RAM 사용량, 스왑 공간 사용량 등.
-	디스크 사용량: 디스크 공간 사용량, I/O 활동 등.
-	네트워크 상태: 네트워크 인터페이스의 트래픽, 오류율 등.
-	프로세스 메트릭: 특정 프로세스의 CPU 및 메모리 사용량 등.
2.	로그 수집 및 관리:
-	애플리케이션 로그: 웹 서버 로그, 데이터베이스 로그 등 애플리케이션에서 생성되는 로그를 수집.
-	시스템 로그: OS 수준의 로그(예: syslog, 이벤트 로그 등)를 수집.
-	커스텀 로그: 사용자 정의 형식의 로그를 수집하여 분석.
3.	커스텀 메트릭:
-	사용자가 정의한 특정 메트릭을 수집하여 CloudWatch에 전송, 이를 통해 세부적인 모니터링 가능.
4.	다양한 플랫폼 지원:
-	운영 체제: Linux, Windows 등 다양한 운영 체제에서 설치 및 사용 가능.
-	온프레미스 및 하이브리드 환경: AWS 외부의 온프레미스 서버에도 설치하여 클라우드와 온프레미스 환경을 통합 모니터링.
5.	확장성 및 유연성:
-	JSON 기반의 구성 파일을 통해 수집할 메트릭과 로그를 세부적으로 설정 가능.
-	필요에 따라 수집 주기, 필터링, 데이터 변환 등 다양한 설정을 지원.

### CloudWatch Agent을 설치해야 하는 이유

1.	더 깊이 있는 모니터링:
-	기본 CloudWatch 메트릭 외에도 시스템 리소스(메모리, 디스크 등) 및 애플리케이션 수준의 메트릭을 수집하여 보다 정밀한 모니터링이 가능합니다.
-	이를 통해 성능 병목 현상이나 리소스 부족 문제를 사전에 감지하고 대응할 수 있습니다.
2.	종합적인 로그 관리:
-	다양한 소스에서 생성되는 로그를 중앙에서 관리하고 분석할 수 있어 문제 해결 및 보안 감사에 유용합니다.
-	로그 데이터를 기반으로 경보를 설정하거나 자동화된 대응을 트리거할 수 있습니다.
3.	커스텀 메트릭 수집:
-	애플리케이션의 특정 동작이나 비즈니스 관련 메트릭을 수집하여 CloudWatch 대시보드에 시각화할 수 있습니다.
-	예를 들어, 주문 처리 시간, 사용자 로그인 횟수 등 비즈니스 지표를 실시간으로 모니터링할 수 있습니다.
4.	비용 효율적인 운영:
-	필요한 메트릭과 로그만을 선택적으로 수집하여 불필요한 데이터 수집을 줄임으로써 CloudWatch 사용 비용을 최적화할 수 있습니다.
-	자동화된 모니터링과 경보 설정을 통해 운영 인력을 효율적으로 활용할 수 있습니다.
5.	통합 관리 및 자동화:
-	CloudWatch Agent을 통해 수집된 데이터는 다른 AWS 서비스(Auto Scaling, Lambda, SNS 등)와 쉽게 연동되어 자동화된 대응을 구현할 수 있습니다.
-	예를 들어, 특정 메트릭이 임계값을 초과하면 자동으로 인스턴스를 스케일 업하거나, Lambda 함수를 호출하여 문제를 해결할 수 있습니다.


### 명령어 

- cloudwatch agent 설치/실행 가이드
https://docs.aws.amazon.com/ko_kr/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Agent-commandline-fleet.html

```sh
# 설치
sudo yum install amazon-cloudwatch-agent

# 최신 버전 업데이트
sudo yum update amazon-cloudwatch-agent -y

# 설치 위치
cd /opt/aws/amazon-cloudwatch-agent/bin/

# config wizard 실행
sudo ./amazon-cloudwatch-agent-config-wizard

# config.json 확인
cat config.json
{
	"agent": {
		"metrics_collection_interval": 60,
		"run_as_user": "root"
	},
	"logs": {
		"logs_collected": {
			"files": {
				"collect_list": [
					{
						"file_path": "/var/log",
						"log_group_class": "STANDARD",
						"log_group_name": "log",
						"log_stream_name": "{instance_id}",
						"retention_in_days": 1
					}
				]
			}
		}
	},
	"metrics": {
		"aggregation_dimensions": [
			[
				"InstanceId"
			]
		],
		"append_dimensions": {
			"AutoScalingGroupName": "${aws:AutoScalingGroupName}",
			"ImageId": "${aws:ImageId}",
			"InstanceId": "${aws:InstanceId}",
			"InstanceType": "${aws:InstanceType}"
		},
		"metrics_collected": {
			"collectd": {
				"metrics_aggregation_interval": 60
			},
			"cpu": {
				"measurement": [
					"cpu_usage_idle",
					"cpu_usage_iowait",
					"cpu_usage_user",
					"cpu_usage_system"
				],
				"metrics_collection_interval": 60,
				"resources": [
					"*"
				],
				"totalcpu": false
			},
			"disk": {
				"measurement": [
					"used_percent",
					"inodes_free"
				],
				"metrics_collection_interval": 60,
				"resources": [
					"*"
				]
			},
			"diskio": {
				"measurement": [
					"io_time",
					"write_bytes",
					"read_bytes",
					"writes",
					"reads"
				],
				"metrics_collection_interval": 60,
				"resources": [
					"*"
				]
			},
			"mem": {
				"measurement": [
					"mem_used_percent"
				],
				"metrics_collection_interval": 60
			},
			"netstat": {
				"measurement": [
					"tcp_established",
					"tcp_time_wait"
				],
				"metrics_collection_interval": 60
			},
			"statsd": {
				"metrics_aggregation_interval": 60,
				"metrics_collection_interval": 10,
				"service_address": ":8125"
			},
			"swap": {
				"measurement": [
					"swap_used_percent"
				],
				"metrics_collection_interval": 60
			}
		}
	}
}

# cloudwatch agent 실행
# -a 옵션: action을 지정. fetch-config: CloudWatch Agent의 설정을 가져오라는 명령어
# -m 옵션: mode를 지정. EC2 환경에서 동작하도록 설정
# -s : start의 약자로, 설정을 가져온 후 CloudWatch Agent를 시작하라는 의미. 설정을 적용한 후 즉시 에이전트를 실행하여 메트릭 수집 및 로그 전송을 시작
# -c 옵션: configuration 파일의 위치를 지정. file: : 설정 파일이 로컬 파일 시스템에 있음을 나타냅니다.
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json

# cloudwatch agent 종료
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop

# 실행 확인
sudo amazon-cloudwatch-agent-ctl -m ec2 -a status
{
  "status": "running",
  "starttime": "2024-11-12T04:45:31+00:00",
  "configstatus": "configured",
  "version": "1.300044.0"
}

# 서비스 상태 확인
sudo systemctl status amazon-cloudwatch-agent

# ec2 iam 권한 설정 

# config.json에 collectd 설정 변경
// service_address: CloudWatch 에이전트가 수신 대기해야 하는 서비스 주소입니다. 형식은 "udp://ip:port입니다. 기본값은 udp://127.0.0.1:25826이기 때문에 생략해도 됨. collectd 설정을 바꾸지 않는 한.
// name_prefix: 각 collectd 지표의 이름 시작 부분에 부착하는 접두사. 기본값은 collectd_입니다. 최대 길이는 255자입니다.
// collectd_security_level: 네트워크 구성의 보안 수준을 설정. 기본값은 encrypt. encrypt는 암호화된 데이터만 수락하도록 지정합니다. sign은 서명되고 암호화된 데이터만 수락하도록 지정합니다. none은 모든 데이터를 수락하도록 지정. 이 설정을 none으로 안해줬더니 collectd 값이 안들어왔었음.
{
	"metrics": {
		"metrics_collected": {
			"collectd": {
				"metrics_aggregation_interval": 60,
				"collectd_security_level": "none",
				"name_prefix":"My_collectd_metrics_"
				},
			}
		}
}

# cloudwatch agent 재실행
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
sudo systemctl restart amazon-cloudwatch-agent

# 로그 확인 
sudo journalctl -u amazon-cloudwatch-agent -f

# 에이전트 로그에서 collectd 메트릭 수신 여부를 확인
sudo tail -100f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

```

- Create the CloudWatch agent configuration file with the wizard
https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-cloudwatch-agent-configuration-file-wizard.html

- cloudwatch agent에 collectd 설정 추가
https://docs.aws.amazon.com/ko_kr/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-custom-metrics-collectd.html

- Amazon CloudWatch Agent와 collectd 시작하기
https://aws.amazon.com/ko/blogs/tech/getting-started-with-cloudwatch-agent-and-collectd/

