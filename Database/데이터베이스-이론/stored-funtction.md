# stored function

## 정의

- 사용자가 정의한 함수
- DBMS에 저장되고 사용되는 함수
- SQL의 select, insert, update, delete statement에서 사용할 수 있다.

## 사용법

임직원의 ID를 맨앞자리가 1인 10자리 정수를 랜덤하게 만들기

```sql
delimiter $$
CREATE FUNCTION id_generator()
RETURNS int
NO SQL
BEGIN
  RETURN (1000000000 + floor(rand()*1000000000));
END
$$
delimiter ;
```

- **delimiter**
  - 기본적으로 SQL의 delimiter는 ;임.
  - 그런데 function을 정의할 때 내부에서 ; 사용하게 됨.
  - 그런데 기본설정에서 ;을 만나게 되면 쿼리가 끝나버림
  - delimiter를 다른 거로 바꿔줘야 한다.
  - 자기가 원하는 것으로 바꿔줘면 된다.
  - END 끝에 바꿔준 delimiter를 입력하고
  - 마지막에 delimiter 를 ;로 다시 복구시켜준다.
- CREATE FUNCTION db.함수이름(파라미터)
  - RETURNS 반환타입
  - NO SQL : MYSQL에서 사용되는 부분
  - BEGIN RETURN 동작내용 END
    - 바디 부분 정의

```sql
INSERT INTO employee
VALUES(id_generator(), .....)
```

- 사용할 때는 값 대신에 함수를 호출한다.

---

부서의 ID를 파라미터로 받으면 해당 부서의 평균 연봉을 구하는 함수

```sql
CREATE FUNCTION dept_avg_salary(d_id int)
RETURNS int
READS SQL DATA
BEGIN
  DECLARE avg_sal int;
    select avg(salary) into avg_sal
    from employee
    where dept_id = d_id;
  RETURN avg_sal;
END
```

```sql
    select avg(salary) into @avg_sal
    from employee
    where dept_id = d_id;
  RETURN @avg_sal;
```

- CREATE FUNCTION 함수이름(파라미터 타입)
  - 받은 인자는 함수를 정의할 때 사용가능하다.
- **DECLARE** 변수명 변수타입;
  - 변수 선언.
  - DECLARE를 생략할 때는 새로 만든 변수에 **@** 를 붙여주면 된다.
- select x **into** a
  - 출력한 결과를 위에 생성한 변수에 저장해줄 때 사용.

```sql
SELECT *, dept_avg_salary(id)
FROM department;
```

- 모든 tuple을 select 하면서 동시에, 함수를 호출한 결과를 attribute로 추가해서 가져옴.

---

졸업 요건 중 하나인 토익 800 이상을 충족했는지 확인하는 함수

```sql
CREATE FUNCTION toeic_pass_fail(toeic_score int)
RETURNS chat(4)
NO SQL
BEGIN
  DECLARE pass_fail char(4)
    IF toeic_score is null THEN SET pass_fail = 'fail';
    ELSEIF toeic_score < 800 THEN SET pass_fail = 'fail';
    ELSE SET pass_fail = 'pass';
    END IF;
  RETURN pass_fail;
END
```

- IF ELSEIF ELSE
  - if 문 작성
- END IF;
  - IF문 종료

```sql
SELECT *, toeic_pass_fail(toeic)
FROM student;
```

---

```sql
DROP FUNCTION stored_function_name;
```

- stored funtion 삭제

---

```sql
SHOW FUNCTION STATUS where DB = 'company';
```

- 해당 DB에서 stored_function 찾기
  - 참고로 생성할 때, DB이름을 명시하지 않으면 현재 활성화되어 있는 DB에 만들어진다.

---

```sql
SHOW CREATE FUNCTION function_name;
```

- 특정 stored_function 내용 보기
  - DEFINET = 'aaaa'
    - 정의한 사람 정보도 같이 보여줌.

## 사용처

- loop를 돌면서 반복적인 작업 수행
- case 키워드를 사용해서 분기 처리
- 에러 핸들링 혹은 에러 throw

- util 함수로 사용해보자
- 비즈니스 로직을 stored functoin에 두는 것은 좋지 않다.
  - 비즈니스 로직은 3 tier application에서 Logic tier에서 담당하는 것이 좋다.

## 출처

https://www.youtube.com/watch?v=I1jjR58Rzic&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=10
