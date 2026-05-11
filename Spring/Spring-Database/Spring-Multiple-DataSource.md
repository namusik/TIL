# Multiple DataSource

<!-- TOC -->

- [Multiple DataSource](#multiple-datasource)
  - [PlatformTransactionManager](#platformtransactionmanager)
  - [예제 코드](#예제-코드)
    - [application.yml](#applicationyml)
    - [DataSourceConfig](#datasourceconfig)
    - [JpaConfiguration](#jpaconfiguration)
  - [주의사항](#주의사항)
  - [출처](#출처)

<!-- /TOC -->

[DataSource 개념](../../Java/Java%20Database/JDBC/JDBC%20Class.md/)

## PlatformTransactionManager

[PlatformTransactionManager 개념](Spring%20Transaction.md)

## 예제 코드

### application.yml

```yml
spring:
  datasource:
    todos:
      url: 
      username: 
      password:
      driver-class-name: 
    topics:
      url: 
      username: 
      password:
      driver-class-name: 
```
- datasource 속성을 n개로 분리시켜서 작성

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### DataSourceConfig

```java
@Configuration
public class TopicDataSourceConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.topics")
    public DataSourceProperties topicsDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource topicsDataSource() {
        return topicsDataSourceProperties()
                .initializeDataSourceBuilder().build();
    }
}
```
- 여러개의 DB에 connection을 맺기 위해서는 DataSource를 직접 Bean으로 등록해야 한다.
- DataSourceProperties
  - 데이터소스의 프로퍼티를 담고 있는 클래스
  - db 연결을 위해 적어준 설정들은 `@ConfigurationProperties(prefix = "spring.datasource")`로 인해서 `DataSourceProperties` 인스턴스의 필드로 바인딩된다.
- 생성한 topicsDataSourceProperties를 가지고 DataSource를 생성해서 Bean을 등록 
- 이때 DataSource 타입의 Bean이 여러개 등록되었으므로 하나에는 **@Primary**를 붙여줘야 한다.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### JpaConfiguration

```java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackageClasses = Topic.class,
        entityManagerFactoryRef = "topicsEntityManagerFactory",
        transactionManagerRef = "topicsTransactionManager"
)
public class TopicJpaConfiguration {

    @Bean
    public LocalContainerEntityManagerFactoryBean topicsEntityManagerFactory(
            @Qualifier("topicsDataSource") DataSource dataSource,
            EntityManagerFactoryBuilder builder
    ) {
        return builder
                .dataSource(dataSource)
                .packages(Topic.class)
                .build();
    }

    @Bean
    public PlatformTransactionManager topicsTransactionManager(
            @Qualifier("topicsEntityManagerFactory") LocalContainerEntityManagerFactoryBean topicsEntityManagerFactory) {
        return new JpaTransactionManager(Objects.requireNonNull(topicsEntityManagerFactory.getObject()));
    }
}
```
- 각 DataSource에 대해 별도의 트랜잭션 매니저가 필요하기 때문에 별도로 Bean으로 등록해주는 작업이 필요하다.
- **@EnableTransactionManagement**
  - 애플리케이션 컨텍스트에서 트랜잭션 관리 기능을 활성화
    - 트랜잭션 관리자가 활성화되고, 트랜잭션 경계를 지정하는 @Transactional 애노테이션이 올바르게 동작하도록 설정
  - 이 애노테이션을 명시적으로 사용한 이유는
    - 다중 데이터 소스를 설정할 때 각 데이터 소스에 대해 별도의 트랜잭션 관리자가 필요하다.
    - @EnableTransactionManagement를 사용해서 직접 설정한 트랜잭션 관리자가 올바르게 동작하도록 보장하기 위해서다.
- **@EnableJpaRepositories**
  - JPA 리포지토리 스캐닝 및 설정을 지정
  - **basePackageClasses** :  JPA 리포지토리를 스캔할 기본 패키지를 Topic 클래스가 속한 패키지로 지정
  - **entityManagerFactoryRef** : 리포지토리가 사용할 엔티티 매니저 팩토리를 지정
  - **transactionManagerRef** : 리포지토리가 사용할 트랜잭션 매니저를 지정
- **LocalContainerEntityManagerFactoryBean**
  - `EntityManagerFactory`를 위한 스프링 빈을 생성하기 위해 다양한 설정 옵션을 제공하는 클래스
  - JPA 엔티티 매니저 팩토리 생성 후 Bean 등록
  - dataSource : 생성을 위해 필요한 datasource. TopicDataSourceConfig에서 생성한 topicsDataSource를 넣어준다.
  - packages :  Todo.class가 속한 패키지의 모든 @Entity가 붙은 클래스를 스캔해서 등록.
- **PlatformTransactionManager**
  - 트랜잭션 매니저 Bean 등록

## 주의사항
- 데이터소스를 분리할 Entity 및 repository, configuration 클래스들은 패키지를 서로 분리해줘야 한다.
  - basePackageClasses에서 패키지 기준으로 repository를 찾기 떄문에

## 출처
- https://www.baeldung.com/spring-boot-configure-multiple-datasources
