# RDS 로그 설정 

## RDS 모니터링 설정

![rdsLog](../../images/AWS/rdsLog.png)



## 클럭스터 파라미터 그룹

### 감사 로그 (Audit Log) for Aurora MySQL

감사 로그를 활성화하고 CloudWatch Logs로 내보내려면 다음 설정이 필요합니다.

- 옵션 그룹 (Option Group) 설정:
  - Aurora MySQL 클러스터에 연결된 옵션 그룹에 MARIADB_AUDIT_PLUGIN을 추가하고 활성화해야 합니다. 이 플러그인이 감사 기능을 제공합니다.
- DB 클러스터 파라미터 그룹 설정:
  - **server_audit_logging**: 
    - ON 으로 설정하여 감사 로깅 기능을 시작합니다.
    - default off
  - **server_audit_events**: 
    - 기록하고자 하는 이벤트 유형을 쉼표로 구분하여 지정합니다. (예: CONNECT,QUERY_DML,TABLE,DDL). 
    - 단순히 1로 설정하는 것이 아니라, **원하는 감사 이벤트 종류를 명시**해야 합니다.
    - CONNECT: 접속 및 접속 해제, 실패한 로그인 시도.
    - QUERY: 모든 쿼리 (매우 많은 로그 발생 가능, 주의 필요).
    - QUERY_DCL: GRANT, REVOKE 등의 DCL 문.
    - QUERY_DDL: CREATE, ALTER, DROP 등의 DDL 문.
    - QUERY_DML: SELECT, INSERT, UPDATE, DELETE 등의 DML 문.
    - TABLE: 특정 테이블에 대한 DML 및 DDL 작업.
  - **server_audit_output_type**: 
    - RDS가 CloudWatch Logs로 로그를 내보내려면 로그가 파일로 기록되어야 하므로, 이 값은 일반적으로 RDS에서 FILE로 관리됩니다. 특별히 변경할 필요는 없을 수 있습니다.

## 에러 로그 (Error Log) for Aurora MySQL

- 에러 로그는 Aurora MySQL에서 기본적으로 활성화되어 파일로 기록된다.
- 일반적으로 DB 클러스터 파라미터 그룹에서 에러 로그 생성을 위해 특별히 1이나 ON으로 설정해야 하는 값은 없습니다. RDS가 표준 MySQL 에러 로그를 수집합니다.
- **log_error_verbosity** (Aurora MySQL 2.07/MySQL 5.7 호환 이상 또는 Aurora MySQL 3.x/MySQL 8.0 호환에서 사용 가능): 에러 로그의 상세 수준을 조절할 수 있습니다 
  - (기본값은 일반적으로 3).

## 일반 로그 (General Log) for Aurora MySQL

- 모든 실행된 SQL 문을 기록합니다. (주의: 성능 저하 및 스토리지 비용 증가의 원인이 될 수 있으므로 필요한 경우에만 사용하세요.)

- DB 클러스터 파라미터 그룹 설정:
  - **general_log**: 
    - 1 (또는 ON)으로 설정합니다.
    - default off
  - **log_output**: 
    - FILE 또는 TABLE,FILE로 설정되어야 합니다. RDS는 FILE로 기록된 로그를 CloudWatch Logs로 내보냅니다. 일반적으로 RDS 생성 시 기본값에 FILE이 포함됩니다.

## iam-db-auth-error 로그 (IAM DB Auth Error Log) for Aurora MySQL

- 이 로그는 **RDS의 IAM 데이터베이스 인증 기능 사용 시 발생하는 인증 오류**를 기록합니다.
- 선행 조건: Aurora 클러스터 또는 인스턴스에 IAM 데이터베이스 인증이 활성화되어 있어야 합니다.
- DB 클러스터 파라미터 그룹 설정:
  -  IAM 인증 오류 로그 생성 자체를 위해 사용자가 직접 DB 클러스터 파라미터 그룹에서 특정 파라미터를 ON 또는 1로 설정하는 것은 일반적이지 않습니다. IAM 인증 기능이 활성화되어 있고 인증 실패가 발생하면 RDS가 이 로그를 생성합니다.
-  CloudWatch Logs로의 내보내기는 Aurora 클러스터 설정의 "로그 내보내기"에서 해당 체크박스를 선택하는 것으로 제어됩니다.

## Instance 로그 (Instance Log) for Aurora MySQL

- Aurora의 경우 Aurora 스토리지 또는 특정 인스턴스 관련 이벤트 로그를 지칭
- 이러한 로그들은 Aurora 플랫폼 자체에서 관리되는 경우가 많으며, 사용자가 DB 클러스터 파라미터 그룹에서 직접 생성 여부를 제어하는 파라미터가 명시적으로 없을 수 있습니다.
- iam-db-auth-error 로그와 마찬가지로, CloudWatch Logs로의 내보내기는 주로 Aurora 클러스터 설정의 "로그 내보내기" 체크박스를 통해 제어됩니다.

## 느린 쿼리 로그 (Slow Query Log) for Aurora MySQL

