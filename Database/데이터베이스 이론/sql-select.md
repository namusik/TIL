# select query

```sql
SELECT name, position
FROM EMPLOYEE
WHERE id = 9;
```

- **projection attributes**
  - SELECT로 가져오고 싶은 attributes
- **selection condition**
  - WHERE로 SELECT 조건을 명시해 주는 것
- 교차되는 값들만 가져오게 됨.

```sql
SELECT EMPLOYEE.id, EMPLOYEE.name, position
FROM PROJECT, EMPLOYEE
WHERE PROJECT.id = 2002
AND PROJECT.leader_id = EMPLOYEE.id
```

- 2개의 테이블을 엮어서 select 할 때
  - selection conditon
    - PROJECT 테이블에서 먼저 id가 2002인 tuple들을 뽑음
  - join condition
    - 2개의 테이블을 join시키는 조건
- 동일한 이름의 attribute가 서로 다른 테이블에 있으면 테이블 명을 명시해준다.

### AS

- table 이나 attribute에 별칭을 붙일 때 사용
  - table에 사용하면, 쿼리 내에서 사용 가능하도록
  - attribute에 쓰면, 출력결과의 attribute이름이 바뀜
- 생략 가능

```sql
SELECT E.id AS leader_id, E.name AS leader_name, position
FROM PROJECT AS P, EMPLOYEE AS E
WHERE P.id = 2002
AND P.leader_id = E.id
```

### DISTINCT

- SELECT 결과에서 중복된 tuple 제거

```sql
SELECT DISTINCT P.id, P.name
FROM employee E, works_on W, project P
WHERE E.position = 'DGSN'
AND E.id = W.empl_id
AND W.proj_id = P.id;
```

### LIKE

- 문자열 패턴 매칭에 사용

```sql
SELECT name
FROM employee
WHERE name LIKE 'N%' or name LIKE '%N';
name LIKE '%NG%'
name LIKE 'J___'
name LIKE '\%%'
```

- %

  - 0개 이상의 임의의 문자
  - 'N%'
    - N으로 시작
  - '%N'
    - N으로 끝
  - '%NG%'

    - NG가 들어가는 문자

  - \_
    - 하나의 문자
    - 'J\_\_\_'
      - J로 시작하는 4글자

- \ escape 문자
  - 예약문자를 escape를 시켜서
  - %나 \_를 문자 그대로로 사용하고 싶을 떄 앞에 붙여준다.

### \*(asterisk)

- 선택된 tuple의 모든 attribute를 보여줄 때 사용

### 주의 사항

1. 조건들을 포함해서 SELECT를 할 때, 이 조건들과 관련된 attribute 에 반드시 index가 걸려있어야 한다.
   1. 없으면 조회속도가 느려짐
2. MySQL 기준
