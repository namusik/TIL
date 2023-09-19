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

## select sql

```sql
SELECT * FROM EMPLOYEE;
```

- 테이블의 전체 attribute 출력

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
