# MySQL Explain 실행계획

## 컬럼 의미

###	id: SELECT 문의 순서 또는 중첩 수준.
###	select_type: SELECT 문의 유형 (예: SIMPLE, PRIMARY, SUBQUERY 등).
###	table: 쿼리에 사용되는 테이블 이름.
###	partitions: 사용된 파티션 정보 (사용하지 않음).
### type: 조인 유형 또는 액세스 방식 
- NULL
  -  `SELECT NOW();`      
  - 쿼리가 테이블에 접근할 필요가 없는 경우
  - 상수 또는 함수만을 사용하여 결과를 도출할 때 발생
  - 특징:
	    -	효율성: 가장 효율적인 접근 방식입니다.
	    -	사용 시기: 테이블 데이터를 전혀 사용하지 않는 경우입니다.
- system
  - 설명:
	  -	테이블에 **단 한 행만 존재하는 경우**로, 테이블을 한 번만 읽으면 됩니다.
	  -	실질적으로 const 타입과 유사하지만, 특별히 행이 하나만 있는 경우입니다.
  - 특징:
	  -	효율성: 매우 빠르며, 거의 비용이 없습니다.
	  -	사용 시기: 작은 설정 테이블이나 단일 행 테이블에서 사용됩니다.
- const
  - 설명:
	  -	테이블이 **최대 한 행만 일치**하며, 해당 행을 상수처럼 취급합니다.
	  -	**프라이머리 키나 유니크 인덱스를 사용하여 특정 값을 조회할 때** 발생합니다.
  - `SELECT * FROM users WHERE user_id = 1;`
  - 특징:
	  -	효율성: 테이블을 한 번만 읽으면 되므로 매우 빠릅니다.
	  -	사용 시기: 특정 행을 정확히 조회할 때 사용됩니다.
- eq_ref
  - 설명:
	  -	**조인된 테이블**의 **프라이머리 키나 유니크 인덱스**에 대한 동등 비교(equal comparison)를 통해 **단일 행**을 검색
    - `SELECT * FROM orders JOIN customers ON orders.customer_id = customers.customer_id;`
      -  customers.customer_id가 프라이머리 키인 경우
   - 특징:
	  -	효율성: 매우 효율적인 조인 방식입니다.
	  -	사용 시기: 유니크 키를 기반으로 한 조인에서 사용됩니다.
- ref
  - 설명:
	  -	**비유니크 인덱스나 프라이머리 키의 일부**를 사용하여 데이터를 검색합니다.
	  -	특정 값과 일치하는 다수의 행을 반환할 수 있습니다.
  - `SELECT * FROM products WHERE category_id = 5;`
    - category_id에 인덱스가 존재하는 경우
  - 특징:
	  -	효율성: 인덱스를 사용하므로 효율적입니다.
	  -	사용 시기: 외래 키나 비유니크 인덱스를 통한 검색에 사용됩니다.
- fulltext
  - 설명:
	  -	**FULLTEXT 인덱스**를 사용하여 검색할 때 발생합니다.
	  -	전문 검색에서 사용됩니다.
  - `SELECT * FROM articles WHERE MATCH(content) AGAINST('database');`
  - 특징:
	  -	효율성: 전문 검색에 특화되어 있으며, **대량의 텍스트 데이터를 효율적으로 검색**합니다.
	  -	사용 시기: 블로그 게시물, 기사 등 텍스트 기반 데이터에서 키워드 검색 시 사용됩니다.
- ref_or_null
  - 설명:
	  -	ref 타입과 유사하지만, **NULL 값도 포함하여 검색**합니다.
	  -	조건이 column = value OR column IS NULL인 경우에 발생합니다.
  - `SELECT * FROM employees WHERE manager_id = 5 OR manager_id IS NULL;`
  - 특징:
	  -	효율성: ref 타입보다 약간 떨어질 수 있습니다.
	  -	사용 시기: 외래 키가 NULL 값을 가질 수 있는 경우에 사용됩니다.
