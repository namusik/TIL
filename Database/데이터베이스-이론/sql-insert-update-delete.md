## insert sql

```sql
INSERT INTO EMPLOYEE
VALUES (1, 'MESSI', '1987-02-01', 'M', 'DEV_BACK', 100000000, null);
```

- attribute를 지정해주지 않으면 값의 순서는 attribute 순서이다.

```sql
INSERT INTO EMPLOYEE(name, birth_date, sex, position, id) VALUES ('JENNY', '2000-10-12', 'F', 'DEV_BACK', 3);
```

- attribute를 지정해주면 순서를 바꿔서 넣는 것이 된다. 그리고 넣고 싶은 attribute만 넣을 수 있다. NOT NULL이 아닌이상.

### insert 방식
- 여러개의 row를 insert해야 될 때 2가지 방식이 권장된다.
#### **Multi‑row insert**
 ```sql
INSERT INTO my_table (col1, col2) VALUES 
    (v11, v12),
    (v21, v22),
    (v31, v32);
```
  - 하나의 INSERT 문 내에 여러 행의 값을 한꺼번에 명시
  - db 관점 : 단일 SQL 문으로 파싱, 컴파일, 실행되므로 구문 파싱과 실행 계획 생성 오버헤드가 한 번만 발생
  - 장점: 한 번의 SQL 파싱과 실행으로 여러 행을 추가하므로 오버헤드가 적다.
  - 단점: SQL 길이 제한 등으로 한 번에 넣을 수 있는 행 수에 제한이 있다.
  - 모든 행이 하나의 문장에서 함께 삽입되므로, 한 행이라도 오류가 발생하면 전체 문이 롤백될 수 있다.
  
#### **Prepared Statement Batch Execution (배치 바인딩)**
  - 동일한 INSERT 쿼리를 준비(prepared)한 후, 여러 번의 바인딩 값을 추가해 여러 개의 INSERT 문을 한 번에 실행
```java
PreparedStatement ps = connection.prepareStatement("INSERT INTO 테이블 (col1, col2) VALUES (?, ?)");
for (RowData row : rows) {
    ps.setX(1, row.getValue1());
    ps.setY(2, row.getValue2());
    ps.addBatch();
}
ps.executeBatch();
```
- db 관점 : 동일한 실행 계획을 재사용하면서 각 바인딩 세트를 개별적으로 실행합니다. 단, 여러 개의 개별 실행이 한 트랜잭션 내에서 처리되므로 네트워크 왕복 횟수는 줄어들지만, 내부적으로는 각 바인딩마다 실행 작업이 발생
- 장점: 쿼리 템플릿이 재사용되므로 네트워크 왕복 횟수를 줄이고, 실행 계획 재사용 덕분에 파싱 오버헤드는 줄어듦, 개별 행에 대해 좀 더 세밀한 오류 처리가 가능. 드라이버에 따라 내부 최적화가 이루어짐
- 단점: 기본적으로 각 바인딩마다 개별 INSERT 문이 실행되므로, DB가 단일 multi‑row insert처럼 하나의 문으로 처리하지는 않는다.

---------------------------

## select sql

```sql
SELECT * FROM EMPLOYEE;
```

- 테이블의 전체 attribute 출력


### join
#### inner join (교집합)
- 양쪽 테이블에서 조건에 맞는 행만 반환
- 즉, 두 테이블 모두에서 일치하는 데이터가 있어야 해당 행이 결과에 포함
- 두 테이블 모두에서 일치하는 행만 필요할 때 사용
- 양쪽 모두 일치하는 값만 읽어오므로 불필요한 NULL 채움 연산이 없고, 결과셋의 크기가 작아지는 경우가 많아 더 빠른 실행이 가능한 경우

#### left join (left outer join) 왼쪽 테이블 기준 합집합
- 왼쪽 테이블의 모든 행을 반환하고, 오른쪽 테이블에서 조건에 맞는 데이터가 있으면 해당 값을 함께 보여줌
- 만약 오른쪽 테이블에 일치하는 데이터가 없으면, 오른쪽 테이블의 값은 null로 채워짐.
- 불필요한 NULL 채움 처리가 추가되어 INNER JOIN에 비해 오버헤드가 생길 수 있다.
- 

#### 필터 조건의 위치와 조인 타입
- **WHERE 절에 오른쪽 테이블의 컬럼을 사용**하면, LEFT JOIN을 사용하더라도 조건에 맞지 않는 경우 NULL인 행이 걸러져 사실상 INNER JOIN처럼 동작
```sql
SELECT *
FROM A
LEFT JOIN B ON A.id = B.a_id
WHERE B.someColumn = 'value'
```
- 여기서 B.someColumn이 ‘value’가 아닌 경우나, B에 해당하는 행이 없어서 NULL인 경우 해당 행은 결과에서 제외됨.
- 오른쪽 테이블 조건은 가급적 ON 절에 넣어 LEFT JOIN의 특성을 유지해야함.

#### 주의사항
여러 테이블을 조인할 때, 한 번 LEFT JOIN을 사용하기 시작하면 나머지도 LEFT JOIN을 사용하여 일관된 결과를 얻는 것이 좋다.


## update sql

```sql
UPDATE EMPLOYEE
SET dep_id = 1003
WHERE id = 1;
```

```sql
UPDATE EMPLOYEE, WORKS_ON
SET salary = salary * 2
WHERE EMPLOYEE.id = WORKS_ON.empl_id and WORKS_ON.proj_id = 2003;
```

- 2개의 테이블을 섞어서 값을 수정 할때

## delete sql

```sql
DELETE FROM EMPLOYEE
WHERE id = 8;
```

- 삭제할때는 해당 tuple을 FK로 가진 테이블의 on delete 설정을 고려해야 한다.

```sql
DELETE FROM WORKS_ON
WHERE impl_id = 5 and proj_id != 2001;
```

- != 혹은 <>
  - 뒤의 값이 아닌 경우를 지정