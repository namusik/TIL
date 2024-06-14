# Spring Transaction 추상화

[java transactoin](../../Java/Java%20Database/Java%20Transaction.md)
- Connection으로 트랜잭션을 직접 조절하는 코드의 문제점은 서비스계층에 순수 비즈니스로직만 있는것이 아니라 JDBC 클래스에 의존하고 혼재되어있다는 점이다.
- JDBC의 트랜잭션 코드와 JPA의 트랜잭션 코드도 서로 다르기 때문에 DB 기술을 변경할 때마다 서비스계층의 코드도 수정되어야 하는 문제가 있다.
- 그래서 Spring에서는 

## PlatformTransactionManager

![tsManager](../../images/DB/transactionmanager.png)

- 스프링 트랜잭션 인터페이스 (트랜잭션 매니저)
- 각 DB 기술마다 서로 다른 트랜잭션 연결 코드를 추상화한 인터페이스.
- DB기술에 맞게 구현체가 있다.
  - ex) JpaTransactionManager, JdbcTransactionManager(spring 5.3)

### 사용법
- 사용할 때는, DataSource의 구현체를 주입받아야 한다. 

즉, repository는 DataSource 구현체와 PlatformTransactionManager 구현체가 필요하다.

~~~java
DriverManagerDataSource dataSource = new DriverManagerDataSource(URL, USERNAME, PASSWORD);
PlatformTransactionManager transactionManager = new DataSourceTransactionManager(dataSource);
~~~

## 관련 method

```java
AopUtils.isAopProxy(Object object)
```

Check whether the given object is a JDK dynamic proxy or a CGLIB proxy.
boolean 반환.

```java
//트랜잭션 시작
TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());

//커밋
transactionManager.commit(status);

//롤백
transactionManager.rollback(status);
```

transaction 시작, 커밋, 롤백

```java
TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());

status.isNewTransaction()
```

처음 수행되는 트랜잭션인지 확인

```java
TransactionSynchronizationManager.isActualTransactionActive();
```

현재 쓰레드에 트랜잭션이 적용되어 있는지 확인하는 메서드.

```java
TransactionSynchronizationManager.isCurrentTransactionReadOnly()
```

현재 트랜잭션이 readOnly인지 아닌지 boolean 반환.

### 자동등록
platformTransactionManager도 스프링이 자동등록을 해준다.

등록된 라이브러리를 보고 빈으로 등록하는데,
JDBC 라이브러리가 있으면, DataSourceTransactionManager.

JPA 라이브러리가 있으면, JpaTransactionManager. (jdbc기능도 가지고 있다.) 

## 기억해야될 점.

1. @Transactional을 구체적인 곳에 붙을 수록 우선순위를 가진다.

   1. 클래스 method
   2. 클래스
   3. 인터페이스 method
   4. 인터페이스

2. 클래스에 @Transactional이 붙으면 method에도 자동 적용된다.
3. 프록시 내부 호출
   1. @Transactional 이 안붙은 메서드를 호출하고 그 내부에서 @Transactional이 붙은 같은 클래스의 메서드를 호출하면, 프록시가 생성되지 않는다.
