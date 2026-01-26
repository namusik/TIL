# Session Manager 

- EC2 인스턴스에 안전하게 “원격 세션”을 제공하는 AWS 관리형 접속 서비스
- 전통적인 SSH/RDP 접속을 대체하도록 설계됨.

## 왜 Session Manager가 등장했는가

### 기존 방식(SSH/RDP)의 한계
- 퍼블릭 IP 또는 Bastion 필요
- 인바운드 포트(22/3389) 개방
- PEM 키 관리 필요
- 누가 언제 무엇을 했는지 감사가 어려움

### Session Manager의 목적
- 네트워크 진입점 제거
- 자격 증명(IAM) 기반 통제
- 접속 이력과 감사 로그 확보
- 운영 표준 단순화

---

## Session Manager의 동작 원리

1️⃣ 누가 접속하는가
- 사용자 또는 자동화 도구
- IAM 사용자 / IAM Role
- MFA, 조건부 정책 적용 가능

2️⃣ 어떻게 연결되는가
- EC2에 설치된 **SSM Agent**가 AWS SSM 서비스와 아웃바운드 **HTTPS**(443) 연결 유지

중요한 포인트:
- ❌ 외부에서 EC2로 들어오는 인바운드 연결 없음
- ✅ EC2가 AWS로 나가는 연결만 존재

3️⃣ 세션은 어떻게 열리는가
1.	사용자가 StartSession 요청
2.	AWS SSM이 요청을 검증(IAM)
3.	SSM Agent가 세션을 열어 쉘 제공
4.	사용자는 콘솔 또는 CLI로 터미널 사용

---

## Session Manager가 제공하는 것

✔ 서버 쉘 접속
- Linux: bash/sh
- Windows: PowerShell

✔ 포트 포워딩
- DB 접속
- 내부 서비스 접근
- 로컬 ↔ Private 서버 터널링

✔ 명령 실행 연계
- Run Command
- Automation
- 배포/운영 자동화

---

## Session Manager가 제공하지 않는 것
- ❌ 파일 전송(SFTP) 직접 제공
- ❌ 로그인 셸 환경
- ❌ 사용자 계정 인증

대신:
- 파일 전송 → S3 연계
- 인증 → IAM
- 환경 설정 → SSM Document / UserData

---

## SSH와 Session Manager 비교

|구분|SSH|Session Manager
|-|-|-|
|인증방식|키파일|IAM
|퍼블릭 IP|필요|불필요
|인바운드 포트|필요|불필요
|키 관리|필요|불필요
|감사 로그|제한적|완전
|Private Subnet|복잡|간단

---

## Session Manager의 핵심 구성 요소

1. SSM Agent
   1. EC2에서 실행되는 데몬
   2. 세션 생성·유지 담당
    
2. IAM Role (EC2)
   1. EC2가 SSM과 통신할 권한
   2. 보통 AmazonSSMManagedInstanceCore
    
3. IAM Policy (사용자)
   1. 누가 어떤 인스턴스에 접속 가능한지 정의
    
4. 네트워크 경로
   1. NAT Gateway 또는 VPC Endpoint
   2. 포트는 443/tcp 하나면 충분

## EC2에 SSM 설정하기

### 공통 원칙 (Public / Private 동일)

SSM 접속을 위해 반드시 필요한 3요소는 동일합니다.
1.	IAM Role (**AmazonSSMManagedInstanceCore**)
2.	SSM Agent 실행
3.	AWS SSM Endpoint와 통신 가능 (443)

퍼블릭/프라이빗 차이는 네트워크 경로뿐

### Public Subnet EC2 생성 (SSM 가능)

1. EC2 생성 시 IAM Role 설정 (가장 중요)

- IAM instance profile
- AmazonSSMManagedInstanceCore 포함된 Role 선택


2.  OS 선택

- Amazon Linux 2 / Amazon Linux 2023 권장
- SSM Agent 기본 설치됨
- 

