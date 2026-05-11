# subquery

## select with subquery

ID가 14인 임직원보다 생일이 빠른 임직원의 attribute

```sql
SELECT id, name, birth_date FROM employee
WHERE birth_date < (
    SELECT birth_date FROM employee WHERE id = 14 //subquery
);
```

- subquery
  - nested query / inner query
  - select, insert, update, delete 문에 포함된 query
  - () 안에 써야한다.
- outer query
  - main query
  - subquery를 포함하는 query

---

```sql
SELECT id, name, position FROM employee
WHERE (dept_id, sex) = (
    SELECT dept_id, sex FROM employee WHERE id = 1
);
```

- subquery는 하나 이상의 attribute를 리턴할 수 있다.
- where () 를 통해 여러개를 비교할 수 있다.

---

```sql
SELECT DISTINCT empl_id FROM works_on
WHERE empl_id != 5 AND proj_id  IN (
    SELCT proj_id FROM work_on WHERE empl_id = 5
);
```

- IN (a,b,c)
  - 안에 값 중 하나와 같다면 true 리턴
- NOT IN(a,b,c)

  - 안에 있는 모든 값과 다르면 true 리턴

- 테이블이 지정되지 않은 attribute는 속해있는 쿼리에서 가장 가까이 있는 table을 참조한다.
  - subquery 안에 있는 attribute들은 subquery 안에 있는 table을 참조.

---

```sql
SELECT id, name FROM employee
WHERE id IN (
    SELECT DISTINCT empl_id FROM works_on
    WHERE empl_id != 5 AND proj_id  IN (
        SELCT proj_id FROM work_on WHERE empl_id = 5
    )
);
```

```sql
SELECT id, name
FROM employee, (
    SELECT DISTINCT empl_id FROM works_on
    WHERE empl_id != 5 AND proj_id  IN (
        SELCT proj_id FROM work_on WHERE empl_id = 5
    )
  ) AS DSTNCT_E
WHERE id = DSTNCT_E.empl_id;
```

- 이중 서브 쿼리
  - 서브쿼리가 FROM 절 안에도 들어갈 수 있다.
    - 가상의 테이블로 만들어 버림

---

```sql
SELECT P.id, P.name FROM project.P
WHERE EXISTS (
  SELECT * FROM works_on W
  WHERE W.proj_id = P.id AND W.empl_id IN (7,12)
);
```

- ID가 7 혹은 12인 임직원이 참여한 프로젝트의 ID와 이름 구하기
