# Multiple DataSource

## 개념
- 일반적으로는 단일 관계형 데이터베이스에 데이터를 저장한다. 하지만 여러 데이터베이스에 액세스해야 할 때도 있다.

![multi](../../images/Spring/multidatasource.png)

- Data Source가 하나일 경우에는 자동으로 생성된다.
- 그러나 여러개의 db에 connection을 맺어야 하는 경우에는 직접 Data Source를 생성해줘야 한다.
  - HikariCP가 최신 스프링부트에서의 표준 DataSource 구현체

## 사용법

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

- DataSourceProperties
  - 데이터소스의 프로퍼티를 담고 있는 클래스
  - db 연결을 위해 적어준 설정들은 `@ConfigurationProperties(prefix = "spring.datasource")`로 인해서 `DataSourceProperties` 인스턴스의 필드로 바인딩된다.
- 생성한 topicsDataSourceProperties를 가지고 DataSource를 생성해서 Bean을 등록 
- 이때 하나의 datasource에는 @Primary를 붙여줘야 한다.
  - EntityManagerFactoryBuilder가 여러 데이터소스를 받을 때 문제를 방지하기 위해서.

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
- **@EnableTransactionManagement**
  - 애플리케이션 컨텍스트에서 트랜잭션 관리 기능을 활성화
  - Spring이 @Transactional 애노테이션을 인식하고, 해당 애노테이션이 적용된 메서드에 대해 트랜잭션 경계를 자동으로 설정할 수 있도록 함.
  - 다중 데이터 소스를 설정할 때 각 데이터 소스에 대해 별도의 트랜잭션 관리자가 필요합니다. 
  - @EnableTransactionManagement는 이러한 트랜잭션 관리자를 활성화하고 구성하는 데 필요한 설정을 포함하고 있다. 이로 인해 트랜잭션이 각각의 데이터 소스에 대해 올바르게 작동하도록 보장
  - 비즈니스 로직에서 @Transactional을 사용하는 메서드가 다중 데이터 소스를 사용할 때, 각 데이터 소스에 대한 트랜잭션 매니저가 올바르게 설정되고 작동하기 위해서는 구성 파일에서 트랜잭션 관리가 활성화되어야 한다.
- **@EnableJpaRepositories**
  - JPA 리포지토리 스캐닝 및 설정을 지정
  - **basePackageClasses** :  JPA 리포지토리를 스캔할 기본 패키지를 Topic 클래스가 속한 패키지로 지정
  - **entityManagerFactoryRef** : 이 설정이 사용할 엔티티 매니저 팩토리를 지정
  - **transactionManagerRef** : 이 설정이 사용할 트랜잭션 매니저를 지정
- **LocalContainerEntityManagerFactoryBean**
  - JPA 엔티티 매니저 팩토리 생성
- **PlatformTransactionManager**
  - 트랜잭션 매니저 생성

## 주의사항
- 데이터소스를 분리할 Entity 및 repository, configuration 클래스들은 패키지를 서로 분리해줘야 한다.
  - basePackageClasses에서 패키지 기준으로 repository를 찾기 떄문에

## 출처
- https://www.baeldung.com/spring-boot-configure-multiple-datasources
