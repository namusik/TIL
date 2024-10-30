# MySQL Explain 실행계획

## 컬럼 의미

•	id: SELECT 문의 순서 또는 중첩 수준.
•	select_type: SELECT 문의 유형 (예: SIMPLE, PRIMARY, SUBQUERY 등).
•	table: 쿼리에 사용되는 테이블 이름.
•	partitions: 사용된 파티션 정보 (사용하지 않음).
•	type: 조인 유형 또는 액세스 방식 (예: ALL, index, range, ref, eq_ref 등).
•	possible_keys: 옵티마이저가 사용할 수 있는 인덱스 목록.
•	key: 실제로 선택된 인덱스.
•	key_len: 사용된 인덱스 키의 길이 (바이트 단위).
•	ref: 조인에서 참조되는 컬럼 또는 상수.
•	rows: 예상되는 처리 행 수.
•	filtered: 테이블 조건에 의해 필터링되는 행의 비율 (%).
•	Extra: 추가적인 실행 계획 정보.

## 예시 

id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	TMG_MSG_GRP	ref	PRIMARY, IDX_TMG_MSG_SND_02, IDX_TMG_MSG_GRP_03	IDX_TMG_MSG_SND_02	162	const	1345	0.12	Using where

## 출처
https://nomadlee.com/mysql-explain-sql/