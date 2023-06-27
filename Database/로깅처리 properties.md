# 스프링부트에서 사용되는 DB기술들 로그처리

스프링부트에서 JDBC, Mybatis, JPA 등등을 사용할 때, 로그를 남기기 위해서는 application.properties에 추가해줘야하는 것들이 있다. 

그때 그때 찾아쓰기 위해 정리해놓기.

### JdbcTemplate SQL 로그
~~~properties
logging.level.org.springframework.jdbc=debug
~~~
main, test 모두에 추가해줘야 함.

### MyBatis SQL 로그
~~~properties
logging.level.hello.itemservice.repository.mybatis=trace
~~~

### JPA SQL 로그
~~~properties
logging.level.org.hibernate.SQL=debug
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=trace
~~~


### 트랜잭션 로그
~~~properties
logging.level.org.springframework.transaction.interceptor=trace
~~~
트랜잭션의 시작과 종료를 알 수있는 로그. 

## 트랜잭션 전파
트랜잭션 전파 
s3 presigned Url을 통해 유저들의 이미지를 받는다.