- 설정된 시간 이상으로 실행된 쿼리를 기록합니다.
- DB 클러스터 파라미터 그룹 설정:
  - **slow_query_log**: 
    - 1 (또는 ON)으로 설정합니다.
    - default off
  - **long_query_time**: 
    - 쿼리가 "느리다"고 간주될 실행 시간(초 단위)을 설정합니다. (예: 1.0으로 설정하면 1초 이상 소요된 쿼리가 기록됩니다.)
    - default 10.0 초
  - **log_output**: 
    - FILE 또는 TABLE,FILE로 설정되어야 합니다.
  - (선택 사항) **log_queries_not_using_indexes**: 
    - ON 또는 1로 설정하면 인덱스를 사용하지 않는 쿼리도 느린 쿼리 로그에 기록할 수 있습니다 (실제 실행 시간이 long_query_time 미만이더라도).
    - default off
  - (선택 사항) **min_examined_row_limit**: 
    - 특정 수 이상의 행을 검사한 쿼리만 로깅하도록 설정할 수 있습니다.
    - default 0. 검토한 해 수에 관계없이 기록
- slow 쿼리 기준
  - 실시간 시스템
		-	기준 시간: 0.5초~1초
		-	실시간 데이터베이스 또는 고성능 트랜잭션 시스템.
		-	예: 주식 거래 시스템, 게임 서버, 금융 거래 플랫폼.
		-	이 환경에서는 밀리초 단위의 응답 속도가 중요하므로 짧은 기준이 설정됩니다.
  - 일반적인 웹 애플리케이션
  	-	기준 시간: 1초~3초
  	-	사용자 경험을 중요하게 생각하는 일반적인 환경.
  	-	예: 전자상거래 웹사이트, 블로그, 기업 애플리케이션.
  	-	대부분의 쿼리가 1초 이내에 처리되기를 원하지만, 3초까지는 허용 가능한 범위로 간주됩니다.
	- 데이터 분석 환경
		-	기준 시간: 5초 이상
		-	데이터 웨어하우스나 OLAP 시스템에서 사용.
		-	배치 처리 작업이나 복잡한 분석 쿼리에서는 더 긴 시간이 허용됩니다.
		-	예: 대규모 데이터 분석, ETL(Extract, Transform, Load) 작업.


## CloudWatch로 RDS의 로그를 보내기 위해 해야 할 일:

RDS의 특정 로그 (예: 감사 로그)를 CloudWatch Logs로 전송하려면 일반적으로 다음 두 단계의 설정이 모두 필요합니다.

(1) 데이터베이스 엔진 레벨에서 로그 생성 활성화 (주로 파라미터 그룹 수정):

감사 로그의 경우:
감사 플러그인 활성화: (Aurora MySQL의 경우) 옵션 그룹에서 MARIADB_AUDIT_PLUGIN과 같은 감사 플러그인을 활성화합니다.
감사 로깅 활성화: DB 파라미터 그룹에서 server_audit_logging 파라미터를 ON으로 설정합니다.
감사 이벤트 지정: DB 파라미터 그룹에서 server_audit_events 파라미터에 원하는 감사 이벤트 유형(예: CONNECT,QUERY_DML)을 설정합니다.
(필요시) server_audit_output_type을 FILE로 설정하여 로그가 파일로 기록되도록 합니다 (RDS가 CloudWatch로 내보내기 위해 일반적으로 파일 기반 로그를 사용합니다).
다른 로그 유형의 경우 (오류 로그, 일반 로그, 느린 쿼리 로그 등):
오류 로그: 대부분 기본적으로 활성화되어 파일로 기록됩니다.
일반 로그 (General Log) / 느린 쿼리 로그 (Slow Query Log): DB 파라미터 그룹에서 해당 로그를 활성화해야 합니다.
예) MySQL/Aurora MySQL: general_log = 1, slow_query_log = 1. 또한 log_output 파라미터가 FILE로 설정되어 있는지 확인합니다.
(2) RDS 레벨에서 CloudWatch Logs로 로그 내보내기 활성화 (이미지의 설정 화면에서 구성):

DB 인스턴스 또는 클러스터의 수정 페이지로 이동합니다.
"로그 내보내기(Log exports)" 섹션(제공해주신 이미지에 보이는 부분)으로 스크롤합니다.
CloudWatch Logs로 보내고 싶은 로그 유형 옆의 체크박스를 선택합니다.
감사 로그를 보내려면 "감사 로그" 체크박스를 선택합니다.
오류 로그를 보내려면 "오류 로그" 체크박스를 선택합니다.
일반 로그를 보내려면 "일반 로그" 체크박스를 선택합니다.
느린 쿼리 로그를 보내려면 "느린 쿼리 로그" 체크박스를 선택합니다.
이미지에 보이는 다른 로그 유형(iam-db-auth-error 로그, Instance 로그, 데이터베이스 로그)도 마찬가지입니다.
설정을 저장하여 적용합니다. (변경 사항 적용 시점에 따라 즉시 적용 또는 다음 유지 관리 기간 적용을 선택할 수 있으며, 경우에 따라 인스턴스 재시작이 필요할 수 있습니다.)