- index_merge
  - 설명:
	  -	**여러 인덱스를 병합하여 검색**합니다.
	  -	둘 이상의 인덱스를 사용하여 조건을 만족하는 행을 찾습니다.
  - `SELECT * FROM users WHERE first_name = 'John' OR last_name = 'Doe';`
    - first_name과 last_name에 각각 인덱스가 있는 경우
  - 특징:
	  -	효율성: 단일 인덱스를 사용하는 것보다 효율성이 떨어질 수 있습니다.
  -	사용 시기: 여러 조건에 대한 인덱스가 있지만, 복합 인덱스가 없을 때 사용됩니다.
- unique_subquery
  - 설명:
	  -	**서브쿼리에서 유니크 인덱스를 사용**하여 **단일 값**을 검색합니다.
	  -	특정 형태의 서브쿼리에서 발생합니다.
  - `SELECT * FROM orders WHERE order_id IN (SELECT DISTINCT order_id FROM order_items);`
  - 특징:
	  -	효율성: 서브쿼리를 효율적으로 처리합니다.
	  -	사용 시기: 서브쿼리가 유니크한 값을 반환할 때 사용됩니다.
- index_subquery
  - 설명:
	  -	**서브쿼리에서 인덱스를 사용**하여 **다중 값**을 검색합니다.
	  -	**IN 조건**에 대한 서브쿼리에서 발생합니다.
  - `SELECT * FROM products WHERE product_id IN (SELECT product_id FROM sales WHERE amount > 100);`
  - 특징:
	  -	효율성: 서브쿼리를 인덱스를 사용하여 빠르게 처리합니다.
	  -	사용 시기: 서브쿼리가 다수의 값을 반환할 때 사용됩니다.
- range
  - 설명:
	  -	**인덱스 범위 스캔**을 의미하며, 인덱스의 특정 부분만을 스캔합니다.
	  -	**BETWEEN, >, <, >=, <=, IN 등의 조건**에서 발생합니다.
  - `SELECT * FROM orders WHERE order_date >= '2023-01-01' AND order_date <= '2023-12-31';`
  - 특징:
	  -	효율성: 필요한 범위만 읽으므로 효율적이지만, ref 타입보다 효율성이 낮습니다.
	  -	사용 시기: 날짜나 숫자 범위를 조회할 때 사용됩니다.
- index: **인덱스 전체를 스캔**하며, ALL보다는 효율적이지만 여전히 비용이 높을 수 있습니다.
  - 설명:
	  -	**전체 인덱스 스캔**을 의미하며, 인덱스의 처음부터 끝까지 읽습니다.
	  -	테이블의 모든 데이터를 인덱스를 통해 읽을 때 발생합니다.
  - `SELECT indexed_column FROM large_table;`
  - 특징:
	  -	효율성: 인덱스가 데이터보다 작으므로 ALL 타입보다는 효율적입니다.
	  -	사용 시기: 인덱스에 포함된 컬럼만을 선택할 때 사용됩니다.
- ALL
  - 설명:
	  -	**전체 테이블 스캔을 의미**하며, 테이블의 모든 행을 읽습니다.
	  -	**인덱스를 사용하지 않을 때 발생**합니다.
  - `SELECT * FROM customers;`
    - 인덱스가 없거나 조건절이 없는 경우
  - 특징:
	  -	효율성: **가장 비효율적**인 접근 방식입니다.
	  -	사용 시기: 작은 테이블에서는 큰 문제가 아니지만, 큰 테이블에서는 성능 저하의 원인이 됩니다.

###	possible_keys: 옵티마이저가 사용할 수 있는 인덱스 목록.
###	key: 실제로 선택된 인덱스.
###	key_len: 사용된 인덱스 키의 길이 (바이트 단위).
###	ref: 인덱스에서 비교되는 값
###	rows: 예상되는 처리 행 수.
###	filtered: 테이블 조건에 의해 필터링되는 행의 비율 (%).
###	Extra: 추가적인 실행 계획 정보.

## 예시 

id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
1	SIMPLE	TMG_MSG_GRP	ref	PRIMARY, IDX_TMG_MSG_SND_02, IDX_TMG_MSG_GRP_03	IDX_TMG_MSG_SND_02	162	const	1345	0.12	Using where

## 비용 분석


## 출처
https://nomadlee.com/mysql-explain-sql/