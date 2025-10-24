# MySQL DUMP 뜨기

## 서버 버전 확인

```sh
SELECT VERSION();
```

## mysqldump 설치

```sh
# 설치
brew install mysql@8.0

# mysqldump 경로 확인
brew --prefix mysql-client
ls $(brew --prefix mysql-client)/bin/mysqldump

# 버전 확인
/opt/homebrew/opt/mysql@8.0/bin/mysqldump --version
```

- 해당 경로를 path to executable에 기입


## dump 옵션

1. Add DROP TABLE before CREATE TABLE
	•	--add-drop-table 옵션
	•	각 테이블을 CREATE TABLE로 생성하기 전에 **기존 테이블을 삭제(DROP)**하는 명령을 추가합니다.
	•	이 옵션을 켜면 DROP TABLE IF EXISTS 구문이 덤프 파일에 들어가서, 복원 시 기존 테이블이 있으면 삭제 후 새로 만듭니다.
	•	복원 시 테이블 중복 오류 방지 용도.

⸻

2. Add DISABLE KEYS before each INSERT
	•	--disable-keys 옵션
	•	INSERT 실행 전 ALTER TABLE ... DISABLE KEYS 구문을 넣어 인덱스 생성을 잠시 중단합니다.
	•	데이터 삽입이 끝난 뒤 ALTER TABLE ... ENABLE KEYS로 인덱스를 한 번에 재구성.
	•	많은 데이터를 덤프 후 복원할 때 성능 향상에 유리.

⸻

3. Add LOCK TABLES before each table dump
	•	--lock-tables 옵션
	•	덤프를 뜨는 동안 해당 테이블을 읽기 잠금(LOCK TABLES ... READ)으로 고정합니다.
	•	덤프 중 데이터가 변하지 않게 보장.
	•	단, InnoDB에서는 FLUSH TABLES WITH READ LOCK이 아닌 경우 트랜잭션 격리만으로도 충분할 수 있습니다.

⸻

4. Add DROP TRIGGER before CREATE TRIGGER
	•	--add-drop-trigger 옵션
	•	트리거를 덤프할 때 기존 트리거가 있으면 삭제 후 생성하도록 DROP TRIGGER 구문을 넣습니다.
	•	테이블과 트리거를 같이 덤프할 때 유용.

⸻

5. Export schema without data
	•	--no-data 옵션
	•	테이블 스키마만 내보내고 데이터는 덤프하지 않음.
	•	개발/테스트용 환경에서 스키마만 복원할 때 유용.

⸻

6. Export schema without tablespaces
	•	--no-tablespaces 옵션
	•	MySQL 8 이상에서 사용. 테이블스페이스(TABLESPACE 절)를 덤프에서 제외.
	•	클라우드 RDS 등에서는 테이블스페이스를 직접 설정할 수 없으므로 이 옵션을 자주 사용.

⸻

7. Export without table creation
	•	--no-create-info 옵션
	•	CREATE TABLE 문을 생략하고 데이터 INSERT문만 덤프.
	•	이미 테이블이 있는 상태에서 데이터만 옮기고 싶을 때 유용.

⸻

8. Include column names in each INSERT
	•	--complete-insert 옵션
	•	INSERT INTO table (col1, col2, ...) VALUES (...) 형태로 컬럼명을 포함한 INSERT문을 생성.
	•	컬럼 순서가 바뀌거나 추가되어도 복원 시 안정성 확보.

⸻

9. Include all table options in CREATE TABLE
	•	--all-tablespaces 및 --set-gtid-purged 등 테이블 정의 시 부가 옵션까지 덤프.
	•	스토리지 엔진, ROW_FORMAT, AUTO_INCREMENT 등 테이블 옵션까지 기록.

⸻

10. Include stored routines in the dump
	•	--routines 옵션
	•	Stored Procedure, Function까지 덤프에 포함.

⸻

11. Lock all tables for the duration of export
	•	--lock-all-tables 옵션
	•	개별 테이블별 잠금이 아니라, DB 전체를 읽기 잠금으로 걸고 덤프.
	•	멀티테이블 consistency 보장.
(단, 서비스 중인 DB에서 이 옵션은 주의 필요)

⸻

12. Use INSERT DELAYED (up to MySQL 5.5)
	•	--delayed-insert 옵션
	•	INSERT DELAYED 구문을 사용. MySQL 5.5까지만 지원.
(현행 MySQL 8에서는 의미 없음)

