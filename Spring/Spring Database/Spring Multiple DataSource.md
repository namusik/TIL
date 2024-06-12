# Multiple DataSource

## 개념
- 일반적으로는 단일 관계형 데이터베이스에 데이터를 저장한다. 하지만 여러 데이터베이스에 액세스해야 할 때도 있다.

## DataSourceProperties
```java
spring:
  datasource:
    url: ...
    username: ...
    password: ...
    driverClassname: ...
```

```java
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties implements BeanClassLoaderAware, InitializingBean {
  ......
	/**
	 * Fully qualified name of the JDBC driver. Auto-detected based on the URL by default.
	 */
	private String driverClassName;

	/**
	 * JDBC URL of the database.
	 */
	private String url;

	/**
	 * Login username of the database.
	 */
	private String username;

	/**
	 * Login password of the database.
	 */
	private String password;
```
- db 연결을 위해 적어준 설정들은 `@ConfigurationProperties(prefix = "spring.datasource")`로 인해서 `DataSourceProperties` 인스턴스의 필드로 바인딩된다.

## Multiple DataSource
- 여러 데이터 소스를 사용하려면 Spring 컨텍스트 내부에 서로 다른 매핑을 가진 Bean을 만들어줘야 한다.


## 출처
- https://www.baeldung.com/spring-boot-configure-multiple-datasources
