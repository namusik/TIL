# Java Transaction

## transaction 개념
[transaction 개념](../../Database/Transaction.md)

## 트랜잭션은 어디서 시작해야 하나

- 비즈니스 로직이 있는 서비스 계층에서 시작해야 한다.
  - 잘못된 비즈니스 로직을 함께 롤백해야 하기 때문.
- 트랜잭션을 사용하려면 같은 커넥션을 유지해야 한다.
  - 결국, 서비스 계층에서 커넥션을 만들어야 하고 종료까지 해야 한다. 

## Java 트랜잭션을 유지 하는 방법

### Connection을 직접 조절하기
```java
   Connection con = dataSource.getConnection();
   try {
      con.setAutoCommit(false);   ///트랜잭션 시작
      //비즈니스 로직 수행
      bizLogic(con, fromId, toId, money);
      con.commit();   //성공시 커밋
   } catch (Exception e) {
      con.rollback(); //실패시 롤백
      throw new IllegalStateException(e);

   if (con != null) {
      try {
            con.setAutoCommit(true);  //커넥션 풀에 반납할 때는, 기본값으로 돌려주고 보낸다.
            con.close();
      } catch (Exception e) {
            log.error("error", e);
      }
   }      
```
- 비즈니스로직 시작 전에, con.setAutoCommit(false) 로 트랜잭션을 시작해준다.
- 비즈니스 로직에 connection을 파라미터로 전달해서 모두 같은 connection에서 preparedStatement만들어 쿼리를 수행하도록 한다.
- 성공시 con.commit(), 예외 발생시 con.rollback()으로 트랜잭션을 종료한다.
- 모든 비즈니스 로직이 종료 후, connection을 Pool에 반납할 때 con.setAutoCommit(true)을 통해 원상복구시키고 close()로 반납한다.