3. 네트워크

- Public Subnet
- 퍼블릭 IPv4: 있어도 되고 없어도 됨 (SSM에는 영향 없음)


4. 보안 그룹

- Inbound: 없어도 됨 (SSM은 인바운드 필요 없음)
- Outbound: 443/tcp 허용 (또는 All)

5. 생성 후 확인

```
aws ssm start-session --target i-xxxx
```

### Private Subnet EC2 생성 (SSM 가능, 운영 표준)

1.  IAM Role (동일)

- AmazonSSMManagedInstanceCore

2. 네트워크 (차이점)

- 선택 A — NAT Gateway 사용
  - Route Table: 0.0.0.0/0 → NAT Gateway
  - Outbound 443 가능

- 선택 B — VPC Endpoint 사용 (권장)
  - 생성할 Endpoint:
    - com.amazonaws.ap-northeast-2.ssm
    - com.amazonaws.ap-northeast-2.ssmmessages
    - com.amazonaws.ap-northeast-2.ec2messages
  - Endpoint SG:
    - Inbound 443 from EC2 SG


3. 보안 그룹

- Inbound: ❌ 없음
- Outbound: 443 허용


4. 퍼블릭 IP

- ❌ 절대 필요 없음

5. 생성 후 확인
```
aws ssm start-session --target i-xxx --region ap-northeast-2
```

```
# SSM Agent 설치됐는지 확인
rpm -qa | grep -i amazon-ssm-agent
amazon-ssm-agent-3.3.3598.0-1.x86_64

which amazon-ssm-agent
/usr/bin/amazon-ssm-agent

which amazon-ssm-agent
/usr/bin/amazon-ssm-agent
[ec2-user@ip-10-40-159-217 ~]$ systemctl status amazon-ssm-agent
* amazon-ssm-agent.service - amazon-ssm-agent
   Loaded: loaded (/etc/systemd/system/amazon-ssm-agent.service; enabled; vendor preset: enabled)
   Active: active (running) since �� 2026-01-22 13:53:43 KST; 1h 49min ago
 Main PID: 31226 (amazon-ssm-agen)
    Tasks: 23
   Memory: 272.3M
   CGroup: /system.slice/amazon-ssm-agent.service
           |-31226 /usr/bin/amazon-ssm-agent
           `-31709 /usr/bin/ssm-agent-worker

 1�� 22 13:53:46 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 13:53:46.4739 INFO [amazon-ssm-agent] [LongRunningWorkerContainer] Monitor long running worker health every 60 seconds
 1�� 22 14:23:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 14:23:45.4815 INFO EC2RoleProvider Successfully connected with instance profile role credentials
 1�� 22 14:23:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 14:23:45.4818 INFO [CredentialRefresher] Credentials ready
 1�� 22 14:23:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 14:23:45.4818 INFO [CredentialRefresher] Next credential rotation will be in 29.999995939133335 minutes
 1�� 22 14:53:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 14:53:45.5587 INFO EC2RoleProvider Successfully connected with instance profile role credentials
 1�� 22 14:53:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 14:53:45.5588 INFO [CredentialRefresher] Credentials ready
 1�� 22 14:53:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 14:53:45.5588 INFO [CredentialRefresher] Next credential rotation will be in 29.999997312866668 minutes
 1�� 22 15:23:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 15:23:45.6166 INFO EC2RoleProvider Successfully connected with instance profile role credentials
 1�� 22 15:23:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 15:23:45.6168 INFO [CredentialRefresher] Credentials ready
 1�� 22 15:23:45 ip-10-40-159-217.ap-northeast-2.compute.internal amazon-ssm-agent[31226]: 2026-01-22 15:23:45.6168 INFO [CredentialRefresher] Next credential rotation will be in 29.999996686766668 minutes
