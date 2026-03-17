# Athen table

S3에 저장된 데이터를 SQL을 사용해 분석할 수 있게 해주는 서버리스 쿼리 서비스

복잡한 데이터베이스 설정이나 인프라를 구축할 필요 없이 빠르고 효율적으로 데이터에 접근하여 분석할 수 있는 간편한 서비스

다양한 데이터 분석과 비즈니스 인텔리전스(BI) 작업에 활용

## 기능 
1. 서버리스 데이터 분석

-	서버리스: Athena는 **서버리스**로 제공되어 인프라 관리가 필요 없고, 확장성에 신경 쓸 필요가 없습니다. 사용자는 단순히 쿼리만 작성하면 되며, AWS가 모든 리소스를 자동으로 관리해 줍니다.
-	SQL 지원: Athena는 **SQL을 기반**으로 하여 데이터를 질의할 수 있으므로, SQL에 익숙한 사용자라면 쉽게 사용 가능합니다.

2. S3 데이터 분석

-	데이터 소스: Athena는 **주로 S3에 저장된 데이터 파일을 분석**하는 데 사용됩니다. JSON, CSV, Parquet, ORC, Avro 같은 여러 포맷을 지원하여 다양한 데이터 구조와 형식을 처리할 수 있습니다.
-	데이터 스키마 정의: 테이블을 생성할 때 S3의 데이터 파일 위치를 지정하고 컬럼과 데이터 형식을 정의합니다. 이는 테이블을 물리적으로 생성하는 것이 아니라, Athena가 데이터를 어떻게 해석할지를 지정하는 것입니다.

3. 비용 효율성

-	쿼리당 비용: Athena는 **분석한 데이터의 양에 따라 비용이 청구**되며, 쿼리 실행 전에 데이터 압축 및 분할을 통해 비용을 절감할 수 있습니다. 분석할 데이터 양을 최소화하여 비용을 줄일 수 있습니다.
-	데이터 압축 및 파티셔닝: 데이터를 Parquet, ORC 같은 열 지향 파일 포맷으로 변환하거나 S3에 파티셔닝하여 저장하면, 쿼리가 필요한 데이터만 조회하여 비용을 줄일 수 있습니다.

4. 통합 및 확장성

-	AWS Glue와의 통합: AWS Glue 데이터 카탈로그와 통합되어 메타데이터 관리를 자동화하고, 데이터 스키마 및 테이블을 손쉽게 관리할 수 있습니다. Glue 크롤러를 사용해 S3에 저장된 데이터의 스키마를 자동으로 추출하고 카탈로그에 저장할 수도 있습니다.
-	다양한 데이터 소스 지원: Athena는 S3 외에도 다양한 데이터 소스를 지원하며, Federated Query를 통해 다른 데이터베이스(Amazon Redshift, MySQL, PostgreSQL 등)로 확장할 수 있습니다.
-	BI 도구 통합: Amazon QuickSight, Tableau 같은 BI 도구와 연결하여 시각화하거나 보고서를 생성하는 데 활용할 수 있습니다.

5. 실시간 데이터 분석 및 보안

-	실시간 쿼리: Athena는 **실시간 분석이 가능**해 **CloudTrail 로그, ELB 액세스 로그와 같은 로그 데이터를 손쉽게 분석**할 수 있어 보안 감사 및 모니터링에 유용합니다.
-	보안 및 액세스 제어: IAM을 통해 접근 권한을 제어하며, 암호화된 데이터를 쿼리하거나 결과를 암호화할 수 있어 데이터 보안이 강화됩니다.

6. 주요 사용 사례

-	로그 분석: CloudTrail, VPC Flow 로그, ELB 액세스 로그와 같은 로그 데이터를 분석하여 보안 및 규정 준수 모니터링에 활용됩니다.
-	데이터 레이크 분석: S3에 저장된 데이터 레이크에서 대용량 데이터를 분석하는 데 적합하며, 데이터 엔지니어링 및 데이터 사이언스 작업에서 데이터 샘플링이나 전처리에 사용됩니다.
-	데이터 시각화 및 리포팅: Athena와 BI 도구를 연결하여 시각화를 통해 인사이트를 도출하거나 주기적인 리포트를 생성할 수 있습니다.\


## 쿼리 
예시
https://docs.aws.amazon.com/ko_kr/athena/latest/ug/query-examples-cloudtrail-logs.html

alb 테이블 생성 쿼리
https://docs.aws.amazon.com/ko_kr/athena/latest/ug/create-alb-access-logs-table.html

alb 로그에 대한 쿼리 예제
https://docs.aws.amazon.com/ko_kr/athena/latest/ug/query-alb-access-logs-examples.html

vpc flow log 테이블 생성 쿼리
https://docs.aws.amazon.com/ko_kr/athena/latest/ug/vpc-flow-logs-create-table-statement.html