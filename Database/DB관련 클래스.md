## DriverManager

~~~java
Connection connection = DriverManager.getConnection(URL, USERNAME, PASSWORD);
~~~

![drivermanager](../images/DB/drivermanager.png)

1. Drivermanager.getConnection()을 호출.
2. DriverManager가 스프링 라이브러리에 등록된 드라이버 목록을 쭉 훑으면서 커넥션을 획득할 수 있는지 확인.
3. 여기서 Driver는 JDBC 표준 인터페이스 구현체들이다. 
4. 찾은 Driver를 반환.

H2 : org.h2.jdbc.JdbcConnection
