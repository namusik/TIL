# DB Replication DataSource

<!-- TOC -->

- [DB Replication DataSource](#db-replication-datasource)
  - [개념](#개념)
  - [AbstractRoutingDataSource](#abstractroutingdatasource)
    - [주요 메서드](#주요-메서드)
    - [Bean 초기화 과정 흐름](#bean-초기화-과정-흐름)
    - [Connection 호출 흐름](#connection-호출-흐름)
  - [LazyConnectionDataSourceProxy](#lazyconnectiondatasourceproxy)
    - [사용이유](#사용이유)
    - [동작흐름](#동작흐름)
  - [예제 코드](#예제-코드)
    - [application.yml](#applicationyml)
    - [AbstractRoutingDataSource](#abstractroutingdatasource-1)
    - [DataSourceConfig](#datasourceconfig)
  - [출처](#출처)

<!-- /TOC -->


## 개념
- DB Replication을 통해 DB를 read/write로 구분하는 것이 일반적. [DB Replication](../../Database/데이터베이스%20이론/database%20replication.md)
- @Transactional(readOnly = true)를 사용해서 데이터 소스 라우팅 설정이 필요.
- 이번 예제에서는 실제로 DB가 replication이 되어있지는 않고, Read/Write 작업이 서로 다른 DB로 요청이 가는지만 확인하려 한다.

## AbstractRoutingDataSource

-  JDBC의 DataSource 인터페이스를 구현한 스프링의 추상 클래스
-  라우팅 로직을 처리하여 적절한 데이터소스를 선택하는 기능을 가지고 있음.
  
### 주요 메서드
- **determineCurrentLookupKey()**
  - 현재 트랜잭션 상태 또는 기타 컨텍스트 정보를 기반으로 데이터소스를 식별하기 위한 Key를 반환
- **determineTargetDataSource()**
  - determineCurrentLookupKey()가 반환한 키를 사용하여 실제 데이터소스를 결정합니다.
- **resolveSpecifiedLookupKey(Object lookupKey)**
  - 키를 실제 데이터소스로 변환합니다.
- **resolveSpecifiedDataSource(Object dataSource)**
  - 데이터를 실제 DataSource 객체로 변환합니다.

### Bean 초기화 과정 흐름
1. 스프링 컨테이너가 Bean 초기화 과정에서 afterPropertiesSet() 호출
```java
@Override
public void afterPropertiesSet() {
  initialize();
}
```
2. 내부에서 initialize() 호출 

```java
public void initialize() {
  ....
  this.targetDataSources.forEach((key, value) -> {
    Object lookupKey = resolveSpecifiedLookupKey(key);
    DataSource dataSource = resolveSpecifiedDataSource(value);
    this.resolvedDataSources.put(lookupKey, dataSource);
  });
  ....
}
```
3. 내부에서 resolveSpecifiedLookupKey()과 resolveSpecifiedDataSource()를 사용해서 `resolvedDataSources` 필드를 세팅한다.


### Connection 호출 흐름
1. Client가 getConnection()을 호출
2. AbstractRoutingDataSource.getConnection()가 호출됨
```java
@Override
public Connection getConnection() throws SQLException {
  return determineTargetDataSource().getConnection();
}
```
1. 내부에서 determineTargetDataSource().getConnection(); 를 호출

```java
	protected DataSource determineTargetDataSource() {
		Assert.notNull(this.resolvedDataSources, "DataSource router not initialized");
		Object lookupKey = determineCurrentLookupKey();
		DataSource dataSource = this.resolvedDataSources.get(lookupKey);
		if (dataSource == null && (this.lenientFallback || lookupKey == null)) {
			dataSource = this.resolvedDefaultDataSource;
		}
		if (dataSource == null) {
			throw new IllegalStateException("Cannot determine target DataSource for lookup key [" + lookupKey + "]");
		}
		return dataSource;
	}
```

4. determineTargetDataSource() 내부에서 determineCurrentLookupKey() 호출하여 데이터 소스 key 반환받음.
5. Bean 초기화 과정에서 세팅된 `resolvedDataSources` 필드에서 key를 가지고 dataSource를 찾아서 반환
6. 반환한 dataSource.getConnection()이 실행

## LazyConnectionDataSourceProxy
- dataSource 인터페이스를 구현한 클래스
- 실제로 데이터베이스 연결이 필요한 시점까지 연결 생성을 지연시킨다. 이를 통해 애플리케이션 초기화 시 불필요한 데이터베이스 연결을 피할 수 있는 장점
- 덕분에 리소스와 성능을 최적화 할 수 있다.
- 그리고 트랜잭션이 시작될 때 연결을 생성하고, 트랜잭션이 종료될 때 연결을 해제하게 된다.

### 사용이유
-  기본적으로 @Transactional이 붙은 메서드가 호출되면, Spring은 해당 메서드가 실행되지 전에 트랜잭션을 시작한다. 그리고 이때, dataSource가 결정됨
-  **LazyConnectionDataSourceProxy**를 사용하면 실제 데이터베이스 연결이 필요할 때까지 연결 생성을 지연되고 readOnly 속성이 반영된 상태에서 DataSource를 선택한다.
-  

### 동작흐름
```java
@Override
public Connection getConnection() throws SQLException {
  return obtainTargetDataSource().getConnection();
}
```
1. 데이터베이스 연결이 필요할 때 getConnection() 호출

```java
protected DataSource obtainTargetDataSource() {
  DataSource dataSource = getTargetDataSource();
  Assert.state(dataSource != null, "No 'targetDataSource' set");
  return dataSource;
}
```
2. 내부에서 obtainTargetDataSource() 호출해서 targetDataSource 필드 가져옴

## 예제 코드

### application.yml

```yml
spring:
  datasource:
    write:
      url: jdbc:mysql://localhost:3310/local
      username: root
      password:
      driver-class-name: com.mysql.cj.jdbc.Driver
    read:
      url: jdbc:mysql://localhost:3307/megabird
      username: root
      password:
      driver-class-name: com.mysql.cj.jdbc.Driver
```
- Read/Write DB의 접속 정보를 구분하여 설정한다.

### AbstractRoutingDataSource
```java
public class DynamicRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        // 현재 트랜잭션인 readOnly 인지 확인
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly() ? "read" : "write";
    }
}
```
- **AbstractRoutingDataSource**를 확장한 클래스
  - **determineCurrentLookupKey()** 
    - 현재의 트랜잭션이 ReadOnly인지 확인 후, 특정 String을 반환하도록 구현하였다. 
    - 아래의 설정에서 해당 String을 dataSource map의 Key로 쓸 예정

### DataSourceConfig
```java
  @Bean
  @ConfigurationProperties("spring.datasource.write")
  public DataSourceProperties writeDataSourceProperties() {
      return new DataSourceProperties();
  }

  @Bean
  public DataSource writeDataSource() {
      // 쓰기전용 dataSource
      return writeDataSourceProperties().initializeDataSourceBuilder().build();
  }

  @Bean
  @ConfigurationProperties("spring.datasource.read")
  public DataSourceProperties readDataSourceProperties() {
      return new DataSourceProperties();
  }

  @Bean
  public DataSource readDataSource() {
      // 읽기 전용 dataSource
      return readDataSourceProperties().initializeDataSourceBuilder().build();
  }
```
- 외부 설정에 등록한 DB connection 정보를 가져와서 쓰기, 읽기 전용 DataSource를 2개 Bean으로 등록해준다.

```java
  @Bean
  public DataSource dynamicRoutingDataSource(@Qualifier("writeDataSource") DataSource writeDataSource, @Qualifier("readDataSource") DataSource readDataSource) {

      HashMap<Object, Object> dataSourceMap = new HashMap<>();
      dataSourceMap.put("write", writeDataSource);
      dataSourceMap.put("read", readDataSource);

      DynamicRoutingDataSource dynamicRoutingDataSource = new DynamicRoutingDataSource();
      dynamicRoutingDataSource.setTargetDataSources(dataSourceMap);
      dynamicRoutingDataSource.setDefaultTargetDataSource(writeDataSource);

      return dynamicRoutingDataSource;
  }
```
- 구현한 DynamicRoutingDataSource 클래스를 Bean으로 등록해주는 코드
- **setTargetDataSources(Map<Object, Object> targetDataSources)**
  - 위에서 Bean으로 등록한 Read/Write DataSource를 담은 map을 인자로 한다.
  - AbstractRoutingDataSourcer가 사용할 DataSource들을 설정해 줄 수 있다.
  - 이때 map의 Key 값은 DynamicRoutingDataSource의 determineCurrentLookupKey 리턴 값과 동일하게 들어가야 찾을 수 있다.
- **setDefaultTargetDataSource(Object defaultTargetDataSource)**
  - 기본 데이터소스를 설정
  - determineCurrentLookupKey()가 null을 반환하거나 매핑된 키를 찾지 못한 경우 사용되기때문에 Primary DB인 writeDataSource를 넣어주었다.

```java
@Primary
@Bean
public DataSource dataSource(@Qualifier("dynamicRoutingDataSource") DataSource routingDataSource) {
    return new LazyConnectionDataSourceProxy(routingDataSource);
}
```
- 마지막으로 데이터베이스 연결 지연을 위해 LazyConnectionDataSourceProxy를 dataSource Bean으로 등록해준다.
- 이때 위에서 생성한 dynamicRoutingDataSource Bean을 인자로 생성.



## 출처
https://github.com/eugenp/tutorials/tree/master/persistence-modules/read-only-transactions/src

https://www.baeldung.com/spring-transactions-read-only