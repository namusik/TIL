# database transcation

## 개념

- 단일한 논리적인 작업 단위
- 논리적인 이유로 어러 SQL문들을 단일 작업으로 묶어서 나눠질 수 없게 만든 것이 transaction
- transaction의 SQL문들 중에서 일부만 성공해서 DB에 반영되는 일은 일어나지 않는다.
  - 모두 성공해야 DB 반영

## 예제

```sql
START TRANSACTION;

UPDATE account SET balance = balance - 20000 WHERE id = 'J';

UPDATE account SET balance = balance + 20000 WHERE id = 'H';

COMMIT;
```

- **COMMIT**
  - 지금까지 작업한 내용을 DB에 영구적(permanently)으로 저장.
  - **transaction을 종료한다.**
- **ROLLBACK**
  - 지금까지 작업을 모두 취소하고 transaction 이전 상태로 되돌린다.
  - **transaction을 종료한다.**

```sql
SELECT @@AUTOCOMMIT;
SET autocommit=0; //autocommit 비활성화
```

- 현재 선택된 DB에서 AUTOCOMMIT이 활성화되어있는지 확인

  - 1이면 활성.

- AUTOCOMMIT

  - 각각의 SQL문을 자동으로 transaction 처리해주는 개념
  - SQL문이 성공적으로 실행하면 자동으로 commit.
  - 실행중에 문제가 있으면 자동으로 rollback.
  - MYSQL에서는 default로 autocommit이 활성화되어 있음.

- START TRANSACTION
  - 동시에 AUTOCOMMIT 비활성화
  - 트랜잭션이 종료되면 다시 기본설정으로.

---

## 일반적인 transaction 사용 패턴

1. transaction 시작(begin)
2. SQL문들 수행
3. 문제 없으면 commit
4. 문제 있으면 rollback

## Java에서의 예제

```java
try{
Connection conn = ....; //DB서버와의 connection을 가져옴
conn.setAutoCommit(false); //autocommit 비활성화
.... //로직 수행
conn.commit(); //commit
} catch (Exception e){
  ...
  conn.rollback(); //예외 발생하면 rollback
} finally {
  conn.setAutoCommit(true); //최종적으로 autocommit 원상복귀
}
```

- 이런 트랜잭션 관련 코드는 스프링에서 **@Transactional**로 뺄 수 있다.

## ACID

트랜잭션이 지녀야할 속성

- **Atomicity(원자성)**
  - 모두 성공하거나, 모두 실패하거나
  - all or nothing
  - 개발자는 언제 commit할지, 어떤 문제가 생겼을 때 rollback할지 정해야 한다.
- **Consistency(일관성)**
  - transaction은 DB 상태를 consistent 상태에서 또 다른 consistent 상태로 바꿔줘야 한다.
  - constraints, trigger를 통해 DB에 정의된 규칙을 transaction이 위반했다면 rollback
    - ex) 잔액은 음수가 될 수 없다.
  - transaction이 DB에 정의된 규칙을 위반했는지 commit하기 전에 알려주는 역할.
  - application 관점에서 consistent하게 동작하는지는 개발자가 챙겨야 한다.
- **Isolation(격리)**
  - 여러 transaction들이 동시에 실행될 때도, 혼자 실행되는 것처럼 동작하게 만든다.
  - DBMS는 여러 종류의 **isolation level**을 제공한다.
  - 개발자는 어떤 level로 transaction을 동작시킬지 설정해야 한다.
    - 너무 엄격하면 DB의 퍼포먼스가 줄어든다.
  - **concurrency control**의 주된 목표가 isolation
- **Durability(영존성)**
  - commit된 transaction은 DB에 영구적으로 저장된다.
  - DB system에 문제가 생겨도 (power fail/ DB crash) commit된 transaction은 DB에 남아있다.
  - 영구적으로 저장된다는 뜻은 비휘발성 메모리 (HDD, SDD)에 저장된다는 뜻
  - 기본적으로 DBMS에서 보장.

## Deadlock (데드락)

### 정의

- 교착상태
- 두 개 이상의 트랜잭션이 서로가 점유하고 있는 리소스(테이블, 행 등)에 대한 잠금(Lock)을 획득하기 위해 무한정 대기하는 상태
- 각 트랜잭션은 자신이 필요한 리소스를 상대방이 놓아주기만을 기다리지만, 상대방 또한 같은 상황에 처해있어 영원히 풀리지 않는 악순환

### 원인

- 업데이트 순서의 불일치
  - 가장 흔한 원인 중 하나
  - 두 개의 트랜잭션이 서로 다른 순서로 동일한 데이터를 업데이트하려고 할 때 발생한다.
    - 트랜잭션 1: A 테이블을 업데이트 한 후 B 테이블을 업데이트하려고 시도
    - 트랜잭션 2: B 테이블을 업데이트 한 후 A 테이블을 업데이트하려고 시도합니다.
    - 이 경우 트랜잭션 1은 A의 잠금을 획득하고 B를 기다리고, 트랜잭션 2는 B의 잠금을 획득하고 A를 기다리면서 교착 상태에 빠집니다.
- 인덱스 부재 또는 비효율적인 인덱스
  - 테이블에 적절한 인덱스가 없으면 MySQL은 특정 행을 잠그는 대신 테이블 전체에 잠금
- 긴 트랜잭션
  - 트랜잭션이 너무 오랫동안 실행되면서 잠금을 오래 보유하고 있으면 다른 트랜잭션과 충돌할 가능성이 커짐

### 해결방법

- 


## 출처

https://easy-code-yo.tistory.com/26

https://www.youtube.com/watch?v=sLJ8ypeHGlM&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=14