```

### 이미 생성된 Public EC2에 SSM 접속 가능하도록 수정

1. IAM Role 연결
- EC2 → 인스턴스 → 작업 → 보안 → IAM 역할 수정
- AmazonSSMManagedInstanceCore 포함 Role 연결
- 재부팅 불필요


2. SSM Agent 확인
```
systemctl status amazon-ssm-agent
```

없으면
```
sudo yum install -y amazon-ssm-agent
sudo systemctl enable --now amazon-ssm-agent
```

3. 보안 그룹

- Inbound 22 없어도 됨
- Outbound 443 허용

4. 테스트
```
aws ssm start-session --target i-xxxx
```

---

### 이미 생성된 private EC2에 SSM 접속 가능하도록 수정

1. IAM Role 연결 (필수)

- 위와 동일


2. 네트워크 경로 확보

- 이미 NAT Gateway 있으면 추가 작업 ❌
- NAT 없으면 → VPC Endpoint 생성
  - 위 3개 Endpoint 생성
  - Endpoint SG 443 허용


3. 보안 그룹 정리

- Inbound: SSH(22) 제거 가능
- Outbound: 443 허용


4. 퍼블릭 IP 제거 (선택, 권장)

- 중지 → 퍼블릭 IPv4 자동 할당 해제 → 시작

5. 테스트

```
aws ssm start-session --target i-xxxx
```

---

## Session Manager 보안·감사 로그 구성

```
[사용자(IAM)]
   │ StartSession
   ▼
[CloudTrail] ──► (세션 시작/종료 메타데이터)
   │
   ▼
[Session Manager]
   │ (세션 스트림)
   ▼