⸻

13. Use single INSERT for multiple rows
	•	--extended-insert 옵션
	•	여러 레코드를 하나의 INSERT문으로 묶어서 덤프.
	•	복원 시 속도 빠름. 기본적으로 켜두는 것이 일반적.
1. Add DROP TABLE before CREATE TABLE
	•	--add-drop-table 옵션
	•	각 테이블을 CREATE TABLE로 생성하기 전에 **기존 테이블을 삭제(DROP)**하는 명령을 추가합니다.
	•	이 옵션을 켜면 DROP TABLE IF EXISTS 구문이 덤프 파일에 들어가서, 복원 시 기존 테이블이 있으면 삭제 후 새로 만듭니다.
	•	복원 시 테이블 중복 오류 방지 용도.

⸻

2. Add DISABLE KEYS before each INSERT
	•	--disable-keys 옵션
	•	INSERT 실행 전 ALTER TABLE ... DISABLE KEYS 구문을 넣어 인덱스 생성을 잠시 중단합니다.
	•	데이터 삽입이 끝난 뒤 ALTER TABLE ... ENABLE KEYS로 인덱스를 한 번에 재구성.
	•	많은 데이터를 덤프 후 복원할 때 성능 향상에 유리.

⸻

3. Add LOCK TABLES before each table dump
	•	--lock-tables 옵션
	•	덤프를 뜨는 동안 해당 테이블을 읽기 잠금(LOCK TABLES ... READ)으로 고정합니다.
	•	덤프 중 데이터가 변하지 않게 보장.
	•	단, InnoDB에서는 FLUSH TABLES WITH READ LOCK이 아닌 경우 트랜잭션 격리만으로도 충분할 수 있습니다.

⸻

4. Add DROP TRIGGER before CREATE TRIGGER
	•	--add-drop-trigger 옵션
	•	트리거를 덤프할 때 기존 트리거가 있으면 삭제 후 생성하도록 DROP TRIGGER 구문을 넣습니다.
	•	테이블과 트리거를 같이 덤프할 때 유용.

⸻

5. Export schema without data
	•	--no-data 옵션
	•	테이블 스키마만 내보내고 데이터는 덤프하지 않음.
	•	개발/테스트용 환경에서 스키마만 복원할 때 유용.

⸻

6. Export schema without tablespaces
	•	--no-tablespaces 옵션
	•	MySQL 8 이상에서 사용. 테이블스페이스(TABLESPACE 절)를 덤프에서 제외.
	•	클라우드 RDS 등에서는 테이블스페이스를 직접 설정할 수 없으므로 이 옵션을 자주 사용.

⸻

7. Export without table creation
	•	--no-create-info 옵션
	•	CREATE TABLE 문을 생략하고 데이터 INSERT문만 덤프.
	•	이미 테이블이 있는 상태에서 데이터만 옮기고 싶을 때 유용.

⸻

8. Include column names in each INSERT
	•	--complete-insert 옵션
	•	INSERT INTO table (col1, col2, ...) VALUES (...) 형태로 컬럼명을 포함한 INSERT문을 생성.
	•	컬럼 순서가 바뀌거나 추가되어도 복원 시 안정성 확보.

⸻

9. Include all table options in CREATE TABLE
	•	--all-tablespaces 및 --set-gtid-purged 등 테이블 정의 시 부가 옵션까지 덤프.
	•	스토리지 엔진, ROW_FORMAT, AUTO_INCREMENT 등 테이블 옵션까지 기록.

⸻

10. Include stored routines in the dump
	•	--routines 옵션
	•	Stored Procedure, Function까지 덤프에 포함.

⸻

11. Lock all tables for the duration of export
	•	--lock-all-tables 옵션
	•	개별 테이블별 잠금이 아니라, DB 전체를 읽기 잠금으로 걸고 덤프.
	•	멀티테이블 consistency 보장.
(단, 서비스 중인 DB에서 이 옵션은 주의 필요)

⸻

12. Use INSERT DELAYED (up to MySQL 5.5)
	•	--delayed-insert 옵션
	•	INSERT DELAYED 구문을 사용. MySQL 5.5까지만 지원.
(현행 MySQL 8에서는 의미 없음)

⸻

13. Use single INSERT for multiple rows
	•	--extended-insert 옵션
	•	여러 레코드를 하나의 INSERT문으로 묶어서 덤프.
	•	복원 시 속도 빠름. 기본적으로 켜두는 것이 일반적.