[CloudWatch Logs / S3] ──► (명령·출력 로그)
```

### 1. CloudTrail — “누가, 언제, 어디에 접속했는가” (필수)

무엇이 기록되나
- StartSession
- ResumeSession
- TerminateSession
- 대상 인스턴스 ID
- 호출한 IAM 사용자/Role
- IP, Region, 시간

왜 중요한가
- 접속 자체의 감사 추적 (접속 여부/빈도)
- 보안 사고 시 책임 주체 명확화
- 컴플라이언스(ISO/SOC) 기본 요구사항 충족

설정 체크
- Management events 활성화
- 모든 리전에 적용
- S3로 로그 저장 권장

CloudTrail은 자동 기록되며, 별도 설정 없이도 Session Manager 이벤트는 남는다.


### 2. CloudWatch Logs — “세션에서 무엇을 했는가” (권장)

CloudTrail이 “접속 사실”이라면,
**CloudWatch Logs는 “세션 내용(명령/출력)”**

설정 방법 (중요)
1. Systems Manager → 세션관리자 -> 기본설정
2. Session logging 활성화
3. 스트림 세션 로그 (Recommended) 선택

CloudWatch Logs 권장 설정

- Log group 예: /aws/ssm/session-manager
- KMS 암호화 활성화
- 보존 기간 설정 (예: 90일 / 180일)

기록되는 내용
- 입력한 명령
- 표준 출력/에러
- 세션 시작/종료 타임스탬프

⚠️ 암호 입력 등 민감 정보도 기록될 수 있으므로 접근 권한 제한 필수

### 3. S3 로그 — 장기 보관 / 감사 대응 (선택)

언제 필요한가
- 장기 보관(1년 이상)
- 외부 감사/법적 요구
- 로그 불변성 필요

설정 포인트
- 전용 버킷 생성
- Public access 차단
- **Object Lock(Optional)** 로 변경 불가 설정
- Lifecycle로 Glacier 이전


### IAM 접근 통제 — “누가 로그를 볼 수 있는가” (핵심)

원칙
- 접속 권한 ≠ 로그 열람 권한
- 운영자와 감사자 분리

예시 정책
- 운영자:
  - ssm:StartSession
  - CloudWatch Logs 읽기 불가
- 감사자:
  - logs:GetLogEvents
  - s3:GetObject
  - SSM 접속 권한 없음

---

## 사고 조사 표준 흐름 (SSM + CloudTrail)

전체 개념

- CloudTrail: 누가 / 언제 / 어떤 인스턴스에 접속했는가 (사실 확인)
- CloudWatch Logs (SSM 세션 로그): 세션 안에서 무엇을 했는가 (행위 확인)

원칙: CloudTrail → 범위 확정 → CloudWatch Logs → 행위 재구성

⸻

1️⃣ 사고 시점 정의 (타임박스 설정)

먼저 의심 시각 범위를 확정합니다.
	•	예: 2026-01-21 16:40 ~ 17:10 (KST)
	•	근거: 장애 발생 알림, 변경 감지, 외부 신고 등

👉 이 범위가 이후 모든 필터의 기준입니다.


2️⃣ CloudTrail로 “접속 사실” 식별 (1차 필터)

목적
- 누가 접속했는지
- 어떤 인스턴스에 접속했는지
- 정확한 접속 시각

방법

CloudTrail → Event history에서 필터:
- Event source: ssm.amazonaws.com
- Event name: StartSession
- Time range: 위 타임박스

확보 정보
- eventTime
- userIdentity.arn (IAM User/Role)
- requestParameters.target (Instance ID)
- sourceIPAddress

👉 결과로 **의심 세션 목록** 을 생성

3️⃣ 세션 종료 여부 확인 (완결성 체크)

같은 조건으로:
- Event name: TerminateSession

확인 포인트:
- 시작만 있고 종료가 없는 세션?
- 비정상 종료/강제 종료 여부?

👉 세션 생애주기 파악


4️⃣ CloudWatch Logs에서 “행위” 조회 (2차 필터)

목적
- 세션 안에서 실제로 실행된 명령과 출력 결과 확인

방법

CloudWatch → Logs → Log groups → (SSM 세션 로그 그룹)

필터 기준:
- 시간: CloudTrail에서 확보한 eventTime 전후
- 인스턴스 식별자: 로그 메시지에 포함된 Instance ID/Session ID
- 키워드: sudo, rm, systemctl, kubectl, mysql, curl 등

확인 포인트
- 실행된 명령의 순서
- 설정 변경 여부
- 서비스 재시작/중지
- 외부 통신 흔적

👉 행위 타임라인 재구성


5️⃣ 사용자–행위 매칭 (핵심 단계)

이 단계가 사고 조사의 핵심

매칭 기준
- CloudTrail:
  - userIdentity.arn
  - eventTime
  - instanceId
- CloudWatch Logs:
  - 동일 인스턴스
  - 동일 시간대
  - 동일 세션 스트림

👉 **“이 사용자가 이 시각에 이 명령을 실행했다”** 를 확정

주의: 두 로그는 자동으로 조인되지 않으므로 시간/인스턴스 기준 수동 매칭이 표준

--- 

## S3로 SFTP 대체하기

```sh
aws s3 cp aa.tgz s3://upload/upload/aa
```
- 로컬에서 s3에 파일 업로드


```
sh-4.2$ aws sts get-caller-identity
{
    "UserId": "",
    "Account": "",
    "Arn": "arn:aws:sts:::assumed-role/AmazonSSMRoleForInstancesQuickSetup/"
}
```
- SSM으로 접속한 서버에서 IAM 확인
- --profile을 쓰지 말고 EC2 Role로 받기
  - EC2 Instance Profile(Role) 인 AmazonSSMRoleForInstancesQuickSetup이 나와야 함.
- SSM으로 들어간 서버가 EC2 Role을 쓰려면, 인스턴스에 Role에 최소한 아래 권한 붙어 있어야 한다.
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDownloadUploadPrefix",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::megabird-upload/upload/*"]
    }
  ]
}
```

```sh
aws s3 cp s3://upload/aa.tgz ./aa.tgz --region ap-northeast-2
```
- 서버에서 s3부터 다운로드